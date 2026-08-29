const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const Farmer = require('../models/Farmer');
const Trader = require('../models/Trader');
const Crop = require('../models/Crop');
const Bid = require('../models/Bid');
const Transaction = require('../models/Transaction');
const redisClient = require('../config/redis');

dotenv.config();

async function inspectAndClean() {
  await connectDB();
  console.log('Connected to MongoDB');

  // 1. Identify Seed Farmers
  const seedFarmers = await Farmer.find({
    email: { $regex: /^farmer\d+@krishisetu\.com$/i }
  });
  console.log(`Found ${seedFarmers.length} seed/demo farmers (farmer1-20@krishisetu.com)`);
  const seedFarmerIds = seedFarmers.map(f => f._id);

  // 2. Identify Seed Traders
  const seedTraders = await Trader.find({
    email: { $regex: /^trader\d+@krishisetu\.com$/i }
  });
  console.log(`Found ${seedTraders.length} seed/demo traders (trader1-10@krishisetu.com)`);
  const seedTraderIds = seedTraders.map(t => t._id);

  // 3. Identify Seed Crops (belonging to seed farmers or orphan)
  const seedCrops = await Crop.find({
    $or: [
      { farmer: { $in: seedFarmerIds } },
      { farmer: null }
    ]
  });
  console.log(`Found ${seedCrops.length} fake seed crops created by seedData.js`);
  const seedCropIds = seedCrops.map(c => c._id);

  // 4. Identify Genuine Farmers & Crops
  const realFarmers = await Farmer.find({
    _id: { $nin: seedFarmerIds }
  });
  console.log(`\nLegitimate Registered Farmers (${realFarmers.length}):`);
  realFarmers.forEach(f => console.log(` - ID: ${f._id} | Name: ${f.name} | Email: ${f.email}`));

  const realCrops = await Crop.find({
    _id: { $nin: seedCropIds }
  }).populate('farmer', 'name email');
  console.log(`\nLegitimate Farmer Crops (${realCrops.length}):`);
  realCrops.forEach(c => console.log(` - Crop ID: ${c._id} | Name: ${c.name} | Farmer: ${c.farmer?.name} (${c.farmer?.email}) | Price: ₹${c.basePrice}`));

  // 5. Delete Seed Records Cleanly
  console.log('\n--- CLEANING UP DEVELOPMENT SEED RECORDS ---');
  const deletedCrops = await Crop.deleteMany({ _id: { $in: seedCropIds } });
  console.log(`Deleted ${deletedCrops.deletedCount} seed crop documents.`);

  const deletedBids = await Bid.deleteMany({
    $or: [
      { farmer: { $in: seedFarmerIds } },
      { trader: { $in: seedTraderIds } },
      { crop: { $in: seedCropIds } }
    ]
  });
  console.log(`Deleted ${deletedBids.deletedCount} seed bid documents.`);

  const deletedTransactions = await Transaction.deleteMany({
    $or: [
      { farmer: { $in: seedFarmerIds } },
      { trader: { $in: seedTraderIds } },
      { cropListing: { $in: seedCropIds } }
    ]
  });
  console.log(`Deleted ${deletedTransactions.deletedCount} seed transaction documents.`);

  const deletedFarmers = await Farmer.deleteMany({ _id: { $in: seedFarmerIds } });
  console.log(`Deleted ${deletedFarmers.deletedCount} seed farmer accounts.`);

  const deletedTraders = await Trader.deleteMany({ _id: { $in: seedTraderIds } });
  console.log(`Deleted ${deletedTraders.deletedCount} seed trader accounts.`);

  // 6. Invalidate Redis Cache
  try {
    await redisClient.incr('crops_feed_version');
    console.log('Bumped crops_feed_version in Redis cache.');
  } catch (err) {
    console.warn('Redis cache bump notice:', err.message);
  }

  console.log('\n✅ Database Cleanup Complete. MongoDB contains ONLY legitimate user records.');
  process.exit(0);
}

inspectAndClean().catch(err => {
  console.error('Error during cleanup:', err);
  process.exit(1);
});
