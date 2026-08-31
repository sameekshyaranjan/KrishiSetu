const MandiPrice = require('../models/MandiPrice');
const { fetchAgmarknetPrices } = require('../services/priceService');

/**
 * Get Karnataka Mandi Prices with optional search & filters
 */
const getPrices = async (req, res, next) => {
  try {
    // 1. Authoritative Server-Side Filter: strictly Karnataka only
    const filter = { state: { $regex: /^karnataka$/i } };

    if (req.query.commodity && req.query.commodity.trim()) {
      filter.$or = [
        { commodity: { $regex: req.query.commodity.trim(), $options: 'i' } },
        { variety: { $regex: req.query.commodity.trim(), $options: 'i' } }
      ];
    }

    if (req.query.district && req.query.district !== 'All' && req.query.district !== 'All Districts') {
      filter.district = { $regex: req.query.district.trim(), $options: 'i' };
    }

    if (req.query.market && req.query.market !== 'All') {
      filter.market = { $regex: req.query.market.trim(), $options: 'i' };
    }

    const prices = await MandiPrice.find(filter).sort({ arrivalDate: -1, fetchedAt: -1 });
    res.status(200).json(prices);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Karnataka Mandi Prices for a specific commodity
 */
const getPricesByCommodity = async (req, res, next) => {
  try {
    const commodityName = req.params.commodity || '';
    const prices = await MandiPrice.find({
      state: { $regex: /^karnataka$/i },
      $or: [
        { commodity: { $regex: commodityName, $options: 'i' } },
        { variety: { $regex: commodityName, $options: 'i' } }
      ]
    }).sort({ arrivalDate: -1 });

    if (!prices.length) {
      return res.status(404).json({ message: 'No live Karnataka mandi prices found for this commodity' });
    }

    res.status(200).json(prices);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Price Trends for a Karnataka commodity across days
 */
const getPriceTrend = async (req, res, next) => {
  try {
    const { commodity, district, days = 30 } = req.query;

    if (!commodity) {
      return res.status(400).json({ message: 'Commodity query parameter is required' });
    }

    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - parseInt(days, 10));

    const matchFilter = {
      state: { $regex: /^karnataka$/i },
      commodity: { $regex: new RegExp(`^${commodity}$`, 'i') },
      arrivalDate: { $gte: pastDate }
    };

    if (district && district !== 'All' && district !== 'All Districts') {
      matchFilter.district = { $regex: new RegExp(district, 'i') };
    }

    const trends = await MandiPrice.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$arrivalDate' } },
            commodity: '$commodity'
          },
          minPrice: { $min: '$minPrice' },
          maxPrice: { $max: '$maxPrice' },
          avgModalPrice: { $avg: '$modalPrice' },
          marketsReporting: { $addToSet: '$market' }
        }
      },
      {
        $sort: { '_id.date': 1 }
      },
      {
        $project: {
          _id: 0,
          date: '$_id.date',
          commodity: '$_id.commodity',
          minPrice: 1,
          maxPrice: 1,
          avgModalPrice: { $round: ['$avgModalPrice', 2] },
          marketCount: { $size: '$marketsReporting' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      commodity,
      district: district || 'All Districts',
      days: parseInt(days, 10),
      count: trends.length,
      data: trends
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Trigger On-Demand Agmarknet Sync for Karnataka
 */
const syncPrices = async (req, res, next) => {
  try {
    const result = await fetchAgmarknetPrices();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = { getPrices, getPricesByCommodity, getPriceTrend, syncPrices };
