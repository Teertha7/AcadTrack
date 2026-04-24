const courseRepo = require('../repositories/courseRepository');
const facultyRepo = require('../repositories/facultyRepository');
const { AppError } = require('../utils/AppError');

const getAll = async (filters) => courseRepo.findAll(filters);

const getById = async (id) => {
  const course = await courseRepo.findById(id);
  if (!course) throw new AppError('Course not found', 404);
  return course;
};

// Validate that the faculty belongs to the same department as the course
const validateFacultyDept = async (faculty_id, department_id) => {
  if (!faculty_id) return; // faculty assignment is optional
  const faculty = await facultyRepo.findById(parseInt(faculty_id));
  if (!faculty) throw new AppError('Faculty member not found', 404);
  if (String(faculty.department_id) !== String(department_id)) {
    throw new AppError(
      `Faculty "${faculty.full_name}" belongs to ${faculty.department_name}, not this course's department. Assign faculty from the same department.`,
      400
    );
  }
};

const create = async (data) => {
  const existing = await courseRepo.findByCourseCode(data.course_code);
  if (existing) throw new AppError('Course code already in use', 409);
  await validateFacultyDept(data.faculty_id, data.department_id);
  return courseRepo.create(data);
};

const update = async (id, data) => {
  const course = await getById(id);
  // Use updated dept if provided, else existing
  const deptId = data.department_id || course.department_id;
  await validateFacultyDept(data.faculty_id, deptId);
  return courseRepo.update(id, data);
};

const remove = async (id) => {
  await getById(id);
  await courseRepo.remove(id);
};

module.exports = { getAll, getById, create, update, remove };
