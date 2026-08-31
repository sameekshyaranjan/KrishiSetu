const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Crop = require('../models/Crop');
const Farmer = require('../models/Farmer');

const inspect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas\n');

    const totalCrops = await Crop.countDocuments();
    console.log(`Total Crops in MongoDB: ${totalCrops}`);

    const statusBreakdown = await Crop.aggregate([
      { $group: { _id: { status: '$status', harvestStatus: '$harvestStatus' }, count: { $sum: 1 } } }
    ]);
    console.log('\nBreakdown by status & harvestStatus:');
    console.log(JSON.stringify(statusBreakdown, null, 2));

    const allCrops = await Crop.find().populate('farmer', 'name email mobile district');
    console.log('\nAll Crop Documents in MongoDB:');
    allCrops.forEach((c, idx) => {
      console.log(`[${idx+1}] ID: ${c._id} | Name: "${c.name}" | Status: ${c.status} | HarvestStatus: ${c.harvestStatus} | Farmer: ${c.farmer?.name} (${c.farmer?.email}) | Price: ₹${c.basePrice}/${c.unit}`);
    });

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
};

inspect();
