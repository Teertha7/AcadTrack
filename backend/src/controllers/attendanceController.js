const attendanceService = require('../services/attendanceService');

const getByCourse = async (req, res, next) => {
  try {
    const data = await attendanceService.getByCourse(
      parseInt(req.params.courseId),
      req.query.date
    );
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getMyAttendance = async (req, res, next) => {
  try {
    const data = await attendanceService.getByStudent(
      req.user.id,
      req.query.course_id ? parseInt(req.query.course_id) : undefined
    );
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getMyAttendanceSummary = async (req, res, next) => {
  try {
    const data = await attendanceService.getStudentSummary(req.user.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getStudentAttendanceSummary = async (req, res, next) => {
  try {
    const data = await attendanceService.getStudentSummary(parseInt(req.params.studentId));
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const markBulk = async (req, res, next) => {
  try {
    const { course_id, class_date, records } = req.body;
    const data = await attendanceService.markBulk(
      course_id,
      req.user.id,
      class_date,
      records
    );
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

module.exports = { getByCourse, getMyAttendance, getMyAttendanceSummary, getStudentAttendanceSummary, markBulk };
