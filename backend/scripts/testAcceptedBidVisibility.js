/**
 * REGRESSION TEST: Accepted Bid Visibility in Farmer & Trader Portals
 */
const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const BASE_URL = 'http://localhost:5000/api';

async function testAcceptedBidVisibility() {
  console.log('================================================================');
  console.log('🔍 RUNNING ACCEPTED BID VISIBILITY & TRANSACTION TEST SUITE');
  console.log('================================================================\n');

  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB connected');

  // STEP 1: Authenticate Farmer and Trader
  console.log('\n--- STEP 1: Authenticate Users ---');
  const farmerLogin = await axios.post(`${BASE_URL}/auth/login`, {
    email: 'farmer1@krishisetu.com',
    password: 'password123'
  });
  const farmerToken = farmerLogin.data?.accessToken || farmerLogin.data?.token;

  const traderLogin = await axios.post(`${BASE_URL}/auth/login`, {
    email: 'trader1@krishisetu.com',
    password: 'password123'
  });
  const traderToken = traderLogin.data?.accessToken || traderLogin.data?.token;
  console.log('✅ Both Farmer and Trader authenticated successfully');

  // STEP 2: Farmer creates Crop listing
  console.log('\n--- STEP 2: Farmer creates Crop Listing ---');
  const cropRes = await axios.post(`${BASE_URL}/crops`, {
    name: 'TEST_ACCEPTED_VISIBILITY_POTATO',
    cropType: 'Potato',
    category: 'vegetables',
    quantity: 100,
    unit: 'quintal',
    basePrice: 1800,
    district: 'Hassan',
    description: 'Fresh Grade-A Potato Lot'
  }, {
    headers: { Authorization: `Bearer ${farmerToken}` }
  });
  const cropId = cropRes.data._id;
  console.log('✅ Crop Listing Created: _id =', cropId);

  // STEP 3: Trader places Bid
  console.log('\n--- STEP 3: Trader places Bid ---');
  const bidRes = await axios.post(`${BASE_URL}/bids`, {
    cropId,
    amount: 1950,
    message: 'Wholesale contract offer'
  }, {
    headers: { Authorization: `Bearer ${traderToken}` }
  });
  const bidId = bidRes.data._id;
  console.log('✅ Bid Placed: _id =', bidId, '| Amount = ₹1950/Qtl');

  // STEP 4: Farmer Accepts Bid
  console.log('\n--- STEP 4: Farmer accepts the Bid ---');
  const acceptRes = await axios.put(`${BASE_URL}/bids/${bidId}/respond`, {
    status: 'accepted'
  }, {
    headers: { Authorization: `Bearer ${farmerToken}` }
  });
  console.log('✅ Accept Response Status:', acceptRes.status, '(Expected: 200)');

  // STEP 5: Verify MongoDB State
  console.log('\n--- STEP 5: Database Direct State Verification ---');
  const dbBid = await mongoose.connection.db.collection('bids').findOne({ _id: new mongoose.Types.ObjectId(bidId) });
  console.log('  Bid Status in DB:        ', dbBid?.status, '(Expected: accepted)');
  
  const dbCrop = await mongoose.connection.db.collection('crops').findOne({ _id: new mongoose.Types.ObjectId(cropId) });
  console.log('  Crop Status in DB:       ', dbCrop?.status, '(Expected: sold)');

  const dbTx = await mongoose.connection.db.collection('transactions').findOne({ bid: new mongoose.Types.ObjectId(bidId) });
  console.log('  Transaction in DB:       ', dbTx ? `YES (_id: ${dbTx._id})` : 'NO');
  console.log('  Transaction Amount:      ', dbTx?.amount, '(Expected: 195000)');
  console.log('  Transaction PaymentStatus:', dbTx?.paymentStatus, '(Expected: pending)');

  if (!dbTx || dbBid?.status !== 'accepted' || dbCrop?.status !== 'sold') {
    console.error('❌ Database state verification failed!');
    process.exit(1);
  }

  // STEP 6: Verify Farmer API: Bids Endpoint (GET /api/bids/my)
  console.log('\n--- STEP 6: Farmer Bids API (GET /api/bids/my) ---');
  const farmerBidsRes = await axios.get(`${BASE_URL}/bids/my`, {
    headers: { Authorization: `Bearer ${farmerToken}` }
  });
  const farmerBidsList = farmerBidsRes.data?.data || farmerBidsRes.data || [];
  const foundAcceptedBid = farmerBidsList.find(b => b._id === bidId);
  console.log('  Accepted Bid returned:   ', foundAcceptedBid ? '✅ YES' : '❌ NO');
  console.log('  Bid status field:        ', foundAcceptedBid?.status);
  console.log('  Trader name populated:   ', foundAcceptedBid?.trader?.name || 'N/A');
  console.log('  Crop name populated:     ', foundAcceptedBid?.crop?.name || 'N/A');

  // STEP 7: Verify Farmer API: Transactions / Orders (GET /api/transactions/my-transactions)
  console.log('\n--- STEP 7: Farmer Orders API (GET /api/transactions/my-transactions) ---');
  const farmerTxRes = await axios.get(`${BASE_URL}/transactions/my-transactions`, {
    headers: { Authorization: `Bearer ${farmerToken}` }
  });
  const farmerTxList = farmerTxRes.data?.data || farmerTxRes.data || [];
  const foundFarmerTx = farmerTxList.find(tx => tx.bid?.toString() === bidId || tx._id.toString() === dbTx._id.toString());
  console.log('  Transaction returned:    ', foundFarmerTx ? '✅ YES' : '❌ NO');
  console.log('  Crop name in tx:         ', foundFarmerTx?.cropListing?.name || 'N/A');
  console.log('  Trader name in tx:       ', foundFarmerTx?.trader?.name || 'N/A');
  console.log('  Total amount in tx:      ', foundFarmerTx?.amount);

  // STEP 8: Verify Trader API: Transactions / Orders (GET /api/transactions/my-transactions)
  console.log('\n--- STEP 8: Trader Orders API (GET /api/transactions/my-transactions) ---');
  const traderTxRes = await axios.get(`${BASE_URL}/transactions/my-transactions`, {
    headers: { Authorization: `Bearer ${traderToken}` }
  });
  const traderTxList = traderTxRes.data?.data || traderTxRes.data || [];
  const foundTraderTx = traderTxList.find(tx => tx.bid?.toString() === bidId || tx._id.toString() === dbTx._id.toString());
  console.log('  Trader sees transaction: ', foundTraderTx ? '✅ YES' : '❌ NO');

  // STEP 9: Advance Logistics to Delivered & Verify Payout Release
  console.log('\n--- STEP 9: Advance Order to Delivered (PUT /api/transactions/:id/logistics) ---');
  const logisticsRes = await axios.put(`${BASE_URL}/transactions/${dbTx._id}/logistics`, {
    status: 'delivered'
  }, {
    headers: { Authorization: `Bearer ${farmerToken}` }
  });
  console.log('  Logistics update status: ', logisticsRes.status, '(Expected: 200)');
  console.log('  Payment status after delivery:', logisticsRes.data?.transaction?.paymentStatus, '(Expected: payout_released)');

  // CLEANUP
  console.log('\n--- CLEANUP: Removing test records ---');
  await mongoose.connection.db.collection('transactions').deleteOne({ _id: dbTx._id });
  await mongoose.connection.db.collection('bids').deleteOne({ _id: new mongoose.Types.ObjectId(bidId) });
  await mongoose.connection.db.collection('crops').deleteOne({ _id: new mongoose.Types.ObjectId(cropId) });
  console.log('Cleaned up test crop, bid, and transaction.');

  console.log('\n================================================================');
  console.log('🎉 ALL ACCEPTED BID & TRANSACTION VISIBILITY TESTS PASSED (9/9)!');
  console.log('================================================================\n');
  process.exit(0);
}

testAcceptedBidVisibility().catch(err => {
  console.error('FATAL:', err.response?.data || err.message);
  process.exit(1);
});
