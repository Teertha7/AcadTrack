const express = require('express');
const departmentController = require('../controllers/departmentController');
const analyticsController = require('../controllers/analyticsController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/departments', departmentController.getAll);
router.post('/departments', authorize('admin'), departmentController.create);
router.put('/departments/:id', authorize('admin'), departmentController.update);
router.delete('/departments/:id', authorize('admin'), departmentController.remove);

router.get('/analytics', authorize('admin'), analyticsController.getAdminStats);

module.exports = router;
