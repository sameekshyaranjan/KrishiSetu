const { cronQueue } = require('../config/bullmq');

const initCronJobs = async () => {
  try {
    // 1. Clear any existing repeatable jobs to prevent duplicates if the pattern changes
    const repeatableJobs = await cronQueue.getRepeatableJobs();
    for (const job of repeatableJobs) {
      await cronQueue.removeRepeatableByKey(job.key);
    }
    console.log('[Queue] Cleared old scheduled jobs.');

    // 2. Schedule the new jobs
    
    // Fetch Agmarknet Prices - Midnight every day
    await cronQueue.add('fetchAgmarknetPrices', {}, {
      repeat: { pattern: '0 0 * * *' }
    });

    // Scrape Government Schemes - Midnight every day
    await cronQueue.add('saveSchemesToDB', {}, {
      repeat: { pattern: '0 0 * * *' }
    });

    // Check Price Alerts - 12:30 AM every day
    await cronQueue.add('checkPriceAlerts', {}, {
      repeat: { pattern: '30 0 * * *' }
    });

    // Harvest Reminders - 6:00 AM every day
    await cronQueue.add('sendHarvestReminders', {}, {
      repeat: { pattern: '0 6 * * *' }
    });

    // Expire Stale Crops - 1:00 AM every day
    await cronQueue.add('expireStaleCrops', {}, {
      repeat: { pattern: '0 1 * * *' }
    });

    console.log('[Queue] Daily jobs successfully scheduled in BullMQ.');
  } catch (error) {
    console.error('[Queue] Error scheduling jobs:', error);
  }
};

module.exports = { initCronJobs };
