const mongoose = require('mongoose');

const governmentSchemeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Scheme name is required'],
    trim: true,
    unique: true
  },
  purpose: {
    type: String,
    required: [true, 'Purpose is required'],
    trim: true
  },
  category: {
    type: String,
    trim: true,
    default: 'Agricultural Subsidy'
  },
  portal: {
    type: String,
    trim: true
  },
  eligibility: {
    type: String,
    trim: true
  },
  benefits: {
    type: String,
    trim: true
  },
  officialLink: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'published', 'rejected'],
    default: 'pending',
    index: true
  },
  isPublished: {
    type: Boolean,
    default: false,
    index: true
  },
  moderatedAt: {
    type: Date
  },
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

governmentSchemeSchema.index({ status: 1, isPublished: 1 });

const GovernmentScheme = mongoose.model('GovernmentScheme', governmentSchemeSchema);

module.exports = GovernmentScheme;
