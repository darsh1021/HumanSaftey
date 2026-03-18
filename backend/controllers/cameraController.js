const Camera = require('../models/Camera');

// @desc    Add a new camera
// @route   POST /api/cameras
// @access  Private/Admin
exports.addCamera = async (req, res) => {
  try {
    const { name, location, zone, streamUrl, status, thumbnailUrl } = req.body;

    if (!name || !location || !streamUrl) {
      return res.status(400).json({ message: 'Please provide name, location, and streamUrl' });
    }

    const cameraExists = await Camera.findOne({ name });
    if (cameraExists) {
      return res.status(400).json({ message: `Camera with name '${name}' already exists` });
    }

    const camera = await Camera.create({
      name,
      location,
      zone: zone || 'General',
      streamUrl,
      status: status || 'active',
      thumbnailUrl: thumbnailUrl || '',
      lastActive: Date.now()
    });

    res.status(201).json({
      message: 'Camera added successfully',
      camera
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    console.error(`Add Camera Error: ${error.message}`);
    res.status(500).json({ message: 'Server error while adding camera' });
  }
};

// @desc    Get all cameras
// @route   GET /api/cameras
// @access  Private
exports.getCameras = async (req, res) => {
  try {
    const cameras = await Camera.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: cameras.length,
      data: cameras
    });
  } catch (error) {
    console.error(`Get Cameras Error: ${error.message}`);
    res.status(500).json({ message: 'Server error while fetching cameras' });
  }
};

// @desc    Get single camera
// @route   GET /api/cameras/:id
// @access  Private
exports.getCameraById = async (req, res) => {
  try {
    const camera = await Camera.findById(req.params.id);

    if (!camera) {
      return res.status(404).json({ message: 'Camera not found' });
    }

    res.status(200).json({
      success: true,
      data: camera
    });
  } catch (error) {
    console.error(`Get Camera ID Error: ${error.message}`);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Invalid Camera ID format' });
    }
    res.status(500).json({ message: 'Server error while fetching camera' });
  }
};

// @desc    Update camera
// @route   PATCH /api/cameras/:id
// @access  Private/Admin
exports.updateCamera = async (req, res) => {
  try {
    const { name, location, zone, streamUrl, status, thumbnailUrl } = req.body;

    let camera = await Camera.findById(req.params.id);

    if (!camera) {
      return res.status(404).json({ message: 'Camera not found' });
    }

    // Check if updating to an existing name
    if (name && name !== camera.name) {
      const nameExists = await Camera.findOne({ name });
      if (nameExists) {
        return res.status(400).json({ message: `Camera name '${name}' is already taken` });
      }
    }

    camera.name = name || camera.name;
    camera.location = location || camera.location;
    camera.zone = zone || camera.zone;
    camera.streamUrl = streamUrl || camera.streamUrl;
    camera.status = status || camera.status;
    camera.thumbnailUrl = thumbnailUrl !== undefined ? thumbnailUrl : camera.thumbnailUrl;
    
    // Auto update lastActive when a stream toggles to active
    if (status === 'active' && camera.status !== 'active') {
       camera.lastActive = Date.now();
    }

    await camera.save();

    // Broadcast Camera Update Event
    const io = req.app.get('io');
    if (io) {
        io.emit('cameraUpdate', {
            id: camera._id,
            name: camera.name,
            status: camera.status,
            lastActive: camera.lastActive,
            timestamp: new Date()
        });
    }

    res.status(200).json({
      success: true,
      message: 'Camera updated successfully',
      data: camera
    });
  } catch (error) {
    console.error(`Update Camera Error: ${error.message}`);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Invalid Camera ID format' });
    }
    res.status(500).json({ message: 'Server error while updating camera' });
  }
};

// @desc    Delete camera
// @route   DELETE /api/cameras/:id
// @access  Private/Admin
exports.deleteCamera = async (req, res) => {
  try {
    const camera = await Camera.findById(req.params.id);

    if (!camera) {
      return res.status(404).json({ message: 'Camera not found' });
    }

    await camera.deleteOne();

    res.status(200).json({ message: 'Camera removed successfully' });
  } catch (error) {
    console.error(`Delete Camera Error: ${error.message}`);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Invalid Camera ID format' });
    }
    res.status(500).json({ message: 'Server error while deleting camera' });
  }
};
