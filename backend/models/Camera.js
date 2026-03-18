const mongoose = require('mongoose');

const cameraSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a camera name'],
    trim: true,
    unique: true
  },
  location: {
    type: String,
    required: [true, 'Please provide a location/zone for the camera'],
    trim: true
  },
  zone: {
    type: String,
    trim: true,
    default: 'General'
  },
  streamUrl: {
    type: String,
    required: [true, 'Please provide a valid RTSP or HTTP stream URL'],
    trim: true
  },
  thumbnailUrl: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'offline', 'maintenance'],
    default: 'active'
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Camera', cameraSchema);
