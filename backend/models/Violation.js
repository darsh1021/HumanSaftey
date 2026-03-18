const mongoose = require('mongoose');

const violationSchema = new mongoose.Schema({
  cameraId: {
    type: String, // String ID representing the physical camera
    required: [true, 'Camera ID is missing from detection payload']
  },
  type: {
    type: String,
    required: [true, 'Violation Type is required'],
    enum: ['no_helmet', 'no_vest', 'intrusion', 'fall_detection']
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  status: {
    type: String,
    enum: ['pending', 'resolved', 'false_positive'],
    default: 'pending'
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  snapshotUrl: {
    type: String, // Mock thumbnail/clip payload pointer
    default: ''
  },
  notes: {
    type: String, // Admin overrides / comments
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Violation', violationSchema);
