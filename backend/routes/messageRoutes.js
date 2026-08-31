const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getMyConversations,
  getConversationMessages,
  markConversationRead,
  getConversationWithUser
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

// Protect all messaging routes (both farmers and traders)
router.use(protect);

router.post('/', sendMessage);
router.get('/conversations', getMyConversations);
router.get('/conversations/:id', getConversationMessages);
router.patch('/conversations/:id/read', markConversationRead);
router.get('/with/:otherUserId', getConversationWithUser);

module.exports = router;
