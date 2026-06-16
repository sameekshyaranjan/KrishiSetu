const express = require('express');
const router = express.Router();
const {
  sendFarmerOTP,
  verifyFarmerOTP,
  sendTraderOTP,
  verifyTraderOTP,
} = require('../controllers/authController');

// Farmer auth
router.post('/send-otp', sendFarmerOTP);
router.post('/verify-otp', verifyFarmerOTP);

// Trader auth
router.post('/trader/send-otp', sendTraderOTP);
router.post('/trader/verify-otp', verifyTraderOTP);

module.exports = router;
