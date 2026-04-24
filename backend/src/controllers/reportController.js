const reportService = require('../services/reportService');

const getDepartmentAcademicReport = async (req, res, next) => {
  try {
    const data = await reportService.getDepartmentAcademicReport();
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getCourseGradeReport = async (req, res, next) => {
  try {
    const data = await reportService.getCourseGradeReport(parseInt(req.params.courseId));
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

module.exports = { getDepartmentAcademicReport, getCourseGradeReport };
