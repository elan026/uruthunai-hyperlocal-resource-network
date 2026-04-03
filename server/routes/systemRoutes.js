const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/system/emergency
router.get('/emergency', async (req, res, next) => {
    try {
        const [rows] = await db.execute('SELECT setting_key, setting_value FROM system_settings WHERE setting_key IN ("is_emergency_active", "emergency_title", "emergency_message")');
        let isActive = false;
        let title = '';
        let message = '';
        
        rows.forEach(r => {
            if (r.setting_key === 'is_emergency_active') isActive = r.setting_value === 'true';
            if (r.setting_key === 'emergency_title') title = r.setting_value;
            if (r.setting_key === 'emergency_message') message = r.setting_value;
        });

        res.json({ isEmergency: isActive, title, message });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
