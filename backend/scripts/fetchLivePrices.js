require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const MandiPrice = require('../models/MandiPrice');

const fetchLivePrices = async () => {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected Successfully!\n');

    let apiKey = process.env.AGMARKNET_API_KEY;
    // Strip leading 'y' if typed by accident, or use as is
    console.log(`Using API Key: ${apiKey}`);

    const resourceId = process.env.AGMARKNET_RESOURCE_ID || '9ef84268-d588-465a-a308-a864a43d0070';
    
    // 1. Try with exact key
    let url = `https://api.data.gov.in/resource/${resourceId}?api-key=${apiKey}&format=json&limit=150`;
    console.log(`Querying: ${url.replace(apiKey, apiKey.substring(0, 8) + '...')}`);

    let response;
    try {
      response = await axios.get(url, { timeout: 20000 });
    } catch (err) {
      if (apiKey.startsWith('y') && apiKey.length > 50) {
        // Try stripping accidental prefix 'y'
        const cleanKey = apiKey.substring(1);
        console.log(`Retrying with cleaned key: ${cleanKey.substring(0, 8)}...`);
        url = `https://api.data.gov.in/resource/${resourceId}?api-key=${cleanKey}&format=json&limit=150`;
        response = await axios.get(url, { timeout: 20000 });
      } else {
        throw err;
      }
    }

    const records = response.data?.records || [];
    console.log(`\nSuccessfully received ${records.length} records from data.gov.in!`);

    if (records.length === 0) {
      console.log('No records returned from API.');
      process.exit(0);
    }

    console.log('\nSample Live Commodity Record from Government Mandi:');
    console.log(JSON.stringify(records[0], null, 2));

    let saved = 0;
    for (const r of records) {
      const minP = parseFloat(r.min_price) || 0;
      const maxP = parseFloat(r.max_price) || 0;
      const modalP = parseFloat(r.modal_price) || Math.round((minP + maxP) / 2) || 0;

      let arrivalDate = new Date();
      if (r.arrival_date) {
        if (r.arrival_date.includes('/')) {
          const parts = r.arrival_date.split('/');
          if (parts.length === 3) {
            arrivalDate = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
          }
        } else {
          arrivalDate = new Date(r.arrival_date);
        }
      }

      const priceData = {
        state: r.state || 'Karnataka',
        district: r.district || 'Karnataka District',
        market: r.market || 'APMC Yard',
        commodity: r.commodity || 'Agricultural Produce',
        variety: r.variety || 'Standard',
        grade: r.grade || 'FAQ',
        minPrice: minP,
        maxPrice: maxP,
        modalPrice: modalP,
        arrivalDate: isNaN(arrivalDate.getTime()) ? new Date() : arrivalDate,
        unit: 'Quintal',
        fetchedAt: new Date()
      };

      await MandiPrice.findOneAndUpdate(
        {
          market: priceData.market,
          commodity: priceData.commodity,
          arrivalDate: priceData.arrivalDate
        },
        priceData,
        { upsert: true, new: true }
      );
      saved++;
    }

    console.log(`\n✅ Successfully UPSERTED ${saved} REAL live commodity records to MongoDB Atlas database!`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error fetching live data.gov.in prices:', error.response?.data || error.message);
    process.exit(1);
  }
};

fetchLivePrices();
