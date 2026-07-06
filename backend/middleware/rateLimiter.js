const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis').default;
const redisClient = require('../config/redis');

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window`
  standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  store: new RedisStore({
    prefix: 'rl:global:',
    sendCommand: (...args) => redisClient.call(...args)
  }),
  message: { message: 'Too many requests from this IP, please try again after 15 minutes.' }
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  store: new RedisStore({
    prefix: 'rl:otp:',
    sendCommand: (...args) => redisClient.call(...args)
  }),
  message: { message: 'Too many OTP requests from this IP, please try again after 15 minutes.' }
});

const adminLoginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  store: new RedisStore({
    prefix: 'rl:admin:',
    sendCommand: (...args) => redisClient.call(...args)
  }),
  message: { message: 'Too many admin login attempts from this IP, please try again after an hour.' }
});

module.exports = { globalLimiter, otpLimiter, adminLoginLimiter };
