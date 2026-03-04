const User = require('../models/userModel');

// POST /api/auth/login
exports.login = async (req, res, next) => {
    try {
        const { phone_number, name, area_code, role } = req.body;
        if (!phone_number) {
            return res.status(400).json({ error: 'Phone number is required' });
        }

        let user = await User.findByPhone(phone_number);

        if (!user) {
            user = await User.create({ phone_number, name, area_code, role });
        }

        res.json({ message: 'Login successful', user });
    } catch (err) {
        next(err);
    }
};

// GET /api/auth/profile/:id
exports.getProfile = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const stats = await User.getStats(id);
        user.resources_posted = stats.resources_posted;
        user.requests_fulfilled = stats.requests_fulfilled;

        res.json(user);
    } catch (err) {
        next(err);
    }
};
