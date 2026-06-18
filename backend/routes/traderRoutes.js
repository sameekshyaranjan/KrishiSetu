const express = require('express');
const router = express.Router();
const { getTraderProfile, updateTraderProfile } = require('../controllers/traderController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('trader'));

router.route('/profile')
  .get(getTraderProfile)
  .put(updateTraderProfile);

module.exports = router;
