const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  trader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trader',
    required: true,
    unique: true,
    index: true
  },
  availableBalance: {
    type: Number,
    default: 0,
    min: [0, 'Available balance cannot be negative']
  },
  lockedBalance: {
    type: Number,
    default: 0,
    min: [0, 'Locked balance cannot be negative']
  },
  totalDeposited: {
    type: Number,
    default: 0,
    min: [0, 'Total deposited cannot be negative']
  },
  totalDisbursed: {
    type: Number,
    default: 0,
    min: [0, 'Total disbursed cannot be negative']
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = Wallet;
