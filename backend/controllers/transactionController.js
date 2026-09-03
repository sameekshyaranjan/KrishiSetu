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
        { path: 'cropListing', select: 'name category quantity unit basePrice images district description' },
        { path: 'farmer', select: 'name district state mobile' },
        { path: 'trader', select: 'name companyName mobile district' }
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
      .populate('cropListing', 'name category quantity unit basePrice images district description')
      .populate('farmer', 'name district state mobile')
      .populate('trader', 'name companyName mobile district');

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
    const status = req.body.status || req.body.logisticsStatus;

    if (status === 'in_transit') {
      return dispatchLot(req, res, next);
    }

    if (status === 'delivered') {
      return confirmDelivery(req, res, next);
    }

    if (!['pending', 'in_transit', 'arrived_mandi', 'delivered'].includes(status)) {
      return res.status(400).json({ message: 'Invalid logistics status' });
    }

    const tx = await Transaction.findById(req.params.id).populate('farmer trader cropListing');
    if (!tx) return res.status(404).json({ message: 'Transaction not found' });

    if (tx.farmer._id.toString() !== req.user.id && tx.trader._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update logistics status' });
    }

    tx.logisticsStatus = status;
    await tx.save();
    res.status(200).json({ message: 'Logistics status updated', transaction: tx });
  } catch (error) {
    next(error);
  }
};

const submitVehicleDetails = async (req, res, next) => {
  try {
    const { vehicleNumber, vehicleType, driverName, driverContact, vehiclePhoto, additionalNotes } = req.body;

    const tx = await Transaction.findById(req.params.id).populate('farmer trader cropListing');
    if (!tx) return res.status(404).json({ message: 'Transaction not found' });

    // Authorization: only the trader who bought the lot can submit vehicle details
    if (tx.trader._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the assigned trader can upload vehicle details' });
    }

    if (tx.logisticsStatus === 'in_transit' || tx.logisticsStatus === 'delivered') {
      return res.status(400).json({ message: 'Cannot update vehicle details for lots already dispatched or delivered' });
    }

    // Validation
    if (!vehicleNumber || vehicleNumber.trim().length < 4) {
      return res.status(400).json({ message: 'Please provide a valid vehicle registration number (e.g. KA-04-E-8821)' });
    }

    if (!driverName || driverName.trim().length < 2) {
      return res.status(400).json({ message: 'Please provide driver full name' });
    }

    if (!driverContact || !/^\d{10}$/.test(driverContact.trim())) {
      return res.status(400).json({ message: 'Please provide a valid 10-digit driver contact number' });
    }

    let photoUrl = vehiclePhoto;
    if (req.file) {
      photoUrl = req.file.path;
    }
    if (!photoUrl) {
      photoUrl = 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&auto=format&fit=crop';
    }

    tx.vehicleDetails = {
      vehicleNumber: vehicleNumber.trim().toUpperCase(),
      vehicleType: vehicleType ? vehicleType.trim() : 'APMC Standard Freight Fleet',
      driverName: driverName.trim(),
      driverContact: driverContact.trim(),
      vehiclePhoto: photoUrl,
      additionalNotes: additionalNotes ? additionalNotes.trim() : '',
      submittedAt: new Date()
    };

    await tx.save();

    createNotification(
      tx.farmer._id,
      'Farmer',
      'Vehicle Details Submitted',
      `Trader has assigned vehicle ${tx.vehicleDetails.vehicleNumber} (Driver: ${tx.vehicleDetails.driverName}) for ${tx.cropListing?.name || 'crop lot'}. Ready for dispatch.`
    );

    createNotification(
      tx.trader._id,
      'Trader',
      'Vehicle Assigned',
      `Vehicle ${tx.vehicleDetails.vehicleNumber} registered for ${tx.cropListing?.name || 'crop lot'}. Awaiting farmer dispatch.`
    );

    res.status(200).json({
      message: 'Vehicle details uploaded successfully. Farmer notified for lot dispatch.',
      transaction: tx
    });
  } catch (error) {
    next(error);
  }
};

const dispatchLot = async (req, res, next) => {
  try {
    const tx = await Transaction.findById(req.params.id).populate('farmer trader cropListing');
    if (!tx) return res.status(404).json({ message: 'Transaction not found' });

    // Authorization: only the farmer can dispatch
    if (tx.farmer._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the farmer can dispatch this crop lot' });
    }

    // Must have vehicle details
    if (!tx.vehicleDetails || !tx.vehicleDetails.vehicleNumber) {
      return res.status(400).json({ message: 'Vehicle details must be submitted by trader before lot can be dispatched' });
    }

    if (tx.logisticsStatus !== 'pending') {
      return res.status(400).json({ message: `Lot is already ${tx.logisticsStatus}` });
    }

    tx.logisticsStatus = 'in_transit';
    tx.dispatchedAt = new Date();
    await tx.save();

    createNotification(
      tx.trader._id,
      'Trader',
      'Crop Lot Dispatched',
      `Farmer has dispatched your crop lot for ${tx.cropListing?.name || 'produce'} via vehicle ${tx.vehicleDetails.vehicleNumber}. Logistics is now in transit.`
    );

    createNotification(
      tx.farmer._id,
      'Farmer',
      'Lot Dispatched',
      `Crop lot ${tx.cropListing?.name || ''} marked as dispatched to ${tx.trader?.name || 'trader'}.`
    );

    res.status(200).json({ message: 'Lot dispatched successfully and transporter in transit', transaction: tx });
  } catch (error) {
    next(error);
  }
};

const confirmDelivery = async (req, res, next) => {
  try {
    const tx = await Transaction.findById(req.params.id).populate('farmer trader cropListing');
    if (!tx) return res.status(404).json({ message: 'Transaction not found' });

    // Authorization: only the receiving trader can confirm delivery
    if (tx.trader._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the receiving trader can confirm delivery' });
    }

    if (tx.logisticsStatus === 'pending') {
      return res.status(400).json({ message: 'Delivery cannot be confirmed before the lot is dispatched by the farmer' });
    }

    if (tx.logisticsStatus === 'delivered' || tx.paymentStatus === 'payout_released') {
      return res.status(400).json({ message: 'Delivery and payout have already been confirmed for this transaction' });
    }

    const payoutAmount = tx.amount;
    const Wallet = require('../models/Wallet');
    const WalletLedger = require('../models/WalletLedger');

    // Release escrow: decrement lockedBalance and increment totalDisbursed
    const updatedTraderWallet = await Wallet.findOneAndUpdate(
      { trader: tx.trader._id, lockedBalance: { $gte: payoutAmount } },
      {
        $inc: { lockedBalance: -payoutAmount, totalDisbursed: payoutAmount },
        $set: { updatedAt: Date.now() }
      },
      { new: true }
    );

    // Create immutable WalletLedger PAYOUT_DISBURSED record
    await WalletLedger.create({
      trader: tx.trader._id,
      wallet: updatedTraderWallet ? updatedTraderWallet._id : null,
      type: 'PAYOUT_DISBURSED',
      amount: payoutAmount,
      balanceAfter: updatedTraderWallet ? updatedTraderWallet.availableBalance : 0,
      status: 'completed',
      source: 'DEVELOPMENT_SANDBOX',
      paymentMethod: 'Direct Benefit Transfer (DBT)',
      description: `Escrow payout released to farmer for ${tx.cropListing?.name || 'Crop Lot'}`,
      referenceId: String(tx._id)
    });

    tx.logisticsStatus = 'delivered';
    tx.paymentStatus = 'payout_released';
    tx.deliveredAt = new Date();
    await tx.save();

    createNotification(
      tx.farmer._id,
      'Farmer',
      'Escrow Payout Released 💸',
      `Crop delivery confirmed! ₹${payoutAmount.toLocaleString('en-IN')} has been released from escrow directly to your account.`
    );

    createNotification(
      tx.trader._id,
      'Trader',
      'Delivery Confirmed & Disbursed',
      `Delivery of ${tx.cropListing?.name || 'crop lot'} confirmed. ₹${payoutAmount.toLocaleString('en-IN')} escrow has been disbursed to ${tx.farmer?.name || 'farmer'}.`
    );

    res.status(200).json({
      message: `Delivery confirmed! ₹${payoutAmount.toLocaleString('en-IN')} released from escrow to farmer.`,
      transaction: tx
    });
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
  submitVehicleDetails,
  dispatchLot,
  confirmDelivery,
  disputeTransaction
};
