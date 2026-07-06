const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'participants.userModel'
      },
      userModel: {
        type: String,
        required: true,
        enum: ['Farmer', 'Trader']
      }
    }
  ],
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop'
  },
  lastMessage: {
    type: String,
    default: ''
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
