const axios = require('axios');
const MandiPrice = require('../models/MandiPrice');
const Crop = require('../models/Crop');
const { createNotification } = require('../utils/createNotification');
const auditEmitter = require('../utils/auditEmitter');

/**
 * Helper to parse arrival date (handles DD/MM/YYYY, YYYY-MM-DD, ISO)
 */
const parseArrivalDate = (dateStr) => {
  if (!dateStr) return new Date();
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
    }
  }
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
};

/**
 * Fetch 100% Live Agmarknet APMC Mandi Prices from data.gov.in
 */
const fetchAgmarknetPrices = async () => {
  try {
    const apiKey = (process.env.AGMARKNET_API_KEY || '').trim();
    const resourceId = process.env.AGMARKNET_RESOURCE_ID || '9ef84268-d588-465a-a308-a864a43d0070';
    
    let records = [];
    let isLive = false;

    if (apiKey && apiKey !== 'dummy_key_for_now') {
      console.log(`[AGMARKNET] Querying live data.gov.in API with key: ${apiKey.substring(0, 8)}...`);
      try {
        const offsets = [0, 500];
        for (const offset of offsets) {
          const url = `https://api.data.gov.in/resource/${resourceId}?api-key=${apiKey}&format=json&filters[state]=Karnataka&limit=500&offset=${offset}`;
          const response = await axios.get(url, { timeout: 20000 });
          
          if (response.data && Array.isArray(response.data.records) && response.data.records.length > 0) {
            records.push(...response.data.records);
            isLive = true;
            if (response.data.records.length < 500) break;
          }
        }
        console.log(`[AGMARKNET] Successfully fetched ${records.length} authentic records from data.gov.in!`);
      } catch (apiErr) {
        console.error('[AGMARKNET API ERROR] Failed to connect to data.gov.in:', apiErr.message);
      }
    }

    if (records.length > 0) {
      const savedCount = await savePricesToDB(records);
      return { success: true, count: savedCount, isLive: true, totalFetched: records.length };
    }

    return { success: true, count: 0, isLive: false, message: 'No live records retrieved.' };
  } catch (error) {
    console.error('Error in fetchAgmarknetPrices:', error);
    return { success: false, error: error.message };
  }
};

const savePricesToDB = async (records) => {
  try {
    const docs = [];
    const seenKeys = new Set();

    for (const r of records) {
      const key = `${r.market || ''}-${r.commodity || ''}-${r.variety || ''}-${r.arrival_date || ''}`;
      if (seenKeys.has(key)) continue;
      seenKeys.add(key);

      const minP = parseFloat(r.min_price) || 0;
      const maxP = parseFloat(r.max_price) || 0;
      const modalP = parseFloat(r.modal_price) || Math.round((minP + maxP) / 2) || 0;

      docs.push({
        state: r.state || 'Karnataka',
        district: r.district || 'Karnataka',
        market: r.market || 'APMC Yard',
        commodity: r.commodity || 'Agricultural Produce',
        variety: r.variety || 'Standard',
        grade: r.grade || 'FAQ',
        minPrice: minP,
        maxPrice: maxP,
        modalPrice: modalP,
        arrivalDate: parseArrivalDate(r.arrival_date),
        unit: 'Quintal',
        fetchedAt: new Date()
      });
    }

    // Bulk upsert / replace
    for (const d of docs) {
      await MandiPrice.findOneAndUpdate(
        { market: d.market, commodity: d.commodity, arrivalDate: d.arrivalDate },
        d,
        { upsert: true, returnDocument: 'after' }
      );
    }

    console.log(`[DB] Successfully saved ${docs.length} authentic Mandi prices in MongoDB Atlas.`);
    
    auditEmitter.emit('auditLog', {
      action: 'SYSTEM_CRON',
      entityId: null,
      entityModel: 'MandiPrice',
      performedBy: 'SYSTEM',
      details: { message: `Updated ${docs.length} Mandi prices from Agmarknet API` }
    });

    return docs.length;
  } catch (error) {
    console.error('Error saving prices to DB:', error);
    return 0;
  }
};

const checkPriceAlerts = async () => {
  try {
    console.log('[CRON] Checking for >10% price fluctuations...');
    const crops = await Crop.find({ status: 'available' }).populate('farmer');
    
    const cropGroups = {};
    for (const crop of crops) {
      if (!crop.farmer || !crop.farmer.district) continue;
      
      const key = `${crop.name}-${crop.farmer.district}`;
      if (!cropGroups[key]) {
        cropGroups[key] = { commodity: crop.name, district: crop.farmer.district, farmers: new Set() };
      }
      cropGroups[key].farmers.add(crop.farmer._id.toString());
    }

    for (const key in cropGroups) {
      const { commodity, district, farmers } = cropGroups[key];
      
      const prices = await MandiPrice.find({ commodity, district })
        .sort({ arrivalDate: -1 })
        .limit(2);
        
      if (prices.length === 2) {
        const todayPrice = prices[0].modalPrice;
        const yesterdayPrice = prices[1].modalPrice;
        
        if (yesterdayPrice > 0) {
          const percentChange = ((todayPrice - yesterdayPrice) / yesterdayPrice) * 100;
          
          if (Math.abs(percentChange) >= 10) {
            const direction = percentChange > 0 ? 'spiked' : 'dropped';
            const message = `Alert: The Mandi price for ${commodity} in ${district} has ${direction} by ${Math.abs(percentChange).toFixed(1)}% today. Current price: ₹${todayPrice}/Quintal.`;
            
            for (const farmerId of farmers) {
              await createNotification(farmerId, 'Farmer', 'Market Price Alert', message);
            }
            console.log(`[ALERT] Sent ${direction} notification to ${farmers.size} farmers for ${commodity} in ${district}`);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error checking price alerts:', error);
  }
};

module.exports = { fetchAgmarknetPrices, checkPriceAlerts };
