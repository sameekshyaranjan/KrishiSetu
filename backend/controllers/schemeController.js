const GovernmentScheme = require('../models/GovernmentScheme');
const { saveSchemesToDB } = require('../services/schemeService');
const auditEmitter = require('../utils/auditEmitter');

const getPublishedSchemes = async (req, res, next) => {
  try {
    const schemes = await GovernmentScheme.find({ isPublished: true, status: 'published' }).sort({ createdAt: -1 });
    res.status(200).json(schemes);
  } catch (error) {
    next(error);
  }
};

const getAllSchemes = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status && req.query.status !== 'all') {
      filter.status = req.query.status;
    }
    const schemes = await GovernmentScheme.find(filter).sort({ createdAt: -1 });
    res.status(200).json(schemes);
  } catch (error) {
    next(error);
  }
};

const createScheme = async (req, res, next) => {
  try {
    const { name, purpose, category, portal, eligibility, benefits, officialLink, isPublished, status } = req.body;
    const scheme = await GovernmentScheme.create({
      name,
      purpose,
      category,
      portal,
      eligibility,
      benefits,
      officialLink,
      isPublished: isPublished || false,
      status: status || 'pending'
    });
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

    const fields = ['name', 'purpose', 'category', 'portal', 'eligibility', 'benefits', 'officialLink', 'isPublished', 'status'];
    fields.forEach(f => {
      if (req.body[f] !== undefined) {
        scheme[f] = req.body[f];
      }
    });

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
    scheme.status = 'published';
    scheme.moderatedAt = new Date();
    scheme.moderatedBy = req.user?.id;
    await scheme.save();

    auditEmitter.emit('log', {
      action: 'Scheme Published',
      performedBy: req.user.id,
      performedByModel: req.user.role === 'admin' ? 'Admin' : 'Farmer', 
      targetId: scheme._id,
      targetModel: 'GovernmentScheme',
      details: { schemeName: scheme.name }
    });

    res.status(200).json({ message: 'Scheme approved and published to public portal', scheme });
  } catch (error) {
    next(error);
  }
};

const rejectScheme = async (req, res, next) => {
  try {
    const scheme = await GovernmentScheme.findById(req.params.id);
    if (!scheme) {
      return res.status(404).json({ message: 'Scheme not found' });
    }

    scheme.isPublished = false;
    scheme.status = 'rejected';
    scheme.moderatedAt = new Date();
    scheme.moderatedBy = req.user?.id;
    await scheme.save();

    res.status(200).json({ message: 'Scheme rejected and hidden from public portal', scheme });
  } catch (error) {
    next(error);
  }
};

const syncSchemes = async (req, res, next) => {
  try {
    const synced = await saveSchemesToDB();
    const all = await GovernmentScheme.find().sort({ createdAt: -1 });
    res.status(200).json({ 
      success: true, 
      message: `Successfully ingested schemes from official .gov.in and .nic.in portals`,
      count: synced.length,
      schemes: all 
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  getPublishedSchemes, 
  getAllSchemes, 
  createScheme, 
  updateScheme, 
  publishScheme, 
  rejectScheme, 
  syncSchemes 
};
