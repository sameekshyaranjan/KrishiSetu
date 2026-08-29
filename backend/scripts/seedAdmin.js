const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const Admin = require('../models/Admin');
const Farmer = require('../models/Farmer');
const Trader = require('../models/Trader');

dotenv.config();

const ensureAccounts = async () => {
  try {
    await connectDB();
    console.log('[SeedAdmin] Connected to MongoDB');

    // 1. Ensure Admin
    const adminEmail = 'admin@krishisetu.in';
    let admin = await Admin.findOne({ email: adminEmail });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    if (!admin) {
      admin = await Admin.create({
        name: 'State APMC Officer',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Created Admin:', adminEmail, '/ password123');
    } else {
      admin.password = hashedPassword;
      await admin.save();
      console.log('Updated Admin password:', adminEmail, '/ password123');
    }

    // 2. Ensure Farmer 1
    const farmerEmail = 'farmer1@krishisetu.com';
    let farmer = await Farmer.findOne({ email: farmerEmail });
    if (!farmer) {
      farmer = await Farmer.create({
        name: 'Ramesh Gowda',
        mobile: '9845123456',
        email: farmerEmail,
        password: 'password123',
        village: 'Belur Village',
        district: 'Hassan',
        state: 'Karnataka',
        cropsGrown: ['Tomato', 'Potato'],
        landArea: 5
      });
      console.log('Created Farmer:', farmerEmail, '/ password123');
    } else {
      farmer.password = 'password123';
      await farmer.save();
      console.log('Updated Farmer password:', farmerEmail, '/ password123');
    }

    // 3. Ensure Trader 1
    const traderEmail = 'trader1@krishisetu.com';
    let trader = await Trader.findOne({ email: traderEmail });
    if (!trader) {
      trader = await Trader.create({
        name: 'Suresh Hegde',
        email: traderEmail,
        password: 'password123',
        mobile: '9886055432',
        district: 'Bengaluru Urban',
        state: 'Karnataka',
        companyName: 'Karnataka Agro Traders Pvt Ltd',
        licenseNumber: 'KA-BLR-TRD-2026',
        verificationStatus: 'approved'
      });
      console.log('Created Trader:', traderEmail, '/ password123');
    } else {
      trader.password = 'password123';
      await trader.save();
      console.log('Updated Trader password:', traderEmail, '/ password123');
    }

    console.log('✅ Accounts verified successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error ensuring accounts:', error);
    process.exit(1);
  }
};

ensureAccounts();
