import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from './db.js';
import { requireAuth, requireRole, publicUser } from './auth.js';
const router = Router();

async function login(req, res, role) {
  const { email, enrollmentNo, password } = req.body ?? {};
  if (!password || (role === 'faculty' ? !email : !enrollmentNo))
    return res.status(400).json({ error: 'Login identifier and password are required' });
  const result = await pool.query(
    `SELECT * FROM users WHERE role=$1 AND ${role === 'faculty' ? 'LOWER(email)=LOWER($2)' : 'enrollment_no=$2'} AND is_active=TRUE`,
    [role, role === 'faculty' ? String(email).trim() : String(enrollmentNo).trim()]
  );
  const user = result.rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash)))
    return res.status(401).json({ error: 'Invalid credentials' });
  await new Promise((resolve, reject) => req.session.regenerate(err => err ? reject(err) : resolve()));
  req.session.userId = user.id;
  res.json({ success: true, user: publicUser(user) });
}

router.post('/auth/faculty/login', (req,res,next) => login(req,res,'faculty').catch(next));
router.post('/auth/student/login', (req,res,next) => login(req,res,'student').catch(next));
router.post('/auth/logout', (req,res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: 'Could not log out' });
    res.clearCookie('dmp.sid', { httpOnly:true, sameSite:'lax', secure:process.env.NODE_ENV==='production' });
    res.json({ success:true });
  });
});
router.get('/auth/me', requireAuth, (req,res) => res.json({ user: publicUser(req.user) }));

router.get('/students/me', requireAuth, requireRole('student'), async (req,res,next) => {
  try {
    const q = await pool.query(`SELECT u.id,u.enrollment_no AS "enrollmentNo",u.full_name AS "fullName",u.email,u.department,
      s.program,s.semester,s.academic_year AS "academicYear",s.section,s.roll_no AS "rollNo",s.advisor,s.status,s.cgpa
      FROM users u JOIN students s ON s.user_id=u.id WHERE u.id=$1`, [req.user.id]);
    res.json(q.rows[0] ?? {});
  } catch(e){next(e);}
});
router.get('/faculty/me', requireAuth, requireRole('faculty','admin'), async (req,res,next) => {
  try {
    const q = await pool.query(`SELECT u.id,u.full_name AS "fullName",u.email,u.department,f.designation,f.qualification,
      f.phone,f.office,f.office_hours AS "officeHours",f.experience_years AS "experienceYears",
      f.publications_count AS "publicationsCount",f.research_interests AS "researchInterests",f.subjects_taught AS "subjectsTaught"
      FROM users u JOIN faculty f ON f.user_id=u.id WHERE u.id=$1`, [req.user.id]);
    res.json(q.rows[0] ?? {});
  } catch(e){next(e);}
});
router.get('/dashboard/stats', requireAuth, requireRole('student'), async (req,res,next) => {
  try {
    const q = await pool.query(`SELECT
      (SELECT COUNT(*)::int FROM subjects WHERE semester=(SELECT semester FROM students WHERE user_id=$1)) AS "totalSubjects",
      COALESCE(SUM(total_classes),0)::int AS "totalClasses",
      COALESCE(SUM(attended_classes),0)::int AS "attendedClasses",
      COUNT(*) FILTER (WHERE total_classes>0 AND attended_classes::numeric/total_classes<0.75)::int AS "subjectsBelowThreshold",
      (SELECT COALESCE(SUM(total_obtained),0) FROM results WHERE student_user_id=$1) AS "totalObtainedMarks",
      (SELECT COALESCE(SUM(total_max),0) FROM results WHERE student_user_id=$1) AS "totalMaxMarks"
      FROM attendance WHERE student_user_id=$1`, [req.user.id]);
    const x=q.rows[0], total=Number(x.totalClasses), attended=Number(x.attendedClasses), max=Number(x.totalMaxMarks);
    const today = new Date().toLocaleDateString('en-US',{weekday:'long',timeZone:'Asia/Kolkata'});
    const lectures = await pool.query('SELECT COUNT(*)::int AS n FROM timetable WHERE day=$1',[today]);
    res.json({...x, totalClasses:total, attendedClasses:attended, missedClasses:total-attended,
      overallAttendancePct:total?Number((attended/total*100).toFixed(2)):0,
      averageMarksPct:max?Number((Number(x.totalObtainedMarks)/max*100).toFixed(2)):0,
      todayLecturesCount:lectures.rows[0].n, attendanceThreshold:75});
  } catch(e){next(e);}
});
router.get('/academics/timetable', requireAuth, async (req,res,next) => {
  try {
    const params=[], where=[];
    if(req.query.day){params.push(req.query.day);where.push(`t.day=$${params.length}`);}
    if(req.query.subject){params.push(req.query.subject);where.push(`t.subject_code=$${params.length}`);}
    if(req.query.type){params.push(req.query.type);where.push(`t.type=$${params.length}`);}
    const q=await pool.query(`SELECT t.id,t.day,t.day_index AS "dayIndex",to_char(t.start_time,'HH24:MI') AS "startTime",
      to_char(t.end_time,'HH24:MI') AS "endTime",t.subject_code AS "subjectCode",s.name AS "subjectName",
      u.full_name AS "facultyName",t.room,t.type FROM timetable t LEFT JOIN subjects s ON s.code=t.subject_code
      LEFT JOIN users u ON u.id=t.faculty_user_id ${where.length?'WHERE '+where.join(' AND '):''} ORDER BY t.day_index,t.start_time`,params);
    res.json(q.rows);
  } catch(e){next(e);}
});
router.get('/attendance/records', requireAuth, requireRole('student'), async (req,res,next) => {
  try {
    const q=await pool.query(`SELECT a.subject_code AS "subjectCode",s.name AS "subjectName",a.total_classes AS "totalClasses",
      a.attended_classes AS "attendedClasses",a.total_classes-a.attended_classes AS "missedClasses",
      COALESCE(json_agg(json_build_object('date',to_char(x.session_date,'YYYY-MM-DD'),'topic',x.topic,'status',x.status)
      ORDER BY x.session_date DESC) FILTER (WHERE x.id IS NOT NULL),'[]') AS sessions
      FROM attendance a JOIN subjects s ON s.code=a.subject_code LEFT JOIN attendance_sessions x
      ON x.student_user_id=a.student_user_id AND x.subject_code=a.subject_code
      WHERE a.student_user_id=$1 GROUP BY a.id,s.name ORDER BY a.subject_code`,[req.user.id]);
    const data=q.rows.map(r=>({...r,percentage:r.totalClasses?Number((r.attendedClasses/r.totalClasses*100).toFixed(2)):0}));
    res.json(data.filter(r=>(!req.query.search || `${r.subjectCode} ${r.subjectName}`.toLowerCase().includes(String(req.query.search).toLowerCase()))
      && (!req.query.status || req.query.status==='all' || (req.query.status==='below'?r.percentage<75:req.query.status==='good'?r.percentage>=80:true))));
  } catch(e){next(e);}
});
router.get('/academics/results', requireAuth, requireRole('student'), async (req,res,next) => {
  try {
    const q=await pool.query(`SELECT r.subject_code AS "subjectCode",s.name AS "subjectName",r.credits,r.components,
      r.total_obtained AS "totalObtained",r.total_max AS "totalMax",
      CASE WHEN r.total_max>0 THEN ROUND(r.total_obtained/r.total_max*100,2) ELSE 0 END AS percentage,
      r.grade,r.performance_category AS "performanceCategory",r.faculty_feedback AS "facultyFeedback"
      FROM results r JOIN subjects s ON s.code=r.subject_code WHERE r.student_user_id=$1 ORDER BY r.subject_code`,[req.user.id]);
    res.json(q.rows);
  } catch(e){next(e);}
});
router.get('/academics/subjects', requireAuth, async (req,res,next) => {
  try {
    const q=await pool.query(`SELECT s.code,s.name,s.semester,s.credits,s.category,s.type,s.weekly_hours AS "weeklyHours",
      u.full_name AS "facultyName",s.syllabus_overview AS "syllabusOverview",s.classroom,s.lab
      FROM subjects s LEFT JOIN users u ON u.id=s.faculty_user_id ORDER BY s.code`);
    res.json(q.rows);
  } catch(e){next(e);}
});
router.get('/department/faculty', requireAuth, async (req,res,next) => {
  try {
    const q=await pool.query(`SELECT u.id,u.full_name AS "fullName",u.email,u.department,f.designation,f.qualification,f.phone,f.office,
      f.office_hours AS "officeHours",f.experience_years AS "experienceYears",f.publications_count AS "publicationsCount",
      f.research_interests AS "researchInterests",f.subjects_taught AS "subjectsTaught"
      FROM users u JOIN faculty f ON f.user_id=u.id WHERE u.is_active=TRUE ORDER BY u.full_name`);
    res.json(q.rows);
  } catch(e){next(e);}
});
router.get('/announcements', requireAuth, async (req,res,next) => {
  try {
    const q=await pool.query(`SELECT a.id,a.title,a.body,a.audience,a.created_at AS "createdAt",
      (ar.user_id IS NOT NULL) AS read FROM announcements a
      LEFT JOIN announcement_reads ar ON ar.announcement_id=a.id AND ar.user_id=$1
      WHERE a.audience IN ('all',$2) ORDER BY a.created_at DESC`,[req.user.id,req.user.role]);
    res.json(q.rows);
  } catch(e){next(e);}
});
router.post('/announcements/:id/read', requireAuth, async (req,res,next) => {
  try {
    const q=await pool.query(`INSERT INTO announcement_reads(announcement_id,user_id) VALUES($1,$2)
      ON CONFLICT DO NOTHING RETURNING announcement_id`,[req.params.id,req.user.id]);
    if(!q.rowCount) {
      const exists=await pool.query('SELECT 1 FROM announcements WHERE id=$1',[req.params.id]);
      if(!exists.rowCount) return res.status(404).json({error:'Announcement not found'});
    }
    res.json({success:true});
  } catch(e){ if(e.code==='23503') return res.status(404).json({error:'Announcement not found'}); next(e); }
});
export default router;
