const feeRepo = require('../repositories/feeRepository');
const paymentRepo = require('../repositories/paymentRepository');
const { AppError } = require('../utils/AppError');

const getAllFees = async (filters) => feeRepo.findAll(filters);

const getFeeById = async (id) => {
  const fee = await feeRepo.findById(id);
  if (!fee) throw new AppError('Fee record not found', 404);
  return fee;
};

const createFee = async (data) => feeRepo.create(data);

const updateFee = async (id, data) => {
  await getFeeById(id);
  return feeRepo.update(id, data);
};

const getStudentFeeSummary = async (student_id) => feeRepo.getStudentFeeSummary(student_id);

const getAllPayments = async (filters) => paymentRepo.findAll(filters);

const recordPayment = async (data) => {
  const fee = await getFeeById(data.fee_id);
  if (fee.status === 'paid') throw new AppError('Fee is already fully paid', 400);
  if (fee.status === 'waived') throw new AppError('Fee has been waived', 400);
  return paymentRepo.create(data);
};

module.exports = { getAllFees, getFeeById, createFee, updateFee, getStudentFeeSummary, getAllPayments, recordPayment };
