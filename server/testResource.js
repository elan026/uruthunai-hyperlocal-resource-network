const db = require('./config/db');

async function test() {
    try {
        console.log('Testing query');
        const [rows] = await db.execute('SELECT setting_value FROM system_settings WHERE setting_key = "is_emergency_active"');
        console.log('system_settings query succeeded:', rows);

        console.log('Testing query 2');
        const [resources] = await db.execute('SELECT r.*, u.name as provider_name, u.role as provider_role, u.trust_score as provider_trust_score FROM resources r JOIN users u ON r.user_id = u.id WHERE r.visibility_status = "visible" ORDER BY r.created_at DESC');
        console.log('resources query succeeded:', resources.length);
    } catch (e) {
        console.error('Error:', e);
    } finally {
        process.exit(0);
    }
}
test();
