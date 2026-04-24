const express = require('express');
const feeController = require('../controllers/feeController');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const { createFeeSchema, recordPaymentSchema } = require('../validations/academicValidation');

const router = express.Router();
router.use(authenticate);

// Fees
router.get('/', authorize('admin'), feeController.getAllFees);
router.get('/my', authorize('student'), feeController.getMyFees);
router.post('/', authorize('admin'), validate(createFeeSchema), feeController.createFee);
router.put('/:id', authorize('admin'), feeController.updateFee);

// Payments
router.get('/payments', authorize('admin'), feeController.getAllPayments);
router.post('/payments', authorize('admin'), validate(recordPaymentSchema), feeController.recordPayment);

module.exports = router;
