const db = require('../config/db');

class AdminModel {
    static async getDashboardStats() {
        const queries = [
            db.execute('SELECT COUNT(*) as count FROM users WHERE role="user"'),
            db.execute('SELECT COUNT(*) as count FROM requests WHERE status="Open"'),
            db.execute('SELECT COUNT(*) as count FROM resources WHERE status="Available"'),
            db.execute('SELECT COUNT(*) as count FROM reports WHERE status="Pending"')
        ];

        const [[users], [requests], [resources], [reports]] = await Promise.all(queries);

        return {
            users: users[0].count,
            requests: requests[0].count,
            resources: resources[0].count,
            reports: reports[0].count
        };
    }

    static async getPendingReports() {
        const [rows] = await db.execute(`
            SELECT r.*, u.name as reported_user_name, u.phone_number as reported_user_phone
            FROM reports r
            LEFT JOIN users u ON r.reported_user_id = u.id
            WHERE r.status = 'Pending'
            ORDER BY r.created_at ASC
        `);
        return rows;
    }

    static async getPendingVerifications() {
        const [rows] = await db.execute(`
            SELECT v.*, u.name as user_name, u.phone_number as phone, u.trust_score
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

            await conn.execute(
                'UPDATE verification_requests SET status = ? WHERE id = ?',
                [status, requestId]
            );

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
        // Simple moderation logic
        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();

            await conn.execute('UPDATE reports SET status="Reviewed" WHERE id=?', [reportId]);

            if (action === 'suspend' && reportedUserId) {
                // To keep it simple, we just set verification to unverified or change trust_score
                await conn.execute('UPDATE users SET trust_score = trust_score - 20 WHERE id=?', [reportedUserId]);
            }

            await conn.commit();
        } catch (e) {
            await conn.rollback();
            throw e;
        } finally {
            conn.release();
        }
    }
}

module.exports = AdminModel;
