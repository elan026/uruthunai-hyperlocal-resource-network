const db = require('../config/db');

exports.getAllAlerts = async (req, res, next) => {
    try {
        const [rows] = await db.execute(`
            SELECT a.*, u.name as admin_name 
            FROM alerts a 
            JOIN users u ON a.admin_id = u.id 
            ORDER BY a.created_at DESC
        `);
        res.json(rows);
    } catch (err) {
        next(err);
    }
};

exports.createAlert = async (req, res, next) => {
    try {
        const { admin_id, alert_type, message } = req.body;

        if (!admin_id || !alert_type || !message) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const [result] = await db.execute(
            `INSERT INTO alerts (admin_id, alert_type, message) VALUES (?, ?, ?)`,
            [admin_id, alert_type, message]
        );

        res.status(201).json({ message: 'Alert created successfully', id: result.insertId });
    } catch (err) {
        next(err);
    }
};

exports.deactivateAlert = async (req, res, next) => {
    try {
        const { id } = req.params;
        await db.execute('UPDATE alerts SET is_active = FALSE WHERE id = ?', [id]);
        res.json({ message: 'Alert deactivated' });
    } catch (err) {
        next(err);
    }
};
