const { processDetections } = require('../services/aiService');

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
