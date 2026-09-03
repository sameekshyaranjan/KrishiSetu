const Bid = require('../models/Bid');
const Crop = require('../models/Crop');
const { createNotification } = require('../utils/createNotification');
const { paginate } = require('../utils/paginate');
const redisClient = require('../config/redis');
const socketEmitter = require('../utils/socketEmitter');

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

    if (!['pending', 'countered'].includes(bid.status)) {
      return res.status(400).json({ message: 'Only active or countered bids can be responded to.' });
    }

    if (status === 'accepted') {
      const agreedRate = (bid.status === 'countered' && bid.counterProposedBy === 'trader')
        ? Number(bid.counterAmount || bid.amount)
        : Number(bid.amount);

      const verifiedExpectedAmount = expectedAmount || agreedRate;
      if (agreedRate !== verifiedExpectedAmount) {
        return res.status(409).json({ message: `The bid rate has been updated to ₹${agreedRate}. Please review before accepting.` });
      }

      // Verify crop ownership and availability
      const crop = await Crop.findById(bid.crop);
      if (!crop || crop.farmer.toString() !== req.user.id) {
        return res.status(403).json({ message: 'You are not authorized to accept bids for this crop.' });
      }

      const lockAmount = agreedRate;
      bid.amount = agreedRate;
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

      // Reject all other pending/countered bids for this crop
      const otherBids = await Bid.find({ crop: bid.crop, _id: { $ne: bid._id }, status: { $in: ['pending', 'countered'] } });
      
      if (otherBids.length > 0) {
        await Bid.updateMany(
          { crop: bid.crop, _id: { $ne: bid._id }, status: { $in: ['pending', 'countered'] } },
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
      if (!Array.isArray(bid.negotiationHistory)) bid.negotiationHistory = [];
      bid.negotiationHistory.push({
        proposedBy: 'farmer',
        amount: lockAmount,
        message: 'Bid accepted by farmer',
        createdAt: new Date()
      });
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

      socketEmitter.emit('bid-updated', bid, bid.trader.toString());

      return res.status(200).json({ message: 'Bid accepted successfully and escrow locked', bid });
    }

    // If rejecting the bid
    bid.status = status;
    if (!Array.isArray(bid.negotiationHistory)) bid.negotiationHistory = [];
    bid.negotiationHistory.push({
      proposedBy: 'farmer',
      amount: bid.counterAmount || bid.amount,
      message: 'Bid declined by farmer',
      createdAt: new Date()
    });
    await bid.save();

    createNotification(
      bid.trader,
      'Trader',
      'Bid Rejected',
      `Your bid was declined by the farmer.`
    );

    socketEmitter.emit('bid-updated', bid, bid.trader.toString());

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

/**
 * Farmer submits a counter offer on an inbound bid
 * PUT /api/bids/:id/counter
 */
const counterBid = async (req, res, next) => {
  try {
    const { counterAmount, message } = req.body;
    const parsedAmount = Number(counterAmount);

    if (!parsedAmount || parsedAmount <= 0) {
      return res.status(400).json({ message: 'Please provide a valid counter rate greater than 0' });
    }

    const bid = await Bid.findById(req.params.id);
    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    // Verify authenticated farmer is the owner
    if (bid.farmer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to submit a counter offer for this bid' });
    }

    if (['cancelled', 'withdrawn'].includes(bid.status)) {
      return res.status(400).json({ message: 'This bid has already been cancelled and cannot be countered.' });
    }

    if (bid.status === 'accepted') {
      return res.status(400).json({ message: 'This bid has already been accepted.' });
    }

    if (bid.status === 'rejected') {
      return res.status(400).json({ message: 'This bid has been declined and cannot be countered.' });
    }

    // Verify crop exists and is available
    const crop = await Crop.findById(bid.crop);
    if (!crop || crop.status !== 'available') {
      return res.status(400).json({ message: 'This crop listing is no longer available.' });
    }

    // Preserve original trader amount if not yet preserved
    if (!bid.originalAmount) {
      bid.originalAmount = bid.amount;
    }

    bid.counterAmount = parsedAmount;
    bid.counterProposedBy = 'farmer';
    bid.counterMessage = message || '';
    bid.status = 'countered';

    if (!Array.isArray(bid.negotiationHistory)) {
      bid.negotiationHistory = [];
    }
    bid.negotiationHistory.push({
      proposedBy: 'farmer',
      amount: parsedAmount,
      message: message || `Farmer proposed counter rate: ₹${parsedAmount}/Qtl`,
      createdAt: new Date()
    });

    await bid.save();

    // Create Notification for Trader
    createNotification(
      bid.trader,
      'Trader',
      'Counter Bid Received',
      `Farmer proposed a counter rate of ₹${parsedAmount.toLocaleString('en-IN')}/Qtl for ${crop.name}.`
    );

    // Real-time socket events
    socketEmitter.emit('bid-updated', bid, bid.trader.toString());
    socketEmitter.emit('counter-bid', {
      bidId: bid._id,
      cropId: crop._id,
      cropName: crop.name,
      counterAmount: parsedAmount,
      proposedBy: 'farmer'
    }, bid.trader.toString());

    res.status(200).json({
      success: true,
      message: `Counter offer of ₹${parsedAmount.toLocaleString('en-IN')}/Qtl submitted successfully`,
      bid
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Trader responds to Farmer's counter offer (accept, reject, or re-counter)
 * PUT /api/bids/:id/trader-respond
 */
const traderRespondToCounter = async (req, res, next) => {
  try {
    const { action, counterAmount, message } = req.body; // 'accept' | 'reject' | 'counter'

    if (!['accept', 'reject', 'counter'].includes(action)) {
      return res.status(400).json({ message: "Action must be 'accept', 'reject', or 'counter'" });
    }

    const bid = await Bid.findById(req.params.id);
    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    // Verify trader authorization
    if (bid.trader.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to respond to this counter offer' });
    }

    if (bid.status !== 'countered') {
      return res.status(400).json({ message: 'This bid does not currently have an active counter offer.' });
    }

    if (bid.counterProposedBy !== 'farmer') {
      return res.status(400).json({ message: 'Waiting for farmer to respond to your counter offer.' });
    }

    const crop = await Crop.findById(bid.crop);
    if (!crop || crop.status !== 'available') {
      return res.status(400).json({ message: 'This crop is no longer available.' });
    }

    if (!Array.isArray(bid.negotiationHistory)) {
      bid.negotiationHistory = [];
    }

    if (action === 'accept') {
      // Final agreed amount becomes the farmer's counter offer rate
      const agreedRate = Number(bid.counterAmount || bid.amount);
      bid.amount = agreedRate;

      const Wallet = require('../models/Wallet');
      const WalletLedger = require('../models/WalletLedger');

      // Verify Trader Escrow Wallet Balance
      const traderWallet = await Wallet.findOne({ trader: bid.trader });
      if (!traderWallet || traderWallet.availableBalance < agreedRate) {
        return res.status(400).json({
          message: `Insufficient available balance in your escrow wallet (Available: ₹${traderWallet ? traderWallet.availableBalance.toLocaleString('en-IN') : 0}, Required: ₹${agreedRate.toLocaleString('en-IN')}) to accept this counter offer.`
        });
      }

      // Mark crop as sold atomically
      const updatedCrop = await Crop.findOneAndUpdate(
        { _id: bid.crop, status: 'available' },
        { status: 'sold' },
        { new: true }
      );

      if (!updatedCrop) {
        return res.status(400).json({ message: 'Crop is no longer available. It may have already been sold.' });
      }

      // Atomically move trader balance into locked escrow
      const updatedWallet = await Wallet.findOneAndUpdate(
        { trader: bid.trader, availableBalance: { $gte: agreedRate } },
        {
          $inc: { availableBalance: -agreedRate, lockedBalance: agreedRate },
          $set: { updatedAt: Date.now() }
        },
        { new: true }
      );

      if (!updatedWallet) {
        await Crop.findByIdAndUpdate(bid.crop, { status: 'available' });
        return res.status(400).json({ message: 'Failed to lock escrow. Insufficient wallet balance.' });
      }

      // Record Wallet Ledger
      await WalletLedger.create({
        trader: bid.trader,
        wallet: updatedWallet._id,
        type: 'ESCROW_LOCK',
        amount: agreedRate,
        balanceAfter: updatedWallet.availableBalance,
        status: 'completed',
        source: 'DEVELOPMENT_SANDBOX',
        paymentMethod: 'Escrow Vault Lock',
        description: `Escrow locked for accepted counter bid on ${updatedCrop.name}`,
        referenceId: String(bid._id)
      });

      // Update Bid
      bid.status = 'accepted';
      bid.negotiationHistory.push({
        proposedBy: 'trader',
        amount: agreedRate,
        message: 'Trader accepted farmer counter offer',
        createdAt: new Date()
      });
      await bid.save();

      // Reject all other pending/countered bids on this crop
      const otherBids = await Bid.find({ crop: bid.crop, _id: { $ne: bid._id }, status: { $in: ['pending', 'countered'] } });
      if (otherBids.length > 0) {
        await Bid.updateMany(
          { crop: bid.crop, _id: { $ne: bid._id }, status: { $in: ['pending', 'countered'] } },
          { status: 'rejected' }
        );
        for (const o of otherBids) {
          createNotification(
            o.trader,
            'Trader',
            'Bid Closed',
            `Crop ${updatedCrop.name} has been sold to another trader at an agreed negotiated price.`
          );
        }
      }

      // Create Transaction
      const Transaction = require('../models/Transaction');
      const transaction = await Transaction.findOneAndUpdate(
        { bid: bid._id },
        {
          farmer: bid.farmer,
          trader: bid.trader,
          cropListing: bid.crop,
          bid: bid._id,
          amount: agreedRate,
          paymentStatus: 'held_in_escrow',
          logisticsStatus: 'pending',
          paymentMethod: 'manual',
          transactionDate: new Date()
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      await redisClient.incr('crops_feed_version');

      // Notify Farmer
      createNotification(
        bid.farmer,
        'Farmer',
        'Counter Offer Accepted! 🎉',
        `Trader accepted your counter offer of ₹${agreedRate.toLocaleString('en-IN')}/Qtl for ${updatedCrop.name}! ₹${agreedRate.toLocaleString('en-IN')} is now secured in escrow.`
      );

      socketEmitter.emit('bid-updated', bid, bid.farmer.toString());
      socketEmitter.emit('bid-updated', bid, bid.trader.toString());

      return res.status(200).json({
        success: true,
        message: `Counter offer accepted! ₹${agreedRate.toLocaleString('en-IN')} locked in escrow.`,
        bid,
        transaction
      });
    }

    if (action === 'reject') {
      bid.status = 'rejected';
      bid.negotiationHistory.push({
        proposedBy: 'trader',
        amount: bid.counterAmount,
        message: message || 'Trader declined farmer counter offer',
        createdAt: new Date()
      });
      await bid.save();

      createNotification(
        bid.farmer,
        'Farmer',
        'Counter Offer Declined',
        `Trader declined your counter offer of ₹${bid.counterAmount.toLocaleString('en-IN')}/Qtl for ${crop.name}.`
      );

      socketEmitter.emit('bid-updated', bid, bid.farmer.toString());

      return res.status(200).json({
        success: true,
        message: 'Counter offer declined',
        bid
      });
    }

    if (action === 'counter') {
      const newRate = Number(counterAmount);
      if (!newRate || newRate <= 0) {
        return res.status(400).json({ message: 'Please provide a valid re-counter rate greater than 0' });
      }

      bid.counterAmount = newRate;
      bid.counterProposedBy = 'trader';
      bid.counterMessage = message || '';
      bid.status = 'countered';

      bid.negotiationHistory.push({
        proposedBy: 'trader',
        amount: newRate,
        message: message || `Trader proposed counter rate: ₹${newRate}/Qtl`,
        createdAt: new Date()
      });
      await bid.save();

      createNotification(
        bid.farmer,
        'Farmer',
        'New Counter Offer from Trader',
        `Trader proposed a revised counter rate of ₹${newRate.toLocaleString('en-IN')}/Qtl for ${crop.name}.`
      );

      socketEmitter.emit('bid-updated', bid, bid.farmer.toString());
      socketEmitter.emit('counter-bid', {
        bidId: bid._id,
        cropId: crop._id,
        cropName: crop.name,
        counterAmount: newRate,
        proposedBy: 'trader'
      }, bid.farmer.toString());

      return res.status(200).json({
        success: true,
        message: `Revised counter offer of ₹${newRate.toLocaleString('en-IN')}/Qtl sent to farmer!`,
        bid
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  placeBid,
  getBidsForListing,
  getMyBids,
  updateBid,
  withdrawBid,
  respondToBid,
  undoAcceptBid,
  counterBid,
  traderRespondToCounter
};
