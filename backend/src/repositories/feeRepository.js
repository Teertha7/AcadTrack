const { pool } = require('../config/database');

const findAll = async ({ page = 1, limit = 20, student_id, status, fee_type, academic_year } = {}) => {
  const offset = (page - 1) * limit;
  const params = [];
  let where = 'WHERE 1=1';

  if (student_id) { where += ' AND f.student_id = ?'; params.push(student_id); }
  if (status) { where += ' AND f.status = ?'; params.push(status); }
  if (fee_type) { where += ' AND f.fee_type = ?'; params.push(fee_type); }
  if (academic_year) { where += ' AND f.academic_year = ?'; params.push(academic_year); }

  const [countRows] = await pool.execute(
    `SELECT COUNT(*) AS total FROM fees f ${where}`, params
  );
  const total = countRows[0].total;
  params.push(parseInt(limit), parseInt(offset));

  const [rows] = await pool.query(
    `SELECT f.id, f.fee_type, f.description, f.amount, f.due_date, f.academic_year,
            f.semester, f.status, f.created_at,
            s.full_name AS student_name, s.roll_number, s.id AS student_id,
            COALESCE(
              (SELECT SUM(p.amount_paid) FROM payments p WHERE p.fee_id = f.id), 0
            ) AS amount_paid
     FROM fees f
     JOIN students s ON f.student_id = s.id
     ${where}
     ORDER BY f.due_date ASC
     LIMIT ? OFFSET ?`,
    params
  );
  return { data: rows, total, page, limit };
};

const findById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT f.*, s.full_name AS student_name, s.roll_number,
            COALESCE((SELECT SUM(p.amount_paid) FROM payments p WHERE p.fee_id = f.id), 0) AS amount_paid
     FROM fees f
     JOIN students s ON f.student_id = s.id
     WHERE f.id = ?`,
    [id]
  );
  return rows[0] || null;
};

const create = async (data) => {
  const { student_id, fee_type, description, amount, due_date, academic_year, semester } = data;
  const [result] = await pool.execute(
    `INSERT INTO fees (student_id, fee_type, description, amount, due_date, academic_year, semester)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [student_id, fee_type, description || null, amount, due_date, academic_year, semester || null]
  );
  return findById(result.insertId);
};

const update = async (id, data) => {
  const fields = [];
  const params = [];
  const allowed = ['fee_type', 'description', 'amount', 'due_date', 'academic_year', 'semester', 'status'];
  for (const key of allowed) {
    if (data[key] !== undefined) {
      fields.push(`${key} = ?`);
      params.push(data[key]);
    }
  }
  if (!fields.length) return findById(id);
  params.push(id);
  await pool.execute(`UPDATE fees SET ${fields.join(', ')} WHERE id = ?`, params);
  return findById(id);
};

const getStudentFeeSummary = async (student_id) => {
  const [rows] = await pool.execute(
    `SELECT 
       SUM(f.amount) AS total_amount,
       SUM(COALESCE(p.paid, 0)) AS total_paid,
       (SUM(f.amount) - SUM(COALESCE(p.paid, 0))) AS balance,
       SUM(CASE WHEN f.status = 'overdue' THEN f.amount ELSE 0 END) AS overdue_amount
     FROM fees f
     LEFT JOIN (
       SELECT fee_id, SUM(amount_paid) AS paid FROM payments GROUP BY fee_id
     ) p ON p.fee_id = f.id
     WHERE f.student_id = ?`,
    [student_id]
  );
  return rows[0];
};

module.exports = { findAll, findById, create, update, getStudentFeeSummary };
