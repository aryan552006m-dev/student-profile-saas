-- Local development seed. Password for all demo accounts: ChangeMe123!
INSERT INTO colleges (id, name, domain) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Northstar College of Engineering', 'northstar.edu')
ON CONFLICT (id) DO NOTHING;

INSERT INTO academic_years (id, college_id, label) VALUES
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', '2025-2026')
ON CONFLICT (id) DO NOTHING;

INSERT INTO semesters (id, academic_year_id, sem_number, start_date, end_date) VALUES
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000010', 5, '2025-07-01', '2025-12-31')
ON CONFLICT (id) DO NOTHING;

INSERT INTO departments (id, college_id, name) VALUES
  ('00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000001', 'Computer Science and Engineering')
ON CONFLICT (id) DO NOTHING;

INSERT INTO classes (id, department_id, name, year, section) VALUES
  ('00000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000020', 'CSE 3A', 3, 'A')
ON CONFLICT (id) DO NOTHING;

INSERT INTO subjects (id, department_id, name, code, max_marks) VALUES
  ('00000000-0000-0000-0000-000000000040', '00000000-0000-0000-0000-000000000020', 'Database Systems', 'CS301', 100),
  ('00000000-0000-0000-0000-000000000041', '00000000-0000-0000-0000-000000000020', 'Data Structures', 'CS302', 100)
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, college_id, email, password_hash, role, full_name, must_reset_password) VALUES
  ('00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000001', 'admin@northstar.edu', crypt('ChangeMe123!', gen_salt('bf')), 'super_admin', 'Meera Nair', false),
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 'teacher@northstar.edu', crypt('ChangeMe123!', gen_salt('bf')), 'teacher', 'Alex Kumar', false),
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000001', 'student@northstar.edu', crypt('ChangeMe123!', gen_salt('bf')), 'student', 'Priya Sharma', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO students (id, college_id, roll_number, class_id, department_id, admission_year, bio, profile_strength) VALUES
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000001', 'CS21045', '00000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000020', 2023, 'Computer science student focused on data systems.', 40)
ON CONFLICT (id) DO NOTHING;

INSERT INTO teacher_class_assignments (teacher_id, class_id, subject_id, semester_id) VALUES
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000040', '00000000-0000-0000-0000-000000000011'),
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000041', '00000000-0000-0000-0000-000000000011')
ON CONFLICT DO NOTHING;

INSERT INTO marks (student_id, subject_id, semester_id, teacher_id, exam_type, marks_obtained, max_marks) VALUES
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000040', '00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000101', 'midterm', 92, 100),
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000041', '00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000101', 'midterm', 88, 100)
ON CONFLICT DO NOTHING;

INSERT INTO notifications (id, college_id, title, body, target_role, created_by) VALUES
  ('00000000-0000-0000-0000-000000000200', '00000000-0000-0000-0000-000000000001', 'Welcome to Student Profile', 'Your academic and professional profile is ready.', 'all', '00000000-0000-0000-0000-000000000100')
ON CONFLICT (id) DO NOTHING;
