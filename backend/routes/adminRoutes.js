const express = require('express');
const { getDashboardStats, getAllFarmers, getAllTraders, getFarmerById, getTraderById } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/dashboard', protect, authorize('admin'), getDashboardStats);

router.get('/farmers', protect, authorize('admin'), getAllFarmers);
router.get('/farmers/:id', protect, authorize('admin'), getFarmerById);

router.get('/traders', protect, authorize('admin'), getAllTraders);
router.get('/traders/:id', protect, authorize('admin'), getTraderById);

module.exports = router;
