const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: [true, 'Crop must belong to a farmer']
  },
  name: {
    type: String,
    required: [true, 'Please provide the crop name']
  },
  category: {
    type: String,
    enum: ['vegetables', 'fruits', 'grains', 'spices', 'pulses', 'other'],
    required: [true, 'Please provide a category']
  },
  quantity: {
    type: Number,
    required: [true, 'Please provide the quantity'],
    min: 0
  },
  unit: {
    type: String,
    enum: ['kg', 'quintal', 'tonne'],
    default: 'quintal'
  },
  basePrice: {
    type: Number,
    required: [true, 'Please provide a base price (minimum expected price)'],
    min: 0
  },
  description: {
    type: String
  },
  images: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['available', 'sold', 'removed'],
    default: 'available'
  },
  harvestStatus: {
    type: String,
    enum: ['pre-harvest', 'post-harvest'],
    default: 'post-harvest'
  },
  expectedHarvestDate: {
    type: Date,
    required: function() {
      return this.harvestStatus === 'pre-harvest';
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

cropSchema.index({ status: 1, category: 1 });
cropSchema.index({ farmer: 1, status: 1 });
cropSchema.index({ name: 'text' });

const Crop = mongoose.model('Crop', cropSchema);

module.exports = Crop;
