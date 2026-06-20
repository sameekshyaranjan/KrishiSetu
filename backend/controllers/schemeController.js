const GovernmentScheme = require('../models/GovernmentScheme');

const getPublishedSchemes = async (req, res, next) => {
  try {
    const schemes = await GovernmentScheme.find({ isPublished: true }).sort({ createdAt: -1 });
    res.status(200).json(schemes);
  } catch (error) {
    next(error);
  }
};

const getAllSchemes = async (req, res, next) => {
  try {
    const schemes = await GovernmentScheme.find().sort({ createdAt: -1 });
    res.status(200).json(schemes);
  } catch (error) {
    next(error);
  }
};

const createScheme = async (req, res, next) => {
  try {
    const { name, purpose, eligibility, benefits, officialLink } = req.body;
    const scheme = await GovernmentScheme.create({ name, purpose, eligibility, benefits, officialLink });
    res.status(201).json(scheme);
  } catch (error) {
    next(error);
  }
};

const updateScheme = async (req, res, next) => {
  try {
    const scheme = await GovernmentScheme.findById(req.params.id);
    if (!scheme) {
      return res.status(404).json({ message: 'Scheme not found' });
    }

    const { name, purpose, eligibility, benefits, officialLink } = req.body;
    scheme.name = name || scheme.name;
    scheme.purpose = purpose || scheme.purpose;
    scheme.eligibility = eligibility || scheme.eligibility;
    scheme.benefits = benefits || scheme.benefits;
    scheme.officialLink = officialLink || scheme.officialLink;

    const updatedScheme = await scheme.save();
    res.status(200).json(updatedScheme);
  } catch (error) {
    next(error);
  }
};

const publishScheme = async (req, res, next) => {
  try {
    const scheme = await GovernmentScheme.findById(req.params.id);
    if (!scheme) {
      return res.status(404).json({ message: 'Scheme not found' });
    }

    scheme.isPublished = true;
    await scheme.save();

    res.status(200).json({ message: 'Scheme published successfully', scheme });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPublishedSchemes, getAllSchemes, createScheme, updateScheme, publishScheme };
