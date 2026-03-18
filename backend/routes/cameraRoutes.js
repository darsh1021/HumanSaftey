const express = require('express');
const {
  addCamera,
  getCameras,
  getCameraById,
  updateCamera,
  deleteCamera
} = require('../controllers/cameraController');

const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

// Apply auth protection to ALL camera routes
router.use(protect);

router
  .route('/')
  .post(allowRoles('admin'), addCamera) // Only admins can add
  .get(getCameras);                     // Admins & Viewers can get all

router
  .route('/:id')
  .get(getCameraById)                   // Admins & Viewers can get single
  .patch(allowRoles('admin'), updateCamera)  // Only Admins update
  .delete(allowRoles('admin'), deleteCamera); // Only Admins delete

module.exports = router;
