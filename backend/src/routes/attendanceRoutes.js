const express = require('express');
const attendanceController = require('../controllers/attendanceController');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const { bulkAttendanceSchema } = require('../validations/academicValidation');

const router = express.Router();
router.use(authenticate);

// Faculty: mark attendance for a course
router.post('/bulk', authorize('faculty', 'admin'), validate(bulkAttendanceSchema), attendanceController.markBulk);

// Faculty/Admin: view attendance for a course (optional ?date=YYYY-MM-DD)
router.get('/course/:courseId', authorize('faculty', 'admin'), attendanceController.getByCourse);

// Admin: view student's attendance summary
router.get('/student/:studentId/summary', authorize('admin'), attendanceController.getStudentAttendanceSummary);

// Student: view own attendance
router.get('/my', authorize('student'), attendanceController.getMyAttendance);
router.get('/my/summary', authorize('student'), attendanceController.getMyAttendanceSummary);

module.exports = router;
