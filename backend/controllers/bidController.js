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

const getBidsForListing = async (req, res, next) => {
  try {
    const bids = await Bid.find({ crop: req.params.cropId })
      .populate('trader', 'name mobile companyName')
      .sort({ amount: -1 });

    res.status(200).json(bids);
  } catch (error) {
    next(error);
  }
};

const getMyBids = async (req, res, next) => {
  try {
    const bids = await Bid.find({ trader: req.user.id })
      .populate('crop', 'name category basePrice status')
      .populate('farmer', 'name village district mobile')
      .sort({ createdAt: -1 });

    res.status(200).json(bids);
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
    res.status(200).json(updatedBid);
  } catch (error) {
    next(error);
  }
};

const withdrawBid = async (req, res, next) => {
  try {
    const bid = await Bid.findById(req.params.id);

    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    if (bid.trader.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to withdraw this bid' });
    }

    if (bid.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending bids can be withdrawn' });
    }

    bid.status = 'withdrawn';
    await bid.save();

    res.status(200).json({ message: 'Bid withdrawn successfully' });
  } catch (error) {
    next(error);
  }
};

const respondToBid = async (req, res, next) => {
  try {
    const { status } = req.body;

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

    if (bid.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending bids can be responded to' });
    }

    bid.status = status;
    await bid.save();

    if (status === 'accepted') {
      await Crop.findByIdAndUpdate(bid.crop, { status: 'sold' });
    }

    res.status(200).json({ message: `Bid ${status} successfully`, bid });
  } catch (error) {
    next(error);
  }
};

module.exports = { placeBid, getBidsForListing, getMyBids, updateBid, withdrawBid, respondToBid };
