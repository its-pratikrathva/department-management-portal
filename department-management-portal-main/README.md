# Department Management Portal (Frontend)

A complete, professional, modern, and responsive **Department Management Portal** built for university and college academic departments.

> **Project Architecture & Scope Boundary:**
> - **Frontend Developer Responsibility (Delivered):** UI/UX design, semantic HTML5 pages, CSS3 design tokens and responsive layouts, Vanilla JavaScript (ES6+), Bootstrap 5, Bootstrap Icons, Chart.js visualizations, centralized sample data service, interactive client-side calculations, filtering, sorting, modals, toasts, and backend handoff specification.
> - **Backend Developer Responsibility (Independent Teammate):** Server-side architecture (Django / Node / Python), database modeling & migrations (PostgreSQL / MySQL), real authentication & authorization (JWT / Session / OAuth), persistent database records, and server-side role-based access control.
> - **Backend Implementation Status:** No backend or database code has been implemented in this repository. All data is backed by an abstraction layer (`js/data-service.js`) ready to swap mock promises for real `fetch()` calls.

---

## 1. Technology Stack

- **Markup:** HTML5 with semantic landmarks (`<header>`, `<aside>`, `<main>`, `<section>`, `<footer>`)
- **Styling:** CSS3 Custom Properties (Design Tokens), Bootstrap 5.3.3
- **Icons:** Bootstrap Icons 1.11.3
- **Data Visualizations:** Chart.js 4.4.7
- **Scripting:** Modern Vanilla JavaScript (ES6+ async/await, DOM APIs, zero heavy frameworks)
- **Typography:** Plus Jakarta Sans & JetBrains Mono (Google Fonts)

---

## 2. Directory Structure

```text
department-management-portal/
├── index.html                   # Student Dashboard (Overview, KPIs, Charts, Schedule, Notices)
├── pages/
│   ├── timetable.html          # Smart Timetable (Full week, Day tabs, Live status, Time simulator)
│   ├── attendance.html         # Attendance Tracker (Summary, Progress bars, Recovery math, Logs)
│   ├── results.html            # Internal Marks & Results (Component breakdown, Rubrics, Transcripts)
│   └── faculty.html            # Faculty & Subject Directory (Staff directory, Research, Syllabus)
├── css/
│   ├── style.css               # Global tokens, color system, layout shell, sidebar, topbar
│   ├── dashboard.css           # Dashboard widgets, student banner, timeline, announcements
│   ├── components.css          # Shared cards, tables, badges, modals, toast stack, print CSS
│   └── responsive.css          # Breakpoints (<=992px offcanvas drawer, <=576px mobile cards)
├── js/
│   ├── data.js                 # Centralized fictional demonstration dataset
│   ├── data-service.js         # Frontend data-access abstraction layer (Promise-based)
│   ├── app.js                  # Shared navigation, notification bell, profile & settings modal, toasts
│   ├── dashboard.js            # Dashboard KPI calculations & Chart.js instances
│   ├── timetable.js            # Timetable schedule filtering, status evaluator, time simulation
│   ├── attendance.js           # Attendance recovery calculator, filtering, sorting, session modal
│   ├── results.js              # Continuous assessment calculations, grade rubrics, marks chart
│   └── faculty.js              # Faculty profiles, subject curriculum registry, search & modal
├── assets/
│   ├── images/                 # Optimized avatars and faculty portraits
│   └── icons/                  # Vector academic motifs
├── README.md                   # Complete developer & architecture documentation
└── BACKEND_HANDOFF.md          # Technical specification for the backend teammate
```

---

## 3. Five Feature Modules

### Feature 1: Student Dashboard (`index.html`)
- **Student Profile Summary:** Displays Aarav Patel (B.Tech CSE, Semester 5, CGPA: 8.74/10).
- **Four Calculated Statistics Cards:**
  1. *Total Subjects:* 6 modules.
  2. *Overall Attendance:* 83.08% with threshold indicator.
  3. *Average Internal Marks:* 84.67% (508/600 total points).
  4. *Today's Scheduled Lectures:* Dynamic count based on client date.
- **Subject-Wise Attendance Chart:** Interactive Chart.js bar chart color-coded by threshold compliance (&ge;80% blue, 75–79% amber, &lt;75% red).
- **Academic Marks Distribution Chart:** Comparative subject attainment chart.
- **Today's Live Timetable:** Automatically filters lectures for current day, displaying start/end time, hall, instructor, and live status (Happening Now, Upcoming, Completed).
- **Department Notices:** Announcement stream with read/unread tracking and modal reader.
- **Quick Navigation Actions:** Instant shortcuts to all sub-modules.

### Feature 2: Smart Timetable (`pages/timetable.html`)
- **Monday to Saturday Weekly Schedule:** Full schedule encompassing lectures, tutorials, and system laboratory sessions.
- **Day-by-Day Filtering:** Seamless segmented tabs for Monday through Saturday, plus an "All Days" full-week overview.
- **Subject & Session Type Filtering:** Filter by subject code (CS501–CS506) or session type (Lectures, Labs, Tutorials).
- **Live Status Calculation:** JavaScript compares start and end times against current client system time to flag active lectures.
- **Time Simulation Selector:** Built-in evaluation selector allowing reviewers to test status transitions (Morning 09:30 AM, Afternoon 01:45 PM, Evening 05:30 PM) regardless of actual hour.
- **Return to Today:** One-click navigation back to current day's classes.
- **Lecture Details Modal:** Comprehensive view with room number, faculty instructor, and preparation guidelines.
- **Print View:** Dedicated print layout hiding navigation bars.

### Feature 3: Attendance Tracker (`pages/attendance.html`)
- **Summary Cards:** Overall attendance percentage, conducted classes (195), attended classes (162), missed classes (33), and subjects below benchmark (1).
- **Configurable Benchmark:** 75% demonstration threshold (configurable in Demo Settings without breaking production data).
- **Consecutive Recovery Calculation:** Mathematically derives the exact number of consecutive classes required to reach 75% when a subject falls below threshold:
  $$\text{Classes Needed} = \left\lceil \frac{\text{Target} \times \text{Total} - \text{Attended}}{1 - \text{Target}} \right\rceil$$
- **Low-Attendance Alert Banner:** Prominent warning callout highlighting CS503 (68.57%) requiring 9 consecutive classes.
- **Live Search & Status Filtering:** Instant client-side search by subject name/code and filter by Good, Needs Attention, or Below Threshold.
- **Session History Modal:** Complete chronological log of attended and missed class topics.
- **Read-Only Interface:** Official records cannot be edited in the student view.

### Feature 4: Internal Marks & Result Dashboard (`pages/results.html`)
- **Summary Cards:** Average Marks (84.67%), Total Evaluated Modules (6), Highest-Scoring Subject (CS501: 91.0%, Grade A+), Lowest-Scoring Subject (CS503: 71.0%, Grade B+).
- **Component Breakdown Table:** Explicit maximum marks displayed alongside obtained marks for Test 1 (25–30 max), Test 2 (25–30 max), Continuous Assignments (20 max), and Practical/Viva (20–30 max).
- **Attainment Scale & Grades:** Configurable demo grading scheme (Distinction &ge;90%, Very Good 80–89%, Good 70–79%).
- **Interactive Marks Bar Chart:** Visualizes comparative subject performance.
- **Scorecard Modal:** Comprehensive academic evaluation sheet including qualitative faculty feedback appraisal.
- **Print Transcript:** Print-ready formatting for academic advisors.

### Feature 5: Faculty & Subject Directory (`pages/faculty.html`)
- **Dual-View Switcher:** Instant segmented control toggle between "Faculty Directory" and "Subject Directory".
- **Faculty Directory View:**
  - High-resolution studio portraits.
  - Full name, academic designation, department, and room/office location.
  - Institutional email and direct telephone.
  - Subjects taught chips.
  - Years of active university experience & Scopus/IEEE publication count.
  - Modal with research domains, office consultation hours, and direct mail link.
- **Subject Directory View:**
  - Subject code, title, and detailed syllabus description.
  - Semester, credit units, curriculum category (Program Core / Elective).
  - Assigned faculty lead and weekly contact hours.
- **Combined Search & Filtering:** Filter faculty by academic rank (Professors, Associate Professors, Assistant Professors) or subjects by category.

### Feature 6: Faculty & Student Authentication Portal (`pages/login.html`)
- **Dedicated University Login Interface:** Dual segmented tab access for **Faculty Portal** and **Student Portal**.
- **Faculty Login:** Direct authentication with departmental email (e.g. `s.sharma@eng.university.edu`) or Faculty ID, password input with show/hide eye toggle, and remember me preference.
- **One-Click Quick-Fill Demo Presets:** Instantly authenticates as Dr. Sunita Sharma (HOD & Professor), Prof. David Chen, or Prof. Marcus Vance without manual typing.
- **Interactive Role Switching:** Switch between Faculty and Student perspectives at any time via the topbar profile menu or dedicated login screen.
- **Dynamic Faculty Dashboard Mode:** When signed in as Faculty, the portal displays assigned teaching courses, class attendance metrics, and instructional timetable sessions.

---

## 4. Local Setup & Running Instructions

To run the portal locally:

```bash
# 1. Clone repository
git clone <repository_url>
cd department-management-portal

# 2. Run with any local HTTP server or Vite
npm run dev

# Or using Python's built-in static server:
# python3 -m http.server 3000
```

Navigate to `http://localhost:3000` in any modern web browser.

---

## 5. Sample Data & Calculation Consistency

All values across all five pages originate from the single centralized store in `js/data.js` and are calculated dynamically via `js/data-service.js`:

| Subject Code | Subject Name | Attended / Total | Attendance % | Total Marks | Marks % | Assigned Faculty |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **CS501** | Advanced Database Systems | 32 / 36 | 88.89% | 91 / 100 | 91.0% (A+) | Dr. Sunita Sharma |
| **CS502** | Operating Systems & Kernel | 30 / 34 | 88.24% | 84 / 100 | 84.0% (A) | Prof. Marcus Vance |
| **CS503** | Design & Analysis of Algorithms | 24 / 35 | 68.57% | 71 / 100 | 71.0% (B+) | Dr. Rajesh Patel |
| **CS504** | Computer Networks & Protocols | 23 / 30 | 76.67% | 85 / 100 | 85.0% (A) | Prof. Elena Rostova |
| **CS505** | Software Engineering & Agile | 26 / 28 | 92.86% | 90 / 100 | 90.0% (A+) | Dr. Priya Nair |
| **CS506** | Cloud & Distributed Systems | 27 / 32 | 84.38% | 87 / 100 | 87.0% (A) | Prof. David Chen |
| **Totals** | *Semester 5 Overall* | **162 / 195** | **83.08%** | **508 / 600** | **84.67%** | *6 Faculty Leads* |

Mathematical Invariants Enforced:
- $\text{Total Classes} = \text{Attended Classes} + \text{Missed Classes}$ ($195 = 162 + 33$)
- Overall Attendance: $(162 / 195) \times 100 = 83.08\%$
- Overall Average Marks: $(508 / 600) \times 100 = 84.67\%$
- Zero division guard: when total classes or maximum marks are 0, functions return 0 rather than `NaN`.

---

## 6. Demonstration-Only Functionality & Preferences

The following behaviors are intentionally scoped for frontend demonstration:
- **Attendance Benchmark Setting:** Accessible via the "Demo Settings" link in the banner. Modifying the threshold (e.g., from 75% to 85%) updates the calculations dynamically and saves only to `localStorage` for the current browser session.
- **Announcement Read Receipts:** Clicking an announcement marks it read and updates unread badge counters in the topbar; IDs are stored in `localStorage` under `dmp_read_announcements`.
- **Demo Logout:** Shows an informative modal clarifying that authentication is handled by the backend teammate.
- **Time Simulation:** Dropdown on the Timetable page to preview Ongoing vs Upcoming states at different hours of the day.

---

## 7. Backend Integration Guide Summary

See **`BACKEND_HANDOFF.md`** for the complete technical integration contract, including proposed REST endpoints, JSON payload schemas, authentication headers, error codes, and handoff questions.
