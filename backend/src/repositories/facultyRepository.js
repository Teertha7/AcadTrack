const { pool } = require('../config/database');

const findAll = async ({ page = 1, limit = 20, search = '', department_id } = {}) => {
  const offset = (page - 1) * limit;
  const params = [];
  let where = 'WHERE f.is_active = 1';

  if (search) {
    where += ' AND (f.full_name LIKE ? OR f.email LIKE ? OR f.designation LIKE ?)';
    const q = `%${search}%`;
    params.push(q, q, q);
  }
  if (department_id) {
    where += ' AND f.department_id = ?';
    params.push(department_id);
  }

  const [countRows] = await pool.execute(
    `SELECT COUNT(*) AS total FROM faculty f ${where}`, params
  );
  const total = countRows[0].total;

  params.push(parseInt(limit), parseInt(offset));
  const [rows] = await pool.query(
    `SELECT f.id, f.full_name, f.email, f.phone, f.designation, f.qualification,
            f.joining_date, f.is_active, f.created_at,
            d.name AS department_name, d.id AS department_id
     FROM faculty f
     JOIN departments d ON f.department_id = d.id
     ${where}
     ORDER BY f.full_name ASC
     LIMIT ? OFFSET ?`,
    params
  );
  return { data: rows, total, page, limit };
};

const findById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT f.id, f.full_name, f.email, f.phone, f.designation, f.qualification,
            f.joining_date, f.is_active, f.created_at, f.updated_at,
            d.name AS department_name, d.id AS department_id
     FROM faculty f
     JOIN departments d ON f.department_id = d.id
     WHERE f.id = ?`,
    [id]
  );
  return rows[0] || null;
};

const create = async (data) => {
  const { department_id, full_name, email, password_hash, phone, designation, qualification, joining_date } = data;
  const [result] = await pool.execute(
    `INSERT INTO faculty (department_id, full_name, email, password_hash, phone, designation, qualification, joining_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [department_id, full_name, email, password_hash, phone || null,
     designation || null, qualification || null, joining_date || null]
  );
  return findById(result.insertId);
};

const update = async (id, data) => {
  const fields = [];
  const params = [];
  const allowed = ['full_name', 'phone', 'designation', 'qualification', 'joining_date', 'department_id', 'is_active'];
  for (const key of allowed) {
    if (data[key] !== undefined) {
      fields.push(`${key} = ?`);
      params.push(data[key]);
    }
  }
  if (!fields.length) return findById(id);
  params.push(id);
  await pool.execute(`UPDATE faculty SET ${fields.join(', ')} WHERE id = ?`, params);
  return findById(id);
};

const remove = async (id) => {
  await pool.execute('UPDATE faculty SET is_active = 0 WHERE id = ?', [id]);
};

const findByEmail = async (email) => {
  const [rows] = await pool.execute('SELECT * FROM faculty WHERE email = ?', [email]);
  return rows[0] || null;
};

module.exports = { findAll, findById, create, update, remove, findByEmail };
