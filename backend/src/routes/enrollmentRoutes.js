const express = require('express');
const enrollmentController = require('../controllers/enrollmentController');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const { enrollSchema, updateEnrollmentSchema } = require('../validations/academicValidation');

const router = express.Router();
router.use(authenticate);

router.get('/', authorize('admin', 'faculty'), enrollmentController.getAll);
router.post('/', authorize('admin'), validate(enrollSchema), enrollmentController.enroll);
router.put('/:id/status', authorize('admin'), validate(updateEnrollmentSchema), enrollmentController.updateStatus);
router.get('/my', authorize('student'), enrollmentController.getMyEnrollments);

module.exports = router;
