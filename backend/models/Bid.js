const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  crop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop',
    required: [true, 'Bid must be placed on a specific crop']
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: [true, 'Bid must have an associated farmer']
  },
  trader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trader',
    required: [true, 'Bid must be placed by a trader']
  },
  amount: {
    type: Number,
    required: [true, 'Please provide the bid amount'],
    min: 0
  },
  originalAmount: {
    type: Number,
    min: 0
  },
  counterAmount: {
    type: Number,
    min: 0
  },
  counterProposedBy: {
    type: String,
    enum: ['farmer', 'trader', null],
    default: null
  },
  counterMessage: {
    type: String
  },
  negotiationHistory: [
    {
      proposedBy: {
        type: String,
        enum: ['farmer', 'trader'],
        required: true
      },
      amount: {
        type: Number,
        required: true
      },
      message: {
        type: String
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  status: {
    type: String,
    enum: ['pending', 'countered', 'accepted', 'rejected', 'withdrawn', 'cancelled'],
    default: 'pending'
  },
  message: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

bidSchema.index({ crop: 1, status: 1 });
bidSchema.index({ trader: 1, createdAt: -1 });
bidSchema.index({ farmer: 1 });

const Bid = mongoose.model('Bid', bidSchema);

module.exports = Bid;
