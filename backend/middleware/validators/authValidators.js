const { body } = require('express-validator');

const sendOTPValidator = [
  body('mobile')
    .isString()
    .matches(/^\d{10}$/)
    .withMessage('Please provide a valid 10-digit mobile number')
];

const verifyOTPValidator = [
  body('mobile')
    .isString()
    .matches(/^\d{10}$/)
    .withMessage('Please provide a valid 10-digit mobile number'),
  body('otp')
    .isString()
    .isLength({ min: 6, max: 6 })
    .withMessage('Please provide a valid 6-digit OTP')
];

module.exports = { sendOTPValidator, verifyOTPValidator };
