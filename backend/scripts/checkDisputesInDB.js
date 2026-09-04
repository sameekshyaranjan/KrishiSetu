const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Dispute = require('../models/Dispute');
const Transaction = require('../models/Transaction');

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB.\n');

  const disputes = await Dispute.find();
  console.log(`Disputes count: ${disputes.length}`);
  console.log('Disputes:', JSON.stringify(disputes, null, 2));

  const txs = await Transaction.find().lean();
  console.log(`\nTransactions count: ${txs.length}`);
  txs.forEach(t => {
    console.log(`- Tx ID: ${t._id}, Amount: ${t.amount}, PaymentStatus: ${t.paymentStatus}, LogisticsStatus: ${t.logisticsStatus}, Farmer: ${t.farmer}, Trader: ${t.trader}`);
  });

  await mongoose.disconnect();
}

check().catch(console.error);
