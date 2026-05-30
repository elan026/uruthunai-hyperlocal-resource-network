const db = require('../config/db');

// User-related DB queries
const User = {
    findByPhone: async (phone_number) => {
        const [rows] = await db.execute('SELECT * FROM users WHERE phone_number = ?', [phone_number]);
        return rows[0] || null;
    },

    findByGoogleId: async (google_id) => {
        const [rows] = await db.execute('SELECT * FROM users WHERE google_id = ?', [google_id]);
        return rows[0] || null;
    },

    findByEmail: async (email) => {
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0] || null;
    },

    create: async ({ phone_number, google_id, email, name, area_code, pincode, area_name, role, user_type, skills, profile_pic }) => {
        const [result] = await db.execute(
            'INSERT INTO users (phone_number, google_id, email, name, area_code, pincode, area_name, role, user_type, skills, profile_pic) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                phone_number || null,
                google_id || null,
                email || null,
                name || 'Anonymous',
                area_code || null,
                pincode || null,
                area_name || null,
                role || 'user',
                user_type || 'resident',
                skills || null,
                profile_pic || null
            ]
        );
        return {
            id: result.insertId,
            phone_number: phone_number || null,
            google_id: google_id || null,
            email: email || null,
            name: name || 'Anonymous',
            area_code: area_code || null,
            pincode: pincode || null,
            area_name: area_name || null,
            role: role || 'user',
            user_type: user_type || 'resident',
            skills: skills || null,
            profile_pic: profile_pic || null,
            trust_score: 50,
            verification_status: 'unverified'
        };
    },

    findById: async (id) => {
        const [rows] = await db.execute(
            'SELECT id, phone_number, google_id, email, name, area_code, pincode, area_name, role, user_type, skills, profile_pic, verification_status, verification_method, trust_score, created_at FROM users WHERE id = ?',
            [id]
        );
        return rows[0] || null;
    },

    update: async (id, { name, area_code, pincode, area_name, user_type, skills, profile_pic, google_id, email }) => {
        const fields = [];
        const values = [];

        if (name !== undefined) { fields.push('name = ?'); values.push(name); }
        if (area_code !== undefined) { fields.push('area_code = ?'); values.push(area_code); }
        if (pincode !== undefined) { fields.push('pincode = ?'); values.push(pincode); }
        if (area_name !== undefined) { fields.push('area_name = ?'); values.push(area_name); }
        if (user_type !== undefined) { fields.push('user_type = ?'); values.push(user_type); }
        if (google_id !== undefined) { fields.push('google_id = ?'); values.push(google_id); }
        if (email !== undefined) { fields.push('email = ?'); values.push(email); }
        if (skills !== undefined) {
            fields.push('skills = ?');
            // skills column is JSON type — sanitize input
            if (!skills || skills === '') {
                values.push(null);
            } else if (typeof skills === 'string') {
                // Convert comma-separated string to JSON array
                try {
                    JSON.parse(skills); // already valid JSON
                    values.push(skills);
                } catch {
                    values.push(JSON.stringify(skills.split(',').map(s => s.trim()).filter(Boolean)));
                }
            } else {
                values.push(JSON.stringify(skills));
            }
        }
        if (profile_pic !== undefined) { fields.push('profile_pic = ?'); values.push(profile_pic); }

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
    },

    delete: async (id) => {
        await db.execute('DELETE FROM users WHERE id = ?', [id]);
        return true;
    },

    findAllVolunteers: async () => {
        const [rows] = await db.execute(`
            SELECT id, name, area_code, pincode, area_name, user_type as role, skills, trust_score, verification_status, created_at 
            FROM users 
            WHERE user_type IN ('volunteer', 'ngo', 'organization')
            ORDER BY trust_score DESC
        `);
        return rows;
    }
};

module.exports = User;
