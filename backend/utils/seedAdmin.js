const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const Admin = require('../models/Admin');

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existing = await Admin.findOne({ email: 'admin@krishisetu.com' });
    if (existing) {
      console.log('Admin already exists. Skipping seed.');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    await Admin.create({
      name: 'Super Admin',
      email: 'admin@krishisetu.com',
      password: hashedPassword,
    });

    console.log('Admin created: admin@krishisetu.com / admin123');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
};

seedAdmin();
