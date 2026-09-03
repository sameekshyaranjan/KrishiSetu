const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function inspect() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB:', mongoose.connection.name);

  // Check collections
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('\nAvailable Collections in MongoDB:');
  for (const c of collections) {
    const count = await mongoose.connection.db.collection(c.name).countDocuments();
    console.log(` - ${c.name}: ${count} documents`);
  }

  // Check specific models
  const Crop = require('../models/Crop');
  const Bid = require('../models/Bid');
  const Transaction = require('../models/Transaction');
  const WalletLedger = require('../models/WalletLedger');
  const Wallet = require('../models/Wallet');
  const Farmer = require('../models/Farmer');
  const Trader = require('../models/Trader');
  const Admin = require('../models/Admin');
  const Notification = require('../models/Notification');
  const MandiPrice = require('../models/MandiPrice');

  const totalCrops = await Crop.countDocuments();
  const harvestedCrops = await Crop.countDocuments({ harvestStatus: { $in: ['harvested', 'post-harvest'] } });
  const totalBids = await Bid.countDocuments();
  const acceptedBids = await Bid.countDocuments({ status: 'accepted' });
  const totalTransactions = await Transaction.countDocuments();
  const escrowTransactions = await Transaction.countDocuments({ paymentStatus: { $in: ['held_in_escrow', 'payout_released', 'completed'] } });
  const cropLedgers = await WalletLedger.countDocuments({ type: { $in: ['ESCROW_LOCK', 'PAYOUT_DISBURSED'] } });
  const topupLedgers = await WalletLedger.countDocuments({ type: 'TOP_UP' });

  console.log('\n==============================');
  console.log('DETAILED BREAKDOWN:');
  console.log('==============================');
  console.log('Crop Listings:', totalCrops);
  console.log('Harvested Crops:', harvestedCrops);
  console.log('Bids:', totalBids);
  console.log('Accepted/Winning Bids:', acceptedBids);
  console.log('Crop Orders / Deliveries (Transactions):', totalTransactions);
  console.log('Crop-related Escrow Transactions:', escrowTransactions);
  console.log('Crop-related Wallet Ledgers:', cropLedgers);
  console.log('Top-Up Wallet Ledgers (to preserve):', topupLedgers);
  console.log('Farmers (to preserve):', await Farmer.countDocuments());
  console.log('Traders (to preserve):', await Trader.countDocuments());
  console.log('Admins (to preserve):', await Admin.countDocuments());
  console.log('Mandi Price Records (to preserve):', await MandiPrice.countDocuments());

  await mongoose.disconnect();
}

inspect().catch(err => {
  console.error(err);
  process.exit(1);
});
