const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Farmer = require('../models/Farmer');
const Trader = require('../models/Trader');

const sendMessage = async (req, res, next) => {
  try {
    const { receiverId, receiverModel, content, listingId } = req.body;
    const senderId = req.user.id;
    const senderModel = req.user.role === 'farmer' ? 'Farmer' : 'Trader';

    if (!receiverId || !receiverModel || !content) {
      return res.status(400).json({ message: 'Receiver, receiver model, and content are required' });
    }

    // 1. Check if a conversation already exists
    let conversation = await Conversation.findOne({
      $and: [
        { 'participants.user': senderId },
        { 'participants.user': receiverId }
      ]
    });

    // 2. If it doesn't exist, create it
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [
          { user: senderId, userModel: senderModel },
          { user: receiverId, userModel: receiverModel }
        ],
        listingId: listingId || null,
        lastMessage: content
      });
    } else {
      // Update existing conversation's last message
      conversation.lastMessage = content;
      await conversation.save();
    }

    // 3. Create the message
    const message = await Message.create({
      conversationId: conversation._id,
      sender: senderId,
      senderModel: senderModel,
      content: content
    });

    // 4. Emit real-time node event to decouple WebSockets
    const socketEmitter = require('../utils/socketEmitter');
    socketEmitter.emit('newMessage', message, receiverId);

    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
};

const getMyConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({ 'participants.user': req.user.id })
      .populate('participants.user', 'name companyName mobile')
      .sort({ updatedAt: -1 });

    res.status(200).json(conversations);
  } catch (error) {
    next(error);
  }
};

const getConversationMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({ conversationId: req.params.id })
      .populate('sender', 'name')
      .sort({ createdAt: 1 }); // Oldest to newest for chat history

    res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
};

module.exports = { sendMessage, getMyConversations, getConversationMessages };
