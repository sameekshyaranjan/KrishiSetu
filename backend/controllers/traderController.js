const Trader = require('../models/Trader');

const getTraderProfile = async (req, res, next) => {
  try {
    const trader = await Trader.findById(req.user.id);
    if (!trader) {
      return res.status(404).json({ message: 'Trader not found' });
    }
    res.status(200).json(trader);
  } catch (error) {
    next(error);
  }
};

const updateTraderProfile = async (req, res, next) => {
  try {
    const trader = await Trader.findById(req.user.id);
    if (!trader) {
      return res.status(404).json({ message: 'Trader not found' });
    }

    const { name, companyName, licenseNumber, apmcAffiliation, operatingLocations } = req.body;

    trader.name = name || trader.name;
    trader.companyName = companyName || trader.companyName;
    trader.licenseNumber = licenseNumber || trader.licenseNumber;
    trader.apmcAffiliation = apmcAffiliation || trader.apmcAffiliation;
    trader.operatingLocations = operatingLocations || trader.operatingLocations;

    const updatedTrader = await trader.save();

    res.status(200).json(updatedTrader);
  } catch (error) {
    next(error);
  }
};

const updateTraderVerification = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be either approved or rejected' });
    }

    const trader = await Trader.findById(req.params.traderId);
    if (!trader) {
      return res.status(404).json({ message: 'Trader not found' });
    }

    trader.verificationStatus = status;
    await trader.save();

    res.status(200).json({ message: `Trader ${status} successfully`, trader });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTraderProfile, updateTraderProfile, updateTraderVerification };
