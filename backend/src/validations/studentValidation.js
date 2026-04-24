const Joi = require('joi');

const createStudentSchema = Joi.object({
  department_id: Joi.number().integer().positive().required(),
  roll_number: Joi.string().max(30).required(),
  full_name: Joi.string().pattern(/^[A-Za-z ]+$/).message('Full name can only contain alphabets and spaces').max(150).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).message('Phone number must be exactly 10 digits').optional().allow('', null),
  date_of_birth: Joi.date().iso().optional().allow(null),
  gender: Joi.string().valid('male', 'female', 'other').optional().allow(null),
  address: Joi.string().optional().allow('', null),
  enrollment_year: Joi.number().integer().min(2000).max(2100).required(),
  current_semester: Joi.number().integer().min(1).max(12).default(1),
});

const updateStudentSchema = Joi.object({
  full_name: Joi.string().pattern(/^[A-Za-z ]+$/).message('Full name can only contain alphabets and spaces').max(150).optional(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).message('Phone number must be exactly 10 digits').optional().allow('', null),
  date_of_birth: Joi.date().iso().optional().allow(null),
  gender: Joi.string().valid('male', 'female', 'other').optional().allow(null),
  address: Joi.string().optional().allow('', null),
  current_semester: Joi.number().integer().min(1).max(12).optional(),
  department_id: Joi.number().integer().positive().optional(),
  is_active: Joi.number().integer().valid(0, 1).optional(),
});

module.exports = { createStudentSchema, updateStudentSchema };
