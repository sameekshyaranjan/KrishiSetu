const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

// Delete leftover test traders (trader_iso_a/b) and verify
async function cleanTraders() {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;

  const deleted = await db.collection('traders').deleteMany({
    email: { $regex: /^trader_iso_/ }
  });
  console.log('Deleted leftover test traders:', deleted.deletedCount);

  const traders = await db.collection('traders').find({}).toArray();
  console.log('\nFINAL TRADERS (' + traders.length + '):');
  traders.forEach(t => console.log(' ', t.name, '|', t.email));

  // Invalidate Redis
  try {
    const redis = require('../config/redis');
    await redis.incr('crops_feed_version');
    console.log('Redis invalidated.');
  } catch (e) {}

  process.exit(0);
}
cleanTraders().catch(e => { console.error(e.message); process.exit(1); });
