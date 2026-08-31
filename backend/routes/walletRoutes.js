const express = require('express');
const router = express.Router();
const { getWalletOverview, topUpWallet } = require('../controllers/walletController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Protect all wallet routes for authenticated Traders
router.use(protect);
router.use(authorize('trader'));

router.get('/overview', getWalletOverview);
router.get('/my-wallet', getWalletOverview);
router.post('/topup', topUpWallet);

module.exports = router;
