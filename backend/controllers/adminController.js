const Farmer = require('../models/Farmer');
const Trader = require('../models/Trader');
const Crop = require('../models/Crop');
const Bid = require('../models/Bid');
const Transaction = require('../models/Transaction');
const GovernmentScheme = require('../models/GovernmentScheme');
const AuditLog = require('../models/AuditLog');
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
      publishedSchemes
    ] = await Promise.all([
      Farmer.countDocuments(),
      Trader.countDocuments(),
      Trader.countDocuments({ verificationStatus: 'pending' }),
      Crop.countDocuments({ status: 'available' }),
      Bid.countDocuments(),
      Transaction.countDocuments(),
      GovernmentScheme.countDocuments({ isPublished: true })
    ]);

    const stats = {
      totalFarmers,
      totalTraders,
      pendingTraders,
      activeCropListings,
      totalBids,
      totalTransactions,
      publishedSchemes
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

const resolveDispute = async (req, res, next) => {
  try {
    const { action } = req.body; // 'refund_trader' or 'payout_farmer'
    
    if (!['refund_trader', 'payout_farmer'].includes(action)) {
       return res.status(400).json({ message: "Action must be 'refund_trader' or 'payout_farmer'" });
    }

    const tx = await Transaction.findById(req.params.id).populate('farmer trader cropListing');
    if (!tx) return res.status(404).json({ message: 'Transaction not found' });

    if (tx.logisticsStatus !== 'disputed') {
      return res.status(400).json({ message: 'Transaction is not disputed' });
    }

    const { createNotification } = require('../utils/createNotification');

    if (action === 'refund_trader') {
      tx.paymentStatus = 'refunded';
      logger.info(`\n[REFUND SIMULATION] Refunding ₹${tx.amount} to Trader: ${tx.trader.name}\n`);
      
      createNotification(tx.trader._id, 'Trader', 'Dispute Resolved', 'Admin resolved the dispute in your favor. A refund has been issued.');
      createNotification(tx.farmer._id, 'Farmer', 'Dispute Resolved', 'Admin resolved the dispute in favor of the trader. Escrow funds were refunded.');
      
      // Revert crop and bid
      await Bid.findByIdAndUpdate(tx.bid, { status: 'rejected' });
      await Crop.findByIdAndUpdate(tx.cropListing._id, { status: 'available' });

    } else if (action === 'payout_farmer') {
      tx.paymentStatus = 'payout_released';
      logger.info(`\n[PAYOUT SIMULATION] Forcing release of ₹${tx.amount} to Farmer: ${tx.farmer.name}\n`);
      
      createNotification(tx.farmer._id, 'Farmer', 'Dispute Resolved', 'Admin resolved the dispute in your favor. Funds released from escrow.');
      createNotification(tx.trader._id, 'Trader', 'Dispute Resolved', 'Admin resolved the dispute in favor of the farmer. Funds paid out.');
    }

    tx.logisticsStatus = 'resolved';
    await tx.save();

    res.status(200).json({ message: `Dispute resolved with action: ${action}`, transaction: tx });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats, getAllFarmers, getAllTraders, getFarmerById, getTraderById, getAuditLogs, suspendUser, resolveDispute };
