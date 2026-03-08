const AdminModel = require('../models/adminModel');
const db = require('../config/db');
const jwt = require('jsonwebtoken');

exports.login = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        // Check admin users table (For simplicity from initDb, phone_number='admin' and pass='admin123')
        const [rows] = await db.execute('SELECT * FROM users WHERE phone_number = ? AND role = "admin"', [username]);

        const adminUser = rows[0];

        if (!adminUser || adminUser.password?.toLowerCase() !== password?.toLowerCase()) {
            return res.status(401).json({ error: 'Invalid admin credentials' });
        }

        const token = jwt.sign(
            { id: adminUser.id, role: adminUser.role },
            process.env.JWT_SECRET || 'uruthunai_admin_secret',
            { expiresIn: '8h' }
        );

        res.json({ message: 'Admin login successful', token, admin: { id: adminUser.id, name: adminUser.name } });
    } catch (err) {
        next(err);
    }
};

exports.getDashboard = async (req, res, next) => {
    try {
        const stats = await AdminModel.getDashboardStats();
        res.json(stats);
    } catch (err) {
        next(err);
    }
};

exports.getReports = async (req, res, next) => {
    try {
        const reports = await AdminModel.getPendingReports();
        res.json(reports);
    } catch (err) {
        next(err);
    }
};

exports.getVerifications = async (req, res, next) => {
    try {
        const checks = await AdminModel.getPendingVerifications();
        res.json(checks);
    } catch (err) {
        next(err);
    }
};

exports.verifyUser = async (req, res, next) => {
    try {
        const { reqId, userId, newType, status } = req.body;
        await AdminModel.updateVerificationStatus(reqId, status, userId, newType);
        res.json({ message: 'User verification updated' });
    } catch (err) {
        next(err);
    }
};

exports.moderateAction = async (req, res, next) => {
    try {
        const { reportId, action, reportedUserId } = req.body;
        await AdminModel.performModerationAction(reportId, action, reportedUserId);
        res.json({ message: 'Moderation applied' });
    } catch (err) {
        next(err);
    }
};

let globalEmergencyState = false;

exports.getEmergencyState = async (req, res, next) => {
    res.json({ isEmergency: globalEmergencyState });
};

exports.activateEmergency = async (req, res, next) => {
    try {
        const { active } = req.body;
        globalEmergencyState = active;
        // Wait: In a real app we'd broadcast this via Socket.io or save to a settings DB table.
        // For now this serves as mock persistence.
        res.json({ message: `Emergency mode ${active ? 'Activated' : 'Disabled'}`, isEmergency: globalEmergencyState });
    } catch (err) {
        next(err);
    }
};
