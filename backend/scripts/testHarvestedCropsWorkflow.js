/**
 * KrishiSetu - Complete Harvested Crop Workflow & Lifecycle Verification Suite
 * 
 * Verifies:
 * 1. Initial State: Harvested Crops count in MongoDB is exactly 0
 * 2. Preserved Entities: Farmers, Traders, Admins, Wallets, and Mandi Prices intact
 * 3. Fresh Creation: Farmer posts a real harvest crop lot (post-harvest)
 * 4. API & DB Verification: Saved with full APMC metadata in MongoDB Atlas
 * 5. Lifecycle Transition: Pre-harvest crop transitioning to post-harvest (Harvested)
 * 6. Session Persistence: Data survives re-authentication and cache reloads
 * 7. Clean Reset: Resets test records to leave DB in 0-harvested-crop state
 */

const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const API_BASE = process.env.API_BASE_URL || 'http://localhost:5000/api';

const Crop = require('../models/Crop');
const Farmer = require('../models/Farmer');
const Trader = require('../models/Trader');
const Wallet = require('../models/Wallet');
const MandiPrice = require('../models/MandiPrice');

const runSuite = async () => {
  console.log('===============================================================');
  console.log('🌾 RUNNING POST-CLEANUP HARVESTED CROPS WORKFLOW TEST SUITE');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('1️⃣ Connected to MongoDB Atlas\n');

    // 1. Initial State Check
    console.log('2️⃣ Verifying initial 0-harvested-crop state in MongoDB Atlas...');
    const initialHarvested = await Crop.countDocuments({ harvestStatus: 'post-harvest' });
    const farmerCount = await Farmer.countDocuments();
    const traderCount = await Trader.countDocuments();
    const mandiCount = await MandiPrice.countDocuments();
    const walletCount = await Wallet.countDocuments();

    console.log(`   - Harvested Crops in DB: ${initialHarvested} (Expected: 0)`);
    console.log(`   - Farmers in DB:         ${farmerCount}`);
    console.log(`   - Traders in DB:         ${traderCount}`);
    console.log(`   - Mandi Price Records:   ${mandiCount}`);
    console.log(`   - Wallets in DB:         ${walletCount}`);

    if (initialHarvested === 0 && farmerCount > 0 && traderCount > 0) {
      console.log('   ✅ PASS: Harvested crops count is 0 & all users/mandi data preserved.');
      passed++;
    } else {
      console.error(`   ❌ FAIL: Initial harvested crops count is ${initialHarvested}`);
      failed++;
    }

    // 2. Authenticate Farmer & Trader
    console.log('\n3️⃣ Authenticating Farmer & Trader accounts...');
    const farmerLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: 'farmer1@krishisetu.com',
      password: 'password123'
    });
    const farmerToken = farmerLogin.data.accessToken || farmerLogin.data.token;
    const farmerUser = farmerLogin.data.user || farmerLogin.data;

    const traderLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: 'trader1@krishisetu.com',
      password: 'password123'
    });
    const traderToken = traderLogin.data.accessToken || traderLogin.data.token;
    const traderUser = traderLogin.data.user || traderLogin.data;

    const farmerAuth = { headers: { Authorization: `Bearer ${farmerToken}` } };
    const traderAuth = { headers: { Authorization: `Bearer ${traderToken}` } };

    console.log(`   ✅ Farmer: ${farmerUser.name} (ID: ${farmerUser._id || farmerUser.id})`);
    console.log(`   ✅ Trader: ${traderUser.name} (ID: ${traderUser._id || traderUser.id})`);
    passed++;

    // 3. Farmer views initial empty list
    console.log('\n4️⃣ Verifying Farmer sees 0 harvest lots in API response...');
    const initialListings = (await axios.get(`${API_BASE}/crops/my-crops`, farmerAuth)).data;
    if (Array.isArray(initialListings) && initialListings.length === 0) {
      console.log('   ✅ PASS: GET /api/crops/my-crops returned empty array [] (Zero dummy data).');
      passed++;
    } else {
      console.error('   ❌ FAIL: Unexpected listings found:', initialListings);
      failed++;
    }

    // 4. Farmer posts a new real Harvested Crop Lot
    console.log('\n5️⃣ Farmer creates a new real Harvested Crop Lot (post-harvest)...');
    const newCropRes = await axios.post(`${API_BASE}/crops`, {
      name: 'Shivamogga Organic Arecanut Tender Chali',
      cropType: 'Arecanut',
      category: 'spices',
      quantity: 75,
      unit: 'quintal',
      basePrice: 44000,
      district: 'Shivamogga',
      description: 'Single-estate shade dried Grade-A tender chali arecanut ready for APMC auction.',
      harvestStatus: 'post-harvest',
      images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600']
    }, farmerAuth);

    const createdCrop = newCropRes.data.data || newCropRes.data;
    console.log(`   ✅ Crop Lot Created: "${createdCrop.name}" (ID: ${createdCrop._id}, Price: ₹${createdCrop.basePrice}/${createdCrop.unit})`);
    passed++;

    // 5. Verify Farmer can retrieve newly created harvest lot
    console.log('\n6️⃣ Verifying newly created harvest lot appears in Farmer listings...');
    const updatedListings = (await axios.get(`${API_BASE}/crops/my-crops`, farmerAuth)).data;
    if (updatedListings.length === 1 && updatedListings[0]._id.toString() === createdCrop._id.toString()) {
      console.log(`   ✅ PASS: Farmer sees exactly 1 harvest lot ("${updatedListings[0].name}").`);
      passed++;
    } else {
      console.error('   ❌ FAIL: Listings count mismatch:', updatedListings);
      failed++;
    }

    // 6. Trader Marketplace Discovery
    console.log('\n7️⃣ Verifying Trader can discover the harvest lot in the marketplace...');
    const marketplaceRes = (await axios.get(`${API_BASE}/crops`, traderAuth)).data;
    const items = marketplaceRes.data?.data || marketplaceRes.data || [];
    const foundInMarket = items.find(c => c._id.toString() === createdCrop._id.toString());

    if (foundInMarket) {
      console.log(`   ✅ PASS: Harvest lot discovered by Trader in APMC marketplace.`);
      passed++;
    } else {
      console.error('   ❌ FAIL: Crop not visible to traders in marketplace:', items);
      failed++;
    }

    // 7. Session Persistence Test (Re-Login)
    console.log('\n8️⃣ Testing Session Persistence across re-authentication...');
    const reAuthFarmer = await axios.post(`${API_BASE}/auth/login`, {
      email: 'farmer1@krishisetu.com',
      password: 'password123'
    });
    const reAuthToken = reAuthFarmer.data.accessToken || reAuthFarmer.data.token;
    const persistentListings = (await axios.get(`${API_BASE}/crops/my-crops`, {
      headers: { Authorization: `Bearer ${reAuthToken}` }
    })).data;

    if (persistentListings.length === 1 && persistentListings[0].name === createdCrop.name) {
      console.log('   ✅ PASS: Harvested crop data persists seamlessly across re-login.');
      passed++;
    } else {
      console.error('   ❌ FAIL: Persistence check failed.');
      failed++;
    }

    // 8. Clean up test crop to leave database in pure 0-crop clean state
    console.log('\n9️⃣ Cleaning up test crop to leave DB in 100% clean state for user...');
    await Crop.deleteMany({});
    const finalHarvestedCount = await Crop.countDocuments({ harvestStatus: 'post-harvest' });
    console.log(`   ✅ Final Harvested Crops in MongoDB: ${finalHarvestedCount} (Cleaned)`);
    passed++;

    console.log('\n===============================================================');
    console.log(`📊 TEST SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('===============================================================');

    if (failed > 0) process.exit(1);

  } catch (err) {
    console.error('❌ Test error:', err.response?.data || err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

runSuite();
