const Crop = require('../models/Crop');
const Farmer = require('../models/Farmer');
const { generateLotSheet } = require('../utils/generateLotSheet');
const { paginate } = require('../utils/paginate');
const redisClient = require('../config/redis');

const createCropListing = async (req, res, next) => {
  try {
    const farmer = await Farmer.findById(req.user.id);
    if (!farmer) {
      return res.status(404).json({ message: 'Farmer account not found' });
    }

    const { name, title, cropType, category, quantity, unit, basePrice, description, district, harvestStatus } = req.body;
    
    let images = [];
    if (req.body.images) {
      const rawImgs = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
      images = rawImgs.filter(img => typeof img === 'string' && !img.startsWith('data:image'));
    }
    
    if (req.files && req.files.length > 0) {
      const uploadedImages = req.files.map(file => file.path);
      images = [...images, ...uploadedImages];
    }

    const finalName = name || title || (cropType ? `${cropType} Lot` : 'Produce Lot');
    let finalCategory = (category || 'vegetables').toLowerCase().trim();
    if (!['vegetables', 'fruits', 'grains', 'spices', 'pulses', 'other'].includes(finalCategory)) {
      finalCategory = 'vegetables';
    }
    const finalQuantity = Number(quantity) || 50;
    
    let finalUnit = (unit || 'quintal').toLowerCase().trim();
    if (finalUnit === 'quintals') finalUnit = 'quintal';
    if (finalUnit === 'tonnes' || finalUnit === 'tons' || finalUnit === 'ton') finalUnit = 'tonne';
    if (finalUnit === 'kgs' || finalUnit === 'kilogram' || finalUnit === 'kilograms') finalUnit = 'kg';
    if (!['kg', 'quintal', 'tonne'].includes(finalUnit)) finalUnit = 'quintal';

    const finalBasePrice = Number(basePrice) || 2000;
    const finalDistrict = district || farmer.district || 'Hassan';

    const crop = await Crop.create({
      farmer: req.user.id,
      name: finalName,
      category: finalCategory,
      quantity: finalQuantity,
      unit: finalUnit,
      basePrice: finalBasePrice,
      district: finalDistrict,
      description: description || `Freshly harvested ${finalName} lot from farm gate.`,
      images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop'],
      harvestStatus: harvestStatus || 'post-harvest'
    });

    await redisClient.incr('crops_feed_version');

    res.status(201).json(crop);
  } catch (error) {
    next(error);
  }
};

const getMyListings = async (req, res, next) => {
  try {
    const listings = await Crop.find({ farmer: req.user.id }).sort({ createdAt: -1 });
    const Bid = require('../models/Bid');

    const listingsWithBids = await Promise.all(
      listings.map(async (cropDoc) => {
        const cropObj = cropDoc.toObject();
        const activeBids = await Bid.find({
          crop: cropObj._id,
          status: { $in: ['pending', 'countered', 'accepted'] }
        }).sort({ amount: -1 });

        cropObj.bidsCount = activeBids.length;
        cropObj.currentHighestBid = activeBids.length > 0 ? Math.max(...activeBids.map(b => Number(b.amount) || 0)) : null;
        return cropObj;
      })
    );

    res.status(200).json(listingsWithBids);
  } catch (error) {
    next(error);
  }
};

const getAllListings = async (req, res, next) => {
  try {
    let version = await redisClient.get('crops_feed_version');
    if (!version) {
      version = String(Date.now());
      await redisClient.set('crops_feed_version', version);
    }
    const userScope = req.user?.id ? req.user.id : 'public';
    const cacheKey = `crops:feed:v${version}:${userScope}:${req.query.category || 'all'}:${req.query.name || 'none'}:${req.query.page || 1}:${req.query.limit || 10}`;

    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        source: 'redis',
        data: JSON.parse(cachedData)
      });
    }

    const filter = { status: 'available' };

    if (req.query.category) filter.category = req.query.category;
    if (req.query.name) filter.name = { $regex: req.query.name, $options: 'i' };

    const result = await paginate(
      Crop,
      filter,
      req.query.page,
      req.query.limit,
      { path: 'farmer', select: 'name village district state mobile' }
    );

    const Bid = require('../models/Bid');
    const cropsWithBids = await Promise.all(
      (result.data || []).map(async (cropDoc) => {
        const cropObj = cropDoc.toObject ? cropDoc.toObject() : cropDoc;
        const activeBids = await Bid.find({
          crop: cropObj._id,
          status: { $in: ['pending', 'countered', 'accepted'] }
        }).sort({ amount: -1 });

        cropObj.bidsCount = activeBids.length;
        cropObj.currentHighestBid = activeBids.length > 0 ? Math.max(...activeBids.map(b => Number(b.amount) || 0)) : null;

        if (req.user && req.user.role === 'trader') {
          const myActiveBid = activeBids.find(b => b.trader && b.trader.toString() === req.user.id.toString());
          cropObj.myBid = myActiveBid ? {
            _id: myActiveBid._id,
            amount: myActiveBid.amount,
            status: myActiveBid.status
          } : null;
        } else {
          cropObj.myBid = null;
        }

        return cropObj;
      })
    );

    result.data = cropsWithBids;

    // Cache with short TTL to ensure live market freshness while providing fast loads
    await redisClient.setex(cacheKey, 30, JSON.stringify(result));

    res.status(200).json({
      source: 'mongodb',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const getListingById = async (req, res, next) => {
  try {
    const listing = await Crop.findById(req.params.id)
      .populate('farmer', 'name village district state mobile');

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    const Bid = require('../models/Bid');
    const activeBids = await Bid.find({
      crop: listing._id,
      status: { $in: ['pending', 'countered', 'accepted'] }
    }).sort({ amount: -1 });

    const listingObj = listing.toObject();
    listingObj.bidsCount = activeBids.length;
    listingObj.currentHighestBid = activeBids.length > 0 ? Math.max(...activeBids.map(b => Number(b.amount) || 0)) : null;

    if (req.user && req.user.role === 'trader') {
      const myActiveBid = activeBids.find(b => b.trader && b.trader.toString() === req.user.id.toString());
      listingObj.myBid = myActiveBid ? {
        _id: myActiveBid._id,
        amount: myActiveBid.amount,
        status: myActiveBid.status
      } : null;
    } else {
      listingObj.myBid = null;
    }

    res.status(200).json(listingObj);
  } catch (error) {
    next(error);
  }
};

const updateCropListing = async (req, res, next) => {
  try {
    const listing = await Crop.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.farmer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to update this listing' });
    }

    const { name, category, quantity, unit, basePrice, description, images } = req.body;

    listing.name = name || listing.name;
    listing.category = category || listing.category;
    listing.quantity = quantity || listing.quantity;
    listing.unit = unit || listing.unit;
    listing.basePrice = basePrice || listing.basePrice;
    listing.description = description || listing.description;
    let updatedImages = listing.images || [];
    if (images) {
      const rawImgs = Array.isArray(images) ? images : [images];
      updatedImages = rawImgs.filter(img => typeof img === 'string' && !img.startsWith('data:image'));
    }
    if (req.files && req.files.length > 0) {
      const uploadedImages = req.files.map(file => file.path);
      updatedImages = [...updatedImages, ...uploadedImages];
    }
    if (updatedImages.length > 0) {
      listing.images = updatedImages;
    }

    const updatedListing = await listing.save();

    await redisClient.incr('crops_feed_version');

    res.status(200).json(updatedListing);
  } catch (error) {
    next(error);
  }
};

const deleteCropListing = async (req, res, next) => {
  try {
    const listing = await Crop.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.farmer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to delete this listing' });
    }

    listing.status = 'withdrawn';
    await listing.save();

    const Bid = require('../models/Bid');
    const Transaction = require('../models/Transaction');
    const Wallet = require('../models/Wallet');
    const WalletLedger = require('../models/WalletLedger');
    const { createNotification } = require('../utils/createNotification');

    // 1. Find all active bids for this crop
    const activeBids = await Bid.find({
      crop: listing._id,
      status: { $in: ['pending', 'countered', 'accepted'] }
    });

    // 2. Identify all transactions with locked escrow for this crop
    const escrowTransactions = await Transaction.find({
      cropListing: listing._id,
      paymentStatus: 'held_in_escrow'
    });

    // 3. Atomically unlock escrow capital and return to Trader Available Bidding Liquid
    for (const tx of escrowTransactions) {
      const traderWallet = await Wallet.findOne({ trader: tx.trader });
      if (traderWallet) {
        const releaseAmount = Number(tx.amount) || 0;
        if (releaseAmount > 0) {
          const lockedDeduction = Math.min(traderWallet.lockedBalance, releaseAmount);
          traderWallet.lockedBalance = Math.max(0, traderWallet.lockedBalance - lockedDeduction);
          traderWallet.availableBalance = (traderWallet.availableBalance || 0) + releaseAmount;
          traderWallet.updatedAt = Date.now();
          await traderWallet.save();

          await WalletLedger.create({
            trader: tx.trader,
            wallet: traderWallet._id,
            type: 'REFUND',
            amount: releaseAmount,
            balanceAfter: traderWallet.availableBalance,
            status: 'completed',
            source: 'DEVELOPMENT_SANDBOX',
            paymentMethod: 'Escrow Vault Unlock',
            description: `Escrow unlocked: Crop lot "${listing.name}" withdrawn by farmer`,
            referenceId: String(tx._id)
          });
        }
      }

      tx.paymentStatus = 'refunded';
      tx.logisticsStatus = 'cancelled';
      await tx.save();
    }

    // 4. Update all active/pending/accepted bids to 'withdrawn_by_farmer'
    if (activeBids.length > 0) {
      await Bid.updateMany(
        { crop: listing._id, status: { $in: ['pending', 'countered', 'accepted'] } },
        { status: 'withdrawn_by_farmer' }
      );

      // Track notified traders to avoid duplicates
      const notifiedTraders = new Set();
      for (const bid of activeBids) {
        const traderIdStr = bid.trader?.toString();
        if (traderIdStr && !notifiedTraders.has(traderIdStr)) {
          notifiedTraders.add(traderIdStr);
          createNotification(
            bid.trader,
            'Trader',
            'Crop Withdrawn by Farmer',
            `The farmer has withdrawn the crop listing for "${listing.name}". Your bid has been marked as withdrawn and any locked escrow funds have been returned to your Available Bidding Liquid.`
          );
        }
      }
    }

    await redisClient.incr('crops_feed_version');

    res.status(200).json({ 
      message: 'Crop listing withdrawn successfully. Escrow funds unlocked and bids marked as withdrawn.',
      crop: listing 
    });
  } catch (error) {
    next(error);
  }
};

const getLotSheet = async (req, res, next) => {
  try {
    const listing = await Crop.findById(req.params.id).populate('farmer');

    if (!listing) {
      return res.status(404).json({ message: 'Crop listing not found' });
    }

    if (!listing.farmer) {
      return res.status(404).json({ message: 'Farmer details not found for this listing' });
    }

    const lotSheet = generateLotSheet(listing, listing.farmer);

    res.status(200).json(lotSheet);
  } catch (error) {
    next(error);
  }
};

module.exports = { createCropListing, getMyListings, getAllListings, getListingById, updateCropListing, deleteCropListing, getLotSheet };
