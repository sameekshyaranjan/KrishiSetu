const express = require('express');
const router = express.Router();
const { getPrices, getPricesByCommodity } = require('../controllers/priceController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getPrices);
router.get('/:commodity', getPricesByCommodity);

module.exports = router;
