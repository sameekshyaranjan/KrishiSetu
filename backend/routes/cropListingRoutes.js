const express = require('express');
const router = express.Router();
const {
  createCropListing,
  getMyListings,
  getAllListings,
  getListingById,
  updateCropListing,
  deleteCropListing
} = require('../controllers/cropListingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/my/listings', authorize('farmer'), getMyListings);
router.get('/', authorize('trader', 'admin'), getAllListings);
router.get('/:id', authorize('farmer', 'trader', 'admin'), getListingById);
router.post('/', authorize('farmer'), createCropListing);
router.put('/:id', authorize('farmer'), updateCropListing);
router.delete('/:id', authorize('farmer'), deleteCropListing);

module.exports = router;
