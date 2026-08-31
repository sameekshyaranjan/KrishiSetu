const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Crop = require('../models/Crop');
const Farmer = require('../models/Farmer');
const Trader = require('../models/Trader');
const Admin = require('../models/Admin');
const Bid = require('../models/Bid');
const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const MandiPrice = require('../models/MandiPrice');
const redisClient = require('../config/redis');

const resetHarvestedCrops = async () => {
  console.log('===============================================================');
  console.log('🌾 KRISHISETU — DEVELOPMENT HARVESTED CROP DATA CLEANUP');
  console.log('===============================================================\n');

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas\n');

    // 1. Snapshot Counts BEFORE cleanup
    const beforeCounts = {
      totalCrops: await Crop.countDocuments(),
      harvestedCrops: await Crop.countDocuments({ harvestStatus: 'post-harvest' }),
      soldCrops: await Crop.countDocuments({ status: 'sold' }),
      preHarvestCrops: await Crop.countDocuments({ harvestStatus: 'pre-harvest' }),
      farmers: await Farmer.countDocuments(),
      traders: await Trader.countDocuments(),
      admins: await Admin.countDocuments(),
      bids: await Bid.countDocuments(),
      transactions: await Transaction.countDocuments(),
      wallets: await Wallet.countDocuments(),
      mandiPrices: await MandiPrice.countDocuments()
    };

    console.log('📊 DATABASE ENTITY COUNTS (BEFORE CLEANUP):');
    console.log('--------------------------------------------------');
    console.log(`🌾 Harvested Crops (To Delete):   ${beforeCounts.harvestedCrops}`);
    console.log(`📦 Sold / Dispatched Lots:        ${beforeCounts.soldCrops}`);
    console.log(`🌱 Pre-Harvest Crops:             ${beforeCounts.preHarvestCrops}`);
    console.log(`👨‍🌾 Farmers (Preserved):          ${beforeCounts.farmers}`);
    console.log(`💼 Traders (Preserved):          ${beforeCounts.traders}`);
    console.log(`🛡️ Admins (Preserved):           ${beforeCounts.admins}`);
    console.log(`💰 Bids (Preserved):             ${beforeCounts.bids}`);
    console.log(`📜 Transactions (Preserved):     ${beforeCounts.transactions}`);
    console.log(`🏛️ Wallets (Preserved):          ${beforeCounts.wallets}`);
    console.log(`📈 Mandi Price Records:         ${beforeCounts.mandiPrices}`);
    console.log('--------------------------------------------------\n');

    // 2. Delete ALL existing test harvested crop records (harvestStatus: 'post-harvest' or status: 'sold')
    console.log('🗑️ Deleting existing test harvested crop records...');
    const deleteRes = await Crop.deleteMany({
      $or: [
        { harvestStatus: 'post-harvest' },
        { status: 'sold' }
      ]
    });
    console.log(`   ✅ Deleted ${deleteRes.deletedCount} harvested crop documents from MongoDB Atlas.\n`);

    // 3. Invalidate Redis crop feeds cache
    console.log('⚡ Invalidating Redis crop cache...');
    if (redisClient) {
      try {
        if (typeof redisClient.incr === 'function') {
          await redisClient.incr('crops_feed_version');
        }
        console.log('   ✅ Redis crops_feed_version incremented.');
      } catch (e) {
        console.warn('   Redis notice:', e.message);
      }
    }

    // 4. Snapshot Counts AFTER cleanup
    const afterCounts = {
      totalCrops: await Crop.countDocuments(),
      harvestedCrops: await Crop.countDocuments({ harvestStatus: 'post-harvest' }),
      soldCrops: await Crop.countDocuments({ status: 'sold' }),
      preHarvestCrops: await Crop.countDocuments({ harvestStatus: 'pre-harvest' }),
      farmers: await Farmer.countDocuments(),
      traders: await Trader.countDocuments(),
      admins: await Admin.countDocuments(),
      bids: await Bid.countDocuments(),
      transactions: await Transaction.countDocuments(),
      wallets: await Wallet.countDocuments(),
      mandiPrices: await MandiPrice.countDocuments()
    };

    console.log('\n📊 DATABASE ENTITY COUNTS (AFTER CLEANUP):');
    console.log('--------------------------------------------------');
    console.log(`🌾 Harvested Crops:              ${afterCounts.harvestedCrops} (Must be 0)`);
    console.log(`📦 Sold / Dispatched Lots:        ${afterCounts.soldCrops} (Must be 0)`);
    console.log(`🌱 Pre-Harvest Crops (Preserved): ${afterCounts.preHarvestCrops}`);
    console.log(`👨‍🌾 Farmers (Preserved):          ${afterCounts.farmers}`);
    console.log(`💼 Traders (Preserved):          ${afterCounts.traders}`);
    console.log(`🛡️ Admins (Preserved):           ${afterCounts.admins}`);
    console.log(`💰 Bids (Preserved):             ${afterCounts.bids}`);
    console.log(`📜 Transactions (Preserved):     ${afterCounts.transactions}`);
    console.log(`🏛️ Wallets (Preserved):          ${afterCounts.wallets}`);
    console.log(`📈 Mandi Price Records:         ${afterCounts.mandiPrices}`);
    console.log('--------------------------------------------------\n');

    console.log('✨ HARVESTED CROP CLEANUP COMPLETED SUCCESSFULLY! ✨\n');

  } catch (err) {
    console.error('Error during cleanup:', err);
  } finally {
    await mongoose.disconnect();
  }
};

resetHarvestedCrops();
