const express = require('express');
const router = express.Router();
const {
  createRazorpayOrder,
  verifyRazorpayPayment,
  recordManualTransaction,
  getMyTransactions,
  getTransactionById
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/razorpay/order', createRazorpayOrder);
router.post('/razorpay/verify', verifyRazorpayPayment);
router.post('/manual', recordManualTransaction);
router.get('/my-transactions', getMyTransactions);
router.get('/:id', getTransactionById);

module.exports = router;
