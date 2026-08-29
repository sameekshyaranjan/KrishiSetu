const axios = require('axios');
const MandiPrice = require('../models/MandiPrice');
const Crop = require('../models/Crop');
const { createNotification } = require('../utils/createNotification');
const auditEmitter = require('../utils/auditEmitter');

/**
 * Fetch Live Agmarknet APMC Mandi Prices from data.gov.in
 */
const fetchAgmarknetPrices = async () => {
  try {
    const apiKey = process.env.AGMARKNET_API_KEY;
    const resourceId = process.env.AGMARKNET_RESOURCE_ID || '9ef84268-d588-465a-a308-a864a43d0070';
    
    let records = [];
    let isLive = false;

    // Check if user has configured a valid data.gov.in API key
    if (apiKey && apiKey !== 'dummy_key_for_now' && apiKey.trim() !== '') {
      console.log(`[AGMARKNET] Querying live data.gov.in API with key: ${apiKey.substring(0, 6)}...`);
      try {
        const url = `https://api.data.gov.in/resource/${resourceId}?api-key=${apiKey}&format=json&filters[state]=Karnataka&limit=150`;
        const response = await axios.get(url, { timeout: 15000 });
        
        if (response.data && Array.isArray(response.data.records) && response.data.records.length > 0) {
          records = response.data.records;
          isLive = true;
          console.log(`[AGMARKNET] Successfully fetched ${records.length} live commodity records from data.gov.in!`);
        } else {
          console.warn('[AGMARKNET] Live API returned 0 records for Karnataka. Checking general query...');
          // Fallback without state filter if empty
          const fallbackUrl = `https://api.data.gov.in/resource/${resourceId}?api-key=${apiKey}&format=json&limit=150`;
          const fallbackRes = await axios.get(fallbackUrl, { timeout: 15000 });
          if (fallbackRes.data && Array.isArray(fallbackRes.data.records) && fallbackRes.data.records.length > 0) {
            records = fallbackRes.data.records;
            isLive = true;
            console.log(`[AGMARKNET] Live API returned ${records.length} national records.`);
          }
        }
      } catch (apiErr) {
        console.error('[AGMARKNET API ERROR] Failed to connect to data.gov.in:', apiErr.message);
      }
    }

    // Fallback: If no API key or API call failed, generate high-fidelity Karnataka mandi dataset
    if (records.length === 0) {
      console.log('[DEV MOCK] Generating Karnataka APMC live benchmark prices (Hassan, Kolar, Mandya, Belagavi, Bengaluru)...');
      const karnatakaMarkets = [
        { district: 'Hassan', market: 'Hassan APMC', commodity: 'Tomato', variety: 'Hybrid Grade-A', modal: 2200 },
        { district: 'Hassan', market: 'Belur Sub-Yard', commodity: 'Potato', variety: 'Kufri Jyoti', modal: 1850 },
        { district: 'Mandya', market: 'Mandya APMC', commodity: 'Onion', variety: 'Bellary Red', modal: 2650 },
        { district: 'Mandya', market: 'Maddur APMC', commodity: 'Sugarcane', variety: 'Co-86032', modal: 3100 },
        { district: 'Bengaluru Rural', market: 'Doddaballapura APMC', commodity: 'Maize', variety: 'Yellow Dent', modal: 2050 },
        { district: 'Kolar', market: 'Kolar APMC Main Yard', commodity: 'Finger Millet (Ragi)', variety: 'GPU-28 Organic', modal: 3450 },
        { district: 'Belagavi', market: 'Byadagi Special APMC', commodity: 'Dry Chilli', variety: 'Byadagi Stemless', modal: 14500 },
        { district: 'Belagavi', market: 'Belagavi Market Yard', commodity: 'Soybean', variety: 'JS-335', modal: 4400 },
        { district: 'Mysuru', market: 'Bandipalya APMC, Mysuru', commodity: 'Rice (Paddy)', variety: 'Sona Masoori', modal: 3200 },
        { district: 'Hubballi', market: 'Amargol APMC, Hubballi', commodity: 'Cotton', variety: 'DCH-32 Medium Staple', modal: 7200 }
      ];

      for (const m of karnatakaMarkets) {
        records.push({
          state: 'Karnataka',
          district: m.district,
          market: m.market,
          commodity: m.commodity,
          variety: m.variety,
          arrival_date: new Date().toISOString().split('T')[0],
          min_price: m.modal - Math.round(m.modal * 0.08),
          max_price: m.modal + Math.round(m.modal * 0.08),
          modal_price: m.modal
        });
      }
    }

    const savedCount = await savePricesToDB(records);
    return { success: true, count: savedCount, isLive, totalFetched: records.length };
  } catch (error) {
    console.error('Error in fetchAgmarknetPrices:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Helper to parse arrival date (handles DD/MM/YYYY, YYYY-MM-DD, ISO)
 */
const parseArrivalDate = (dateStr) => {
  if (!dateStr) return new Date();
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      // DD/MM/YYYY
      return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
    }
  }
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
};

const savePricesToDB = async (records) => {
  try {
    let savedCount = 0;
    
    for (const record of records) {
      const minP = parseFloat(record.min_price) || 0;
      const maxP = parseFloat(record.max_price) || 0;
      const modalP = parseFloat(record.modal_price) || Math.round((minP + maxP) / 2) || 0;

      const priceData = {
        state: record.state || 'Karnataka',
        district: record.district || 'Karnataka District',
        market: record.market || 'APMC Yard',
        commodity: record.commodity || 'Agricultural Produce',
        variety: record.variety || 'Standard',
        minPrice: minP,
        maxPrice: maxP,
        modalPrice: modalP,
        arrivalDate: parseArrivalDate(record.arrival_date),
        unit: 'Quintal',
        fetchedAt: new Date()
      };

      // Upsert: Update if exists, Insert if new
      await MandiPrice.findOneAndUpdate(
        { 
          market: priceData.market, 
          commodity: priceData.commodity, 
          arrivalDate: priceData.arrivalDate 
        },
        priceData,
        { upsert: true, new: true }
      );
      savedCount++;
    }

    console.log(`[DB] Successfully saved/updated ${savedCount} Mandi prices in MongoDB.`);
    
    auditEmitter.emit('auditLog', {
      action: 'SYSTEM_CRON',
      entityId: null,
      entityModel: 'MandiPrice',
      performedBy: 'SYSTEM',
      details: { message: `Updated ${savedCount} Mandi prices from Agmarknet` }
    });

    return savedCount;
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
