const express = require('express');
const courseController = require('../controllers/courseController');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const { createCourseSchema, updateCourseSchema } = require('../validations/academicValidation');

const router = express.Router();
router.use(authenticate);

router.get('/', courseController.getAll);
router.get('/:id', courseController.getById);
router.post('/', authorize('admin'), validate(createCourseSchema), courseController.create);
router.put('/:id', authorize('admin'), validate(updateCourseSchema), courseController.update);
router.delete('/:id', authorize('admin'), courseController.remove);

module.exports = router;
