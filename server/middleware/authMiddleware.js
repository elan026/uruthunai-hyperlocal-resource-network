const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
    let token;

    // Check for token in cookies first, fallback to Auth header
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ error: 'Not authorized, no token' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'uruthunai_fallback_secret_key');
        
        // Add user payload to request
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Token verification failed:', error);
        res.status(401).json({ error: 'Not authorized, token failed' });
    }
};

const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Not authorized as an admin' });
    }
};

// Middleware: Only volunteer, organization, or ngo user_types can proceed
const volunteerOrAbove = async (req, res, next) => {
    try {
        const db = require('../config/db');
        const [rows] = await db.execute('SELECT user_type FROM users WHERE id = ?', [req.user.id]);
        if (!rows[0]) {
            return res.status(404).json({ error: 'User not found' });
        }
        const userType = rows[0].user_type;
        const allowedTypes = ['volunteer', 'community_activist', 'organization', 'ngo'];
        if (!allowedTypes.includes(userType)) {
            return res.status(403).json({ 
                error: 'Only volunteers and organizations can perform this action.',
                current_type: userType
            });
        }
        req.userType = userType;
        next();
    } catch (error) {
        console.error('volunteerOrAbove middleware error:', error);
        res.status(500).json({ error: 'Authorization check failed' });
    }
};

module.exports = { protect, adminOnly, volunteerOrAbove };
