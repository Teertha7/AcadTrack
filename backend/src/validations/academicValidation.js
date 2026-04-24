const Joi = require('joi');

const createCourseSchema = Joi.object({
  department_id: Joi.number().integer().positive().required(),
  faculty_id: Joi.number().integer().positive().optional().allow(null),
  course_code: Joi.string().max(30).required(),
  title: Joi.string().max(200).required(),
  description: Joi.string().optional().allow('', null),
  credits: Joi.number().integer().min(1).max(10).default(3),
  semester: Joi.number().integer().min(1).max(12).required(),
  max_students: Joi.number().integer().min(1).max(500).default(60),
});

const updateCourseSchema = Joi.object({
  faculty_id: Joi.number().integer().positive().optional().allow(null),
  title: Joi.string().max(200).optional(),
  description: Joi.string().optional().allow('', null),
  credits: Joi.number().integer().min(1).max(10).optional(),
  semester: Joi.number().integer().min(1).max(12).optional(),
  max_students: Joi.number().integer().min(1).max(500).optional(),
  is_active: Joi.number().integer().valid(0, 1).optional(),
});

const enrollSchema = Joi.object({
  student_id: Joi.number().integer().positive().required(),
  course_id: Joi.number().integer().positive().required(),
});

const updateEnrollmentSchema = Joi.object({
  status: Joi.string().valid('active', 'dropped', 'completed').required(),
});

const bulkAttendanceSchema = Joi.object({
  course_id: Joi.number().integer().positive().required(),
  class_date: Joi.date().iso().required(),
  records: Joi.array().items(
    Joi.object({
      student_id: Joi.number().integer().positive().required(),
      status: Joi.string().valid('present', 'absent', 'late', 'excused').required(),
      remarks: Joi.string().optional().allow('', null),
    })
  ).min(1).required(),
});

const gradeSchema = Joi.object({
  student_id: Joi.number().integer().positive().required(),
  course_id: Joi.number().integer().positive().required(),
  internal_marks: Joi.number().min(0).max(100).optional().allow(null),
  midterm_marks: Joi.number().min(0).max(100).optional().allow(null),
  final_marks: Joi.number().min(0).max(100).optional().allow(null),
  remarks: Joi.string().optional().allow('', null),
});

const createFeeSchema = Joi.object({
  student_id: Joi.number().integer().positive().required(),
  fee_type: Joi.string().valid('tuition', 'hostel', 'library', 'lab', 'exam', 'other').required(),
  description: Joi.string().optional().allow('', null),
  amount: Joi.number().positive().required(),
  due_date: Joi.date().iso().required(),
  academic_year: Joi.string().max(10).required(),
  semester: Joi.number().integer().min(1).max(12).optional().allow(null),
});

const recordPaymentSchema = Joi.object({
  fee_id: Joi.number().integer().positive().required(),
  student_id: Joi.number().integer().positive().required(),
  amount_paid: Joi.number().positive().required(),
  payment_method: Joi.string().valid('cash', 'online', 'bank_transfer', 'cheque', 'upi').required(),
  transaction_ref: Joi.string().optional().allow('', null),
  notes: Joi.string().optional().allow('', null),
});

const createMaterialSchema = Joi.object({
  title: Joi.string().max(255).required(),
  description: Joi.string().optional().allow('', null),
  material_type: Joi.string().valid('lecture', 'assignment', 'reference', 'lab', 'other').default('lecture'),
});

module.exports = {
  createCourseSchema, updateCourseSchema,
  enrollSchema, updateEnrollmentSchema,
  bulkAttendanceSchema, gradeSchema,
  createFeeSchema, recordPaymentSchema,
  createMaterialSchema,
};
