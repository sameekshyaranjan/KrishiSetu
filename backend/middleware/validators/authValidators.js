const { body } = require('express-validator');

const validateMobileOrPhone = (value, { req }) => {
  const number = value || req.body.phone || req.body.mobile;
  if (!number || !/^\d{10}$/.test(String(number).trim())) {
    throw new Error('Valid 10-digit mobile number is required');
  }
  req.body.mobile = String(number).trim();
  return true;
};

const registerFarmerValidator = [
  body('name').isString().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('mobile').custom(validateMobileOrPhone),
  body('password').isString().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('state').optional().isString(),
  body('district').optional().isString()
];

const registerTraderValidator = [
  body('name').isString().notEmpty().withMessage('Name is required'),
  body('companyName').optional().isString(),
  body('email').isEmail().withMessage('Valid email is required'),
  body('mobile').custom(validateMobileOrPhone),
  body('password').isString().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('state').optional().isString(),
  body('district').optional().isString()
];

const verifyOTPValidator = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('otp').isString().isLength({ min: 6, max: 6 }).withMessage('Valid 6-digit OTP is required')
];

const loginValidator = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isString().notEmpty().withMessage('Password is required')
];

const emailOnlyValidator = [
  body('email').isEmail().withMessage('Valid email is required')
];

const resetPasswordValidator = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('otp').isString().isLength({ min: 6, max: 6 }).withMessage('Valid 6-digit OTP is required'),
  body('newPassword').isString().isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
];

module.exports = {
  registerFarmerValidator,
  registerTraderValidator,
  verifyOTPValidator,
  loginValidator,
  emailOnlyValidator,
  resetPasswordValidator
};
