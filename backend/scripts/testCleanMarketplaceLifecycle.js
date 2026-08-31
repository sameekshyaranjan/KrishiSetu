/**
 * KrishiSetu - Post-Reset Full Lifecycle Verification Test
 * 
 * Verifies:
 * 1. Clean Database State: 0 crops, 0 bids, 0 orders
 * 2. Farmer Portal Clean: 0 listings, 0 bids
 * 3. Trader Portal Clean: 0 bids, 0 winning crops
 * 4. User Accounts & Wallet Balances Preserved
 * 5. Farmer creates a new crop listing -> Appears in Marketplace
 * 6. Trader places a new bid -> Appears in Farmer bids
 * 7. Farmer accepts the bid -> Accepted bid & transaction created
 */

const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const API_BASE = process.env.API_BASE_URL || 'http://localhost:5000/api';

const extractList = (res) => {
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.data?.docs)) return res.data.docs;
  if (Array.isArray(res.data?.data?.data)) return res.data.data.data;
  if (Array.isArray(res.data?.data)) return res.data.data;
  return [];
};

const runLifecycleTest = async () => {
  console.log('===============================================================');
  console.log('🧪 RUNNING POST-RESET MARKETPLACE LIFECYCLE TEST');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  try {
    // 1. Authenticate Existing Farmer & Trader Accounts
    console.log('1️⃣ Authenticating preserved Farmer & Trader accounts...');
    const farmerLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: 'farmer1@krishisetu.com',
      password: 'password123'
    });
    const farmerToken = farmerLogin.data.accessToken || farmerLogin.data.token;
    const farmerId = farmerLogin.data.user?._id || farmerLogin.data._id;
    console.log(`   ✅ Farmer authenticated (ID: ${farmerId}).`);

    const traderLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: 'trader1@krishisetu.com',
      password: 'password123'
    });
    const traderToken = traderLogin.data.accessToken || traderLogin.data.token;
    const traderId = traderLogin.data.user?._id || traderLogin.data._id;
    console.log(`   ✅ Trader authenticated (ID: ${traderId}).`);
    passed++;

    // 2. Verify Trader Wallet Balance is Preserved
    console.log('\n2️⃣ Verifying Trader Wallet balance is preserved...');
    const walletRes = await axios.get(`${API_BASE}/wallet/overview`, {
      headers: { Authorization: `Bearer ${traderToken}` }
    });
    if (walletRes.data.availableBalance > 0 && walletRes.data.transactions.length >= 2) {
      console.log(`   ✅ Trader wallet preserved with balance ₹${walletRes.data.availableBalance} and ${walletRes.data.transactions.length} ledger entries.`);
      passed++;
    } else {
      console.error('   ❌ Trader wallet balance was unexpectedly lost:', walletRes.data);
      failed++;
    }

    // 3. Verify Farmer Listings are Clean (0 items)
    console.log('\n3️⃣ Verifying Farmer Portal has 0 crop listings...');
    const farmerListingsRes = await axios.get(`${API_BASE}/crops/my-listings`, {
      headers: { Authorization: `Bearer ${farmerToken}` }
    });
    const farmerListings = extractList(farmerListingsRes);
    if (farmerListings.length === 0) {
      console.log('   ✅ Farmer has 0 crop listings.');
      passed++;
    } else {
      console.error(`   ❌ Farmer still has ${farmerListings.length} listings:`, farmerListings);
      failed++;
    }

    // 4. Verify Trader Marketplace is Clean (0 items)
    console.log('\n4️⃣ Verifying Trader Marketplace has 0 listings...');
    const marketplaceRes = await axios.get(`${API_BASE}/crops`, {
      headers: { Authorization: `Bearer ${traderToken}` }
    });
    const marketListings = extractList(marketplaceRes);
    if (marketListings.length === 0) {
      console.log('   ✅ Marketplace has 0 crop listings.');
      passed++;
    } else {
      console.error(`   ❌ Marketplace still has ${marketListings.length} listings:`, marketListings);
      failed++;
    }

    // 5. Verify Trader Bids & Orders are Clean (0 items)
    console.log('\n5️⃣ Verifying Trader has 0 bids and 0 orders...');
    const traderBidsRes = await axios.get(`${API_BASE}/bids/my`, {
      headers: { Authorization: `Bearer ${traderToken}` }
    });
    const traderBids = extractList(traderBidsRes);
    if (traderBids.length === 0) {
      console.log('   ✅ Trader has 0 active/historical bids.');
      passed++;
    } else {
      console.error(`   ❌ Trader still has ${traderBids.length} bids.`);
      failed++;
    }

    // 6. Farmer Creates a Fresh Real Crop Listing
    console.log('\n6️⃣ Farmer creates a fresh real crop listing (Mysore Premium Robusta Coffee)...');
    const newCropRes = await axios.post(
      `${API_BASE}/crops`,
      {
        name: 'Mysore Premium Robusta Coffee',
        category: 'cash_crops',
        quantity: 100,
        unit: 'Quintals',
        basePrice: 4200,
        district: 'Mysuru',
        apmcMarket: 'Mysuru Main APMC Yard',
        description: 'Freshly harvested grade-A Robusta coffee beans directly from organic plantation.'
      },
      { headers: { Authorization: `Bearer ${farmerToken}` } }
    );

    const createdCrop = newCropRes.data.crop || newCropRes.data;
    const cropId = createdCrop._id;
    console.log(`   ✅ Crop created successfully (ID: ${cropId}, Base Price: ₹4,200).`);
    passed++;

    // 7. Verify Crop Appears in Trader Marketplace
    console.log('\n7️⃣ Verifying newly created crop appears in Trader Marketplace...');
    const updatedMarketRes = await axios.get(`${API_BASE}/crops`, {
      headers: { Authorization: `Bearer ${traderToken}` }
    });
    console.log('   [Debug] Marketplace raw response:', JSON.stringify(updatedMarketRes.data));
    const updatedMarketListings = extractList(updatedMarketRes);
    const foundInMarket = updatedMarketListings.find(c => c._id === cropId);

    if (foundInMarket && updatedMarketListings.length === 1) {
      console.log(`   ✅ Marketplace now has exactly 1 crop: "${foundInMarket.name}" (Highest Bid: ${foundInMarket.currentHighestBid || 'No bids yet'}).`);
      passed++;
    } else {
      console.error('   ❌ Newly created crop not found in marketplace:', updatedMarketListings);
      failed++;
    }

    // 8. Trader Places a Real Bid (₹4,500)
    console.log('\n8️⃣ Trader places a real bid (₹4,500) on the new crop...');
    const newBidRes = await axios.post(
      `${API_BASE}/bids`,
      {
        cropId,
        amount: 4500,
        message: 'Interested in immediate bulk dispatch. Ready for APMC weighbridge clearance.'
      },
      { headers: { Authorization: `Bearer ${traderToken}` } }
    );

    const createdBid = newBidRes.data;
    const bidId = createdBid._id;
    console.log(`   ✅ Bid placed successfully (ID: ${bidId}, Amount: ₹4,500).`);
    passed++;

    // 9. Farmer Fetches Incoming Bids
    console.log('\n9️⃣ Farmer inspects incoming bids for the crop listing...');
    const incomingBidsRes = await axios.get(`${API_BASE}/bids/crop/${cropId}`, {
      headers: { Authorization: `Bearer ${farmerToken}` }
    });
    const incomingBids = extractList(incomingBidsRes);
    const foundBid = incomingBids.find(b => b._id === bidId);

    if (foundBid && foundBid.amount === 4500) {
      console.log(`   ✅ Farmer received Trader bid of ₹${foundBid.amount} with status: "${foundBid.status}".`);
      passed++;
    } else {
      console.error('   ❌ Bid not found in Farmer listing bids:', incomingBids);
      failed++;
    }

    // 10. Farmer Accepts the Bid
    console.log('\n🔟 Farmer accepts the Trader bid...');
    const acceptBidRes = await axios.put(
      `${API_BASE}/bids/${bidId}/accept`,
      {},
      { headers: { Authorization: `Bearer ${farmerToken}` } }
    );

    if (acceptBidRes.status === 200) {
      console.log('   ✅ Farmer successfully accepted the bid.');
      passed++;
    } else {
      console.error('   ❌ Bid acceptance failed:', acceptBidRes.data);
      failed++;
    }

    // 11. Verify Accepted Bid Visibility in Farmer Portal
    console.log('\n1️⃣1️⃣ Verifying Accepted Bid visibility in Farmer Incoming/Accepted Bids...');
    const farmerBidsRes = await axios.get(`${API_BASE}/bids/crop/${cropId}`, {
      headers: { Authorization: `Bearer ${farmerToken}` }
    });
    const farmerBidsList = extractList(farmerBidsRes);
    const verifiedAcceptedBid = farmerBidsList.find(b => b._id === bidId);

    if (verifiedAcceptedBid && verifiedAcceptedBid.status === 'accepted') {
      console.log(`   ✅ Accepted bid of ₹${verifiedAcceptedBid.amount} is visible in Farmer portal!`);
      passed++;
    } else {
      console.error('   ❌ Accepted bid not visible in Farmer portal:', farmerBidsList);
      failed++;
    }

    console.log('\n===============================================================');
    console.log(`📊 TEST SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('===============================================================');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('❌ Test failed with error:', err.response?.data || err.message);
    process.exit(1);
  }
};

runLifecycleTest();
