const OTP = require('../models/OTP');
const Farmer = require('../models/Farmer');
const generateOTP = require('../utils/generateOTP');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');

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

// @desc    Verify OTP and log the farmer in
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyFarmerOTP = async (req, res, next) => {
  try {
    const { mobile, otp } = req.body;

    // Validate inputs
    if (!mobile || !otp) {
      return res.status(400).json({ message: 'Mobile number and OTP are required' });
    }

    // Find the latest OTP for this mobile number (sorted by newest first)
    const otpRecord = await OTP.findOne({ mobile }).sort({ createdAt: -1 });

    // Check if OTP exists
    if (!otpRecord) {
      return res.status(400).json({ message: 'OTP expired or not found. Please request a new one.' });
    }

    // Check if the OTP matches
    if (otpRecord.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }

    // OTP is valid — delete it so it cannot be reused
    await OTP.deleteMany({ mobile });

    // Find existing farmer or create a new one
    let farmer = await Farmer.findOne({ mobile });
    let isNewUser = false;

    if (!farmer) {
      // First-time user — create a new farmer with mobile as temporary name
      farmer = await Farmer.create({ name: mobile, mobile });
      isNewUser = true;
    }

    // Generate JWT tokens
    const payload = { id: farmer._id, role: 'farmer' };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.status(200).json({
      accessToken,
      refreshToken,
      farmer,
      isNewUser,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendFarmerOTP,
  verifyFarmerOTP,
};
