/**
 * OTP Service
 * Handles OTP generation and verification for phone-based authentication.
 * In production, integrate with Twilio, MSG91, or similar SMS gateway.
 */

// In-memory OTP store (for demo purposes — use Redis in production)
const otpStore = new Map();

/**
 * Generate a 6-digit OTP for a given phone number
 * @param {string} phoneNumber
 * @returns {string} otp
 */
const generateOTP = (phoneNumber) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(phoneNumber, {
        otp,
        expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
        attempts: 0
    });
    console.log(`[OTP Service] Generated OTP for ${phoneNumber}: ${otp}`);
    return otp;
};

/**
 * Verify an OTP for a given phone number
 * @param {string} phoneNumber
 * @param {string} otp
 * @returns {boolean}
 */
const verifyOTP = (phoneNumber, otp) => {
    const record = otpStore.get(phoneNumber);

    if (!record) return false;
    if (Date.now() > record.expiresAt) {
        otpStore.delete(phoneNumber);
        return false;
    }

    record.attempts += 1;
    if (record.attempts > 3) {
        otpStore.delete(phoneNumber);
        return false;
    }

    if (record.otp === otp) {
        otpStore.delete(phoneNumber);
        return true;
    }

    return false;
};

module.exports = { generateOTP, verifyOTP };
