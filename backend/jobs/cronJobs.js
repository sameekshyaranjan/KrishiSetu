const { cronQueue } = require('../config/bullmq');
const { fetchAgmarknetPrices, checkPriceAlerts } = require('../services/priceService');
const { saveSchemesToDB } = require('../services/schemeService');
const { sendHarvestReminders, expireStaleCrops } = require('../services/cropService');
const { revertUnpaidBids } = require('../services/bidService');

const initCronJobs = async () => {
  if (!cronQueue) {
    console.log('[Queue] In-Memory mode active (BullMQ cron queuing deferred).');
    return;
  }
  try {
    const repeatableJobs = await cronQueue.getRepeatableJobs();
    for (const job of repeatableJobs) {
      await cronQueue.removeRepeatableByKey(job.key);
    }
    await cronQueue.add('fetchAgmarknetPrices', {}, { repeat: { pattern: '0 0 * * *' } });
    await cronQueue.add('saveSchemesToDB', {}, { repeat: { pattern: '0 0 * * *' } });
    await cronQueue.add('checkPriceAlerts', {}, { repeat: { pattern: '30 0 * * *' } });
    await cronQueue.add('sendHarvestReminders', {}, { repeat: { pattern: '0 6 * * *' } });
    await cronQueue.add('expireStaleCrops', {}, { repeat: { pattern: '0 1 * * *' } });
    await cronQueue.add('revertUnpaidBids', {}, { repeat: { pattern: '0 * * * *' } });
    console.log('[Queue] Daily jobs successfully scheduled in BullMQ.');
  } catch (error) {
    console.warn('[Queue] Note: BullMQ queue scheduling deferred.');
  }
};

module.exports = { initCronJobs };
