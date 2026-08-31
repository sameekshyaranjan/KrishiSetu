/**
 * KrishiSetu - Complete Crop & Bidding Marketplace Reset Script (Development/Testing)
 * 
 * Safely resets ONLY marketplace test data:
 * - Crops (Listings)
 * - Bids (Pending, Accepted, Rejected, Winning)
 * - Marketplace Crop Transactions / Orders
 * - Crop & Bid Notifications
 * - Redis Marketplace Cache Version
 * 
 * STRICTLY PRESERVES:
 * - Farmer Accounts & Profiles
 * - Trader Accounts & Profiles
 * - Admin Accounts & Credentials
 * - Trader Wallet Balances & Top-Up Ledgers
 * - Mandi Market Prices, Schemes, Cold Storage Records
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Crop = require('../models/Crop');
const Bid = require('../models/Bid');
const Transaction = require('../models/Transaction');
const Farmer = require('../models/Farmer');
const Trader = require('../models/Trader');
const Admin = require('../models/Admin');
const Wallet = require('../models/Wallet');
const WalletLedger = require('../models/WalletLedger');
const Notification = require('../models/Notification');
const Review = require('../models/Review');
const Report = require('../models/Report');
const redisClient = require('../config/redis');

const resetMarketplace = async () => {
  console.log('===============================================================');
  console.log('🧹 KRISHISETU — COMPLETE CROP & BIDDING DATA RESET');
  console.log('===============================================================\n');

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas\n');

    // 1. Snapshot BEFORE counts
    const beforeCounts = {
      crops: await Crop.countDocuments(),
      bids: await Bid.countDocuments(),
      bidsAccepted: await Bid.countDocuments({ status: 'accepted' }),
      bidsPending: await Bid.countDocuments({ status: 'pending' }),
      cropTransactions: await Transaction.countDocuments({
        $or: [{ cropListing: { $exists: true } }, { bid: { $exists: true } }]
      }),
      farmers: await Farmer.countDocuments(),
      traders: await Trader.countDocuments(),
      admins: await Admin.countDocuments(),
      wallets: await Wallet.countDocuments(),
      walletLedgers: await WalletLedger.countDocuments(),
      notifications: await Notification.countDocuments()
    };

    console.log('📊 DATABASE COUNTS (BEFORE RESET):');
    console.log('--------------------------------------------------');
    console.log(`🌾 Crop Listings:              ${beforeCounts.crops}`);
    console.log(`💰 Bids (Total):               ${beforeCounts.bids}`);
    console.log(`   - Accepted / Winning:       ${beforeCounts.bidsAccepted}`);
    console.log(`   - Pending:                  ${beforeCounts.bidsPending}`);
    console.log(`📜 Marketplace Crop Orders:    ${beforeCounts.cropTransactions}`);
    console.log(`👨‍🌾 Farmers (Accounts):         ${beforeCounts.farmers} (PRESERVED)`);
    console.log(`💼 Traders (Accounts):         ${beforeCounts.traders} (PRESERVED)`);
    console.log(`🛡️ Admins (Accounts):          ${beforeCounts.admins} (PRESERVED)`);
    console.log(`🏛️ Wallets:                    ${beforeCounts.wallets} (PRESERVED)`);
    console.log(`📒 Wallet Top-Up Ledgers:      ${beforeCounts.walletLedgers} (PRESERVED)`);
    console.log('--------------------------------------------------\n');

    // 2. Perform Marketplace Deletions
    console.log('🗑️ Cleaning Marketplace Data...');

    const deletedCrops = await Crop.deleteMany({});
    console.log(`   ✅ Deleted ${deletedCrops.deletedCount} Crop Listing(s)`);

    const deletedBids = await Bid.deleteMany({});
    console.log(`   ✅ Deleted ${deletedBids.deletedCount} Bid(s)`);

    const deletedTransactions = await Transaction.deleteMany({
      $or: [{ cropListing: { $exists: true } }, { bid: { $exists: true } }]
    });
    console.log(`   ✅ Deleted ${deletedTransactions.deletedCount} Marketplace Order Transaction(s)`);

    const deletedNotifications = await Notification.deleteMany({
      $or: [
        { title: { $regex: /bid|crop|listing|escrow|trade|produce/i } },
        { message: { $regex: /bid|crop|listing|escrow|trade|produce/i } }
      ]
    });
    console.log(`   ✅ Deleted ${deletedNotifications.deletedCount} Marketplace Notification(s)`);

    await Review.deleteMany({});
    await Report.deleteMany({});

    // 3. Invalidate Redis Marketplace Cache Version
    if (redisClient) {
      try {
        if (typeof redisClient.incr === 'function') {
          const newVersion = await redisClient.incr('crops_feed_version');
          console.log(`   ✅ Redis cache busted (crops_feed_version bumped to ${newVersion})`);
        }
      } catch (cacheErr) {
        console.warn('   ⚠️ Redis cache bump warning:', cacheErr.message);
      }
    }

    // 4. Ensure Trader Wallets have lockedBalance reset to 0 if any phantom lock existed
    const walletFix = await Wallet.updateMany(
      { lockedBalance: { $gt: 0 } },
      { $set: { lockedBalance: 0, updatedAt: Date.now() } }
    );
    if (walletFix.modifiedCount > 0) {
      console.log(`   ✅ Cleared phantom lockedBalance on ${walletFix.modifiedCount} wallet(s)`);
    }

    // 5. Snapshot AFTER counts
    const afterCounts = {
      crops: await Crop.countDocuments(),
      bids: await Bid.countDocuments(),
      bidsAccepted: await Bid.countDocuments({ status: 'accepted' }),
      cropTransactions: await Transaction.countDocuments({
        $or: [{ cropListing: { $exists: true } }, { bid: { $exists: true } }]
      }),
      farmers: await Farmer.countDocuments(),
      traders: await Trader.countDocuments(),
      admins: await Admin.countDocuments(),
      wallets: await Wallet.countDocuments(),
      walletLedgers: await WalletLedger.countDocuments()
    };

    console.log('\n📊 DATABASE COUNTS (AFTER RESET):');
    console.log('--------------------------------------------------');
    console.log(`🌾 Crop Listings:              ${afterCounts.crops} (Cleaned)`);
    console.log(`💰 Bids (Total):               ${afterCounts.bids} (Cleaned)`);
    console.log(`   - Accepted / Winning:       ${afterCounts.bidsAccepted} (Cleaned)`);
    console.log(`📜 Marketplace Crop Orders:    ${afterCounts.cropTransactions} (Cleaned)`);
    console.log(`👨‍🌾 Farmers (Accounts):         ${afterCounts.farmers} (PRESERVED)`);
    console.log(`💼 Traders (Accounts):         ${afterCounts.traders} (PRESERVED)`);
    console.log(`🛡️ Admins (Accounts):          ${afterCounts.admins} (PRESERVED)`);
    console.log(`🏛️ Wallets:                    ${afterCounts.wallets} (PRESERVED)`);
    console.log(`📒 Wallet Top-Up Ledgers:      ${afterCounts.walletLedgers} (PRESERVED)`);
    console.log('--------------------------------------------------\n');

    console.log('✨ MARKETPLACE RESET COMPLETED SUCCESSFULLY! ✨\n');
  } catch (err) {
    console.error('❌ Reset error:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

resetMarketplace();
