const express = require('express');
const reportController = require('../controllers/reportController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// Reports are restricted to admin only
router.get('/department-academic', authorize('admin'), reportController.getDepartmentAcademicReport);
router.get('/course-grade/:courseId', authorize('admin'), reportController.getCourseGradeReport);

module.exports = router;
