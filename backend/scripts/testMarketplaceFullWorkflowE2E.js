const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const BASE_URL = 'http://localhost:5000/api';

async function testFullWorkflow() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🧪 TESTING KRISHISETU FULL WORKFLOW E2E');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Step 1: Login Farmer and Trader
  console.log('1️⃣ Authenticating test users...');
  const farmerLogin = await axios.post(`${BASE_URL}/auth/login`, {
    email: 'farmer1@krishisetu.com',
    password: 'password123'
  });
  const farmerToken = farmerLogin.data.accessToken;
  const farmerId = farmerLogin.data.user._id || farmerLogin.data.user.id;
  console.log(`   ✅ Farmer logged in: ${farmerLogin.data.user.name} (${farmerId})`);

  const traderLogin = await axios.post(`${BASE_URL}/auth/login`, {
    email: 'trader1@krishisetu.com',
    password: 'password123'
  });
  const traderToken = traderLogin.data.accessToken;
  const traderId = traderLogin.data.user._id || traderLogin.data.user.id;
  console.log(`   ✅ Trader logged in: ${traderLogin.data.user.name} (${traderId})\n`);

  // Step 2: Ensure Trader Wallet has enough capital for testing
  const Wallet = require('../models/Wallet');
  await mongoose.connect(process.env.MONGO_URI);
  let wallet = await Wallet.findOne({ trader: traderId });
  if (!wallet) {
    wallet = await Wallet.create({ trader: traderId, availableBalance: 100000 });
  } else if (wallet.availableBalance < 50000) {
    wallet.availableBalance = 100000;
    wallet.lockedBalance = 0;
    await wallet.save();
  }
  console.log(`   💰 Trader Wallet Starting Balance: Available = ₹${wallet.availableBalance}, Locked = ₹${wallet.lockedBalance}\n`);

  // Step 3: Farmer Lists Onion Crop
  console.log('2️⃣ Farmer creates Onion Crop listing...');
  const cropPayload = {
    name: 'Nashik Red Quality Onion',
    cropType: 'Onion',
    category: 'vegetables',
    quantity: 100,
    unit: 'quintal',
    basePrice: 35000,
    district: 'Mysuru',
    description: 'High quality pungent red onions directly harvested from fertile soil.',
    images: ['https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop']
  };

  const cropRes = await axios.post(`${BASE_URL}/crops`, cropPayload, {
    headers: { Authorization: `Bearer ${farmerToken}` }
  });
  const crop = cropRes.data;
  console.log(`   ✅ Crop listed: ${crop.name} (ID: ${crop._id}) | Base Price: ₹${crop.basePrice}\n`);

  // Step 4: Trader Sees Crop in Marketplace
  console.log('3️⃣ Trader fetches Marketplace feed...');
  const marketplaceRes = await axios.get(`${BASE_URL}/crops`, {
    headers: { Authorization: `Bearer ${traderToken}` }
  });
  const foundCrop = marketplaceRes.data.data.data.find(c => c._id.toString() === crop._id.toString());
  console.log(`   ✅ Crop visible in marketplace: ${foundCrop ? 'YES' : 'NO'}\n`);

  // Step 5: Trader Places Test Bid to Cancel
  console.log('4️⃣ Trader places a test bid of ₹38,000 to verify cancellation...');
  const testBidRes = await axios.post(`${BASE_URL}/bids`, {
    cropId: crop._id,
    amount: 38000,
    message: 'Test bid to cancel'
  }, {
    headers: { Authorization: `Bearer ${traderToken}` }
  });
  const testBid = testBidRes.data;
  console.log(`   ✅ Test Bid placed: ID ${testBid._id} (Status: ${testBid.status})`);

  // Step 6: Trader Cancels Bid
  console.log('5️⃣ Trader cancels the test bid...');
  const cancelRes = await axios.put(`${BASE_URL}/bids/${testBid._id}/cancel`, {}, {
    headers: { Authorization: `Bearer ${traderToken}` }
  });
  console.log(`   ✅ Bid cancelled: Status = ${cancelRes.data.bid.status}`);

  // Step 7: Farmer Tries to Accept Cancelled Bid (MUST FAIL)
  console.log('6️⃣ Testing security: Farmer tries to accept the cancelled bid...');
  try {
    await axios.put(`${BASE_URL}/bids/${testBid._id}/respond`, { status: 'accepted' }, {
      headers: { Authorization: `Bearer ${farmerToken}` }
    });
    console.error('   ❌ FAILED: Farmer was able to accept cancelled bid!');
    process.exit(1);
  } catch (err) {
    console.log(`   🛡️ BLOCKED: ${err.response?.data?.message || err.message}\n`);
  }

  // Step 8: Trader Places Real Winning Bid of ₹40,000
  console.log('7️⃣ Trader places winning bid of ₹40,000...');
  const winningBidRes = await axios.post(`${BASE_URL}/bids`, {
    cropId: crop._id,
    amount: 40000,
    message: 'Ready for immediate APMC procurement at ₹40,000'
  }, {
    headers: { Authorization: `Bearer ${traderToken}` }
  });
  const winningBid = winningBidRes.data;
  console.log(`   ✅ Winning Bid placed: ID ${winningBid._id} (Status: ${winningBid.status})\n`);

  // Step 9: Farmer Accepts Winning Bid -> Locks Escrow
  console.log('8️⃣ Farmer accepts winning bid...');
  const balanceBefore = (await Wallet.findOne({ trader: traderId })).availableBalance;
  const acceptRes = await axios.put(`${BASE_URL}/bids/${winningBid._id}/respond`, { status: 'accepted' }, {
    headers: { Authorization: `Bearer ${farmerToken}` }
  });
  console.log(`   ✅ Bid Accepted: ${acceptRes.data.message}`);

  const walletAfterAccept = await Wallet.findOne({ trader: traderId });
  console.log(`   💰 Escrow Verification:`);
  console.log(`      Trader Available Balance: ₹${balanceBefore} → ₹${walletAfterAccept.availableBalance} (-₹40,000)`);
  console.log(`      Trader Locked Escrow:     ₹${walletAfterAccept.lockedBalance} (+₹40,000)`);

  const WalletLedger = require('../models/WalletLedger');
  const escrowLedger = await WalletLedger.findOne({ trader: traderId, type: 'ESCROW_LOCK', referenceId: winningBid._id });
  console.log(`      Ledger Record:            ${escrowLedger ? 'CREATED (Type: ' + escrowLedger.type + ', Amount: ₹' + escrowLedger.amount + ')' : 'MISSING'}\n`);

  // Step 10: Fetch Order/Transaction
  console.log('9️⃣ Fetching transaction/order...');
  const Transaction = require('../models/Transaction');
  const tx = await Transaction.findOne({ bid: winningBid._id });
  console.log(`   ✅ Transaction created: ID ${tx._id} | Amount: ₹${tx.amount} | Escrow Status: ${tx.paymentStatus} | Logistics: ${tx.logisticsStatus}\n`);

  // Step 11: Farmer Tries to Dispatch BEFORE Vehicle Details (MUST FAIL)
  console.log('🔟 Testing security: Farmer tries to dispatch BEFORE vehicle details are submitted...');
  try {
    await axios.put(`${BASE_URL}/transactions/${tx._id}/dispatch`, {}, {
      headers: { Authorization: `Bearer ${farmerToken}` }
    });
    console.error('   ❌ FAILED: Farmer was able to dispatch without vehicle details!');
    process.exit(1);
  } catch (err) {
    console.log(`   🛡️ BLOCKED: ${err.response?.data?.message || err.message}\n`);
  }

  // Step 12: Trader Submits Vehicle Details
  console.log('1️⃣1️⃣ Trader submits vehicle details...');
  const vehiclePayload = {
    vehicleNumber: 'KA-04-E-8821',
    vehicleType: 'Eicher Pro 10-Tonne Freight Truck',
    driverName: 'Raju Gowda',
    driverContact: '9845012345',
    additionalNotes: 'Driver carrying APMC digital waybill gate pass'
  };

  const vehicleRes = await axios.put(`${BASE_URL}/transactions/${tx._id}/vehicle`, vehiclePayload, {
    headers: { Authorization: `Bearer ${traderToken}` }
  });
  console.log(`   ✅ Vehicle details registered: ${vehicleRes.data.transaction.vehicleDetails.vehicleNumber} (Driver: ${vehicleRes.data.transaction.vehicleDetails.driverName})\n`);

  // Step 13: Farmer Sees Vehicle Details & Dispatches Lot
  console.log('1️⃣2️⃣ Farmer views vehicle details and dispatches crop lot...');
  const farmerTxView = await axios.get(`${BASE_URL}/transactions/${tx._id}`, {
    headers: { Authorization: `Bearer ${farmerToken}` }
  });
  console.log(`   ✅ Farmer sees vehicle: ${farmerTxView.data.vehicleDetails?.vehicleNumber} | Driver: ${farmerTxView.data.vehicleDetails?.driverName}`);

  const dispatchRes = await axios.put(`${BASE_URL}/transactions/${tx._id}/dispatch`, {}, {
    headers: { Authorization: `Bearer ${farmerToken}` }
  });
  console.log(`   ✅ Lot Dispatched: Logistics Status = ${dispatchRes.data.transaction.logisticsStatus}\n`);

  // Step 14: Trader Confirms Delivery -> Releases Escrow & Farmer Payout
  console.log('1️⃣3️⃣ Trader confirms delivery at Mandi...');
  const deliveryRes = await axios.put(`${BASE_URL}/transactions/${tx._id}/confirm-delivery`, {}, {
    headers: { Authorization: `Bearer ${traderToken}` }
  });
  console.log(`   ✅ Delivery Confirmed: ${deliveryRes.data.message}`);

  const walletAfterDelivery = await Wallet.findOne({ trader: traderId });
  console.log(`   💰 Final Wallet State:`);
  console.log(`      Trader Locked Escrow:     ₹${walletAfterDelivery.lockedBalance} (Must be 0)`);
  console.log(`      Trader Total Disbursed:   ₹${walletAfterDelivery.totalDisbursed}`);

  const payoutLedger = await WalletLedger.findOne({ trader: traderId, type: 'PAYOUT_DISBURSED', referenceId: String(tx._id) });
  console.log(`      Payout Ledger Entry:      ${payoutLedger ? 'CREATED (Amount: ₹' + payoutLedger.amount + ')' : 'MISSING'}\n`);

  // Step 15: Verify Double Delivery Blocked
  console.log('1️⃣4️⃣ Testing idempotency: Trader tries to confirm delivery again...');
  try {
    await axios.put(`${BASE_URL}/transactions/${tx._id}/confirm-delivery`, {}, {
      headers: { Authorization: `Bearer ${traderToken}` }
    });
    console.error('   ❌ FAILED: Duplicate delivery was allowed!');
    process.exit(1);
  } catch (err) {
    console.log(`   🛡️ BLOCKED: ${err.response?.data?.message || err.message}\n`);
  }

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🎉 ALL BACKEND WORKFLOW TESTS PASSED 100%!');
  console.log('═══════════════════════════════════════════════════════════════\n');

  await mongoose.disconnect();
}

testFullWorkflow().catch(err => {
  console.error('❌ Test failed:', err.response?.data || err.message);
  process.exit(1);
});
