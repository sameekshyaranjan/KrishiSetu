const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Report must have a reporter'],
    refPath: 'reporterModel'
  },
  reporterModel: {
    type: String,
    required: true,
    enum: ['Farmer', 'Trader']
  },
  reportedCrop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop',
    required: [true, 'Please specify the crop being reported']
  },
  reason: {
    type: String,
    required: [true, 'Please provide a reason for the report'],
    enum: ['spam', 'fake_listing', 'inappropriate', 'fraud', 'other']
  },
  description: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved'],
    default: 'pending'
  },
  adminNotes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
