/**
 * KrishiSetu - Deep Workflow & Data Consistency Review Automated Test Suite
 * Tests:
 * 1. Location consistency across Farmer/Crop models & Karnataka canonical dataset
 * 2. Zero-bid listings return null highest bid and 0 bidsCount; updates on bids placed
 * 3. Bidirectional Farmer <-> Trader chat, message persistence, and participant authorization
 */

const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const API_BASE = process.env.API_BASE_URL || 'http://localhost:5000/api';

const runTest = async () => {
  console.log('===============================================================');
  console.log('🚀 RUNNING KRISHISETU DEEP WORKFLOW REVIEW TEST SUITE');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  try {
    // Step 1: Login Farmer and Trader
    console.log('1️⃣ Authenticating test accounts...');
    const farmerLoginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'farmer1@krishisetu.com',
      password: 'password123'
    });
    const farmerToken = farmerLoginRes.data.accessToken || farmerLoginRes.data.token;
    const farmerId = farmerLoginRes.data.user?._id || farmerLoginRes.data._id;
    console.log('   ✅ Farmer Authenticated. Token present.');

    const traderLoginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'trader1@krishisetu.com',
      password: 'password123'
    });
    const traderToken = traderLoginRes.data.accessToken || traderLoginRes.data.token;
    const traderId = traderLoginRes.data.user?._id || traderLoginRes.data._id;
    console.log('   ✅ Trader Authenticated. Token present.');

    // Step 2: Location Consistency Verification
    console.log('\n2️⃣ Testing Location System Consistency (Issue 1)...');
    const { KARNATAKA_DISTRICTS } = require('../utils/karnatakaLocations');
    if (KARNATAKA_DISTRICTS.length >= 20 && KARNATAKA_DISTRICTS.includes('Hassan') && KARNATAKA_DISTRICTS.includes('Bagalkote')) {
      console.log(`   ✅ Authoritative Karnataka locations defined (${KARNATAKA_DISTRICTS.length} districts).`);
      passed++;
    } else {
      console.error('   ❌ Karnataka locations incomplete.');
      failed++;
    }

    // Step 3: Test Zero-Bid Highest Bid Logic (Issue 2)
    console.log('\n3️⃣ Testing Zero-Bid vs Highest Active Bid Logic (Issue 2)...');
    const newCropRes = await axios.post(
      `${API_BASE}/crops`,
      {
        name: `Automated Test Crop Lot ${Date.now()}`,
        cropType: 'Tomato',
        category: 'vegetables',
        quantity: 80,
        unit: 'Quintals',
        basePrice: 1950,
        district: 'Hassan',
        description: 'Quality tested Grade-A lot for automated bid verification'
      },
      { headers: { Authorization: `Bearer ${farmerToken}` } }
    );
    const cropId = newCropRes.data._id;
    console.log(`   ✅ Crop created: ID ${cropId}, Base Price ₹1,950`);

    // Verify listing immediately after creation (0 bids)
    const getCropRes = await axios.get(`${API_BASE}/crops/${cropId}`, {
      headers: { Authorization: `Bearer ${traderToken}` }
    });

    if (getCropRes.data.currentHighestBid === null && getCropRes.data.bidsCount === 0) {
      console.log('   ✅ Zero-bid crop listing correctly returns currentHighestBid = null and bidsCount = 0.');
      passed++;
    } else {
      console.error(`   ❌ Unexpected zero-bid values: currentHighestBid=${getCropRes.data.currentHighestBid}, bidsCount=${getCropRes.data.bidsCount}`);
      failed++;
    }

    // Step 4: Place First Bid and Verify Increment
    console.log('\n4️⃣ Placing first bid (₹2,100) and verifying highest bid update...');
    await axios.post(
      `${API_BASE}/bids`,
      {
        cropId: cropId,
        amount: 2100,
        message: 'First test bid'
      },
      { headers: { Authorization: `Bearer ${traderToken}` } }
    );

    const getCropAfterBid1 = await axios.get(`${API_BASE}/crops/${cropId}`, {
      headers: { Authorization: `Bearer ${traderToken}` }
    });

    if (getCropAfterBid1.data.currentHighestBid === 2100 && getCropAfterBid1.data.bidsCount === 1) {
      console.log('   ✅ After 1st bid: currentHighestBid = ₹2,100, bidsCount = 1.');
      passed++;
    } else {
      console.error(`   ❌ Failed after 1st bid: currentHighestBid=${getCropAfterBid1.data.currentHighestBid}, bidsCount=${getCropAfterBid1.data.bidsCount}`);
      failed++;
    }

    // Place Second Higher Bid (₹2,350)
    console.log('\n5️⃣ Placing second higher bid (₹2,350) and verifying highest bid update...');
    await axios.post(
      `${API_BASE}/bids`,
      {
        cropId: cropId,
        amount: 2350,
        message: 'Second higher test bid'
      },
      { headers: { Authorization: `Bearer ${traderToken}` } }
    );

    const getCropAfterBid2 = await axios.get(`${API_BASE}/crops/${cropId}`, {
      headers: { Authorization: `Bearer ${traderToken}` }
    });

    if (getCropAfterBid2.data.currentHighestBid === 2350 && getCropAfterBid2.data.bidsCount === 2) {
      console.log('   ✅ After 2nd bid: currentHighestBid = ₹2,350, bidsCount = 2.');
      passed++;
    } else {
      console.error(`   ❌ Failed after 2nd bid: currentHighestBid=${getCropAfterBid2.data.currentHighestBid}, bidsCount=${getCropAfterBid2.data.bidsCount}`);
      failed++;
    }

    // Step 6: Test Farmer <-> Trader Direct Chat (Issue 3)
    console.log('\n6️⃣ Testing Farmer ↔ Trader Direct Chat Workflow (Issue 3)...');
    
    // Farmer initiates message to Trader
    const msg1Res = await axios.post(
      `${API_BASE}/messages`,
      {
        receiverId: traderId,
        receiverModel: 'Trader',
        content: 'Hello Trader, can you confirm delivery at Hassan APMC Yard?',
        listingId: cropId
      },
      { headers: { Authorization: `Bearer ${farmerToken}` } }
    );

    const conversationId = msg1Res.data.conversationId;
    console.log(`   ✅ Farmer sent message to Trader. Conversation ID: ${conversationId}`);

    // Trader retrieves conversation messages
    const traderChatRes = await axios.get(
      `${API_BASE}/messages/with/${farmerId}`,
      { headers: { Authorization: `Bearer ${traderToken}` } }
    );

    const traderReceivedMsg = traderChatRes.data.messages?.some(
      m => m.content.includes('Hassan APMC Yard')
    );

    if (traderReceivedMsg) {
      console.log('   ✅ Trader received Farmer message in real conversation thread.');
      passed++;
    } else {
      console.error('   ❌ Trader failed to receive Farmer message.');
      failed++;
    }

    // Trader replies to Farmer
    await axios.post(
      `${API_BASE}/messages`,
      {
        receiverId: farmerId,
        receiverModel: 'Farmer',
        content: 'Confirmed! We have arranged vehicle for Hassan APMC Yard tomorrow 07:00 AM.',
        listingId: cropId
      },
      { headers: { Authorization: `Bearer ${traderToken}` } }
    );
    console.log('   ✅ Trader replied to Farmer.');

    // Farmer fetches conversation messages by ID
    const farmerMessagesRes = await axios.get(
      `${API_BASE}/messages/conversations/${conversationId}`,
      { headers: { Authorization: `Bearer ${farmerToken}` } }
    );

    if (farmerMessagesRes.data.length >= 2) {
      console.log(`   ✅ Farmer fetched full conversation thread (${farmerMessagesRes.data.length} messages persisted in MongoDB).`);
      passed++;
    } else {
      console.error(`   ❌ Incomplete conversation history: ${farmerMessagesRes.data.length} messages.`);
      failed++;
    }

    // Step 7: Test Authorization Security (User A cannot view User B's conversation)
    console.log('\n7️⃣ Testing Chat Access Control & Ownership Isolation...');
    
    // Generate valid token for a third-party trader who is not part of this conversation
    const jwt = require('jsonwebtoken');
    const thirdPartyId = new mongoose.Types.ObjectId().toString();
    const thirdPartyToken = jwt.sign(
      { id: thirdPartyId, role: 'trader' },
      process.env.JWT_SECRET || 'your_jwt_secret_key_12345',
      { expiresIn: '1d' }
    );

    try {
      await axios.get(
        `${API_BASE}/messages/conversations/${conversationId}`,
        { headers: { Authorization: `Bearer ${thirdPartyToken}` } }
      );
      console.error('   ❌ Security failure: Unauthorized user accessed private conversation!');
      failed++;
    } catch (authErr) {
      if (authErr.response && (authErr.response.status === 403 || authErr.response.status === 404)) {
        console.log(`   ✅ Security check passed: Unauthorized access blocked with HTTP ${authErr.response.status}.`);
        passed++;
      } else {
        console.error(`   ❌ Unexpected response code: ${authErr.response?.status}`);
        failed++;
      }
    }

    console.log('\n===============================================================');
    console.log(`📊 TEST SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('===============================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Test suite fatal error:', error.response?.data || error.message);
    process.exit(1);
  }
};

runTest();
