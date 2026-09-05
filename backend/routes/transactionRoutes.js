const express = require('express');
const router = express.Router();
const {
  recordManualTransaction,
  getMyTransactions,
  getTransactionById,
  updateLogisticsStatus,
  submitVehicleDetails,
  dispatchLot,
  confirmDelivery,
  disputeTransaction
} = require('../controllers/transactionController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router.post('/manual', recordManualTransaction);
router.get('/my-transactions', getMyTransactions);
router.get('/:id', getTransactionById);

// Specific workflow transition endpoints
router.put('/:id/vehicle', authorize('trader'), upload.single('vehiclePhoto'), submitVehicleDetails);
router.post('/:id/vehicle', authorize('trader'), upload.single('vehiclePhoto'), submitVehicleDetails);
router.put('/:id/dispatch', authorize('farmer'), dispatchLot);
router.patch('/:id/dispatch', authorize('farmer'), dispatchLot);
router.put('/:id/confirm-delivery', authorize('trader'), confirmDelivery);
router.patch('/:id/confirm-delivery', authorize('trader'), confirmDelivery);

// Generic/compatibility endpoints
router.put('/:id/logistics', updateLogisticsStatus);
router.put('/:id/dispute', upload.array('proofPhotos', 5), disputeTransaction);
router.post('/:id/dispute', upload.array('proofPhotos', 5), disputeTransaction);

module.exports = router;
