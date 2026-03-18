const Violation = require('../models/Violation');
const Camera = require('../models/Camera');

// Helper function to get date range
const getDateRange = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - parseInt(days));
    return { start, end };
};

// @desc    Get dashboard summary statistics
// @route   GET /api/reports/summary
// @access  Private
exports.getSummaryStats = async (req, res) => {
    try {
        // Aggregate violations
        const violationsAggregation = await Violation.aggregate([
            {
                $group: {
                    _id: null,
                    totalViolations: { $sum: 1 },
                    resolved: { 
                        $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } 
                    },
                    pending: {
                        $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                    }
                }
            }
        ]);

        const stats = violationsAggregation[0] || { totalViolations: 0, resolved: 0, pending: 0 };
        
        // Ensure to avoid division by zero
        let complianceRate = 100; // Baseline assumption if no data
        if (stats.totalViolations > 0) {
            // Formula: Compliance = purely hypothetical calculation (Resolved vs Pending) or just general system compliance metric.
             complianceRate = ((stats.resolved / stats.totalViolations) * 100).toFixed(2);
        }

        const activeCameras = await Camera.countDocuments({ status: 'active' });

        res.status(200).json({
            success: true,
            data: {
                totalViolations: stats.totalViolations,
                resolved: stats.resolved,
                pending: stats.pending,
                complianceRate: parseFloat(complianceRate),
                activeCameras
            }
        });
    } catch (error) {
        console.error(`Reports Summary Error: ${error.message}`);
        res.status(500).json({ message: 'Server error generating summary report' });
    }
};

// @desc    Get violations trends over time
// @route   GET /api/reports/trends?range=7d
// @access  Private
exports.getViolationsTrends = async (req, res) => {
    try {
        const rangeObj = { '7d': 7, '30d': 30 };
        const rangeQuery = req.query.range || '7d';
        const days = rangeObj[rangeQuery] || 7;

        const { start, end } = getDateRange(days);

        const trends = await Violation.aggregate([
            {
                $match: {
                    timestamp: { $gte: start, $lte: end }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$timestamp" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } } // Sort chronologically
        ]);

        // Format mapping correctly replacing _id with date natively
        const formattedTrends = trends.map(t => ({
            date: t._id,
            count: t.count
        }));

        res.status(200).json({
            success: true,
            range: `${days} days`,
            data: formattedTrends
        });
    } catch (error) {
        console.error(`Reports Trends Error: ${error.message}`);
        res.status(500).json({ message: 'Server error generating trends report' });
    }
};

// @desc    Get violation type distribution
// @route   GET /api/reports/types
// @access  Private
exports.getViolationTypes = async (req, res) => {
    try {
        const typesDistribution = await Violation.aggregate([
            {
                $group: {
                    _id: "$type",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } } // Highest occurrences first
        ]);
        
        const formattedTypes = typesDistribution.map(t => ({
             type: t._id,
             count: t.count
        }));

        res.status(200).json({
            success: true,
            data: formattedTypes
        });
    } catch (error) {
        console.error(`Reports Types Error: ${error.message}`);
        res.status(500).json({ message: 'Server error generating types report' });
    }
};

// @desc    Get high-risk physical cameras
// @route   GET /api/reports/high-risk
// @access  Private
exports.getHighRiskCameras = async (req, res) => {
    try {
        const highRisk = await Violation.aggregate([
            {
                $group: {
                    _id: "$cameraId",
                    violations: { $sum: 1 }
                }
            },
            { $sort: { violations: -1 } },
            { $limit: 10 } // Top 10 most critical camera risk targets
        ]);

        const formattedHighRisk = highRisk.map(h => ({
             cameraId: h._id,
             violations: h.violations
        }));

        res.status(200).json({
            success: true,
            data: formattedHighRisk
        });
    } catch (error) {
        console.error(`Reports High-Risk Error: ${error.message}`);
        res.status(500).json({ message: 'Server error generating high-risk report' });
    }
};

// @desc    Get holistic compliance rate 
// @route   GET /api/reports/compliance
// @access  Private
exports.getComplianceRate = async (req, res) => {
    try {
        const total = await Violation.countDocuments();
        const pending = await Violation.countDocuments({ status: 'pending' });

        // Simple compliance: 100 if purely no total incidents, otherwise based on resolution depth explicitly.
        // We will base it strictly off resolved fraction.
        let compliance = 100;
        if (total > 0) {
            const resolved = total - pending;
            compliance = ((resolved / total) * 100).toFixed(2);
        }

        res.status(200).json({
            success: true,
            compliance: parseFloat(compliance)
        });
    } catch (error) {
        console.error(`Reports Compliance Error: ${error.message}`);
        res.status(500).json({ message: 'Server error generating compliance report' });
    }
};
