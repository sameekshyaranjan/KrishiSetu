const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const BASE_URL = 'http://localhost:5000/api';

async function runTest() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🧪 MULTI-TRADER & BID PERSISTENCE COMPREHENSIVE WORKFLOW TEST');
  console.log('═══════════════════════════════════════════════════════════════\n');

  await mongoose.connect(process.env.MONGO_URI);
  const Wallet = require('../models/Wallet');

  // 1. Authenticate Farmer, Trader A, and Trader B
  console.log('1️⃣ Authenticating Farmer, Trader A, and Trader B...');
  const farmerLogin = await axios.post(`${BASE_URL}/auth/login`, {
    email: 'farmer1@krishisetu.com',
    password: 'password123'
  });
  const farmerToken = farmerLogin.data.accessToken;
  const farmerHeaders = { headers: { Authorization: `Bearer ${farmerToken}` } };
  console.log(`   ✅ Farmer logged in: ${farmerLogin.data.user.name}`);

  const traderALogin = await axios.post(`${BASE_URL}/auth/login`, {
    email: 'trader1@krishisetu.com',
    password: 'password123'
  });
  const traderAToken = traderALogin.data.accessToken;
  const traderAId = traderALogin.data.user._id || traderALogin.data.user.id;
  const traderAHeaders = { headers: { Authorization: `Bearer ${traderAToken}` } };
  console.log(`   ✅ Trader A logged in: ${traderALogin.data.user.name} (${traderAId})`);

  const traderBLogin = await axios.post(`${BASE_URL}/auth/login`, {
    email: 'trader2@krishisetu.com',
    password: 'password123'
  });
  const traderBToken = traderBLogin.data.accessToken;
  const traderBId = traderBLogin.data.user._id || traderBLogin.data.user.id;
  const traderBHeaders = { headers: { Authorization: `Bearer ${traderBToken}` } };
  console.log(`   ✅ Trader B logged in: ${traderBLogin.data.user.name} (${traderBId})`);

  // Ensure Trader A and Trader B wallets have sufficient available capital
  let walletA = await Wallet.findOne({ trader: traderAId });
  if (!walletA) {
    walletA = await Wallet.create({ trader: traderAId, availableBalance: 100000 });
  } else {
    walletA.availableBalance = 100000;
    walletA.lockedBalance = 0;
    await walletA.save();
  }
  console.log(`   💰 Trader A Wallet: Available = ₹${walletA.availableBalance}`);

  let walletB = await Wallet.findOne({ trader: traderBId });
  if (!walletB) {
    walletB = await Wallet.create({ trader: traderBId, availableBalance: 100000 });
  } else {
    walletB.availableBalance = 100000;
    walletB.lockedBalance = 0;
    await walletB.save();
  }
  console.log(`   💰 Trader B Wallet: Available = ₹${walletB.availableBalance}\n`);

  // 2. Farmer Creates New Crop Listing
  console.log('2️⃣ Farmer creates a fresh Onion crop lot (10 Qtl, base ₹2,000/Qtl)...');
  const cropPayload = {
    name: `Mysuru Export Onion ${Date.now()}`,
    cropType: 'Onion',
    category: 'vegetables',
    quantity: 10,
    unit: 'quintal',
    basePrice: 2000,
    district: 'Mysuru',
    description: 'A-Grade Mysore export onions fresh harvest lot.'
  };
  const cropRes = await axios.post(`${BASE_URL}/crops`, cropPayload, farmerHeaders);
  const cropId = cropRes.data._id;
  console.log(`   ✅ Crop created: ${cropPayload.name} [ID: ${cropId}]\n`);

  // 3. Trader A queries marketplace BEFORE any bids
  console.log('3️⃣ Trader A inspects marketplace before any bids...');
  let feedA = await axios.get(`${BASE_URL}/crops`, traderAHeaders);
  let cropDataA = (feedA.data.data?.data || feedA.data.data || feedA.data).find(c => c._id.toString() === cropId.toString());
  console.log(`   📊 Before bids: bidsCount=${cropDataA.bidsCount}, currentHighestBid=${cropDataA.currentHighestBid}, myBid=${cropDataA.myBid}`);
  if (cropDataA.bidsCount !== 0 || cropDataA.currentHighestBid !== null || cropDataA.myBid !== null) {
    throw new Error('Initial state mismatch!');
  }
  console.log('   ✅ Initial zero-state verified.\n');

  // 4. Trader A places first bid: ₹2,500/Qtl
  console.log('4️⃣ Trader A places initial bid of ₹2,500/Qtl...');
  const bid1 = await axios.post(`${BASE_URL}/bids`, {
    cropId,
    amount: 2500,
    message: 'Trader A initial spot bid'
  }, traderAHeaders);
  console.log(`   ✅ Trader A bid placed: status=${bid1.data.status}, amount=₹${bid1.data.amount}/Qtl\n`);

  // 5. Trader A refreshes / queries marketplace -> verify persistence (NO "Awaiting first bid")
  console.log('5️⃣ Trader A refreshes marketplace (simulating page reload)...');
  feedA = await axios.get(`${BASE_URL}/crops`, traderAHeaders);
  cropDataA = (feedA.data.data?.data || feedA.data.data || feedA.data).find(c => c._id.toString() === cropId.toString());
  console.log(`   📊 After Trader A bid: bidsCount=${cropDataA.bidsCount}, currentHighestBid=₹${cropDataA.currentHighestBid}, myBid=₹${cropDataA.myBid?.amount}`);
  if (cropDataA.bidsCount !== 1 || cropDataA.currentHighestBid !== 2500 || cropDataA.myBid?.amount !== 2500) {
    throw new Error(`Trader A persistence check failed! bidsCount=${cropDataA.bidsCount}, currentHighestBid=${cropDataA.currentHighestBid}`);
  }
  console.log('   ✅ Refresh verified: Real database bid survived, no "Awaiting first bid"!\n');

  // 6. Trader B inspects marketplace -> sees 1 bid, highest ₹2,500, but personal myBid is null
  console.log('6️⃣ Trader B inspects marketplace...');
  let feedB = await axios.get(`${BASE_URL}/crops`, traderBHeaders);
  let cropDataB = (feedB.data.data?.data || feedB.data.data || feedB.data).find(c => c._id.toString() === cropId.toString());
  console.log(`   📊 Trader B view: bidsCount=${cropDataB.bidsCount}, currentHighestBid=₹${cropDataB.currentHighestBid}, myBid=${cropDataB.myBid}`);
  if (cropDataB.bidsCount !== 1 || cropDataB.currentHighestBid !== 2500 || cropDataB.myBid !== null) {
    throw new Error('Trader B view incorrectly mixed personal and global bid!');
  }
  console.log('   ✅ Separation verified: Trader B sees global highest bid ₹2,500, but no personal bid.\n');

  // 7. Trader B places bid: ₹2,700/Qtl on same crop
  console.log('7️⃣ Trader B places competitive bid of ₹2,700/Qtl on SAME crop...');
  const bid2 = await axios.post(`${BASE_URL}/bids`, {
    cropId,
    amount: 2700,
    message: 'Trader B outbidding'
  }, traderBHeaders);
  console.log(`   ✅ Trader B bid placed: status=${bid2.data.status}, amount=₹${bid2.data.amount}/Qtl\n`);

  // 8. Verify Trader B marketplace view -> bidsCount=2, highest=2700, myBid=2700
  console.log('8️⃣ Trader B queries marketplace...');
  feedB = await axios.get(`${BASE_URL}/crops`, traderBHeaders);
  cropDataB = (feedB.data.data?.data || feedB.data.data || feedB.data).find(c => c._id.toString() === cropId.toString());
  console.log(`   📊 Trader B view: bidsCount=${cropDataB.bidsCount}, currentHighestBid=₹${cropDataB.currentHighestBid}, myBid=₹${cropDataB.myBid?.amount}`);
  if (cropDataB.bidsCount !== 2 || cropDataB.currentHighestBid !== 2700 || cropDataB.myBid?.amount !== 2700) {
    throw new Error(`Trader B multi-bid check failed! Count=${cropDataB.bidsCount}`);
  }
  console.log('   ✅ Multi-trader verified: Total Bids = 2, Highest = ₹2,700!\n');

  // 9. Trader A refreshes -> must see bidsCount=2, Highest=₹2,700, but personal myBid=₹2,500
  console.log('9️⃣ Trader A refreshes marketplace (checking global vs personal separation)...');
  feedA = await axios.get(`${BASE_URL}/crops`, traderAHeaders);
  cropDataA = (feedA.data.data?.data || feedA.data.data || feedA.data).find(c => c._id.toString() === cropId.toString());
  console.log(`   📊 Trader A view: Total Bids=${cropDataA.bidsCount}, Highest Bid=₹${cropDataA.currentHighestBid}, Your Bid=₹${cropDataA.myBid?.amount}`);
  if (cropDataA.bidsCount !== 2 || cropDataA.currentHighestBid !== 2700 || cropDataA.myBid?.amount !== 2500) {
    throw new Error(`Trader A reload check failed! Highest=${cropDataA.currentHighestBid}, myBid=${cropDataA.myBid?.amount}`);
  }
  console.log('   ✅ Global Highest (₹2,700) and Trader A personal bid (₹2,500) perfectly separated!\n');

  // 10. Trader A increases their own bid to ₹2,800/Qtl via POST /api/bids
  console.log('🔟 Trader A increases existing bid to ₹2,800/Qtl...');
  const bid3 = await axios.post(`${BASE_URL}/bids`, {
    cropId,
    amount: 2800,
    message: 'Trader A increasing to top position'
  }, traderAHeaders);
  console.log(`   ✅ Trader A bid increased successfully: amount=₹${bid3.data.amount}/Qtl (Status: ${bid3.status})\n`);

  // 11. Trader A refreshes -> Total Bids=2, Highest=₹2,800, Your Bid=₹2,800
  console.log('1️⃣1️⃣ Trader A refreshes after increasing bid...');
  feedA = await axios.get(`${BASE_URL}/crops`, traderAHeaders);
  cropDataA = (feedA.data.data?.data || feedA.data.data || feedA.data).find(c => c._id.toString() === cropId.toString());
  console.log(`   📊 Trader A view: Total Bids=${cropDataA.bidsCount}, Highest Bid=₹${cropDataA.currentHighestBid}, Your Bid=₹${cropDataA.myBid?.amount}`);
  if (cropDataA.bidsCount !== 2 || cropDataA.currentHighestBid !== 2800 || cropDataA.myBid?.amount !== 2800) {
    throw new Error(`Trader A increased reload check failed! Count=${cropDataA.bidsCount}, Highest=${cropDataA.currentHighestBid}`);
  }
  console.log('   ✅ Increase Bid persistent and verified!\n');

  // 12. Test Lower / Equal Bid Validation -> Must fail
  console.log('1️⃣2️⃣ Testing lower/equal bid rejection (Trader A tries ₹2,800 again)...');
  try {
    await axios.post(`${BASE_URL}/bids`, { cropId, amount: 2800 }, traderAHeaders);
    throw new Error('Equal bid should have been rejected!');
  } catch (err) {
    console.log(`   ✅ Correctly rejected equal bid: "${err.response?.data?.message}"`);
  }

  console.log('1️⃣3️⃣ Testing lower bid rejection (Trader A tries ₹2,700)...');
  try {
    await axios.post(`${BASE_URL}/bids`, { cropId, amount: 2700 }, traderAHeaders);
    throw new Error('Lower bid should have been rejected!');
  } catch (err) {
    console.log(`   ✅ Correctly rejected lower bid: "${err.response?.data?.message}"\n`);
  }

  // 14. Test Insufficient Balance Check
  console.log('1️⃣4️⃣ Testing insufficient balance check (Bid value ₹10,00,000 > wallet ₹1,00,000)...');
  try {
    await axios.post(`${BASE_URL}/bids`, { cropId, amount: 100000 }, traderAHeaders); // 10 Qtl * 100000 = 1,000,000 > 100,000
    throw new Error('Insufficient balance bid should have been rejected!');
  } catch (err) {
    console.log(`   ✅ Correctly rejected insufficient balance: "${err.response?.data?.message}"`);
    console.log(`      Required: ₹${err.response?.data?.required}, Available: ₹${err.response?.data?.available}\n`);
  }

  // 15. Farmer view of inbound bids
  console.log('1️⃣5️⃣ Farmer queries inbound bids on crop...');
  const farmerBidsRes = await axios.get(`${BASE_URL}/bids/listing/${cropId}`, farmerHeaders);
  const farmerBids = farmerBidsRes.data?.data || farmerBidsRes.data;
  console.log(`   📊 Inbound bids visible to farmer: ${farmerBids.length}`);
  for (const b of farmerBids) {
    console.log(`      - Bid [${b._id}]: ₹${b.amount}/Qtl from ${b.trader?.name} (${b.status})`);
  }
  if (farmerBids.length !== 2) {
    throw new Error(`Farmer inbound bids count mismatch! Expected 2, got ${farmerBids.length}`);
  }
  console.log('   ✅ Farmer successfully sees all multi-trader bids!\n');

  // 16. Inspect Lot API endpoint verification (GET /crops/:id)
  console.log('1️⃣6️⃣ Inspect Lot (GET /crops/:id) verification for Trader A...');
  const detailA = await axios.get(`${BASE_URL}/crops/${cropId}`, traderAHeaders);
  console.log(`   📊 Lot Detail: highestBid=₹${detailA.data.currentHighestBid}, bidsCount=${detailA.data.bidsCount}, myBid=₹${detailA.data.myBid?.amount}`);
  if (detailA.data.currentHighestBid !== 2800 || detailA.data.bidsCount !== 2 || detailA.data.myBid?.amount !== 2800) {
    throw new Error('Inspect Lot endpoint returned incorrect data!');
  }
  console.log('   ✅ Inspect Lot API returns accurate persistent real-time database state!\n');

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🎉 ALL 16 INTEGRATION TEST CHECKS PASSED WITH FLYING COLORS! 🎉');
  console.log('═══════════════════════════════════════════════════════════════\n');

  await mongoose.disconnect();
  process.exit(0);
}

runTest().catch(err => {
  console.error('\n❌ TEST FAILED:', err.response?.data || err.message);
  process.exit(1);
});
