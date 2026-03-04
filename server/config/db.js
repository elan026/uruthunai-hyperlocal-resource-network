const mysql = require('mysql2/promise');
require('dotenv').config();

const { DB_HOST, DB_USER, DB_PASS, DB_NAME } = process.env;

const pool = mysql.createPool({
    host: DB_HOST || 'localhost',
    user: DB_USER || 'root',
    password: DB_PASS || 'root',
    database: DB_NAME || 'uruthunai',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;
