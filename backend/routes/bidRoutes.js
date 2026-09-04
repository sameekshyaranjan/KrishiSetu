const express = require('express');
const router = express.Router();
const { 
  placeBid, 
  getBidsForListing, 
  getMyBids, 
  updateBid, 
  withdrawBid, 
  respondToBid, 
  undoAcceptBid,
  counterBid,
  traderRespondToCounter,
  bidHigherAfterRejection
} = require('../controllers/bidController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/my', authorize('farmer', 'trader'), getMyBids);
router.get('/my-bids', authorize('farmer', 'trader'), getMyBids);
router.get('/listing/:cropId', authorize('farmer', 'trader', 'admin'), getBidsForListing);
router.get('/crop/:cropId', authorize('farmer', 'trader', 'admin'), getBidsForListing);
router.post('/', authorize('trader'), placeBid);
router.put('/:id', authorize('trader'), updateBid);
router.post('/:id/bid-higher', authorize('trader'), bidHigherAfterRejection);
router.put('/:id/bid-higher', authorize('trader'), bidHigherAfterRejection);
router.put('/:id/withdraw', authorize('trader'), withdrawBid);
router.put('/:id/cancel', authorize('trader'), withdrawBid);
router.patch('/:id/cancel', authorize('trader'), withdrawBid);
router.patch('/:id/withdraw', authorize('trader'), withdrawBid);

// Counter-bid negotiation routes
router.put('/:id/counter', authorize('farmer'), counterBid);
router.post('/:id/counter', authorize('farmer'), counterBid);
router.put('/:id/trader-respond', authorize('trader'), traderRespondToCounter);
router.post('/:id/trader-respond', authorize('trader'), traderRespondToCounter);

router.put('/:id/respond', authorize('farmer'), respondToBid);
router.put('/:id/accept', authorize('farmer'), (req, res, next) => {
  req.body.status = 'accepted';
  return respondToBid(req, res, next);
});
router.put('/:id/undo-accept', authorize('farmer'), undoAcceptBid);

module.exports = router;
