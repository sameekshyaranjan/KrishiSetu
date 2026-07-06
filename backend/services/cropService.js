const Crop = require('../models/Crop');
const { createNotification } = require('../utils/createNotification');

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

module.exports = { sendHarvestReminders };
