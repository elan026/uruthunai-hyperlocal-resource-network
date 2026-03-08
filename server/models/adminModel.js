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

    static async updateVerificationStatus(requestId, status, userId, newType) {
        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();
            await conn.execute('UPDATE verification_requests SET status = ? WHERE id = ?', [status, requestId]);
            if (status === 'Approved' && newType) {
                await conn.execute(
                    'UPDATE users SET user_type = ?, verification_status = "verified" WHERE id = ?',
                    [newType, userId]
                );
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
}

module.exports = AdminModel;
