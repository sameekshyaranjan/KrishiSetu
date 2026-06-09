const OTP = require('../models/OTP');
const generateOTP = require('../utils/generateOTP');

// @desc    Send OTP to a farmer's mobile number
// @route   POST /api/auth/send-otp
// @access  Public
const sendFarmerOTP = async (req, res, next) => {
  try {
    const { mobile } = req.body;

    // Validate mobile number
    if (!mobile || !/^\d{10}$/.test(mobile)) {
      return res.status(400).json({ message: 'Please provide a valid 10-digit mobile number' });
    }

    // Generate the 6-digit OTP
    const otp = generateOTP();

    // In a real application, we would send this OTP via SMS using Twilio here.
    // For now, we just log it to the console.
    console.log(`[DEV ONLY] Sending OTP ${otp} to ${mobile}`);

    // Save the OTP to the database (it will expire in 5 minutes due to TTL index)
    await OTP.create({ mobile, otp });

    res.status(200).json({ message: 'OTP sent successfully', mobile });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendFarmerOTP,
};
