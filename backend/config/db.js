const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/krishisetu';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    logger.info(`[Database] MongoDB Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    logger.warn(`[Database] MongoDB Connection notice (${error.message}). Express API & Documentation serving in standalone mode.`);
  }
};

module.exports = connectDB;
