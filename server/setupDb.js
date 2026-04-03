const db = require('./config/db');

async function setup() {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS system_settings (
                setting_key VARCHAR(100) PRIMARY KEY,
                setting_value TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('System settings table created successfully.');
    } catch (err) {
        console.error('Failed to create table', err);
    } finally {
        process.exit(0);
    }
}

setup();
