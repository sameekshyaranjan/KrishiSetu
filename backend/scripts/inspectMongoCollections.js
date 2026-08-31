const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const inspect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('MongoDB Collections in Database:', mongoose.connection.name);
    for (const col of collections) {
      const count = await mongoose.connection.db.collection(col.name).countDocuments();
      console.log(`- ${col.name.padEnd(25)} : ${count} documents`);
    }
  } catch (e) {
    console.error(e);
  } finally {
    await mongoose.disconnect();
  }
};

inspect();
