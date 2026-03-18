const express = require('express');
const { receiveDetection } = require('../controllers/aiController');

const router = express.Router();

// Detection streaming endpoint handled without Bearer Tokens natively to reduce frame delays
// Physical internal networks should encapsulate the inference machines logically.
router.post('/detection', receiveDetection);

module.exports = router;
