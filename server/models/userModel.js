const db = require('../config/db');

// User-related DB queries
const User = {
    findByPhone: async (phone_number) => {
        const [rows] = await db.execute('SELECT * FROM users WHERE phone_number = ?', [phone_number]);
        return rows[0] || null;
    },

    create: async ({ phone_number, name, area_code, role, user_type, skills }) => {
        const [result] = await db.execute(
            'INSERT INTO users (phone_number, name, area_code, role, user_type, skills) VALUES (?, ?, ?, ?, ?, ?)',
            [
                phone_number,
                name || 'Anonymous',
                area_code || 'N/A',
                role || 'user',
                user_type || 'resident',
                skills || null
            ]
        );
        return {
            id: result.insertId,
            phone_number,
            name,
            area_code,
            role: role || 'user',
            user_type: user_type || 'resident',
            skills,
            trust_score: 50,
            verification_status: 'unverified'
        };
    },

    findById: async (id) => {
        const [rows] = await db.execute(
            'SELECT id, phone_number, name, area_code, role, user_type, skills, verification_status, trust_score, created_at FROM users WHERE id = ?',
            [id]
        );
        return rows[0] || null;
    },

    update: async (id, { name, area_code, user_type, skills }) => {
        const fields = [];
        const values = [];

        if (name !== undefined) { fields.push('name = ?'); values.push(name); }
        if (area_code !== undefined) { fields.push('area_code = ?'); values.push(area_code); }
        if (user_type !== undefined) { fields.push('user_type = ?'); values.push(user_type); }
        if (skills !== undefined) { fields.push('skills = ?'); values.push(skills); }

        if (fields.length === 0) return true;

        values.push(id);

        await db.execute(
            `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
            values
        );
        return true;
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
