const cron = require('node-cron');
const { savePricesToDB } = require('../services/priceService');

const initCronJobs = () => {
  cron.schedule('0 6 * * *', async () => {
    console.log('Running daily Mandi price refresh...');
    await savePricesToDB();
  });
};

module.exports = { initCronJobs };
