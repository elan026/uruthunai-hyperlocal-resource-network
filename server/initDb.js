const mysql = require('mysql2/promise');
require('dotenv').config();

const { DB_HOST, DB_USER, DB_PASS, DB_NAME } = process.env;

const initDb = async () => {
    try {
        const pool = mysql.createPool({
            host: DB_HOST || 'localhost',
            user: DB_USER || 'root',
            password: DB_PASS || 'root',
        });

        console.log(`Creating database ${DB_NAME || 'uruthunai'} if not exists...`);
        await pool.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME || 'uruthunai'}\`;`);
        await pool.query(`USE \`${DB_NAME || 'uruthunai'}\`;`);

        // Create Users Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                phone_number VARCHAR(20) UNIQUE NOT NULL,
                password VARCHAR(255) NULL,
                name VARCHAR(100),
                area_code VARCHAR(100),
                role ENUM('admin', 'user') DEFAULT 'user',
                user_type ENUM('resident', 'volunteer', 'activist', 'skilled_support') DEFAULT 'resident',
                trust_score INT DEFAULT 50,
                verification_status ENUM('unverified', 'verified') DEFAULT 'unverified',
                skills VARCHAR(255),
                profile_pic VARCHAR(255) DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Create Otps Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS otps (
                id INT AUTO_INCREMENT PRIMARY KEY,
                phone_number VARCHAR(20) NOT NULL,
                otp VARCHAR(6) NOT NULL,
                expires_at DATETIME NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Create Resources Table (Offers)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS resources (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                category VARCHAR(50) NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                availability_duration VARCHAR(100),
                is_emergency BOOLEAN DEFAULT FALSE,
                location_lat DECIMAL(10, 8),
                location_lng DECIMAL(11, 8),
                status ENUM('Available', 'Claimed', 'Closed') DEFAULT 'Available',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `);

        // Create Requests Table (Needs)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                category VARCHAR(50) NOT NULL,
                description TEXT,
                urgency_level ENUM('Critical', 'Essential', 'Support') DEFAULT 'Support',
                location_lat DECIMAL(10, 8),
                location_lng DECIMAL(11, 8),
                status ENUM('Open', 'In Progress', 'Fulfilled') DEFAULT 'Open',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `);

        // Create Alerts Table (For Admins)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS alerts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                admin_id INT NOT NULL,
                alert_type VARCHAR(50) NOT NULL,
                message TEXT NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                location_lat DECIMAL(10, 8),
                location_lng DECIMAL(11, 8),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `);

        // Create Reports Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS reports (
                id INT AUTO_INCREMENT PRIMARY KEY,
                reported_user_id INT NULL,
                resource_id INT NULL,
                request_id INT NULL,
                reported_by INT NOT NULL,
                reason VARCHAR(255) NOT NULL,
                status ENUM('Pending', 'Reviewed', 'Dismissed') DEFAULT 'Pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE CASCADE
            );
        `);

        // Create Verification Requests Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS verification_requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                requested_role VARCHAR(50) NOT NULL,
                document_url VARCHAR(255),
                status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `);

        /* Insert Default Admin User 
           We use a raw password since bcrypt adds dependency overhead and we're demonstrating the system structure. 
           In prod this would be hashed. */
        await pool.query(`
            INSERT IGNORE INTO users (phone_number, password, name, role, user_type, verification_status)
            VALUES ('admin', 'admin123', 'System Administrator', 'admin', 'resident', 'verified')
        `);

        console.log("Database tables created successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Error setting up database:", error);
        process.exit(1);
    }
};

initDb();
