const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis');
const Farmer = require('../models/Farmer');
const Trader = require('../models/Trader');
const Admin = require('../models/Admin');
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

    await redisClient.set(`otp:${mobile}`, otp, 'EX', 300);
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

    const storedOtp = await redisClient.get(`otp:${mobile}`);

    if (!storedOtp) {
      return res.status(400).json({ message: 'OTP expired or not found. Please request a new one.' });
    }

    if (storedOtp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }

    await redisClient.del(`otp:${mobile}`);

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

    await redisClient.set(`otp:${mobile}`, otp, 'EX', 300);
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

    const storedOtp = await redisClient.get(`otp:${mobile}`);

    if (!storedOtp) {
      return res.status(400).json({ message: 'OTP expired or not found. Please request a new one.' });
    }

    if (storedOtp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }

    await redisClient.del(`otp:${mobile}`);

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

const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const payload = { id: admin._id, role: 'admin' };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.status(200).json({
      accessToken,
      refreshToken,
      admin: { _id: admin._id, name: admin.name, email: admin.email, role: admin.role },
    });
  } catch (error) {
    next(error);
  }
};



const refreshToken = async (req, res, next) => {
  try {
    const token = req.body.refreshToken;

    if (!token) {
      return res.status(401).json({ message: 'Refresh token is required' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      
      const payload = { id: decoded.id, role: decoded.role };
      const newAccessToken = generateAccessToken(payload);

      res.status(200).json({ accessToken: newAccessToken });
    } catch (error) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { sendFarmerOTP, verifyFarmerOTP, sendTraderOTP, verifyTraderOTP, adminLogin, refreshToken };
