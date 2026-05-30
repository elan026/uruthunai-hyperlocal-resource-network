const db = require('../config/db');

class AdminModel {
    static async getDashboardStats() {
        const queries = [
            db.execute('SELECT COUNT(*) as count FROM users WHERE role="user"'),
            db.execute('SELECT COUNT(*) as count FROM requests WHERE status="Open"'),
            db.execute('SELECT COUNT(*) as count FROM resources WHERE status="Available"'),
            db.execute('SELECT COUNT(*) as count FROM reports WHERE status="Pending"'),
            db.execute('SELECT COUNT(*) as count FROM alerts WHERE is_active=TRUE'),
            db.execute('SELECT COUNT(*) as count FROM verification_requests WHERE status="Pending"'),
            db.execute('SELECT COUNT(*) as count FROM requests WHERE status="Fulfilled"'),
            db.execute('SELECT COUNT(*) as count FROM resources WHERE status="Claimed"'),
            db.execute('SELECT COUNT(*) as count FROM users WHERE verification_status="verified"'),
        ];

        const [
            [users], [openRequests], [availableResources], [reports],
            [activeAlerts], [pendingVerifications], [fulfilledRequests],
            [claimedResources], [verifiedUsers]
        ] = await Promise.all(queries);

        return {
            users: users[0].count,
            requests: openRequests[0].count,
            resources: availableResources[0].count,
            reports: reports[0].count,
            activeAlerts: activeAlerts[0].count,
            pendingVerifications: pendingVerifications[0].count,
            fulfilledRequests: fulfilledRequests[0].count,
            claimedResources: claimedResources[0].count,
            verifiedUsers: verifiedUsers[0].count,
        };
    }

    // ─── User Management ────────────────────────
    static async getAllUsers() {
        const [rows] = await db.execute(`
            SELECT id, phone_number, name, area_code, role, user_type,
                   trust_score, verification_status, created_at
            FROM users
            ORDER BY created_at DESC
        `);
        return rows;
    }

    static async getUserDetail(userId) {
        const [userRows] = await db.execute('SELECT * FROM users WHERE id = ?', [userId]);
        if (!userRows[0]) return null;

        const [resources] = await db.execute(
            'SELECT id, category, title, status, created_at FROM resources WHERE user_id = ? ORDER BY created_at DESC LIMIT 10', [userId]
        );
        const [requests] = await db.execute(
            'SELECT id, category, description, urgency_level, status, created_at FROM requests WHERE user_id = ? ORDER BY created_at DESC LIMIT 10', [userId]
        );
        const [reports] = await db.execute(
            'SELECT id, reason, status, created_at FROM reports WHERE reported_user_id = ? ORDER BY created_at DESC', [userId]
        );

        const user = userRows[0];
        delete user.password;
        return { ...user, resources, requests, reports };
    }

    static async updateUserTrust(userId, delta) {
        await db.execute(
            'UPDATE users SET trust_score = GREATEST(0, LEAST(100, trust_score + ?)) WHERE id = ?',
            [delta, userId]
        );
    }

    static async banUser(userId) {
        await db.execute(
            'UPDATE users SET verification_status = "banned", trust_score = 0 WHERE id = ?',
            [userId]
        );
    }

    static async unbanUser(userId) {
        await db.execute(
            'UPDATE users SET verification_status = "unverified", trust_score = 30 WHERE id = ?',
            [userId]
        );
    }

    // ─── Activity Logs ──────────────────────────
    static async getRecentActivity(limit = 50) {
        // Union of recent resources, requests, and reports
        const limitStr = parseInt(limit, 10);
        const [rows] = await db.execute(`
            SELECT * FROM (
                SELECT 'resource' as event_type, r.id, r.title as detail, r.category, r.status, r.created_at, u.name as user_name, u.id as user_id
                FROM resources r JOIN users u ON r.user_id = u.id
                ORDER BY r.created_at DESC LIMIT ${limitStr}
            ) t1
            UNION ALL
            SELECT * FROM (
                SELECT 'request' as event_type, rq.id, rq.description as detail, rq.category, rq.status, rq.created_at, u.name as user_name, u.id as user_id
                FROM requests rq JOIN users u ON rq.user_id = u.id
                ORDER BY rq.created_at DESC LIMIT ${limitStr}
            ) t2
            UNION ALL
            SELECT * FROM (
                SELECT 'report' as event_type, rp.id, rp.reason as detail, 'Moderation' as category, rp.status, rp.created_at, u.name as user_name, u.id as user_id
                FROM reports rp JOIN users u ON rp.reported_by = u.id
                ORDER BY rp.created_at DESC LIMIT ${limitStr}
            ) t3
            ORDER BY created_at DESC
            LIMIT ${limitStr}
        `);
        return rows;
    }

    // ─── Moderation ─────────────────────────────
    static async getActivityAuditLog() {
        const [rows] = await db.execute(`
            SELECT a.id, a.request_id, a.user_id, a.action, a.created_at,
                   u.name as user_name, u.role, r.category as request_category, r.area_name, r.sla_warning
            FROM request_activities a
            JOIN users u ON a.user_id = u.id
            JOIN requests r ON a.request_id = r.id
            ORDER BY a.created_at DESC
        `);
        return rows;
    }
    static async getPendingReports() {
        const [rows] = await db.execute(`
            SELECT r.*, u.name as reported_user_name, u.phone_number as reported_user_phone,
                   u.trust_score as reported_user_trust,
                   reporter.name as reporter_name
            FROM reports r
            LEFT JOIN users u ON r.reported_user_id = u.id
            LEFT JOIN users reporter ON r.reported_by = reporter.id
            WHERE r.status = 'Pending'
            ORDER BY r.created_at ASC
        `);
        return rows;
    }

    static async getAllReports() {
        const [rows] = await db.execute(`
            SELECT r.*, u.name as reported_user_name,
                   reporter.name as reporter_name
            FROM reports r
            LEFT JOIN users u ON r.reported_user_id = u.id
            LEFT JOIN users reporter ON r.reported_by = reporter.id
            ORDER BY r.created_at DESC
            LIMIT 100
        `);
        return rows;
    }

    static async getPendingVerifications() {
        const [rows] = await db.execute(`
            SELECT v.*, u.name as user_name, u.phone_number as phone, u.trust_score,
                   u.user_type as current_type, u.verification_status
            FROM verification_requests v
            JOIN users u ON v.user_id = u.id
            WHERE v.status = 'Pending'
            ORDER BY v.created_at ASC
        `);
        return rows;
    }

    static async updateVerificationStatus(requestId, status, userId, newType, method = 'TRUST_SCORE') {
        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();
            if (requestId) {
                await conn.execute('UPDATE verification_requests SET status = ? WHERE id = ?', [status, requestId]);
            }
            if (status === 'Approved') {
                if (newType) {
                    await conn.execute(
                        'UPDATE users SET user_type = ?, verification_status = "verified", verification_method = ? WHERE id = ?',
                        [newType, method, userId]
                    );
                } else {
                    await conn.execute(
                        'UPDATE users SET verification_status = "verified", verification_method = ? WHERE id = ?',
                        [method, userId]
                    );
                }
            }
            await conn.commit();
            return true;
        } catch (e) {
            await conn.rollback();
            throw e;
        } finally {
            conn.release();
        }
    }

    static async performModerationAction(reportId, action, reportedUserId) {
        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();
            await conn.execute('UPDATE reports SET status="Reviewed" WHERE id=?', [reportId]);
            if (action === 'suspend' && reportedUserId) {
                await conn.execute('UPDATE users SET trust_score = GREATEST(0, trust_score - 20) WHERE id=?', [reportedUserId]);
            }
            if (action === 'ban' && reportedUserId) {
                await conn.execute('UPDATE users SET verification_status = "banned", trust_score = 0 WHERE id=?', [reportedUserId]);
            }
            await conn.commit();
        } catch (e) {
            await conn.rollback();
            throw e;
        } finally {
            conn.release();
        }
    }

    // ─── System Health ──────────────────────────
    static async getSystemHealth() {
        const [dbStatus] = await db.execute('SELECT 1 as ok');
        const [tableInfo] = await db.execute(`
            SELECT table_name, table_rows, ROUND(data_length/1024, 2) as data_kb
            FROM information_schema.tables
            WHERE table_schema = DATABASE()
        `);
        return {
            database: dbStatus[0]?.ok === 1 ? 'healthy' : 'degraded',
            tables: tableInfo,
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
        };
    }

    // ─── Volunteer Matchmaking Recommender ──────
    static async recommendVolunteers(requestId) {
        // 1. Fetch request details
        const [reqRows] = await db.execute('SELECT category, location_lat, location_lng FROM requests WHERE id = ?', [requestId]);
        if (reqRows.length === 0) return [];
        const request = reqRows[0];
        
        // 2. Fetch all potential volunteers
        const [volunteers] = await db.execute(`
            SELECT id, name, area_code, pincode, area_name, user_type, trust_score, skills, verification_status
            FROM users
            WHERE user_type IN ('volunteer', 'community_activist', 'organization', 'ngo')
              AND verification_status != 'banned'
        `);
        
        const LOCATION_COORDINATES = {
            '638001': { lat: 11.3410, lng: 77.7172 }, // Erode City
            '638104': { lat: 11.2721, lng: 77.7942 }, // Modakkurichi
            '638401': { lat: 11.5034, lng: 77.2444 }, // Sathyamangalam
            '638461': { lat: 11.7825, lng: 77.2917 }, // Thalavadi
            '636001': { lat: 11.6643, lng: 78.1460 }, // Salem City
            '636601': { lat: 11.7753, lng: 78.2093 }, // Yercaud
            '641001': { lat: 11.0168, lng: 76.9558 }, // Coimbatore City
            '641301': { lat: 10.3242, lng: 76.9744 }, // Valparai
        };
        
        const haversine = (lat1, lon1, lat2, lon2) => {
            const R = 6371; // km
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a = Math.sin(dLat / 2) ** 2 +
                      cos(lat1 * Math.PI / 180) * cos(lat2 * Math.PI / 180) *
                      Math.sin(dLon / 2) ** 2;
            return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        };
        
        const cos = Math.cos;
        
        const scoredVolunteers = volunteers.map(vol => {
            let score = 0;
            let distance = null;
            
            // Extract pincode (either directly or from area_code)
            let pin = vol.pincode;
            if (!pin && vol.area_code) {
                const match = vol.area_code.match(/^(\d{6})/);
                if (match) pin = match[1];
            }
            
            // Compute Distance Score (Max 40 points)
            if (pin && LOCATION_COORDINATES[pin] && request.location_lat && request.location_lng) {
                const volCoords = LOCATION_COORDINATES[pin];
                distance = haversine(
                    parseFloat(request.location_lat), 
                    parseFloat(request.location_lng), 
                    volCoords.lat, 
                    volCoords.lng
                );
                
                if (distance <= 2) score += 40;
                else if (distance <= 5) score += 30;
                else if (distance <= 10) score += 20;
                else if (distance <= 20) score += 10;
            } else {
                score += 15; // default fallback score if no location mapping
            }
            
            // Compute Trust Score (Max 30 points)
            const trust = vol.trust_score || 50;
            score += Math.round(trust * 0.3);
            
            // Compute Skills Score (Max 30 points)
            let skillsList = [];
            if (vol.skills) {
                try {
                    const parsed = JSON.parse(vol.skills);
                    skillsList = Array.isArray(parsed) ? parsed : [vol.skills];
                } catch (e) {
                    skillsList = vol.skills.split(',').map(s => s.trim().toLowerCase());
                }
            }
            
            const categoryLower = (request.category || '').toLowerCase();
            let skillsMatch = false;
            
            const categoryKeywords = {
                'medical': ['medical', 'doctor', 'first aid', 'cpr', 'nurse', 'insulin', 'health', 'ambulance', 'hospital', 'medic'],
                'food': ['food', 'water', 'ration', 'cooking', 'supply', 'rice', 'meal', 'meals'],
                'water': ['water', 'drink', 'drinking', 'ration', 'supply'],
                'rescue': ['rescue', 'boat', 'swim', 'swimmer', 'driver', 'transport', 'vehicle', 'lift', 'climb'],
                'power': ['power', 'charge', 'electric', 'generator', 'battery', 'electricity', 'light'],
                'shelter': ['shelter', 'accommodation', 'home', 'housing', 'stay', 'room']
            };
            
            let matchedKeywords = [];
            for (const [key, keywords] of Object.entries(categoryKeywords)) {
                if (categoryLower.includes(key)) {
                    matchedKeywords = matchedKeywords.concat(keywords);
                }
            }
            
            if (matchedKeywords.length > 0) {
                skillsMatch = skillsList.some(skill => 
                    matchedKeywords.some(kw => typeof skill === 'string' && skill.toLowerCase().includes(kw))
                );
            }
            
            if (skillsMatch) {
                score += 30;
            } else if (skillsList.length > 0) {
                score += 15; // some skills but no direct category match
            }
            
            return {
                id: vol.id,
                name: vol.name,
                user_type: vol.user_type,
                trust_score: vol.trust_score,
                skills: skillsList,
                distance: distance !== null ? parseFloat(distance.toFixed(1)) : null,
                match_score: Math.min(100, score)
            };
        });
        
        // Sort by match score descending
        return scoredVolunteers
            .sort((a, b) => b.match_score - a.match_score)
            .slice(0, 5);
    }
}

module.exports = AdminModel;
