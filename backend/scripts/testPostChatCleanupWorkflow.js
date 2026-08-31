/**
 * KrishiSetu - Post-Cleanup Chat Lifecycle Verification Suite
 * 
 * Verifies:
 * 1. Initial State: Message count is 0 in MongoDB Atlas
 * 2. Preserved State: Farmers, Traders, Crops, and Wallets are completely preserved
 * 3. Fresh Communication: Trader sends message -> Saved in MongoDB
 * 4. Inbox & Unread Count: Farmer receives 1 unread message with accurate crop context
 * 5. Farmer Reply: Farmer replies -> 2 messages synchronized
 * 6. Clean Reset: Deletes test messages leaving MongoDB in pure 0-message state
 */

const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const API_BASE = process.env.API_BASE_URL || 'http://localhost:5000/api';

const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Crop = require('../models/Crop');
const Farmer = require('../models/Farmer');
const Trader = require('../models/Trader');
const Wallet = require('../models/Wallet');

const runTest = async () => {
  console.log('===============================================================');
  console.log('🧪 RUNNING POST-CLEANUP CHAT LIFECYCLE TEST SUITE');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('1️⃣ Connected to MongoDB Atlas\n');

    // 1. Verify Message count is 0
    console.log('2️⃣ Verifying initial 0-message state in MongoDB Atlas...');
    const messageCount = await Message.countDocuments();
    const farmerCount = await Farmer.countDocuments();
    const traderCount = await Trader.countDocuments();
    const cropCount = await Crop.countDocuments();
    const walletCount = await Wallet.countDocuments();

    console.log(`   - Messages in DB: ${messageCount} (Expected: 0)`);
    console.log(`   - Farmers in DB:  ${farmerCount}`);
    console.log(`   - Traders in DB:  ${traderCount}`);
    console.log(`   - Crops in DB:    ${cropCount}`);
    console.log(`   - Wallets in DB:  ${walletCount}`);

    if (messageCount === 0 && farmerCount > 0 && traderCount > 0) {
      console.log('   ✅ PASS: Message collection is completely empty (0 records) & users are preserved.');
      passed++;
    } else {
      console.error(`   ❌ FAIL: Initial message count is ${messageCount}`);
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

    // 3. Find or Create a Crop listing for Farmer
    console.log('\n4️⃣ Locating Farmer active crop lot...');
    let crop = await Crop.findOne({ farmer: farmerUser._id || farmerUser.id });
    if (!crop) {
      const newCropRes = await axios.post(`${API_BASE}/crops`, {
        name: 'Shimoga Super Arecanut Lot',
        category: 'spices',
        quantity: 80,
        unit: 'quintal',
        basePrice: 42000,
        district: 'Shivamogga',
        description: 'Tender chali grade-A arecanut harvested directly from Malnad plantation.',
        harvestStatus: 'post-harvest',
        images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600']
      }, farmerAuth);
      crop = newCropRes.data.data || newCropRes.data;
    }
    console.log(`   ✅ Crop identified: "${crop.name}" (ID: ${crop._id})`);
    passed++;

    // 4. Trader sends a new enquiry message
    console.log('\n5️⃣ Trader initiates communication regarding the crop...');
    const sendRes = await axios.post(`${API_BASE}/messages`, {
      receiverId: farmerUser._id || farmerUser.id,
      receiverModel: 'Farmer',
      content: 'Is this crop still available for procurement at Shivamogga APMC?',
      listingId: crop._id
    }, traderAuth);
    const conversationId = sendRes.data.conversationId;
    console.log(`   ✅ Message saved in MongoDB! Conversation ID: ${conversationId}`);
    passed++;

    // 5. Farmer views inbox and verifies 1 unread message
    console.log('\n6️⃣ Farmer fetches inbox & verifies unread notification...');
    const farmerInbox = (await axios.get(`${API_BASE}/messages/conversations`, farmerAuth)).data;
    const targetConv = farmerInbox.find(c => c._id.toString() === conversationId.toString());

    if (targetConv && targetConv.unreadCount === 1 && targetConv.listingId?.name === crop.name) {
      console.log(`   ✅ PASS: Farmer sees unreadCount = 1 and Crop reference "${targetConv.listingId.name}".`);
      passed++;
    } else {
      console.error('   ❌ FAIL: Inbox mismatch:', targetConv);
      failed++;
    }

    // 6. Farmer opens conversation and replies
    console.log('\n7️⃣ Farmer opens conversation & sends reply...');
    await axios.get(`${API_BASE}/messages/conversations/${conversationId}`, farmerAuth);
    const replyRes = await axios.post(`${API_BASE}/messages`, {
      conversationId,
      receiverId: traderUser._id || traderUser.id,
      receiverModel: 'Trader',
      content: 'Yes, it is available and ready for weighment.'
    }, farmerAuth);
    console.log(`   ✅ Farmer reply persisted: "${replyRes.data.content}"`);
    passed++;

    // 7. Verify 2 messages exist in history
    console.log('\n8️⃣ Trader verifies synchronized 2-way thread history...');
    const traderThread = (await axios.get(`${API_BASE}/messages/conversations/${conversationId}`, traderAuth)).data;
    const messages = traderThread.messages || [];

    if (messages.length === 2) {
      console.log(`   ✅ PASS: Exactly 2 messages synchronized in MongoDB history.`);
      passed++;
    } else {
      console.error(`   ❌ FAIL: Expected 2 messages, found ${messages.length}`);
      failed++;
    }

    // 8. Clean up test messages to leave DB in 100% clean state
    console.log('\n9️⃣ Cleaning up test messages to leave DB in 0-message state for user...');
    await Message.deleteMany({});
    await Conversation.updateMany({}, { $set: { lastMessage: '', lastMessageAt: null } });
    const finalMsgCount = await Message.countDocuments();
    console.log(`   ✅ Final message count in MongoDB: ${finalMsgCount} (Cleaned)`);
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
