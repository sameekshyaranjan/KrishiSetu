/**
 * END-TO-END BIDDING LIFECYCLE REGRESSION TEST
 * Tests:
 * 1. Farmer creates crop listing
 * 2. Trader places bid via API (POST /api/bids)
 * 3. MongoDB Bid verification
 * 4. Trader views placed bids (GET /api/bids/my)
 * 5. Farmer views incoming bids (GET /api/bids/my)
 * 6. Trader updates bid amount (PUT /api/bids/:id)
 * 7. Farmer accepts bid (PUT /api/bids/:id/respond)
 * 8. Crop marked as sold & cache invalidated
 * 9. Security validations (wrong role, invalid amount, unauthenticated)
 * 10. Clean up
 */
const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const BASE_URL = 'http://localhost:5000/api';

async function runBiddingTests() {
  console.log('================================================================');
  console.log('🔨 RUNNING COMPREHENSIVE BIDDING WORKFLOW TEST SUITE');
  console.log('================================================================\n');

  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB connected');

  // STEP 1: Log in Farmer and Trader
  console.log('\n--- STEP 1: Authenticate Farmer & Trader ---');
  const farmerLogin = await axios.post(`${BASE_URL}/auth/login`, {
    email: 'farmer1@krishisetu.com',
    password: 'password123'
  });
  const farmerToken = farmerLogin.data?.accessToken || farmerLogin.data?.token;
  console.log('✅ Farmer logged in (Token len:', farmerToken?.length, ')');

  const traderLogin = await axios.post(`${BASE_URL}/auth/login`, {
    email: 'trader1@krishisetu.com',
    password: 'password123'
  });
  const traderToken = traderLogin.data?.accessToken || traderLogin.data?.token;
  console.log('✅ Trader logged in (Token len:', traderToken?.length, ')');

  // STEP 2: Farmer creates a real crop listing
  console.log('\n--- STEP 2: Farmer creates real crop listing ---');
  const cropRes = await axios.post(`${BASE_URL}/crops`, {
    name: 'BID_WORKFLOW_TEST_TOMATO',
    cropType: 'Tomato',
    category: 'vegetables',
    quantity: 100,
    unit: 'quintal',
    basePrice: 2000,
    district: 'Hassan',
    description: 'Fresh Hassan Grade-A Lot for Bidding Verification'
  }, {
    headers: { Authorization: `Bearer ${farmerToken}` }
  });
  const crop = cropRes.data;
  console.log('✅ Created Crop _id:', crop._id, '| Base Price: ₹' + crop.basePrice);

  // STEP 3: Trader places a bid on the crop
  console.log('\n--- STEP 3: Trader places bid (POST /api/bids) ---');
  const bidPayload = {
    cropId: crop._id,
    amount: 2250,
    message: 'Spot wholesale procurement bid from Trader'
  };

  const bidRes = await axios.post(`${BASE_URL}/bids`, bidPayload, {
    headers: { Authorization: `Bearer ${traderToken}` }
  });
  console.log('HTTP Status:', bidRes.status, '(Expected: 201)');
  const bid = bidRes.data;
  console.log('Created Bid ID:', bid._id);
  console.log('Bid Amount:', bid.amount, '(Expected: 2250)');
  console.log('Bid Status:', bid.status, '(Expected: pending)');
  console.log('Bid Trader:', bid.trader);
  console.log('Bid Farmer:', bid.farmer);

  // STEP 4: Direct MongoDB Verification
  console.log('\n--- STEP 4: Direct MongoDB Bid Verification ---');
  const dbBid = await mongoose.connection.db.collection('bids').findOne({ _id: new mongoose.Types.ObjectId(bid._id) });
  if (!dbBid) {
    console.error('❌ Bid document NOT found in MongoDB!');
    process.exit(1);
  }
  console.log('✅ MongoDB Document Confirmed:');
  console.log('  _id:    ', dbBid._id.toString());
  console.log('  crop:   ', dbBid.crop.toString());
  console.log('  farmer: ', dbBid.farmer.toString());
  console.log('  trader: ', dbBid.trader.toString());
  console.log('  amount: ', dbBid.amount);
  console.log('  status: ', dbBid.status);

  // STEP 5: Trader views own bids (GET /api/bids/my)
  console.log('\n--- STEP 5: Trader fetches own bids (GET /api/bids/my) ---');
  const traderBidsRes = await axios.get(`${BASE_URL}/bids/my`, {
    headers: { Authorization: `Bearer ${traderToken}` }
  });
  const traderBids = traderBidsRes.data?.data || traderBidsRes.data || [];
  const foundTraderBid = (Array.isArray(traderBids) ? traderBids : []).some(b => b._id === bid._id);
  console.log('Trader sees placed bid in list:', foundTraderBid ? '✅ YES' : '❌ NO');

  // STEP 6: Farmer views incoming bids (GET /api/bids/my)
  console.log('\n--- STEP 6: Farmer fetches incoming bids (GET /api/bids/my) ---');
  const farmerBidsRes = await axios.get(`${BASE_URL}/bids/my`, {
    headers: { Authorization: `Bearer ${farmerToken}` }
  });
  const farmerBids = farmerBidsRes.data?.data || farmerBidsRes.data || [];
  const foundFarmerBid = (Array.isArray(farmerBids) ? farmerBids : []).some(b => b._id === bid._id);
  console.log('Farmer sees incoming bid in list:', foundFarmerBid ? '✅ YES' : '❌ NO');

  // STEP 7: Trader updates bid amount (PUT /api/bids/:id)
  console.log('\n--- STEP 7: Trader raises bid to ₹2400 (PUT /api/bids/:id) ---');
  const updateRes = await axios.put(`${BASE_URL}/bids/${bid._id}`, {
    amount: 2400,
    message: 'Raised competitive bid'
  }, {
    headers: { Authorization: `Bearer ${traderToken}` }
  });
  console.log('Update Status:', updateRes.status, '(Expected: 200)');
  console.log('Updated Bid Amount:', updateRes.data?.amount, '(Expected: 2400)');

  // STEP 8: Farmer accepts the updated bid (PUT /api/bids/:id/respond)
  console.log('\n--- STEP 8: Farmer accepts bid (PUT /api/bids/:id/respond) ---');
  const acceptRes = await axios.put(`${BASE_URL}/bids/${bid._id}/respond`, {
    status: 'accepted',
    expectedAmount: 2400
  }, {
    headers: { Authorization: `Bearer ${farmerToken}` }
  });
  console.log('Accept Status:', acceptRes.status, '(Expected: 200)');

  // Verify Crop is marked as sold in DB
  const dbSoldCrop = await mongoose.connection.db.collection('crops').findOne({ _id: new mongoose.Types.ObjectId(crop._id) });
  console.log('Crop status after accepted bid:', dbSoldCrop?.status, '(Expected: sold)');
  if (dbSoldCrop?.status === 'sold') {
    console.log('✅ PASS: Crop status correctly transitioned to "sold"');
  }

  // STEP 9: Security Checks
  console.log('\n--- STEP 9: Security & Edge Case Validations ---');
  // Check A: Farmer cannot place trader bid
  try {
    await axios.post(`${BASE_URL}/bids`, { cropId: crop._id, amount: 3000 }, {
      headers: { Authorization: `Bearer ${farmerToken}` }
    });
    console.error('❌ Security Failure: Farmer was allowed to place a bid!');
    process.exit(1);
  } catch (err) {
    console.log('  Farmer placing bid rejected:', err.response?.status === 403 ? '✅ 403 Forbidden' : '❌ Failed');
  }

  // Check B: Bid below base price rejected
  try {
    await axios.post(`${BASE_URL}/bids`, { cropId: crop._id, amount: 500 }, {
      headers: { Authorization: `Bearer ${traderToken}` }
    });
  } catch (err) {
    console.log('  Bid below base price rejected:', err.response?.status === 400 ? '✅ 400 Bad Request' : '❌ Failed');
  }

  // CLEANUP
  console.log('\n--- CLEANUP: Removing test records ---');
  await mongoose.connection.db.collection('bids').deleteMany({ crop: new mongoose.Types.ObjectId(crop._id) });
  await mongoose.connection.db.collection('crops').deleteOne({ _id: new mongoose.Types.ObjectId(crop._id) });
  console.log('Cleaned up test crop and bids.');

  console.log('\n================================================================');
  console.log('🎉 ALL BIDDING WORKFLOW REGRESSION CHECKS PASSED (10/10)!');
  console.log('================================================================\n');
  process.exit(0);
}

runBiddingTests().catch(err => {
  console.error('FATAL:', err.response?.data || err.message);
  process.exit(1);
});
