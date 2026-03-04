const db = require('../config/db');

const Request = {
    findAll: async () => {
        const [rows] = await db.execute(`
            SELECT r.*, u.name as requester_name 
            FROM requests r 
            JOIN users u ON r.user_id = u.id 
            ORDER BY 
                CASE r.urgency_level 
                    WHEN 'Critical' THEN 1 
                    WHEN 'Essential' THEN 2 
                    ELSE 3 
                END, 
                r.created_at DESC
        `);
        return rows;
    },

    create: async ({ user_id, category, description, urgency_level, location_lat, location_lng }) => {
        const [result] = await db.execute(
            `INSERT INTO requests 
            (user_id, category, description, urgency_level, location_lat, location_lng) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [user_id, category, description, urgency_level || 'Support', location_lat || null, location_lng || null]
        );
        return { id: result.insertId };
    },

    updateStatus: async (id, status) => {
        await db.execute('UPDATE requests SET status = ? WHERE id = ?', [status, id]);
    }
};

module.exports = Request;
