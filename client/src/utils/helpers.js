/**
 * Client-side utility/helper functions
 */

/**
 * Format a timestamp into a human-readable relative time string
 * @param {string} dateStr - ISO timestamp
 * @returns {string}
 */
export const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
};

/**
 * Format a timestamp to locale time string
 * @param {string} dateStr - ISO timestamp
 * @returns {string}
 */
export const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString();
};

/**
 * Format a timestamp to full locale string
 * @param {string} dateStr - ISO timestamp
 * @returns {string}
 */
export const formatDateTime = (dateStr) => {
    return new Date(dateStr).toLocaleString();
};

/**
 * Get the first character of a name (for avatar initials)
 * @param {string} name
 * @returns {string}
 */
export const getInitial = (name) => {
    return (name || 'U').charAt(0).toUpperCase();
};
