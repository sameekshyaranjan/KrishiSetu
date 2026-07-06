const { Queue } = require('bullmq');
const redisClient = require('./redis');

// Initialize the Queue
// We use the existing redis connection to prevent opening multiple connections
const cronQueue = new Queue('cronQueue', {
  connection: redisClient
});

module.exports = { cronQueue };
