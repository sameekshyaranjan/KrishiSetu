const Crop = require('../models/Crop');
const { createNotification } = require('../utils/createNotification');
const redisClient = require('../config/redis');

const sendHarvestReminders = async () => {
  try {
    console.log('[CRON] Scanning for upcoming harvests...');
    
    // Calculate the date range: today to 7 days from now
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    nextWeek.setHours(23, 59, 59, 999);

    // Find all available crops with a harvest date in the next 7 days
    const upcomingCrops = await Crop.find({
      status: 'available',
      expectedHarvestDate: {
        $gte: today,
        $lte: nextWeek
      }
    }).populate('farmer');

    let notificationsSent = 0;

    for (const crop of upcomingCrops) {
      if (!crop.farmer) continue;

      const timeDiff = crop.expectedHarvestDate.getTime() - today.getTime();
      const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      const message = `Reminder: Your crop "${crop.name}" is scheduled for harvest in ${daysLeft} days. Don't forget to review pending bids or update your listing!`;
      
      await createNotification(
        crop.farmer._id,
        'Farmer',
        'Harvest Reminder',
        message
      );
      notificationsSent++;
    }

    console.log(`[ALERT] Sent ${notificationsSent} harvest reminders.`);
  } catch (error) {
    console.error('Error sending harvest reminders:', error);
  }
};

const expireStaleCrops = async () => {
  try {
    console.log('[CRON] Scanning for stale crop listings...');
    
    const now = new Date();
    
    const perishableDate = new Date();
    perishableDate.setDate(now.getDate() - 14);

    const nonPerishableDate = new Date();
    nonPerishableDate.setDate(now.getDate() - 60);

    const perishableCategories = ['vegetables', 'fruits', 'flowers']; // flowers not in enum but safe check
    
    // Find expired perishables
    const expiredPerishables = await Crop.find({
      status: 'available',
      category: { $in: perishableCategories },
      createdAt: { $lte: perishableDate }
    });

    // Find expired non-perishables
    const expiredNonPerishables = await Crop.find({
      status: 'available',
      category: { $nin: perishableCategories },
      createdAt: { $lte: nonPerishableDate }
    });

    const allExpired = [...expiredPerishables, ...expiredNonPerishables];

    if (allExpired.length > 0) {
      const expiredIds = allExpired.map(crop => crop._id);
      
      await Crop.updateMany(
        { _id: { $in: expiredIds } },
        { status: 'expired' }
      );

      for (const crop of allExpired) {
        await createNotification(
          crop.farmer,
          'Farmer',
          'Listing Expired',
          `Your listing for ${crop.name} has expired because it was inactive for too long. Please renew it if you still wish to sell.`
        );
      }

      await redisClient.incr('crops_feed_version');
      console.log(`[ALERT] Auto-expired ${allExpired.length} stale listings.`);
    } else {
      console.log('[CRON] No stale listings found.');
    }
  } catch (error) {
    console.error('Error expiring stale crops:', error);
  }
};

module.exports = { sendHarvestReminders, expireStaleCrops };
