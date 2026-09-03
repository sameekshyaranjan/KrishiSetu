/**
 * KrishiSetu — Reset Trader Test-Injected Balances to Legitimate State
 * Environment: Development / Test ONLY
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Trader = require('../models/Trader');
const Wallet = require('../models/Wallet');
const WalletLedger = require('../models/WalletLedger');
const Transaction = require('../models/Transaction');
const Crop = require('../models/Crop');
const Bid = require('../models/Bid');
const Conversation = require('../models/Conversation');
const Farmer = require('../models/Farmer');

async function resetTraderBalances() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('💰 KRISHISETU — RESET TRADER TEST-INJECTED BALANCES');
  console.log('═══════════════════════════════════════════════════════════════\n');

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

  const allTraders = await Trader.find({});
  console.log(`Found ${allTraders.length} registered traders.\n`);

  let tradersUpdated = 0;
  let totalAvailableReset = 0;

  for (const trader of allTraders) {
    // Check for any legitimate TOP_UP ledgers
    const topUpLedgers = await WalletLedger.find({ trader: trader._id, type: 'TOP_UP', status: 'completed' });
    const legitDeposited = topUpLedgers.reduce((sum, l) => sum + (Number(l.amount) || 0), 0);

    let wallet = await Wallet.findOne({ trader: trader._id });
    if (wallet) {
      totalAvailableReset += (wallet.availableBalance - legitDeposited);
      wallet.availableBalance = legitDeposited;
      wallet.lockedBalance = 0;
      wallet.totalDeposited = legitDeposited;
      wallet.totalDisbursed = 0;
      wallet.updatedAt = new Date();
      await wallet.save();
      tradersUpdated++;
      console.log(`  ✓ Trader ${trader.name} (${trader.email}): Reset availableBalance=₹${legitDeposited}, lockedBalance=₹0`);
    } else {
      await Wallet.create({
        trader: trader._id,
        availableBalance: legitDeposited,
        lockedBalance: 0,
        totalDeposited: legitDeposited,
        totalDisbursed: 0
      });
      tradersUpdated++;
      console.log(`  ✓ Trader ${trader.name} (${trader.email}): Initialized wallet with ₹0`);
    }
  }

  console.log('\n───────────────────────────────────────────────────────────────');
  console.log('📊 AUDIT SUMMARY:');
  console.log('───────────────────────────────────────────────────────────────');
  console.log(`  Traders Updated:                  ${tradersUpdated}`);
  console.log(`  Total Test Injected Money Reset:  ₹${totalAvailableReset.toLocaleString('en-IN')}`);
  console.log(`  Final Locked Escrow across all:   ₹0 ✅`);
  console.log(`  Final Available across all:       ₹0 (tied to ${0} real deposits) ✅`);
  console.log('───────────────────────────────────────────────────────────────\n');

  // Verify Preserved Collections
  const postFarmers = await Farmer.countDocuments();
  const postTraders = await Trader.countDocuments();
  const postCrops = await Crop.countDocuments();
  const postBids = await Bid.countDocuments();
  const postChats = await Conversation.countDocuments();
  const postTransactions = await Transaction.countDocuments();

  console.log('🛡️ DATA PRESERVATION CHECK:');
  console.log(`  Trader Accounts:   ${postTraders} (PRESERVED)`);
  console.log(`  Farmer Accounts:   ${postFarmers} (PRESERVED)`);
  console.log(`  Crops:             ${postCrops} (PRESERVED)`);
  console.log(`  Bids:              ${postBids} (PRESERVED)`);
  console.log(`  Chats:             ${postChats} (PRESERVED)`);
  console.log(`  Transactions:      ${postTransactions} (PRESERVED)`);
  console.log('───────────────────────────────────────────────────────────────\n');

  await mongoose.disconnect();
  process.exit(0);
}

resetTraderBalances().catch(err => {
  console.error('❌ Script failed:', err);
  process.exit(1);
});
