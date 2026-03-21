const Violation = require('../models/Violation');
const { triggerViolationAlert } = require('./alertService');

// Advanced Features Add-ons (Throttling / Debouncing)
// Map tracks <cameraID_type>: last_timestamp to avoid spamming the DB for the same incident multiple times per second
const recentViolationMemory = new Map();
const DEBOUNCE_TIME_MS = 5000; // 5 seconds cool-down per violation type per camera
let isAiEnabled = true;

exports.setAiStatus = (status) => {
    isAiEnabled = status;
    console.log(`[AI SERVICE] Global AI detection state updated: ${isAiEnabled ? 'ENABLED' : 'DISABLED'}`);
};

exports.processDetections = async (io, cameraId, detections) => {
    if (!isAiEnabled) return false;
    
    // Basic AI Confidence filtering threshold mapped statically
    const MIN_CONFIDENCE = 0.60;
    
    // Safety check definitions locally parsed from the stream array
    let hasPerson = false;
    let noHelmetDetected = false;
    let intrusionDetected = false;
    let highestHelmetConf = 0;
    let highestIntrusionConf = 0;

    // Scan bounding boxes
    for (const det of detections) {
        if (det.confidence < MIN_CONFIDENCE) continue;
        
        if (det.label === 'person') hasPerson = true;
        
        if (det.label === 'no_helmet') {
            noHelmetDetected = true;
            highestHelmetConf = Math.max(highestHelmetConf, det.confidence);
        }
        
        // Hypothetical rule support for specific models checking restricted box collisions
        if (det.label === 'intrusion') {
            intrusionDetected = true;
            highestIntrusionConf = Math.max(highestIntrusionConf, det.confidence);
        }
    }

    const processViolation = async (type, conf) => {
        const memKey = `${cameraId}_${type}`;
        const lastOccurred = recentViolationMemory.get(memKey);

        if (!lastOccurred || (Date.now() - lastOccurred > DEBOUNCE_TIME_MS)) {
            // Commit to Database
            const violationRecord = await Violation.create({
                cameraId,
                type,
                confidence: conf,
                timestamp: Date.now(),
                status: 'pending'
            });

            // Update debounce memory cache
            recentViolationMemory.set(memKey, Date.now());

             // Cascade Real-Time System Architectures
             triggerViolationAlert(io, violationRecord);
        }
    };

    // RULE 1: PPE VIOLATION (Missing Helmet while Person identified natively inside the frame stream overlay)
    if (hasPerson && noHelmetDetected) {
        await processViolation('no_helmet', highestHelmetConf);
    }
    
    // RULE 2: RESTRICTED ZONE INTRUSION
    if (hasPerson && intrusionDetected) {
        await processViolation('intrusion', highestIntrusionConf);
    }

    // RULE 3: SAFE CASE (implied explicitly by ignoring frames where combinations aren't matched)

    return true; // Pipeline exit
};
