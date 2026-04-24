const courseService = require('../services/courseService');

const getAll = async (req, res, next) => {
  try {
    const { page, limit, search, department_id, semester, faculty_id } = req.query;
    const result = await courseService.getAll({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      search: search || '',
      department_id: department_id ? parseInt(department_id) : undefined,
      semester: semester ? parseInt(semester) : undefined,
      faculty_id: faculty_id ? parseInt(faculty_id) : undefined,
    });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const course = await courseService.getById(parseInt(req.params.id));
    res.json({ success: true, data: course });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const course = await courseService.create(req.body);
    res.status(201).json({ success: true, data: course });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const course = await courseService.update(parseInt(req.params.id), req.body);
    res.json({ success: true, data: course });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await courseService.remove(parseInt(req.params.id));
    res.json({ success: true, message: 'Course deactivated successfully' });
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, update, remove };
