const { pool } = require('../config/database');

const findByCourse = async (course_id) => {
  const [rows] = await pool.execute(
    `SELECT cm.id, cm.title, cm.description, cm.file_name, cm.file_path,
            cm.file_type, cm.file_size, cm.material_type, cm.created_at,
            f.full_name AS uploaded_by_name, f.id AS uploaded_by
     FROM course_materials cm
     JOIN faculty f ON cm.uploaded_by = f.id
     WHERE cm.course_id = ?
     ORDER BY cm.material_type ASC, cm.created_at DESC`,
    [course_id]
  );
  return rows;
};

const findById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT cm.*, f.full_name AS uploaded_by_name
     FROM course_materials cm
     JOIN faculty f ON cm.uploaded_by = f.id
     WHERE cm.id = ?`,
    [id]
  );
  return rows[0] || null;
};

const create = async (data) => {
  const { course_id, uploaded_by, title, description, file_name, file_path, file_type, file_size, material_type } = data;
  const [result] = await pool.execute(
    `INSERT INTO course_materials
       (course_id, uploaded_by, title, description, file_name, file_path, file_type, file_size, material_type)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [course_id, uploaded_by, title, description || null, file_name, file_path,
     file_type || null, file_size || null, material_type || 'lecture']
  );
  return findById(result.insertId);
};

const remove = async (id) => {
  await pool.execute('DELETE FROM course_materials WHERE id = ?', [id]);
};

module.exports = { findByCourse, findById, create, remove };
