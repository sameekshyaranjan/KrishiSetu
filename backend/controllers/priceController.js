const MandiPrice = require('../models/MandiPrice');

const getPrices = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.commodity) filter.$text = { $search: req.query.commodity };
    if (req.query.district) filter.district = { $regex: req.query.district, $options: 'i' };
    if (req.query.market) filter.market = { $regex: req.query.market, $options: 'i' };

    const prices = await MandiPrice.find(filter).sort({ fetchedAt: -1 });
    res.status(200).json(prices);
  } catch (error) {
    next(error);
  }
};

const getPricesByCommodity = async (req, res, next) => {
  try {
    const prices = await MandiPrice.find({
      $text: { $search: req.params.commodity }
    }).sort({ arrivalDate: -1 });

    if (!prices.length) {
      return res.status(404).json({ message: 'No prices found for this commodity' });
    }

    res.status(200).json(prices);
  } catch (error) {
    next(error);
  }
};

const getPriceTrend = async (req, res, next) => {
  try {
    const { commodity, district, days = 30 } = req.query;

    if (!commodity) {
      return res.status(400).json({ message: 'Commodity query parameter is required' });
    }

    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - parseInt(days, 10));

    const matchFilter = {
      commodity: { $regex: new RegExp(`^${commodity}$`, 'i') },
      arrivalDate: { $gte: pastDate }
    };

    if (district) {
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

module.exports = { getPrices, getPricesByCommodity, getPriceTrend };
