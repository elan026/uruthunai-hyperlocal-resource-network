const mysql = require('mysql2/promise');
require('dotenv').config();

const { DB_HOST, DB_USER, DB_PASS, DB_NAME } = process.env;

const updateDb = async () => {
    try {
        const pool = mysql.createPool({
            host: DB_HOST || 'localhost',
            user: DB_USER || 'root',
            password: DB_PASS || 'root',
            database: DB_NAME || 'uruthunai',
        });

        console.log(`Updating database tables...`);

        try {
            await pool.query('ALTER TABLE alerts ADD COLUMN location_lat DECIMAL(10, 8) NULL, ADD COLUMN location_lng DECIMAL(11, 8) NULL');
            console.log('Added location_lat and location_lng to alerts table.');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('Columns location_lat and location_lng already exist in alerts table.');
            } else if (e.code === 'ER_BAD_TABLE_ERROR') {
                console.log('Alerts table does not exist.');
            } else {
                throw e;
            }
        }

        console.log("Database schema updated successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Error updating database schema:", error);
        process.exit(1);
    }
};

updateDb();
