const express = require('express');
const router = express.Router();
const {
  sendFarmerOTP,
  verifyFarmerOTP,
  sendTraderOTP,
  verifyTraderOTP,
  adminLogin,
  refreshToken,
} = require('../controllers/authController');
const { otpLimiter } = require('../middleware/rateLimiter');

// Farmer auth
router.post('/send-otp', otpLimiter, sendFarmerOTP);
router.post('/verify-otp', verifyFarmerOTP);

// Trader auth
router.post('/trader/send-otp', otpLimiter, sendTraderOTP);
router.post('/trader/verify-otp', verifyTraderOTP);

// Admin auth
router.post('/admin/login', adminLogin);

// Token management
router.post('/refresh-token', refreshToken);

module.exports = router;


