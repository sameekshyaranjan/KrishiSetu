const Crop = require('../models/Crop');
const Farmer = require('../models/Farmer');
const { generateLotSheet } = require('../utils/generateLotSheet');
const { paginate } = require('../utils/paginate');
const redisClient = require('../config/redis');

const createCropListing = async (req, res, next) => {
  try {
    const farmer = await Farmer.findById(req.user.id);
    if (!farmer || !farmer.district || !farmer.state || !farmer.mobile) {
      return res.status(403).json({ message: 'Please complete your profile (district, state, and mobile number) before creating a crop listing.' });
    }

    const { name, category, quantity, unit, basePrice, description } = req.body;
    
    let images = [];
    // 1. If images were sent as string URLs (backwards compatibility)
    if (req.body.images) {
      images = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    }
    
    // 2. If physical files were uploaded via multipart/form-data
    if (req.files && req.files.length > 0) {
      const uploadedImages = req.files.map(file => file.path);
      images = [...images, ...uploadedImages];
    }

    const crop = await Crop.create({
      farmer: req.user.id,
      name,
      category,
      quantity,
      unit,
      basePrice,
      description,
      images
    });

    await redisClient.incr('crops_feed_version');

    res.status(201).json(crop);
  } catch (error) {
    next(error);
  }
};

const getMyListings = async (req, res, next) => {
  try {
    const listings = await Crop.find({ farmer: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
};

const getAllListings = async (req, res, next) => {
  try {
    const version = await redisClient.get('crops_feed_version') || '1';
    const cacheKey = `crops:feed:v${version}:${req.query.category || 'all'}:${req.query.name || 'none'}:${req.query.page || 1}:${req.query.limit || 10}`;

    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        source: 'redis',
        data: JSON.parse(cachedData)
      });
    }

    const filter = { status: 'available' };

    if (req.query.category) filter.category = req.query.category;
    if (req.query.name) filter.name = { $regex: req.query.name, $options: 'i' };

    const result = await paginate(
      Crop,
      filter,
      req.query.page,
      req.query.limit,
      { path: 'farmer', select: 'name village district state mobile' }
    );

    await redisClient.setex(cacheKey, 300, JSON.stringify(result));

    res.status(200).json({
      source: 'mongodb',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const getListingById = async (req, res, next) => {
  try {
    const listing = await Crop.findById(req.params.id)
      .populate('farmer', 'name village district state mobile');

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    res.status(200).json(listing);
  } catch (error) {
    next(error);
  }
};

const updateCropListing = async (req, res, next) => {
  try {
    const listing = await Crop.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.farmer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to update this listing' });
    }

    const { name, category, quantity, unit, basePrice, description, images } = req.body;

    listing.name = name || listing.name;
    listing.category = category || listing.category;
    listing.quantity = quantity || listing.quantity;
    listing.unit = unit || listing.unit;
    listing.basePrice = basePrice || listing.basePrice;
    listing.description = description || listing.description;
    listing.images = images || listing.images;

    const updatedListing = await listing.save();

    await redisClient.incr('crops_feed_version');

    res.status(200).json(updatedListing);
  } catch (error) {
    next(error);
  }
};

const deleteCropListing = async (req, res, next) => {
  try {
    const listing = await Crop.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.farmer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to delete this listing' });
    }

    listing.status = 'removed';
    await listing.save();

    const Bid = require('../models/Bid');
    const { createNotification } = require('../utils/createNotification');

    // Cascade: Reject all pending bids to prevent "Ghost Bids"
    const pendingBids = await Bid.find({ crop: listing._id, status: 'pending' });
    
    if (pendingBids.length > 0) {
      await Bid.updateMany(
        { crop: listing._id, status: 'pending' },
        { status: 'rejected' }
      );

      for (const bid of pendingBids) {
        createNotification(
          bid.trader,
          'Trader',
          'Listing Removed',
          `The farmer has removed the listing for ${listing.name}. Your pending bid was automatically rejected.`
        );
      }
    }

    await redisClient.incr('crops_feed_version');

    res.status(200).json({ message: 'Listing removed successfully' });
  } catch (error) {
    next(error);
  }
};

const getLotSheet = async (req, res, next) => {
  try {
    const listing = await Crop.findById(req.params.id).populate('farmer');

    if (!listing) {
      return res.status(404).json({ message: 'Crop listing not found' });
    }

    if (!listing.farmer) {
      return res.status(404).json({ message: 'Farmer details not found for this listing' });
    }

    const lotSheet = generateLotSheet(listing, listing.farmer);

    res.status(200).json(lotSheet);
  } catch (error) {
    next(error);
  }
};

module.exports = { createCropListing, getMyListings, getAllListings, getListingById, updateCropListing, deleteCropListing, getLotSheet };
