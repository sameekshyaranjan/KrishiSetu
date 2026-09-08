const ColdStorage = require('../models/ColdStorage');

// Helper function: Calculate Haversine distance in kilometers between two coordinates
const calculateHaversineDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c * 10) / 10;
};

const getAllStorage = async (req, res, next) => {
  try {
    const filter = {};
    const { 
      district, 
      search, 
      isGovernmentOwned, 
      isSolarPowered, 
      chamberType,
      minCapacity,
      commodity
    } = req.query;

    if (district && district !== 'All' && district !== 'all') {
      filter.district = { $regex: new RegExp(`^${district}$`, 'i') };
    }

    if (isGovernmentOwned !== undefined && isGovernmentOwned !== '') {
      filter.isGovernmentOwned = isGovernmentOwned === 'true' || isGovernmentOwned === true;
    }

    if (isSolarPowered !== undefined && isSolarPowered !== '') {
      filter.isSolarPowered = isSolarPowered === 'true' || isSolarPowered === true;
    }

    if (chamberType && chamberType !== 'All') {
      filter.chamberType = { $regex: chamberType, $options: 'i' };
    }

    if (minCapacity) {
      filter.capacity = { $gte: Number(minCapacity) };
    }

    if (commodity && commodity !== 'All') {
      filter.commoditiesSupported = { $regex: commodity, $options: 'i' };
    }

    if (search && search.trim() !== '') {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      filter.$or = [
        { name: searchRegex },
        { address: searchRegex },
        { district: searchRegex },
        { chamberType: searchRegex }
      ];
    }

    const storages = await ColdStorage.find(filter).sort({ isGovernmentOwned: -1, capacity: -1, name: 1 });
    res.status(200).json(storages);
  } catch (error) {
    next(error);
  }
};

const getNearbyStorage = async (req, res, next) => {
  try {
    const { lat, lng, radiusInKm = 100 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude (lat) and Longitude (lng) are required' });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const maxDistMeters = parseFloat(radiusInKm) * 1000;

    let storages = [];

    try {
      // Primary: Use MongoDB $geoNear aggregation to get accurate distance
      storages = await ColdStorage.aggregate([
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [userLng, userLat]
            },
            distanceField: 'distanceInMeters',
            maxDistance: maxDistMeters,
            spherical: true
          }
        },
        {
          $addFields: {
            distanceKm: { $round: [{ $divide: ['$distanceInMeters', 1000] }, 1] }
          }
        }
      ]);
    } catch (geoErr) {
      // Fallback: Use standard $near query and calculate distance using Haversine
      const rawStorages = await ColdStorage.find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [userLng, userLat]
            },
            $maxDistance: maxDistMeters
          }
        }
      });

      storages = rawStorages.map(doc => {
        const item = doc.toObject();
        const coords = item.location?.coordinates || [0, 0];
        item.distanceKm = calculateHaversineDistanceKm(userLat, userLng, coords[1], coords[0]);
        return item;
      });
    }

    res.status(200).json(storages);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllStorage,
  getNearbyStorage
};
