const { pool } = require('../config/database');

const getAdminStats = async () => {
  const [[students]] = await pool.execute('SELECT COUNT(*) AS count FROM students WHERE is_active = 1');
  const [[faculty]] = await pool.execute('SELECT COUNT(*) AS count FROM faculty WHERE is_active = 1');
  const [[courses]] = await pool.execute('SELECT COUNT(*) AS count FROM courses WHERE is_active = 1');
  const [[enrollments]] = await pool.execute("SELECT COUNT(*) AS count FROM enrollments WHERE status = 'active'");
  const [[revenue]] = await pool.execute("SELECT COALESCE(SUM(amount_paid), 0) AS total FROM payments WHERE YEAR(payment_date) = YEAR(NOW())");
  const [[pending_fees]] = await pool.execute("SELECT COALESCE(SUM(amount), 0) AS total FROM fees WHERE status IN ('pending','overdue')");

  const [recentStudents] = await pool.execute(
    `SELECT s.id, s.full_name, s.roll_number, s.email, d.name AS department, s.created_at
     FROM students s JOIN departments d ON s.department_id = d.id
     ORDER BY s.created_at DESC LIMIT 5`
  );

  const [deptStats] = await pool.execute(
    `SELECT d.name, COUNT(s.id) AS student_count
     FROM departments d LEFT JOIN students s ON s.department_id = d.id AND s.is_active = 1
     GROUP BY d.id, d.name ORDER BY student_count DESC`
  );

  return {
    totals: {
      students: students.count,
      faculty: faculty.count,
      courses: courses.count,
      enrollments: enrollments.count,
    },
    finance: {
      annual_revenue: parseFloat(revenue.total),
      pending_fees: parseFloat(pending_fees.total),
    },
    recent_students: recentStudents,
    department_stats: deptStats,
  };
};

module.exports = { getAdminStats };
