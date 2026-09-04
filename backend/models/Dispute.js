const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema({
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
    required: true,
    unique: true,
    index: true
  },
  trader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trader',
    required: true,
    index: true
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true,
    index: true
  },
  cropListing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop'
  },
  bid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bid'
  },
  reason: {
    type: String,
    required: [true, 'Dispute reason or description is required'],
    trim: true
  },
  proofPhotos: [{
    type: String,
    trim: true
  }],
  escrowAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: [
      'raised',
      'under_review',
      'resolved_refund_trader',
      'resolved_split_85_15',
      'resolved_payout_farmer',
      'rejected'
    ],
    default: 'under_review',
    index: true
  },
  ruling: {
    action: {
      type: String,
      enum: ['refund_trader', 'split_85_15', 'payout_farmer', 'rejected']
    },
    notes: { type: String, trim: true },
    farmerPayout: { type: Number, default: 0 },
    traderRefund: { type: Number, default: 0 },
    resolvedAt: { type: Date },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

disputeSchema.index({ status: 1, createdAt: -1 });

const Dispute = mongoose.model('Dispute', disputeSchema);

module.exports = Dispute;
