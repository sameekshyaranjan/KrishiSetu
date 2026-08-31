const Crop = require('../models/Crop');
const Farmer = require('../models/Farmer');
const { generateLotSheet } = require('../utils/generateLotSheet');
const { paginate } = require('../utils/paginate');
const redisClient = require('../config/redis');

const createCropListing = async (req, res, next) => {
  try {
    const farmer = await Farmer.findById(req.user.id);
    if (!farmer) {
      return res.status(404).json({ message: 'Farmer account not found' });
    }

    const { name, title, cropType, category, quantity, unit, basePrice, description, district, harvestStatus } = req.body;
    
    let images = [];
    if (req.body.images) {
      images = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    }
    
    if (req.files && req.files.length > 0) {
      const uploadedImages = req.files.map(file => file.path);
      images = [...images, ...uploadedImages];
    }

    const finalName = name || title || (cropType ? `${cropType} Lot` : 'Produce Lot');
    let finalCategory = (category || 'vegetables').toLowerCase().trim();
    if (!['vegetables', 'fruits', 'grains', 'spices', 'pulses', 'other'].includes(finalCategory)) {
      finalCategory = 'vegetables';
    }
    const finalQuantity = Number(quantity) || 50;
    
    let finalUnit = (unit || 'quintal').toLowerCase().trim();
    if (finalUnit === 'quintals') finalUnit = 'quintal';
    if (finalUnit === 'tonnes' || finalUnit === 'tons' || finalUnit === 'ton') finalUnit = 'tonne';
    if (finalUnit === 'kgs' || finalUnit === 'kilogram' || finalUnit === 'kilograms') finalUnit = 'kg';
    if (!['kg', 'quintal', 'tonne'].includes(finalUnit)) finalUnit = 'quintal';

    const finalBasePrice = Number(basePrice) || 2000;
    const finalDistrict = district || farmer.district || 'Hassan';

    const crop = await Crop.create({
      farmer: req.user.id,
      name: finalName,
      category: finalCategory,
      quantity: finalQuantity,
      unit: finalUnit,
      basePrice: finalBasePrice,
      district: finalDistrict,
      description: description || `Freshly harvested ${finalName} lot from farm gate.`,
      images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop'],
      harvestStatus: harvestStatus || 'post-harvest'
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
    const Bid = require('../models/Bid');

    const listingsWithBids = await Promise.all(
      listings.map(async (cropDoc) => {
        const cropObj = cropDoc.toObject();
        const activeBids = await Bid.find({
          crop: cropObj._id,
          status: { $in: ['pending', 'accepted'] }
        }).sort({ amount: -1 });

        cropObj.bidsCount = activeBids.length;
        cropObj.currentHighestBid = activeBids.length > 0 ? activeBids[0].amount : null;
        return cropObj;
      })
    );

    res.status(200).json(listingsWithBids);
  } catch (error) {
    next(error);
  }
};

const getAllListings = async (req, res, next) => {
  try {
    let version = await redisClient.get('crops_feed_version');
    if (!version) {
      version = String(Date.now());
      await redisClient.set('crops_feed_version', version);
    }
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

    const Bid = require('../models/Bid');
    const cropsWithBids = await Promise.all(
      (result.data || []).map(async (cropDoc) => {
        const cropObj = cropDoc.toObject ? cropDoc.toObject() : cropDoc;
        const activeBids = await Bid.find({
          crop: cropObj._id,
          status: { $in: ['pending', 'accepted'] }
        }).sort({ amount: -1 });

        cropObj.bidsCount = activeBids.length;
        cropObj.currentHighestBid = activeBids.length > 0 ? activeBids[0].amount : null;
        return cropObj;
      })
    );

    result.data = cropsWithBids;

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

    const Bid = require('../models/Bid');
    const activeBids = await Bid.find({
      crop: listing._id,
      status: { $in: ['pending', 'accepted'] }
    }).sort({ amount: -1 });

    const listingObj = listing.toObject();
    listingObj.bidsCount = activeBids.length;
    listingObj.currentHighestBid = activeBids.length > 0 ? activeBids[0].amount : null;

    res.status(200).json(listingObj);
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
