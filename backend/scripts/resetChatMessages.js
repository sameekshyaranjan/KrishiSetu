const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Farmer = require('../models/Farmer');
const Trader = require('../models/Trader');
const Admin = require('../models/Admin');
const Crop = require('../models/Crop');
const Bid = require('../models/Bid');
const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const redisClient = require('../config/redis');

const resetChatData = async () => {
  console.log('===============================================================');
  console.log('🧹 KRISHISETU — DEVELOPMENT CHAT & MESSAGE CLEANUP');
  console.log('===============================================================\n');

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas\n');

    // 1. Snapshot Counts BEFORE cleanup
    const beforeCounts = {
      messages: await Message.countDocuments(),
      conversations: await Conversation.countDocuments(),
      farmers: await Farmer.countDocuments(),
      traders: await Trader.countDocuments(),
      admins: await Admin.countDocuments(),
      crops: await Crop.countDocuments(),
      bids: await Bid.countDocuments(),
      transactions: await Transaction.countDocuments(),
      wallets: await Wallet.countDocuments()
    };

    console.log('📊 DATABASE ENTITY COUNTS (BEFORE CLEANUP):');
    console.log('--------------------------------------------------');
    console.log(`💬 Chat Messages (To Delete):   ${beforeCounts.messages}`);
    console.log(`🧵 Conversation Threads:        ${beforeCounts.conversations}`);
    console.log(`👨‍🌾 Farmers (Preserved):         ${beforeCounts.farmers}`);
    console.log(`💼 Traders (Preserved):         ${beforeCounts.traders}`);
    console.log(`🛡️ Admins (Preserved):          ${beforeCounts.admins}`);
    console.log(`🌾 Crop Listings (Preserved):   ${beforeCounts.crops}`);
    console.log(`💰 Bids (Preserved):            ${beforeCounts.bids}`);
    console.log(`📜 Transactions (Preserved):    ${beforeCounts.transactions}`);
    console.log(`🏛️ Wallets (Preserved):         ${beforeCounts.wallets}`);
    console.log('--------------------------------------------------\n');

    // 2. Delete ALL Message records
    console.log('🗑️ Deleting all persistent Chat Message documents...');
    const messageDelRes = await Message.deleteMany({});
    console.log(`   ✅ Deleted ${messageDelRes.deletedCount} Message records.\n`);

    // 3. Reset or Clean Conversations
    // If conversations exist, reset their lastMessage preview and timestamp so no phantom text remains
    console.log('🔄 Resetting Conversation metadata (lastMessage & unread states)...');
    const convUpdateRes = await Conversation.updateMany(
      {},
      {
        $set: {
          lastMessage: '',
          lastMessageAt: null
        }
      }
    );
    console.log(`   ✅ Reset metadata across ${convUpdateRes.modifiedCount || convUpdateRes.matchedCount} conversation threads.\n`);

    // 4. Invalidate Redis Chat Caches if present
    console.log('⚡ Checking & invalidating Redis chat caches...');
    if (redisClient) {
      try {
        if (typeof redisClient.incr === 'function') {
          await redisClient.incr('chat_feed_version');
        }
        console.log('   ✅ Redis chat cache invalidated.');
      } catch (e) {
        console.warn('   Redis cache note:', e.message);
      }
    }

    // 5. Snapshot Counts AFTER cleanup
    const afterCounts = {
      messages: await Message.countDocuments(),
      conversations: await Conversation.countDocuments(),
      farmers: await Farmer.countDocuments(),
      traders: await Trader.countDocuments(),
      admins: await Admin.countDocuments(),
      crops: await Crop.countDocuments(),
      bids: await Bid.countDocuments(),
      transactions: await Transaction.countDocuments(),
      wallets: await Wallet.countDocuments()
    };

    console.log('📊 DATABASE ENTITY COUNTS (AFTER CLEANUP):');
    console.log('--------------------------------------------------');
    console.log(`💬 Chat Messages (Cleaned):     ${afterCounts.messages} (Must be 0)`);
    console.log(`🧵 Conversation Threads:        ${afterCounts.conversations}`);
    console.log(`👨‍🌾 Farmers (Preserved):         ${afterCounts.farmers}`);
    console.log(`💼 Traders (Preserved):         ${afterCounts.traders}`);
    console.log(`🛡️ Admins (Preserved):          ${afterCounts.admins}`);
    console.log(`🌾 Crop Listings (Preserved):   ${afterCounts.crops}`);
    console.log(`💰 Bids (Preserved):            ${afterCounts.bids}`);
    console.log(`📜 Transactions (Preserved):    ${afterCounts.transactions}`);
    console.log(`🏛️ Wallets (Preserved):         ${afterCounts.wallets}`);
    console.log('--------------------------------------------------\n');

    console.log('✨ CHAT & MESSAGE CLEANUP COMPLETED SUCCESSFULLY! ✨\n');

  } catch (err) {
    console.error('Error during chat cleanup:', err);
  } finally {
    await mongoose.disconnect();
  }
};

resetChatData();
