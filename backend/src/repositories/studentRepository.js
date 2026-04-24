const { pool } = require('../config/database');

const findAll = async ({ page = 1, limit = 20, search = '', department_id } = {}) => {
  const offset = (page - 1) * limit;
  const params = [];
  let where = 'WHERE s.is_active = 1';

  if (search) {
    where += ' AND (s.full_name LIKE ? OR s.roll_number LIKE ? OR s.email LIKE ?)';
    const q = `%${search}%`;
    params.push(q, q, q);
  }
  if (department_id) {
    where += ' AND s.department_id = ?';
    params.push(department_id);
  }

  const [countRows] = await pool.execute(
    `SELECT COUNT(*) AS total FROM students s ${where}`,
    params
  );
  const total = countRows[0].total;

  params.push(parseInt(limit), parseInt(offset));
  const [rows] = await pool.query(
    `SELECT s.id, s.roll_number, s.full_name, s.email, s.phone, s.gender,
            s.date_of_birth, s.enrollment_year, s.current_semester, s.is_active,
            s.created_at, d.name AS department_name, d.id AS department_id
     FROM students s
     JOIN departments d ON s.department_id = d.id
     ${where}
     ORDER BY s.full_name ASC
     LIMIT ? OFFSET ?`,
    params
  );

  return { data: rows, total, page, limit };
};

const findById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT s.id, s.roll_number, s.full_name, s.email, s.phone, s.gender,
            s.date_of_birth, s.address, s.enrollment_year, s.current_semester,
            s.is_active, s.created_at, s.updated_at,
            d.name AS department_name, d.id AS department_id
     FROM students s
     JOIN departments d ON s.department_id = d.id
     WHERE s.id = ?`,
    [id]
  );
  return rows[0] || null;
};

const create = async (data) => {
  const { department_id, roll_number, full_name, email, password_hash, phone,
    date_of_birth, gender, address, enrollment_year, current_semester } = data;
  const [result] = await pool.execute(
    `INSERT INTO students
       (department_id, roll_number, full_name, email, password_hash, phone,
        date_of_birth, gender, address, enrollment_year, current_semester)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [department_id, roll_number, full_name, email, password_hash, phone || null,
     date_of_birth || null, gender || null, address || null, enrollment_year, current_semester || 1]
  );
  return findById(result.insertId);
};

const update = async (id, data) => {
  const fields = [];
  const params = [];
  const allowed = ['full_name', 'phone', 'gender', 'address', 'date_of_birth',
                   'enrollment_year', 'current_semester', 'department_id', 'is_active'];
  for (const key of allowed) {
    if (data[key] !== undefined) {
      fields.push(`${key} = ?`);
      params.push(data[key]);
    }
  }
  if (!fields.length) return findById(id);
  params.push(id);
  await pool.execute(`UPDATE students SET ${fields.join(', ')} WHERE id = ?`, params);
  return findById(id);
};

const remove = async (id) => {
  await pool.execute('UPDATE students SET is_active = 0 WHERE id = ?', [id]);
};

const findByEmail = async (email) => {
  const [rows] = await pool.execute('SELECT * FROM students WHERE email = ?', [email]);
  return rows[0] || null;
};

const findByRoll = async (roll_number) => {
  const [rows] = await pool.execute('SELECT id FROM students WHERE roll_number = ?', [roll_number]);
  return rows[0] || null;
};

module.exports = { findAll, findById, create, update, remove, findByEmail, findByRoll };
