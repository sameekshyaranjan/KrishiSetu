const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const MandiPrice = require('../models/MandiPrice');

const inspect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas');

    const total = await MandiPrice.countDocuments();
    console.log(`Total Mandi Price records in DB: ${total}`);

    const stateAggregation = await MandiPrice.aggregate([
      { $group: { _id: '$state', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('\nRecords by State in MongoDB:');
    console.log(JSON.stringify(stateAggregation, null, 2));

    const sampleNonKarnataka = await MandiPrice.find({
      state: { $not: /^karnataka$/i }
    }).limit(5);

    console.log('\nSample non-Karnataka records in DB:');
    console.log(JSON.stringify(sampleNonKarnataka, null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
};

inspect();
