const Violation = require('../models/Violation');

// @desc    Get all violations (Paginated, Filtered, Sorted)
// @route   GET /api/violations
// @access  Private (Admins & Viewers)
exports.getViolations = async (req, res) => {
    try {
        const { page = 1, limit = 10, type, status, cameraId, startDate, endDate, search, sort = '-timestamp' } = req.query;

        // Build Query Object
        let queryObj = {};

        if (type) queryObj.type = type;
        if (status) queryObj.status = status;
        if (cameraId) queryObj.cameraId = cameraId;

        // Date Filtering
        if (startDate || endDate) {
            queryObj.timestamp = {};
            if (startDate) queryObj.timestamp.$gte = new Date(startDate);
            if (endDate) queryObj.timestamp.$lte = new Date(endDate);
        }

        // Search Functionality (Regex search across cameraId or type implicitly)
        // If 'search' is provided, we can map it via a highly flexible OR statement
        if (search) {
            queryObj.$or = [
                { type: { $regex: search, $options: 'i' } },
                { cameraId: { $regex: search, $options: 'i' } }
            ];
        }

        // Pagination setup
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const startIndex = (pageNum - 1) * limitNum;

        // Execute Query
        const violations = await Violation.find(queryObj)
            .sort(sort)
            .skip(startIndex)
            .limit(limitNum);

        // Count Documents
        const total = await Violation.countDocuments(queryObj);

        res.status(200).json({
            success: true,
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
            data: violations
        });

    } catch (error) {
        console.error(`Get Violations Error: ${error.message}`);
        res.status(500).json({ message: 'Server error fetching violations pipeline' });
    }
};

// @desc    Get single violation details
// @route   GET /api/violations/:id
// @access  Private (Admins & Viewers)
exports.getViolationById = async (req, res) => {
    try {
        const violation = await Violation.findById(req.params.id);

        if (!violation) {
            return res.status(404).json({ message: 'Violation record not found' });
        }

        res.status(200).json({
            success: true,
            data: violation
        });
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Invalid format for Violation ID' });
        }
        res.status(500).json({ message: 'Server error retrieving single violation' });
    }
};

// @desc    Update violation status / details
// @route   PATCH /api/violations/:id
// @access  Private (Admin Only)
exports.updateViolation = async (req, res) => {
    try {
        const { status, notes, severity } = req.body;

        let violation = await Violation.findById(req.params.id);

        if (!violation) {
            return res.status(404).json({ message: 'Violation record not found' });
        }

        // Validation against invalid schema types explicitly
        if (status && !['pending', 'resolved', 'false_positive'].includes(status)) {
             return res.status(400).json({ message: 'Invalid status type. Must be pending, resolved, or false_positive' });
        }

        if (severity && !['low', 'medium', 'high', 'critical'].includes(severity)) {
             return res.status(400).json({ message: 'Invalid severity type' });
        }

        // Mutation updates
        if (status) violation.status = status;
        if (notes !== undefined) violation.notes = notes;
        if (severity) violation.severity = severity;

        await violation.save();

        res.status(200).json({
            success: true,
            message: 'Violation updated successfully',
            data: violation
        });

    } catch (error) {
        console.error(`Update Violation Error: ${error.message}`);
        if (error.kind === 'ObjectId') {
             return res.status(404).json({ message: 'Invalid format for Violation ID' });
        }
        res.status(500).json({ message: 'Server error while modifying violation record' });
    }
};

// @desc    Delete violation
// @route   DELETE /api/violations/:id
// @access  Private (Admin Only)
exports.deleteViolation = async (req, res) => {
    try {
        const violation = await Violation.findById(req.params.id);

        if (!violation) {
             return res.status(404).json({ message: 'Violation record not found' });
        }

        await violation.deleteOne();

        res.status(200).json({
             success: true,
             message: 'Violation removed permanently'
        });
    } catch (error) {
        if (error.kind === 'ObjectId') {
             return res.status(404).json({ message: 'Invalid format for Violation ID' });
        }
        res.status(500).json({ message: 'Server error while erasing violation' });
    }
};

// @desc    Optional Advanced: Bulk Update Violations
// @route   PATCH /api/violations/bulk/update
// @access  Private (Admin Only)
exports.bulkUpdateViolations = async (req, res) => {
    try {
        const { ids, status, notes } = req.body;

        // Need an array of IDs
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: 'Please provide an array of violation IDs' });
        }

        let updateFields = {};
        if (status) updateFields.status = status;
        if (notes !== undefined) updateFields.notes = notes;

        const result = await Violation.updateMany(
            { _id: { $in: ids } },
            { $set: updateFields }
        );

        res.status(200).json({
            success: true,
            message: `Successfully resolved ${result.modifiedCount} violation clusters.`,
            modifiedCount: result.modifiedCount
        });
        
    } catch (error) {
        console.error(`Bulk Update Error: ${error}`);
        res.status(500).json({ message: 'Server Error executing bulk mutations.' });
    }
};
