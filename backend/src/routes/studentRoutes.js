const express = require('express');
const studentController = require('../controllers/studentController');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const { createStudentSchema, updateStudentSchema } = require('../validations/studentValidation');

const router = express.Router();

router.use(authenticate);

router.get('/', authorize('admin', 'faculty'), studentController.getAll);
router.get('/:id', authorize('admin', 'faculty'), studentController.getById);
router.post('/', authorize('admin'), validate(createStudentSchema), studentController.create);
router.put('/:id', authorize('admin'), validate(updateStudentSchema), studentController.update);
router.delete('/:id', authorize('admin'), studentController.remove);

module.exports = router;
