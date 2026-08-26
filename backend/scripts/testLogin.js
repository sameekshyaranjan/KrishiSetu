const connectDB = require('../config/db');
const Farmer = require('../models/Farmer');
const dotenv = require('dotenv');

dotenv.config();

const test = async () => {
  try {
    await connectDB();
    const farmer = await Farmer.findOne({ email: 'farmer1@krishisetu.com' }).select('+password');
    console.log('Found farmer:', farmer ? farmer.email : 'NOT FOUND');
    if (farmer) {
      const match = await farmer.matchPassword('password123');
      console.log('Password match with password123:', match);
    }
    process.exit(0);
  } catch (err) {
    console.error('Test error:', err);
    process.exit(1);
  }
};

test();
