const express = require('express');
const router = express.Router();
const { sendFarmerOTP, verifyFarmerOTP } = require('../controllers/authController');

// @route   POST /api/auth/send-otp
// @desc    Send OTP to a farmer's mobile number
router.post('/send-otp', sendFarmerOTP);

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and log farmer in
router.post('/verify-otp', verifyFarmerOTP);

module.exports = router;

