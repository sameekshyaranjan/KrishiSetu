const Farmer = require('../models/Farmer');

const getFarmerProfile = async (req, res, next) => {
  try {
    const farmer = await Farmer.findById(req.user.id);
    if (!farmer) {
      return res.status(404).json({ message: 'Farmer not found' });
    }
    res.status(200).json(farmer);
  } catch (error) {
    next(error);
  }
};

const updateFarmerProfile = async (req, res, next) => {
  try {
    const farmer = await Farmer.findById(req.user.id);
    
    if (!farmer) {
      return res.status(404).json({ message: 'Farmer not found' });
    }

    const { name, village, district, state, cropsGrown, landArea, sowingSeason, language } = req.body;

    farmer.name = name || farmer.name;
    farmer.village = village || farmer.village;
    farmer.district = district || farmer.district;
    farmer.state = state || farmer.state;
    farmer.cropsGrown = cropsGrown || farmer.cropsGrown;
    farmer.landArea = landArea || farmer.landArea;
    farmer.sowingSeason = sowingSeason || farmer.sowingSeason;
    farmer.language = language || farmer.language;

    const updatedFarmer = await farmer.save();

    res.status(200).json(updatedFarmer);
  } catch (error) {
    next(error);
  }
};

const registerFarmerByAdmin = async (req, res, next) => {
  try {
    const { mobile, name, state, district, village, cropsGrown, landArea, language } = req.body;

    if (!mobile) {
      return res.status(400).json({ message: 'Mobile number is required to register a farmer' });
    }

    const farmerExists = await Farmer.findOne({ mobile });
    if (farmerExists) {
      return res.status(400).json({ message: 'Farmer with this mobile number already exists' });
    }

    const farmer = await Farmer.create({
      mobile,
      name: name || mobile,
      state,
      district,
      village,
      cropsGrown,
      landArea,
      language
    });

    res.status(201).json(farmer);
  } catch (error) {
    next(error);
  }
};

module.exports = { getFarmerProfile, updateFarmerProfile, registerFarmerByAdmin };
