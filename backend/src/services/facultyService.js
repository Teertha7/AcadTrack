const facultyRepo = require('../repositories/facultyRepository');
const authService = require('./authService');
const { AppError } = require('../utils/AppError');

const getAll = async (filters) => facultyRepo.findAll(filters);

const getById = async (id) => {
  const faculty = await facultyRepo.findById(id);
  if (!faculty) throw new AppError('Faculty member not found', 404);
  return faculty;
};

const create = async (data) => {
  const existing = await facultyRepo.findByEmail(data.email);
  if (existing) throw new AppError('Email already in use', 409);
  const password_hash = await authService.hashPassword(data.password);
  return facultyRepo.create({ ...data, password_hash });
};

const update = async (id, data) => {
  await getById(id);
  return facultyRepo.update(id, data);
};

const remove = async (id) => {
  await getById(id);
  await facultyRepo.remove(id);
};

module.exports = { getAll, getById, create, update, remove };
