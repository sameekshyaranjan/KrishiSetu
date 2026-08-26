const Razorpay = require('razorpay');
const crypto = require('crypto');
const Transaction = require('../models/Transaction');
const Bid = require('../models/Bid');
const Crop = require('../models/Crop');
const { paginate } = require('../utils/paginate');
const { createNotification } = require('../utils/createNotification');
const logger = require('../utils/logger');

const createRazorpayOrder = async (req, res, next) => {
  try {
    const { cropListing, bid, amount, farmerId } = req.body;
    
    // Validate bid exists and is accepted
    const existingBid = await Bid.findById(bid);
    if (!existingBid || existingBid.status !== 'accepted') {
      return res.status(400).json({ message: 'Can only pay for accepted bids.' });
    }

    const existingTx = await Transaction.findOne({ bid });
    if (existingTx) {
      return res.status(400).json({ message: 'A transaction for this bid already exists.' });
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
      logger.info('[DEV MOCK] Generating fake Razorpay order...');
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
      const tx = await Transaction.findByIdAndUpdate(transactionId, {
        paymentStatus: 'held_in_escrow'
      }, { new: true }).populate('trader');
      
      createNotification(
        tx.farmer,
        'Farmer',
        'Payment in Escrow',
        `Payment of ₹${tx.amount} has been successfully placed in escrow by ${tx.trader?.name || 'a trader'}. Please prepare the crop for pickup/delivery.`
      );

      res.status(200).json({ message: 'Payment verified and held in escrow' });
    } else {
      const tx = await Transaction.findByIdAndUpdate(transactionId, {
        paymentStatus: 'failed'
      });
      
      // Rollback crop and bid statuses
      await Bid.findByIdAndUpdate(tx.bid, { status: 'pending' });
      await Crop.findByIdAndUpdate(tx.cropListing, { status: 'available' });

      res.status(400).json({ message: 'Invalid payment signature, transaction failed and rolled back' });
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

    const existingTx = await Transaction.findOne({ bid });
    if (existingTx) {
      return res.status(400).json({ message: 'A transaction for this bid already exists.' });
    }

    const transaction = await Transaction.create({
      farmer: farmerId,
      trader: req.user.id, // Assuming trader records it
      cropListing,
      bid,
      amount,
      paymentMethod: 'manual',
      paymentStatus: 'completed',
      logisticsStatus: 'delivered',
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

    const result = await paginate(
      Transaction,
      filter,
      req.query.page,
      req.query.limit,
      [
        { path: 'cropListing', select: 'title variety quantity expectedPrice' },
        { path: 'farmer', select: 'name district state mobile' },
        { path: 'trader', select: 'name companyName mobile' }
      ],
      { transactionDate: -1 }
    );

    res.status(200).json(result);
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

const updateLogisticsStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'in_transit', 'delivered'].includes(status)) {
      return res.status(400).json({ message: 'Invalid logistics status' });
    }

    const tx = await Transaction.findById(req.params.id).populate('farmer trader cropListing');
    if (!tx) return res.status(404).json({ message: 'Transaction not found' });

    if (tx.farmer._id.toString() !== req.user.id && tx.trader._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update logistics status' });
    }

    tx.logisticsStatus = status;

    if (status === 'delivered') {
      tx.paymentStatus = 'payout_released';
      logger.info(`\n[PAYOUT SIMULATION] Releasing ₹${tx.amount} from Escrow to Farmer: ${tx.farmer.name}\n`);

      createNotification(
        tx.farmer._id,
        'Farmer',
        'Payout Released',
        `Crop delivery confirmed! ₹${tx.amount} has been released from escrow to your bank account.`
      );
      createNotification(
        tx.trader._id,
        'Trader',
        'Delivery Confirmed',
        `Delivery of ${tx.cropListing.name} confirmed. Thank you for using KrishiSetu.`
      );
    } else if (status === 'in_transit') {
      createNotification(
        tx.trader._id,
        'Trader',
        'Crop In Transit',
        `Your crop ${tx.cropListing.name} is now in transit.`
      );
    }

    await tx.save();
    res.status(200).json({ message: 'Logistics status updated', transaction: tx });
  } catch (error) {
    next(error);
  }
};

const disputeTransaction = async (req, res, next) => {
  try {
    const tx = await Transaction.findById(req.params.id).populate('farmer trader cropListing');
    if (!tx) return res.status(404).json({ message: 'Transaction not found' });

    if (tx.farmer._id.toString() !== req.user.id && tx.trader._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to dispute this transaction' });
    }

    if (tx.paymentStatus !== 'held_in_escrow' || !['pending', 'in_transit', 'delivered'].includes(tx.logisticsStatus)) {
      return res.status(400).json({ message: 'Transaction cannot be disputed at this stage' });
    }

    tx.logisticsStatus = 'disputed';
    await tx.save();

    const otherParty = tx.farmer._id.toString() === req.user.id ? tx.trader._id : tx.farmer._id;
    const otherPartyRole = tx.farmer._id.toString() === req.user.id ? 'Trader' : 'Farmer';
    const myRole = req.user.role === 'farmer' ? 'Farmer' : 'Trader';

    const { createNotification } = require('../utils/createNotification');
    createNotification(
      otherParty,
      otherPartyRole,
      'Transaction Disputed',
      `The ${myRole} has disputed the transaction for ${tx.cropListing.name}. Escrow is frozen pending Admin review.`
    );

    res.status(200).json({ message: 'Transaction marked as disputed. Escrow frozen.', transaction: tx });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment,
  recordManualTransaction,
  getMyTransactions,
  getTransactionById,
  updateLogisticsStatus,
  disputeTransaction
};
