const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Wallet = require('../models/Wallet');

const checkWallets = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const wallets = await Wallet.find({});
    console.log('Current Wallets in DB:');
    console.log(JSON.stringify(wallets, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
};

checkWallets();
