const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Farmer = require('../models/Farmer');
const Trader = require('../models/Trader');
const Admin = require('../models/Admin');
const Crop = require('../models/Crop');
const Bid = require('../models/Bid');
const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const WalletLedger = require('../models/WalletLedger');
const Notification = require('../models/Notification');
const Review = require('../models/Review');
const Report = require('../models/Report');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

const inspect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📦 Connected to MongoDB Atlas');

    const counts = {
      farmers: await Farmer.countDocuments(),
      traders: await Trader.countDocuments(),
      admins: await Admin.countDocuments(),
      crops: await Crop.countDocuments(),
      bids: await Bid.countDocuments(),
      bidsAccepted: await Bid.countDocuments({ status: 'accepted' }),
      bidsPending: await Bid.countDocuments({ status: 'pending' }),
      bidsRejected: await Bid.countDocuments({ status: 'rejected' }),
      transactions: await Transaction.countDocuments(),
      wallets: await Wallet.countDocuments(),
      walletLedgers: await WalletLedger.countDocuments(),
      notifications: await Notification.countDocuments(),
      reviews: await Review.countDocuments(),
      reports: await Report.countDocuments(),
      conversations: await Conversation.countDocuments(),
      messages: await Message.countDocuments()
    };

    console.log('\n📊 CURRENT DATABASE COUNTS:');
    console.log('--------------------------------------------------');
    console.log(`👨‍🌾 Farmers (Accounts):            ${counts.farmers}`);
    console.log(`💼 Traders (Accounts):            ${counts.traders}`);
    console.log(`🛡️ Admins (Accounts):             ${counts.admins}`);
    console.log(`🌾 Crops (Listings):              ${counts.crops}`);
    console.log(`💰 Bids (Total):                  ${counts.bids}`);
    console.log(`   - Accepted:                    ${counts.bidsAccepted}`);
    console.log(`   - Pending:                     ${counts.bidsPending}`);
    console.log(`   - Rejected:                    ${counts.bidsRejected}`);
    console.log(`📜 Transactions (Crop Orders):    ${counts.transactions}`);
    console.log(`🏛️ Wallets (Trader Balances):     ${counts.wallets}`);
    console.log(`📒 Wallet Ledgers (Top-ups):      ${counts.walletLedgers}`);
    console.log(`🔔 Notifications:                 ${counts.notifications}`);
    console.log(`💬 Conversations:                 ${counts.conversations}`);
    console.log(`📩 Messages:                      ${counts.messages}`);
    console.log(`⭐ Reviews:                       ${counts.reviews}`);
    console.log(`🚩 Reports:                       ${counts.reports}`);
    console.log('--------------------------------------------------\n');

  } catch (err) {
    console.error('Error inspecting database:', err);
  } finally {
    await mongoose.disconnect();
  }
};

inspect();
