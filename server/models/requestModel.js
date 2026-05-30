const db = require('../config/db');

const Request = {
    findAll: async () => {
        const [rows] = await db.execute(`
            SELECT r.*, u.name as requester_name, u.confidence_level, u.trust_score, au.name as assigned_to_name
            FROM requests r 
            JOIN users u ON r.user_id = u.id 
            LEFT JOIN users au ON r.assigned_to_user_id = au.id
            WHERE r.status != 'HIDDEN'
            ORDER BY 
                CASE r.priority 
                    WHEN 'CRITICAL' THEN 1 
                    WHEN 'HIGH' THEN 2 
                    WHEN 'MEDIUM' THEN 3
                    ELSE 4 
                END, 
                r.created_at DESC
        `);
        return rows;
    },

    findById: async (id) => {
        const [rows] = await db.execute('SELECT * FROM requests WHERE id = ?', [id]);
        return rows[0];
    },

    create: async ({ user_id, category, description, priority, location_lat, location_lng, quantity_needed, is_shelter_needed, is_path_reachable, emergency_type, area_name, location_type }) => {
        const [result] = await db.execute(
            `INSERT INTO requests 
            (user_id, category, description, priority, location_lat, location_lng, quantity_needed, is_shelter_needed, is_path_reachable, emergency_type, area_name, location_type, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'OPEN')`,
            [
                user_id, category, description, priority || 'LOW', 
                location_lat || null, location_lng || null, 
                quantity_needed || null, is_shelter_needed || false, 
                is_path_reachable !== undefined ? is_path_reachable : true, 
                emergency_type || null, area_name || null, location_type || 'CITY'
            ]
        );
        return { id: result.insertId };
    },

    updateState: async (id, status, assigned_to_user_id = null) => {
        const clearSla = (status !== 'ACCEPTED' && status !== 'ACKNOWLEDGED') ? ', sla_warning = NULL' : '';
        if (assigned_to_user_id) {
            await db.execute(`UPDATE requests SET status = ?, assigned_to_user_id = ?${clearSla} WHERE id = ?`, [status, assigned_to_user_id, id]);
        } else {
            await db.execute(`UPDATE requests SET status = ?${clearSla} WHERE id = ?`, [status, id]);
        }
    },
    
    incrementReport: async (id) => {
        await db.execute('UPDATE requests SET report_count = report_count + 1 WHERE id = ?', [id]);
        const [rows] = await db.execute('SELECT report_count FROM requests WHERE id = ?', [id]);
        return rows[0].report_count;
    }
};

module.exports = Request;
