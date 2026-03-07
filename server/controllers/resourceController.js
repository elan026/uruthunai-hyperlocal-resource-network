const Resource = require('../models/resourceModel');
const { validateRequiredFields } = require('../utils/helpers');

// GET /api/resources
exports.getAllResources = async (req, res, next) => {
    try {
        const { minLat, maxLat, minLng, maxLng } = req.query;
        const resources = await Resource.findAll({ minLat, maxLat, minLng, maxLng });
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

        // Emit real-time update
        const io = req.app.get('io');
        if (io && req.body.location_lat && req.body.location_lng) {
            // Apply similar privacy protection offset before emitting
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
                status: 'Available',
                created_at: new Date()
            });
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
