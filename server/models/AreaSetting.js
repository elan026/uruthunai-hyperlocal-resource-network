const pool = require('../config/db');

class AreaSetting {
    static async getSettings(area_code) {
        const [rows] = await pool.query(`SELECT * FROM Area_Settings WHERE area_code = ?`, [area_code]);
        if (rows.length === 0) {
            // Create default
            await pool.query(`INSERT INTO Area_Settings (area_code, is_emergency_mode) VALUES (?, FALSE)`, [area_code]);
            return { area_code, is_emergency_mode: false, emergency_reason: null };
        }
        return rows[0];
    }

    static async setEmergencyMode(area_code, is_mode, reason = null) {
        await pool.query(
            `INSERT INTO Area_Settings (area_code, is_emergency_mode, emergency_reason) 
             VALUES (?, ?, ?) 
             ON DUPLICATE KEY UPDATE is_emergency_mode = VALUES(is_emergency_mode), emergency_reason = VALUES(emergency_reason)`,
            [area_code, is_mode, reason]
        );
    }
}

module.exports = AreaSetting;
