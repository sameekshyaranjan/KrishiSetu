const connectDB = require('../config/db');
const { fetchAgmarknetPrices } = require('../services/priceService');
const dotenv = require('dotenv');

dotenv.config();

const runSync = async () => {
  try {
    console.log('[Live Sync] Connecting to MongoDB Atlas...');
    await connectDB();
    console.log('[Live Sync] Triggering live Agmarknet price sync...');
    await fetchAgmarknetPrices();
    console.log('==============================================');
    console.log('✅ LIVE AGMARKNET MANDI PRICES SYNCED TO MONGODB');
    console.log('==============================================');
    process.exit(0);
  } catch (err) {
    console.error('[Live Sync] Sync failed:', err);
    process.exit(1);
  }
};

runSync();
