const enrollmentRepo = require('../repositories/enrollmentRepository');
const courseRepo = require('../repositories/courseRepository');
const studentRepo = require('../repositories/studentRepository');
const { AppError } = require('../utils/AppError');

const getAll = async (filters) => enrollmentRepo.findAll(filters);

const enroll = async (student_id, course_id) => {
  const student = await studentRepo.findById(student_id);
  if (!student) throw new AppError('Student not found', 404);

  const course = await courseRepo.findById(course_id);
  if (!course) throw new AppError('Course not found', 404);

  // ── Semester validation ─────────────────────────────────────
  if (course.semester !== student.current_semester) {
    throw new AppError(
      `This student is in Semester ${student.current_semester}. Only Semester ${student.current_semester} courses can be enrolled.`,
      400
    );
  }

  // ── Department validation ───────────────────────────────────
  if (course.department_id !== student.department_id) {
    throw new AppError(
      `Course department (${course.department_name}) does not match student department (${student.department_name}).`,
      400
    );
  }

  if (course.enrolled_count >= course.max_students) {
    throw new AppError('Course has reached maximum enrollment capacity', 400);
  }

  const existing = await enrollmentRepo.findByStudentAndCourse(student_id, course_id);
  if (existing) {
    if (existing.status === 'active') throw new AppError('Student is already enrolled in this course', 409);
    // Re-activate dropped enrollment
    return enrollmentRepo.updateStatus(existing.id, 'active');
  }

  return enrollmentRepo.create(student_id, course_id);
};

const updateStatus = async (id, status) => {
  const enrollment = await enrollmentRepo.findById(id);
  if (!enrollment) throw new AppError('Enrollment not found', 404);
  return enrollmentRepo.updateStatus(id, status);
};

const getStudentEnrollments = async (student_id) => {
  return enrollmentRepo.getStudentEnrollments(student_id);
};

module.exports = { getAll, enroll, updateStatus, getStudentEnrollments };
