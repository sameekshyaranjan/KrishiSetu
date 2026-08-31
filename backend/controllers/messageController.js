const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Farmer = require('../models/Farmer');
const Trader = require('../models/Trader');
const socketEmitter = require('../utils/socketEmitter');

/**
 * Send a message within a conversation (or auto-create conversation with Crop reference)
 */
const sendMessage = async (req, res, next) => {
  try {
    const { receiverId, receiverModel, content, listingId, conversationId } = req.body;
    const senderId = req.user.id;
    const senderRole = (req.user.role || '').toLowerCase();
    const senderModel = senderRole === 'farmer' ? 'Farmer' : 'Trader';
    const effectiveReceiverModel = receiverModel || (senderRole === 'farmer' ? 'Trader' : 'Farmer');

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content cannot be empty' });
    }

    if (content.length > 2000) {
      return res.status(400).json({ message: 'Message cannot exceed 2000 characters' });
    }

    let conversation = null;

    // 1. If conversationId is provided, verify participant access
    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }

      const isParticipant = conversation.participants.some(
        p => p.user && p.user.toString() === senderId
      );

      if (!isParticipant) {
        return res.status(403).json({ message: 'Forbidden: You are not a participant in this conversation' });
      }

      conversation.lastMessage = content.trim();
      conversation.lastMessageAt = new Date();
      if (listingId && !conversation.listingId) {
        conversation.listingId = listingId;
      }
      await conversation.save();
    } else {
      // 2. Locate or create conversation by (sender, receiver, listingId)
      if (!receiverId) {
        return res.status(400).json({ message: 'Receiver ID or Conversation ID is required' });
      }

      const query = {
        'participants.user': { $all: [senderId, receiverId] }
      };
      if (listingId) {
        query.listingId = listingId;
      }

      conversation = await Conversation.findOne(query);

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [
            { user: senderId, userModel: senderModel },
            { user: receiverId, userModel: effectiveReceiverModel }
          ],
          listingId: listingId || null,
          lastMessage: content.trim(),
          lastMessageAt: new Date()
        });
      } else {
        conversation.lastMessage = content.trim();
        conversation.lastMessageAt = new Date();
        if (listingId && !conversation.listingId) {
          conversation.listingId = listingId;
        }
        await conversation.save();
      }
    }

    // 3. Create the persistent message
    const message = await Message.create({
      conversationId: conversation._id,
      sender: senderId,
      senderModel: senderModel,
      content: content.trim(),
      isRead: false
    });

    // 4. Identify destination receiver for real-time WebSocket dispatch
    const otherParticipant = conversation.participants.find(
      p => p.user && p.user.toString() !== senderId
    );
    const targetReceiverId = otherParticipant ? otherParticipant.user.toString() : receiverId;

    // 5. Emit real-time decoupled socket event
    socketEmitter.emit('newMessage', message, targetReceiverId, conversation._id.toString());

    res.status(201).json({
      ...message.toObject(),
      conversationId: conversation._id
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all conversation threads for the authenticated user with unread counts & crop references
 */
const getMyConversations = async (req, res, next) => {
  try {
    const rawConversations = await Conversation.find({ 'participants.user': req.user.id })
      .populate('participants.user', 'name companyName mobile district village profilePhoto')
      .populate('listingId', 'name category quantity unit basePrice status district images harvestStatus')
      .sort({ updatedAt: -1 });

    // Calculate unread count for each conversation
    const conversationsWithUnread = await Promise.all(
      rawConversations.map(async (conv) => {
        const convObj = conv.toObject();
        const unreadCount = await Message.countDocuments({
          conversationId: conv._id,
          sender: { $ne: req.user.id },
          isRead: false
        });
        convObj.unreadCount = unreadCount;
        return convObj;
      })
    );

    res.status(200).json(conversationsWithUnread);
  } catch (error) {
    next(error);
  }
};

/**
 * Get historical messages for a conversation and mark them as read
 */
const getConversationMessages = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
      .populate('participants.user', 'name companyName mobile district village profilePhoto')
      .populate('listingId', 'name category quantity unit basePrice status district images harvestStatus');

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Strict Access Control: User must be a participant in this conversation
    const isParticipant = conversation.participants.some(
      p => p.user && (p.user._id ? p.user._id.toString() : p.user.toString()) === req.user.id
    );

    if (!isParticipant) {
      return res.status(403).json({ message: 'Forbidden: You are not a participant in this conversation' });
    }

    // Mark unread incoming messages as read
    await Message.updateMany(
      { conversationId: req.params.id, sender: { $ne: req.user.id }, isRead: false },
      { $set: { isRead: true } }
    );

    const messages = await Message.find({ conversationId: req.params.id })
      .populate('sender', 'name companyName')
      .sort({ createdAt: 1 });

    res.status(200).json({
      conversation,
      messages
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all messages in a conversation as read
 */
const markConversationRead = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const isParticipant = conversation.participants.some(
      p => p.user && p.user.toString() === req.user.id
    );

    if (!isParticipant) {
      return res.status(403).json({ message: 'Forbidden: You are not a participant in this conversation' });
    }

    await Message.updateMany(
      { conversationId: req.params.id, sender: { $ne: req.user.id }, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    next(error);
  }
};

/**
 * Locate or retrieve conversation thread with a specific user (optionally scoped to a crop listing)
 */
const getConversationWithUser = async (req, res, next) => {
  try {
    const otherUserId = req.params.otherUserId;
    const listingId = req.query.listingId || null;

    const query = {
      'participants.user': { $all: [req.user.id, otherUserId] }
    };
    if (listingId) {
      query.listingId = listingId;
    }

    const conversation = await Conversation.findOne(query)
      .populate('participants.user', 'name companyName mobile district village profilePhoto')
      .populate('listingId', 'name category quantity unit basePrice status district images harvestStatus');

    if (!conversation) {
      return res.status(200).json({ conversation: null, messages: [] });
    }

    // Mark unread messages as read
    await Message.updateMany(
      { conversationId: conversation._id, sender: { $ne: req.user.id }, isRead: false },
      { $set: { isRead: true } }
    );

    const messages = await Message.find({ conversationId: conversation._id })
      .populate('sender', 'name companyName')
      .sort({ createdAt: 1 });

    res.status(200).json({ conversation, messages });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMessage,
  getMyConversations,
  getConversationMessages,
  markConversationRead,
  getConversationWithUser
};
