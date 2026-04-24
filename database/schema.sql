-- ============================================================
--  AcadTrack — Full Production Database Schema
--  Engine: MySQL 8.0+  |  Charset: utf8mb4
-- ============================================================

CREATE DATABASE IF NOT EXISTS acad_track
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE acad_track;

SET FOREIGN_KEY_CHECKS = 0;

-- ────────────────────────────────────────────────────────────
-- 1. DEPARTMENTS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS departments (
  id            INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  name          VARCHAR(120)     NOT NULL,
  code          VARCHAR(20)      NOT NULL,
  description   TEXT,
  created_at    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_dept_code (code)
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- 2. ADMINS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admins (
  id            INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  full_name     VARCHAR(150)     NOT NULL,
  email         VARCHAR(200)     NOT NULL,
  password_hash VARCHAR(255)     NOT NULL,
  phone         VARCHAR(20),
  is_active     TINYINT(1)       NOT NULL DEFAULT 1,
  created_at    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_admin_email (email),
  INDEX idx_admin_active (is_active)
  CONSTRAINT chk_admin_phone CHECK (phone IS NULL OR phone REGEXP '^[0-9]{10}$')
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- 3. FACULTY
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS faculty (
  id              INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  department_id   INT UNSIGNED   NOT NULL,
  full_name       VARCHAR(150)   NOT NULL,
  email           VARCHAR(200)   NOT NULL,
  password_hash   VARCHAR(255)   NOT NULL,
  phone           VARCHAR(20),
  designation     VARCHAR(100),
  qualification   VARCHAR(200),
  joining_date    DATE,
  is_active       TINYINT(1)     NOT NULL DEFAULT 1,
  created_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_faculty_email (email),
  INDEX idx_faculty_dept (department_id),
  INDEX idx_faculty_active (is_active),
  CONSTRAINT fk_faculty_dept FOREIGN KEY (department_id)
    REFERENCES departments (id) ON UPDATE CASCADE ON DELETE RESTRICT,

  CONSTRAINT chk_faculty_name  CHECK (full_name REGEXP '^[A-Za-z ]+$'),
  CONSTRAINT chk_faculty_phone CHECK (phone IS NULL OR phone REGEXP '^[0-9]{10}$')
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- 4. STUDENTS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS students (
  id                INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  department_id     INT UNSIGNED     NOT NULL,
  roll_number       VARCHAR(30)      NOT NULL,
  full_name         VARCHAR(150)     NOT NULL,
  email             VARCHAR(200)     NOT NULL,
  password_hash     VARCHAR(255)     NOT NULL,
  phone             VARCHAR(20),
  date_of_birth     DATE,
  gender            ENUM('male','female','other'),
  address           TEXT,
  enrollment_year   YEAR             NOT NULL,
  current_semester  TINYINT UNSIGNED NOT NULL DEFAULT 1,
  is_active         TINYINT(1)       NOT NULL DEFAULT 1,
  created_at        DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_student_roll (roll_number),
  UNIQUE KEY uq_student_email (email),
  INDEX idx_student_dept (department_id),
  INDEX idx_student_semester (current_semester),
  INDEX idx_student_active (is_active),
  CONSTRAINT fk_student_dept FOREIGN KEY (department_id)
    REFERENCES departments (id) ON UPDATE CASCADE ON DELETE RESTRICT,

  CONSTRAINT chk_student_name  CHECK (full_name REGEXP '^[A-Za-z ]+$'),
  CONSTRAINT chk_student_phone CHECK (phone IS NULL OR phone REGEXP '^[0-9]{10}$')
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- 5. COURSES
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS courses (
  id              INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  department_id   INT UNSIGNED   NOT NULL,
  faculty_id      INT UNSIGNED,
  course_code     VARCHAR(30)    NOT NULL,
  title           VARCHAR(200)   NOT NULL,
  description     TEXT,
  credits         TINYINT UNSIGNED NOT NULL DEFAULT 3,
  semester        TINYINT UNSIGNED NOT NULL,
  max_students    SMALLINT UNSIGNED NOT NULL DEFAULT 60,
  is_active       TINYINT(1)     NOT NULL DEFAULT 1,
  created_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_course_code (course_code),
  INDEX idx_course_dept (department_id),
  INDEX idx_course_faculty (faculty_id),
  INDEX idx_course_semester (semester),
  CONSTRAINT fk_course_dept FOREIGN KEY (department_id)
    REFERENCES departments (id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_course_faculty FOREIGN KEY (faculty_id)
    REFERENCES faculty (id) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- 6. ENROLLMENTS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS enrollments (
  id              INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  student_id      INT UNSIGNED   NOT NULL,
  course_id       INT UNSIGNED   NOT NULL,
  enrolled_at     DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status          ENUM('active','dropped','completed') NOT NULL DEFAULT 'active',
  created_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_enrollment (student_id, course_id),
  INDEX idx_enroll_course (course_id),
  INDEX idx_enroll_status (status),
  CONSTRAINT fk_enroll_student FOREIGN KEY (student_id)
    REFERENCES students (id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_enroll_course FOREIGN KEY (course_id)
    REFERENCES courses (id) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- 7. ATTENDANCE
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attendance (
  id              INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  enrollment_id   INT UNSIGNED   NOT NULL,
  course_id       INT UNSIGNED   NOT NULL,
  student_id      INT UNSIGNED   NOT NULL,
  faculty_id      INT UNSIGNED   NOT NULL,
  class_date      DATE           NOT NULL,
  status          ENUM('present','absent','late','excused') NOT NULL,
  remarks         VARCHAR(255),
  created_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_attendance (student_id, course_id, class_date),
  INDEX idx_att_enrollment (enrollment_id),
  INDEX idx_att_course_date (course_id, class_date),
  INDEX idx_att_student (student_id),
  CONSTRAINT fk_att_enrollment FOREIGN KEY (enrollment_id)
    REFERENCES enrollments (id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_att_course FOREIGN KEY (course_id)
    REFERENCES courses (id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_att_student FOREIGN KEY (student_id)
    REFERENCES students (id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_att_faculty FOREIGN KEY (faculty_id)
    REFERENCES faculty (id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- 8. GRADES
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS grades (
  id              INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  enrollment_id   INT UNSIGNED   NOT NULL,
  student_id      INT UNSIGNED   NOT NULL,
  course_id       INT UNSIGNED   NOT NULL,
  internal_marks  DECIMAL(5,2),
  midterm_marks   DECIMAL(5,2),
  final_marks     DECIMAL(5,2),
  total_marks     DECIMAL(5,2)   GENERATED ALWAYS AS (
                    COALESCE(internal_marks, 0) +
                    COALESCE(midterm_marks, 0) +
                    COALESCE(final_marks, 0)
                  ) STORED,
  grade_letter    VARCHAR(5),
  grade_point     DECIMAL(3,2),
  remarks         VARCHAR(255),
  graded_by       INT UNSIGNED,
  created_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_grade_enrollment (enrollment_id),
  INDEX idx_grade_student (student_id),
  INDEX idx_grade_course (course_id),
  CONSTRAINT fk_grade_enrollment FOREIGN KEY (enrollment_id)
    REFERENCES enrollments (id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_grade_student FOREIGN KEY (student_id)
    REFERENCES students (id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_grade_course FOREIGN KEY (course_id)
    REFERENCES courses (id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_grade_faculty FOREIGN KEY (graded_by)
    REFERENCES faculty (id) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- 9. FEES
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fees (
  id              INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  student_id      INT UNSIGNED   NOT NULL,
  fee_type        ENUM('tuition','hostel','library','lab','exam','other') NOT NULL DEFAULT 'tuition',
  description     VARCHAR(255),
  amount          DECIMAL(10,2)  NOT NULL,
  due_date        DATE           NOT NULL,
  academic_year   VARCHAR(10)    NOT NULL,
  semester        TINYINT UNSIGNED,
  status          ENUM('pending','partial','paid','waived','overdue') NOT NULL DEFAULT 'pending',
  created_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_fee_student (student_id),
  INDEX idx_fee_status (status),
  INDEX idx_fee_due (due_date),
  CONSTRAINT fk_fee_student FOREIGN KEY (student_id)
    REFERENCES students (id) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- 10. PAYMENTS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id                  INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  fee_id              INT UNSIGNED   NOT NULL,
  student_id          INT UNSIGNED   NOT NULL,
  amount_paid         DECIMAL(10,2)  NOT NULL,
  payment_method      ENUM('cash','online','bank_transfer','cheque','upi') NOT NULL,
  transaction_ref     VARCHAR(100),
  payment_date        DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  received_by         INT UNSIGNED,
  notes               TEXT,
  created_at          DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_pay_fee (fee_id),
  INDEX idx_pay_student (student_id),
  INDEX idx_pay_date (payment_date),
  CONSTRAINT fk_pay_fee FOREIGN KEY (fee_id)
    REFERENCES fees (id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_pay_student FOREIGN KEY (student_id)
    REFERENCES students (id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_pay_admin FOREIGN KEY (received_by)
    REFERENCES admins (id) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- 11. COURSE MATERIALS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS course_materials (
  id              INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  course_id       INT UNSIGNED   NOT NULL,
  uploaded_by     INT UNSIGNED   NOT NULL,
  title           VARCHAR(255)   NOT NULL,
  description     TEXT,
  file_name       VARCHAR(255)   NOT NULL,
  file_path       VARCHAR(500)   NOT NULL,
  file_type       VARCHAR(50),
  file_size       INT UNSIGNED,
  material_type   ENUM('lecture','assignment','reference','lab','other') NOT NULL DEFAULT 'lecture',
  created_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_cm_course (course_id),
  INDEX idx_cm_faculty (uploaded_by),
  CONSTRAINT fk_cm_course FOREIGN KEY (course_id)
    REFERENCES courses (id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_cm_faculty FOREIGN KEY (uploaded_by)
    REFERENCES faculty (id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- 12. REFRESH TOKENS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id              INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  user_id         INT UNSIGNED   NOT NULL,
  user_type       ENUM('admin','faculty','student') NOT NULL,
  token_hash      VARCHAR(255)   NOT NULL,
  expires_at      DATETIME       NOT NULL,
  is_revoked      TINYINT(1)     NOT NULL DEFAULT 0,
  created_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_rt_user (user_id, user_type),
  INDEX idx_rt_token (token_hash),
  INDEX idx_rt_expires (expires_at)
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;

-- ────────────────────────────────────────────────────────────
-- SEED: Default Admin
-- Password: Admin@1234 (bcrypt hash)
-- ────────────────────────────────────────────────────────────
INSERT INTO admins (full_name, email, password_hash, phone)
VALUES (
  'System Administrator',
  'admin@acadtrack.edu',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewwnslQRe0vHo1yS',
  '9000000000'
);

-- ────────────────────────────────────────────────────────────
-- SEED: Sample Departments
-- ────────────────────────────────────────────────────────────
INSERT INTO departments (name, code, description) VALUES
  ('Computer Science & Engineering', 'CSE', 'Undergraduate and postgraduate programs in CS and Engineering'),
  ('Electronics & Communication', 'ECE', 'Electronics, VLSI, and communication systems'),
  ('Mechanical Engineering', 'ME', 'Core mechanical, manufacturing, and thermal engineering'),
  ('Civil Engineering', 'CE', 'Structural, geotechnical, and transportation engineering'),
  ('Business Administration', 'MBA', 'Master of Business Administration programs');

-- ============================================================
-- STORED PROCEDURES
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- SP 1: GetStudentAttendanceSummary
--   Calculates attendance percentage for a given student
--   across all their enrolled courses.
--   If a specific course_id is given (> 0), it filters to
--   that course only; pass 0 to get all courses.
--
--   Usage:
--     CALL GetStudentAttendanceSummary(1, 0);   -- all courses
--     CALL GetStudentAttendanceSummary(1, 3);   -- course id 3
-- ────────────────────────────────────────────────────────────
DELIMITER $$

CREATE PROCEDURE IF NOT EXISTS GetStudentAttendanceSummary(
  IN  p_student_id  INT UNSIGNED,
  IN  p_course_id   INT UNSIGNED
)
BEGIN
  SELECT
    c.id                                        AS course_id,
    c.course_code,
    c.title                                     AS course_title,
    COUNT(a.id)                                 AS total_classes,
    SUM(CASE WHEN a.status = 'present' THEN 1
             WHEN a.status = 'late'    THEN 1
             ELSE 0 END)                        AS attended,
    SUM(CASE WHEN a.status = 'absent'  THEN 1 ELSE 0 END) AS absences,
    ROUND(
      SUM(CASE WHEN a.status IN ('present','late') THEN 1 ELSE 0 END)
      / NULLIF(COUNT(a.id), 0) * 100, 2
    )                                           AS attendance_percentage
  FROM enrollments e
  JOIN courses     c  ON c.id = e.course_id
  LEFT JOIN attendance a
         ON a.enrollment_id = e.id
  WHERE e.student_id = p_student_id
    AND e.status     = 'active'
    AND (p_course_id = 0 OR e.course_id = p_course_id)
  GROUP BY c.id, c.course_code, c.title
  ORDER BY c.semester ASC, c.title ASC;
END$$

-- ────────────────────────────────────────────────────────────
-- SP 2: GetCourseGradeReport
--   Returns a full grade report for every enrolled student
--   in a given course, including computed totals and letter
--   grades.
--
--   Usage:
--     CALL GetCourseGradeReport(2);
-- ────────────────────────────────────────────────────────────
CREATE PROCEDURE IF NOT EXISTS GetCourseGradeReport(
  IN p_course_id INT UNSIGNED
)
BEGIN
  SELECT
    s.roll_number,
    s.full_name                            AS student_name,
    COALESCE(g.internal_marks,  0)         AS internal_marks,
    COALESCE(g.midterm_marks,   0)         AS midterm_marks,
    COALESCE(g.final_marks,     0)         AS final_marks,
    COALESCE(g.total_marks,     0)         AS total_marks,
    COALESCE(g.grade_letter, 'N/A')        AS grade_letter,
    COALESCE(g.grade_point,     0)         AS grade_point,
    f.full_name                            AS graded_by
  FROM enrollments e
  JOIN students  s ON s.id = e.student_id
  LEFT JOIN grades   g ON g.enrollment_id = e.id
  LEFT JOIN faculty  f ON f.id = g.graded_by
  WHERE e.course_id = p_course_id
    AND e.status    = 'active'
  ORDER BY s.full_name ASC;
END$$

-- ────────────────────────────────────────────────────────────
-- SP 3: GetStudentFeeStatus
--   Returns all fee records for a student along with total
--   paid, balance remaining, and current status.
--
--   Usage:
--     CALL GetStudentFeeStatus(1);
-- ────────────────────────────────────────────────────────────
CREATE PROCEDURE IF NOT EXISTS GetStudentFeeStatus(
  IN p_student_id INT UNSIGNED
)
BEGIN
  SELECT
    f.id                                        AS fee_id,
    f.fee_type,
    f.description,
    f.amount                                    AS total_amount,
    f.due_date,
    f.academic_year,
    f.semester,
    COALESCE(SUM(p.amount_paid), 0)             AS amount_paid,
    (f.amount - COALESCE(SUM(p.amount_paid), 0))  AS balance,
    f.status
  FROM fees f
  LEFT JOIN payments p ON p.fee_id = f.id
  WHERE f.student_id = p_student_id
  GROUP BY f.id
  ORDER BY f.due_date ASC;
END$$

DELIMITER ;

-- ──────────────────────────────────────────────────────────
-- SP 4: GetDepartmentAcademicReport
--   Produces a department-level summary combining:
--     • Total active students and enrollments
--     • Average GPA (grade_point) across all graded students
--     • Overall attendance percentage (present + late)
--     • Fee collection rate (paid vs total fees issued)
--   Only departments with at least one active student are
--   included (HAVING filter).
--
--   Usage:
--     CALL GetDepartmentAcademicReport();
-- ──────────────────────────────────────────────────────────
DELIMITER $$

CREATE PROCEDURE IF NOT EXISTS GetDepartmentAcademicReport()
BEGIN
  SELECT
    d.id                                          AS department_id,
    d.name                                        AS department_name,
    d.code                                        AS department_code,

    -- Headcount
    COUNT(DISTINCT s.id)                          AS total_students,
    COUNT(DISTINCT e.id)                          AS total_enrollments,

    -- Academic performance: average GPA across graded enrollments
    ROUND(AVG(g.grade_point), 2)                  AS avg_gpa,

    -- Attendance: percentage of present/late records vs all records
    ROUND(
      SUM(CASE WHEN a.status IN ('present', 'late')
               THEN 1 ELSE 0 END)
      / NULLIF(COUNT(a.id), 0) * 100, 2
    )                                             AS attendance_pct,

    -- Fee collection: total paid vs total billed (subquery per dept)
    ROUND(
      fee_summary.total_paid
      / NULLIF(fee_summary.total_billed, 0) * 100, 2
    )                                             AS fee_collection_pct

  FROM departments d

  JOIN students   s  ON  s.department_id = d.id
                     AND s.is_active     = 1

  LEFT JOIN enrollments e ON  e.student_id = s.id
                           AND e.status     = 'active'

  LEFT JOIN grades    g  ON  g.enrollment_id = e.id

  LEFT JOIN attendance a ON  a.student_id = s.id

  -- Correlated subquery: aggregate fees + payments per department
  LEFT JOIN (
    SELECT
      s2.department_id,
      SUM(f.amount)                              AS total_billed,
      COALESCE(SUM(p.amount_paid), 0)           AS total_paid
    FROM      fees     f
    JOIN      students s2 ON s2.id = f.student_id
    LEFT JOIN payments p  ON p.fee_id = f.id
    GROUP BY s2.department_id
  ) fee_summary ON fee_summary.department_id = d.id

  GROUP BY  d.id, d.name, d.code,
            fee_summary.total_paid,
            fee_summary.total_billed

  HAVING    COUNT(DISTINCT s.id) > 0

  ORDER BY  d.name ASC;
END$$

DELIMITER ;

-- ============================================================
-- TRIGGERS
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- TRIGGER 1: trg_update_fee_status_on_payment
--   Fires AFTER a new payment row is inserted.
--   Automatically recalculates the total paid for the
--   associated fee and updates its status to:
--     'paid'    — if total paid >= fee amount
--     'partial' — if 0 < total paid < fee amount
--     'pending' — if no payment recorded yet
-- ────────────────────────────────────────────────────────────
DELIMITER $$

CREATE TRIGGER IF NOT EXISTS trg_update_fee_status_on_payment
AFTER INSERT ON payments
FOR EACH ROW
BEGIN
  DECLARE v_fee_amount   DECIMAL(10,2);
  DECLARE v_total_paid   DECIMAL(10,2);

  -- Fetch the original fee amount
  SELECT amount INTO v_fee_amount
  FROM fees WHERE id = NEW.fee_id;

  -- Sum all payments for this fee (including the one just inserted)
  SELECT COALESCE(SUM(amount_paid), 0) INTO v_total_paid
  FROM payments WHERE fee_id = NEW.fee_id;

  -- Update fee status based on amount paid
  IF v_total_paid >= v_fee_amount THEN
    UPDATE fees SET status = 'paid'    WHERE id = NEW.fee_id;
  ELSEIF v_total_paid > 0 THEN
    UPDATE fees SET status = 'partial' WHERE id = NEW.fee_id;
  ELSE
    UPDATE fees SET status = 'pending' WHERE id = NEW.fee_id;
  END IF;
END$$

-- ────────────────────────────────────────────────────────────
-- TRIGGER 2: trg_set_fee_overdue_insert
--   Fires BEFORE an INSERT on the fees table.
--   If the fee is entered past its due date, mark it 'overdue'.
-- ────────────────────────────────────────────────────────────
CREATE TRIGGER IF NOT EXISTS trg_set_fee_overdue_insert
BEFORE INSERT ON fees
FOR EACH ROW
BEGIN
  IF NEW.due_date < CURDATE()
     AND NEW.status IN ('pending', 'partial')
  THEN
    SET NEW.status = 'overdue';
  END IF;
END$$

-- ────────────────────────────────────────────────────────────
-- TRIGGER 3: trg_prevent_duplicate_attendance
--   Fires BEFORE an INSERT on the attendance table.
--   Raises an error if a record for the same student,
--   course, and class_date already exists, preventing
--   accidental duplicate entries.
-- ────────────────────────────────────────────────────────────
CREATE TRIGGER IF NOT EXISTS trg_prevent_duplicate_attendance
BEFORE INSERT ON attendance
FOR EACH ROW
BEGIN
  DECLARE v_count INT DEFAULT 0;

  SELECT COUNT(*) INTO v_count
  FROM attendance
  WHERE student_id = NEW.student_id
    AND course_id  = NEW.course_id
    AND class_date = NEW.class_date;

  IF v_count > 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Attendance already marked for this student on this date';
  END IF;
END$$

DELIMITER ;
