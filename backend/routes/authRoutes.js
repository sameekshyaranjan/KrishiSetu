const express = require('express');
const router = express.Router();
const {
  registerUser,
  verifyRegistrationOTP,
  loginWithPassword,
  sendLoginOTP,
  verifyLoginOTP,
  forgotPassword,
  resetPassword,
  adminLogin,
  refreshToken,
} = require('../controllers/authController');
const { otpLimiter } = require('../middleware/rateLimiter');
const validate = require('../middleware/validate');
const { 
  registerValidator, 
  verifyOTPValidator, 
  loginValidator, 
  emailOnlyValidator, 
  resetPasswordValidator 
} = require('../middleware/validators/authValidators');

// Registration Flow
router.post('/register', otpLimiter, registerValidator, validate, registerUser);
router.post('/register/verify', verifyOTPValidator, validate, verifyRegistrationOTP);

// Login Flows
router.post('/login', loginValidator, validate, loginWithPassword);
router.post('/login/otp', otpLimiter, emailOnlyValidator, validate, sendLoginOTP);
router.post('/login/otp/verify', verifyOTPValidator, validate, verifyLoginOTP);

// Password Reset Flows
router.post('/password/forgot', otpLimiter, emailOnlyValidator, validate, forgotPassword);
router.post('/password/reset', resetPasswordValidator, validate, resetPassword);

// Admin auth
router.post('/admin/login', adminLogin);

// Token management
router.post('/refresh-token', refreshToken);

module.exports = router;
