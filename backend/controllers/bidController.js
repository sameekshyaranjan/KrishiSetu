const Bid = require('../models/Bid');
const Crop = require('../models/Crop');

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

    res.status(201).json(bid);
  } catch (error) {
    next(error);
  }
};

module.exports = { placeBid };
