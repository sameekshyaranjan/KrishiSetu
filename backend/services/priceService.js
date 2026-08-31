const axios = require('axios');
const MandiPrice = require('../models/MandiPrice');
const Crop = require('../models/Crop');
const { KARNATAKA_DISTRICTS } = require('../utils/karnatakaLocations');
const { createNotification } = require('../utils/createNotification');
const auditEmitter = require('../utils/auditEmitter');
const redisClient = require('../config/redis');

/**
 * Helper to parse arrival date (handles DD/MM/YYYY, YYYY-MM-DD, ISO)
 */
const parseArrivalDate = (dateStr) => {
  if (!dateStr) return new Date();
  if (typeof dateStr === 'string' && dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
    }
  }
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
};

/**
 * Helper to normalize and validate Karnataka district name
 */
const normalizeKarnatakaDistrict = (districtName) => {
  if (!districtName || typeof districtName !== 'string') return 'Karnataka';
  const clean = districtName.trim();
  const matched = KARNATAKA_DISTRICTS.find(
    d => d.toLowerCase() === clean.toLowerCase() ||
         clean.toLowerCase().includes(d.toLowerCase()) ||
         d.toLowerCase().includes(clean.toLowerCase())
  );
  return matched || clean;
};

/**
 * Fetch 100% Live Agmarknet APMC Mandi Prices strictly for Karnataka from data.gov.in
 */
const fetchAgmarknetPrices = async () => {
  try {
    const apiKey = (process.env.AGMARKNET_API_KEY || '').trim();
    const resourceId = process.env.AGMARKNET_RESOURCE_ID || '9ef84268-d588-465a-a308-a864a43d0070';
    
    let rawRecords = [];
    let isLive = false;

    if (apiKey && apiKey !== 'dummy_key_for_now') {
      try {
        // Query paginated batches with server-side filters[state]=Karnataka
        const offsets = [0, 500, 1000];
        for (const offset of offsets) {
          const url = `https://api.data.gov.in/resource/${resourceId}?api-key=${apiKey}&format=json&filters[state]=Karnataka&limit=500&offset=${offset}`;
          const response = await axios.get(url, { timeout: 25000 });
          
          if (response.data && Array.isArray(response.data.records) && response.data.records.length > 0) {
            rawRecords.push(...response.data.records);
            isLive = true;
            if (response.data.records.length < 500) break;
          } else {
            break;
          }
        }
      } catch (apiErr) {
        console.error('[AGMARKNET API ERROR] Failed to connect to data.gov.in:', apiErr.message);
        return { success: false, isLive: false, error: 'Government Agmarknet API temporarily unreachable' };
      }
    } else {
      return { success: false, isLive: false, error: 'AGMARKNET_API_KEY is not configured on server' };
    }

    if (rawRecords.length > 0) {
      // 1. Strict Server-Side Karnataka Filter & Validation
      const karnatakaRecords = rawRecords.filter(r => {
        const stateStr = (r.state || r.State || '').trim().toLowerCase();
        return stateStr === 'karnataka';
      });

      const savedCount = await savePricesToDB(karnatakaRecords);

      // 2. Invalidate any Redis cache for Mandi Prices
      if (redisClient && typeof redisClient.incr === 'function') {
        try {
          await redisClient.incr('mandi_prices_feed_version');
        } catch (e) {}
      }

      return {
        success: true,
        count: savedCount,
        isLive: true,
        totalFetched: rawRecords.length,
        karnatakaVerified: karnatakaRecords.length
      };
    }

    return { success: true, count: 0, isLive: false, message: 'No active Karnataka records returned for today.' };
  } catch (error) {
    console.error('Error in fetchAgmarknetPrices:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Persist validated Karnataka Mandi Records to MongoDB
 */
const savePricesToDB = async (records) => {
  try {
    const docs = [];
    const seenKeys = new Set();

    for (const r of records) {
      const stateStr = (r.state || r.State || '').trim();
      // Enforce strict Karnataka whitelist
      if (stateStr.toLowerCase() !== 'karnataka') continue;

      const market = (r.market || r.Market || 'APMC Yard').trim();
      const commodity = (r.commodity || r.Commodity || 'Produce').trim();
      const variety = (r.variety || r.Variety || 'Standard').trim();
      const grade = (r.grade || r.Grade || 'FAQ').trim();
      const arrivalDateStr = r.arrival_date || r.Arrival_Date || r['Arrival_Date'];
      const arrivalDate = parseArrivalDate(arrivalDateStr);

      const key = `${market}-${commodity}-${variety}-${arrivalDate.toISOString().split('T')[0]}`;
      if (seenKeys.has(key)) continue;
      seenKeys.add(key);

      const minP = parseFloat(r.min_price || r['Min_x0020_Price'] || r.Min_Price) || 0;
      const maxP = parseFloat(r.max_price || r['Max_x0020_Price'] || r.Max_Price) || 0;
      const modalP = parseFloat(r.modal_price || r['Modal_x0020_Price'] || r.Modal_Price) || Math.round((minP + maxP) / 2) || 0;

      const rawDistrict = (r.district || r.District || '').trim();
      const district = normalizeKarnatakaDistrict(rawDistrict);

      docs.push({
        state: 'Karnataka',
        district,
        market,
        commodity,
        variety,
        grade,
        minPrice: minP,
        maxPrice: maxP,
        modalPrice: modalP,
        arrivalDate,
        unit: 'Quintal',
        fetchedAt: new Date()
      });
    }

    if (docs.length === 0) return 0;

    // Bulk upsert without creating duplicates
    const bulkOps = docs.map(d => ({
      updateOne: {
        filter: {
          state: 'Karnataka',
          market: d.market,
          commodity: d.commodity,
          variety: d.variety,
          arrivalDate: d.arrivalDate
        },
        update: { $set: d },
        upsert: true
      }
    }));

    const result = await MandiPrice.bulkWrite(bulkOps, { ordered: false });
    const upsertedOrUpdated = (result.upsertedCount || 0) + (result.modifiedCount || 0);

    auditEmitter.emit('auditLog', {
      action: 'SYSTEM_CRON',
      entityId: null,
      entityModel: 'MandiPrice',
      performedBy: 'SYSTEM',
      details: { message: `Updated ${docs.length} Karnataka Mandi prices from Agmarknet API` }
    });

    return docs.length;
  } catch (error) {
    console.error('Error saving Karnataka prices to DB:', error);
    return 0;
  }
};

/**
 * Check for >10% price fluctuations and notify relevant Karnataka farmers
 */
const checkPriceAlerts = async () => {
  try {
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
      
      const prices = await MandiPrice.find({
        state: 'Karnataka',
        commodity: { $regex: new RegExp(`^${commodity}$`, 'i') },
        district: { $regex: new RegExp(district, 'i') }
      })
        .sort({ arrivalDate: -1 })
        .limit(2);
        
      if (prices.length === 2) {
        const todayPrice = prices[0].modalPrice;
        const yesterdayPrice = prices[1].modalPrice;
        
        if (yesterdayPrice > 0) {
          const percentChange = ((todayPrice - yesterdayPrice) / yesterdayPrice) * 100;
          
          if (Math.abs(percentChange) >= 10) {
            const direction = percentChange > 0 ? 'spiked' : 'dropped';
            const message = `Alert: The Karnataka Mandi price for ${commodity} in ${district} has ${direction} by ${Math.abs(percentChange).toFixed(1)}% today. Current modal price: ₹${todayPrice}/Quintal.`;
            
            for (const farmerId of farmers) {
              await createNotification(farmerId, 'Farmer', 'Market Price Alert', message);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error checking price alerts:', error);
  }
};

module.exports = { fetchAgmarknetPrices, checkPriceAlerts };
