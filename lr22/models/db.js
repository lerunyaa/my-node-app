require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'student',
  password: process.env.DB_PASSWORD || 'student',
  database: process.env.DB_NAME || 'bbmo_01_23',
  connectionLimit: 10,
});

module.exports = pool; 
