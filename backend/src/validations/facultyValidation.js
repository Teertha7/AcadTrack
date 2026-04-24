const Joi = require('joi');

const createFacultySchema = Joi.object({
  department_id: Joi.number().integer().positive().required(),
  full_name: Joi.string().pattern(/^[A-Za-z ]+$/).message('Full name can only contain alphabets and spaces').max(150).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).message('Phone number must be exactly 10 digits').optional().allow('', null),
  designation: Joi.string().max(100).optional().allow('', null),
  qualification: Joi.string().max(200).optional().allow('', null),
  joining_date: Joi.date().iso().optional().allow(null),
});

const updateFacultySchema = Joi.object({
  full_name: Joi.string().pattern(/^[A-Za-z ]+$/).message('Full name can only contain alphabets and spaces').max(150).optional(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).message('Phone number must be exactly 10 digits').optional().allow('', null),
  designation: Joi.string().max(100).optional().allow('', null),
  qualification: Joi.string().max(200).optional().allow('', null),
  joining_date: Joi.date().iso().optional().allow(null),
  department_id: Joi.number().integer().positive().optional(),
  is_active: Joi.number().integer().valid(0, 1).optional(),
});

module.exports = { createFacultySchema, updateFacultySchema };
