const express = require('express');
const gradeController = require('../controllers/gradeController');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const { gradeSchema } = require('../validations/academicValidation');

const router = express.Router();
router.use(authenticate);

router.post('/', authorize('faculty', 'admin'), validate(gradeSchema), gradeController.upsert);
router.get('/course/:courseId', authorize('faculty', 'admin'), gradeController.getByCourse);
router.get('/student/:studentId', authorize('admin'), gradeController.getStudentGrades);
router.get('/my', authorize('student'), gradeController.getMyGrades);

module.exports = router;
