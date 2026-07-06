const Farmer = require('../models/Farmer');
const Trader = require('../models/Trader');
const Crop = require('../models/Crop');
const Bid = require('../models/Bid');
const Transaction = require('../models/Transaction');
const GovernmentScheme = require('../models/GovernmentScheme');
const AuditLog = require('../models/AuditLog');
const redisClient = require('../config/redis');

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
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.search) {
      query.name = { $regex: req.query.search, $options: 'i' };
    }
    if (req.query.district) {
      query.district = req.query.district;
    }

    const [farmers, total] = await Promise.all([
      Farmer.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Farmer.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: farmers.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: farmers
    });
  } catch (error) {
    next(error);
  }
};

const getAllTraders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.verificationStatus) {
      query.verificationStatus = req.query.verificationStatus;
    }

    const [traders, total] = await Promise.all([
      Trader.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Trader.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: traders.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: traders
    });
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
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.performedByModel) {
      query.performedByModel = req.query.performedByModel;
    }
    if (req.query.action) {
      query.action = req.query.action;
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .populate('performedBy', 'name email mobile')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      AuditLog.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: logs
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats, getAllFarmers, getAllTraders, getFarmerById, getTraderById, getAuditLogs };
