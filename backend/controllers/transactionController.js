const Transaction = require('../models/Transaction');
const Bid = require('../models/Bid');
const Crop = require('../models/Crop');
const Dispute = require('../models/Dispute');
const { paginate } = require('../utils/paginate');
const { createNotification } = require('../utils/createNotification');
const logger = require('../utils/logger');



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

    const Dispute = require('../models/Dispute');
    if (result && Array.isArray(result.data)) {
      result.data = await Promise.all(result.data.map(async (tx) => {
        const txObj = tx.toObject ? tx.toObject() : tx;
        const dispute = await Dispute.findOne({ transaction: tx._id });
        if (dispute) {
          txObj.dispute = dispute;
        }
        return txObj;
      }));
    }

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

    const Dispute = require('../models/Dispute');
    const dispute = await Dispute.findOne({ transaction: transaction._id });
    const txObj = transaction.toObject();
    if (dispute) {
      txObj.dispute = dispute;
    }

    res.status(200).json(txObj);
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
    const { vehicleNumber, vehicleType, capacity, driverName, driverContact, vehiclePhoto, additionalNotes } = req.body;

    const tx = await Transaction.findById(req.params.id).populate('farmer trader cropListing');
    if (!tx) return res.status(404).json({ message: 'Transaction not found' });

    // Authorization: only the trader who bought the lot can submit vehicle details
    if (tx.trader._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the assigned trader can upload vehicle details' });
    }

    if (tx.paymentStatus === 'refunded' || tx.logisticsStatus === 'delivered' || tx.logisticsStatus === 'in_transit') {
      return res.status(400).json({ message: 'Cannot update vehicle details for lots already dispatched, delivered, or refunded' });
    }

    // Validation
    if (!vehicleNumber || vehicleNumber.trim().length < 4) {
      return res.status(400).json({ message: 'Please provide a valid vehicle registration number (e.g. KA-04-E-8821)' });
    }

    if (!vehicleType || vehicleType.trim().length < 2) {
      return res.status(400).json({ message: 'Please provide vehicle type (e.g. Tata 407, Eicher 19ft)' });
    }

    if (!capacity || capacity.trim().length < 1) {
      return res.status(400).json({ message: 'Please provide vehicle capacity (e.g. 10 tonnes, 80 quintals)' });
    }

    if (!driverName || driverName.trim().length < 2) {
      return res.status(400).json({ message: 'Please provide driver full name' });
    }

    if (!driverContact || !/^\d{10}$/.test(driverContact.trim())) {
      return res.status(400).json({ message: 'Please provide a valid 10-digit driver contact number' });
    }

    const serverUrl = process.env.SERVER_URL || `${req.protocol}://${req.get('host')}`;
    let photoUrl = (vehiclePhoto && typeof vehiclePhoto === 'string' && !vehiclePhoto.startsWith('data:image')) ? vehiclePhoto : '';
    if (req.file) {
      if (req.file.path && req.file.path.startsWith('http')) {
        photoUrl = req.file.path;
      } else if (req.file.filename) {
        photoUrl = `${serverUrl}/uploads/${req.file.filename}`;
      } else {
        photoUrl = req.file.path || '';
      }
    }
    if (!photoUrl) {
      photoUrl = 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&auto=format&fit=crop';
    }

    tx.vehicleDetails = {
      vehicleNumber: vehicleNumber.trim().toUpperCase(),
      vehicleType: vehicleType.trim(),
      capacity: capacity.trim(),
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

    if (tx.paymentStatus === 'refunded') {
      return res.status(400).json({ message: 'This transaction has been refunded and closed.' });
    }

    if (tx.logisticsStatus !== 'pending' && tx.logisticsStatus !== 'disputed' && tx.logisticsStatus !== 'resolved') {
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
    const traderId = (tx.trader && tx.trader._id) ? tx.trader._id.toString() : (tx.trader ? tx.trader.toString() : '');
    const currentUserId = (req.user && req.user._id) ? req.user._id.toString() : (req.user ? req.user.id?.toString() : '');
    if (traderId !== currentUserId) {
      return res.status(403).json({ message: 'Only the receiving trader can confirm delivery' });
    }

    if (tx.paymentStatus === 'refunded') {
      return res.status(400).json({ message: 'This transaction has been refunded to buyer and closed' });
    }

    const Dispute = require('../models/Dispute');
    const dispute = await Dispute.findOne({ transaction: tx._id });

    // Check if this transaction has an arbitrated dispute awaiting delivery
    const isDisputeAwaitingDelivery = 
      tx.disputeResolutionStatus === 'awaiting_delivery' ||
      tx.logisticsStatus === 'resolved' ||
      (dispute && dispute.status && dispute.status.startsWith('resolved_') && tx.paymentStatus === 'held_in_escrow');

    if (tx.logisticsStatus === 'pending' && !isDisputeAwaitingDelivery) {
      return res.status(400).json({ message: 'Delivery cannot be confirmed before the lot is dispatched by the farmer' });
    }

    if (tx.logisticsStatus === 'delivered' || tx.paymentStatus === 'payout_released' || (tx.disputeResolutionStatus === 'executed' && tx.paymentStatus === 'completed')) {
      return res.status(400).json({ message: 'Delivery and payout have already been confirmed for this transaction' });
    }

    const totalEscrow = tx.amount;
    let farmerPayout = totalEscrow;
    let traderRefund = 0;
    let finalPaymentStatus = 'payout_released';

    // Check if an Admin dispute ruling exists
    if (dispute && dispute.ruling && dispute.ruling.action) {
      if (dispute.ruling.action === 'split_85_15') {
        farmerPayout = dispute.ruling.farmerPayout || Math.round(totalEscrow * 0.85);
        traderRefund = dispute.ruling.traderRefund || (totalEscrow - farmerPayout);
        finalPaymentStatus = 'completed';
      } else if (dispute.ruling.action === 'payout_farmer') {
        farmerPayout = totalEscrow;
        traderRefund = 0;
        finalPaymentStatus = 'payout_released';
      }
    } else if (tx.disputeResolution === 'split_85_15') {
      farmerPayout = tx.farmerPayoutAmount || Math.round(totalEscrow * 0.85);
      traderRefund = tx.traderRefundAmount || (totalEscrow - farmerPayout);
      finalPaymentStatus = 'completed';
    } else if (tx.disputeResolution === 'payout_farmer') {
      farmerPayout = totalEscrow;
      traderRefund = 0;
      finalPaymentStatus = 'payout_released';
    }

    const Wallet = require('../models/Wallet');
    const WalletLedger = require('../models/WalletLedger');

    // Release escrow: decrement lockedBalance, credit traderRefund to available, credit farmerPayout to disbursed
    const traderWallet = await Wallet.findOne({ trader: tx.trader._id || tx.trader });
    let updatedTraderWallet = null;
    if (traderWallet) {
      const deductLocked = Math.min(traderWallet.lockedBalance || 0, totalEscrow);
      traderWallet.lockedBalance = Math.max(0, (traderWallet.lockedBalance || 0) - deductLocked);
      traderWallet.availableBalance = (traderWallet.availableBalance || 0) + traderRefund;
      traderWallet.totalDisbursed = (traderWallet.totalDisbursed || 0) + farmerPayout;
      traderWallet.updatedAt = Date.now();
      await traderWallet.save();
      updatedTraderWallet = traderWallet;
    }

    // Create immutable WalletLedger entries
    if (traderRefund > 0) {
      await WalletLedger.create({
        trader: tx.trader._id,
        wallet: updatedTraderWallet ? updatedTraderWallet._id : null,
        type: 'REFUND',
        amount: traderRefund,
        balanceAfter: updatedTraderWallet ? updatedTraderWallet.availableBalance : 0,
        status: 'completed',
        source: 'APMC_DISPUTE_ARBITRATION',
        paymentMethod: 'Escrow Partial Refund (15%)',
        description: `15% Escrow refund to trader upon delivery acceptance for ${tx.cropListing?.name || 'Crop Lot'}`,
        referenceId: String(tx._id)
      });
    }

    if (farmerPayout > 0) {
      await WalletLedger.create({
        trader: tx.trader._id,
        wallet: updatedTraderWallet ? updatedTraderWallet._id : null,
        type: 'PAYOUT_DISBURSED',
        amount: farmerPayout,
        balanceAfter: updatedTraderWallet ? updatedTraderWallet.availableBalance : 0,
        status: 'completed',
        source: 'APMC_ESCROW_SETTLEMENT',
        paymentMethod: 'Direct Benefit Transfer (DBT)',
        description: `Escrow payout released to farmer for ${tx.cropListing?.name || 'Crop Lot'}`,
        referenceId: String(tx._id)
      });
    }

    // Finalize Dispute document if present
    if (dispute) {
      if (dispute.ruling?.action === 'split_85_15') {
        dispute.status = 'resolved_split_85_15';
      } else if (dispute.ruling?.action === 'payout_farmer') {
        dispute.status = 'resolved_payout_farmer';
      }
      dispute.updatedAt = new Date();
      await dispute.save();
    }

    tx.logisticsStatus = 'delivered';
    tx.paymentStatus = finalPaymentStatus;
    tx.deliveredAt = new Date();
    tx.disputeResolutionStatus = 'executed';
    tx.farmerPayoutAmount = farmerPayout;
    tx.traderRefundAmount = traderRefund;
    await tx.save();

    if (tx.bid) {
      await Bid.findByIdAndUpdate(tx.bid, { status: isDisputeAwaitingDelivery ? 'dispute_resolved' : 'accepted' });
    }

    if (tx.cropListing) {
      await Crop.findByIdAndUpdate(tx.cropListing._id, { status: 'sold' });
    }

    if (traderRefund > 0) {
      createNotification(
        tx.farmer._id,
        'Farmer',
        'Escrow Payout Released 💸',
        `Crop delivery confirmed! ₹${farmerPayout.toLocaleString('en-IN')} (85% dispute settlement) has been released from escrow directly to your account.`
      );

      createNotification(
        tx.trader._id,
        'Trader',
        'Delivery Confirmed & Settled',
        `Delivery of ${tx.cropListing?.name || 'crop lot'} confirmed. ₹${farmerPayout.toLocaleString('en-IN')} (85%) disbursed to farmer, and ₹${traderRefund.toLocaleString('en-IN')} (15%) returned to your available balance.`
      );
    } else {
      createNotification(
        tx.farmer._id,
        'Farmer',
        'Escrow Payout Released 💸',
        `Crop delivery confirmed! ₹${farmerPayout.toLocaleString('en-IN')} has been released from escrow directly to your account.`
      );

      createNotification(
        tx.trader._id,
        'Trader',
        'Delivery Confirmed & Disbursed',
        `Delivery of ${tx.cropListing?.name || 'crop lot'} confirmed. ₹${farmerPayout.toLocaleString('en-IN')} escrow has been disbursed to ${tx.farmer?.name || 'farmer'}.`
      );
    }

    res.status(200).json({
      message: `Delivery confirmed! ₹${farmerPayout.toLocaleString('en-IN')} released from escrow to farmer${traderRefund > 0 ? `, and ₹${traderRefund.toLocaleString('en-IN')} refunded to buyer.` : '.'}`,
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

    if (tx.logisticsStatus === 'disputed') {
      return res.status(400).json({ message: 'A dispute has already been filed for this transaction and is under review.' });
    }

    if (tx.logisticsStatus === 'delivered' || tx.paymentStatus === 'payout_released' || tx.paymentStatus === 'refunded') {
      return res.status(400).json({ message: 'Cannot dispute an order that has already been completed, disbursed, or refunded.' });
    }

    // Check if Dispute record already exists
    const existingDispute = await Dispute.findOne({ transaction: tx._id });
    if (existingDispute) {
      return res.status(400).json({ message: 'Dispute already exists for this transaction' });
    }

    // Extract photos from multipart upload or body
    let proofPhotos = [];
    if (req.files && req.files.length > 0) {
      proofPhotos = req.files.map(f => (f.path && f.path.startsWith('http')) ? f.path : `/uploads/${f.filename}`);
    } else if (req.file) {
      const p = (req.file.path && req.file.path.startsWith('http')) ? req.file.path : `/uploads/${req.file.filename}`;
      proofPhotos = [p];
    } else if (req.body.proofPhotos) {
      const raw = Array.isArray(req.body.proofPhotos) ? req.body.proofPhotos : [req.body.proofPhotos];
      proofPhotos = raw.filter(p => typeof p === 'string' && !p.startsWith('data:image'));
    }

    const reason = req.body.reason || req.body.description || req.body.disputeReason || 'Quality discrepancy / delivery issue reported by buyer';

    const dispute = await Dispute.create({
      transaction: tx._id,
      trader: tx.trader._id,
      farmer: tx.farmer._id,
      cropListing: tx.cropListing?._id,
      bid: tx.bid,
      reason,
      proofPhotos,
      escrowAmount: tx.amount,
      status: 'under_review'
    });

    tx.logisticsStatus = 'disputed';
    await tx.save();

    if (tx.bid) {
      await Bid.findByIdAndUpdate(tx.bid, { status: 'disputed' });
    }

    const otherParty = tx.farmer._id.toString() === req.user.id ? tx.trader._id : tx.farmer._id;
    const otherPartyRole = tx.farmer._id.toString() === req.user.id ? 'Trader' : 'Farmer';

    createNotification(
      otherParty,
      otherPartyRole,
      'Dispute Raised — Under Review',
      `Buyer ${tx.trader?.name || ''} has raised an APMC dispute for order #${String(tx._id).slice(-6).toUpperCase()} (${tx.cropListing?.name || 'crop lot'}). Escrow of ₹${tx.amount.toLocaleString('en-IN')} is locked under arbitration.`
    );

    res.status(201).json({ 
      message: 'Dispute filed successfully with photo evidence. Escrow funds remain frozen.', 
      dispute, 
      transaction: tx 
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  recordManualTransaction,
  getMyTransactions,
  getTransactionById,
  updateLogisticsStatus,
  submitVehicleDetails,
  dispatchLot,
  confirmDelivery,
  disputeTransaction
};
