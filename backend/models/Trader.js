const mongoose = require('mongoose');

const traderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide the trader name']
  },
  mobile: {
    type: String,
    required: [true, 'Please provide a mobile number'],
    unique: true,
    match: [/^\d{10}$/, 'Please provide a valid 10-digit mobile number']
  },
  companyName: {
    type: String
  },
  licenseNumber: {
    type: String
  },
  apmcAffiliation: {
    type: String
  },
  operatingLocations: [{
    type: String
  }],
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  documents: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Trader = mongoose.model('Trader', traderSchema);

module.exports = Trader;
