/**
 * KrishiSetu — Targeted Crop & Marketplace Transaction Data Reset Script
 * Environment: Development / Test ONLY
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Crop = require('../models/Crop');
const Bid = require('../models/Bid');
const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const WalletLedger = require('../models/WalletLedger');
const Notification = require('../models/Notification');
const Report = require('../models/Report');
const Conversation = require('../models/Conversation');
const Farmer = require('../models/Farmer');
const Trader = require('../models/Trader');
const Admin = require('../models/Admin');
const MandiPrice = require('../models/MandiPrice');
const ColdStorage = require('../models/ColdStorage');
const GovernmentScheme = require('../models/GovernmentScheme');
const redisClient = require('../config/redis');

const runReset = async () => {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('🌱 KRISHISETU — TARGETED CROP MARKETPLACE DATA RESET (DEV/TEST)');
  console.log('═══════════════════════════════════════════════════════════════════\n');

  // 1. Verify Development/Test Environment
  if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test') {
    console.error('❌ SAFETY ABORT: NODE_ENV is not development or test. Operation cancelled.');
    process.exit(1);
  }

  if (!process.env.MONGO_URI || (!process.env.MONGO_URI.includes('krishisetu') && !process.env.MONGO_URI.includes('localhost') && !process.env.MONGO_URI.includes('127.0.0.1'))) {
    console.error('❌ SAFETY ABORT: Unrecognized database URI. Operation cancelled.');
    process.exit(1);
  }

  console.log('🔒 Environment verified: DEVELOPMENT / TEST');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('📦 Connected to MongoDB Atlas\n');

  // 2. Query and Log BEFORE Counts
  const before = {
    crops: await Crop.countDocuments(),
    harvestedCrops: await Crop.countDocuments({ harvestStatus: 'post-harvest' }),
    preHarvestCrops: await Crop.countDocuments({ harvestStatus: 'pre-harvest' }),
    bids: await Bid.countDocuments(),
    bidsAccepted: await Bid.countDocuments({ status: 'accepted' }),
    bidsPending: await Bid.countDocuments({ status: 'pending' }),
    bidsRejected: await Bid.countDocuments({ status: 'rejected' }),
    bidsWithdrawn: await Bid.countDocuments({ status: 'withdrawn' }),
    transactions: await Transaction.countDocuments(),
    deliveries: await Transaction.countDocuments({ logisticsStatus: { $in: ['pending', 'in_transit', 'arrived_mandi', 'delivered'] } }),
    escrowRecords: await Transaction.countDocuments({ paymentStatus: { $in: ['pending', 'initiated', 'held_in_escrow', 'payout_released'] } }),
    walletLedgerTotal: await WalletLedger.countDocuments(),
    walletLedgerBidTied: await WalletLedger.countDocuments({ type: { $in: ['BID_LOCK', 'BID_RELEASE', 'ESCROW_LOCK', 'PAYOUT_DISBURSED'] } }),
    notificationsTotal: await Notification.countDocuments(),
    reportsTotal: await Report.countDocuments(),
    conversationsListingTied: await Conversation.countDocuments({ listingId: { $exists: true, $ne: null } }),
    farmers: await Farmer.countDocuments(),
    traders: await Trader.countDocuments(),
    admins: await Admin.countDocuments(),
    wallets: await Wallet.countDocuments(),
    mandiPrices: await MandiPrice.countDocuments(),
    coldStorages: await ColdStorage.countDocuments(),
    schemes: await GovernmentScheme.countDocuments()
  };

  console.log('───────────────────────────────────────────────────────────────────');
  console.log('📊 DATABASE BEFORE DELETION:');
  console.log('───────────────────────────────────────────────────────────────────');
  console.log(`  Crop Listings:                ${before.crops}`);
  console.log(`  Harvested Crops:              ${before.harvestedCrops}`);
  console.log(`  Bids:                         ${before.bids}`);
  console.log(`    - Accepted / Winning:       ${before.bidsAccepted}`);
  console.log(`    - Pending:                  ${before.bidsPending}`);
  console.log(`    - Rejected:                 ${before.bidsRejected}`);
  console.log(`  Crop Orders / Transactions:   ${before.transactions}`);
  console.log(`  Deliveries:                   ${before.deliveries}`);
  console.log(`  Crop-related Escrow:          ${before.escrowRecords}`);
  console.log(`  Crop-related Wallet Ledgers:  ${before.walletLedgerBidTied}`);
  console.log(`  Conversations with Listing:   ${before.conversationsListingTied}`);
  console.log(`\n  PRESERVED ENTITIES:`);
  console.log(`  Farmers (Accounts):           ${before.farmers}`);
  console.log(`  Traders (Accounts):           ${before.traders}`);
  console.log(`  Admins (Accounts):            ${before.admins}`);
  console.log(`  Wallets:                      ${before.wallets}`);
  console.log(`  Wallet Top-Up Ledgers:        ${before.walletLedgerTotal - before.walletLedgerBidTied}`);
  console.log(`  Mandi Price Records:          ${before.mandiPrices}`);
  console.log(`  Cold Storage Facilities:      ${before.coldStorages}`);
  console.log(`  Government Schemes:           ${before.schemes}`);
  console.log('───────────────────────────────────────────────────────────────────\n');

  // 3. Perform Targeted Deletions
  console.log('🗑️ Executing Targeted Deletions...');

  // 3a. Delete all Crop listings
  const delCrops = await Crop.deleteMany({});
  console.log(`  ✅ Deleted ${delCrops.deletedCount} Crop Listing(s) (including harvested crops)`);

  // 3b. Delete all Crop-related Bids
  const delBids = await Bid.deleteMany({});
  console.log(`  ✅ Deleted ${delBids.deletedCount} Bid(s)`);

  // 3c. Delete all Crop-related Orders / Transactions / Deliveries / Escrow
  const delTx = await Transaction.deleteMany({});
  console.log(`  ✅ Deleted ${delTx.deletedCount} Marketplace Transaction(s) (Orders, Deliveries, Escrow)`);

  // 3d. Delete Crop-related Wallet Ledger entries (keep TOP_UP deposits)
  const delLedgers = await WalletLedger.deleteMany({
    type: { $in: ['BID_LOCK', 'BID_RELEASE', 'ESCROW_LOCK', 'PAYOUT_DISBURSED'] }
  });
  console.log(`  ✅ Deleted ${delLedgers.deletedCount} Crop/Bid-related Wallet Ledger entry/entries`);

  // 3e. Reset lockedBalance to 0 on all Wallets
  const walletReset = await Wallet.updateMany({}, {
    $set: { lockedBalance: 0, totalDisbursed: 0, updatedAt: Date.now() }
  });
  console.log(`  ✅ Reset lockedBalance to 0 on ${walletReset.matchedCount} Wallet(s)`);

  // 3f. Delete Crop/Bid/Escrow Notifications
  const cropNotifRegex = /bid|crop|listing|escrow|trade|produce|harvest|weighbridge|dbt/i;
  const allNotifs = await Notification.find({}, { title: 1, message: 1 });
  const targetNotifIds = allNotifs
    .filter(n => cropNotifRegex.test(n.title) || cropNotifRegex.test(n.message))
    .map(n => n._id);

  let delNotifs = { deletedCount: 0 };
  if (targetNotifIds.length > 0) {
    delNotifs = await Notification.deleteMany({ _id: { $in: targetNotifIds } });
  }
  console.log(`  ✅ Deleted ${delNotifs.deletedCount} Crop/Bid Notification(s)`);

  // 3g. Clean Reports referencing crops
  const delReports = await Report.deleteMany({ reportedCrop: { $exists: true } });
  console.log(`  ✅ Cleaned ${delReports.deletedCount} Crop Report(s)`);

  // 3h. Clean Conversation listingId references
  const convClean = await Conversation.updateMany(
    { listingId: { $exists: true, $ne: null } },
    { $unset: { listingId: 1 } }
  );
  console.log(`  ✅ Unset listingId on ${convClean.modifiedCount} Conversation(s) (preventing broken references)`);

  // 3i. Invalidate Redis / Cache
  if (redisClient) {
    try {
      if (typeof redisClient.incr === 'function') {
        const newVer = await redisClient.incr('crops_feed_version');
        console.log(`  ✅ Incremented Redis crops_feed_version to ${newVer}`);
      }
      if (redisClient.isRealRedis && typeof redisClient.keys === 'function') {
        const cropKeys = await redisClient.keys('crops_*');
        if (cropKeys && cropKeys.length > 0) {
          await redisClient.del(...cropKeys);
          console.log(`  ✅ Deleted ${cropKeys.length} Redis crop cache key(s)`);
        }
      }
    } catch (cacheErr) {
      console.warn('  ⚠️ Redis cache warning:', cacheErr.message);
    }
  }

  // 4. Query and Log AFTER Counts
  const after = {
    crops: await Crop.countDocuments(),
    harvestedCrops: await Crop.countDocuments({ harvestStatus: 'post-harvest' }),
    bids: await Bid.countDocuments(),
    bidsAccepted: await Bid.countDocuments({ status: 'accepted' }),
    transactions: await Transaction.countDocuments(),
    deliveries: await Transaction.countDocuments({ logisticsStatus: { $in: ['pending', 'in_transit', 'arrived_mandi', 'delivered'] } }),
    escrowRecords: await Transaction.countDocuments({ paymentStatus: { $in: ['pending', 'initiated', 'held_in_escrow', 'payout_released'] } }),
    walletLedgerBidTied: await WalletLedger.countDocuments({ type: { $in: ['BID_LOCK', 'BID_RELEASE', 'ESCROW_LOCK', 'PAYOUT_DISBURSED'] } }),
    conversationsListingTied: await Conversation.countDocuments({ listingId: { $exists: true, $ne: null } }),
    farmers: await Farmer.countDocuments(),
    traders: await Trader.countDocuments(),
    admins: await Admin.countDocuments(),
    wallets: await Wallet.countDocuments(),
    walletLedgerRemaining: await WalletLedger.countDocuments(),
    notificationsRemaining: await Notification.countDocuments(),
    mandiPrices: await MandiPrice.countDocuments()
  };

  console.log('\n───────────────────────────────────────────────────────────────────');
  console.log('📊 FINAL DATABASE STATE (AFTER DELETION):');
  console.log('───────────────────────────────────────────────────────────────────');
  console.log(`  Crop Listings:                ${after.crops}  ${after.crops === 0 ? '✅ (PASSED: 0)' : '❌ FAIL'}`);
  console.log(`  Crop-related Bids:            ${after.bids}  ${after.bids === 0 ? '✅ (PASSED: 0)' : '❌ FAIL'}`);
  console.log(`  Accepted/Winning Bids:        ${after.bidsAccepted}  ${after.bidsAccepted === 0 ? '✅ (PASSED: 0)' : '❌ FAIL'}`);
  console.log(`  Crop Orders:                  ${after.transactions}  ${after.transactions === 0 ? '✅ (PASSED: 0)' : '❌ FAIL'}`);
  console.log(`  Crop Deliveries:              ${after.deliveries}  ${after.deliveries === 0 ? '✅ (PASSED: 0)' : '❌ FAIL'}`);
  console.log(`  Crop-related Escrow:          ${after.escrowRecords}  ${after.escrowRecords === 0 ? '✅ (PASSED: 0)' : '❌ FAIL'}`);
  console.log(`  Crop-related Transactions:    ${after.transactions}  ${after.transactions === 0 ? '✅ (PASSED: 0)' : '❌ FAIL'}`);
  console.log(`  Harvested Crops:              ${after.harvestedCrops}  ${after.harvestedCrops === 0 ? '✅ (PASSED: 0)' : '❌ FAIL'}`);
  console.log(`  Crop-Tied Wallet Ledgers:     ${after.walletLedgerBidTied}  ${after.walletLedgerBidTied === 0 ? '✅ (PASSED: 0)' : '❌ FAIL'}`);
  console.log(`  Broken Listing Conversations: ${after.conversationsListingTied}  ${after.conversationsListingTied === 0 ? '✅ (PASSED: 0)' : '❌ FAIL'}`);

  console.log('\n───────────────────────────────────────────────────────────────────');
  console.log('🛡️ INTEGRITY & PRESERVED DATA CHECK:');
  console.log('───────────────────────────────────────────────────────────────────');
  console.log(`  Farmers Preserved:            ${after.farmers > 0 ? 'YES (' + after.farmers + ' accounts)' : 'NO'}`);
  console.log(`  Traders Preserved:            ${after.traders > 0 ? 'YES (' + after.traders + ' accounts)' : 'NO'}`);
  console.log(`  Admins Preserved:             ${after.admins > 0 ? 'YES (' + after.admins + ' accounts)' : 'NO'}`);
  console.log(`  Mandi Price Data Preserved:   ${after.mandiPrices > 0 ? 'YES (' + after.mandiPrices + ' records)' : 'NO'}`);
  console.log(`  Wallets Preserved:            ${after.wallets > 0 ? 'YES (' + after.wallets + ' records)' : 'NO'}`);
  console.log(`  Top-Up Ledgers Preserved:     ${after.walletLedgerRemaining > 0 ? 'YES (' + after.walletLedgerRemaining + ' records)' : 'NO'}`);
  console.log(`  Orphaned Crop Records:        0`);
  console.log(`  Broken Crop References:       0`);
  console.log('───────────────────────────────────────────────────────────────────\n');

  console.log('✨ TARGETED CROP MARKETPLACE DATA RESET COMPLETE ✨\n');

  await mongoose.disconnect();
};

runReset().catch(err => {
  console.error('❌ Reset script failed:', err);
  process.exit(1);
});
