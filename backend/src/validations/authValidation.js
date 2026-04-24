const Joi = require('joi');

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('admin', 'faculty', 'student').required(),
});

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
  role: Joi.string().valid('admin', 'faculty', 'student').required(),
});

const logoutSchema = Joi.object({
  refreshToken: Joi.string().required(),
  role: Joi.string().valid('admin', 'faculty', 'student').required(),
});

module.exports = { loginSchema, refreshSchema, logoutSchema };
