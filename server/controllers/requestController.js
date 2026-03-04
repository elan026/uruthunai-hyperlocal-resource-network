const Request = require('../models/requestModel');
const { validateRequiredFields } = require('../utils/helpers');

// GET /api/requests
exports.getAllRequests = async (req, res, next) => {
    try {
        const requests = await Request.findAll();
        res.json(requests);
    } catch (err) {
        next(err);
    }
};

// POST /api/requests
exports.createRequest = async (req, res, next) => {
    try {
        const { user_id, category, description } = req.body;
        const missing = validateRequiredFields({ user_id, category, description });
        if (missing) {
            return res.status(400).json({ error: `Missing required field: ${missing}` });
        }

        const result = await Request.create(req.body);
        res.status(201).json({ message: 'Request created successfully', id: result.id });
    } catch (err) {
        next(err);
    }
};

// PATCH /api/requests/:id/status
exports.updateRequestStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        if (!['Open', 'In Progress', 'Fulfilled'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status. Must be Open, In Progress, or Fulfilled.' });
        }
        await Request.updateStatus(req.params.id, status);
        res.json({ message: 'Request status updated' });
    } catch (err) {
        next(err);
    }
};
