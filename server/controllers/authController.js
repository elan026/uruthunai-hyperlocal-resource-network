const User = require('../models/userModel');
const OtpModel = require('../models/otpModel');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const axios = require('axios');

// POST /api/auth/google-login
exports.googleLogin = async (req, res, next) => {
    try {
        const { idToken } = req.body;
        if (!idToken) {
            return res.status(400).json({ error: 'Google ID Token is required' });
        }

        // Verify ID Token with Google's API
        let googleResponse;
        try {
            googleResponse = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
        } catch (err) {
            console.error('[Google OAuth Error] Token verification failed:', err.message);
            return res.status(400).json({ error: 'Invalid Google token signature or expired token' });
        }

        const payload = googleResponse.data;
        
        // Validate Audience
        const client_id = process.env.GOOGLE_CLIENT_ID;
        if (client_id && payload.aud !== client_id) {
            return res.status(400).json({ error: 'Token audience mismatch. Verification failed.' });
        }

        const { sub: google_id, email, name, picture } = payload;

        // Try to find the user in DB
        let user = await User.findByGoogleId(google_id);
        
        if (!user && email) {
            // Check if user exists with the same email but has no google_id linked
            user = await User.findByEmail(email);
            if (user) {
                // Link Google account to existing user
                await User.update(user.id, { google_id, profile_pic: user.profile_pic || picture });
                user.google_id = google_id;
                user.profile_pic = user.profile_pic || picture;
            }
        }

        if (!user) {
            // New user registration
            user = await User.create({
                google_id,
                email,
                name: name || 'Google User',
                profile_pic: picture,
                role: 'user',
                user_type: 'resident'
            });
        }

        // Generate our application JWT
        const token = jwt.sign(
            { id: user.id, role: user.role, email: user.email },
            process.env.JWT_SECRET || 'uruthunai_fallback_secret_key',
            { expiresIn: '7d' }
        );

        // Set HttpOnly, Secure cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.json({ message: 'Login successful', user, token });
    } catch (err) {
        next(err);
    }
};

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
        const { phone_number, otp, name, area_code, pincode, area_name, role, user_type, skills } = req.body;
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
                pincode,
                area_name,
                role: role || 'user',
                user_type: 'resident', // Always start as resident — role upgrades require admin approval
                skills
            });
        }

        // Generate JWT Ticket
        const token = jwt.sign(
            { id: user.id, role: user.role, phone_number: user.phone_number },
            process.env.JWT_SECRET || 'uruthunai_fallback_secret_key',
            { expiresIn: '7d' } // Extend to 7 days for disaster scenario reliability
        );

        // Set HttpOnly, Secure cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.json({ message: 'Verification successful', user, token });
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

        // Check for pending role change request
        const [pendingReqs] = await db.execute(
            'SELECT id, requested_role, status, created_at FROM verification_requests WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
            [id]
        );
        user.pending_role_request = pendingReqs[0] || null;

        res.json(user);
    } catch (err) {
        next(err);
    }
};

// PUT /api/auth/profile/:id — SECURITY FIX: user_type changes are blocked
exports.updateProfile = async (req, res, next) => {
    try {
        const { id } = req.params;
        // Explicitly exclude user_type from direct updates — role changes must go through admin approval
        const { name, area_code, pincode, area_name, skills } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Note: user_type is intentionally NOT passed here.
        // Role changes must go through POST /profile/:id/role-request
        await User.update(id, { name, area_code, pincode, area_name, skills });

        const updatedUser = await User.findById(id);
        res.json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (err) {
        next(err);
    }
};

// POST /api/auth/profile/:id/role-request — Request role upgrade (requires admin approval)
exports.requestRoleChange = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { requested_role } = req.body;

        // Validate the requested role
        const validRoles = ['volunteer', 'organization', 'ngo'];
        if (!validRoles.includes(requested_role)) {
            return res.status(400).json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if user already has this role
        if (user.user_type === requested_role) {
            return res.status(400).json({ error: `You already have the ${requested_role} role.` });
        }

        // Check for existing pending request
        const [existing] = await db.execute(
            'SELECT id FROM verification_requests WHERE user_id = ? AND status = "Pending"',
            [id]
        );
        if (existing.length > 0) {
            return res.status(409).json({ error: 'You already have a pending role change request. Please wait for admin review.' });
        }

        // Insert role change request into verification_requests queue
        await db.execute(
            'INSERT INTO verification_requests (user_id, requested_role, status) VALUES (?, ?, "Pending")',
            [id, requested_role]
        );

        res.status(201).json({ 
            message: `Role change to "${requested_role}" has been submitted for admin review.`,
            status: 'Pending'
        });
    } catch (err) {
        next(err);
    }
};

// DELETE /api/auth/profile/:id
exports.deleteProfile = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        await User.delete(id);
        res.json({ message: 'Profile deleted successfully' });
    } catch (err) {
        next(err);
    }
};

// POST /api/auth/profile/:id/avatar
exports.uploadAvatar = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        const profilePicUrl = `/uploads/profiles/${req.file.filename}`;
        await User.update(id, { profile_pic: profilePicUrl });

        res.json({ message: 'Profile picture updated', profile_pic: profilePicUrl });
    } catch (err) {
        next(err);
    }
};

// GET /api/auth/volunteers
exports.getVolunteers = async (req, res, next) => {
    try {
        const volunteers = await User.findAllVolunteers();
        // Parse skills JSON if it is a string
        const parsedVolunteers = volunteers.map(v => {
            if (v.skills && typeof v.skills === 'string') {
                try {
                    v.skills = JSON.parse(v.skills);
                } catch {
                    v.skills = v.skills.split(',').map(s => s.trim());
                }
            }
            return v;
        });
        res.json(parsedVolunteers);
    } catch (err) {
        next(err);
    }
};
