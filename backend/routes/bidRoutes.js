const express = require('express');
const router = express.Router();
const { placeBid, getBidsForListing, getMyBids } = require('../controllers/bidController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/my', authorize('trader'), getMyBids);
router.get('/listing/:cropId', authorize('farmer'), getBidsForListing);
router.post('/', authorize('trader'), placeBid);

module.exports = router;
