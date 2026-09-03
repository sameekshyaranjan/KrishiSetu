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
    required: [true, 'Transaction amount is required'],
    min: 0
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'initiated', 'held_in_escrow', 'completed', 'failed', 'payout_released', 'refunded'],
    default: 'pending'
  },
  logisticsStatus: {
    type: String,
    enum: ['pending', 'in_transit', 'arrived_mandi', 'delivered', 'disputed', 'resolved'],
    default: 'pending'
  },
  vehicleDetails: {
    vehicleNumber: { type: String, trim: true },
    vehicleType: { type: String, trim: true },
    driverName: { type: String, trim: true },
    driverContact: { type: String, trim: true },
    vehiclePhoto: { type: String, trim: true },
    additionalNotes: { type: String, trim: true },
    submittedAt: { type: Date }
  },
  dispatchedAt: {
    type: Date
  },
  deliveredAt: {
    type: Date
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

transactionSchema.index({ farmer: 1, transactionDate: -1 });
transactionSchema.index({ trader: 1, transactionDate: -1 });
transactionSchema.index({ paymentStatus: 1 });
transactionSchema.index({ bid: 1 }, { unique: true, partialFilterExpression: { bid: { $exists: true, $type: "objectId" } } });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
