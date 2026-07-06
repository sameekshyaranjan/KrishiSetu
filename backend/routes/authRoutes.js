const express = require('express');
const router = express.Router();
const {
  registerFarmer,
  registerTrader,
  verifyRegistrationOTP,
  loginWithPassword,
  sendLoginOTP,
  verifyLoginOTP,
  forgotPassword,
  resetPassword,
  adminLogin,
  refreshToken,
  logout,
} = require('../controllers/authController');
const { otpLimiter, adminLoginLimiter } = require('../middleware/rateLimiter');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { 
  registerFarmerValidator,
  registerTraderValidator, 
  verifyOTPValidator, 
  loginValidator, 
  emailOnlyValidator, 
  resetPasswordValidator 
} = require('../middleware/validators/authValidators');

// Registration Flow
router.post('/register/farmer', otpLimiter, registerFarmerValidator, validate, registerFarmer);
router.post('/register/trader', otpLimiter, registerTraderValidator, validate, registerTrader);
router.post('/register/verify', verifyOTPValidator, validate, verifyRegistrationOTP);

// Login Flows
router.post('/login', loginValidator, validate, loginWithPassword);
router.post('/login/otp', otpLimiter, emailOnlyValidator, validate, sendLoginOTP);
router.post('/login/otp/verify', verifyOTPValidator, validate, verifyLoginOTP);

// Password Reset Flows
router.post('/password/forgot', otpLimiter, emailOnlyValidator, validate, forgotPassword);
router.post('/password/reset', resetPasswordValidator, validate, resetPassword);

// Admin auth
router.post('/admin/login', adminLoginLimiter, adminLogin);

// Token management
router.post('/refresh-token', refreshToken);
router.post('/logout', protect, logout);

module.exports = router;
