const express = require('express');
const router = express.Router();
const { getFarmerProfile, updateFarmerProfile } = require('../controllers/farmerController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('farmer'));

router.route('/profile')
  .get(getFarmerProfile)
  .put(updateFarmerProfile);

module.exports = router;
