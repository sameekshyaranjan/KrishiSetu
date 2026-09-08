const express = require('express');
const router = express.Router();
const { getAllStorage, getNearbyStorage } = require('../controllers/storageController');
const { protect } = require('../middleware/authMiddleware');

// Public discovery endpoints: anyone (farmers, traders, guests) can view cold storages
router.get('/', getAllStorage);
router.get('/nearby', getNearbyStorage);

module.exports = router;
