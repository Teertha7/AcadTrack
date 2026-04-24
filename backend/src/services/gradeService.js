const gradeRepo = require('../repositories/gradeRepository');
const enrollmentRepo = require('../repositories/enrollmentRepository');
const { AppError } = require('../utils/AppError');

const calculateGradeLetter = (total) => {
  if (total >= 90) return { letter: 'O', point: 10.0 };
  if (total >= 80) return { letter: 'A+', point: 9.0 };
  if (total >= 70) return { letter: 'A', point: 8.0 };
  if (total >= 60) return { letter: 'B+', point: 7.0 };
  if (total >= 50) return { letter: 'B', point: 6.0 };
  if (total >= 40) return { letter: 'C', point: 5.0 };
  return { letter: 'F', point: 0.0 };
};

const getByCourse = async (course_id) => gradeRepo.findByCourse(course_id);

const getByStudent = async (student_id) => gradeRepo.findByStudent(student_id);

const upsert = async (data, faculty_id) => {
  const enrollment = await enrollmentRepo.findByStudentAndCourse(data.student_id, data.course_id);
  if (!enrollment || enrollment.status !== 'active') {
    throw new AppError('Student is not actively enrolled in this course', 400);
  }

  const internal = parseFloat(data.internal_marks || 0);
  const midterm = parseFloat(data.midterm_marks || 0);
  const final = parseFloat(data.final_marks || 0);
  const total = internal + midterm + final;

  const { letter, point } = calculateGradeLetter(total);

  return gradeRepo.upsert({
    enrollment_id: enrollment.id,
    student_id: data.student_id,
    course_id: data.course_id,
    internal_marks: data.internal_marks || null,
    midterm_marks: data.midterm_marks || null,
    final_marks: data.final_marks || null,
    grade_letter: letter,
    grade_point: point,
    remarks: data.remarks || null,
    graded_by: faculty_id,
  });
};

const getStudentGPA = async (student_id) => gradeRepo.getStudentGPA(student_id);

module.exports = { getByCourse, getByStudent, upsert, getStudentGPA };
