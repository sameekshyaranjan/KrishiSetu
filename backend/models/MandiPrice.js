const mongoose = require('mongoose');

const mandiPriceSchema = new mongoose.Schema({
  commodity: {
    type: String,
    required: [true, 'Commodity name is required']
  },
  market: {
    type: String,
    required: [true, 'Market name is required']
  },
  district: {
    type: String
  },
  state: {
    type: String
  },
  minPrice: {
    type: Number
  },
  maxPrice: {
    type: Number
  },
  modalPrice: {
    type: Number
  },
  arrivalDate: {
    type: Date
  },
  unit: {
    type: String,
    default: 'Quintal'
  },
  fetchedAt: {
    type: Date,
    default: Date.now
  }
});

mandiPriceSchema.index({ commodity: 1, market: 1, arrivalDate: 1 });
mandiPriceSchema.index({ commodity: 'text' });

const MandiPrice = mongoose.model('MandiPrice', mandiPriceSchema);

module.exports = MandiPrice;
