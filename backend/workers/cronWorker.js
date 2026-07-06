const { Worker } = require('bullmq');
const redisClient = require('../config/redis');
const { fetchAgmarknetPrices, checkPriceAlerts } = require('../services/priceService');
const { saveSchemesToDB } = require('../services/schemeService');

console.log('[Worker] Booting up cronWorker...');

const cronWorker = new Worker('cronQueue', async (job) => {
  console.log(`[Worker] Processing job: ${job.name} (ID: ${job.id})`);
  
  switch(job.name) {
    case 'fetchAgmarknetPrices':
      await fetchAgmarknetPrices();
      break;
    case 'checkPriceAlerts':
      await checkPriceAlerts();
      break;
    case 'saveSchemesToDB':
      await saveSchemesToDB();
      break;
    default:
      console.warn(`[Worker] Unknown job name: ${job.name}`);
  }
}, { 
  connection: redisClient 
});

cronWorker.on('completed', (job) => {
  console.log(`[Worker] Job ${job.name} completed successfully.`);
});

cronWorker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job.name} failed with error: ${err.message}`);
});

module.exports = cronWorker;
