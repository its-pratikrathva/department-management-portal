import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { pool } from '../src/db.js';

const client = await pool.connect();
try {
  await client.query('BEGIN');
  const hash = await bcrypt.hash('ChangeMe123!', 12);
  const faculty = await client.query(
    `INSERT INTO users(role,email,password_hash,full_name,department)
     VALUES ('faculty','s.sharma@eng.university.edu',$1,'Dr. Sunita Sharma','Computer Science & Engineering')
     ON CONFLICT(email) DO UPDATE SET password_hash=EXCLUDED.password_hash
     RETURNING id`, [hash]);
  const fId = faculty.rows[0].id;
  await client.query(
    `INSERT INTO faculty(user_id,designation,qualification,office,office_hours,experience_years,publications_count)
     VALUES ($1,'Professor & Head of Department','Ph.D. in Computer Science','Tech Block A-304','Mon & Wed: 14:00 – 16:00',18,34)
     ON CONFLICT(user_id) DO NOTHING`, [fId]);

  const student = await client.query(
    `INSERT INTO users(role,enrollment_no,email,password_hash,full_name,department)
     VALUES ('student','0827CS231048','aarav.patel@eng.university.edu',$1,'Aarav Patel','Computer Science & Engineering')
     ON CONFLICT(enrollment_no) DO UPDATE SET password_hash=EXCLUDED.password_hash
     RETURNING id`, [hash]);
  const sId = student.rows[0].id;
  await client.query(
    `INSERT INTO students(user_id,semester,section,roll_no,cgpa)
     VALUES ($1,5,'CS-A','48',8.74) ON CONFLICT(user_id) DO NOTHING`, [sId]);

  const subjects = [
    ['CS501','Advanced Database Management Systems',4,'Program Core','Theory + Lab',5,'Distributed databases, query optimization, ACID and concurrency control.','Tech Block A-302','Systems & Data Lab (Lab 3)'],
    ['CS502','Operating Systems & Kernel Architecture',4,'Program Core','Theory',4,'Processes, memory, scheduling, file systems and concurrency.','Tech Block B-204','Systems Lab'],
    ['CS503','Design & Analysis of Algorithms',4,'Program Core','Theory',4,'Algorithm design, graph algorithms, complexity and dynamic programming.','Tech Block A-201','Algorithms Lab'],
    ['CS504','Computer Networks',3,'Program Core','Theory',3,'Network layers, routing, protocols and security.','Tech Block B-108','Networking Lab'],
    ['CS505','Software Engineering',3,'Program Core','Theory',3,'Requirements, design, testing, agile methods and maintenance.','Tech Block A-208','Project Lab'],
    ['CS506','Cloud Computing & Distributed Systems',3,'Elective','Theory + Lab',4,'Cloud systems, containers, distributed services and reliability.','Tech Block B-211','Cloud Lab']
  ];
  for (const [code,name,credits,category,type,hours,syllabus,classroom,lab] of subjects) {
    await client.query(
      `INSERT INTO subjects(code,name,semester,credits,category,type,weekly_hours,faculty_user_id,syllabus_overview,classroom,lab)
       VALUES ($1,$2,5,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT(code) DO NOTHING`,
      [code,name,credits,category,type,hours,fId,syllabus,classroom,lab]);
  }
  const attendanceRows = [['CS501',36,32],['CS502',34,30],['CS503',35,24],['CS504',30,26],['CS505',32,27],['CS506',28,23]];
  for (const [code,total,attended] of attendanceRows) {
    await client.query(
      `INSERT INTO attendance(student_user_id,subject_code,total_classes,attended_classes)
       VALUES ($1,$2,$3,$4) ON CONFLICT(student_user_id,subject_code) DO NOTHING`,
      [sId,code,total,attended]);
  }
  const marks = [['CS501',91,100,'A+'],['CS502',86,100,'A'],['CS503',71,100,'B+'],['CS504',84,100,'A'],['CS505',88,100,'A'],['CS506',88,100,'A']];
  for (const [code,obtained,max,grade] of marks) {
    await client.query(
      `INSERT INTO results(student_user_id,subject_code,credits,components,total_obtained,total_max,grade,performance_category)
       VALUES ($1,$2,4,'[{"name":"Internal Test 1","obtained":22,"max":25},{"name":"Internal Test 2","obtained":24,"max":25},{"name":"Assignments & Quiz","obtained":18,"max":20},{"name":"Practical / Lab Viva","obtained":27,"max":30}]'::jsonb,$3,$4,$5,$6)
       ON CONFLICT(student_user_id,subject_code) DO NOTHING`,
      [sId,code,obtained,max,grade,obtained >= 85 ? 'Distinction' : obtained >= 75 ? 'Good' : 'Needs Improvement']);
  }
  await client.query(
    `INSERT INTO announcements(title,body,audience,created_by)
     SELECT 'Welcome to the Department Portal','Demo announcement: replace this with official department notices.','all',$1
     WHERE NOT EXISTS (SELECT 1 FROM announcements WHERE title='Welcome to the Department Portal')`, [fId]);
  await client.query('COMMIT');
  console.log('Demo data inserted.');
  console.log('Faculty login: s.sharma@eng.university.edu / ChangeMe123!');
  console.log('Student login: 0827CS231048 / ChangeMe123!');
  console.log('These are local demo accounts. Change passwords before any real deployment.');
} catch (err) {
  await client.query('ROLLBACK');
  console.error('Seed failed:', err.message);
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}
