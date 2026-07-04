const axios = require('axios');
const MandiPrice = require('../models/MandiPrice');
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

module.exports = { fetchAgmarknetPrices };
