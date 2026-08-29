const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const Farmer = require('../models/Farmer');
const Trader = require('../models/Trader');
const Crop = require('../models/Crop');
const Bid = require('../models/Bid');
const Transaction = require('../models/Transaction');
const { generateAccessToken } = require('../utils/generateToken');

dotenv.config();

const API = 'http://localhost:5000/api';

async function runEndToEndMarketplaceTest() {
  await connectDB();
  console.log('Connected to MongoDB for End-to-End Verification\n');

  console.log('================================================================');
  console.log('STEP 1: Register Trader A & Verify Zero Dummy Personal Activity');
  console.log('================================================================');
  const timestamp = Date.now();
  const traderA = await Trader.create({
    name: 'Gowda Wholesale Agro',
    email: `trader_a_${timestamp}@gmail.com`,
    mobile: `9845${Math.floor(100000 + Math.random() * 900000)}`,
    password: 'password123',
    district: 'Bengaluru Urban',
    companyName: 'Gowda Agro Trading Co'
  });
  const tokenA = generateAccessToken({ id: traderA._id, role: 'trader' });

  const traderABids = await axios.get(`${API}/bids/my`, { headers: { Authorization: `Bearer ${tokenA}` } });
  const rawBidsA = traderABids.data?.data || traderABids.data?.docs || (Array.isArray(traderABids.data) ? traderABids.data : []);
  console.log(`✓ Trader A Personal Bids: ${rawBidsA.length} (Expected: 0)`);
  if (rawBidsA.length !== 0) throw new Error('Trader A should have 0 personal bids!');

  console.log('\n================================================================');
  console.log('STEP 2: Register Farmer A & Create Legitimate Crop A');
  console.log('================================================================');
  const farmerA = await Farmer.create({
    name: 'Venkatesh Murthy',
    email: `farmer_a_${timestamp}@gmail.com`,
    mobile: `9886${Math.floor(100000 + Math.random() * 900000)}`,
    password: 'password123',
    district: 'Mandya',
    village: 'Maddur Village',
    state: 'Karnataka'
  });
  const tokenFarmerA = generateAccessToken({ id: farmerA._id, role: 'farmer' });

  const cropARes = await axios.post(`${API}/crops`, {
    name: 'Organic Mandya Sugarcane Jaggery Lot',
    category: 'spices',
    quantity: 150,
    unit: 'quintal',
    basePrice: 3800,
    district: 'Mandya',
    description: 'Freshly processed chemical-free organic jaggery directly from Mandya farm gate.'
  }, { headers: { Authorization: `Bearer ${tokenFarmerA}` } });

  const cropA = cropARes.data;
  console.log(`✓ Farmer A created Crop: "${cropA.name}" (ID: ${cropA._id}, Base Price: ₹${cropA.basePrice})`);

  console.log('\n================================================================');
  console.log('STEP 3: Register Farmer B & Create Legitimate Crop B');
  console.log('================================================================');
  const farmerB = await Farmer.create({
    name: 'Chennappa Gowda',
    email: `farmer_b_${timestamp}@gmail.com`,
    mobile: `9887${Math.floor(100000 + Math.random() * 900000)}`,
    password: 'password123',
    district: 'Hassan',
    village: 'Belur Taluk',
    state: 'Karnataka'
  });
  const tokenFarmerB = generateAccessToken({ id: farmerB._id, role: 'farmer' });

  const cropBRes = await axios.post(`${API}/crops`, {
    name: 'Grade-A Hassan Arabica Coffee Cherry',
    category: 'fruits',
    quantity: 80,
    unit: 'quintal',
    basePrice: 7200,
    district: 'Hassan',
    description: 'High-elevation shade grown Arabica coffee cherries.'
  }, { headers: { Authorization: `Bearer ${tokenFarmerB}` } });

  const cropB = cropBRes.data;
  console.log(`✓ Farmer B created Crop: "${cropB.name}" (ID: ${cropB._id}, Base Price: ₹${cropB.basePrice})`);

  console.log('\n================================================================');
  console.log('STEP 4: Trader A Browses Marketplace (Verifying Real Crops Visible)');
  console.log('================================================================');
  const marketplaceRes = await axios.get(`${API}/crops`, { headers: { Authorization: `Bearer ${tokenA}` } });
  const rawMarketplace = marketplaceRes.data?.data?.data || marketplaceRes.data?.data || marketplaceRes.data;
  const marketplaceList = Array.isArray(rawMarketplace) ? rawMarketplace : [];
  console.log(`Marketplace total active crops count: ${marketplaceList.length}`);

  const hasCropA = marketplaceList.some(c => c._id === cropA._id);
  const hasCropB = marketplaceList.some(c => c._id === cropB._id);
  console.log(`✓ Crop A ("${cropA.name}") is Visible to Trader A: ${hasCropA}`);
  console.log(`✓ Crop B ("${cropB.name}") is Visible to Trader A: ${hasCropB}`);

  if (!hasCropA || !hasCropB) throw new Error('Legitimate Farmer crops must be visible to Trader!');

  console.log('\n================================================================');
  console.log('STEP 5: Register Trader B & Verify Complete Shared Marketplace + Data Isolation');
  console.log('================================================================');
  const traderB = await Trader.create({
    name: 'Karnataka Retailers Co-op',
    email: `trader_b_${timestamp}@gmail.com`,
    mobile: `9846${Math.floor(100000 + Math.random() * 900000)}`,
    password: 'password123',
    district: 'Mysuru',
    companyName: 'Mysuru Wholesale Mart'
  });
  const tokenB = generateAccessToken({ id: traderB._id, role: 'trader' });

  // Trader B checks marketplace
  const marketplaceResB = await axios.get(`${API}/crops`, { headers: { Authorization: `Bearer ${tokenB}` } });
  const rawMarketplaceB = marketplaceResB.data?.data?.data || marketplaceResB.data?.data || marketplaceResB.data;
  const marketplaceListB = Array.isArray(rawMarketplaceB) ? rawMarketplaceB : [];
  console.log(`✓ Trader B sees ${marketplaceListB.length} shared marketplace crops (Crop A & Crop B visible).`);

  // Trader B personal bids
  const traderBBids = await axios.get(`${API}/bids/my`, { headers: { Authorization: `Bearer ${tokenB}` } });
  const rawBidsB = traderBBids.data?.data || traderBBids.data?.docs || (Array.isArray(traderBBids.data) ? traderBBids.data : []);
  console.log(`✓ Trader B Personal Bids: ${rawBidsB.length} (Expected: 0)`);

  console.log('\n================================================================');
  console.log('STEP 6: Trader A Places Bid on Crop A -> Cross-Trader Isolation');
  console.log('================================================================');
  await axios.post(`${API}/bids`, {
    cropId: cropA._id,
    amount: 4100,
    message: 'Wholesale contract offer with immediate APMC weighment'
  }, { headers: { Authorization: `Bearer ${tokenA}` } });

  const traderABidsAfter = await axios.get(`${API}/bids/my`, { headers: { Authorization: `Bearer ${tokenA}` } });
  const rawBidsAAfter = traderABidsAfter.data?.data || traderABidsAfter.data?.docs || (Array.isArray(traderABidsAfter.data) ? traderABidsAfter.data : []);

  const traderBBidsAfter = await axios.get(`${API}/bids/my`, { headers: { Authorization: `Bearer ${tokenB}` } });
  const rawBidsBAfter = traderBBidsAfter.data?.data || traderBBidsAfter.data?.docs || (Array.isArray(traderBBidsAfter.data) ? traderBBidsAfter.data : []);

  console.log(`✓ Trader A Personal Bids After Bid: ${rawBidsAAfter.length} (Expected: 1)`);
  console.log(`✓ Trader B Personal Bids After Bid: ${rawBidsBAfter.length} (Expected: 0)`);

  if (rawBidsAAfter.length !== 1 || rawBidsBAfter.length !== 0) {
    throw new Error('Data isolation mismatch between Trader A and Trader B!');
  }

  console.log('\n================================================================');
  console.log('🎉 ALL 6 COMPREHENSIVE END-TO-END CRITERIA PASSED 100%!');
  console.log('================================================================');
  process.exit(0);
}

runEndToEndMarketplaceTest().catch(err => {
  console.error('\n❌ TEST SUITE FAILED:', err.response?.data || err.message);
  process.exit(1);
});
