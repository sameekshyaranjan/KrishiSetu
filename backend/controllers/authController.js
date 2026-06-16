const OTP = require('../models/OTP');
const Farmer = require('../models/Farmer');
const Trader = require('../models/Trader');
const generateOTP = require('../utils/generateOTP');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');

const sendFarmerOTP = async (req, res, next) => {
  try {
    const { mobile } = req.body;

    if (!mobile || !/^\d{10}$/.test(mobile)) {
      return res.status(400).json({ message: 'Please provide a valid 10-digit mobile number' });
    }

    const otp = generateOTP();
    console.log(`[DEV] OTP ${otp} → ${mobile}`);

    await OTP.create({ mobile, otp });
    res.status(200).json({ message: 'OTP sent successfully', mobile });
  } catch (error) {
    next(error);
  }
};

const verifyFarmerOTP = async (req, res, next) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      return res.status(400).json({ message: 'Mobile number and OTP are required' });
    }

    const otpRecord = await OTP.findOne({ mobile }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ message: 'OTP expired or not found. Please request a new one.' });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }

    await OTP.deleteMany({ mobile });

    let farmer = await Farmer.findOne({ mobile });
    let isNewUser = false;

    if (!farmer) {
      farmer = await Farmer.create({ name: mobile, mobile });
      isNewUser = true;
    }

    const payload = { id: farmer._id, role: 'farmer' };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.status(200).json({ accessToken, refreshToken, farmer, isNewUser });
  } catch (error) {
    next(error);
  }
};

const sendTraderOTP = async (req, res, next) => {
  try {
    const { mobile } = req.body;

    if (!mobile || !/^\d{10}$/.test(mobile)) {
      return res.status(400).json({ message: 'Please provide a valid 10-digit mobile number' });
    }

    const otp = generateOTP();
    console.log(`[DEV] OTP ${otp} → trader ${mobile}`);

    await OTP.create({ mobile, otp });
    res.status(200).json({ message: 'OTP sent successfully', mobile });
  } catch (error) {
    next(error);
  }
};

const verifyTraderOTP = async (req, res, next) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      return res.status(400).json({ message: 'Mobile number and OTP are required' });
    }

    const otpRecord = await OTP.findOne({ mobile }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ message: 'OTP expired or not found. Please request a new one.' });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }

    await OTP.deleteMany({ mobile });

    let trader = await Trader.findOne({ mobile });
    let isNewUser = false;

    if (!trader) {
      trader = await Trader.create({ name: mobile, mobile });
      isNewUser = true;
    }

    const payload = { id: trader._id, role: 'trader' };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.status(200).json({ accessToken, refreshToken, trader, isNewUser });
  } catch (error) {
    next(error);
  }
};

module.exports = { sendFarmerOTP, verifyFarmerOTP, sendTraderOTP, verifyTraderOTP };
