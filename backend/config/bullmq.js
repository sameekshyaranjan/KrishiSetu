const { Queue } = require('bullmq');
const redisClient = require('./redis');

let cronQueue = null;

if (redisClient.isRealRedis) {
  try {
    cronQueue = new Queue('cronQueue', {
      connection: redisClient
    });
    cronQueue.on('error', () => {});
  } catch (e) {
    cronQueue = null;
  }
}

module.exports = { cronQueue };
