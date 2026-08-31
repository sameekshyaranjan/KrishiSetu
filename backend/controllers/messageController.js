const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Farmer = require('../models/Farmer');
const Trader = require('../models/Trader');

const sendMessage = async (req, res, next) => {
  try {
    const { receiverId, receiverModel, content, listingId } = req.body;
    const senderId = req.user.id;
    const senderModel = req.user.role === 'farmer' ? 'Farmer' : 'Trader';
    const effectiveReceiverModel = receiverModel || (req.user.role === 'farmer' ? 'Trader' : 'Farmer');

    if (!receiverId || !content) {
      return res.status(400).json({ message: 'Receiver ID and content are required' });
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
          { user: receiverId, userModel: effectiveReceiverModel }
        ],
        listingId: listingId || null,
        lastMessage: content
      });
    } else {
      conversation.lastMessage = content;
      if (listingId && !conversation.listingId) {
        conversation.listingId = listingId;
      }
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

    res.status(201).json({
      ...message.toObject(),
      conversationId: conversation._id
    });
  } catch (error) {
    next(error);
  }
};

const getMyConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({ 'participants.user': req.user.id })
      .populate('participants.user', 'name companyName mobile district')
      .sort({ updatedAt: -1 });

    res.status(200).json(conversations);
  } catch (error) {
    next(error);
  }
};

const getConversationMessages = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Strict Access Control: User must be a participant in this conversation
    const isParticipant = conversation.participants.some(
      p => p.user && p.user.toString() === req.user.id
    );

    if (!isParticipant) {
      return res.status(403).json({ message: 'Forbidden: You are not a participant in this conversation' });
    }

    const messages = await Message.find({ conversationId: req.params.id })
      .populate('sender', 'name')
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
};

const getConversationWithUser = async (req, res, next) => {
  try {
    const otherUserId = req.params.otherUserId;
    const conversation = await Conversation.findOne({
      $and: [
        { 'participants.user': req.user.id },
        { 'participants.user': otherUserId }
      ]
    }).populate('participants.user', 'name companyName mobile district');

    if (!conversation) {
      return res.status(200).json({ conversation: null, messages: [] });
    }

    const messages = await Message.find({ conversationId: conversation._id })
      .populate('sender', 'name')
      .sort({ createdAt: 1 });

    res.status(200).json({ conversation, messages });
  } catch (error) {
    next(error);
  }
};

module.exports = { sendMessage, getMyConversations, getConversationMessages, getConversationWithUser };
