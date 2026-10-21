/**
 * Department Management Portal - Dashboard Module
 * 
 * Handles rendering for index.html:
 * - Student profile header
 * - 4 Key statistic cards
 * - Attendance Chart.js (subject-wise percentage)
 * - Academic Performance Chart.js (subject-wise marks)
 * - Today's Timetable live widget
 * - Department Announcements stream
 */

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await initDashboard();
  } catch (err) {
    console.error('Failed to initialize dashboard:', err);
  }
});

let attendanceChartInstance = null;
let performanceChartInstance = null;

async function initDashboard() {
  const [stats, currentUser, attendance, results, todayLectures, announcements] = await Promise.all([
    window.dataService.getStatistics(),
    window.dataService.getCurrentUser(),
    window.dataService.getAttendance(),
    window.dataService.getResults(),
    window.dataService.getTodayLectures(),
    window.dataService.getAnnouncements()
  ]);

  renderUserBanner(currentUser, stats);
  renderStatCards(stats, currentUser);
  renderTodaySchedule(todayLectures, currentUser);
  renderAnnouncements(announcements);
  renderAttendanceChart(attendance, stats.attendanceThreshold);
  renderPerformanceChart(results);
}

function renderUserBanner(user, stats) {
  const nameEl = document.getElementById('dashStudentName');
  const metaDeptEl = document.getElementById('dashStudentDept');
  const metaRollEl = document.getElementById('dashStudentRoll');
  const metaSemEl = document.getElementById('dashStudentSem');
  const avatarEl = document.getElementById('dashStudentAvatar');
  const cgpaEl = document.getElementById('dashStudentCgpa');
  const creditsEl = document.getElementById('dashStudentCredits');

  if (user.isFaculty) {
    if (nameEl) nameEl.innerHTML = `${escapeHtml(user.fullName)} <span class="badge bg-warning text-dark ms-2 fw-semibold" style="font-size: 0.72rem;"><i class="bi bi-person-workspace me-1"></i>Faculty Portal</span>`;
    if (metaDeptEl) metaDeptEl.textContent = `${user.designation} · ${user.department}`;
    if (metaRollEl) metaRollEl.textContent = `Office: ${user.office} · ${user.email}`;
    if (metaSemEl) {
      const taughtStr = (user.subjectsTaught || []).map(s => s.code).join(', ');
      metaSemEl.textContent = `Assigned Courses: ${taughtStr || 'CS501'} · Office Hours: ${user.officeHours || 'Mon & Wed 14:00–16:00'}`;
    }
    if (cgpaEl) cgpaEl.textContent = `${user.experienceYears} Yrs Exp`;
    if (creditsEl) creditsEl.innerHTML = `<button type="button" class="btn btn-sm btn-outline-light py-0 px-2" style="font-size: 0.75rem;" onclick="window.dataService.switchRole('student').then(() => window.location.reload())"><i class="bi bi-arrow-repeat me-1"></i>Switch to Student View</button>`;
  } else {
    if (nameEl) nameEl.textContent = user.fullName;
    if (metaDeptEl) metaDeptEl.textContent = user.department;
    if (metaRollEl) metaRollEl.textContent = `Roll No: ${user.rollNo} (${user.enrollmentNo})`;
    if (metaSemEl) metaSemEl.textContent = `Semester ${user.semester} · Sec ${user.section} · ${user.academicYear}`;
    if (cgpaEl) cgpaEl.textContent = `${user.cgpa} / 10`;
    if (creditsEl) creditsEl.textContent = `Active Full-Time`;
  }

  if (avatarEl && user.avatar) {
    avatarEl.src = user.avatar;
    avatarEl.onerror = () => {
      avatarEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=1d4ed8&color=fff`;
    };
  }
}

function renderStatCards(stats, user = {}) {
  const totalSubEl = document.getElementById('statTotalSubjects');
  const attendPctEl = document.getElementById('statAttendancePct');
  const attendSubEl = document.getElementById('statAttendanceSubtext');
  const avgMarksEl = document.getElementById('statAvgMarks');
  const marksSubEl = document.getElementById('statMarksSubtext');
  const todayLecEl = document.getElementById('statTodayLectures');
  const todaySubEl = document.getElementById('statTodaySubtext');

  if (user.isFaculty) {
    const taughtCount = (user.subjectsTaught || []).length || 2;
    if (totalSubEl) totalSubEl.textContent = taughtCount;
    const stat1Label = totalSubEl?.parentElement?.querySelector('.stat-label');
    if (stat1Label) stat1Label.textContent = 'Courses Instructed';

    if (attendPctEl) attendPctEl.textContent = `88.89%`;
    if (attendSubEl) attendSubEl.innerHTML = `<span class="text-success fw-semibold"><i class="bi bi-people me-1"></i>CS501 Student Attendance</span>`;

    if (avgMarksEl) avgMarksEl.textContent = `91.0%`;
    if (marksSubEl) marksSubEl.innerHTML = `<span class="text-muted tabular-nums">CS501 Class Average Attainment</span>`;
    const stat3Label = avgMarksEl?.parentElement?.querySelector('.stat-label');
    if (stat3Label) stat3Label.textContent = 'Class Attainment';

    if (todayLecEl) todayLecEl.textContent = `2`;
    if (todaySubEl) todaySubEl.textContent = `Scheduled teaching sessions`;
    const stat4Label = todayLecEl?.parentElement?.querySelector('.stat-label');
    if (stat4Label) stat4Label.textContent = 'Faculty Sessions';
    return;
  }

  if (attendPctEl) {
    attendPctEl.textContent = `${stats.overallAttendancePct}%`;
    if (attendSubEl) {
      if (stats.subjectsBelowThreshold > 0) {
        attendSubEl.innerHTML = `<span class="text-danger fw-semibold"><i class="bi bi-exclamation-circle me-1"></i>${stats.subjectsBelowThreshold} below ${stats.attendanceThreshold}% threshold</span>`;
      } else {
        attendSubEl.innerHTML = `<span class="text-success fw-semibold"><i class="bi bi-check-circle me-1"></i>Above ${stats.attendanceThreshold}% benchmark</span>`;
      }
    }
  }

  if (avgMarksEl) {
    avgMarksEl.textContent = `${stats.averageMarksPct}%`;
    if (marksSubEl) {
      marksSubEl.innerHTML = `<span class="text-muted tabular-nums">${stats.totalObtainedMarks} / ${stats.totalMaxMarks} total marks</span>`;
    }
  }

  if (todayLecEl) {
    todayLecEl.textContent = stats.todayLecturesCount;
    if (todaySubEl) {
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const currentDay = dayNames[new Date().getDay()];
      todaySubEl.textContent = `${currentDay}'s classes & labs`;
    }
  }
}

function renderTodaySchedule(lectures) {
  const container = document.getElementById('dashTodayScheduleContainer');
  if (!container) return;

  if (!lectures || lectures.length === 0) {
    container.innerHTML = `
      <div class="empty-state-box py-4 my-0">
        <i class="bi bi-calendar2-check text-muted" style="font-size: 2rem;"></i>
        <h6 class="mt-2 mb-1 fw-bold text-dark">No Scheduled Lectures Today</h6>
        <p class="text-muted small mb-0">Enjoy your study recess or visit the weekly timetable to prepare ahead.</p>
        <a href="pages/timetable.html" class="btn btn-sm btn-portal-secondary mt-3">
          <i class="bi bi-calendar3 me-1"></i> View Full Weekly Timetable
        </a>
      </div>
    `;
    return;
  }

  container.innerHTML = lectures.map(item => {
    let cardClass = '';
    let statusBadge = '';
    if (item.status === 'ongoing') {
      cardClass = 'is-ongoing';
      statusBadge = '<span class="status-badge badge-success-subtle"><i class="bi bi-record-circle me-1"></i>Happening Now</span>';
    } else if (item.status === 'upcoming') {
      cardClass = 'is-upcoming';
      statusBadge = '<span class="status-badge badge-info-subtle"><i class="bi bi-clock me-1"></i>Upcoming Today</span>';
    } else {
      cardClass = 'is-completed';
      statusBadge = '<span class="status-badge badge-neutral-subtle">Completed</span>';
    }

    return `
      <div class="schedule-item-card ${cardClass}">
        <div class="schedule-time-badge">
          <span class="schedule-time-text">${escapeHtml(item.timeDisplay)}</span>
          <span class="schedule-duration">${escapeHtml(item.type)}</span>
        </div>
        <div class="schedule-details">
          <div class="schedule-subject" title="${escapeHtml(item.subjectName)}">
            <span class="fw-bold me-1 text-primary">${escapeHtml(item.subjectCode)}:</span>${escapeHtml(item.subjectName)}
          </div>
          <div class="schedule-location">
            <span><i class="bi bi-geo-alt me-1"></i>${escapeHtml(item.room)}</span>
            <span class="meta-divider">·</span>
            <span><i class="bi bi-person me-1"></i>${escapeHtml(item.facultyName)}</span>
          </div>
        </div>
        <div>
          ${statusBadge}
        </div>
      </div>
    `;
  }).join('');
}

function renderAnnouncements(announcements) {
  const container = document.getElementById('dashAnnouncementsContainer');
  if (!container) return;

  if (!announcements || announcements.length === 0) {
    container.innerHTML = `
      <div class="text-center p-4 text-muted small">
        <i class="bi bi-megaphone text-secondary" style="font-size: 1.75rem;"></i>
        <div class="mt-2">No announcements published this week</div>
      </div>
    `;
    return;
  }

  container.innerHTML = announcements.slice(0, 4).map(item => `
    <div class="announcement-item ${!item.read ? 'unread' : ''}" onclick="window.openAnnouncementModal('${item.id}')">
      <div class="announcement-header">
        <span class="status-badge ${item.priority === 'High' || item.priority === 'Urgent' ? 'badge-danger-subtle' : 'badge-primary-subtle'}">
          ${escapeHtml(item.category)}
        </span>
        <span class="announcement-date">${escapeHtml(item.date)}</span>
      </div>
      <h6 class="announcement-title">
        ${!item.read ? '<span class="text-primary me-1">●</span>' : ''}${escapeHtml(item.title)}
      </h6>
      <p class="announcement-summary">${escapeHtml(item.summary)}</p>
    </div>
  `).join('');
}

function renderAttendanceChart(attendance, threshold = 75.0) {
  const canvas = document.getElementById('dashAttendanceChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (attendanceChartInstance) {
    attendanceChartInstance.destroy();
  }

  const labels = attendance.map(a => a.subjectCode);
  const data = attendance.map(a => a.percentage);
  const backgroundColors = attendance.map(a => {
    if (a.percentage < threshold) return 'rgba(220, 38, 38, 0.85)'; // Red
    if (a.percentage < threshold + 5) return 'rgba(217, 119, 6, 0.85)'; // Amber
    return 'rgba(37, 99, 235, 0.85)'; // Royal Blue
  });

  const borderColors = attendance.map(a => {
    if (a.percentage < threshold) return '#dc2626';
    if (a.percentage < threshold + 5) return '#d97706';
    return '#1d4ed8';
  });

  attendanceChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Attendance %',
        data: data,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
        borderRadius: 4,
        maxBarThickness: 38
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: function (items) {
              const code = items[0].label;
              const sub = attendance.find(a => a.subjectCode === code);
              return sub ? `${sub.subjectCode} - ${sub.subjectName}` : code;
            },
            label: function (item) {
              const sub = attendance[item.dataIndex];
              return [
                ` Attendance: ${item.raw}%`,
                ` Classes: ${sub.attendedClasses} attended / ${sub.totalClasses} held`,
                ` Benchmark: ${threshold}%`
              ];
            }
          }
        }
      },
      scales: {
        y: {
          min: 0,
          max: 100,
          grid: { color: 'rgba(226, 232, 240, 0.6)' },
          ticks: {
            stepSize: 20,
            callback: val => `${val}%`,
            font: { family: 'Plus Jakarta Sans', size: 11 }
          }
        },
        x: {
          grid: { display: false },
          ticks: {
            font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' }
          }
        }
      }
    }
  });
}

function renderPerformanceChart(results) {
  const canvas = document.getElementById('dashPerformanceChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (performanceChartInstance) {
    performanceChartInstance.destroy();
  }

  const labels = results.map(r => r.subjectCode);
  const percentages = results.map(r => r.percentage);

  performanceChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Marks %',
        data: percentages,
        backgroundColor: 'rgba(12, 30, 51, 0.85)',
        borderColor: '#0c1e33',
        borderWidth: 1,
        borderRadius: 4,
        maxBarThickness: 38
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: function (items) {
              const code = items[0].label;
              const res = results.find(r => r.subjectCode === code);
              return res ? `${res.subjectCode} - ${res.subjectName}` : code;
            },
            label: function (item) {
              const res = results[item.dataIndex];
              return [
                ` Percentage: ${item.raw}% (Grade: ${res.grade})`,
                ` Score: ${res.totalObtained} / ${res.totalMax} marks`,
                ` Category: ${res.performanceCategory}`
              ];
            }
          }
        }
      },
      scales: {
        y: {
          min: 0,
          max: 100,
          grid: { color: 'rgba(226, 232, 240, 0.6)' },
          ticks: {
            stepSize: 20,
            callback: val => `${val}%`,
            font: { family: 'Plus Jakarta Sans', size: 11 }
          }
        },
        x: {
          grid: { display: false },
          ticks: {
            font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' }
          }
        }
      }
    }
  });
}
