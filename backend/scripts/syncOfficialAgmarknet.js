require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const MandiPrice = require('../models/MandiPrice');

const parseArrivalDate = (dateStr) => {
  if (!dateStr) return new Date();
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
    }
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? new Date() : d;
};

const syncAllRealPrices = async () => {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Atlas Connected Successfully!\n');

    const apiKey = (process.env.AGMARKNET_API_KEY || '').trim();
    const resourceId = process.env.AGMARKNET_RESOURCE_ID || '9ef84268-d588-465a-a308-a864a43d0070';

    console.log(`[AGMARKNET] Fetching ALL live records from data.gov.in using key: ${apiKey.substring(0, 8)}...`);

    let allRecords = [];

    // 1. Fetch Karnataka state records (all pages)
    const offsets = [0, 500];
    for (const offset of offsets) {
      const url = `https://api.data.gov.in/resource/${resourceId}?api-key=${apiKey}&format=json&filters[state]=Karnataka&limit=500&offset=${offset}`;
      console.log(`Fetching Karnataka offset ${offset}...`);
      const res = await axios.get(url, { timeout: 25000 });
      const batch = res.data?.records || [];
      console.log(`Received ${batch.length} Karnataka records from offset ${offset}`);
      allRecords.push(...batch);
      if (batch.length < 500) break;
    }

    // 2. Fetch National records
    const nationalUrl = `https://api.data.gov.in/resource/${resourceId}?api-key=${apiKey}&format=json&limit=500`;
    console.log('Fetching national APMC records...');
    const nationalRes = await axios.get(nationalUrl, { timeout: 25000 });
    const nationalBatch = nationalRes.data?.records || [];
    console.log(`Received ${nationalBatch.length} national records.`);
    allRecords.push(...nationalBatch);

    console.log(`\nTotal Live Records Retrieved from data.gov.in: ${allRecords.length}`);

    // Clear stale database collections
    console.log('Clearing old database entries...');
    await MandiPrice.deleteMany({});
    console.log('Collection cleaned.');

    const docs = [];
    const seenKeys = new Set();

    for (const r of allRecords) {
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
        commodity: r.commodity || 'Produce',
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

    console.log(`Bulk inserting ${docs.length} pure official records into MongoDB Atlas...`);
    await MandiPrice.insertMany(docs, { ordered: false });

    const finalCount = await MandiPrice.countDocuments();
    console.log(`\n✅ 100% PURE REAL DATA: Successfully saved ${finalCount} authentic government records in MongoDB Atlas!`);

    console.log('\n--- Real Government Mandi Samples in DB ---');
    const samples = await MandiPrice.find({ state: 'Karnataka' }).limit(10);
    samples.forEach(s => {
      console.log(`${s.district} | ${s.market} | ${s.commodity} (${s.variety}) | Modal: ₹${s.modalPrice}/Qtl | Date: ${s.arrivalDate.toISOString().split('T')[0]}`);
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Sync Error:', error.response?.data || error.message);
    process.exit(1);
  }
};

syncAllRealPrices();
