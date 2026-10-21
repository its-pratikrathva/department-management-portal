CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  role VARCHAR(20) NOT NULL CHECK (role IN ('student','faculty','admin')),
  email VARCHAR(255) UNIQUE,
  enrollment_no VARCHAR(40) UNIQUE,
  password_hash TEXT NOT NULL,
  full_name VARCHAR(160) NOT NULL,
  department VARCHAR(160) NOT NULL DEFAULT 'Computer Science & Engineering',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (email IS NOT NULL OR enrollment_no IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS students (
  user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  program VARCHAR(120) DEFAULT 'Bachelor of Technology (B.Tech)',
  semester INT NOT NULL DEFAULT 5,
  academic_year VARCHAR(20) DEFAULT '2026-2027',
  section VARCHAR(20) DEFAULT 'CS-A',
  roll_no VARCHAR(20) DEFAULT '48',
  advisor VARCHAR(160) DEFAULT 'Dr. Sunita Sharma',
  status VARCHAR(40) DEFAULT 'Active Full-Time',
  cgpa NUMERIC(3,2) DEFAULT 8.74
);

CREATE TABLE IF NOT EXISTS faculty (
  user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  designation VARCHAR(160),
  qualification TEXT,
  phone VARCHAR(40),
  office VARCHAR(100),
  office_hours VARCHAR(120),
  experience_years INT DEFAULT 0,
  publications_count INT DEFAULT 0,
  research_interests JSONB NOT NULL DEFAULT '[]'::jsonb,
  subjects_taught JSONB NOT NULL DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS subjects (
  code VARCHAR(20) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  semester INT NOT NULL DEFAULT 5,
  credits INT NOT NULL DEFAULT 3,
  category VARCHAR(80) DEFAULT 'Program Core',
  type VARCHAR(80) DEFAULT 'Theory',
  weekly_hours INT DEFAULT 3,
  faculty_user_id BIGINT REFERENCES faculty(user_id) ON DELETE SET NULL,
  syllabus_overview TEXT,
  classroom VARCHAR(100),
  lab VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS timetable (
  id BIGSERIAL PRIMARY KEY,
  day VARCHAR(12) NOT NULL,
  day_index INT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  subject_code VARCHAR(20) REFERENCES subjects(code) ON DELETE CASCADE,
  faculty_user_id BIGINT REFERENCES faculty(user_id) ON DELETE SET NULL,
  room VARCHAR(100),
  type VARCHAR(40) DEFAULT 'Lecture'
);

CREATE TABLE IF NOT EXISTS attendance (
  id BIGSERIAL PRIMARY KEY,
  student_user_id BIGINT NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
  subject_code VARCHAR(20) NOT NULL REFERENCES subjects(code) ON DELETE CASCADE,
  total_classes INT NOT NULL DEFAULT 0 CHECK (total_classes >= 0),
  attended_classes INT NOT NULL DEFAULT 0 CHECK (attended_classes >= 0 AND attended_classes <= total_classes),
  UNIQUE(student_user_id, subject_code)
);

CREATE TABLE IF NOT EXISTS attendance_sessions (
  id BIGSERIAL PRIMARY KEY,
  student_user_id BIGINT NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
  subject_code VARCHAR(20) NOT NULL REFERENCES subjects(code) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  topic TEXT,
  status VARCHAR(10) NOT NULL CHECK (status IN ('Present','Absent'))
);

CREATE TABLE IF NOT EXISTS results (
  id BIGSERIAL PRIMARY KEY,
  student_user_id BIGINT NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
  subject_code VARCHAR(20) NOT NULL REFERENCES subjects(code) ON DELETE CASCADE,
  credits INT NOT NULL DEFAULT 3,
  components JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_obtained NUMERIC(7,2) NOT NULL DEFAULT 0,
  total_max NUMERIC(7,2) NOT NULL DEFAULT 100,
  grade VARCHAR(5),
  performance_category VARCHAR(40),
  faculty_feedback TEXT,
  UNIQUE(student_user_id, subject_code)
);

CREATE TABLE IF NOT EXISTS announcements (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(240) NOT NULL,
  body TEXT NOT NULL,
  audience VARCHAR(20) NOT NULL DEFAULT 'all' CHECK (audience IN ('all','student','faculty')),
  created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS announcement_reads (
  announcement_id BIGINT REFERENCES announcements(id) ON DELETE CASCADE,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (announcement_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_timetable_day ON timetable(day_index, start_time);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_user_id);
CREATE INDEX IF NOT EXISTS idx_results_student ON results(student_user_id);
CREATE INDEX IF NOT EXISTS idx_announcement_date ON announcements(created_at DESC);
