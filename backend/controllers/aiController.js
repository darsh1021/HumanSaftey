const axios = require('axios');
const { processDetections, setAiStatus } = require('../services/aiService');
let currentAiStatus = true;

// @desc    Receive detections from AI engine telemetry layer
// @route   POST /api/ai/detection
// @access  Public (Will be secured manually by API keys or Private networks in Production)
exports.receiveDetection = async (req, res) => {
    try {
        const { cameraId, detections } = req.body;

        // Basic structural validation required prior to DB allocation
        if (!cameraId || !Array.isArray(detections)) {
            return res.status(400).json({ message: 'Invalid hardware detection payload structure' });
        }

        // Return HTTP 202 IMMEDIATELY directly to the edge camera processing scripts so that Python frames never block
        res.status(202).json({ message: 'Processed successfully' });

        // Grab global socket instance specifically attached in Express server setup
        const io = req.app.get('io');

        // Async background processing of the frame streaming
        processDetections(io, cameraId, detections).catch(err => {
            console.error(`Error processing AI detections in structural background: ${err.message}`);
        });

    } catch (error) {
       console.error(`AI Controller Architecture Error: ${error.message}`);
       
       // Handle instances where headers haven't been sent yet
       if (!res.headersSent) {
           res.status(500).json({ message: 'Server processing error via controller' });
       }
    }
};

// @desc    Proxy video feed from AI engine
// @route   GET /api/ai/video-feed
// @access  Public
exports.videoFeed = async (req, res) => {
    try {
        const response = await axios({
            method: 'get',
            url: 'http://localhost:8000/video_feed',
            responseType: 'stream'
        });

        res.set(response.headers);
        response.data.pipe(res);
    } catch (error) {
        console.error(`Video Feed Proxy Error: ${error.message}`);
        res.status(500).json({ message: 'Error streaming video from AI engine' });
    }
};

// @desc    Receive notification from AI engine (for specific alerts like no_helmet)
// @route   POST /api/ai/notify
// @access  Public
exports.notify = async (req, res) => {
    try {
        const { cameraId, type, timestamp } = req.body;
        const io = req.app.get('io');

        // We use the same service logic as detections, but for a single alert type
        // This keeps the violation logic consistent
        const detections = [
            { label: type, confidence: 1.0, bbox: [0, 0, 0, 0] },
            { label: 'person', confidence: 1.0, bbox: [0, 0, 0, 0] } // Mock a person for rule consistency
        ];

        processDetections(io, cameraId, detections).catch(err => {
            console.error(`Error processing AI notification: ${err.message}`);
        });

        res.status(200).json({ message: 'Notification received' });
    } catch (error) {
        console.error(`AI Notification Error: ${error.message}`);
        res.status(500).json({ message: 'Error receiving notification' });
    }
};

// @desc    Toggle AI detection status
// @route   POST /api/ai/status
// @access  Public
exports.toggleAI = async (req, res) => {
    try {
        const { enabled } = req.body;
        
        if (typeof enabled !== 'boolean') {
            return res.status(400).json({ message: 'Invalid status type' });
        }

        currentAiStatus = enabled;
        setAiStatus(enabled);

        // Notify Python AI Service
        try {
            await axios.post('http://localhost:8000/toggle', { enabled });
        } catch (err) {
            console.error(`Failed to notify AI Service of status change: ${err.message}`);
            // We don't fail the whole request because the backend state is primary
        }

        res.status(200).json({ 
            message: `AI Detection ${enabled ? 'Enabled' : 'Disabled'}`,
            enabled: currentAiStatus
        });
    } catch (error) {
        console.error(`AI Status Toggle Error: ${error.message}`);
        res.status(500).json({ message: 'Error toggling AI status' });
    }
};

// @desc    Get current AI detection status
// @route   GET /api/ai/status
// @access  Public
exports.getStatus = async (req, res) => {
    res.status(200).json({ enabled: currentAiStatus });
};
