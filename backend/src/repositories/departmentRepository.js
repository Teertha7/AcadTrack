const { pool } = require('../config/database');

const findAll = async () => {
  const [rows] = await pool.execute(
    'SELECT * FROM departments ORDER BY name ASC'
  );
  return rows;
};

const findById = async (id) => {
  const [rows] = await pool.execute('SELECT * FROM departments WHERE id = ?', [id]);
  return rows[0] || null;
};

const create = async (data) => {
  const { name, code, description } = data;
  const [result] = await pool.execute(
    'INSERT INTO departments (name, code, description) VALUES (?, ?, ?)',
    [name, code, description || null]
  );
  return findById(result.insertId);
};

const update = async (id, data) => {
  const { name, description } = data;
  await pool.execute(
    'UPDATE departments SET name = ?, description = ? WHERE id = ?',
    [name, description || null, id]
  );
  return findById(id);
};

const remove = async (id) => {
  await pool.execute('DELETE FROM departments WHERE id = ?', [id]);
};

module.exports = { findAll, findById, create, update, remove };
