const { pool } = require('../config/database');
const bcrypt = require('bcrypt');
const { hashRefreshToken } = require('../utils/jwt');

const findAdminByEmail = async (email) => {
  const [rows] = await pool.execute(
    'SELECT * FROM admins WHERE email = ? AND is_active = 1',
    [email]
  );
  return rows[0] || null;
};

const findFacultyByEmail = async (email) => {
  const [rows] = await pool.execute(
    'SELECT f.*, d.name AS department_name FROM faculty f JOIN departments d ON f.department_id = d.id WHERE f.email = ? AND f.is_active = 1',
    [email]
  );
  return rows[0] || null;
};

const findStudentByEmail = async (email) => {
  const [rows] = await pool.execute(
    'SELECT s.*, d.name AS department_name FROM students s JOIN departments d ON s.department_id = d.id WHERE s.email = ? AND s.is_active = 1',
    [email]
  );
  return rows[0] || null;
};

const storeRefreshToken = async (userId, userType, tokenHash, expiresAt) => {
  await pool.execute(
    'INSERT INTO refresh_tokens (user_id, user_type, token_hash, expires_at) VALUES (?, ?, ?, ?)',
    [userId, userType, tokenHash, expiresAt]
  );
};

const findRefreshToken = async (tokenHash, userType) => {
  const [rows] = await pool.execute(
    `SELECT * FROM refresh_tokens 
     WHERE token_hash = ? AND user_type = ? AND is_revoked = 0 AND expires_at > NOW()`,
    [tokenHash, userType]
  );
  return rows[0] || null;
};

const revokeRefreshToken = async (tokenHash) => {
  await pool.execute(
    'UPDATE refresh_tokens SET is_revoked = 1 WHERE token_hash = ?',
    [tokenHash]
  );
};

const revokeAllUserTokens = async (userId, userType) => {
  await pool.execute(
    'UPDATE refresh_tokens SET is_revoked = 1 WHERE user_id = ? AND user_type = ?',
    [userId, userType]
  );
};

module.exports = {
  findAdminByEmail,
  findFacultyByEmail,
  findStudentByEmail,
  storeRefreshToken,
  findRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
};
