const cron = require('node-cron');
const { fetchAgmarknetPrices } = require('../services/priceService');
const { saveSchemesToDB } = require('../services/schemeService');

const initCronJobs = () => {
  // Run every day at midnight to update Mandi Prices
  cron.schedule('0 0 * * *', async () => {
    console.log('[CRON] Running daily Mandi price update...');
    await fetchAgmarknetPrices();
  });

  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily Government Scheme scraper...');
    await saveSchemesToDB();
  });
};

module.exports = { initCronJobs };
