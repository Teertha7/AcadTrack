const courseMaterialService = require('../services/courseMaterialService');

const getByCourse = async (req, res, next) => {
  try {
    const course_id = parseInt(req.params.courseId);
    const materials = await courseMaterialService.getMaterialsByCourse(course_id, req.user);
    res.json({ success: true, data: materials });
  } catch (err) { next(err); }
};

const upload = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const course_id = parseInt(req.params.courseId);
    const material = await courseMaterialService.upload(course_id, req.file, req.body, req.user);
    res.status(201).json({ success: true, data: material });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const course_id = parseInt(req.params.courseId);
    const material_id = parseInt(req.params.materialId);
    await courseMaterialService.remove(course_id, material_id, req.user);
    res.json({ success: true, message: 'Material deleted successfully' });
  } catch (err) { next(err); }
};

module.exports = { getByCourse, upload, remove };
