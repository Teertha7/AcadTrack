const departmentRepo = require('../repositories/departmentRepository');

const getAll = async (req, res, next) => {
  try {
    const data = await departmentRepo.findAll();
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const data = await departmentRepo.findById(parseInt(req.params.id));
    if (!data) return res.status(404).json({ success: false, message: 'Department not found' });
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const data = await departmentRepo.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const data = await departmentRepo.update(parseInt(req.params.id), req.body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await departmentRepo.remove(parseInt(req.params.id));
    res.json({ success: true, message: 'Department deleted' });
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, update, remove };
