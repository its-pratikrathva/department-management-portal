# Department Portal Backend Starter

A Node.js + Express + PostgreSQL backend scaffold aligned with the uploaded portal's `BACKEND_HANDOFF.md`. This is a starter for local development, not a production-ready deployment.

## 1. Prerequisites
- Node.js LTS
- PostgreSQL installed and running
- VS Code
- Optional: Postman or VS Code REST Client

## 2. Put it into your project
Extract this ZIP, then copy the `backend` folder into the root of your existing `department-management-portal-main` folder. Your structure should look like:
```
department-management-portal-main/
  index.html
  pages/
  js/
  css/
  backend/
    server.js
    package.json
    ...
```
Run all terminal commands below from the `backend` folder.

## 3. Create the PostgreSQL database
Open pgAdmin Query Tool or psql and run:
```sql
CREATE DATABASE department_portal;
```
Create a local PostgreSQL user/password if needed. Keep that password only in your local `.env`.

## 4. Configure environment
Windows PowerShell:
```powershell
cd path\to\department-management-portal-main\backend
npm install
Copy-Item .env.example .env
```
Edit `.env` and replace `YOUR_PASSWORD` in `DATABASE_URL` with your PostgreSQL password. Replace `SESSION_SECRET` with a long random value. Do not commit `.env`.

## 5. Create tables and demo data
```powershell
npm run db:init
npm run db:seed
```
The seed creates demo accounts:
- Faculty: `s.sharma@eng.university.edu` / `ChangeMe123!`
- Student: `0827CS231048` / `ChangeMe123!`

These are only local demo accounts. Change them before deployment. The seed adds example subjects, attendance, marks, and one announcement. It does not seed a complete timetable or session history; add these through SQL or an admin workflow.

## 6. Start the server
```powershell
npm run dev
```
Open:
- `http://localhost:3000/` — frontend (served from project root)
- `http://localhost:3000/api/health` — backend/database health
- `http://localhost:3000/pages/login.html` — existing login page

## 7. API endpoints included
- `POST /api/v1/auth/faculty/login`
- `POST /api/v1/auth/student/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`
- `GET /api/v1/students/me` (student only)
- `GET /api/v1/faculty/me` (faculty/admin)
- `GET /api/v1/dashboard/stats` (student only)
- `GET /api/v1/academics/timetable`
- `GET /api/v1/academics/subjects`
- `GET /api/v1/academics/results` (student only)
- `GET /api/v1/attendance/records` (student only)
- `GET /api/v1/department/faculty`
- `GET /api/v1/announcements`
- `POST /api/v1/announcements/:id/read`

## 8. Test login with curl in PowerShell
```powershell
$body = @{ enrollmentNo = "0827CS231048"; password = "ChangeMe123!" } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/v1/auth/student/login -ContentType "application/json" -Body $body -SessionVariable portalSession
Invoke-RestMethod -Uri http://localhost:3000/api/v1/students/me -WebSession $portalSession
```
Faculty login body uses `email` instead of `enrollmentNo`.

## 9. Important frontend integration
Your `pages/login.html` currently fills demo credentials and uses client-side demonstration behavior. The backend will NOT become active in the login UI until you change its JavaScript to `fetch()` the login endpoints and remove demo presets/default passwords.

For session-cookie authentication, same-origin requests should use:
```js
const response = await fetch('/api/v1/auth/student/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'same-origin',
  body: JSON.stringify({ enrollmentNo, password })
});
const data = await response.json();
if (!response.ok) throw new Error(data.error || 'Login failed');
```
After login, use `fetch('/api/v1/students/me', { credentials: 'same-origin' })`. Do not store passwords or session identifiers in localStorage.

Next, replace the mock implementations in `js/data-service.js` with API fetch calls matching `BACKEND_HANDOFF.md`. Keep the frontend response shapes consistent with the existing UI.

## 10. Before production
- Use HTTPS and a strong secret; use secure cookies.
- Add rate limiting and login throttling.
- Add CSRF protection appropriate to your session-cookie design.
- Add admin-only user creation, password reset, timetable/marks/attendance management endpoints and audit logging.
- Validate request inputs and enforce role/ownership checks server-side.
- Never expose password hashes; never let students edit their own official grades or attendance.
- Configure backups, migrations, monitoring and least-privilege DB credentials.
- Test all endpoints and frontend flows.
