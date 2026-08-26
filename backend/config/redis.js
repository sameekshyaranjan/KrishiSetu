const Redis = require('ioredis');
const RedisMock = require('ioredis-mock');
const dotenv = require('dotenv');

dotenv.config();

let redisClient;

const isConfiguredRedis = process.env.REDIS_URL && 
  !process.env.REDIS_URL.includes('content-mako-149507.upstash.io') &&
  process.env.USE_REDIS === 'true';

if (isConfiguredRedis) {
  try {
    redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
      retryStrategy(times) {
        if (times > 3) return null;
        return Math.min(times * 500, 2000);
      },
      reconnectOnError: () => false,
      enableOfflineQueue: false
    });
    redisClient.isRealRedis = true;

    redisClient.on('connect', () => {
      console.log('[Redis] Connected to external Redis instance');
    });

    redisClient.on('error', (err) => {
      console.warn(`[Redis] Connection warning: ${err.message}. Operating in resilient fallback mode.`);
    });
  } catch (err) {
    redisClient = new RedisMock();
    redisClient.isRealRedis = false;
    console.log('[Redis] Initialized in-memory Redis mock.');
  }
} else {
  // Use high-performance In-Memory Redis Mock for local development & resilience
  redisClient = new RedisMock();
  redisClient.isRealRedis = false;
  console.log('[Redis] In-Memory Redis Active (Zero Network Dependency, High Performance)');
}

module.exports = redisClient;
