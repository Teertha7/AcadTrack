const gradeService = require('../services/gradeService');

const getByCourse = async (req, res, next) => {
  try {
    const data = await gradeService.getByCourse(parseInt(req.params.courseId));
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getMyGrades = async (req, res, next) => {
  try {
    const data = await gradeService.getByStudent(req.user.id);
    const gpa = await gradeService.getStudentGPA(req.user.id);
    res.json({ success: true, data, gpa });
  } catch (err) { next(err); }
};

const getStudentGrades = async (req, res, next) => {
  try {
    const data = await gradeService.getByStudent(parseInt(req.params.studentId));
    const gpa = await gradeService.getStudentGPA(parseInt(req.params.studentId));
    res.json({ success: true, data, gpa });
  } catch (err) { next(err); }
};

const upsert = async (req, res, next) => {
  try {
    const result = await gradeService.upsert(req.body, req.user.id);
    res.json({ success: true, message: 'Grade saved successfully', data: result });
  } catch (err) { next(err); }
};

module.exports = { getByCourse, getMyGrades, getStudentGrades, upsert };
