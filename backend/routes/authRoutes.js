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
const validate = require('../middleware/validate');
const { sendOTPValidator, verifyOTPValidator } = require('../middleware/validators/authValidators');

// Farmer auth
router.post('/send-otp', otpLimiter, sendOTPValidator, validate, sendFarmerOTP);
router.post('/verify-otp', verifyOTPValidator, validate, verifyFarmerOTP);

// Trader auth
router.post('/trader/send-otp', otpLimiter, sendOTPValidator, validate, sendTraderOTP);
router.post('/trader/verify-otp', verifyOTPValidator, validate, verifyTraderOTP);

// Admin auth
router.post('/admin/login', adminLogin);

// Token management
router.post('/refresh-token', refreshToken);

module.exports = router;


