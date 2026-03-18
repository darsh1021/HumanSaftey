const express = require('express');
const {
  getViolations,
  getViolationById,
  updateViolation,
  deleteViolation,
  bulkUpdateViolations
} = require('../controllers/violationController');

const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

// Apply auth protection recursively to ALL route access points below
router.use(protect);

// Specific extended complex query endpoints mapped securely
// 'admin' role protection explicitly wrapping multi-cluster queries
router.route('/bulk/update').patch(allowRoles('admin'), bulkUpdateViolations);

router
  .route('/')
  .get(getViolations);                           // Active viewers and administrators possess reading clearance

router
  .route('/:id')
  .get(getViolationById)                         // Read singular tracking metric payload
  .patch(allowRoles('admin'), updateViolation)   // Security mutation limited correctly to Admin Overrides
  .delete(allowRoles('admin'), deleteViolation); // Security DB physical erasing only by master profiles

module.exports = router;
