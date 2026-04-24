const attendanceRepo = require('../repositories/attendanceRepository');
const enrollmentRepo = require('../repositories/enrollmentRepository');
const { AppError } = require('../utils/AppError');

const getByCourse = async (course_id, date) => {
  return attendanceRepo.findByCourse(course_id, date);
};

const getByStudent = async (student_id, course_id) => {
  return attendanceRepo.findByStudent(student_id, course_id);
};

const getStudentSummary = async (student_id) => {
  return attendanceRepo.getAttendanceSummary(student_id);
};

const markBulk = async (course_id, faculty_id, class_date, records) => {
  // Validate all students are enrolled
  const enriched = [];
  for (const rec of records) {
    const enrollment = await enrollmentRepo.findByStudentAndCourse(rec.student_id, course_id);
    if (!enrollment || enrollment.status !== 'active') {
      throw new AppError(`Student ${rec.student_id} is not actively enrolled in this course`, 400);
    }
    enriched.push({
      enrollment_id: enrollment.id,
      course_id,
      student_id: rec.student_id,
      faculty_id,
      class_date,
      status: rec.status,
      remarks: rec.remarks,
    });
  }
  await attendanceRepo.bulkUpsert(enriched);
  return getByCourse(course_id, class_date);
};

module.exports = { getByCourse, getByStudent, getStudentSummary, markBulk };
