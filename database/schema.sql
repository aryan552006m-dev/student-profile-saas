CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE colleges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    college_id UUID NOT NULL REFERENCES colleges(id),
    email VARCHAR(255) NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('super_admin', 'teacher', 'student')),
    full_name VARCHAR(150) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    must_reset_password BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_login TIMESTAMPTZ,
    UNIQUE (college_id, email),
    UNIQUE (id, college_id)
);

CREATE TABLE academic_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    college_id UUID NOT NULL REFERENCES colleges(id),
    label VARCHAR(20) NOT NULL,
    UNIQUE (college_id, label)
);

CREATE TABLE semesters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_year_id UUID NOT NULL REFERENCES academic_years(id),
    sem_number INT NOT NULL CHECK (sem_number BETWEEN 1 AND 8),
    start_date DATE,
    end_date DATE,
    UNIQUE (academic_year_id, sem_number)
);

CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    college_id UUID NOT NULL REFERENCES colleges(id),
    name VARCHAR(150) NOT NULL,
    UNIQUE (college_id, name)
);

CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID NOT NULL REFERENCES departments(id),
    name VARCHAR(150) NOT NULL,
    year INT NOT NULL CHECK (year BETWEEN 1 AND 4),
    section VARCHAR(10)
);

CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID NOT NULL REFERENCES departments(id),
    name VARCHAR(150) NOT NULL,
    code VARCHAR(30),
    max_marks INT NOT NULL DEFAULT 100 CHECK (max_marks > 0),
    UNIQUE (department_id, code)
);

CREATE TABLE students (
    id UUID PRIMARY KEY REFERENCES users(id),
    college_id UUID NOT NULL REFERENCES colleges(id),
    roll_number VARCHAR(50) NOT NULL,
    class_id UUID REFERENCES classes(id),
    department_id UUID REFERENCES departments(id),
    admission_year INT,
    linkedin_url TEXT,
    github_url TEXT,
    profile_photo_url TEXT,
    resume_url TEXT,
    bio TEXT,
    profile_strength INT NOT NULL DEFAULT 0 CHECK (profile_strength BETWEEN 0 AND 100),
    UNIQUE (college_id, roll_number),
    FOREIGN KEY (id, college_id) REFERENCES users(id, college_id)
);

CREATE TABLE student_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id),
    doc_type VARCHAR(30) NOT NULL CHECK (doc_type IN ('photo', 'resume_pdf', 'resume_docx', 'certificate', 'other')),
    file_url TEXT NOT NULL,
    file_name VARCHAR(255),
    parsed_headings JSONB,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'scanning'))
);

CREATE TABLE teacher_class_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES users(id),
    class_id UUID NOT NULL REFERENCES classes(id),
    subject_id UUID NOT NULL REFERENCES subjects(id),
    semester_id UUID NOT NULL REFERENCES semesters(id),
    status VARCHAR(10) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past')),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (teacher_id, class_id, subject_id, semester_id)
);

CREATE TABLE marks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id),
    subject_id UUID NOT NULL REFERENCES subjects(id),
    semester_id UUID NOT NULL REFERENCES semesters(id),
    teacher_id UUID NOT NULL REFERENCES users(id),
    exam_type VARCHAR(30) NOT NULL CHECK (exam_type IN ('internal1', 'internal2', 'midterm', 'final', 'assignment', 'practical')),
    marks_obtained NUMERIC(6,2) NOT NULL CHECK (marks_obtained >= 0 AND marks_obtained <= max_marks),
    max_marks NUMERIC(6,2) NOT NULL CHECK (max_marks > 0),
    entered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ,
    UNIQUE (student_id, subject_id, semester_id, exam_type)
);

CREATE TABLE marksheets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id),
    semester_id UUID NOT NULL REFERENCES semesters(id),
    file_url TEXT NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    sgpa NUMERIC(4,2),
    cgpa NUMERIC(4,2)
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    college_id UUID NOT NULL REFERENCES colleges(id),
    title VARCHAR(255) NOT NULL,
    body TEXT,
    target_role VARCHAR(20) CHECK (target_role IN ('all', 'students', 'teachers')),
    target_class_id UUID REFERENCES classes(id),
    file_url TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE notification_reads (
    notification_id UUID NOT NULL REFERENCES notifications(id),
    user_id UUID NOT NULL REFERENCES users(id),
    read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (notification_id, user_id)
);

CREATE TABLE ai_query_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    query_text TEXT NOT NULL,
    resolved_intent VARCHAR(50),
    response_summary TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_college_role ON users(college_id, role);
CREATE INDEX idx_marks_student_semester ON marks(student_id, semester_id);
CREATE INDEX idx_marks_subject_semester ON marks(subject_id, semester_id);
CREATE INDEX idx_assignments_teacher_status ON teacher_class_assignments(teacher_id, status);
CREATE INDEX idx_notifications_college_created ON notifications(college_id, created_at DESC);

-- Every teacher data query must join this table before reading classes, students, or marks.