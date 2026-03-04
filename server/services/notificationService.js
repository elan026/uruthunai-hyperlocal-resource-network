/**
 * Notification Service
 * Handles sending notifications to users for emergency alerts, request updates, etc.
 * In production, integrate with FCM (Firebase Cloud Messaging), SMS, or email providers.
 */

/**
 * Send an in-app notification (logs to console for demo)
 * @param {number} userId - Target user ID
 * @param {string} title - Notification title
 * @param {string} message - Notification body
 * @param {string} type - 'alert' | 'request_update' | 'resource_update' | 'info'
 */
const sendNotification = async (userId, title, message, type = 'info') => {
    // In production: push to FCM / WebSocket / DB notification table
    console.log(`[Notification] → User ${userId} | ${type.toUpperCase()}`);
    console.log(`  Title: ${title}`);
    console.log(`  Message: ${message}`);
    return { success: true, userId, type };
};

/**
 * Broadcast an alert to all users in an area
 * @param {string} areaCode - Area code (e.g., 'CHN-ADY-01')
 * @param {string} title - Alert title
 * @param {string} message - Alert body
 */
const broadcastAlert = async (areaCode, title, message) => {
    // In production: query users by area_code, then push notifications to each
    console.log(`[Broadcast] → Area ${areaCode}`);
    console.log(`  Title: ${title}`);
    console.log(`  Message: ${message}`);
    return { success: true, areaCode };
};

/**
 * Notify responders about a critical request
 * @param {number} requestId - Request ID
 * @param {string} category - Resource category needed
 * @param {string} areaCode - Area where help is needed
 */
const notifyResponders = async (requestId, category, areaCode) => {
    console.log(`[Responder Alert] Critical request #${requestId} for ${category} in ${areaCode}`);
    return { success: true, requestId };
};

module.exports = { sendNotification, broadcastAlert, notifyResponders };
