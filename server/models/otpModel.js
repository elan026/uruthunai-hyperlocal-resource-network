const db = require('../config/db');

const OtpModel = {
    create: async (phone_number, otp) => {
        // Expiry time 5 minutes from now
        const expires_at = new Date(Date.now() + 5 * 60000);
        await db.execute(
            'INSERT INTO otps (phone_number, otp, expires_at) VALUES (?, ?, ?)',
            [phone_number, otp, expires_at]
        );
        return { phone_number, otp, expires_at };
    },

    verify: async (phone_number, otp) => {
        const [rows] = await db.execute(
            'SELECT * FROM otps WHERE phone_number = ? AND otp = ? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
            [phone_number, otp]
        );
        return rows[0] || null;
    },

    clear: async (phone_number) => {
        await db.execute('DELETE FROM otps WHERE phone_number = ?', [phone_number]);
    }
};

module.exports = OtpModel;
