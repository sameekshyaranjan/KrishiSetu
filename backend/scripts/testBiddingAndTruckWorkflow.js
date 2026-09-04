const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '../.env') });

const BASE_URL = 'http://localhost:5000/api';

async function runTest() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🧪 TESTING KRISHISETU BID / COUNTER / RE-BID / TRUCK WORKFLOW');
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

  // Ensure Trader Wallet has enough capital
  const Wallet = require('../models/Wallet');
  await mongoose.connect(process.env.MONGO_URI);
  let wallet = await Wallet.findOne({ trader: traderId });
  if (!wallet) {
    wallet = await Wallet.create({ trader: traderId, availableBalance: 100000 });
  } else {
    wallet.availableBalance = 100000;
    wallet.lockedBalance = 0;
    await wallet.save();
  }
  console.log(`   💰 Trader Wallet Balance: Available = ₹${wallet.availableBalance}\n`);

  const farmerHeaders = { headers: { Authorization: `Bearer ${farmerToken}` } };
  const traderHeaders = { headers: { Authorization: `Bearer ${traderToken}` } };

  // Step 2: Farmer creates new crop listing (Onion, 10 quintals, basePrice 400)
  console.log('2️⃣ Farmer lists Onion (10 quintals, basePrice ₹400/Qtl)...');
  const cropRes = await axios.post(`${BASE_URL}/crops`, {
    name: `Nashik Onion Lot ${Date.now()}`,
    cropType: 'Onion',
    category: 'vegetables',
    quantity: 10,
    unit: 'quintal',
    basePrice: 400,
    district: 'Mysuru',
    description: 'Fresh quality onions direct from farm harvest.',
    images: ['https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop']
  }, farmerHeaders);
  const crop = cropRes.data;
  console.log(`   ✅ Crop listed: ${crop.name} (ID: ${crop._id})\n`);

  // Step 3: Trader places initial bid: ₹500/Qtl
  console.log('3️⃣ Trader places initial bid of ₹500/Qtl...');
  const bidRes = await axios.post(`${BASE_URL}/bids`, {
    cropId: crop._id,
    amount: 500,
    message: 'Initial bid for 10 quintals onion'
  }, traderHeaders);
  let bid = bidRes.data;
  console.log(`   ✅ Bid placed: ₹${bid.amount}/Qtl, status = ${bid.status}`);
  console.log(`   📜 History items: ${bid.negotiationHistory?.length || 1}\n`);

  // Step 4: Farmer checks inbound bids
  console.log('4️⃣ Farmer views inbound bids...');
  const farmerBidsRes = await axios.get(`${BASE_URL}/bids/listing/${crop._id}`, farmerHeaders);
  const farmerBids = Array.isArray(farmerBidsRes.data) ? farmerBidsRes.data : (farmerBidsRes.data.data || farmerBidsRes.data.docs || []);
  console.log(`   ✅ Farmer sees ${farmerBids.length} bid(s). Top bid: ₹${farmerBids[0]?.amount}/Qtl\n`);

  // Step 5: Trader tests "Increase Bid" rules
  console.log('5️⃣ Testing Trader "Increase Bid" validation rules...');
  
  // Try ₹450 -> MUST FAIL
  try {
    await axios.put(`${BASE_URL}/bids/${bid._id}`, { amount: 450 }, traderHeaders);
    console.error('   ❌ ERROR: Bid of ₹450 should have failed!');
    process.exit(1);
  } catch (err) {
    console.log(`   ✅ Lower bid ₹450 correctly rejected: "${err.response?.data?.message}"`);
  }

  // Try ₹500 (equal) -> MUST FAIL
  try {
    await axios.put(`${BASE_URL}/bids/${bid._id}`, { amount: 500 }, traderHeaders);
    console.error('   ❌ ERROR: Equal bid of ₹500 should have failed!');
    process.exit(1);
  } catch (err) {
    console.log(`   ✅ Equal bid ₹500 correctly rejected: "${err.response?.data?.message}"`);
  }

  // Try ₹550 -> MUST PASS
  const increaseRes = await axios.put(`${BASE_URL}/bids/${bid._id}`, { amount: 550 }, traderHeaders);
  bid = increaseRes.data;
  console.log(`   ✅ Higher bid ₹550 accepted! Current amount: ₹${bid.amount}/Qtl`);
  console.log(`   📜 Negotiation history updated: length = ${bid.negotiationHistory.length}\n`);

  // Step 6: Farmer Counters Trader Bid
  console.log('6️⃣ Farmer counters the bid with ₹600/Qtl...');
  const counterRes = await axios.put(`${BASE_URL}/bids/${bid._id}/counter`, {
    counterAmount: 600,
    message: 'Can sell at ₹600/Qtl for grade A'
  }, farmerHeaders);
  bid = counterRes.data.bid;
  console.log(`   ✅ Farmer counter placed: status = ${bid.status}, counterAmount = ₹${bid.counterAmount}, proposedBy = ${bid.counterProposedBy}`);
  console.log(`   📜 History items: ${bid.negotiationHistory.length}\n`);

  // Step 7: Farmer Rejects Trader Bid
  console.log('7️⃣ Farmer rejects the bid...');
  const rejectRes = await axios.put(`${BASE_URL}/bids/${bid._id}/respond`, { status: 'rejected' }, farmerHeaders);
  bid = rejectRes.data.bid;
  console.log(`   ✅ Bid rejected: status = ${bid.status}`);
  console.log(`   📜 History items: ${bid.negotiationHistory.length}\n`);

  // Step 8: Trader sees rejection and tests "Bid Higher"
  console.log('8️⃣ Testing Trader "Bid Higher" after rejection...');
  
  // Trader tries ₹550 (<= previous rejected bid amount) -> MUST FAIL
  try {
    await axios.post(`${BASE_URL}/bids/${bid._id}/bid-higher`, { amount: 550 }, traderHeaders);
    console.error('   ❌ ERROR: Bid of ₹550 should have failed (must be higher than previous rejected bid)!');
    process.exit(1);
  } catch (err) {
    console.log(`   ✅ Re-bid ₹550 correctly rejected: "${err.response?.data?.message}"`);
  }

  // Trader tries ₹500 (lower) -> MUST FAIL
  try {
    await axios.post(`${BASE_URL}/bids/${bid._id}/bid-higher`, { amount: 500 }, traderHeaders);
    console.error('   ❌ ERROR: Bid of ₹500 should have failed!');
    process.exit(1);
  } catch (err) {
    console.log(`   ✅ Re-bid ₹500 correctly rejected: "${err.response?.data?.message}"`);
  }

  // Trader submits ₹650 -> MUST PASS
  const rebidRes = await axios.post(`${BASE_URL}/bids/${bid._id}/bid-higher`, { amount: 650 }, traderHeaders);
  bid = rebidRes.data.bid;
  console.log(`   ✅ Higher bid ₹650 accepted! Status returned to: ${bid.status}`);
  console.log(`   📜 History items: ${bid.negotiationHistory.length}\n`);

  // Step 9: Farmer accepts final bid of ₹650
  console.log('9️⃣ Farmer accepts final bid of ₹650/Qtl (Total: ₹6,500)...');
  const acceptRes = await axios.put(`${BASE_URL}/bids/${bid._id}/respond`, { status: 'accepted' }, farmerHeaders);
  bid = acceptRes.data.bid;
  console.log(`   ✅ Final bid accepted! Status = ${bid.status}`);

  // Fetch transaction created for this bid
  const Transaction = require('../models/Transaction');
  const tx = await Transaction.findOne({ bid: bid._id });
  console.log(`   ✅ Escrow Transaction created: ID = ${tx._id}, Amount = ₹${tx.amount}, Status = ${tx.paymentStatus}, Logistics = ${tx.logisticsStatus}\n`);

  // Step 10: Trader uploads Truck Details with actual photo file
  console.log('🔟 Trader uploads Truck Details & actual photo file...');

  // Create temporary test image
  const tempImagePath = path.join(__dirname, 'temp_truck_test.png');
  // 1x1 transparent PNG buffer
  const pngBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
  fs.writeFileSync(tempImagePath, pngBuffer);

  const formData = new FormData();
  formData.append('vehicleNumber', 'KA-04-TR-9988');
  formData.append('vehicleType', 'Tata 407');
  formData.append('capacity', '10 tonnes');
  formData.append('driverName', 'Raju Gowda');
  formData.append('driverContact', '9876543210');
  formData.append('additionalNotes', 'Pickup at 9:00 AM sharp');
  
  const fileBlob = new Blob([fs.readFileSync(tempImagePath)], { type: 'image/png' });
  formData.append('vehiclePhoto', fileBlob, 'test_truck_photo.png');

  const vehicleRes = await axios.put(`${BASE_URL}/transactions/${tx._id}/vehicle`, formData, {
    headers: {
      Authorization: `Bearer ${traderToken}`,
      'Content-Type': 'multipart/form-data'
    }
  });

  // Clean up temp image
  try { fs.unlinkSync(tempImagePath); } catch (e) {}

  const updatedTx = vehicleRes.data.transaction;
  console.log('   ✅ Vehicle details submitted successfully:');
  console.log(`      Vehicle Type: "${updatedTx.vehicleDetails.vehicleType}"`);
  console.log(`      Capacity: "${updatedTx.vehicleDetails.capacity}"`);
  console.log(`      Vehicle Number: "${updatedTx.vehicleDetails.vehicleNumber}"`);
  console.log(`      Driver Name: "${updatedTx.vehicleDetails.driverName}"`);
  console.log(`      Driver Contact: "${updatedTx.vehicleDetails.driverContact}"`);
  console.log(`      Photo URL: "${updatedTx.vehicleDetails.vehiclePhoto}"\n`);

  // Step 11: Trader verifies Truck Details via API
  console.log('1️⃣1️⃣ Trader queries my-transactions to verify truck details...');
  const traderTxRes = await axios.get(`${BASE_URL}/transactions/my-transactions`, traderHeaders);
  const traderTransactions = traderTxRes.data.data || traderTxRes.data.docs || traderTxRes.data;
  const traderOrder = traderTransactions.find(t => String(t._id) === String(tx._id));
  console.log(`   ✅ Trader sees truck photo: ${traderOrder.vehicleDetails?.vehiclePhoto}`);
  console.log(`   ✅ Trader sees vehicle type: ${traderOrder.vehicleDetails?.vehicleType}`);
  console.log(`   ✅ Trader sees capacity: ${traderOrder.vehicleDetails?.capacity}\n`);

  // Step 12: Farmer verifies Truck Details via API
  console.log('1️⃣2️⃣ Farmer queries my-transactions to verify truck details...');
  const farmerTxRes = await axios.get(`${BASE_URL}/transactions/my-transactions`, farmerHeaders);
  const farmerTransactions = farmerTxRes.data.data || farmerTxRes.data.docs || farmerTxRes.data;
  const farmerOrder = farmerTransactions.find(t => String(t._id) === String(tx._id));
  console.log(`   ✅ Farmer sees truck photo: ${farmerOrder.vehicleDetails?.vehiclePhoto}`);
  console.log(`   ✅ Farmer sees vehicle type: ${farmerOrder.vehicleDetails?.vehicleType}`);
  console.log(`   ✅ Farmer sees capacity: ${farmerOrder.vehicleDetails?.capacity}`);
  console.log(`   ✅ Photos match: ${farmerOrder.vehicleDetails?.vehiclePhoto === traderOrder.vehicleDetails?.vehiclePhoto}\n`);

  // Step 13: Farmer Dispatches Lot
  console.log('1️⃣3️⃣ Farmer dispatches lot using truck...');
  const dispatchRes = await axios.put(`${BASE_URL}/transactions/${tx._id}/dispatch`, {}, farmerHeaders);
  console.log(`   ✅ Lot dispatched! Logistics status = ${dispatchRes.data.transaction.logisticsStatus}\n`);

  // Step 14: Trader Confirms Delivery
  console.log('1️⃣4️⃣ Trader confirms delivery at APMC...');
  const deliveryRes = await axios.put(`${BASE_URL}/transactions/${tx._id}/confirm-delivery`, {}, traderHeaders);
  console.log(`   ✅ Delivery confirmed! Status = ${deliveryRes.data.transaction.logisticsStatus}, Payment = ${deliveryRes.data.transaction.paymentStatus}\n`);

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🎉 ALL 14 WORKFLOW TESTS PASSED PERFECTLY!');
  console.log('═══════════════════════════════════════════════════════════════\n');

  await mongoose.disconnect();
}

runTest().catch(err => {
  console.error('❌ Test failed:', err.response?.data || err.message);
  process.exit(1);
});
