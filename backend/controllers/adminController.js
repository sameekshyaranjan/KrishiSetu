const Farmer = require('../models/Farmer');
const Trader = require('../models/Trader');
const Crop = require('../models/Crop');
const Bid = require('../models/Bid');
const Transaction = require('../models/Transaction');
const GovernmentScheme = require('../models/GovernmentScheme');
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

module.exports = { getDashboardStats };
