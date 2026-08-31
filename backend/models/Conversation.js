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
    ref: 'Crop',
    index: true
  },
  lastMessage: {
    type: String,
    default: ''
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

conversationSchema.index({ 'participants.user': 1, listingId: 1 });
conversationSchema.index({ updatedAt: -1 });

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
