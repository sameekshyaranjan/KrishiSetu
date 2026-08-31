/**
 * KrishiSetu - Bid Crop Image Association & Multi-Crop Bidding Test Suite
 * 
 * Verifies:
 * 1. 5 Distinct Crops Created by Farmer: Onion, Tomato, Wheat, Maize, Ragi
 * 2. Each Crop stored in MongoDB Atlas with its own genuine photo URL
 * 3. Trader places 5 bids across all 5 crops
 * 4. Trader calls GET /api/bids/my (the endpoint powering /trader/my-bids)
 * 5. Asserts every single bid returns the EXACT photo associated with its own crop lot
 * 6. Asserts NO cross-crop photo contamination (Onion NEVER displays Tomato photo)
 */

const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const API_BASE = process.env.API_BASE_URL || 'http://localhost:5000/api';

const Crop = require('../models/Crop');
const Bid = require('../models/Bid');

const TEST_CROPS = [
  {
    name: 'Hubli Red Onion Lot',
    category: 'vegetables',
    quantity: 120,
    unit: 'quintal',
    basePrice: 1800,
    district: 'Dharwad',
    description: 'Dry, cured grade-A red onions with excellent shelf life.',
    harvestStatus: 'post-harvest',
    images: ['https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500'] // ONION PHOTO
  },
  {
    name: 'Kolar Hybrid Tomato Lot',
    category: 'vegetables',
    quantity: 80,
    unit: 'quintal',
    basePrice: 1400,
    district: 'Kolar',
    description: 'Firm, ripe hybrid table tomatoes ready for retail distribution.',
    harvestStatus: 'post-harvest',
    images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500'] // TOMATO PHOTO
  },
  {
    name: 'Bijapur Sharbati Wheat Lot',
    category: 'grains',
    quantity: 200,
    unit: 'quintal',
    basePrice: 2450,
    district: 'Vijayapura',
    description: 'Golden, machine-cleaned Sharbati premium wheat lot.',
    harvestStatus: 'post-harvest',
    images: ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500'] // WHEAT PHOTO
  },
  {
    name: 'Davangere Yellow Sweet Corn Lot',
    category: 'grains',
    quantity: 150,
    unit: 'quintal',
    basePrice: 1950,
    district: 'Davanagere',
    description: 'High-moisture sweet corn lot for processing and feed mills.',
    harvestStatus: 'post-harvest',
    images: ['https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=500'] // MAIZE/CORN PHOTO
  },
  {
    name: 'Mandya Organic Ragi Finger Millet',
    category: 'millets',
    quantity: 90,
    unit: 'quintal',
    basePrice: 3200,
    district: 'Mandya',
    description: 'Naturally grown nutrient-rich finger millet grains.',
    harvestStatus: 'post-harvest',
    images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500'] // RAGI/MILLET PHOTO
  }
];

const runTest = async () => {
  console.log('===============================================================');
  console.log('🧅🍅🌾 KRISHISETU — BID CROP IMAGE ASSOCIATION AUDIT');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('1️⃣ Connected to MongoDB Atlas\n');

    // 1. Authenticate Farmer and Trader
    console.log('2️⃣ Authenticating Farmer and Trader...');
    const farmerRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'farmer1@krishisetu.com',
      password: 'password123'
    });
    const farmerToken = farmerRes.data.accessToken || farmerRes.data.token;
    const farmerAuth = { headers: { Authorization: `Bearer ${farmerToken}` } };

    const traderRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'trader1@krishisetu.com',
      password: 'password123'
    });
    const traderToken = traderRes.data.accessToken || traderRes.data.token;
    const traderAuth = { headers: { Authorization: `Bearer ${traderToken}` } };

    console.log('   ✅ Farmer & Trader authenticated.\n');
    passed++;

    // 2. Clean old test bids
    console.log('3️⃣ Cleaning existing bids in MongoDB for clean multi-crop test...');
    await Bid.deleteMany({});
    console.log('   ✅ Cleaned bids collection.\n');
    passed++;

    // 3. Create or Update 5 Crops in MongoDB
    console.log('4️⃣ Listing 5 Distinct Crops (Onion, Tomato, Wheat, Maize, Ragi)...');
    const createdCropDocs = [];

    for (const cropData of TEST_CROPS) {
      let doc = await Crop.findOne({ name: cropData.name });
      if (!doc) {
        const cRes = await axios.post(`${API_BASE}/crops`, cropData, farmerAuth);
        doc = cRes.data.data || cRes.data;
      } else {
        doc.images = cropData.images;
        doc.status = 'available';
        await doc.save();
      }
      createdCropDocs.push(doc);
      console.log(`   🌾 Crop: "${doc.name}" | Image: ${doc.images?.[0]}`);
    }
    passed++;

    // 4. Trader places bids on all 5 crops
    console.log('\n5️⃣ Trader placing active bids on all 5 crop listings...');
    for (const crop of createdCropDocs) {
      const bidAmount = crop.basePrice + 50;
      const bRes = await axios.post(`${API_BASE}/bids`, {
        cropId: crop._id,
        amount: bidAmount,
        message: `Official bid of ₹${bidAmount}/Qtl for ${crop.name}`
      }, traderAuth);
      console.log(`   💰 Placed bid of ₹${bidAmount}/Qtl on "${crop.name}" (Bid ID: ${bRes.data._id})`);
    }
    passed++;

    // 5. Fetch Trader's Bids via GET /api/bids/my
    console.log('\n6️⃣ Fetching bids from GET /api/bids/my (Trader My Bids API)...');
    const myBidsRes = await axios.get(`${API_BASE}/bids/my`, traderAuth);
    const bidsList = myBidsRes.data.docs || myBidsRes.data.data || (Array.isArray(myBidsRes.data) ? myBidsRes.data : []);

    console.log(`   ✅ Retrieved ${bidsList.length} bids from API.\n`);

    // 6. Verify each bid's populated crop image
    console.log('7️⃣ Verifying Crop Image Association for Every Bid...');
    console.log('----------------------------------------------------------------------');

    for (const bid of bidsList) {
      const crop = bid.crop;
      const expectedCropData = TEST_CROPS.find(tc => tc.name === crop?.name);

      if (!expectedCropData) {
        console.warn(`   ⚠️ Unknown crop in bids: ${crop?.name}`);
        continue;
      }

      const expectedImage = expectedCropData.images[0];
      const actualImage = crop?.images?.[0];

      console.log(`🔎 BID: ${bid._id}`);
      console.log(`   - Crop Name:       ${crop?.name}`);
      console.log(`   - Expected Image:  ${expectedImage}`);
      console.log(`   - Populated Image: ${actualImage}`);

      if (actualImage === expectedImage) {
        console.log(`   ✅ PASS: Correct crop image returned (${crop.name} -> ${actualImage.includes('onion') ? '🧅 Onion Photo' : actualImage.includes('tomato') ? '🍅 Tomato Photo' : '🌾 Crop Photo'})\n`);
        passed++;
      } else {
        console.error(`   ❌ FAIL: WRONG IMAGE for ${crop.name}! Got: ${actualImage}, Expected: ${expectedImage}\n`);
        failed++;
      }
    }

    // 7. Specifically assert that Onion is NOT displaying Tomato
    const onionBid = bidsList.find(b => b.crop?.name?.includes('Onion'));
    if (onionBid) {
      const onionImg = onionBid.crop?.images?.[0];
      const tomatoPhotoId = 'photo-1592924357228-91a4daadcfea';
      
      if (onionImg && !onionImg.includes(tomatoPhotoId)) {
        console.log('   🎯 CRITICAL ASSERTION PASSED: Onion bid is NOT displaying Tomato photo!');
        passed++;
      } else {
        console.error('   ❌ CRITICAL ASSERTION FAILED: Onion bid is displaying Tomato photo!');
        failed++;
      }
    }

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

runTest();
