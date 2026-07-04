const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer'
  },
  trader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trader'
  },
  cropListing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop'
  },
  bid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bid'
  },
  amount: {
    type: Number,
    required: [true, 'Transaction amount is required']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'initiated', 'completed', 'failed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'manual']
  },
  paymentGatewayId: {
    type: String
  },
  receiptUrl: {
    type: String
  },
  transactionDate: {
    type: Date,
    default: Date.now
  }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
