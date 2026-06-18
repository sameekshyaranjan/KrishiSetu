const express = require('express');
const router = express.Router();
const { createCropListing } = require('../controllers/cropListingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('farmer'));

router.post('/', createCropListing);

module.exports = router;
