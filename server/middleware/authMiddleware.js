/**
 * Auth Middleware
 * Lightweight session check for demo purposes.
 * In production, this would validate a JWT or session token.
 */

const authMiddleware = (req, res, next) => {
    // For this project, auth is handled client-side via user state.
    // This middleware is a placeholder for JWT-based auth.
    // To enforce, check for Authorization header or session cookie here.

    const userId = req.headers['x-user-id'];

    if (!userId) {
        // Allow requests without auth for now (demo mode)
        return next();
    }

    // Attach user ID to request for downstream controllers
    req.userId = parseInt(userId, 10);
    next();
};

/**
 * Role-based access control middleware factory
 * @param  {...string} roles - Allowed roles (e.g., 'Admin', 'Volunteer')
 */
const requireRole = (...roles) => {
    return (req, res, next) => {
        // In production, fetch user role from DB or JWT payload
        // For demo, this is a structural placeholder
        if (req.userRole && !roles.includes(req.userRole)) {
            return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
        }
        next();
    };
};

module.exports = { authMiddleware, requireRole };
