const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Farmer = require('../models/Farmer');
const Trader = require('../models/Trader');
const Admin = require('../models/Admin');
const Crop = require('../models/Crop');
const Bid = require('../models/Bid');
const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const MandiPrice = require('../models/MandiPrice');
const redisClient = require('../config/redis');

const resetAllChatConversations = async () => {
  console.log('===============================================================');
  console.log('🧹 KRISHISETU — COMPLETE CHAT & CONVERSATION THREAD CLEANUP');
  console.log('===============================================================\n');

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas\n');

    // 1. Snapshot Counts BEFORE cleanup
    const beforeCounts = {
      conversations: await Conversation.countDocuments(),
      messages: await Message.countDocuments(),
      farmers: await Farmer.countDocuments(),
      traders: await Trader.countDocuments(),
      admins: await Admin.countDocuments(),
      crops: await Crop.countDocuments(),
      bids: await Bid.countDocuments(),
      transactions: await Transaction.countDocuments(),
      wallets: await Wallet.countDocuments(),
      mandiPrices: await MandiPrice.countDocuments()
    };

    console.log('📊 DATABASE ENTITY COUNTS (BEFORE CLEANUP):');
    console.log('--------------------------------------------------');
    console.log(`🧵 Conversation Threads (To Delete): ${beforeCounts.conversations}`);
    console.log(`💬 Chat Messages (To Delete):        ${beforeCounts.messages}`);
    console.log(`👨‍🌾 Farmers (Preserved):             ${beforeCounts.farmers}`);
    console.log(`💼 Traders (Preserved):             ${beforeCounts.traders}`);
    console.log(`🛡️ Admins (Preserved):              ${beforeCounts.admins}`);
    console.log(`🌾 Crop Listings (Preserved):       ${beforeCounts.crops}`);
    console.log(`💰 Bids (Preserved):                ${beforeCounts.bids}`);
    console.log(`📜 Transactions (Preserved):        ${beforeCounts.transactions}`);
    console.log(`🏛️ Wallets (Preserved):             ${beforeCounts.wallets}`);
    console.log(`📈 Mandi Price Records:            ${beforeCounts.mandiPrices}`);
    console.log('--------------------------------------------------\n');

    // 2. Delete ALL Conversation documents
    console.log('🗑️ Deleting all persistent Conversation records...');
    const convDelRes = await Conversation.deleteMany({});
    console.log(`   ✅ Deleted ${convDelRes.deletedCount} Conversation thread records.\n`);

    // 3. Delete ALL Message documents
    console.log('🗑️ Deleting all persistent Chat Message records...');
    const msgDelRes = await Message.deleteMany({});
    console.log(`   ✅ Deleted ${msgDelRes.deletedCount} Message records.\n`);

    // 4. Invalidate Redis Chat Cache
    console.log('⚡ Checking & invalidating Redis chat cache...');
    if (redisClient) {
      try {
        if (typeof redisClient.incr === 'function') {
          await redisClient.incr('chat_feed_version');
        }
        console.log('   ✅ Redis chat cache invalidated.');
      } catch (e) {
        console.warn('   Redis cache notice:', e.message);
      }
    }

    // 5. Snapshot Counts AFTER cleanup
    const afterCounts = {
      conversations: await Conversation.countDocuments(),
      messages: await Message.countDocuments(),
      farmers: await Farmer.countDocuments(),
      traders: await Trader.countDocuments(),
      admins: await Admin.countDocuments(),
      crops: await Crop.countDocuments(),
      bids: await Bid.countDocuments(),
      transactions: await Transaction.countDocuments(),
      wallets: await Wallet.countDocuments(),
      mandiPrices: await MandiPrice.countDocuments()
    };

    console.log('\n📊 DATABASE ENTITY COUNTS (AFTER CLEANUP):');
    console.log('--------------------------------------------------');
    console.log(`🧵 Conversation Threads:            ${afterCounts.conversations} (Must be 0)`);
    console.log(`💬 Chat Messages:                   ${afterCounts.messages} (Must be 0)`);
    console.log(`👨‍🌾 Farmers (Preserved):             ${afterCounts.farmers}`);
    console.log(`💼 Traders (Preserved):             ${afterCounts.traders}`);
    console.log(`🛡️ Admins (Preserved):              ${afterCounts.admins}`);
    console.log(`🌾 Crop Listings (Preserved):       ${afterCounts.crops}`);
    console.log(`💰 Bids (Preserved):                ${afterCounts.bids}`);
    console.log(`📜 Transactions (Preserved):        ${afterCounts.transactions}`);
    console.log(`🏛️ Wallets (Preserved):             ${afterCounts.wallets}`);
    console.log(`📈 Mandi Price Records:            ${afterCounts.mandiPrices}`);
    console.log('--------------------------------------------------\n');

    console.log('✨ ALL CONVERSATIONS AND MESSAGES COMPLETELY REMOVED! ✨\n');

  } catch (err) {
    console.error('Error during cleanup:', err);
  } finally {
    await mongoose.disconnect();
  }
};

resetAllChatConversations();
