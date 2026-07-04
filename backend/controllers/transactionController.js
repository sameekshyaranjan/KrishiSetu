const Razorpay = require('razorpay');
const crypto = require('crypto');
const Transaction = require('../models/Transaction');
const Bid = require('../models/Bid');

const createRazorpayOrder = async (req, res, next) => {
  try {
    const { cropListing, bid, amount, farmerId } = req.body;
    
    // Validate bid exists and is accepted
    const existingBid = await Bid.findById(bid);
    if (!existingBid || existingBid.status !== 'accepted') {
      return res.status(400).json({ message: 'Can only pay for accepted bids.' });
    }

    const razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key_id',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret',
    });

    const options = {
      amount: Math.round(amount * 100), // amount in the smallest currency unit (paise)
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    };

    let order;
    if (process.env.NODE_ENV === 'development' && (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes('dummy'))) {
      // Dev Mock for Razorpay
      console.log('[DEV MOCK] Generating fake Razorpay order...');
      order = { id: `order_dev_${Date.now()}`, amount: options.amount, currency: "INR" };
    } else {
      order = await razorpayInstance.orders.create(options);
    }

    const transaction = await Transaction.create({
      farmer: farmerId,
      trader: req.user.id,
      cropListing,
      bid,
      amount,
      paymentMethod: 'razorpay',
      paymentStatus: 'initiated',
      paymentGatewayId: order.id
    });

    res.status(201).json({ order, transactionId: transaction._id });
  } catch (error) {
    next(error);
  }
};

const verifyRazorpayPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, transactionId } = req.body;

    const secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret';

    let isAuthentic = false;
    
    if (process.env.NODE_ENV === 'development' && razorpay_order_id.startsWith('order_dev_')) {
      // Bypass signature check in Dev Mock
      isAuthentic = true;
    } else {
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(body.toString())
        .digest("hex");
      isAuthentic = expectedSignature === razorpay_signature;
    }

    if (isAuthentic) {
      await Transaction.findByIdAndUpdate(transactionId, {
        paymentStatus: 'completed',
        paymentGatewayId: razorpay_payment_id
      });
      res.status(200).json({ message: 'Payment verified successfully' });
    } else {
      await Transaction.findByIdAndUpdate(transactionId, {
        paymentStatus: 'failed'
      });
      res.status(400).json({ message: 'Invalid payment signature' });
    }
  } catch (error) {
    next(error);
  }
};

const recordManualTransaction = async (req, res, next) => {
  try {
    const { cropListing, bid, amount, farmerId } = req.body;

    const existingBid = await Bid.findById(bid);
    if (!existingBid || existingBid.status !== 'accepted') {
      return res.status(400).json({ message: 'Can only record manual transactions for accepted bids.' });
    }

    const transaction = await Transaction.create({
      farmer: farmerId,
      trader: req.user.id, // Assuming trader records it
      cropListing,
      bid,
      amount,
      paymentMethod: 'manual',
      paymentStatus: 'completed',
      transactionDate: Date.now()
    });

    res.status(201).json({ message: 'Manual transaction recorded successfully', transaction });
  } catch (error) {
    next(error);
  }
};

const getMyTransactions = async (req, res, next) => {
  try {
    const role = req.user.role; // injected by protect middleware
    const filter = role === 'farmer' ? { farmer: req.user.id } : { trader: req.user.id };

    const transactions = await Transaction.find(filter)
      .populate('cropListing', 'title variety quantity expectedPrice')
      .populate('farmer', 'name district state mobile')
      .populate('trader', 'name companyName mobile')
      .sort({ transactionDate: -1 });

    res.status(200).json(transactions);
  } catch (error) {
    next(error);
  }
};

const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('cropListing', 'title variety quantity expectedPrice')
      .populate('farmer', 'name district state mobile')
      .populate('trader', 'name companyName mobile');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Access control: only involved parties can view
    if (transaction.farmer._id.toString() !== req.user.id && transaction.trader._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this transaction' });
    }

    res.status(200).json(transaction);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment,
  recordManualTransaction,
  getMyTransactions,
  getTransactionById
};
