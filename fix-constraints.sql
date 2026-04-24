USE acad_track;

-- Drop existing constraints if they somehow exist (ignoring errors if they don't)
ALTER TABLE admins DROP CONSTRAINT chk_admin_phone;
ALTER TABLE faculty DROP CONSTRAINT chk_faculty_name;
ALTER TABLE faculty DROP CONSTRAINT chk_faculty_phone;
ALTER TABLE students DROP CONSTRAINT chk_student_name;
ALTER TABLE students DROP CONSTRAINT chk_student_phone;

