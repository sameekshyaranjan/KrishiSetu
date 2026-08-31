const mongoose = require('mongoose');

const walletLedgerSchema = new mongoose.Schema({
  trader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trader',
    required: true,
    index: true
  },
  wallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    required: true
  },
  type: {
    type: String,
    enum: ['TOP_UP', 'BID_LOCK', 'BID_RELEASE', 'ESCROW_LOCK', 'PAYOUT_DISBURSED', 'REFUND'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  balanceAfter: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed'
  },
  source: {
    type: String,
    default: 'DEVELOPMENT_SANDBOX'
  },
  paymentMethod: {
    type: String,
    default: 'Instant NetBanking / UPI'
  },
  utr: {
    type: String
  },
  description: {
    type: String
  },
  referenceId: {
    type: String
  },
  idempotencyKey: {
    type: String,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

walletLedgerSchema.index({ trader: 1, createdAt: -1 });

const WalletLedger = mongoose.model('WalletLedger', walletLedgerSchema);

module.exports = WalletLedger;
