const db = require('../config/db');

const Resource = {
    findAll: async ({ minLat, maxLat, minLng, maxLng } = {}) => {
        let query = `
            SELECT r.*, u.name as provider_name, u.role as provider_role, u.trust_score as provider_trust_score 
            FROM resources r 
            JOIN users u ON r.user_id = u.id 
            WHERE r.visibility_status = 'visible'
        `;
        const params = [];

        if (minLat && maxLat && minLng && maxLng) {
            query += ' AND r.location_lat BETWEEN ? AND ? AND r.location_lng BETWEEN ? AND ?';
            params.push(minLat, maxLat, minLng, maxLng);
        }

        query += ' ORDER BY r.created_at DESC';

        const [rows] = await db.execute(query, params);
        return rows;
    },

    findById: async (id) => {
        const [rows] = await db.execute(`
            SELECT r.*, u.name as provider_name, u.role as provider_role, u.trust_score as provider_trust_score 
            FROM resources r 
            JOIN users u ON r.user_id = u.id 
            WHERE r.id = ?
        `, [id]);
        return rows[0] || null;
    },

    create: async ({ user_id, category, title, description, availability_duration, is_emergency, location_lat, location_lng }) => {
        const [result] = await db.execute(
            `INSERT INTO resources 
            (user_id, category, title, description, availability_duration, is_emergency, location_lat, location_lng) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [user_id, category, title, description || '', availability_duration || '', is_emergency || false, location_lat || null, location_lng || null]
        );
        return { id: result.insertId };
    },

    updateStatus: async (id, status) => {
        await db.execute('UPDATE resources SET status = ? WHERE id = ?', [status, id]);
    }
};

module.exports = Resource;
