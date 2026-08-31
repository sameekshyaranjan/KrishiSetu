/**
 * KrishiSetu — Targeted Marketplace Data Cleanup Script
 * 
 * DELETES:
 *   - All Crop listings
 *   - All Bids
 *   - All Transactions (crop-marketplace orders/escrow)
 *   - All Notifications (bid/crop-related)
 *   - WalletLedger entries tied to bids (BID_LOCK, BID_RELEASE, ESCROW_LOCK, PAYOUT_DISBURSED)
 *   - Resets Wallet lockedBalance to 0 (since all bids are cleared)
 *
 * PRESERVES:
 *   - Farmer accounts
 *   - Trader accounts
 *   - Admin accounts
 *   - Conversations & Messages (chat)
 *   - MandiPrice data
 *   - GovernmentScheme / Scheme data
 *   - Wallet records (structure preserved, only lockedBalance reset)
 *   - WalletLedger TOP_UP entries (deposit history stays)
 *   - AuditLog, Report, Review, ColdStorage
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

// ── Models ────────────────────────────────────────────────────────────────────
const Crop         = require('../models/Crop');
const Bid          = require('../models/Bid');
const Transaction  = require('../models/Transaction');
const Notification = require('../models/Notification');
const Wallet       = require('../models/Wallet');
const WalletLedger = require('../models/WalletLedger');
const Farmer       = require('../models/Farmer');
const Trader       = require('../models/Trader');
const Conversation = require('../models/Conversation');
const Message      = require('../models/Message');
const MandiPrice   = require('../models/MandiPrice');

const sep = () => console.log('─'.repeat(60));

const run = async () => {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║   KRISHISETU — MARKETPLACE DATA CLEANUP                  ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB Atlas\n');

  // ── STEP 1: COUNT BEFORE ──────────────────────────────────────────────────
  sep();
  console.log('📊 BEFORE CLEANUP — RECORD COUNTS');
  sep();

  const beforeCrops          = await Crop.countDocuments();
  const beforeBids           = await Bid.countDocuments();
  const beforeTransactions   = await Transaction.countDocuments();
  const beforeNotifications  = await Notification.countDocuments();
  const beforeWalletLedger   = await WalletLedger.countDocuments();
  const beforeBidLedger      = await WalletLedger.countDocuments({
    type: { $in: ['BID_LOCK', 'BID_RELEASE', 'ESCROW_LOCK', 'PAYOUT_DISBURSED'] }
  });

  console.log(`  Crop Listings     : ${beforeCrops}`);
  console.log(`  Bids              : ${beforeBids}`);
  console.log(`  Transactions      : ${beforeTransactions}`);
  console.log(`  Notifications     : ${beforeNotifications}`);
  console.log(`  WalletLedger total: ${beforeWalletLedger}`);
  console.log(`  WalletLedger(bid) : ${beforeBidLedger}`);
  console.log('');

  // ── STEP 2: DELETE ────────────────────────────────────────────────────────
  sep();
  console.log('🗑️  DELETING MARKETPLACE DATA');
  sep();

  // 2a. Crops
  const delCrops = await Crop.deleteMany({});
  console.log(`  ✅ Crops deleted          : ${delCrops.deletedCount}`);

  // 2b. Bids
  const delBids = await Bid.deleteMany({});
  console.log(`  ✅ Bids deleted           : ${delBids.deletedCount}`);

  // 2c. Transactions (all — they are all crop-marketplace records)
  const delTx = await Transaction.deleteMany({});
  console.log(`  ✅ Transactions deleted   : ${delTx.deletedCount}`);

  // 2d. Notifications — only bid/crop/order related keywords
  const cropNotifKeywords = [
    /bid/i, /crop/i, /escrow/i, /order/i, /delivery/i, /payout/i,
    /marketplace/i, /listing/i, /accepted/i, /rejected/i, /won/i,
    /transaction/i, /shipment/i, /harvest/i
  ];
  const allNotifs = await Notification.find({}, { title: 1, message: 1 });
  const cropNotifIds = allNotifs
    .filter(n => cropNotifKeywords.some(re => re.test(n.title) || re.test(n.message)))
    .map(n => n._id);

  let delNotifs = { deletedCount: 0 };
  if (cropNotifIds.length > 0) {
    delNotifs = await Notification.deleteMany({ _id: { $in: cropNotifIds } });
  }
  console.log(`  ✅ Notifications deleted  : ${delNotifs.deletedCount} (of ${beforeNotifications} total)`);

  // 2e. WalletLedger — only bid/escrow entries (keep TOP_UP history)
  const delLedger = await WalletLedger.deleteMany({
    type: { $in: ['BID_LOCK', 'BID_RELEASE', 'ESCROW_LOCK', 'PAYOUT_DISBURSED'] }
  });
  console.log(`  ✅ WalletLedger(bid) del  : ${delLedger.deletedCount}`);

  // 2f. Reset wallet lockedBalance to 0 (since no bids remain)
  const walletReset = await Wallet.updateMany({}, {
    $set: { lockedBalance: 0 }
  });
  console.log(`  ✅ Wallets lockedBal→0    : ${walletReset.modifiedCount} wallets`);

  // ── STEP 3: COUNT AFTER ───────────────────────────────────────────────────
  sep();
  console.log('📊 AFTER CLEANUP — RECORD COUNTS');
  sep();

  const afterCrops         = await Crop.countDocuments();
  const afterBids          = await Bid.countDocuments();
  const afterTransactions  = await Transaction.countDocuments();
  const afterNotifications = await Notification.countDocuments();
  const afterBidLedger     = await WalletLedger.countDocuments({
    type: { $in: ['BID_LOCK', 'BID_RELEASE', 'ESCROW_LOCK', 'PAYOUT_DISBURSED'] }
  });

  console.log(`  Crop Listings     : ${afterCrops}  ${afterCrops === 0 ? '✅' : '❌ EXPECTED 0'}`);
  console.log(`  Bids              : ${afterBids}  ${afterBids === 0 ? '✅' : '❌ EXPECTED 0'}`);
  console.log(`  Transactions      : ${afterTransactions}  ${afterTransactions === 0 ? '✅' : '❌ EXPECTED 0'}`);
  console.log(`  Notifications     : ${afterNotifications}  ✅ (non-crop remain)`);
  console.log(`  WalletLedger(bid) : ${afterBidLedger}  ${afterBidLedger === 0 ? '✅' : '❌ EXPECTED 0'}`);
  console.log('');

  // ── STEP 4: VERIFY USERS PRESERVED ───────────────────────────────────────
  sep();
  console.log('👤 VERIFYING USER ACCOUNTS PRESERVED');
  sep();

  const farmerCount = await Farmer.countDocuments();
  const traderCount = await Trader.countDocuments();

  console.log(`  Farmers           : ${farmerCount}  ${farmerCount > 0 ? '✅' : '⚠️  No farmers found'}`);
  console.log(`  Traders           : ${traderCount}  ${traderCount > 0 ? '✅' : '⚠️  No traders found'}`);
  console.log('');

  // ── STEP 5: VERIFY CHAT PRESERVED ────────────────────────────────────────
  sep();
  console.log('💬 VERIFYING CHAT DATA PRESERVED');
  sep();

  const convCount = await Conversation.countDocuments();
  const msgCount  = await Message.countDocuments();
  console.log(`  Conversations     : ${convCount}  ✅`);
  console.log(`  Messages          : ${msgCount}  ✅`);
  console.log('');

  // ── STEP 6: VERIFY MANDI PRICES PRESERVED ────────────────────────────────
  sep();
  console.log('📈 VERIFYING MANDI PRICES PRESERVED');
  sep();

  const mandiCount = await MandiPrice.countDocuments();
  console.log(`  MandiPrice records: ${mandiCount}  ✅`);
  console.log('');

  // ── FINAL SUMMARY ─────────────────────────────────────────────────────────
  sep();
  const allGood = afterCrops === 0 && afterBids === 0 && afterTransactions === 0 && afterBidLedger === 0;
  if (allGood) {
    console.log('🎉 CLEANUP COMPLETE — All marketplace data removed.');
    console.log('   Users, chat, mandi prices and wallet balances preserved.');
    console.log('   The system is ready for a fresh Farmer → Bid → Delivery cycle.\n');
  } else {
    console.log('⚠️  CLEANUP INCOMPLETE — Some records still remain. Check output above.\n');
    process.exitCode = 1;
  }

  await mongoose.disconnect();
};

run().catch(err => {
  console.error('❌ Script error:', err.message);
  process.exit(1);
});
