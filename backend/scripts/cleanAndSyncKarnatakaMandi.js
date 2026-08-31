const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const MandiPrice = require('../models/MandiPrice');
const { fetchAgmarknetPrices } = require('../services/priceService');
const redisClient = require('../config/redis');

const cleanAndSync = async () => {
  console.log('===============================================================');
  console.log('🌾 CLEANING & SYNCHRONIZING KARNATAKA MANDI PRICES');
  console.log('===============================================================\n');

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas\n');

    // 1. Snapshot BEFORE
    const beforeTotal = await MandiPrice.countDocuments();
    const beforeNonKarnataka = await MandiPrice.countDocuments({
      state: { $not: /^karnataka$/i }
    });
    const beforeKarnataka = await MandiPrice.countDocuments({
      state: /^karnataka$/i
    });

    console.log('📊 DATABASE BEFORE CLEANUP:');
    console.log(`   - Total Records: ${beforeTotal}`);
    console.log(`   - Non-Karnataka Records (To Delete): ${beforeNonKarnataka}`);
    console.log(`   - Karnataka Records: ${beforeKarnataka}\n`);

    // 2. Delete non-Karnataka records
    console.log('🗑️ Purging non-Karnataka records from database...');
    const deleteRes = await MandiPrice.deleteMany({
      state: { $not: /^karnataka$/i }
    });
    console.log(`   ✅ Successfully removed ${deleteRes.deletedCount} non-Karnataka records.\n`);

    // 3. Fetch & Sync 100% Live Real Karnataka records from Agmarknet API
    console.log('📡 Fetching official live Karnataka data from data.gov.in Agmarknet API...');
    const syncRes = await fetchAgmarknetPrices();
    console.log('   Sync Result:', syncRes);

    // 4. Invalidate Redis Cache
    if (redisClient && typeof redisClient.incr === 'function') {
      try {
        const v = await redisClient.incr('mandi_prices_feed_version');
        console.log(`   ✅ Redis cache invalidated (version ${v})`);
      } catch (e) {
        console.warn('   Redis cache note:', e.message);
      }
    }

    // 5. Snapshot AFTER
    const afterTotal = await MandiPrice.countDocuments();
    const afterNonKarnataka = await MandiPrice.countDocuments({
      state: { $not: /^karnataka$/i }
    });
    const afterKarnataka = await MandiPrice.countDocuments({
      state: /^karnataka$/i
    });

    console.log('\n📊 DATABASE AFTER CLEANUP & SYNC:');
    console.log(`   - Total Records: ${afterTotal}`);
    console.log(`   - Non-Karnataka Records: ${afterNonKarnataka} (Must be 0)`);
    console.log(`   - Karnataka Records: ${afterKarnataka}`);

    // 6. Verify sample commodities from official API
    console.log('\n--- Real Government Karnataka Mandi Samples ---');
    const samples = await MandiPrice.find({ state: 'Karnataka' }).limit(8);
    samples.forEach((s, idx) => {
      console.log(`[${idx+1}] District: ${s.district} | Market: ${s.market} | Commodity: ${s.commodity} (${s.variety}) | Modal: ₹${s.modalPrice}/Qtl | Date: ${s.arrivalDate.toISOString().split('T')[0]}`);
    });

    console.log('\n===============================================================');
    console.log('✅ MANDI PRICE PIPELINE SUCCESSFULLY PURIFIED (100% KARNATAKA)');
    console.log('===============================================================\n');

  } catch (err) {
    console.error('Error in cleanAndSync:', err);
  } finally {
    await mongoose.disconnect();
  }
};

cleanAndSync();
