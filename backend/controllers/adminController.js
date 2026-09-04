const Farmer = require('../models/Farmer');
const Trader = require('../models/Trader');
const Crop = require('../models/Crop');
const Bid = require('../models/Bid');
const Transaction = require('../models/Transaction');
const GovernmentScheme = require('../models/GovernmentScheme');
const AuditLog = require('../models/AuditLog');
const Dispute = require('../models/Dispute');
const Wallet = require('../models/Wallet');
const WalletLedger = require('../models/WalletLedger');
const redisClient = require('../config/redis');
const { paginate } = require('../utils/paginate');
const logger = require('../utils/logger');

const getDashboardStats = async (req, res, next) => {
  try {
    const cacheKey = 'admin:dashboard:stats';
    
    // 1. Check Redis Cache
    const cachedStats = await redisClient.get(cacheKey);
    if (cachedStats) {
      return res.status(200).json({
        source: 'redis',
        data: JSON.parse(cachedStats)
      });
    }

    // 2. Cache Miss: Query MongoDB
    const [
      totalFarmers,
      totalTraders,
      pendingTraders,
      activeCropListings,
      totalBids,
      totalTransactions,
      publishedSchemes,
      activeDisputes
    ] = await Promise.all([
      Farmer.countDocuments(),
      Trader.countDocuments(),
      Trader.countDocuments({ verificationStatus: 'pending' }),
      Crop.countDocuments({ status: 'available' }),
      Bid.countDocuments(),
      Transaction.countDocuments(),
      GovernmentScheme.countDocuments({ isPublished: true }),
      Dispute.countDocuments({ status: { $in: ['raised', 'under_review'] } })
    ]);

    const stats = {
      totalFarmers,
      totalTraders,
      pendingTraders,
      activeCropListings,
      totalBids,
      totalTransactions,
      publishedSchemes,
      activeDisputes
    };

    // 3. Save to Redis (expire in 300 seconds / 5 minutes)
    await redisClient.setex(cacheKey, 300, JSON.stringify(stats));

    res.status(200).json({
      source: 'mongodb',
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

const getAllFarmers = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.search) {
      query.name = { $regex: req.query.search, $options: 'i' };
    }
    if (req.query.district) {
      query.district = req.query.district;
    }

    const result = await paginate(Farmer, query, req.query.page, req.query.limit);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getAllTraders = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.verificationStatus) {
      query.verificationStatus = req.query.verificationStatus;
    }

    const result = await paginate(Trader, query, req.query.page, req.query.limit);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getFarmerById = async (req, res, next) => {
  try {
    const farmer = await Farmer.findById(req.params.id);
    if (!farmer) {
      return res.status(404).json({ message: 'Farmer not found' });
    }
    res.status(200).json(farmer);
  } catch (error) {
    next(error);
  }
};

const getTraderById = async (req, res, next) => {
  try {
    const trader = await Trader.findById(req.params.id);
    if (!trader) {
      return res.status(404).json({ message: 'Trader not found' });
    }
    res.status(200).json(trader);
  } catch (error) {
    next(error);
  }
};

const getAuditLogs = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.performedByModel) {
      query.performedByModel = req.query.performedByModel;
    }
    if (req.query.action) {
      query.action = req.query.action;
    }

    const result = await paginate(AuditLog, query, req.query.page, req.query.limit, 'performedBy');
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const suspendUser = async (req, res, next) => {
  try {
    const { role, id } = req.params;
    let user;
    
    if (role === 'farmer') {
      user = await Farmer.findById(id);
    } else if (role === 'trader') {
      user = await Trader.findById(id);
    } else {
      return res.status(400).json({ message: 'Invalid role for suspension. Must be farmer or trader.' });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isSuspended = !user.isSuspended;
    await user.save();

    if (user.isSuspended) {
      await redisClient.sadd('suspended_users', id);
    } else {
      await redisClient.srem('suspended_users', id);
    }

    res.status(200).json({ 
      message: `User ${user.isSuspended ? 'suspended' : 'unsuspended'} successfully`, 
      isSuspended: user.isSuspended 
    });
  } catch (error) {
    next(error);
  }
};

const getAllDisputes = async (req, res, next) => {
  try {
    const disputes = await Dispute.find()
      .populate('farmer', 'name mobile email district state')
      .populate('trader', 'name companyName mobile email district state')
      .populate('cropListing', 'name category quantity unit basePrice images district')
      .populate('transaction')
      .sort({ createdAt: -1 });

    // Sync any legacy disputed transactions missing a Dispute record
    const existingTxIds = disputes.map(d => d.transaction?._id?.toString()).filter(Boolean);
    const disputedTxs = await Transaction.find({
      logisticsStatus: 'disputed',
      _id: { $nin: existingTxIds }
    })
      .populate('farmer', 'name mobile email district state')
      .populate('trader', 'name companyName mobile email district state')
      .populate('cropListing', 'name category quantity unit basePrice images district');

    for (const tx of disputedTxs) {
      if (tx.farmer && tx.trader) {
        const created = await Dispute.create({
          transaction: tx._id,
          trader: tx.trader._id,
          farmer: tx.farmer._id,
          cropListing: tx.cropListing?._id,
          bid: tx.bid,
          reason: 'Quality or delivery discrepancy reported during transit/unloading',
          proofPhotos: [],
          escrowAmount: tx.amount,
          status: 'under_review'
        });
        const populated = await Dispute.findById(created._id)
          .populate('farmer', 'name mobile email district state')
          .populate('trader', 'name companyName mobile email district state')
          .populate('cropListing', 'name category quantity unit basePrice images district')
          .populate('transaction');
        disputes.unshift(populated);
      }
    }

    res.status(200).json({ success: true, count: disputes.length, disputes, data: disputes });
  } catch (error) {
    next(error);
  }
};

const resolveDispute = async (req, res, next) => {
  try {
    const { action, notes } = req.body; // 'refund_trader' | 'split_85_15' | 'payout_farmer'
    
    if (!['refund_trader', 'split_85_15', 'payout_farmer'].includes(action)) {
      return res.status(400).json({ 
        message: "Invalid resolution action. Must be 'refund_trader', 'split_85_15', or 'payout_farmer'." 
      });
    }

    // Lookup by Dispute ID or Transaction ID
    let dispute = await Dispute.findById(req.params.id)
      .populate('farmer trader cropListing transaction');
      
    if (!dispute) {
      dispute = await Dispute.findOne({ transaction: req.params.id })
        .populate('farmer trader cropListing transaction');
    }

    let tx;
    if (dispute && dispute.transaction) {
      tx = dispute.transaction;
      if (!tx.farmer || !tx.trader) {
        tx = await Transaction.findById(tx._id).populate('farmer trader cropListing');
      }
    } else {
      tx = await Transaction.findById(req.params.id).populate('farmer trader cropListing');
      if (!tx) return res.status(404).json({ message: 'Dispute or Transaction not found' });
      
      dispute = await Dispute.create({
        transaction: tx._id,
        trader: tx.trader._id,
        farmer: tx.farmer._id,
        cropListing: tx.cropListing?._id,
        bid: tx.bid,
        reason: 'APMC Dispute logged for arbitration',
        proofPhotos: [],
        escrowAmount: tx.amount,
        status: 'under_review'
      });
    }

    if (dispute.status && dispute.status.startsWith('resolved_')) {
      return res.status(400).json({ 
        message: `Dispute has already been resolved with ruling: ${dispute.status}` 
      });
    }

    const { createNotification } = require('../utils/createNotification');
    const escrowAmount = dispute.escrowAmount || tx.amount;
    let farmerPayout = 0;
    let traderRefund = 0;
    let disputeNewStatus = '';

    if (action === 'refund_trader') {
      // 100% Refund to Buyer - Order is terminated and crop delisted
      traderRefund = escrowAmount;
      farmerPayout = 0;
      disputeNewStatus = 'resolved_refund_trader';

      // Update Trader Wallet: release locked escrow back to available balance
      const traderWallet = await Wallet.findOne({ trader: tx.trader._id });
      let updatedWallet = null;
      if (traderWallet) {
        const deductLocked = Math.min(traderWallet.lockedBalance || 0, escrowAmount);
        updatedWallet = await Wallet.findByIdAndUpdate(
          traderWallet._id,
          {
            $inc: { lockedBalance: -deductLocked, availableBalance: escrowAmount },
            $set: { updatedAt: Date.now() }
          },
          { new: true }
        );
      }

      // Ledger entry for refund
      await WalletLedger.create({
        trader: tx.trader._id,
        wallet: updatedWallet ? updatedWallet._id : (traderWallet ? traderWallet._id : null),
        type: 'REFUND',
        amount: escrowAmount,
        balanceAfter: updatedWallet ? updatedWallet.availableBalance : (traderWallet ? traderWallet.availableBalance : 0),
        status: 'completed',
        source: 'APMC_DISPUTE_ARBITRATION',
        paymentMethod: 'Escrow Refund',
        description: `100% Escrow refund following APMC arbitration for ${tx.cropListing?.name || 'crop lot'}`,
        referenceId: String(dispute._id)
      });

      tx.paymentStatus = 'refunded';
      tx.logisticsStatus = 'resolved';
      tx.disputeResolution = 'refund_trader';
      tx.disputeResolutionStatus = 'executed';
      tx.farmerPayoutAmount = 0;
      tx.traderRefundAmount = escrowAmount;
      await tx.save();

      // Release bid & permanently delist crop from marketplace
      if (tx.bid) await Bid.findByIdAndUpdate(tx.bid, { status: 'dispute_resolved' });
      if (tx.cropListing) await Crop.findByIdAndUpdate(tx.cropListing._id, { status: 'delisted' });
      await redisClient.incr('crops_feed_version');

      createNotification(
        tx.trader._id,
        'Trader',
        'Dispute Resolved: 100% Refund Approved 💰',
        `APMC Admin resolved dispute in your favor for ${tx.cropListing?.name || 'crop lot'}. Full refund of ₹${escrowAmount.toLocaleString('en-IN')} returned to your available balance.`
      );
      createNotification(
        tx.farmer._id,
        'Farmer',
        'Dispute Resolved: 100% Refund to Trader',
        `APMC Admin ruled in favor of buyer for ${tx.cropListing?.name || 'crop lot'}. Escrow has been refunded and the crop lot has been delisted.`
      );

    } else if (action === 'split_85_15') {
      // Mutual Split: 85% Farmer / 15% Buyer
      // DO NOT DISBURSE MONEY YET: funds remain locked in escrow until Trader accepts delivery
      farmerPayout = Math.round(escrowAmount * 0.85);
      traderRefund = escrowAmount - farmerPayout;
      disputeNewStatus = 'resolved_split_85_15';

      tx.disputeResolution = 'split_85_15';
      tx.disputeResolutionStatus = 'awaiting_delivery';
      tx.farmerPayoutAmount = farmerPayout;
      tx.traderRefundAmount = traderRefund;
      tx.paymentStatus = 'held_in_escrow';
      
      // Allow shipment workflow to continue: ensure lot is marked in transit and ready for delivery
      if (tx.logisticsStatus === 'disputed' || tx.logisticsStatus === 'pending') {
        tx.logisticsStatus = 'in_transit';
        if (!tx.dispatchedAt) tx.dispatchedAt = new Date();
      }
      await tx.save();

      if (tx.bid) await Bid.findByIdAndUpdate(tx.bid, { status: 'accepted' });

      createNotification(
        tx.trader._id,
        'Trader',
        'Dispute Resolved: 85/15 Mutual Settlement',
        `APMC Admin arbitrated 85/15 mutual split for ${tx.cropListing?.name || 'crop lot'}. Funds remain held in escrow. Payout of ₹${farmerPayout.toLocaleString('en-IN')} (85%) and your refund of ₹${traderRefund.toLocaleString('en-IN')} (15%) will be executed upon final delivery acceptance.`
      );
      createNotification(
        tx.farmer._id,
        'Farmer',
        'Dispute Resolved: 85% Farmer / 15% Trader Approved',
        `APMC Admin approved 85/15 mutual split for ${tx.cropListing?.name || 'crop lot'}. Escrow remains held. Your payout of ₹${farmerPayout.toLocaleString('en-IN')} (85%) will be disbursed upon verified delivery acceptance.`
      );

    } else if (action === 'payout_farmer') {
      // 100% Payout to Farmer
      // DO NOT DISBURSE MONEY YET: funds remain locked in escrow until Trader accepts delivery
      farmerPayout = escrowAmount;
      traderRefund = 0;
      disputeNewStatus = 'resolved_payout_farmer';

      tx.disputeResolution = 'payout_farmer';
      tx.disputeResolutionStatus = 'awaiting_delivery';
      tx.farmerPayoutAmount = farmerPayout;
      tx.traderRefundAmount = 0;
      tx.paymentStatus = 'held_in_escrow';
      // Allow shipment workflow to continue: ensure lot is marked in transit and ready for delivery
      if (tx.logisticsStatus === 'disputed' || tx.logisticsStatus === 'pending') {
        tx.logisticsStatus = 'in_transit';
        if (!tx.dispatchedAt) tx.dispatchedAt = new Date();
      }
      await tx.save();

      if (tx.bid) await Bid.findByIdAndUpdate(tx.bid, { status: 'accepted' });

      createNotification(
        tx.farmer._id,
        'Farmer',
        'Dispute Resolved: 100% Payout to Farmer Approved',
        `APMC Admin ruled in your favor for ${tx.cropListing?.name || 'crop lot'}. Full escrow of ₹${escrowAmount.toLocaleString('en-IN')} remains held and will be released upon verified delivery acceptance.`
      );
      createNotification(
        tx.trader._id,
        'Trader',
        'Dispute Resolved: 100% Farmer Payout Upheld',
        `APMC Admin reviewed evidence and ruled 100% payout to farmer for ${tx.cropListing?.name || 'crop lot'}. Funds remain held in escrow until delivery is accepted.`
      );
    }

    // Update Dispute document
    dispute.status = disputeNewStatus;
    dispute.ruling = {
      action,
      notes: notes || `Admin resolved dispute with ruling: ${action.replace(/_/g, ' ').toUpperCase()}`,
      farmerPayout,
      traderRefund,
      resolvedAt: new Date(),
      resolvedBy: req.user?._id
    };
    dispute.updatedAt = new Date();
    await dispute.save();

    // Invalidate Redis dashboard cache
    await redisClient.del('admin:dashboard:stats');

    res.status(200).json({
      success: true,
      message: `Dispute resolved successfully with action: ${action}`,
      dispute,
      transaction: tx
    });
  } catch (error) {
    next(error);
  }
};

const getRevenueAnalytics = async (req, res, next) => {
  try {
    const analytics = await Transaction.aggregate([
      {
        $match: {
          paymentStatus: { $in: ['held_in_escrow', 'completed', 'payout_released'] }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$transactionDate' },
            month: { $month: '$transactionDate' }
          },
          totalRevenue: { $sum: '$amount' },
          totalTransactions: { $sum: 1 },
          averageTransactionValue: { $avg: '$amount' }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1
        }
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          totalRevenue: 1,
          totalTransactions: 1,
          averageTransactionValue: { $round: ['$averageTransactionValue', 2] }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: analytics.length,
      data: analytics
    });
  } catch (error) {
    next(error);
  }
};

const getDeletedListings = async (req, res, next) => {
  try {
    const result = await paginate(Crop, { status: 'removed' }, req.query.page, req.query.limit, 'farmer');
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const restoreListing = async (req, res, next) => {
  try {
    const crop = await Crop.findById(req.params.id);
    if (!crop) return res.status(404).json({ message: 'Crop listing not found' });

    if (crop.status !== 'removed') {
      return res.status(400).json({ message: 'Crop listing is not removed' });
    }

    crop.status = 'available';
    await crop.save();

    res.status(200).json({ message: 'Listing restored successfully', crop });
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  getDashboardStats, 
  getAllFarmers, 
  getAllTraders, 
  getFarmerById, 
  getTraderById, 
  getAuditLogs, 
  suspendUser, 
  getAllDisputes,
  resolveDispute,
  getRevenueAnalytics,
  getDeletedListings,
  restoreListing
};
