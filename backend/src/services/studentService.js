const studentRepo = require('../repositories/studentRepository');
const authService = require('./authService');
const { AppError } = require('../utils/AppError');

const getAll = async (filters) => studentRepo.findAll(filters);

const getById = async (id) => {
  const student = await studentRepo.findById(id);
  if (!student) throw new AppError('Student not found', 404);
  return student;
};

const create = async (data) => {
  const existing = await studentRepo.findByEmail(data.email);
  if (existing) throw new AppError('Email already in use', 409);

  const roll = await studentRepo.findByRoll(data.roll_number);
  if (roll) throw new AppError('Roll number already in use', 409);

  const password_hash = await authService.hashPassword(data.password);
  return studentRepo.create({ ...data, password_hash });
};

const update = async (id, data) => {
  await getById(id); // ensure exists
  return studentRepo.update(id, data);
};

const remove = async (id) => {
  await getById(id); // ensure exists
  await studentRepo.remove(id);
};

module.exports = { getAll, getById, create, update, remove };
