const express = require('express');
const router = express.Router();
const { placeBid } = require('../controllers/bidController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('trader'));

router.post('/', placeBid);

module.exports = router;
