const enrollmentService = require('../services/enrollmentService');

const getAll = async (req, res, next) => {
  try {
    const { page, limit, student_id, course_id, status } = req.query;
    const result = await enrollmentService.getAll({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      student_id: student_id ? parseInt(student_id) : undefined,
      course_id: course_id ? parseInt(course_id) : undefined,
      status,
    });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

const enroll = async (req, res, next) => {
  try {
    const { student_id, course_id } = req.body;
    const enrollment = await enrollmentService.enroll(student_id, course_id);
    res.status(201).json({ success: true, data: enrollment });
  } catch (err) { next(err); }
};

const updateStatus = async (req, res, next) => {
  try {
    const enrollment = await enrollmentService.updateStatus(parseInt(req.params.id), req.body.status);
    res.json({ success: true, data: enrollment });
  } catch (err) { next(err); }
};

const getMyEnrollments = async (req, res, next) => {
  try {
    const data = await enrollmentService.getStudentEnrollments(req.user.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

module.exports = { getAll, enroll, updateStatus, getMyEnrollments };
