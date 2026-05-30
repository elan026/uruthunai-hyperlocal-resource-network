const db = require('../config/db');

exports.getGlobalStats = async (req, res, next) => {
    try {
        const [[{ count: waterCount }]] = await db.execute('SELECT SUM(quantity) as count FROM resources WHERE category = "Water" AND status = "Available"');
        const [[{ count: medicalCount }]] = await db.execute('SELECT SUM(quantity) as count FROM resources WHERE category = "Medical" AND status = "Available"');
        const [[{ count: requestsCount }]] = await db.execute('SELECT COUNT(*) as count FROM requests WHERE status != "Completed"');
        const [[{ count: volunteerCount }]] = await db.execute('SELECT COUNT(*) as count FROM users WHERE user_type IN ("volunteer", "ngo", "organization")');

        res.json({
            waterCount: waterCount || 0,
            medicalCount: medicalCount || 0,
            requestsCount: requestsCount || 0,
            volunteerCount: volunteerCount || 0
        });
    } catch (err) {
        next(err);
    }
};

exports.getEmergencyStatus = async (req, res, next) => {
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

        res.json({ 
            active: isActive, 
            info: { title, message } 
        });
    } catch (err) {
        next(err);
    }
};
