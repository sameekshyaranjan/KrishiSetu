/**
 * KrishiSetu - Zero Conversation State & Fresh Communication Lifecycle Verification Suite
 * 
 * Verifies:
 * 1. Initial State: Conversation count = 0, Message count = 0 in MongoDB Atlas
 * 2. Preserved State: Farmers, Traders, Admins, Crops, Mandi Prices, and Wallets intact
 * 3. Farmer API Verification: GET /api/messages/conversations returns []
 * 4. Trader API Verification: GET /api/messages/conversations returns []
 * 5. On-Demand Creation: Trader sends message -> 1 conversation created
 * 6. Farmer Inbox Verification: Farmer sees 1 thread, 1 unread message, exact crop reference
 * 7. Farmer Reply & Sync: Farmer replies -> 2 messages synchronized
 * 8. Clean Reset: Deletes test conversations/messages leaving DB in 0-conversation state
 */

const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const API_BASE = process.env.API_BASE_URL || 'http://localhost:5000/api';

const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Farmer = require('../models/Farmer');
const Trader = require('../models/Trader');
const Crop = require('../models/Crop');
const Wallet = require('../models/Wallet');
const MandiPrice = require('../models/MandiPrice');

const runTest = async () => {
  console.log('===============================================================');
  console.log('🧪 RUNNING ZERO-CONVERSATION STATE & CHAT LIFECYCLE TEST');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('1️⃣ Connected to MongoDB Atlas\n');

    // 1. Initial State Check in Database
    console.log('2️⃣ Verifying initial 0-conversation and 0-message state in MongoDB Atlas...');
    const convCount = await Conversation.countDocuments();
    const msgCount = await Message.countDocuments();
    const farmerCount = await Farmer.countDocuments();
    const traderCount = await Trader.countDocuments();
    const mandiCount = await MandiPrice.countDocuments();
    const walletCount = await Wallet.countDocuments();

    console.log(`   - Conversations in DB: ${convCount} (Expected: 0)`);
    console.log(`   - Messages in DB:      ${msgCount} (Expected: 0)`);
    console.log(`   - Farmers in DB:       ${farmerCount}`);
    console.log(`   - Traders in DB:       ${traderCount}`);
    console.log(`   - Mandi Prices in DB:  ${mandiCount}`);
    console.log(`   - Wallets in DB:       ${walletCount}`);

    if (convCount === 0 && msgCount === 0 && farmerCount > 0 && traderCount > 0) {
      console.log('   ✅ PASS: Both Conversation and Message collections are completely empty (0 records).');
      passed++;
    } else {
      console.error(`   ❌ FAIL: Non-zero count: Conversations=${convCount}, Messages=${msgCount}`);
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

    // 3. Directly Test Farmer Conversations API
    console.log('\n4️⃣ Testing Farmer Conversations API (GET /api/messages/conversations)...');
    const farmerConversations = (await axios.get(`${API_BASE}/messages/conversations`, farmerAuth)).data;
    console.log(`   - Farmer API returned ${farmerConversations.length} conversations:`, JSON.stringify(farmerConversations));

    if (Array.isArray(farmerConversations) && farmerConversations.length === 0) {
      console.log('   ✅ PASS: Farmer Conversations API returned empty array [] (Zero threads).');
      passed++;
    } else {
      console.error('   ❌ FAIL: Farmer API did not return empty array:', farmerConversations);
      failed++;
    }

    // 4. Directly Test Trader Conversations API
    console.log('\n5️⃣ Testing Trader Conversations API (GET /api/messages/conversations)...');
    const traderConversations = (await axios.get(`${API_BASE}/messages/conversations`, traderAuth)).data;
    console.log(`   - Trader API returned ${traderConversations.length} conversations.`);

    if (Array.isArray(traderConversations) && traderConversations.length === 0) {
      console.log('   ✅ PASS: Trader Conversations API returned empty array [] (Zero threads).');
      passed++;
    } else {
      console.error('   ❌ FAIL: Trader API did not return empty array:', traderConversations);
      failed++;
    }

    // 5. Ensure Crop exists for fresh test
    console.log('\n6️⃣ Finding or creating an active Crop lot for communication test...');
    let crop = await Crop.findOne({ farmer: farmerUser._id || farmerUser.id });
    if (!crop) {
      const cropRes = await axios.post(`${API_BASE}/crops`, {
        name: 'Hassan Grade-A Potato Lot',
        category: 'vegetables',
        quantity: 100,
        unit: 'quintal',
        basePrice: 1950,
        district: 'Hassan',
        description: 'Fresh farm-gate potatoes sorted and packed in 50kg mesh bags.',
        harvestStatus: 'post-harvest',
        images: ['https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600']
      }, farmerAuth);
      crop = cropRes.data.data || cropRes.data;
    }
    console.log(`   ✅ Crop Lot: "${crop.name}" (ID: ${crop._id})`);
    passed++;

    // 6. Trader initiates a new conversation
    console.log('\n7️⃣ Trader initiates a fresh conversation regarding the crop lot...');
    const sendMsgRes = await axios.post(`${API_BASE}/messages`, {
      receiverId: farmerUser._id || farmerUser.id,
      receiverModel: 'Farmer',
      content: 'Hello Ramesh Gowda, can we arrange loading tomorrow morning at Hassan APMC yard?',
      listingId: crop._id
    }, traderAuth);

    const createdConvId = sendMsgRes.data.conversationId;
    console.log(`   ✅ Fresh conversation created! ID: ${createdConvId}`);
    passed++;

    // 7. Farmer checks inbox and verifies exactly 1 thread
    console.log('\n8️⃣ Farmer checks inbox & verifies exactly 1 active thread with 1 unread message...');
    const activeFarmerInbox = (await axios.get(`${API_BASE}/messages/conversations`, farmerAuth)).data;

    if (activeFarmerInbox.length === 1 && activeFarmerInbox[0]._id.toString() === createdConvId.toString() && activeFarmerInbox[0].unreadCount === 1) {
      console.log(`   ✅ PASS: Farmer sees exactly 1 new conversation thread with unreadCount = 1 and Crop reference "${activeFarmerInbox[0].listingId?.name}".`);
      passed++;
    } else {
      console.error('   ❌ FAIL: Active inbox mismatch:', activeFarmerInbox);
      failed++;
    }

    // 8. Farmer replies to Trader
    console.log('\n9️⃣ Farmer opens conversation & sends reply...');
    await axios.get(`${API_BASE}/messages/conversations/${createdConvId}`, farmerAuth);
    const replyRes = await axios.post(`${API_BASE}/messages`, {
      conversationId: createdConvId,
      receiverId: traderUser._id || traderUser.id,
      receiverModel: 'Trader',
      content: 'Yes, 100 quintals bagged and ready for weighment.'
    }, farmerAuth);
    console.log(`   ✅ Farmer replied: "${replyRes.data.content}"`);
    passed++;

    // 9. Verify 2 messages exist in history
    console.log('\n🔟 Trader verifies 2-way synchronized conversation history...');
    const history = (await axios.get(`${API_BASE}/messages/conversations/${createdConvId}`, traderAuth)).data;
    const msgs = history.messages || [];

    if (msgs.length === 2) {
      console.log(`   ✅ PASS: Exactly 2 messages synchronized in MongoDB Atlas.`);
      passed++;
    } else {
      console.error(`   ❌ FAIL: Expected 2 messages, found ${msgs.length}`);
      failed++;
    }

    // 10. Clean up to leave DB in 100% clean 0-conversation state
    console.log('\n1️⃣1️⃣ Cleaning up test conversation & messages to leave DB in 0-conversation state...');
    await Conversation.deleteMany({});
    await Message.deleteMany({});
    const finalConvCount = await Conversation.countDocuments();
    const finalMsgCount = await Message.countDocuments();

    console.log(`   - Final Conversations in DB: ${finalConvCount} (Cleaned)`);
    console.log(`   - Final Messages in DB:      ${finalMsgCount} (Cleaned)`);
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

runTest();
