const User = require('../models/userModel');

const OtpModel = require('../models/otpModel');

// POST /api/auth/send-otp
exports.sendOtp = async (req, res, next) => {
    try {
        const { phone_number } = req.body;
        if (!phone_number) {
            return res.status(400).json({ error: 'Phone number is required' });
        }

        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        await OtpModel.create(phone_number, otp);

        // In a real application, you would send this via SMS:
        console.log(`[Uruthunai System] SMS Sent. OTP for ${phone_number} is ${otp}`);

        res.json({ message: 'OTP sent successfully', mock_otp: otp }); // Returning otp purely for testing without SMS service
    } catch (err) {
        next(err);
    }
};

// POST /api/auth/verify-otp (handles Login or Registration)
exports.verifyOtp = async (req, res, next) => {
    try {
        const { phone_number, otp, name, area_code, role, user_type, skills } = req.body;
        if (!phone_number || !otp) {
            return res.status(400).json({ error: 'Phone number and OTP are required' });
        }

        const validOtp = await OtpModel.verify(phone_number, otp);
        if (!validOtp) {
            return res.status(400).json({ error: 'Invalid or Expired OTP' });
        }

        // OTP verified successfully. Remove it to prevent replay
        await OtpModel.clear(phone_number);

        let user = await User.findByPhone(phone_number);

        if (!user) {
            // When creating a new user through login, default role to 'user' unless explicitly provided (admin usually shouldn't be creatable this way in prod)
            user = await User.create({
                phone_number,
                name,
                area_code,
                role: role || 'user',
                user_type: user_type || 'resident',
                skills
            });
        }

        res.json({ message: 'Verification successful', user });
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

// PUT /api/auth/profile/:id
exports.updateProfile = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, area_code, user_type, skills } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        await User.update(id, { name, area_code, user_type, skills });

        const updatedUser = await User.findById(id);
        res.json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (err) {
        next(err);
    }
};
