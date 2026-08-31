const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Crop = require('../models/Crop');
const Bid = require('../models/Bid');
const Farmer = require('../models/Farmer');
const Trader = require('../models/Trader');

const inspect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas\n');

    console.log('=== CROPS IN DATABASE ===');
    const crops = await Crop.find().populate('farmer', 'name email');
    crops.forEach((c, idx) => {
      console.log(`[Crop ${idx+1}] ID: ${c._id}`);
      console.log(`  Name: ${c.name}`);
      console.log(`  Category: ${c.category}`);
      console.log(`  Status: ${c.status}`);
      console.log(`  Images: ${JSON.stringify(c.images)}`);
      console.log(`  Farmer: ${c.farmer?.name} (${c.farmer?.email})\n`);
    });

    console.log('=== BIDS IN DATABASE ===');
    const bids = await Bid.find().populate('crop').populate('trader', 'name email');
    bids.forEach((b, idx) => {
      console.log(`[Bid ${idx+1}] ID: ${b._id}`);
      console.log(`  Trader: ${b.trader?.name} (${b.trader?.email})`);
      console.log(`  Status: ${b.status}`);
      console.log(`  Amount: ${b.amount}`);
      console.log(`  crop ID ref: ${b.crop?._id}`);
      console.log(`  crop Name: ${b.crop?.name}`);
      console.log(`  crop Category: ${b.crop?.category}`);
      console.log(`  crop Images: ${JSON.stringify(b.crop?.images)}\n`);
    });

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
};

inspect();
