const jwt = require('jsonwebtoken');

const verifyAdminToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access Denied: No Token Provided!' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'uruthunai_admin_secret');
        if (decoded.role !== 'admin') {
            return res.status(403).json({ error: 'Access Denied: Admin role required' });
        }

        req.admin = decoded;
        next();
    } catch (err) {
        return res.status(400).json({ error: 'Invalid Token' });
    }
};

module.exports = { verifyAdminToken };
