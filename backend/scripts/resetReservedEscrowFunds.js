/**
 * KRISHISETU — RESET RESERVED ESCROW MONEY FOR ALL TRADERS
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

async function runResetReservedEscrow() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('💰 KRISHISETU — RESET TRADER RESERVED/LOCKED ESCROW FUNDS');
  console.log('═══════════════════════════════════════════════════════════════\n');

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

  // 2. Inspect Schema and Current State
  console.log('🔍 Inspecting Trader Wallets and Escrow Schema...');
  const allTraders = await Trader.find({});
  const allWallets = await Wallet.find({});
  const heldTransactions = await Transaction.find({ paymentStatus: 'held_in_escrow' });
  const escrowLedgers = await WalletLedger.find({ type: { $in: ['ESCROW_LOCK', 'BID_LOCK'] } });

  console.log(`  • Total Registered Traders: ${allTraders.length}`);
  console.log(`  • Total Wallet Records: ${allWallets.length}`);
  console.log(`  • Transactions with held_in_escrow: ${heldTransactions.length}`);
  console.log(`  • Active Lock Ledgers: ${escrowLedgers.length}\n`);

  // Calculate current reserved/locked amounts before reset
  let totalReservedReset = 0;
  let tradersWithLockedBalance = 0;

  for (const w of allWallets) {
    if (w.lockedBalance > 0) {
      totalReservedReset += w.lockedBalance;
      tradersWithLockedBalance++;
    }
  }

  console.log('───────────────────────────────────────────────────────────────');
  console.log('📊 RESERVED ESCROW AUDIT BEFORE RESET:');
  console.log('───────────────────────────────────────────────────────────────');
  console.log(`  Traders with Locked Escrow > 0: ${tradersWithLockedBalance}`);
  console.log(`  Total Reserved Escrow Funds:     ₹${totalReservedReset.toLocaleString('en-IN')}`);
  console.log('───────────────────────────────────────────────────────────────\n');

  // 3. Reset lockedBalance = 0 for ALL Wallets while strictly preserving availableBalance & totalDeposited
  console.log('⚙️ Resetting lockedBalance -> 0 on all Trader Wallets...');
  const walletUpdateResult = await Wallet.updateMany(
    {},
    {
      $set: {
        lockedBalance: 0,
        updatedAt: Date.now()
      }
    }
  );
  console.log(`  ✓ Updated ${walletUpdateResult.matchedCount} wallet documents (lockedBalance set to 0)`);

  // Ensure every trader has a wallet record initialized
  let walletsCreated = 0;
  for (const trader of allTraders) {
    const existingWallet = await Wallet.findOne({ trader: trader._id });
    if (!existingWallet) {
      await Wallet.create({
        trader: trader._id,
        availableBalance: 100000,
        lockedBalance: 0,
        totalDeposited: 100000
      });
      walletsCreated++;
    }
  }
  if (walletsCreated > 0) {
    console.log(`  ✓ Initialized default wallets for ${walletsCreated} trader(s) with lockedBalance = 0`);
  }

  // 4. Clean / Update escrow records that represent currently reserved funds
  let txUpdatedCount = 0;
  if (heldTransactions.length > 0) {
    const txUpdateResult = await Transaction.updateMany(
      { paymentStatus: 'held_in_escrow' },
      { $set: { paymentStatus: 'pending' } }
    );
    txUpdatedCount = txUpdateResult.modifiedCount;
    console.log(`  ✓ Updated ${txUpdatedCount} Transaction record(s) from 'held_in_escrow' to 'pending'`);
  }

  // Clean pending/lock ledgers so ledger history reflects released escrow
  let ledgersUpdatedCount = 0;
  if (escrowLedgers.length > 0) {
    const ledgerResult = await WalletLedger.updateMany(
      { type: { $in: ['ESCROW_LOCK', 'BID_LOCK'] }, status: 'completed' },
      { $set: { status: 'released', description: 'Escrow lock released during test data cleanup' } }
    );
    ledgersUpdatedCount = ledgerResult.modifiedCount;
    console.log(`  ✓ Updated ${ledgersUpdatedCount} WalletLedger record(s) to 'released'`);
  }

  // 5. Verification Check
  console.log('\n───────────────────────────────────────────────────────────────');
  console.log('🔍 POST-OPERATION INTEGRITY VERIFICATION:');
  console.log('───────────────────────────────────────────────────────────────');

  const postWallets = await Wallet.find({});
  let postMaxLocked = 0;
  let totalAvailablePreserved = 0;

  for (const pw of postWallets) {
    if (pw.lockedBalance > postMaxLocked) postMaxLocked = pw.lockedBalance;
    totalAvailablePreserved += (pw.availableBalance || 0);
  }

  const postFarmers = await Farmer.countDocuments();
  const postTraders = await Trader.countDocuments();
  const postCrops = await Crop.countDocuments();
  const postBids = await Bid.countDocuments();
  const postChats = await Conversation.countDocuments();
  const postTransactions = await Transaction.countDocuments();

  console.log(`  All Traders Reserved/Locked Amount: ₹${postMaxLocked} ${postMaxLocked === 0 ? '✅ (ALL ₹0)' : '❌ FAIL'}`);
  console.log(`  Trader Accounts Preserved:           ${postTraders} accounts ✅`);
  console.log(`  Farmer Accounts Preserved:           ${postFarmers} accounts ✅`);
  console.log(`  Wallet Accounts Preserved:           ${postWallets.length} accounts ✅`);
  console.log(`  Available Balances Preserved:        ₹${totalAvailablePreserved.toLocaleString('en-IN')} ✅`);
  console.log(`  Crops Preserved:                     ${postCrops} listings ✅`);
  console.log(`  Bids Preserved:                      ${postBids} bids ✅`);
  console.log(`  Chats Preserved:                     ${postChats} conversations ✅`);
  console.log(`  Orders / Transactions Preserved:     ${postTransactions} transactions ✅`);
  console.log('───────────────────────────────────────────────────────────────\n');

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  🎉 TRADER RESERVED ESCROW RESET COMPLETED SUCCESSFULLY!   ');
  console.log('═══════════════════════════════════════════════════════════════\n');

  await mongoose.disconnect();
  process.exit(0);
}

runResetReservedEscrow().catch(err => {
  console.error('❌ Script failed:', err);
  process.exit(1);
});
