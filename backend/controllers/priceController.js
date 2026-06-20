const MandiPrice = require('../models/MandiPrice');

const getPrices = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.commodity) filter.commodity = { $regex: req.query.commodity, $options: 'i' };
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
      commodity: { $regex: req.params.commodity, $options: 'i' }
    }).sort({ arrivalDate: -1 });

    if (!prices.length) {
      return res.status(404).json({ message: 'No prices found for this commodity' });
    }

    res.status(200).json(prices);
  } catch (error) {
    next(error);
  }
};

module.exports = { getPrices, getPricesByCommodity };
