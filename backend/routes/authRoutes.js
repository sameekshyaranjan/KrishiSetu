const express = require('express');
const router = express.Router();
const { sendFarmerOTP } = require('../controllers/authController');

// @route   POST /api/auth/send-otp
// @desc    Send OTP to a farmer's mobile number
router.post('/send-otp', sendFarmerOTP);

module.exports = router;
