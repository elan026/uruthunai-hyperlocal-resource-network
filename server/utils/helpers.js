/**
 * Server-side utility/helper functions
 */

/**
 * Validate that all required fields exist in the object.
 * @param {Object} fields - Key-value pairs to check
 * @returns {string|null} - Name of first missing field, or null if all present
 */
const validateRequiredFields = (fields) => {
    for (const [key, value] of Object.entries(fields)) {
        if (value === undefined || value === null || value === '') {
            return key;
        }
    }
    return null;
};

/**
 * Format a Date object into a human-readable relative time string
 * @param {Date|string} date
 * @returns {string}
 */
const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
};

/**
 * Sanitize a string to prevent basic injection
 * @param {string} str
 * @returns {string}
 */
const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str.replace(/[<>"'/\\]/g, '');
};

module.exports = { validateRequiredFields, timeAgo, sanitizeString };
