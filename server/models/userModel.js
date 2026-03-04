const db = require('../config/db');

// User-related DB queries
const User = {
    findByPhone: async (phone_number) => {
        const [rows] = await db.execute('SELECT * FROM users WHERE phone_number = ?', [phone_number]);
        return rows[0] || null;
    },

    create: async ({ phone_number, name, area_code, role }) => {
        const [result] = await db.execute(
            'INSERT INTO users (phone_number, name, area_code, role) VALUES (?, ?, ?, ?)',
            [phone_number, name || 'Anonymous', area_code || 'N/A', role || 'Resident']
        );
        return { id: result.insertId, phone_number, name, area_code, role, trust_score: 50 };
    },

    findById: async (id) => {
        const [rows] = await db.execute(
            'SELECT id, phone_number, name, area_code, role, trust_score, created_at FROM users WHERE id = ?',
            [id]
        );
        return rows[0] || null;
    },

    getStats: async (userId) => {
        const [resources] = await db.execute('SELECT COUNT(*) as count FROM resources WHERE user_id = ?', [userId]);
        const [requests] = await db.execute('SELECT COUNT(*) as count FROM requests WHERE user_id = ? AND status = "Fulfilled"', [userId]);
        return {
            resources_posted: resources[0].count,
            requests_fulfilled: requests[0].count
        };
    }
};

module.exports = User;
