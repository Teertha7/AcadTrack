const express = require('express');
const facultyController = require('../controllers/facultyController');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const { createFacultySchema, updateFacultySchema } = require('../validations/facultyValidation');

const router = express.Router();
router.use(authenticate);

router.get('/', authorize('admin'), facultyController.getAll);
router.get('/:id', authorize('admin'), facultyController.getById);
router.post('/', authorize('admin'), validate(createFacultySchema), facultyController.create);
router.put('/:id', authorize('admin'), validate(updateFacultySchema), facultyController.update);
router.delete('/:id', authorize('admin'), facultyController.remove);

module.exports = router;
