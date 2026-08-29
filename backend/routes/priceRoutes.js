const express = require('express');
const router = express.Router();
const { getPrices, getPricesByCommodity, getPriceTrend, syncPrices } = require('../controllers/priceController');
const { protect } = require('../middleware/authMiddleware');

// Price synchronization endpoint (Triggerable by Admin or authenticated users)
router.post('/sync', protect, syncPrices);

// Public / Authenticated read endpoints
router.get('/', getPrices);
router.get('/trend', getPriceTrend);
router.get('/:commodity', getPricesByCommodity);

module.exports = router;
