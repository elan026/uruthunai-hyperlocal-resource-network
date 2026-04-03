const db = require('./config/db');

async function fixDb() {
    try {
        await db.query(`ALTER TABLE resources ADD COLUMN visibility_status VARCHAR(50) DEFAULT 'visible'`);
        console.log('visibility_status column added to resources table.');
    } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log('Column already exists.');
        } else {
            console.error('Error adding column:', err);
        }
    } finally {
        process.exit(0);
    }
}
fixDb();
