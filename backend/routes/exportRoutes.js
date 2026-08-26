const express = require('express');
const { exportMyTransactionsCSV } = require('../controllers/exportController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/transactions', protect, exportMyTransactionsCSV);

module.exports = router;
