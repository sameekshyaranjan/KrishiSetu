const express = require('express');
const router = express.Router();
const { 
  getPublishedSchemes, 
  getAllSchemes, 
  createScheme, 
  updateScheme, 
  publishScheme, 
  rejectScheme,
  syncSchemes 
} = require('../controllers/schemeController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public route: everyone (including guest visitors) can view published schemes
router.get('/', getPublishedSchemes);

// Protected Admin routes
router.use(protect);

router.get('/all', authorize('admin'), getAllSchemes);
router.post('/sync', authorize('admin'), syncSchemes);
router.post('/', authorize('admin'), createScheme);
router.put('/:id', authorize('admin'), updateScheme);
router.put('/:id/publish', authorize('admin'), publishScheme);
router.put('/:id/reject', authorize('admin'), rejectScheme);

module.exports = router;
