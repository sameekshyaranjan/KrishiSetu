const express = require('express');
const router = express.Router();
const { getAllStorage, getNearbyStorage } = require('../controllers/storageController');
const { protect } = require('../middleware/authMiddleware');

// We protect these routes so only registered users can query cold storage
router.use(protect);

router.get('/', getAllStorage);
router.get('/nearby', getNearbyStorage);

module.exports = router;
