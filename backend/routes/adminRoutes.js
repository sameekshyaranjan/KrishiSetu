const express = require('express');
const { getDashboardStats, getAllFarmers, getAllTraders, getFarmerById, getTraderById, getAuditLogs, suspendUser, resolveDispute } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/dashboard', protect, authorize('admin'), getDashboardStats);
router.get('/audit-logs', protect, authorize('admin'), getAuditLogs);

router.get('/farmers', protect, authorize('admin'), getAllFarmers);
router.get('/farmers/:id', protect, authorize('admin'), getFarmerById);

router.get('/traders', protect, authorize('admin'), getAllTraders);
router.get('/traders/:id', protect, authorize('admin'), getTraderById);

router.put('/users/:role/:id/suspend', protect, authorize('admin'), suspendUser);
router.put('/transactions/:id/resolve-dispute', protect, authorize('admin'), resolveDispute);

module.exports = router;
