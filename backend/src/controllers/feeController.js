const feeService = require('../services/feeService');

const getAllFees = async (req, res, next) => {
  try {
    const { page, limit, student_id, status, fee_type, academic_year } = req.query;
    const result = await feeService.getAllFees({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      student_id: student_id ? parseInt(student_id) : undefined,
      status, fee_type, academic_year,
    });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

const getMyFees = async (req, res, next) => {
  try {
    const result = await feeService.getAllFees({ student_id: req.user.id });
    const summary = await feeService.getStudentFeeSummary(req.user.id);
    res.json({ success: true, ...result, summary });
  } catch (err) { next(err); }
};

const createFee = async (req, res, next) => {
  try {
    const fee = await feeService.createFee(req.body);
    res.status(201).json({ success: true, data: fee });
  } catch (err) { next(err); }
};

const updateFee = async (req, res, next) => {
  try {
    const fee = await feeService.updateFee(parseInt(req.params.id), req.body);
    res.json({ success: true, data: fee });
  } catch (err) { next(err); }
};

const getAllPayments = async (req, res, next) => {
  try {
    const { page, limit, student_id, fee_id } = req.query;
    const result = await feeService.getAllPayments({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      student_id: student_id ? parseInt(student_id) : undefined,
      fee_id: fee_id ? parseInt(fee_id) : undefined,
    });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

const recordPayment = async (req, res, next) => {
  try {
    const payment = await feeService.recordPayment({
      ...req.body,
      received_by: req.user.id,
    });
    res.status(201).json({ success: true, data: payment });
  } catch (err) { next(err); }
};

module.exports = { getAllFees, getMyFees, createFee, updateFee, getAllPayments, recordPayment };
