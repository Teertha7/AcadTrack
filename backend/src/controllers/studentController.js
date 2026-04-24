const studentService = require('../services/studentService');

const getAll = async (req, res, next) => {
  try {
    const { page, limit, search, department_id } = req.query;
    const result = await studentService.getAll({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      search: search || '',
      department_id: department_id ? parseInt(department_id) : undefined,
    });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const student = await studentService.getById(parseInt(req.params.id));
    res.json({ success: true, data: student });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const student = await studentService.create(req.body);
    res.status(201).json({ success: true, data: student });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const student = await studentService.update(parseInt(req.params.id), req.body);
    res.json({ success: true, data: student });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await studentService.remove(parseInt(req.params.id));
    res.json({ success: true, message: 'Student deactivated successfully' });
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, update, remove };
