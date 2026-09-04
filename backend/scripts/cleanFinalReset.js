/**
 * KrishiSetu — Clean Test Crop, Bid, and Trader Wallet Reset Script
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

async function cleanFinalReset() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🧹 KRISHISETU — FINAL CLEAN RESET OF TEST MARKETPLACE DATA');
  console.log('═══════════════════════════════════════════════════════════════\n');

  if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test') {
    console.error('❌ SAFETY ABORT: NODE_ENV is not development or test. Operation cancelled.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('📦 Connected to MongoDB\n');

  // 1. Clear test crop listings
  const delCrops = await Crop.deleteMany({});
  console.log(`✅ Removed ${delCrops.deletedCount} test crop listings.`);

  // 2. Clear all bids
  const delBids = await Bid.deleteMany({});
  console.log(`✅ Removed ${delBids.deletedCount} test bids.`);

  // 3. Clear all crop transactions / orders / escrows
  const delTx = await Transaction.deleteMany({});
  console.log(`✅ Removed ${delTx.deletedCount} marketplace transactions / escrow records.`);

  // 4. Clear crop/bid wallet ledgers
  const delLedgers = await WalletLedger.deleteMany({});
  console.log(`✅ Cleared ${delLedgers.deletedCount} test wallet ledger records.`);

  // 5. Reset all trader wallets to clean starting balance: ₹100,000 available, 0 locked
  const traders = await Trader.find({});
  let walletsResetCount = 0;
  for (const trader of traders) {
    let wallet = await Wallet.findOne({ trader: trader._id });
    if (!wallet) {
      wallet = new Wallet({ trader: trader._id });
    }
    wallet.availableBalance = 100000;
    wallet.lockedBalance = 0;
    wallet.totalDeposited = 100000;
    wallet.totalDisbursed = 0;
    wallet.updatedAt = new Date();
    await wallet.save();
    walletsResetCount++;
  }
  console.log(`✅ Reset ${walletsResetCount} trader wallet(s) to starting balance: ₹100,000 Available | ₹0 Locked.`);

  // 6. Delete test notifications related to bids/crops
  const cropNotifRegex = /bid|crop|listing|escrow|trade|produce|harvest|weighbridge|dbt/i;
  const allNotifs = await Notification.find({}, { title: 1, message: 1 });
  const targetNotifIds = allNotifs
    .filter(n => cropNotifRegex.test(n.title) || cropNotifRegex.test(n.message))
    .map(n => n._id);

  if (targetNotifIds.length > 0) {
    const delNotifs = await Notification.deleteMany({ _id: { $in: targetNotifIds } });
    console.log(`✅ Cleaned ${delNotifs.deletedCount} test notifications.`);
  }

  // 7. Unset listingId on Conversations to avoid stale references
  const convClean = await Conversation.updateMany(
    { listingId: { $exists: true, $ne: null } },
    { $unset: { listingId: 1 } }
  );
  console.log(`✅ Cleaned ${convClean.modifiedCount} conversation listing reference(s).`);

  // 8. Invalidate and clear Redis cache
  if (redisClient) {
    try {
      if (typeof redisClient.incr === 'function') {
        const newVer = await redisClient.incr('crops_feed_version');
        console.log(`✅ Incremented Redis crops_feed_version to ${newVer}`);
      }
      if (redisClient.isRealRedis && typeof redisClient.keys === 'function') {
        const cropKeys = await redisClient.keys('crops_*');
        if (cropKeys && cropKeys.length > 0) {
          await redisClient.del(...cropKeys);
          console.log(`✅ Deleted ${cropKeys.length} Redis crop cache keys`);
        }
      }
    } catch (cacheErr) {
      console.warn('⚠️ Redis cache warning:', cacheErr.message);
    }
  }

  // 9. Integrity verification
  const farmersCount = await Farmer.countDocuments();
  const tradersCount = await Trader.countDocuments();
  const adminsCount = await Admin.countDocuments();
  const mandiPricesCount = await MandiPrice.countDocuments();
  const coldStoragesCount = await ColdStorage.countDocuments();
  const schemesCount = await GovernmentScheme.countDocuments();
  const cropsRemaining = await Crop.countDocuments();
  const bidsRemaining = await Bid.countDocuments();

  console.log('\n───────────────────────────────────────────────────────────────');
  console.log('🛡️ SYSTEM STATE & DATA INTEGRITY VERIFICATION:');
  console.log('───────────────────────────────────────────────────────────────');
  console.log(`  Farmers Preserved:        ${farmersCount} accounts ✅`);
  console.log(`  Traders Preserved:        ${tradersCount} accounts ✅`);
  console.log(`  Admins Preserved:         ${adminsCount} accounts ✅`);
  console.log(`  Mandi Prices Preserved:   ${mandiPricesCount} records ✅`);
  console.log(`  Cold Storage Preserved:   ${coldStoragesCount} records ✅`);
  console.log(`  Gov Schemes Preserved:    ${schemesCount} records ✅`);
  console.log(`  Crop Listings:            ${cropsRemaining} (CLEAN) ✅`);
  console.log(`  Bids:                     ${bidsRemaining} (CLEAN) ✅`);
  console.log('───────────────────────────────────────────────────────────────\n');
  console.log('✨ CLEAN RESET COMPLETED SUCCESSFULLY! PLATFORM READY FOR FRESH USER TESTING ✨\n');

  await mongoose.disconnect();
  process.exit(0);
}

cleanFinalReset().catch(err => {
  console.error('❌ Reset failed:', err);
  process.exit(1);
});
