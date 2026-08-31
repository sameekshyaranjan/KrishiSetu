const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Farmer = require('../models/Farmer');
const Trader = require('../models/Trader');
const Crop = require('../models/Crop');

const inspect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas\n');

    const totalConversations = await Conversation.countDocuments();
    const totalMessages = await Message.countDocuments();

    console.log(`Total Conversations in MongoDB: ${totalConversations}`);
    console.log(`Total Messages in MongoDB:      ${totalMessages}\n`);

    const allConversations = await Conversation.find().populate('participants.user listingId');
    console.log('Existing Conversation Documents:');
    allConversations.forEach((c, idx) => {
      console.log(`[${idx+1}] ID: ${c._id} | Listing: ${c.listingId?.name || 'None'} | Participants: ${c.participants?.map(p => p.user?.name || p.user).join(' <-> ')} | LastMsg: "${c.lastMessage}" | UpdatedAt: ${c.updatedAt}`);
    });

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
};

inspect();
