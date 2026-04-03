const Resource = require('../models/resourceModel');
const { validateRequiredFields } = require('../utils/helpers');
const db = require('../config/db');

// GET /api/resources
exports.getAllResources = async (req, res, next) => {
    try {
        const [rows] = await db.execute('SELECT setting_value FROM system_settings WHERE setting_key = "is_emergency_active"');
        const isEmergency = rows.length > 0 ? rows[0].setting_value === 'true' : false;

        const { minLat, maxLat, minLng, maxLng } = req.query;
        let resources = await Resource.findAll({ minLat, maxLat, minLng, maxLng });

        if (isEmergency) {
            resources = resources.filter(r => r.is_emergency || ['Medical', 'Shelter', 'Water'].includes(r.category));
        }

        res.json(resources);
    } catch (err) {
        next(err);
    }
};

// GET /api/resources/:id
exports.getResourceById = async (req, res, next) => {
    try {
        const resource = await Resource.findById(req.params.id);
        if (!resource) {
            return res.status(404).json({ error: 'Resource not found' });
        }
        res.json(resource);
    } catch (err) {
        next(err);
    }
};

// POST /api/resources
exports.createResource = async (req, res, next) => {
    try {
        const { user_id, category, title } = req.body;
        const missing = validateRequiredFields({ user_id, category, title });
        if (missing) {
            return res.status(400).json({ error: `Missing required field: ${missing}` });
        }

        const result = await Resource.create(req.body);

        // Emit real-time update with user info (fire-and-forget, never crash)
        try {
            const io = req.app.get('io');
            if (io && req.body.location_lat && req.body.location_lng) {
                const User = require('../models/userModel');
                const user = await User.findById(user_id);
                const lat = parseFloat((parseFloat(req.body.location_lat) + (Math.random() - 0.5) * 0.001).toFixed(4));
                const lng = parseFloat((parseFloat(req.body.location_lng) + (Math.random() - 0.5) * 0.001).toFixed(4));

                io.emit('new_listing_created', {
                    id: result.id,
                    type: 'offer',
                    category,
                    title_or_description: title,
                    is_emergency: req.body.is_emergency || false,
                    location_lat: lat,
                    location_lng: lng,
                    user_name: user?.name || 'Community Member',
                    status: 'Available',
                    created_at: new Date().toISOString()
                });
            }
        } catch (socketErr) {
            console.error('Socket emit failed (non-fatal):', socketErr.message);
        }

        res.status(201).json({ message: 'Resource created successfully', id: result.id });
    } catch (err) {
        next(err);
    }
};

// PATCH /api/resources/:id/status
exports.updateResourceStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        if (!['Available', 'Claimed', 'Closed'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status. Must be Available, Claimed, or Closed.' });
        }
        await Resource.updateStatus(req.params.id, status);
        res.json({ message: 'Resource status updated' });
    } catch (err) {
        next(err);
    }
};

// POST /api/resources/:id/report
exports.reportResource = async (req, res, next) => {
    try {
        const resourceId = req.params.id;
        const { reason } = req.body;
        const reporterId = req.user.id; // from protect middleware

        // Insert report
        const db = require('../config/db');
        await db.execute('INSERT INTO reports (resource_id, reported_by, reason) VALUES (?, ?, ?)', [resourceId, reporterId, reason]);

        // Check report count
        const [rows] = await db.execute('SELECT COUNT(*) as count FROM reports WHERE resource_id = ?', [resourceId]);
        const reportCount = rows[0].count;

        // Threshold-based auto-hide
        if (reportCount >= 5) {
            await db.execute('UPDATE resources SET visibility_status = "hidden" WHERE id = ?', [resourceId]);
            console.log(`Resource ${resourceId} auto-hidden due to ${reportCount} reports.`);
        }

        res.json({ message: 'Resource reported successfully' });
    } catch (err) {
        next(err);
    }
};
