const mysql2 = require('mysql2/promise');
const logger = require('../utils/logger');

const pool = mysql2.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  database: process.env.DB_NAME || 'acad_track',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  timezone: '+00:00',
});

pool.on('connection', () => {
  logger.info('New DB connection established');
});

const testConnection = async () => {
  try {
    const conn = await pool.getConnection();
    logger.info('MySQL connected successfully');
    conn.release();
  } catch (err) {
    logger.error('MySQL connection failed:', err.message);
    process.exit(1);
  }
};

module.exports = { pool, testConnection };
