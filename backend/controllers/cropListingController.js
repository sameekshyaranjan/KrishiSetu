const Crop = require('../models/Crop');

const createCropListing = async (req, res, next) => {
  try {
    const { name, category, quantity, unit, basePrice, description, images } = req.body;

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
    const filter = { status: 'available' };

    if (req.query.category) filter.category = req.query.category;
    if (req.query.name) filter.name = { $regex: req.query.name, $options: 'i' };

    const listings = await Crop.find(filter)
      .populate('farmer', 'name village district state mobile')
      .sort({ createdAt: -1 });

    res.status(200).json(listings);
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

module.exports = { createCropListing, getMyListings, getAllListings, getListingById };
