const ColdStorage = require('../models/ColdStorage');

const getAllStorage = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.district) {
      filter.district = { $regex: req.query.district, $options: 'i' };
    }

    const storages = await ColdStorage.find(filter).sort({ name: 1 });
    res.status(200).json(storages);
  } catch (error) {
    next(error);
  }
};

const getNearbyStorage = async (req, res, next) => {
  try {
    const { lat, lng, radiusInKm = 50 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude (lat) and Longitude (lng) are required' });
    }

    const storages = await ColdStorage.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)] // MongoDB expects [longitude, latitude]
          },
          $maxDistance: parseFloat(radiusInKm) * 1000 // Convert km to meters
        }
      }
    });

    res.status(200).json(storages);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllStorage,
  getNearbyStorage
};
