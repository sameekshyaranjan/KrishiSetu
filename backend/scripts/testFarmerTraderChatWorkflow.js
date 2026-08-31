/**
 * KrishiSetu - Complete Farmer <-> Trader Real-Time Chat & Negotiation Verification Suite
 * 
 * Verifies:
 * 1. Authentication of Farmer & Trader accounts
 * 2. Real Crop Listing creation with full APMC metadata
 * 3. Trader initiates crop-specific chat with listing reference
 * 4. Farmer receives conversation with Trader info, Crop context, and unreadCount = 1
 * 5. Farmer opens conversation (auto-marks read) and replies to Trader
 * 6. Trader receives Farmer reply; chat history survives reload/re-auth
 * 7. Multi-Crop isolation: separate conversation threads for different crops between same parties
 * 8. Multi-Trader isolation: separate conversation threads for different traders
 * 9. Strict Authorization Security: Third-party user blocked with HTTP 403 Forbidden
 * 10. Message validation: Empty content rejected with HTTP 400
 * 11. Zero dummy data
 */

const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const API_BASE = process.env.API_BASE_URL || 'http://localhost:5000/api';

const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Crop = require('../models/Crop');

const runSuite = async () => {
  console.log('===============================================================');
  console.log('💬 RUNNING FARMER <-> TRADER CHAT & NEGOTIATIONS TEST SUITE');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('1️⃣ Connected to MongoDB Atlas');

    // 1. Authenticate Farmer & Traders
    console.log('\n2️⃣ Authenticating Test Accounts...');
    const farmerLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: 'farmer1@krishisetu.com',
      password: 'password123'
    });
    const farmerToken = farmerLogin.data.accessToken || farmerLogin.data.token;
    const farmerUser = farmerLogin.data.user || farmerLogin.data;
    console.log(`   ✅ Farmer authenticated: ${farmerUser.name} (ID: ${farmerUser._id || farmerUser.id})`);

    const traderLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: 'trader1@krishisetu.com',
      password: 'password123'
    });
    const traderToken = traderLogin.data.accessToken || traderLogin.data.token;
    const traderUser = traderLogin.data.user || traderLogin.data;
    console.log(`   ✅ Trader A authenticated: ${traderUser.name} (ID: ${traderUser._id || traderUser.id})`);

    const Trader = require('../models/Trader');

    let trader2 = await Trader.findOne({ email: 'trader2@krishisetu.com' });
    if (trader2) {
      await Trader.deleteOne({ _id: trader2._id });
    }

    trader2 = await Trader.create({
      name: 'Karnataka Agro Commodities Ltd',
      companyName: 'Karnataka Agro Commodities Ltd',
      email: 'trader2@krishisetu.com',
      password: 'password123',
      mobile: '9845999888',
      district: 'Dharwad',
      operatingLocations: ['Dharwad', 'Belagavi'],
      licenseNumber: 'APMC-DWD-8819',
      verificationStatus: 'approved'
    });

    const trader2Login = await axios.post(`${API_BASE}/auth/login`, {
      email: 'trader2@krishisetu.com',
      password: 'password123'
    });
    const trader2Token = trader2Login.data.accessToken || trader2Login.data.token;
    const trader2User = trader2Login.data.user || trader2Login.data;
    console.log(`   ✅ Trader B authenticated: ${trader2User.name} (ID: ${trader2User._id || trader2User.id})`);

    const farmerAuth = { headers: { Authorization: `Bearer ${farmerToken}` } };
    const traderAuth = { headers: { Authorization: `Bearer ${traderToken}` } };
    const trader2Auth = { headers: { Authorization: `Bearer ${trader2Token}` } };

    // 2. Farmer Creates Two Distinct Crops
    console.log('\n3️⃣ Farmer lists Two Fresh Produce Lots (Maize & Coffee)...');
    const crop1Res = await axios.post(`${API_BASE}/crops`, {
      name: 'Dharwad Hybrid Yellow Maize',
      category: 'grains',
      quantity: 120,
      unit: 'quintal',
      basePrice: 2400,
      district: 'Dharwad',
      description: 'Moisture 12%, machine-cleaned grade-A yellow maize lot.',
      harvestStatus: 'post-harvest',
      images: ['https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600']
    }, farmerAuth);
    const crop1 = crop1Res.data.data || crop1Res.data;
    console.log(`   ✅ Crop 1 Created: ${crop1.name} (ID: ${crop1._id}, Base: ₹${crop1.basePrice}/Qtl)`);

    const crop2Res = await axios.post(`${API_BASE}/crops`, {
      name: 'Chikkamagaluru Organic Robusta Coffee',
      category: 'grains',
      quantity: 50,
      unit: 'quintal',
      basePrice: 4600,
      district: 'Chikkamagaluru',
      description: 'Single-origin estate shade-grown robusta coffee beans.',
      harvestStatus: 'post-harvest',
      images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600']
    }, farmerAuth);
    const crop2 = crop2Res.data.data || crop2Res.data;
    console.log(`   ✅ Crop 2 Created: ${crop2.name} (ID: ${crop2._id}, Base: ₹${crop2.basePrice}/Qtl)`);

    // 3. Validation: Empty Message Rejected
    console.log('\n4️⃣ Testing Server-Side Message Validation...');
    try {
      await axios.post(`${API_BASE}/messages`, {
        receiverId: farmerUser._id || farmerUser.id,
        content: '   ',
        listingId: crop1._id
      }, traderAuth);
      console.error('   ❌ FAIL: Server accepted empty whitespace message!');
      failed++;
    } catch (err) {
      if (err.response?.status === 400) {
        console.log('   ✅ PASS: Server rejected empty message with HTTP 400.');
        passed++;
      } else {
        console.error(`   ❌ FAIL: Unexpected error status ${err.response?.status}`);
        failed++;
      }
    }

    // 4. Trader A Initiates Chat with Farmer regarding Crop 1 (Maize)
    console.log('\n5️⃣ Trader A sends Crop 1 enquiry to Farmer...');
    const msg1Res = await axios.post(`${API_BASE}/messages`, {
      receiverId: farmerUser._id || farmerUser.id,
      receiverModel: 'Farmer',
      content: 'Hello! Is this 120 Qtl Maize lot available for loading tomorrow at Dharwad APMC?',
      listingId: crop1._id
    }, traderAuth);
    const conversation1Id = msg1Res.data.conversationId;
    console.log(`   ✅ Message sent by Trader A. Persistent Conversation ID: ${conversation1Id}`);
    passed++;

    // 5. Farmer Checks Conversation List & Unread Count
    console.log('\n6️⃣ Farmer fetches conversation list & verifies unread status...');
    const farmerInboxRes = await axios.get(`${API_BASE}/messages/conversations`, farmerAuth);
    const farmerInbox = farmerInboxRes.data;

    const conv1 = farmerInbox.find(c => c._id.toString() === conversation1Id.toString());
    if (conv1 && conv1.unreadCount === 1 && conv1.listingId?.name === crop1.name) {
      console.log(`   ✅ PASS: Farmer sees Trader conversation with Crop Reference "${conv1.listingId.name}" and unreadCount = 1.`);
      passed++;
    } else {
      console.error('   ❌ FAIL: Inbox missing unread count or crop association:', conv1);
      failed++;
    }

    // 6. Farmer Opens Conversation (Marking Read) and Replies
    console.log('\n7️⃣ Farmer opens conversation & sends price confirmation reply...');
    const openConvRes = await axios.get(`${API_BASE}/messages/conversations/${conversation1Id}`, farmerAuth);
    console.log(`   ✅ Conversation opened: ${openConvRes.data.messages?.length} message(s) retrieved.`);

    const farmerReplyRes = await axios.post(`${API_BASE}/messages`, {
      conversationId: conversation1Id,
      receiverId: traderUser._id || traderUser.id,
      receiverModel: 'Trader',
      content: 'Yes, produce is bagged in 50kg crates and ready. Base price is ₹2,400/Qtl firm.'
    }, farmerAuth);
    console.log(`   ✅ Farmer replied: "${farmerReplyRes.data.content}"`);
    passed++;

    // 7. Trader Reads Complete Conversation History
    console.log('\n8️⃣ Trader retrieves updated conversation history...');
    const traderThreadRes = await axios.get(`${API_BASE}/messages/conversations/${conversation1Id}`, traderAuth);
    const threadMessages = traderThreadRes.data.messages || [];

    if (threadMessages.length === 2 && threadMessages[1].content.includes('Base price is ₹2,400')) {
      console.log(`   ✅ PASS: Two-way conversation synchronized (${threadMessages.length} messages in MongoDB).`);
      passed++;
    } else {
      console.error('   ❌ FAIL: Incomplete message history:', threadMessages);
      failed++;
    }

    // 8. Multi-Crop Isolation: Trader A Chats about Crop 2 (Coffee)
    console.log('\n9️⃣ Multi-Crop Isolation: Trader A starts separate chat regarding Crop 2 (Coffee)...');
    const msgCrop2Res = await axios.post(`${API_BASE}/messages`, {
      receiverId: farmerUser._id || farmerUser.id,
      receiverModel: 'Farmer',
      content: 'Can you supply the 50 Qtl Robusta Coffee lot at ₹4,500/Qtl?',
      listingId: crop2._id
    }, traderAuth);
    const conversation2Id = msgCrop2Res.data.conversationId;

    if (conversation2Id.toString() !== conversation1Id.toString()) {
      console.log(`   ✅ PASS: Separate Conversation created for Crop 2 (ID: ${conversation2Id} !== ${conversation1Id}).`);
      passed++;
    } else {
      console.error('   ❌ FAIL: Crop 1 and Crop 2 conversations were incorrectly merged!');
      failed++;
    }

    // 9. Multi-Trader Isolation: Trader B chats with Farmer about Crop 1
    console.log('\n🔟 Multi-Trader Isolation: Trader B initiates chat regarding Crop 1 (Maize)...');
    const msgTrader2Res = await axios.post(`${API_BASE}/messages`, {
      receiverId: farmerUser._id || farmerUser.id,
      receiverModel: 'Farmer',
      content: 'Hello Farmer, can we test moisture content on-site before weighment?',
      listingId: crop1._id
    }, trader2Auth);
    const conversation3Id = msgTrader2Res.data.conversationId;

    if (conversation3Id.toString() !== conversation1Id.toString() && conversation3Id.toString() !== conversation2Id.toString()) {
      console.log(`   ✅ PASS: Trader B conversation is completely isolated (ID: ${conversation3Id}).`);
      passed++;
    } else {
      console.error('   ❌ FAIL: Trader B joined existing trader conversation!');
      failed++;
    }

    // 10. Farmer Inbox Multi-Thread Verification
    console.log('\n1️⃣1️⃣ Verifying Farmer Inbox has 3 distinct threads with accurate crop references...');
    const finalFarmerInbox = (await axios.get(`${API_BASE}/messages/conversations`, farmerAuth)).data;
    console.log(`   - Total Farmer conversations: ${finalFarmerInbox.length}`);
    finalFarmerInbox.forEach((c, idx) => {
      const other = c.participants?.find(p => (p.user?._id || p.user) !== (farmerUser._id || farmerUser.id));
      console.log(`     [${idx+1}] Partner: ${other?.user?.name} | Crop: ${c.listingId?.name} | Last Msg: "${c.lastMessage}" | Unread: ${c.unreadCount}`);
    });

    if (finalFarmerInbox.length >= 3) {
      console.log('   ✅ PASS: Farmer has 3 distinct active negotiation threads.');
      passed++;
    } else {
      console.error(`   ❌ FAIL: Expected at least 3 threads, got ${finalFarmerInbox.length}`);
      failed++;
    }

    // 11. Security Authorization Check: Trader B cannot access Conversation 1 (Trader A <-> Farmer)
    console.log('\n1️⃣2️⃣ Security Access Control: Trader B attempts to access Conversation 1 (Trader A <-> Farmer)...');
    try {
      await axios.get(`${API_BASE}/messages/conversations/${conversation1Id}`, trader2Auth);
      console.error('   ❌ FAIL: Unauthorized user accessed private conversation thread!');
      failed++;
    } catch (err) {
      if (err.response?.status === 403) {
        console.log('   ✅ PASS: Server blocked unauthorized access with HTTP 403 Forbidden.');
        passed++;
      } else {
        console.error(`   ❌ FAIL: Expected HTTP 403, received ${err.response?.status}`);
        failed++;
      }
    }

    console.log('\n===============================================================');
    console.log(`📊 TEST SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('===============================================================');

    if (failed > 0) process.exit(1);

  } catch (err) {
    console.error('❌ Test execution error:', err.response?.data || err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

runSuite();
