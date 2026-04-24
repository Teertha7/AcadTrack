const facultyService = require('../services/facultyService');

const getAll = async (req, res, next) => {
  try {
    const { page, limit, search, department_id } = req.query;
    const result = await facultyService.getAll({
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
    const faculty = await facultyService.getById(parseInt(req.params.id));
    res.json({ success: true, data: faculty });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const faculty = await facultyService.create(req.body);
    res.status(201).json({ success: true, data: faculty });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const faculty = await facultyService.update(parseInt(req.params.id), req.body);
    res.json({ success: true, data: faculty });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await facultyService.remove(parseInt(req.params.id));
    res.json({ success: true, message: 'Faculty deactivated successfully' });
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, update, remove };
