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
    const { email, ...userData } = req.body;
    const lowerEmail = email.toLowerCase();
    
    const { user: existingUser } = await findUserByEmail(lowerEmail);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const otp = generateOTP();
    await redisClient.set(`rl:register:otp:${lowerEmail}`, otp, 'EX', 300);
    await redisClient.set(`rl:register:data:${lowerEmail}`, JSON.stringify({ role: 'farmer', email: lowerEmail, ...userData }), 'EX', 300);

    await sendEmail({
      email: lowerEmail,
      subject: 'KrishiSetu Registration OTP',
      message: `Your OTP for KrishiSetu farmer registration is: ${otp}. It will expire in 5 minutes.`
    });

    res.status(200).json({ message: 'OTP sent to email for verification' });
  } catch (error) {
    next(error);
  }
};

exports.registerTrader = async (req, res, next) => {
  try {
    const { email, companyName, ...userData } = req.body;
    const lowerEmail = email.toLowerCase();
    
    const { user: existingUser } = await findUserByEmail(lowerEmail);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const otp = generateOTP();
    await redisClient.set(`rl:register:otp:${lowerEmail}`, otp, 'EX', 300);
    await redisClient.set(`rl:register:data:${lowerEmail}`, JSON.stringify({ role: 'trader', email: lowerEmail, companyName, ...userData }), 'EX', 300);

    await sendEmail({
      email: lowerEmail,
      subject: 'KrishiSetu Registration OTP',
      message: `Your OTP for KrishiSetu trader registration is: ${otp}. It will expire in 5 minutes.`
    });

    res.status(200).json({ message: 'OTP sent to email for verification' });
  } catch (error) {
    next(error);
  }
};

exports.verifyRegistrationOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const lowerEmail = email.toLowerCase();

    const storedOtp = await redisClient.get(`rl:register:otp:${lowerEmail}`);
    if (!storedOtp || storedOtp !== otp) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
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

    res.status(201).json({ user: newUser, accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
};

exports.loginWithPassword = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const lowerEmail = email.toLowerCase();

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

    // Don't send password hash back
    const userObject = user.toObject();
    delete userObject.password;

    res.status(200).json({ user: userObject, accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
};

exports.sendLoginOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    const lowerEmail = email.toLowerCase();

    const { user } = await findUserByEmail(lowerEmail);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = generateOTP();
    await redisClient.set(`rl:login:otp:${lowerEmail}`, otp, 'EX', 300);

    await sendEmail({
      email: lowerEmail,
      subject: 'KrishiSetu Login OTP',
      message: `Your OTP for KrishiSetu login is: ${otp}. It will expire in 5 minutes.`
    });

    res.status(200).json({ message: 'Login OTP sent to email' });
  } catch (error) {
    next(error);
  }
};

exports.verifyLoginOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const lowerEmail = email.toLowerCase();

    const storedOtp = await redisClient.get(`rl:login:otp:${lowerEmail}`);
    if (!storedOtp || storedOtp !== otp) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const { user, role } = await findUserByEmail(lowerEmail);
    await redisClient.del(`rl:login:otp:${lowerEmail}`);

    const payload = { id: user._id, role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.status(200).json({ user, accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const lowerEmail = email.toLowerCase();

    const { user } = await findUserByEmail(lowerEmail);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = generateOTP();
    await redisClient.set(`rl:reset:otp:${lowerEmail}`, otp, 'EX', 300);

    await sendEmail({
      email: lowerEmail,
      subject: 'KrishiSetu Password Reset OTP',
      message: `Your OTP to reset your KrishiSetu password is: ${otp}. It will expire in 5 minutes.`
    });

    res.status(200).json({ message: 'Password reset OTP sent to email' });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    const lowerEmail = email.toLowerCase();

    const storedOtp = await redisClient.get(`rl:reset:otp:${lowerEmail}`);
    if (!storedOtp || storedOtp !== otp) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const { user } = await findUserByEmail(lowerEmail);
    
    user.password = newPassword;
    await user.save();
    await redisClient.del(`rl:reset:otp:${lowerEmail}`);

    res.status(200).json({ message: 'Password reset successfully. You can now login.' });
  } catch (error) {
    next(error);
  }
};

exports.adminLogin = async (req, res, next) => {
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

exports.refreshToken = async (req, res, next) => {
  try {
    const token = req.body.refreshToken;
    if (!token) {
      return res.status(401).json({ message: 'Refresh token is required' });
    }

    // Check if token is in the blocklist
    const isBlocklisted = await redisClient.get(`rl:blocklist:${token}`);
    if (isBlocklisted) {
      return res.status(401).json({ message: 'Refresh token has been revoked' });
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    
    // Add old token to blocklist (TTL 7 days to match token expiry)
    await redisClient.setex(`rl:blocklist:${token}`, 7 * 24 * 60 * 60, 'revoked');

    const payload = { id: decoded.id, role: decoded.role };
    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    res.status(200).json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
};

exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      // Blocklist the refresh token so it cannot be used again
      await redisClient.setex(`rl:blocklist:${refreshToken}`, 7 * 24 * 60 * 60, 'revoked');
    }
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};
