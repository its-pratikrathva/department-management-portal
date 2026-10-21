
import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import helmet from 'helmet';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from './src/db.js';
import apiRoutes from './src/routes.js';

const app = express();
const here = path.dirname(fileURLToPath(import.meta.url));
const PgSession = connectPgSimple(session);

app.disable('x-powered-by');

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false }));

app.use(session({
  store: new PgSession({
    pool,
    tableName: 'user_sessions',
    createTableIfMissing: true
  }),
  name: 'dmp.sid',
  secret: process.env.SESSION_SECRET || 'development-only-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 8
  }
}));

// Check backend and database connection
app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');

    res.json({
      status: 'ok',
      database: 'connected'
    });
  } catch (error) {
    console.error('Database health check failed:', error.message);

    res.status(503).json({
      status: 'error',
      database: 'unavailable'
    });
  }
});

// API endpoints
app.use('/api/v1', apiRoutes);

// Correct path to your existing frontend folder
// Structure:
// department-management-portal-main/
//   backend/
//     server.js
//   department-management-portal-main/
//     index.html
//     css/
//     js/

const projectRoot = path.resolve(
  here,
  '..',
  'department-management-portal-main'
);

// Serve frontend CSS, JavaScript, HTML and other static assets
app.use(express.static(projectRoot));

// Serve the main frontend page
app.get('/', (_req, res, next) => {
  res.sendFile(path.join(projectRoot, 'index.html'), (error) => {
    if (error) {
      next(error);
    }
  });
});

// Handle unknown API routes
app.use('/api', (_req, res) => {
  res.status(404).json({
    error: 'API route not found'
  });
});

// General error handler
app.use((err, _req, res, _next) => {
  console.error(err);

  res.status(500).json({
    error:
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message
  });
});

const port = Number(process.env.PORT || 3000);

app.listen(port, () => {
  console.log(
    `Department Portal running at http://localhost:${port}`
  );
});
