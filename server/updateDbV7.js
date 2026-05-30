const mysql = require('mysql2/promise');
require('dotenv').config();

const { DB_HOST, DB_USER, DB_PASS, DB_NAME } = process.env;

const updateDbV7 = async () => {
    try {
        const pool = mysql.createPool({
            host: DB_HOST || 'localhost',
            user: DB_USER || 'root',
            password: DB_PASS || 'root',
            database: DB_NAME || 'uruthunai',
        });

        console.log(`Applying V7 Schema Updates (Adding SLA warning support)...`);

        // Add sla_warning column to requests
        try {
            await pool.query("ALTER TABLE requests ADD COLUMN sla_warning VARCHAR(50) DEFAULT NULL");
            console.log('✓ requests.sla_warning column added');
        } catch (e) {
            console.error('Error adding sla_warning column:', e.message);
        }

        console.log("\n✅ Database V7 Schema updated successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Error updating database schema V7:", error);
        process.exit(1);
    }
};

updateDbV7();
