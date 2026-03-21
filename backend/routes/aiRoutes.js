const express = require('express');
const { receiveDetection, videoFeed, notify, toggleAI, getStatus } = require('../controllers/aiController');

const router = express.Router();

router.post('/detection', receiveDetection);
router.get('/video-feed', videoFeed);
router.post('/notify', notify);
router.post('/status', toggleAI);
router.get('/status', getStatus);

module.exports = router;
