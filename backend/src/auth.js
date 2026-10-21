import { pool } from './db.js';

export async function requireAuth(req, res, next) {
  try {
    if (!req.session?.userId) return res.status(401).json({ error: 'Authentication required' });
    const result = await pool.query(
    'SELECT id, role, email, enrollment_no, full_name, department, is_active FROM users WHERE id=$1',
      [req.session.userId]
    );
    const user = result.rows[0];
    if (!user || !user.is_active) {
      req.session.destroy(() => {});
      return res.status(401).json({ error: 'Session is no longer valid' });
    }
    req.user = user;
    next();
  } catch (err) { next(err); }
}
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ error: 'Insufficient permissions' });
    next();
  };
}
export function publicUser(u) {
  return { id: String(u.id), role: u.role, fullName: u.full_name, email: u.email,
    enrollmentNo: u.enrollment_no, department: u.department };
}
