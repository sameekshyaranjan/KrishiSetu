const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Trader = require('../models/Trader');
const Wallet = require('../models/Wallet');
const WalletLedger = require('../models/WalletLedger');
const Transaction = require('../models/Transaction');
const Bid = require('../models/Bid');

async function diagnose() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('📦 Connected to MongoDB Atlas\n');

  console.log('=== TRADERS & WALLETS ===');
  const traders = await Trader.find({}, { name: 1, email: 1, mobile: 1 });
  for (const t of traders) {
    const w = await Wallet.findOne({ trader: t._id });
    console.log(`Trader: ${t.name} (${t.email}) [ID: ${t._id}]`);
    if (w) {
      console.log(`  Wallet: availableBalance=₹${w.availableBalance}, lockedBalance=₹${w.lockedBalance}, totalDeposited=₹${w.totalDeposited}, totalDisbursed=₹${w.totalDisbursed}`);
    } else {
      console.log(`  Wallet: NONE`);
    }

    const txs = await Transaction.find({ trader: t._id });
    console.log(`  Transactions count: ${txs.length}`);
    for (const tx of txs) {
      console.log(`    TX [${tx._id}]: amount=₹${tx.amount}, paymentStatus=${tx.paymentStatus}, logisticsStatus=${tx.logisticsStatus}`);
    }

    const bids = await Bid.find({ trader: t._id });
    console.log(`  Bids count: ${bids.length}`);
    for (const b of bids) {
      console.log(`    Bid [${b._id}]: amount=₹${b.amount}, status=${b.status}`);
    }

    const ledgers = await WalletLedger.find({ trader: t._id });
    console.log(`  Ledgers count: ${ledgers.length}`);
    for (const l of ledgers) {
      console.log(`    Ledger [${l._id}]: type=${l.type}, amount=₹${l.amount}, status=${l.status}, desc=${l.description}`);
    }
    console.log('');
  }

  await mongoose.disconnect();
}

diagnose();
