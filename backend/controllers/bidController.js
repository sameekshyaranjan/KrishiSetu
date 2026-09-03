const Bid = require('../models/Bid');
const Crop = require('../models/Crop');
const { createNotification } = require('../utils/createNotification');
const { paginate } = require('../utils/paginate');
const redisClient = require('../config/redis');

const placeBid = async (req, res, next) => {
  try {
    const { cropId, amount, message } = req.body;

    const crop = await Crop.findById(cropId);
    if (!crop) {
      return res.status(404).json({ message: 'Crop listing not found' });
    }

    if (crop.status !== 'available') {
      return res.status(400).json({ message: 'This crop listing is no longer available for bidding' });
    }

    if (amount < crop.basePrice) {
      return res.status(400).json({ message: `Bid amount must be at least the base price of ${crop.basePrice}` });
    }

    const bid = await Bid.create({
      crop: cropId,
      farmer: crop.farmer,
      trader: req.user.id,
      amount,
      message
    });

    createNotification(
      crop.farmer,
      'Farmer',
      'New Bid Received',
      `A trader has placed a bid of ₹${amount} for your crop listing.`
    );

    res.status(201).json(bid);
  } catch (error) {
    next(error);
  }
};

const getBidsForListing = async (req, res, next) => {
  try {
    const result = await paginate(
      Bid,
      { crop: req.params.cropId },
      req.query.page,
      req.query.limit,
      { path: 'trader', select: 'name mobile companyName' },
      { amount: -1 }
    );

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getMyBids = async (req, res, next) => {
  try {
    const isFarmer = req.user.role === 'farmer';
    const filter = isFarmer ? { farmer: req.user.id } : { trader: req.user.id };
    const populatePaths = isFarmer 
      ? [
          { path: 'crop', select: 'name category basePrice status quantity unit images district description' },
          { path: 'trader', select: 'name mobile companyName district' }
        ]
      : [
          { path: 'crop', select: 'name category basePrice status quantity unit images district description' },
          { path: 'farmer', select: 'name village district mobile' }
        ];

    const result = await paginate(
      Bid,
      filter,
      req.query.page,
      req.query.limit,
      populatePaths,
      { createdAt: -1 }
    );

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const updateBid = async (req, res, next) => {
  try {
    const bid = await Bid.findById(req.params.id);

    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    if (bid.trader.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to update this bid' });
    }

    if (bid.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending bids can be updated' });
    }

    const { amount, message } = req.body;
    bid.amount = amount || bid.amount;
    bid.message = message || bid.message;

    const updatedBid = await bid.save();

    createNotification(
      bid.farmer,
      'Farmer',
      'Bid Updated',
      `A trader has updated their bid to ₹${amount}.`
    );

    res.status(200).json(updatedBid);
  } catch (error) {
    next(error);
  }
};

const withdrawBid = async (req, res, next) => {
  try {
    const bid = await Bid.findById(req.params.id).populate('crop');

    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    if (bid.trader.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to cancel this bid' });
    }

    if (bid.status === 'accepted') {
      return res.status(400).json({ message: 'This bid has already been accepted and cannot be cancelled.' });
    }

    if (bid.status === 'cancelled' || bid.status === 'withdrawn') {
      return res.status(400).json({ message: 'This bid has already been cancelled.' });
    }

    if (bid.status !== 'pending') {
      return res.status(400).json({ message: 'Only active pending bids can be cancelled.' });
    }

    bid.status = 'cancelled';
    await bid.save();

    createNotification(
      bid.farmer,
      'Farmer',
      'Bid Cancelled',
      `A trader has cancelled their bid of ₹${bid.amount} for your crop listing.`
    );

    res.status(200).json({ message: 'Bid cancelled successfully', bid });
  } catch (error) {
    next(error);
  }
};

const respondToBid = async (req, res, next) => {
  try {
    const { status, expectedAmount } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be either accepted or rejected' });
    }

    const bid = await Bid.findById(req.params.id);
    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    if (bid.farmer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to respond to this bid' });
    }

    // Strict validation: cannot accept cancelled or already accepted bids
    if (bid.status === 'cancelled' || bid.status === 'withdrawn') {
      return res.status(400).json({ message: 'This bid has already been cancelled by the trader and cannot be accepted.' });
    }

    if (bid.status === 'accepted') {
      return res.status(400).json({ message: 'This bid has already been accepted.' });
    }

    if (bid.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending bids can be responded to.' });
    }

    if (status === 'accepted') {
      const verifiedExpectedAmount = expectedAmount || bid.amount;
      if (bid.amount !== verifiedExpectedAmount) {
        return res.status(409).json({ message: `The trader has updated this bid amount to ₹${bid.amount}. Please review the new amount before accepting.` });
      }

      // Verify crop ownership and availability
      const crop = await Crop.findById(bid.crop);
      if (!crop || crop.farmer.toString() !== req.user.id) {
        return res.status(403).json({ message: 'You are not authorized to accept bids for this crop.' });
      }

      const lockAmount = Number(bid.amount);
      const Wallet = require('../models/Wallet');
      const WalletLedger = require('../models/WalletLedger');

      // Verify trader has sufficient available balance in escrow wallet
      const traderWallet = await Wallet.findOne({ trader: bid.trader });
      if (!traderWallet || traderWallet.availableBalance < lockAmount) {
        return res.status(400).json({
          message: `Insufficient available balance in trader escrow wallet (Available: ₹${traderWallet ? traderWallet.availableBalance.toLocaleString('en-IN') : 0}, Required: ₹${lockAmount.toLocaleString('en-IN')}) to secure this bid.`
        });
      }

      // Atomically mark crop as sold (prevents race condition of double acceptance)
      const updatedCrop = await Crop.findOneAndUpdate(
        { _id: bid.crop, status: 'available', farmer: req.user.id },
        { status: 'sold' },
        { new: true }
      );

      if (!updatedCrop) {
        return res.status(400).json({ message: 'This crop is no longer available. It may have already been sold or removed.' });
      }

      // Atomically move trader capital: availableBalance -> lockedBalance
      const updatedWallet = await Wallet.findOneAndUpdate(
        { trader: bid.trader, availableBalance: { $gte: lockAmount } },
        {
          $inc: { availableBalance: -lockAmount, lockedBalance: lockAmount },
          $set: { updatedAt: Date.now() }
        },
        { new: true }
      );

      if (!updatedWallet) {
        // Rollback crop availability if lock fails
        await Crop.findByIdAndUpdate(bid.crop, { status: 'available' });
        return res.status(400).json({
          message: `Insufficient available balance in trader escrow wallet to secure this bid.`
        });
      }

      // Create immutable WalletLedger ESCROW_LOCK record
      await WalletLedger.create({
        trader: bid.trader,
        wallet: updatedWallet._id,
        type: 'ESCROW_LOCK',
        amount: lockAmount,
        balanceAfter: updatedWallet.availableBalance,
        status: 'completed',
        source: 'DEVELOPMENT_SANDBOX',
        paymentMethod: 'Escrow Vault Lock',
        description: `Escrow locked for accepted bid on ${updatedCrop.name}`,
        referenceId: String(bid._id)
      });

      // Reject all other pending bids for this crop
      const otherBids = await Bid.find({ crop: bid.crop, _id: { $ne: bid._id }, status: 'pending' });
      
      if (otherBids.length > 0) {
        await Bid.updateMany(
          { crop: bid.crop, _id: { $ne: bid._id }, status: 'pending' },
          { status: 'rejected' }
        );

        for (const otherBid of otherBids) {
          createNotification(
            otherBid.trader,
            'Trader',
            'Bid Rejected',
            `Your bid for ${updatedCrop.name} was rejected because the crop was sold to another trader.`
          );
        }
      }

      // Instantiate/Update Transaction record with held_in_escrow and pending logistics
      const Transaction = require('../models/Transaction');
      
      await Transaction.findOneAndUpdate(
        { bid: bid._id },
        {
          farmer: bid.farmer,
          trader: bid.trader,
          cropListing: bid.crop,
          bid: bid._id,
          amount: lockAmount,
          paymentStatus: 'held_in_escrow',
          logisticsStatus: 'pending',
          paymentMethod: 'manual',
          transactionDate: new Date()
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      await redisClient.incr('crops_feed_version');

      bid.status = 'accepted';
      await bid.save();

      createNotification(
        bid.trader,
        'Trader',
        'Bid Accepted & Escrow Locked',
        `Your bid of ₹${lockAmount.toLocaleString('en-IN')} for ${updatedCrop.name} was accepted! ₹${lockAmount.toLocaleString('en-IN')} is locked in escrow. Please upload vehicle details for pickup.`
      );

      createNotification(
        bid.farmer,
        'Farmer',
        'Bid Accepted & Escrow Secured',
        `You accepted the bid of ₹${lockAmount.toLocaleString('en-IN')} for ${updatedCrop.name}. Escrow is locked. Awaiting trader vehicle details.`
      );

      return res.status(200).json({ message: 'Bid accepted successfully and escrow locked', bid });
    }

    // If rejecting the bid
    bid.status = status;
    await bid.save();

    createNotification(
      bid.trader,
      'Trader',
      'Bid Rejected',
      `Your bid was declined by the farmer.`
    );

    res.status(200).json({ message: `Bid ${status} successfully`, bid });
  } catch (error) {
    next(error);
  }
};

const undoAcceptBid = async (req, res, next) => {
  try {
    const bid = await Bid.findById(req.params.id);
    if (!bid) return res.status(404).json({ message: 'Bid not found' });
    
    if (bid.farmer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to undo this bid' });
    }

    if (bid.status !== 'accepted') {
      return res.status(400).json({ message: 'Can only undo accepted bids' });
    }

    // Check if within 15 minutes cooling off period
    const timeDiff = Date.now() - bid.updatedAt.getTime();
    if (timeDiff > 15 * 60 * 1000) {
      return res.status(400).json({ message: 'Cooling off period (15 minutes) has expired. Cannot undo.' });
    }

    // Check if trader has already initiated payment
    const Transaction = require('../models/Transaction');
    const tx = await Transaction.findOne({ bid: bid._id });
    if (tx && tx.paymentStatus !== 'failed') {
      return res.status(400).json({ message: 'Trader has already initiated payment. Cannot undo.' });
    }

    bid.status = 'pending';
    await bid.save();

    await Crop.findByIdAndUpdate(bid.crop, { status: 'available' });

    // Restore other bids that were rejected during the fat-finger acceptance
    const recentTime = new Date(Date.now() - 16 * 60 * 1000);
    await Bid.updateMany(
      { crop: bid.crop, status: 'rejected', updatedAt: { $gte: recentTime } },
      { status: 'pending' }
    );

    res.status(200).json({ message: 'Bid acceptance undone successfully. Crop is available again.', bid });
  } catch (error) {
    next(error);
  }
};

module.exports = { placeBid, getBidsForListing, getMyBids, updateBid, withdrawBid, respondToBid, undoAcceptBid };
