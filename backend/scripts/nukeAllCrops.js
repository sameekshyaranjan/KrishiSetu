const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function nukeAllCrops() {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;

  const cropsBefore = await db.collection('crops').countDocuments();
  console.log('Crops before:', cropsBefore);

  // Delete all crops
  const deletedCrops = await db.collection('crops').deleteMany({});
  console.log('Deleted crops:', deletedCrops.deletedCount);

  // Delete all bids (no crops = no bids)
  const deletedBids = await db.collection('bids').deleteMany({});
  console.log('Deleted bids:', deletedBids.deletedCount);

  // Delete all transactions
  const deletedTx = await db.collection('transactions').deleteMany({});
  console.log('Deleted transactions:', deletedTx.deletedCount);

  // Invalidate Redis cache
  try {
    const redis = require('../config/redis');
    await redis.incr('crops_feed_version');
    console.log('Redis cache invalidated.');
  } catch (e) {
    console.warn('Redis skipped:', e.message);
  }

  const cropsAfter = await db.collection('crops').countDocuments();
  console.log('\nCrops after:', cropsAfter, '(should be 0)');
  console.log('Done. Marketplace is now completely empty.');
  process.exit(0);
}

nukeAllCrops().catch(e => { console.error(e.message); process.exit(1); });
