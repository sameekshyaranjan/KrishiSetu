const express = require('express');
const router = express.Router();
const {
  createCropListing,
  getMyListings,
  getAllListings,
  getListingById,
  updateCropListing,
  deleteCropListing,
  getLotSheet
} = require('../controllers/cropListingController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router.get('/my/listings', authorize('farmer'), getMyListings);
router.get('/', authorize('trader', 'admin'), getAllListings);
router.get('/:id', authorize('farmer', 'trader', 'admin'), getListingById);
router.get('/:id/lot-sheet', authorize('farmer', 'trader', 'admin'), getLotSheet);
router.post('/', authorize('farmer'), upload.array('images', 5), createCropListing);
router.put('/:id', authorize('farmer'), updateCropListing);
router.delete('/:id', authorize('farmer'), deleteCropListing);

module.exports = router;
