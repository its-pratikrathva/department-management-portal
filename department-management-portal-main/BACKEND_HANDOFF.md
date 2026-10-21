# Backend Handoff Specification: Department Management Portal

**Author:** Frontend Engineering Lead  
**Target Audience:** Backend Developer & Database Architect  
**Status:** Ready for API Contract Review (All endpoints below are **proposals**, not existing endpoints)  
**Frontend Deliverable:** 100% complete, tested, and navigable HTML5 / Bootstrap 5 / Vanilla JS application.

---

## 1. Executive Summary & Integration Architecture

The frontend application has been engineered to decouple UI rendering from data persistence. All data operations currently pass through a clean client service (`js/data-service.js`). 

To connect this frontend to your backend:
1. Implement the REST endpoints outlined in Section 3.
2. In `js/data-service.js`, replace the internal `_resolve(this._data...)` mock methods with standard `fetch('/api/v1/...')` calls.
3. Pass authentication credentials (either HttpOnly session cookies or `Authorization: Bearer <token>` headers) with every request.

No visual layouts, table columns, charts, or HTML templates need to be rewritten during integration.

---

## 2. Authentication & Authorization Boundaries

### Authentication Flow
- **Proposed Method:** Session cookie (e.g. Django `sessionid` with `HttpOnly; SameSite=Lax`) or JWT stored in an HttpOnly cookie.
- **Client Handling:** The frontend does **not** store passwords or security tokens in `localStorage`. 
- **Session Expiration:** When an API endpoint responds with `HTTP 401 Unauthorized`, the frontend `dataService` should catch this and redirect the user to `/login.html` (or your backend's login route).

### Role-Based Access Control (RBAC)
- The current interface represents the **Student Role** (`student`).
- All marks, official attendance records, and faculty contact records are strictly **read-only** in this interface. 
- Ensure your backend enforces server-side permission checks so students cannot modify attendance or grades via forged POST/PUT requests.

---

### 3.0. Faculty & Student Authentication Endpoints
- **Faculty Login:** `POST /api/v1/auth/faculty/login`
  - **Request Body:**
    ```json
    {
      "email": "s.sharma@eng.university.edu",
      "password": "secret_password"
    }
    ```
  - **Expected Response (200 OK):**
    ```json
    {
      "success": true,
      "token": "jwt_token_or_session_cookie",
      "user": {
        "id": "FAC-01",
        "role": "faculty",
        "fullName": "Dr. Sunita Sharma",
        "designation": "Professor & Head of Department",
        "department": "Computer Science & Engineering",
        "email": "s.sharma@eng.university.edu",
        "office": "Tech Block A-304",
        "officeHours": "Mon & Wed: 14:00 – 16:00",
        "avatar": "/media/faculty/dr_sharma.jpg",
        "subjectsTaught": [
          { "code": "CS501", "name": "Advanced Database Management Systems" }
        ]
      }
    }
    ```
- **Student Login:** `POST /api/v1/auth/student/login`
  - **Request Body:** `{ "enrollmentNo": "0827CS231048", "password": "password" }`
- **Logout:** `POST /api/v1/auth/logout`

---

### 3.1. Current User Profile
- **Endpoint:** `GET /api/v1/students/me` (for Student) or `GET /api/v1/faculty/me` (for Faculty)
- **Purpose:** Renders user avatar, name, department, and assigned role.
- **Expected JSON Response (200 OK):**
```json
{
  "id": "STU-2023-0482",
  "enrollmentNo": "0827CS231048",
  "fullName": "Aarav Patel",
  "email": "aarav.patel@eng.university.edu",
  "avatar": "/media/avatars/student_0482.jpg",
  "department": "Computer Science & Engineering",
  "program": "Bachelor of Technology (B.Tech)",
  "semester": 5,
  "academicYear": "2026–2027",
  "section": "CS-A",
  "rollNo": "48",
  "advisor": "Dr. Sunita Sharma",
  "status": "Active Full-Time",
  "cgpa": 8.74
}
```

---

### 3.2. Dashboard Aggregated Statistics
- **Endpoint:** `GET /api/v1/dashboard/stats`
- **Purpose:** Powers the 4 KPI cards on `index.html`.
- **Expected JSON Response (200 OK):**
```json
{
  "totalSubjects": 6,
  "overallAttendancePct": 83.08,
  "totalClasses": 195,
  "attendedClasses": 162,
  "missedClasses": 33,
  "subjectsBelowThreshold": 1,
  "averageMarksPct": 84.67,
  "totalObtainedMarks": 508,
  "totalMaxMarks": 600,
  "todayLecturesCount": 5,
  "attendanceThreshold": 75.0
}
```

---

### 3.3. Smart Timetable
- **Endpoint:** `GET /api/v1/academics/timetable`
- **Optional Query Params:** `?day=Monday&subject=CS501&type=Lecture`
- **Purpose:** Renders weekly schedules and calculates live lecture statuses on `pages/timetable.html` and the dashboard widget.
- **Expected JSON Response (200 OK):**
```json
[
  {
    "id": "TT-MON-01",
    "day": "Monday",
    "dayIndex": 1,
    "startTime": "09:00",
    "endTime": "10:00",
    "timeDisplay": "09:00 AM – 10:00 AM",
    "subjectCode": "CS501",
    "subjectName": "Advanced Database Management Systems",
    "facultyName": "Dr. Sunita Sharma",
    "room": "Tech Block A-302",
    "type": "Lecture"
  },
  {
    "id": "TT-MON-04",
    "day": "Monday",
    "dayIndex": 1,
    "startTime": "13:15",
    "endTime": "15:15",
    "timeDisplay": "01:15 PM – 03:15 PM",
    "subjectCode": "CS501",
    "subjectName": "Adv DBMS - Distributed DB Lab",
    "facultyName": "Dr. Sunita Sharma",
    "room": "Systems & Data Lab (Lab 3)",
    "type": "Lab Practical"
  }
]
```

---

### 3.4. Attendance Records & Session History
- **Endpoint:** `GET /api/v1/attendance/records`
- **Optional Query Params:** `?search=CS501&status=below`
- **Purpose:** Powers `pages/attendance.html` summary cards, progress bars, low-attendance warnings, and session drill-down modals.
- **Expected JSON Response (200 OK):**
```json
[
  {
    "subjectCode": "CS503",
    "subjectName": "Design & Analysis of Algorithms",
    "totalClasses": 35,
    "attendedClasses": 24,
    "missedClasses": 11,
    "sessions": [
      {
        "date": "2026-10-18",
        "topic": "Dynamic Programming: Matrix Chain Multiplication",
        "status": "Absent"
      },
      {
        "date": "2026-10-16",
        "topic": "Bellman-Ford & Negative Cycle Detection",
        "status": "Present"
      }
    ]
  }
]
```
> **Backend Calculation Note:** The frontend can compute `percentage` and `classesNeeded` locally, or your backend can compute them in the serializer:
> - `percentage = (attendedClasses / totalClasses) * 100`
> - `classesNeeded = ceil((0.75 * totalClasses - attendedClasses) / 0.25)`

---

### 3.5. Internal Marks & Assessment Breakdown
- **Endpoint:** `GET /api/v1/academics/results`
- **Optional Query Params:** `?category=Distinction&sortBy=percentage_desc`
- **Purpose:** Powers `pages/results.html`, component tables with maximum point limits, and modal scorecards.
- **Expected JSON Response (200 OK):**
```json
[
  {
    "subjectCode": "CS501",
    "subjectName": "Advanced Database Management Systems",
    "credits": 4,
    "components": [
      { "name": "Internal Test 1", "obtained": 22, "max": 25 },
      { "name": "Internal Test 2", "obtained": 24, "max": 25 },
      { "name": "Assignments & Quiz", "obtained": 18, "max": 20 },
      { "name": "Practical / Lab Viva", "obtained": 27, "max": 30 }
    ],
    "totalObtained": 91,
    "totalMax": 100,
    "percentage": 91.0,
    "grade": "A+",
    "performanceCategory": "Distinction",
    "facultyFeedback": "Demonstrated exceptional competence in query planning, distributed commit protocols, and practical database indexing labs."
  }
]
```

---

### 3.6. Faculty Directory & Subject Curriculum
- **Endpoint:** `GET /api/v1/department/faculty`
- **Purpose:** Powers `pages/faculty.html` faculty directory cards and detailed profile modals.
- **Expected JSON Response (200 OK):**
```json
[
  {
    "id": "FAC-01",
    "fullName": "Dr. Sunita Sharma",
    "designation": "Professor & Head of Department",
    "qualification": "Ph.D. in Computer Science (Distributed Databases)",
    "department": "Computer Science & Engineering",
    "email": "s.sharma@eng.university.edu",
    "phone": "+1 (555) 432-1001",
    "office": "Tech Block A-304",
    "officeHours": "Mon & Wed: 14:00 – 16:00",
    "avatar": "/media/faculty/dr_sharma.jpg",
    "experienceYears": 18,
    "publicationsCount": 34,
    "researchInterests": ["Distributed Consensus", "Query Optimization"],
    "subjectsTaught": [
      { "code": "CS501", "name": "Advanced Database Management Systems" }
    ]
  }
]
```

- **Endpoint:** `GET /api/v1/academics/subjects`
- **Purpose:** Powers the Subject Directory view on `pages/faculty.html`.
- **Expected JSON Response (200 OK):**
```json
[
  {
    "code": "CS501",
    "name": "Advanced Database Management Systems",
    "semester": 5,
    "credits": 4,
    "category": "Program Core",
    "type": "Theory + Lab",
    "weeklyHours": 5,
    "facultyName": "Dr. Sunita Sharma",
    "syllabusOverview": "Distributed databases, query optimization, ACID & concurrency control.",
    "classroom": "Tech Block A-302",
    "lab": "Systems & Data Lab (Lab 3)"
  }
]
```

---

### 3.7. Department Announcements & Read Status
- **Endpoint:** `GET /api/v1/announcements`
- **Purpose:** Topbar notification bell and dashboard news stream.
- **Endpoint:** `POST /api/v1/announcements/:id/read`
- **Purpose:** Marks announcement as read in the user's database record.

---

## 4. Error Handling & HTTP Status Code Specifications

The frontend expects standard HTTP status codes:

| HTTP Status | Meaning | Frontend UI Reaction |
| :--- | :--- | :--- |
| **`200 OK`** | Request succeeded | Renders content and hides skeleton loading states. |
| **`401 Unauthorized`** | User is not logged in / Session expired | Displays toast: *"Session expired. Please log in."* and redirects to login. |
| **`403 Forbidden`** | Insufficient role permissions | Displays toast: *"Access denied: this resource requires elevated privileges."* |
| **`404 Not Found`** | Subject / Faculty record does not exist | Renders the styled `<div class="empty-state-box">`. |
| **`500 Internal Error`** | Server error | Displays error toast and prevents UI crash. |

---

## 5. Frontend Behaviors Currently Simulated That Must Be Replaced

1. **Authentication Session:** Replace demo login/logout buttons with real backend session termination (`POST /api/auth/logout/`).
2. **Read Receipts:** Replace `localStorage.setItem('dmp_read_announcements')` with `POST /api/v1/announcements/:id/read`.
3. **Attendance Policy Threshold:** When institution-wide thresholds are stored in the database, replace `PORTAL_DATA.config.attendanceThreshold` with the value returned from `GET /api/v1/dashboard/stats`.
4. **Timezone Synchronization:** If students access the portal across multiple timezones, supply server-rendered UTC timestamps or the department's canonical timezone in `GET /api/v1/academics/timetable`.

---

## 6. Questions for the Backend Teammate Before API Integration

Please provide answers to the following 5 items before we finalize API binding:
1. **Authentication:** Will you use standard Django session cookies (`sessionid`) or Bearer tokens (`Authorization: Bearer <jwt>`)?
2. **API Base URL:** Will endpoints be hosted on the same origin (e.g. `/api/v1/...`) or on a separate subdomain requiring CORS headers (e.g. `https://api.university.edu/...`)?
3. **Pagination:** Are attendance sessions and announcements returned as full arrays or paginated (`{ count, next, previous, results }`)?
4. **Database Primary Keys:** Are subject codes (`CS501`) the primary keys, or will integer/UUID `id` fields be used for routing?
5. **Image Media Path:** Where will uploaded avatars and faculty photos be served from (e.g., `/media/...` or an S3 bucket)?
