const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis');
const Farmer = require('../models/Farmer');
const Trader = require('../models/Trader');
const Admin = require('../models/Admin');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const findUserByEmail = async (email) => {
  let user = await Farmer.findOne({ email }).select('+password');
  if (user) return { user, role: 'farmer' };
  
  user = await Trader.findOne({ email }).select('+password');
  if (user) return { user, role: 'trader' };
  
  return { user: null, role: null };
};

exports.registerFarmer = async (req, res, next) => {
  try {
    const { email, phone, mobile, ...userData } = req.body;
    const lowerEmail = email.toLowerCase().trim();
    const cleanMobile = String(mobile || phone || '').trim();
    
    const { user: existingUser } = await findUserByEmail(lowerEmail);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered. Please log in or use another email.' });
    }

    const existingPhone = await Farmer.findOne({ mobile: cleanMobile });
    if (existingPhone) {
      return res.status(400).json({ message: 'Mobile number already registered. Please log in or use another number.' });
    }

    const otp = generateOTP();
    await redisClient.set(`rl:register:otp:${lowerEmail}`, otp, 'EX', 300);
    await redisClient.set(
      `rl:register:data:${lowerEmail}`,
      JSON.stringify({ role: 'farmer', email: lowerEmail, mobile: cleanMobile, ...userData }),
      'EX',
      300
    );

    console.log(`[AUTH] Sending Farmer Registration OTP to: ${lowerEmail}`);

    await sendEmail({
      email: lowerEmail,
      subject: '🌾 KrishiSetu Registration OTP — Email Verification',
      message: `Your OTP for KrishiSetu farmer registration is: ${otp}. It will expire in 5 minutes.`,
      otp,
      role: 'farmer',
      name: userData.name || 'Farmer'
    });

    res.status(200).json({ message: 'OTP sent to email for verification' });
  } catch (error) {
    next(error);
  }
};

exports.registerTrader = async (req, res, next) => {
  try {
    const { email, companyName, phone, mobile, ...userData } = req.body;
    const lowerEmail = email.toLowerCase().trim();
    const cleanMobile = String(mobile || phone || '').trim();
    
    const { user: existingUser } = await findUserByEmail(lowerEmail);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered. Please log in or use another email.' });
    }

    const existingPhone = await Trader.findOne({ mobile: cleanMobile });
    if (existingPhone) {
      return res.status(400).json({ message: 'Mobile number already registered. Please log in or use another number.' });
    }

    const otp = generateOTP();
    await redisClient.set(`rl:register:otp:${lowerEmail}`, otp, 'EX', 300);
    await redisClient.set(
      `rl:register:data:${lowerEmail}`,
      JSON.stringify({ role: 'trader', email: lowerEmail, companyName, mobile: cleanMobile, ...userData }),
      'EX',
      300
    );

    console.log(`[AUTH] Sending Trader Registration OTP to: ${lowerEmail}`);

    await sendEmail({
      email: lowerEmail,
      subject: '🌾 KrishiSetu Trader Registration OTP — Email Verification',
      message: `Your OTP for KrishiSetu trader registration is: ${otp}. It will expire in 5 minutes.`,
      otp,
      role: 'trader',
      name: userData.name || companyName || 'Trader'
    });

    res.status(200).json({ message: 'OTP sent to email for verification' });
  } catch (error) {
    next(error);
  }
};

exports.verifyRegistrationOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const lowerEmail = email.toLowerCase().trim();
    const cleanOtp = String(otp || '').trim();

    const storedOtp = await redisClient.get(`rl:register:otp:${lowerEmail}`);
    if (!storedOtp || storedOtp !== cleanOtp) {
      return res.status(400).json({ message: 'Invalid or expired OTP. Please request a new code.' });
    }

    const userDataStr = await redisClient.get(`rl:register:data:${lowerEmail}`);
    if (!userDataStr) {
      return res.status(400).json({ message: 'Registration session expired. Please register again.' });
    }
    const { role, ...userData } = JSON.parse(userDataStr);

    let newUser;
    if (role === 'farmer') newUser = await Farmer.create(userData);
    else if (role === 'trader') newUser = await Trader.create(userData);

    await redisClient.del(`rl:register:otp:${lowerEmail}`);
    await redisClient.del(`rl:register:data:${lowerEmail}`);

    const payload = { id: newUser._id, role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const userObject = newUser.toObject();
    delete userObject.password;
    userObject.role = role;

    res.status(201).json({ user: userObject, accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
};

exports.loginWithPassword = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const lowerEmail = email.toLowerCase().trim();

    const { user, role } = await findUserByEmail(lowerEmail);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const payload = { id: user._id, role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const userObject = user.toObject();
    delete userObject.password;
    userObject.role = role;

    res.status(200).json({ user: userObject, accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
};

exports.sendLoginOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    const lowerEmail = email.toLowerCase().trim();

    const { user, role } = await findUserByEmail(lowerEmail);
    if (!user) {
      return res.status(404).json({ message: 'No registered account found with this email' });
    }

    const otp = generateOTP();
    await redisClient.set(`rl:login:otp:${lowerEmail}`, otp, 'EX', 300);

    console.log(`[AUTH] Sending Login OTP to: ${lowerEmail}`);

    await sendEmail({
      email: lowerEmail,
      subject: '🌾 KrishiSetu Login OTP — Verification Code',
      message: `Your OTP for KrishiSetu login is: ${otp}. It will expire in 5 minutes.`,
      otp,
      role: role || 'User',
      name: user.name || 'User'
    });

    res.status(200).json({ message: 'Login OTP sent to email' });
  } catch (error) {
    next(error);
  }
};

exports.verifyLoginOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const lowerEmail = email.toLowerCase().trim();
    const cleanOtp = String(otp || '').trim();

    const storedOtp = await redisClient.get(`rl:login:otp:${lowerEmail}`);
    if (!storedOtp || storedOtp !== cleanOtp) {
      return res.status(400).json({ message: 'Invalid or expired OTP code' });
    }

    const { user, role } = await findUserByEmail(lowerEmail);
    await redisClient.del(`rl:login:otp:${lowerEmail}`);

    const payload = { id: user._id, role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const userObject = user.toObject();
    delete userObject.password;
    userObject.role = role;

    res.status(200).json({ user: userObject, accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const lowerEmail = email.toLowerCase().trim();

    const { user, role } = await findUserByEmail(lowerEmail);
    if (!user) {
      return res.status(404).json({ message: 'No registered account found with this email' });
    }

    const otp = generateOTP();
    await redisClient.set(`rl:reset:otp:${lowerEmail}`, otp, 'EX', 300);

    await sendEmail({
      email: lowerEmail,
      subject: '🌾 KrishiSetu Password Reset OTP',
      message: `Your OTP to reset your KrishiSetu password is: ${otp}. It will expire in 5 minutes.`,
      otp,
      role: role || 'User',
      name: user.name || 'User'
    });

    res.status(200).json({ message: 'Password reset OTP sent to email' });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    const lowerEmail = email.toLowerCase().trim();
    const cleanOtp = String(otp || '').trim();

    const storedOtp = await redisClient.get(`rl:reset:otp:${lowerEmail}`);
    if (!storedOtp || storedOtp !== cleanOtp) {
      return res.status(400).json({ message: 'Invalid or expired reset OTP code' });
    }

    const { user } = await findUserByEmail(lowerEmail);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = newPassword;
    await user.save();
    await redisClient.del(`rl:reset:otp:${lowerEmail}`);

    res.status(200).json({ message: 'Password reset successful. Please log in with your new password.' });
  } catch (error) {
    next(error);
  }
};

exports.adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const lowerEmail = email.toLowerCase().trim();

    const admin = await Admin.findOne({ email: lowerEmail }).select('+password');
    if (!admin) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    const payload = { id: admin._id, role: 'admin' };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const userObject = admin.toObject();
    delete userObject.password;
    userObject.role = 'admin';

    res.status(200).json({ user: userObject, accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid or expired refresh token' });
      }

      const payload = { id: decoded.id, role: decoded.role };
      const newAccessToken = generateAccessToken(payload);
      res.status(200).json({ accessToken: newAccessToken });
    });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res) => {
  res.status(200).json({ message: 'Logged out successfully' });
};
