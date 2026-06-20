const cron = require('node-cron');
const { savePricesToDB } = require('../services/priceService');
const { saveSchemesToDB } = require('../services/schemeService');

const initCronJobs = () => {
  cron.schedule('0 6 * * *', async () => {
    console.log('Running daily Mandi price refresh...');
    await savePricesToDB();
  });

  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily Government Scheme scraper...');
    await saveSchemesToDB();
  });
};

module.exports = { initCronJobs };
