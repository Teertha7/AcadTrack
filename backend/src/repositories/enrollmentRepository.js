const { pool } = require('../config/database');

const findAll = async ({ page = 1, limit = 20, student_id, course_id, status } = {}) => {
  const offset = (page - 1) * limit;
  const params = [];
  let where = 'WHERE 1=1';

  if (student_id) { where += ' AND e.student_id = ?'; params.push(student_id); }
  if (course_id) { where += ' AND e.course_id = ?'; params.push(course_id); }
  if (status) { where += ' AND e.status = ?'; params.push(status); }

  const [countRows] = await pool.execute(
    `SELECT COUNT(*) AS total FROM enrollments e ${where}`, params
  );
  const total = countRows[0].total;

  params.push(parseInt(limit), parseInt(offset));
  const [rows] = await pool.query(
    `SELECT e.id, e.status, e.enrolled_at, e.created_at,
            s.id AS student_id, s.full_name AS student_name, s.roll_number,
            c.id AS course_id, c.title AS course_title, c.course_code,
            f.full_name AS faculty_name
     FROM enrollments e
     JOIN students s ON e.student_id = s.id
     JOIN courses c ON e.course_id = c.id
     LEFT JOIN faculty f ON c.faculty_id = f.id
     ${where}
     ORDER BY e.enrolled_at DESC
     LIMIT ? OFFSET ?`,
    params
  );
  return { data: rows, total, page, limit };
};

const findById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT e.*, s.full_name AS student_name, s.roll_number,
            c.title AS course_title, c.course_code
     FROM enrollments e
     JOIN students s ON e.student_id = s.id
     JOIN courses c ON e.course_id = c.id
     WHERE e.id = ?`,
    [id]
  );
  return rows[0] || null;
};

const findByStudentAndCourse = async (student_id, course_id) => {
  const [rows] = await pool.execute(
    'SELECT * FROM enrollments WHERE student_id = ? AND course_id = ?',
    [student_id, course_id]
  );
  return rows[0] || null;
};

const create = async (student_id, course_id) => {
  const [result] = await pool.execute(
    'INSERT INTO enrollments (student_id, course_id, status) VALUES (?, ?, ?)',
    [student_id, course_id, 'active']
  );
  return findById(result.insertId);
};

const updateStatus = async (id, status) => {
  await pool.execute('UPDATE enrollments SET status = ? WHERE id = ?', [status, id]);
  return findById(id);
};

const getStudentEnrollments = async (student_id) => {
  const [rows] = await pool.execute(
    `SELECT e.id, e.status, e.enrolled_at,
            c.id AS course_id, c.title AS course_title, c.course_code, c.credits, c.semester,
            f.full_name AS faculty_name,
            COALESCE(g.grade_letter, 'N/A') AS grade_letter,
            COALESCE(g.grade_point, 0) AS grade_point,
            ROUND(
              (SELECT COUNT(*) FROM attendance a WHERE a.enrollment_id = e.id AND a.status = 'present') /
              NULLIF((SELECT COUNT(*) FROM attendance a WHERE a.enrollment_id = e.id), 0) * 100, 2
            ) AS attendance_percentage
     FROM enrollments e
     JOIN courses c ON e.course_id = c.id
     LEFT JOIN faculty f ON c.faculty_id = f.id
     LEFT JOIN grades g ON g.enrollment_id = e.id
     WHERE e.student_id = ? AND e.status = 'active'
     ORDER BY c.semester ASC, c.title ASC`,
    [student_id]
  );
  return rows;
};

module.exports = { findAll, findById, findByStudentAndCourse, create, updateStatus, getStudentEnrollments };
