// Handles Alert Routing (Socket, Email, SMS)

exports.triggerViolationAlert = (io, violation) => {
    // 1. Emit direct realtime Socket payload to frontend clients
    if (io) {
        // Emit explicit payload map to all active global clients
        const payload = {
            id: violation._id,
            cameraId: violation.cameraId,
            type: violation.type,
            timestamp: violation.timestamp,
            severity: violation.severity || 'medium', // Fallback safety
            confidence: violation.confidence,
            status: violation.status
        };

        io.emit('newViolation', payload);
        
        // Optional Advanced Emit targeting just users who ran socket.join('admin')
        io.to('admin').emit('adminNewViolation', { ...payload, isAdminNotice: true });

        console.log(`[ALERT] Socket.io emitted new violation event for ${violation.cameraId}.`);
    } else {
        console.warn(`[WARNING] Socket.io instance not found. Cannot emit violation.`);
    }

    // 2. (Optional Mock) Extend to physical external Notification architectures
    if (violation.confidence > 0.85) {
        // e.g. Trigger email formatting logic
        console.log(`[ALERT] High-confidence Critical Event. Simulating External Push Notification (SMS).`);
    }
};
