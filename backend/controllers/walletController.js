const Wallet = require('../models/Wallet');
const WalletLedger = require('../models/WalletLedger');
const Transaction = require('../models/Transaction');
const logger = require('../utils/logger');

/**
 * Get Trader Wallet Overview
 * Returns real available bidding liquid, locked escrow, total disbursed, and ledger history.
 */
const getWalletOverview = async (req, res, next) => {
  try {
    const traderId = req.user.id;

    // 1. Find or initialize trader's real wallet in MongoDB
    let wallet = await Wallet.findOne({ trader: traderId });
    if (!wallet) {
      wallet = await Wallet.create({
        trader: traderId,
        availableBalance: 0,
        lockedBalance: 0,
        totalDeposited: 0,
        totalDisbursed: 0
      });
    }

    // 2. Fetch real ledger history from MongoDB
    const ledgerEntries = await WalletLedger.find({ trader: traderId })
      .sort({ createdAt: -1 })
      .limit(50);

    // 3. Format transactions for frontend display
    const formattedTransactions = ledgerEntries.map(entry => {
      let statusDisplay = 'deposited';
      if (entry.type === 'BID_LOCK' || entry.type === 'ESCROW_LOCK') statusDisplay = 'locked';
      if (entry.type === 'PAYOUT_DISBURSED') statusDisplay = 'disbursed';

      return {
        _id: entry._id.toString(),
        orderId: entry.referenceId || `TXN-${entry._id.toString().slice(-6).toUpperCase()}`,
        cropName: entry.description || 'Escrow Capital Injection',
        farmerName: entry.paymentMethod || 'RBI Escrow Vault',
        amount: entry.amount,
        apmcCess: Math.round(entry.amount * 0.015),
        status: statusDisplay,
        date: entry.createdAt ? new Date(entry.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent',
        milestone: entry.type === 'TOP_UP' ? 'Direct Sandbox Bank Deposit' : 'APMC Milestone Settled',
        utr: entry.utr || `UTR-SBX-${entry._id.toString().slice(-8).toUpperCase()}`
      };
    });

    res.status(200).json({
      availableBalance: wallet.availableBalance || 0,
      lockedEscrow: wallet.lockedBalance || 0,
      totalDisbursed: wallet.totalDisbursed || 0,
      totalDeposited: wallet.totalDeposited || 0,
      transactions: formattedTransactions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Top Up Trader Wallet (Sandbox / Development Escrow Capital)
 * Atomically updates balance, generates auditable ledger record, and protects against duplicate submissions.
 */
const topUpWallet = async (req, res, next) => {
  try {
    const traderId = req.user.id;
    const { amount, paymentMethod, idempotencyKey } = req.body;

    // 1. Strict Server-Side Validation
    const parsedAmount = Number(amount);
    if (!parsedAmount || isNaN(parsedAmount) || !isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ message: 'Please provide a valid positive deposit amount.' });
    }

    if (parsedAmount < 100) {
      return res.status(400).json({ message: 'Minimum deposit amount is ₹100.' });
    }

    if (parsedAmount > 10000000) {
      return res.status(400).json({ message: 'Deposit amount exceeds the maximum limit of ₹1,00,00,000 per transaction.' });
    }

    // 2. Idempotency Check (prevent duplicate top-ups within 60s)
    if (idempotencyKey) {
      const recentTx = await WalletLedger.findOne({
        trader: traderId,
        idempotencyKey,
        createdAt: { $gte: new Date(Date.now() - 60000) }
      });

      if (recentTx) {
        logger.info(`[Wallet] Idempotency duplicate hit for key: ${idempotencyKey}`);
        const wallet = await Wallet.findOne({ trader: traderId });
        return res.status(200).json({
          message: 'Top-up already processed.',
          availableBalance: wallet.availableBalance,
          lockedEscrow: wallet.lockedBalance,
          totalDisbursed: wallet.totalDisbursed,
          transactions: await getFormattedLedger(traderId)
        });
      }
    }

    // 3. Atomically update wallet in MongoDB
    const updatedWallet = await Wallet.findOneAndUpdate(
      { trader: traderId },
      {
        $inc: {
          availableBalance: parsedAmount,
          totalDeposited: parsedAmount
        },
        $set: { updatedAt: Date.now() }
      },
      { new: true, upsert: true }
    );

    // 4. Create Immutable Ledger Entry
    const generatedUtr = `UTR-SBX-${Date.now().toString().slice(-8).toUpperCase()}`;
    const ledgerEntry = await WalletLedger.create({
      trader: traderId,
      wallet: updatedWallet._id,
      type: 'TOP_UP',
      amount: parsedAmount,
      balanceAfter: updatedWallet.availableBalance,
      status: 'completed',
      source: process.env.NODE_ENV === 'production' ? 'PRODUCTION_PAYMENT' : 'DEVELOPMENT_SANDBOX',
      paymentMethod: paymentMethod || 'Instant NetBanking / UPI',
      utr: generatedUtr,
      description: `Sandbox Escrow Top-Up (+₹${parsedAmount.toLocaleString('en-IN')})`,
      idempotencyKey: idempotencyKey || null
    });

    logger.info(`[Wallet] Credited ₹${parsedAmount} to Trader ${traderId}. New Balance: ₹${updatedWallet.availableBalance}`);

    const allFormattedTransactions = await getFormattedLedger(traderId);

    res.status(200).json({
      message: `₹${parsedAmount.toLocaleString('en-IN')} credited to Escrow Wallet successfully!`,
      availableBalance: updatedWallet.availableBalance,
      lockedEscrow: updatedWallet.lockedBalance,
      totalDisbursed: updatedWallet.totalDisbursed,
      totalDeposited: updatedWallet.totalDeposited,
      transactions: allFormattedTransactions
    });
  } catch (error) {
    next(error);
  }
};

const getFormattedLedger = async (traderId) => {
  const ledgerEntries = await WalletLedger.find({ trader: traderId })
    .sort({ createdAt: -1 })
    .limit(50);

  return ledgerEntries.map(entry => {
    let statusDisplay = 'deposited';
    if (entry.type === 'BID_LOCK' || entry.type === 'ESCROW_LOCK') statusDisplay = 'locked';
    if (entry.type === 'PAYOUT_DISBURSED') statusDisplay = 'disbursed';

    return {
      _id: entry._id.toString(),
      orderId: entry.referenceId || `TXN-${entry._id.toString().slice(-6).toUpperCase()}`,
      cropName: entry.description || 'Escrow Capital Injection',
      farmerName: entry.paymentMethod || 'RBI Escrow Vault',
      amount: entry.amount,
      apmcCess: Math.round(entry.amount * 0.015),
      status: statusDisplay,
      date: entry.createdAt ? new Date(entry.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent',
      milestone: entry.type === 'TOP_UP' ? 'Direct Sandbox Bank Deposit' : 'APMC Milestone Settled',
      utr: entry.utr || `UTR-SBX-${entry._id.toString().slice(-8).toUpperCase()}`
    };
  });
};

module.exports = {
  getWalletOverview,
  topUpWallet
};
