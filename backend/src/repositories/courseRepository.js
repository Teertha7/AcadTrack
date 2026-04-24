const { pool } = require('../config/database');

const findAll = async ({ page = 1, limit = 20, search = '', department_id, semester, faculty_id } = {}) => {
  const offset = (page - 1) * limit;
  const params = [];
  let where = 'WHERE c.is_active = 1';

  if (search) {
    where += ' AND (c.title LIKE ? OR c.course_code LIKE ?)';
    const q = `%${search}%`;
    params.push(q, q);
  }
  if (department_id) { where += ' AND c.department_id = ?'; params.push(department_id); }
  if (semester) { where += ' AND c.semester = ?'; params.push(semester); }
  if (faculty_id) { where += ' AND c.faculty_id = ?'; params.push(faculty_id); }

  const [countRows] = await pool.execute(
    `SELECT COUNT(*) AS total FROM courses c ${where}`, params
  );
  const total = countRows[0].total;

  params.push(parseInt(limit), parseInt(offset));
  const [rows] = await pool.query(
    `SELECT c.id, c.course_code, c.title, c.description, c.credits, c.semester,
            c.max_students, c.is_active, c.created_at,
            d.name AS department_name, d.id AS department_id,
            f.full_name AS faculty_name, f.id AS faculty_id,
            (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id AND e.status = 'active') AS enrolled_count
     FROM courses c
     JOIN departments d ON c.department_id = d.id
     LEFT JOIN faculty f ON c.faculty_id = f.id
     ${where}
     ORDER BY c.semester ASC, c.title ASC
     LIMIT ? OFFSET ?`,
    params
  );
  return { data: rows, total, page, limit };
};

const findById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT c.*, d.name AS department_name, f.full_name AS faculty_name,
            (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id AND e.status = 'active') AS enrolled_count
     FROM courses c
     JOIN departments d ON c.department_id = d.id
     LEFT JOIN faculty f ON c.faculty_id = f.id
     WHERE c.id = ?`,
    [id]
  );
  return rows[0] || null;
};

const create = async (data) => {
  const { department_id, faculty_id, course_code, title, description, credits, semester, max_students } = data;
  const [result] = await pool.execute(
    `INSERT INTO courses (department_id, faculty_id, course_code, title, description, credits, semester, max_students)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [department_id, faculty_id || null, course_code, title, description || null,
     credits || 3, semester, max_students || 60]
  );
  return findById(result.insertId);
};

const update = async (id, data) => {
  const fields = [];
  const params = [];
  const allowed = ['faculty_id', 'title', 'description', 'credits', 'semester', 'max_students', 'is_active', 'department_id'];
  for (const key of allowed) {
    if (data[key] !== undefined) {
      fields.push(`${key} = ?`);
      params.push(data[key]);
    }
  }
  if (!fields.length) return findById(id);
  params.push(id);
  await pool.execute(`UPDATE courses SET ${fields.join(', ')} WHERE id = ?`, params);
  return findById(id);
};

const remove = async (id) => {
  await pool.execute('UPDATE courses SET is_active = 0 WHERE id = ?', [id]);
};

const findByCourseCode = async (code) => {
  const [rows] = await pool.execute('SELECT id FROM courses WHERE course_code = ?', [code]);
  return rows[0] || null;
};

module.exports = { findAll, findById, create, update, remove, findByCourseCode };
