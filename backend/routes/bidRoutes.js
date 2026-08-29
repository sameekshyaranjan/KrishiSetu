const express = require('express');
const router = express.Router();
const { placeBid, getBidsForListing, getMyBids, updateBid, withdrawBid, respondToBid, undoAcceptBid } = require('../controllers/bidController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/my', authorize('farmer', 'trader'), getMyBids);
router.get('/listing/:cropId', authorize('farmer', 'trader', 'admin'), getBidsForListing);
router.post('/', authorize('trader'), placeBid);
router.put('/:id', authorize('trader'), updateBid);
router.put('/:id/withdraw', authorize('trader'), withdrawBid);
router.put('/:id/respond', authorize('farmer'), respondToBid);
router.put('/:id/undo-accept', authorize('farmer'), undoAcceptBid);

module.exports = router;
