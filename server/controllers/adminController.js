const AdminModel = require('../models/adminModel');
const db = require('../config/db');
const jwt = require('jsonwebtoken');

exports.login = async (req, res, next) => {
    try {
        const { username, password } = req.body;
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

// ─── User Management ────────────────────────
exports.getUsers = async (req, res, next) => {
    try {
        const users = await AdminModel.getAllUsers();
        res.json(users);
    } catch (err) {
        next(err);
    }
};

exports.getUserDetail = async (req, res, next) => {
    try {
        const user = await AdminModel.getUserDetail(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        next(err);
    }
};

exports.updateUserTrust = async (req, res, next) => {
    try {
        const { delta } = req.body;
        await AdminModel.updateUserTrust(req.params.id, delta);
        res.json({ message: 'Trust score updated' });
    } catch (err) {
        next(err);
    }
};

exports.banUser = async (req, res, next) => {
    try {
        await AdminModel.banUser(req.params.id);
        res.json({ message: 'User banned' });
    } catch (err) {
        next(err);
    }
};

exports.unbanUser = async (req, res, next) => {
    try {
        await AdminModel.unbanUser(req.params.id);
        res.json({ message: 'User unbanned' });
    } catch (err) {
        next(err);
    }
};

// ─── Activity ───────────────────────────────
exports.getActivity = async (req, res, next) => {
    try {
        const activity = await AdminModel.getRecentActivity(50);
        res.json(activity);
    } catch (err) {
        next(err);
    }
};

// ─── Reports ────────────────────────────────
exports.getReports = async (req, res, next) => {
    try {
        const reports = await AdminModel.getPendingReports();
        res.json(reports);
    } catch (err) {
        next(err);
    }
};

exports.getAllReports = async (req, res, next) => {
    try {
        const reports = await AdminModel.getAllReports();
        res.json(reports);
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

// ─── Verification ───────────────────────────
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

// ─── Emergency ──────────────────────────────
exports.getEmergencyState = async (req, res, next) => {
    try {
        const [rows] = await db.execute('SELECT setting_key, setting_value FROM system_settings WHERE setting_key IN ("is_emergency_active", "emergency_title", "emergency_message")');
        let isActive = false;
        let title = '';
        let message = '';
        
        rows.forEach(r => {
            if (r.setting_key === 'is_emergency_active') isActive = r.setting_value === 'true';
            if (r.setting_key === 'emergency_title') title = r.setting_value;
            if (r.setting_key === 'emergency_message') message = r.setting_value;
        });

        res.json({ isEmergency: isActive, title, message });
    } catch (err) {
        next(err);
    }
};

exports.activateEmergency = async (req, res, next) => {
    try {
        const { active, title, message } = req.body;
        const activeStr = active ? 'true' : 'false';
        
        await db.execute(
            'INSERT INTO system_settings (setting_key, setting_value) VALUES ("is_emergency_active", ?) ON DUPLICATE KEY UPDATE setting_value = ?',
            [activeStr, activeStr]
        );

        if (title !== undefined) {
            await db.execute('INSERT INTO system_settings (setting_key, setting_value) VALUES ("emergency_title", ?) ON DUPLICATE KEY UPDATE setting_value = ?', [title, title]);
        }
        if (message !== undefined) {
            await db.execute('INSERT INTO system_settings (setting_key, setting_value) VALUES ("emergency_message", ?) ON DUPLICATE KEY UPDATE setting_value = ?', [message, message]);
        }

        const io = req.app.get('io');
        if (io) {
            io.emit('emergency_mode', { active, title, message });
        }
        res.json({ message: `Emergency mode ${active ? 'Activated' : 'Disabled'}`, isEmergency: active, title, message });
    } catch (err) {
        next(err);
    }
};

// ─── System Health ──────────────────────────
exports.getSystemHealth = async (req, res, next) => {
    try {
        const health = await AdminModel.getSystemHealth();
        res.json(health);
    } catch (err) {
        next(err);
    }
};
