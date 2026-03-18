const express = require('express');
const {
  getSummaryStats,
  getViolationsTrends,
  getViolationTypes,
  getHighRiskCameras,
  getComplianceRate
} = require('../controllers/reportController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply auth protection to all report endpoints.
// (Viewers & Admins can observe analytics)
router.use(protect);

router.get('/summary', getSummaryStats);
router.get('/trends', getViolationsTrends);
router.get('/types', getViolationTypes);
router.get('/high-risk', getHighRiskCameras);
router.get('/compliance', getComplianceRate);

module.exports = router;
