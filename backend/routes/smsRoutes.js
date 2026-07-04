const express = require('express');
const router = express.Router();
const { handleMissedCall } = require('../controllers/smsController');

router.post('/missed-call', handleMissedCall);

module.exports = router;
