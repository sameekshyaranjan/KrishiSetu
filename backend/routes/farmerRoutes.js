const express = require('express');
const router = express.Router();
const { getFarmerProfile, updateFarmerProfile, registerFarmerByAdmin } = require('../controllers/farmerController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All farmer routes require the user to be logged in
router.use(protect);

// Admin-only route for registering farmers manually
router.post('/register', authorize('admin'), registerFarmerByAdmin);

// From here on, all routes require the 'farmer' role
router.use(authorize('farmer'));

router.route('/profile')
  .get(getFarmerProfile)
  .put(updateFarmerProfile);

module.exports = router;
