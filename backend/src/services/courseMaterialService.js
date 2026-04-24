const path = require('path');
const fs = require('fs');
const materialRepo = require('../repositories/courseMaterialRepository');
const courseRepo = require('../repositories/courseRepository');
const enrollmentRepo = require('../repositories/enrollmentRepository');
const { AppError } = require('../utils/AppError');

/**
 * Verify the requesting user is allowed to access materials for this course.
 * - Admins: always allowed
 * - Faculty: must be the assigned faculty of this course
 * - Students: must be actively enrolled in this course
 */
const verifyAccess = async (course_id, user) => {
  const course = await courseRepo.findById(course_id);
  if (!course) throw new AppError('Course not found', 404);

  if (user.role === 'admin') return course;

  if (user.role === 'faculty') {
    if (String(course.faculty_id) !== String(user.id)) {
      throw new AppError('You are not assigned to this course', 403);
    }
    return course;
  }

  if (user.role === 'student') {
    const enrollment = await enrollmentRepo.findByStudentAndCourse(user.id, course_id);
    if (!enrollment || enrollment.status !== 'active') {
      throw new AppError('You are not enrolled in this course', 403);
    }
    return course;
  }

  throw new AppError('Forbidden', 403);
};

const getMaterialsByCourse = async (course_id, user) => {
  await verifyAccess(course_id, user);
  return materialRepo.findByCourse(course_id);
};

const upload = async (course_id, fileData, body, user) => {
  if (user.role !== 'faculty') throw new AppError('Only faculty can upload materials', 403);
  await verifyAccess(course_id, user);

  return materialRepo.create({
    course_id,
    uploaded_by: user.id,
    title: body.title,
    description: body.description || null,
    file_name: fileData.originalname,
    file_path: fileData.path,
    file_type: fileData.mimetype,
    file_size: fileData.size,
    material_type: body.material_type || 'lecture',
  });
};

const remove = async (course_id, material_id, user) => {
  const material = await materialRepo.findById(material_id);
  if (!material) throw new AppError('Material not found', 404);
  if (String(material.course_id) !== String(course_id)) {
    throw new AppError('Material does not belong to this course', 400);
  }

  // Only the uploader (faculty) or admin can delete
  if (user.role !== 'admin' && String(material.uploaded_by) !== String(user.id)) {
    throw new AppError('You do not have permission to delete this material', 403);
  }

  // Remove physical file
  try {
    if (fs.existsSync(material.file_path)) fs.unlinkSync(material.file_path);
  } catch (e) {
    // Non-fatal — proceed even if file deletion fails
  }

  await materialRepo.remove(material_id);
};

module.exports = { getMaterialsByCourse, upload, remove };
