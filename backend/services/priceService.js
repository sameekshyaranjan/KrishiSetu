const axios = require('axios');
const MandiPrice = require('../models/MandiPrice');
const Crop = require('../models/Crop');
const { createNotification } = require('../utils/createNotification');
const auditEmitter = require('../utils/auditEmitter');

const fetchAgmarknetPrices = async () => {
  try {
    const apiKey = process.env.AGMARKNET_API_KEY;
    const resourceId = process.env.AGMARKNET_RESOURCE_ID || '9ef84268-d588-465a-a308-a864a43d0070';
    
    let records = [];

    // Development Mock: If API key is missing or dummy, generate fake data matching Karnataka APMCs
    if (!apiKey || apiKey === 'dummy_key_for_now' || process.env.NODE_ENV === 'development') {
      console.log('[DEV MOCK] Generating fake Agmarknet prices for Karnataka...');
      const karnatakaDistricts = ['Bengaluru Urban', 'Mysuru', 'Hubballi', 'Belagavi'];
      const crops = ['Tomato', 'Potato', 'Onion', 'Rice', 'Wheat'];
      
      for (const district of karnatakaDistricts) {
        for (const crop of crops) {
          const fakePrice = Math.floor(Math.random() * 2000 + 1000);
          records.push({
            state: 'Karnataka',
            district: district,
            market: `${district} APMC`,
            commodity: crop,
            variety: 'Common',
            arrival_date: new Date().toISOString().split('T')[0],
            min_price: fakePrice - 200,
            max_price: fakePrice + 200,
            modal_price: fakePrice
          });
        }
      }
    } else {
      // Production: Fetch real data from data.gov.in
      console.log('Fetching live prices from Agmarknet API...');
      const url = `https://api.data.gov.in/resource/${resourceId}?api-key=${apiKey}&format=json&filters[state]=Karnataka`;
      const response = await axios.get(url);
      
      if (response.data && response.data.records) {
        records = response.data.records;
      }
    }

    if (records.length > 0) {
      await savePricesToDB(records);
    }
    
    return true;
  } catch (error) {
    console.error('Error fetching Agmarknet prices:', error);
    return false;
  }
};

const savePricesToDB = async (records) => {
  try {
    let savedCount = 0;
    
    for (const record of records) {
      const priceData = {
        state: record.state,
        district: record.district,
        market: record.market,
        commodity: record.commodity,
        variety: record.variety,
        minPrice: parseFloat(record.min_price),
        maxPrice: parseFloat(record.max_price),
        modalPrice: parseFloat(record.modal_price),
        arrivalDate: new Date(record.arrival_date),
        unit: 'Quintal'
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

    console.log(`Successfully saved ${savedCount} Mandi prices to MongoDB.`);
    
    auditEmitter.emit('auditLog', {
      action: 'SYSTEM_CRON',
      entityId: null,
      entityModel: 'MandiPrice',
      performedBy: 'SYSTEM',
      details: { message: `Updated ${savedCount} Mandi prices from Agmarknet` }
    });

  } catch (error) {
    console.error('Error saving prices to DB:', error);
  }
};

const checkPriceAlerts = async () => {
  try {
    console.log('[CRON] Checking for >10% price fluctuations...');
    const crops = await Crop.find({ status: 'available' }).populate('farmer');
    
    // Group crops by commodity and district to avoid redundant DB queries
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
      
      // Fetch the two most recent prices for this commodity in this district
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
