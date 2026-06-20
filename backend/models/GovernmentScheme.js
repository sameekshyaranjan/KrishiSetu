const mongoose = require('mongoose');

const governmentSchemeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Scheme name is required'],
    trim: true
  },
  purpose: {
    type: String,
    required: [true, 'Purpose is required']
  },
  eligibility: {
    type: String
  },
  benefits: {
    type: String
  },
  officialLink: {
    type: String
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const GovernmentScheme = mongoose.model('GovernmentScheme', governmentSchemeSchema);

module.exports = GovernmentScheme;
