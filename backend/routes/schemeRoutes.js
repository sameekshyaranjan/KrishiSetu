const express = require('express');
const router = express.Router();
const { getPublishedSchemes, getAllSchemes, createScheme, updateScheme, publishScheme } = require('../controllers/schemeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', authorize('farmer', 'trader', 'admin'), getPublishedSchemes);
router.get('/all', authorize('admin'), getAllSchemes);
router.post('/', authorize('admin'), createScheme);
router.put('/:id', authorize('admin'), updateScheme);
router.put('/:id/publish', authorize('admin'), publishScheme);

module.exports = router;
