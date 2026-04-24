const { pool } = require('../config/database');

const findByCourse = async (course_id) => {
  const [rows] = await pool.execute(
    `SELECT g.id, g.internal_marks, g.midterm_marks, g.final_marks, g.total_marks,
            g.grade_letter, g.grade_point, g.remarks, g.created_at, g.updated_at,
            s.id AS student_id, s.full_name AS student_name, s.roll_number,
            f.full_name AS graded_by_name
     FROM enrollments e
     JOIN students s ON e.student_id = s.id
     LEFT JOIN grades g ON g.student_id = e.student_id AND g.course_id = e.course_id
     LEFT JOIN faculty f ON g.graded_by = f.id
     WHERE e.course_id = ? AND e.status = 'active'
     ORDER BY s.full_name ASC`,
    [course_id]
  );
  return rows;
};

const findByStudent = async (student_id) => {
  const [rows] = await pool.execute(
    `SELECT g.id, g.internal_marks, g.midterm_marks, g.final_marks, g.total_marks,
            g.grade_letter, g.grade_point, g.remarks,
            c.title AS course_title, c.course_code, c.credits, c.semester
     FROM grades g
     JOIN courses c ON g.course_id = c.id
     WHERE g.student_id = ?
     ORDER BY c.semester ASC, c.title ASC`,
    [student_id]
  );
  return rows;
};

const upsert = async (data) => {
  const { enrollment_id, student_id, course_id, internal_marks, midterm_marks,
    final_marks, grade_letter, grade_point, remarks, graded_by } = data;
  const [result] = await pool.execute(
    `INSERT INTO grades (enrollment_id, student_id, course_id, internal_marks, midterm_marks,
       final_marks, grade_letter, grade_point, remarks, graded_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       internal_marks = VALUES(internal_marks),
       midterm_marks = VALUES(midterm_marks),
       final_marks = VALUES(final_marks),
       grade_letter = VALUES(grade_letter),
       grade_point = VALUES(grade_point),
       remarks = VALUES(remarks),
       graded_by = VALUES(graded_by),
       updated_at = NOW()`,
    [enrollment_id, student_id, course_id, internal_marks || null, midterm_marks || null,
     final_marks || null, grade_letter || null, grade_point || null, remarks || null, graded_by || null]
  );
  return result;
};

const getStudentGPA = async (student_id) => {
  const [rows] = await pool.execute(
    `SELECT ROUND(SUM(g.grade_point * c.credits) / SUM(c.credits), 2) AS cgpa,
            COUNT(g.id) AS graded_courses
     FROM grades g
     JOIN courses c ON g.course_id = c.id
     WHERE g.student_id = ? AND g.grade_point IS NOT NULL`,
    [student_id]
  );
  return rows[0];
};

module.exports = { findByCourse, findByStudent, upsert, getStudentGPA };
