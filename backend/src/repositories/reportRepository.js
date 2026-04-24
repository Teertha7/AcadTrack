const { pool } = require('../config/database');

const getDepartmentAcademicReport = async () => {
  // Stored procedure returns an array of result sets. The first element is the actual data.
  const [rows] = await pool.execute('CALL GetDepartmentAcademicReport()');
  return rows[0]; 
};

const getCourseGradeReport = async (course_id) => {
  const [rows] = await pool.execute('CALL GetCourseGradeReport(?)', [course_id]);
  return rows[0];
};

module.exports = { getDepartmentAcademicReport, getCourseGradeReport };
