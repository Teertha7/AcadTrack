const { pool } = require('../config/database');

const findByCourse = async (course_id, class_date = null) => {
  const params = [course_id];
  let dateFilter = '';
  if (class_date) {
    dateFilter = ' AND a.class_date = ?';
    params.push(class_date);
  }
  const [rows] = await pool.execute(
    `SELECT a.id, a.class_date, a.status, a.remarks, a.created_at,
            s.id AS student_id, s.full_name AS student_name, s.roll_number,
            f.full_name AS faculty_name
     FROM attendance a
     JOIN students s ON a.student_id = s.id
     JOIN faculty f ON a.faculty_id = f.id
     WHERE a.course_id = ?${dateFilter}
     ORDER BY a.class_date DESC, s.full_name ASC`,
    params
  );
  return rows;
};

const findByStudent = async (student_id, course_id = null) => {
  const params = [student_id];
  let courseFilter = '';
  if (course_id) {
    courseFilter = ' AND a.course_id = ?';
    params.push(course_id);
  }
  const [rows] = await pool.execute(
    `SELECT a.id, a.class_date, a.status, a.remarks,
            c.title AS course_title, c.course_code
     FROM attendance a
     JOIN courses c ON a.course_id = c.id
     WHERE a.student_id = ?${courseFilter}
     ORDER BY a.class_date DESC`,
    params
  );
  return rows;
};

const getAttendanceSummary = async (student_id) => {
  const [rows] = await pool.execute(
    `SELECT c.id AS course_id, c.title AS course_title, c.course_code,
            COUNT(a.id) AS total_classes,
            SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) AS present_count,
            SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) AS absent_count,
            SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) AS late_count,
            ROUND(
              SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) /
              NULLIF(COUNT(a.id), 0) * 100, 2
            ) AS percentage
     FROM attendance a
     JOIN courses c ON a.course_id = c.id
     WHERE a.student_id = ?
     GROUP BY c.id, c.title, c.course_code`,
    [student_id]
  );
  return rows;
};

const upsert = async (attendanceData) => {
  const { enrollment_id, course_id, student_id, faculty_id, class_date, status, remarks } = attendanceData;
  await pool.execute(
    `INSERT INTO attendance (enrollment_id, course_id, student_id, faculty_id, class_date, status, remarks)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE status = VALUES(status), remarks = VALUES(remarks), updated_at = NOW()`,
    [enrollment_id, course_id, student_id, faculty_id, class_date, status, remarks || null]
  );
};

const bulkUpsert = async (records) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    for (const rec of records) {
      await conn.execute(
        `INSERT INTO attendance (enrollment_id, course_id, student_id, faculty_id, class_date, status, remarks)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE status = VALUES(status), remarks = VALUES(remarks), updated_at = NOW()`,
        [rec.enrollment_id, rec.course_id, rec.student_id, rec.faculty_id,
         rec.class_date, rec.status, rec.remarks || null]
      );
    }
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

module.exports = { findByCourse, findByStudent, getAttendanceSummary, upsert, bulkUpsert };
