const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // Fast O(1) Redis check for suspended accounts
    const isSuspended = await redisClient.sismember('suspended_users', req.user.id);
    if (isSuspended) {
      return res.status(403).json({ message: 'Your account has been suspended by the administrator.' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token is invalid' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
    }
    next();
  };
};

module.exports = { protect, authorize };
