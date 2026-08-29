const mongoose = require('mongoose');

const mandiPriceSchema = new mongoose.Schema({
  commodity: {
    type: String,
    required: [true, 'Commodity name is required'],
    trim: true,
    index: true
  },
  variety: {
    type: String,
    default: 'Standard',
    trim: true
  },
  grade: {
    type: String,
    default: 'FAQ',
    trim: true
  },
  market: {
    type: String,
    required: [true, 'Market name is required'],
    trim: true,
    index: true
  },
  district: {
    type: String,
    trim: true,
    index: true
  },
  state: {
    type: String,
    trim: true,
    index: true
  },
  minPrice: {
    type: Number,
    required: true
  },
  maxPrice: {
    type: Number,
    required: true
  },
  modalPrice: {
    type: Number,
    required: true
  },
  arrivalDate: {
    type: Date,
    required: true,
    index: true
  },
  unit: {
    type: String,
    default: 'Quintal'
  },
  fetchedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound unique index ensuring idempotent ingestion without overwriting distinct varieties on the same arrival date
mandiPriceSchema.index({ market: 1, commodity: 1, variety: 1, arrivalDate: 1 }, { unique: true });
mandiPriceSchema.index({ commodity: 'text', market: 'text', district: 'text' });

const MandiPrice = mongoose.model('MandiPrice', mandiPriceSchema);

module.exports = MandiPrice;
