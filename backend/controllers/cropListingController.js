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

module.exports = { createCropListing };
