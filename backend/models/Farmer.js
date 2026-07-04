const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide the farmer name'],
    index: true
  },
  mobile: {
    type: String,
    required: [true, 'Please provide a mobile number'],
    unique: true,
    match: [/^\d{10}$/, 'Please provide a valid 10-digit mobile number']
  },
  village: {
    type: String
  },
  district: {
    type: String,
    index: true
  },
  state: {
    type: String
  },
  cropsGrown: [{
    type: String
  }],
  landArea: {
    type: Number
  },
  sowingSeason: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  language: {
    type: String,
    default: 'en'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Farmer = mongoose.model('Farmer', farmerSchema);

module.exports = Farmer;
