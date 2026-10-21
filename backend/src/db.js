import pg from 'pg';
const { Pool } = pg;
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing. Copy .env.example to .env and configure PostgreSQL.');
}
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false
});
pool.on('error', err => console.error('Unexpected PostgreSQL pool error:', err.message));
