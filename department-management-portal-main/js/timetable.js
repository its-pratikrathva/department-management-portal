/**
 * Department Management Portal - Smart Timetable Module
 * 
 * Features:
 * - Weekly schedule Monday to Saturday
 * - Day-by-day filtering & view switching
 * - Subject filtering
 * - Real-time and simulated lecture status (Ongoing, Upcoming, Completed)
 * - Return to Today button
 * - Lecture details modal
 * - Print-friendly schedule
 */

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await initTimetablePage();
  } catch (err) {
    console.error('Failed to initialize timetable:', err);
  }
});

let currentSelectedDay = 'all';
let currentSubjectFilter = 'all';
let currentTypeFilter = 'all';
let simulatedTimeOffset = null; // null means real browser time

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

async function initTimetablePage() {
  // Check URL parameters for initial day (e.g., ?view=today or ?day=Monday)
  const urlParams = new URLSearchParams(window.location.search);
  const requestedView = urlParams.get('view');
  const requestedDay = urlParams.get('day');

  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const todayDayName = daysOfWeek[new Date().getDay()];

  if (requestedView === 'today') {
    currentSelectedDay = (todayDayName === 'Sunday') ? 'Monday' : todayDayName;
  } else if (requestedDay && DAYS.includes(requestedDay)) {
    currentSelectedDay = requestedDay;
  }

  // Populate Subject filter dropdown options
  await populateSubjectFilters();

  // Setup event listeners for tabs and filters
  setupFiltersAndActions();

  // Render Timetable view
  await renderTimetable();
}

async function populateSubjectFilters() {
  const subjects = await window.dataService.getSubjects();
  const select = document.getElementById('timetableSubjectSelect');
  if (!select) return;

  subjects.forEach(sub => {
    const opt = document.createElement('option');
    opt.value = sub.code;
    opt.textContent = `${sub.code} - ${sub.shortName || sub.name}`;
    select.appendChild(opt);
  });
}

function setupFiltersAndActions() {
  // Day tab buttons
  const dayTabs = document.querySelectorAll('.day-filter-tab');
  dayTabs.forEach(tab => {
    const day = tab.getAttribute('data-day');
    if (day === currentSelectedDay) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }

    tab.addEventListener('click', (e) => {
      e.preventDefault();
      dayTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentSelectedDay = day;
      renderTimetable();
    });
  });

  // Subject dropdown
  const subjectSelect = document.getElementById('timetableSubjectSelect');
  if (subjectSelect) {
    subjectSelect.addEventListener('change', (e) => {
      currentSubjectFilter = e.target.value;
      renderTimetable();
    });
  }

  // Type filter
  const typeSelect = document.getElementById('timetableTypeSelect');
  if (typeSelect) {
    typeSelect.addEventListener('change', (e) => {
      currentTypeFilter = e.target.value;
      renderTimetable();
    });
  }

  // Reset filters
  const resetBtn = document.getElementById('timetableResetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      currentSelectedDay = 'all';
      currentSubjectFilter = 'all';
      currentTypeFilter = 'all';
      if (subjectSelect) subjectSelect.value = 'all';
      if (typeSelect) typeSelect.value = 'all';
      dayTabs.forEach(t => {
        if (t.getAttribute('data-day') === 'all') t.classList.add('active');
        else t.classList.remove('active');
      });
      simulatedTimeOffset = null;
      const simSelect = document.getElementById('timetableSimulateSelect');
      if (simSelect) simSelect.value = 'real';
      renderTimetable();
      window.portalShowToast('Filters Reset', 'Showing full weekly timetable schedule.', 'info');
    });
  }

  // Return to Today button
  const returnTodayBtn = document.getElementById('returnTodayBtn');
  if (returnTodayBtn) {
    returnTodayBtn.addEventListener('click', () => {
      const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const todayDayName = daysOfWeek[new Date().getDay()];
      currentSelectedDay = (todayDayName === 'Sunday') ? 'Monday' : todayDayName;

      dayTabs.forEach(t => {
        if (t.getAttribute('data-day') === currentSelectedDay) t.classList.add('active');
        else t.classList.remove('active');
      });

      renderTimetable();
      window.portalShowToast('Navigated to Today', `Displaying classes for ${currentSelectedDay}.`, 'info');
    });
  }

  // Simulation Selector (Tester tool to view Ongoing / Upcoming / Completed states at any hour)
  const simSelect = document.getElementById('timetableSimulateSelect');
  if (simSelect) {
    simSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      if (val === 'morning') {
        // Set time to 09:30 AM today
        const d = new Date();
        d.setHours(9, 30, 0);
        simulatedTimeOffset = d;
        window.portalShowToast('Time Simulated', 'Testing at 09:30 AM (Morning lectures active)', 'info');
      } else if (val === 'afternoon') {
        // Set time to 01:45 PM today
        const d = new Date();
        d.setHours(13, 45, 0);
        simulatedTimeOffset = d;
        window.portalShowToast('Time Simulated', 'Testing at 01:45 PM (Afternoon practical labs active)', 'info');
      } else if (val === 'evening') {
        // Set time to 05:30 PM today
        const d = new Date();
        d.setHours(17, 30, 0);
        simulatedTimeOffset = d;
        window.portalShowToast('Time Simulated', 'Testing at 05:30 PM (All daily classes completed)', 'info');
      } else {
        simulatedTimeOffset = null;
        window.portalShowToast('Real-time Mode', 'Synced with current browser system clock', 'info');
      }
      renderTimetable();
    });
  }

  // Print button
  const printBtn = document.getElementById('timetablePrintBtn');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.portalPrint();
    });
  }
}

async function renderTimetable() {
  const container = document.getElementById('timetableContentContainer');
  if (!container) return;

  const filters = {
    subjectCode: currentSubjectFilter,
    type: currentTypeFilter
  };

  // Fetch timetable items from data service
  let entries = await window.dataService.getTimetable(currentSelectedDay, filters);

  // Re-calculate statuses if a simulated time offset is active
  if (simulatedTimeOffset) {
    entries = entries.map(item => {
      const statusInfo = window.dataService.calculateLectureStatus(
        item.day,
        item.startTime,
        item.endTime,
        simulatedTimeOffset
      );
      return {
        ...item,
        status: statusInfo.status,
        statusLabel: statusInfo.label,
        statusBadgeClass: statusInfo.badgeClass
      };
    });
  }

  // Check empty state
  if (!entries || entries.length === 0) {
    container.innerHTML = `
      <div class="empty-state-box">
        <div class="empty-state-icon">
          <i class="bi bi-calendar-x"></i>
        </div>
        <h4 class="empty-state-title">No Lectures Found</h4>
        <p class="empty-state-text">
          No scheduled classes match the selected day (<strong>${escapeHtml(currentSelectedDay)}</strong>) and filters.
        </p>
        <button type="button" class="btn btn-portal-primary" id="emptyStateResetBtn">
          <i class="bi bi-arrow-counterclockwise me-1"></i> Reset All Filters
        </button>
      </div>
    `;
    const reset = document.getElementById('emptyStateResetBtn');
    if (reset) {
      reset.addEventListener('click', () => {
        document.getElementById('timetableResetBtn').click();
      });
    }
    return;
  }

  // Group entries by day
  const daysToRender = currentSelectedDay === 'all' 
    ? DAYS 
    : [currentSelectedDay];

  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const currentTodayName = daysOfWeek[new Date().getDay()];

  let html = '';

  daysToRender.forEach(day => {
    const dayEntries = entries.filter(e => e.day.toLowerCase() === day.toLowerCase());
    if (dayEntries.length === 0 && currentSelectedDay === 'all') {
      return; // Skip empty days in full week view
    }

    const isToday = day.toLowerCase() === currentTodayName.toLowerCase();

    html += `
      <div class="portal-card mb-4 ${isToday ? 'border-primary' : ''}">
        <div class="portal-card-header ${isToday ? 'bg-primary-subtle border-primary-subtle' : ''}">
          <div class="d-flex align-items-center gap-2">
            <h3 class="portal-card-title mb-0">
              <i class="bi bi-calendar-check ${isToday ? 'text-primary' : 'text-muted'}"></i>
              ${escapeHtml(day)}
            </h3>
            ${isToday ? '<span class="status-badge badge-primary-subtle fw-bold"><i class="bi bi-check-circle-fill me-1"></i>Today</span>' : ''}
          </div>
          <span class="text-muted small">${dayEntries.length} Sessions</span>
        </div>
        <div class="portal-card-body p-0">
          <div class="table-responsive">
            <table class="portal-table table-hover mb-0">
              <thead>
                <tr>
                  <th style="width: 170px;">Time Window</th>
                  <th style="width: 110px;">Code</th>
                  <th>Subject Name</th>
                  <th style="width: 140px;">Type</th>
                  <th>Room / Lab</th>
                  <th>Faculty Instructor</th>
                  <th style="width: 130px;" class="text-center">Live Status</th>
                  <th style="width: 90px;" class="text-end">Details</th>
                </tr>
              </thead>
              <tbody>
                ${dayEntries.length > 0 ? dayEntries.map(e => renderTableRow(e)).join('') : `
                  <tr>
                    <td colspan="8" class="text-center py-4 text-muted small">
                      No classes scheduled for this day.
                    </td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;

  // Attach modal trigger listeners
  container.querySelectorAll('.btn-view-lecture').forEach(btn => {
    btn.addEventListener('click', () => {
      const lectureId = btn.getAttribute('data-lecture-id');
      const item = entries.find(e => e.id === lectureId);
      if (item) openLectureModal(item);
    });
  });
}

function renderTableRow(item) {
  let rowClass = '';
  if (item.status === 'ongoing') rowClass = 'table-success';

  let badge = '';
  if (item.status === 'ongoing') {
    badge = '<span class="status-badge badge-success-subtle"><i class="bi bi-broadcast me-1"></i>Happening Now</span>';
  } else if (item.status === 'upcoming') {
    badge = '<span class="status-badge badge-info-subtle"><i class="bi bi-clock me-1"></i>Upcoming</span>';
  } else if (item.status === 'completed') {
    badge = '<span class="status-badge badge-neutral-subtle">Completed</span>';
  } else {
    badge = '<span class="status-badge badge-primary-subtle">Scheduled</span>';
  }

  return `
    <tr class="${rowClass}">
      <td class="fw-semibold text-dark font-mono-num small">
        <i class="bi bi-clock text-muted me-1"></i>${escapeHtml(item.timeDisplay)}
      </td>
      <td>
        <span class="fw-bold text-primary">${escapeHtml(item.subjectCode)}</span>
      </td>
      <td>
        <div class="fw-semibold text-dark">${escapeHtml(item.subjectName)}</div>
      </td>
      <td>
        <span class="status-badge badge-neutral-subtle">${escapeHtml(item.type)}</span>
      </td>
      <td>
        <span class="text-secondary small"><i class="bi bi-geo-alt me-1 text-muted"></i>${escapeHtml(item.room)}</span>
      </td>
      <td>
        <span class="text-secondary small"><i class="bi bi-person me-1 text-muted"></i>${escapeHtml(item.facultyName)}</span>
      </td>
      <td class="text-center">
        ${badge}
      </td>
      <td class="text-end">
        <button type="button" class="btn btn-portal-secondary btn-portal-sm btn-view-lecture" data-lecture-id="${item.id}" title="View details">
          <i class="bi bi-eye"></i>
        </button>
      </td>
    </tr>
  `;
}

function openLectureModal(item) {
  let modalEl = document.getElementById('lectureDetailModal');
  if (!modalEl) {
    modalEl = document.createElement('div');
    modalEl.id = 'lectureDetailModal';
    modalEl.className = 'modal fade';
    modalEl.tabIndex = -1;
    modalEl.setAttribute('aria-hidden', 'true');
    modalEl.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-calendar-event text-primary"></i>
              <span id="lecModalSubject">Lecture Details</span>
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" id="lecModalBody">
            <!-- Dynamic -->
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-sm btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modalEl);
  }

  const body = document.getElementById('lecModalBody');
  document.getElementById('lecModalSubject').textContent = `${item.subjectCode} · ${item.subjectName}`;

  body.innerHTML = `
    <div class="border rounded p-3 bg-light mb-3">
      <div class="row g-2 small">
        <div class="col-6">
          <span class="text-muted d-block">Scheduled Day:</span>
          <strong>${escapeHtml(item.day)}</strong>
        </div>
        <div class="col-6">
          <span class="text-muted d-block">Time Slot:</span>
          <strong class="tabular-nums">${escapeHtml(item.timeDisplay)}</strong>
        </div>
        <div class="col-6">
          <span class="text-muted d-block">Classroom / Facility:</span>
          <strong>${escapeHtml(item.room)}</strong>
        </div>
        <div class="col-6">
          <span class="text-muted d-block">Session Classification:</span>
          <span class="status-badge badge-primary-subtle">${escapeHtml(item.type)}</span>
        </div>
        <div class="col-12 mt-2">
          <span class="text-muted d-block">Faculty In-Charge:</span>
          <strong>${escapeHtml(item.facultyName)}</strong>
        </div>
      </div>
    </div>
    
    <div class="small text-muted">
      <h6 class="fw-bold text-dark mb-1" style="font-size: 0.85rem;">Attendance & Preparation Guideline</h6>
      <p class="mb-0">
        Students must arrive at ${escapeHtml(item.room)} at least 5 minutes prior to the start bell. 
        Attendance is recorded digitally within the first 15 minutes of the session.
      </p>
    </div>
  `;

  const bsModal = new bootstrap.Modal(modalEl);
  bsModal.show();
}
