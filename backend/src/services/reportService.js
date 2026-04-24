const reportRepo = require('../repositories/reportRepository');

const getDepartmentAcademicReport = async () => {
  return reportRepo.getDepartmentAcademicReport();
};

const getCourseGradeReport = async (course_id) => {
  if (!course_id) throw new Error('Course ID constitutes a required parameter.');
  return reportRepo.getCourseGradeReport(course_id);
};

module.exports = { getDepartmentAcademicReport, getCourseGradeReport };
