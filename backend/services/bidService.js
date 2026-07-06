const Bid = require('../models/Bid');
const Crop = require('../models/Crop');
const Trader = require('../models/Trader');
const Transaction = require('../models/Transaction');
const { createNotification } = require('../utils/createNotification');

const revertUnpaidBids = async () => {
  try {
    console.log('[CRON] Scanning for unpaid accepted bids...');
    
    // Find bids accepted more than 48 hours ago
    const timeLimit = new Date();
    timeLimit.setHours(timeLimit.getHours() - 48);

    const staleAcceptedBids = await Bid.find({
      status: 'accepted',
      updatedAt: { $lte: timeLimit }
    });

    let revertCount = 0;

    for (const bid of staleAcceptedBids) {
      // Check if there's a successful transaction for this bid
      const tx = await Transaction.findOne({
        bid: bid._id,
        paymentStatus: { $in: ['held_in_escrow', 'completed', 'payout_released'] }
      });

      if (!tx) {
        // Unpaid after 48 hours! Revert.
        bid.status = 'rejected';
        await bid.save();

        await Crop.findByIdAndUpdate(bid.crop, { status: 'available' });

        // Penalize the trader
        const trader = await Trader.findById(bid.trader);
        if (trader) {
          trader.penaltyCount = (trader.penaltyCount || 0) + 1;
          if (trader.penaltyCount >= 3) {
             trader.isSuspended = true;
          }
          await trader.save();
        }

        // Notify Farmer
        await createNotification(
          bid.farmer,
          'Farmer',
          'Bid Reverted - Unpaid',
          `A trader failed to pay for your crop within 48 hours. Your listing has been automatically reverted to 'available'.`
        );

        // Notify Trader
        await createNotification(
          bid.trader,
          'Trader',
          'Bid Cancelled & Penalty Applied',
          `Your accepted bid was cancelled due to non-payment within 48 hours. You have received a penalty strike.`
        );

        revertCount++;
      }
    }

    if (revertCount > 0) {
      console.log(`[ALERT] Auto-reverted ${revertCount} unpaid bids and penalized traders.`);
    } else {
      console.log('[CRON] No unpaid stale bids found.');
    }
  } catch (error) {
    console.error('Error reverting unpaid bids:', error);
  }
};

module.exports = { revertUnpaidBids };
