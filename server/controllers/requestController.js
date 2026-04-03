const Request = require('../models/requestModel');
const { validateRequiredFields } = require('../utils/helpers');
const db = require('../config/db');

// Reuse trust logic algorithm
function updateTrustScoreConfig(user_score) {
    let confidence_level = 'LOW';
    if (user_score >= 80) confidence_level = 'HIGH';
    else if (user_score >= 40) confidence_level = 'MEDIUM';
    
    return confidence_level;
}

// GET /api/requests
exports.getAllRequests = async (req, res, next) => {
    try {
        const [rows] = await db.execute('SELECT setting_value FROM system_settings WHERE setting_key = "is_emergency_active"');
        const isEmergency = rows.length > 0 ? rows[0].setting_value === 'true' : false;

        let requests = await Request.findAll();
        
        // Data Flow Restriction: Send only High & Critical items during active emergencies
        if (isEmergency) {
            requests = requests.filter(r => r.priority === 'CRITICAL' || r.priority === 'HIGH');
        }
        
        res.json(requests);
    } catch (err) {
        next(err);
    }
};

// POST /api/requests
exports.createRequest = async (req, res, next) => {
    try {
        const { user_id, category, description, priority } = req.body;
        const missing = validateRequiredFields({ user_id, category, description });
        if (missing) {
            return res.status(400).json({ error: `Missing required field: ${missing}` });
        }

        const result = await Request.create(req.body);

        try {
            const io = req.app.get('io');
            if (io && req.body.location_lat && req.body.location_lng) {
                const User = require('../models/userModel');
                const user = await User.findById(user_id);
                // In production, emit to specific area room.
                // For MVP, global emit
                io.emit('new_request_created', {
                    id: result.id,
                    type: 'request',
                    category,
                    title_or_description: description,
                    priority: priority || 'LOW',
                    location_lat: req.body.location_lat,
                    location_lng: req.body.location_lng,
                    user_name: user?.name || 'Community Member',
                    status: 'OPEN',
                    created_at: new Date().toISOString()
                });
            }
        } catch (socketErr) {
            console.error('Socket emit failed (non-fatal):', socketErr.message);
        }

        res.status(201).json({ message: 'Request created successfully', id: result.id });
    } catch (err) {
        next(err);
    }
};

// PATCH /api/requests/:id/state
exports.updateRequestState = async (req, res, next) => {
    try {
        const { newState, user_id } = req.body; // user_id is the volunteer accepting/completing
        if (!['OPEN', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'HIDDEN'].includes(newState)) {
            return res.status(400).json({ error: 'Invalid state transition.' });
        }
        
        const reqItem = await Request.findById(req.params.id);
        if (!reqItem) return res.status(404).json({error: 'Request not found'});

        await Request.updateState(req.params.id, newState, newState === 'ACCEPTED' ? user_id : reqItem.assigned_to_user_id);

        if (newState === 'COMPLETED' && reqItem.assigned_to_user_id) {
            // Apply Trust Score Bump (+5)
            await db.execute('UPDATE users SET trust_score = trust_score + 5 WHERE id = ?', [reqItem.assigned_to_user_id]);
            const [uRows] = await db.execute('SELECT trust_score FROM users WHERE id = ?', [reqItem.assigned_to_user_id]);
            const newScore = uRows[0].trust_score;
            const newConfLevel = updateTrustScoreConfig(newScore);
            await db.execute('UPDATE users SET confidence_level = ? WHERE id = ?', [newConfLevel, reqItem.assigned_to_user_id]);
        }

        // Emit state change update
        try {
            const io = req.app.get('io');
            if (io) {
                let assignedName = null;
                if (user_id) {
                    const User = require('../models/userModel');
                    const u = await User.findById(newState === 'ACCEPTED'? user_id : reqItem.assigned_to_user_id);
                    assignedName = u?.name;
                }
                io.emit('request_status_update', { id: req.params.id, status: newState, assigned_to_name: assignedName });
            }
        } catch (socketErr) {
            console.error('Socket emit failed:', socketErr.message);
        }

        res.json({ message: `Request state transitioned to ${newState}` });
    } catch (err) {
        next(err);
    }
};

// POST /api/requests/:id/report
exports.reportRequest = async (req, res, next) => {
    try {
        const { reason, user_id } = req.body;
        const missing = validateRequiredFields({ user_id, reason });
        if (missing) return res.status(400).json({ error: `Missing required field: ${missing}` });

        const reqItem = await Request.findById(req.params.id);
        if(!reqItem) return res.status(404).json({error: 'Request not found'});

        await db.execute(
            'INSERT INTO item_reports (item_id, item_type, reported_by_user_id, reason) VALUES (?, ?, ?, ?)',
            [req.params.id, 'REQUEST', user_id, reason]
        );

        const newCount = await Request.incrementReport(req.params.id);
        
        // Auto-Hide logic
        if (newCount >= 3) {
            await Request.updateState(req.params.id, 'HIDDEN');
            
            // Deduct Trust Score (-10)
            await db.execute('UPDATE users SET trust_score = GREATEST(0, trust_score - 10) WHERE id = ?', [reqItem.user_id]);
            const [uRows] = await db.execute('SELECT trust_score FROM users WHERE id = ?', [reqItem.user_id]);
            const newScore = uRows[0].trust_score;
            const newConfLevel = updateTrustScoreConfig(newScore);
            await db.execute('UPDATE users SET confidence_level = ? WHERE id = ?', [newConfLevel, reqItem.user_id]);
            
            const io = req.app.get('io');
            if(io) io.emit('request_hidden', { id: req.params.id });
        }

        res.status(201).json({ message: 'Report submitted successfully' });
    } catch (err) {
        next(err);
    }
};
