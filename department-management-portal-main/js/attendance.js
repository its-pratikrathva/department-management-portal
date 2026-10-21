/**
 * Department Management Portal - Attendance Tracker Module
 * 
 * Features:
 * - Summary cards (Overall %, Conducted, Attended, Missed, Subjects Below Benchmark)
 * - Search by subject code/name
 * - Filter by attendance status
 * - Sorting by attendance % or name
 * - Drill-down session history modal
 * - Dynamic consecutive classes calculation to reach threshold
 * - Low-attendance alert callout
 */

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await initAttendancePage();
  } catch (err) {
    console.error('Failed to initialize attendance page:', err);
  }
});

let attendanceFilterStatus = 'all';
let attendanceSearchQuery = '';
let attendanceSortBy = 'percentage_desc';

async function initAttendancePage() {
  // Check URL query parameters (e.g. ?filter=below)
  const urlParams = new URLSearchParams(window.location.search);
  const requestedFilter = urlParams.get('filter');
  if (requestedFilter === 'below') {
    attendanceFilterStatus = 'Below Threshold';
    const statusSelect = document.getElementById('attendanceStatusSelect');
    if (statusSelect) statusSelect.value = 'Below Threshold';
  }

  setupEventListeners();
  await refreshAttendanceView();
}

function setupEventListeners() {
  // Search input
  const searchInput = document.getElementById('attendanceSearchInput');
  const clearBtn = document.getElementById('attendanceClearSearchBtn');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      attendanceSearchQuery = e.target.value;
      if (clearBtn) {
        clearBtn.style.display = attendanceSearchQuery.length > 0 ? 'block' : 'none';
      }
      refreshAttendanceView();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        attendanceSearchQuery = '';
        clearBtn.style.display = 'none';
        refreshAttendanceView();
      }
    });
  }

  // Status Filter Select
  const statusSelect = document.getElementById('attendanceStatusSelect');
  if (statusSelect) {
    statusSelect.addEventListener('change', (e) => {
      attendanceFilterStatus = e.target.value;
      refreshAttendanceView();
    });
  }

  // Sort Select
  const sortSelect = document.getElementById('attendanceSortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      attendanceSortBy = e.target.value;
      refreshAttendanceView();
    });
  }

  // Reset Button
  const resetBtn = document.getElementById('attendanceResetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      attendanceSearchQuery = '';
      attendanceFilterStatus = 'all';
      attendanceSortBy = 'percentage_desc';
      if (searchInput) searchInput.value = '';
      if (clearBtn) clearBtn.style.display = 'none';
      if (statusSelect) statusSelect.value = 'all';
      if (sortSelect) sortSelect.value = 'percentage_desc';
      refreshAttendanceView();
      window.portalShowToast('Filters Cleared', 'Displaying all subject attendance records.', 'info');
    });
  }

  // Printable Report
  const printBtn = document.getElementById('attendancePrintBtn');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.portalPrint();
    });
  }
}

async function refreshAttendanceView() {
  const [summary, records] = await Promise.all([
    window.dataService.getAttendanceSummary(),
    window.dataService.getAttendance({
      search: attendanceSearchQuery,
      status: attendanceFilterStatus,
      sortBy: attendanceSortBy
    })
  ]);

  renderSummaryCards(summary);
  renderLowAttendanceAlert(summary, records);
  renderAttendanceTable(records, summary.threshold);
}

function renderSummaryCards(summary) {
  const overallEl = document.getElementById('attSummaryOverall');
  const conductedEl = document.getElementById('attSummaryConducted');
  const attendedEl = document.getElementById('attSummaryAttended');
  const missedEl = document.getElementById('attSummaryMissed');
  const belowThresholdEl = document.getElementById('attSummaryBelow');
  const thresholdBadgeEl = document.getElementById('attThresholdBadge');

  if (overallEl) overallEl.textContent = `${summary.overallPercentage}%`;
  if (conductedEl) conductedEl.textContent = summary.totalClasses;
  if (attendedEl) attendedEl.textContent = summary.attendedClasses;
  if (missedEl) missedEl.textContent = summary.missedClasses;
  if (belowThresholdEl) belowThresholdEl.textContent = summary.belowThresholdCount;
  if (thresholdBadgeEl) thresholdBadgeEl.textContent = `Target Benchmark: ${summary.threshold}%`;
}

function renderLowAttendanceAlert(summary, allRecords) {
  const alertContainer = document.getElementById('attendanceAlertContainer');
  if (!alertContainer) return;

  const lowSubjects = allRecords.filter(r => r.percentage < summary.threshold);

  if (lowSubjects.length === 0) {
    alertContainer.innerHTML = '';
    return;
  }

  alertContainer.innerHTML = `
    <div class="alert alert-warning border border-warning-subtle d-flex flex-wrap align-items-center justify-content-between p-3 mb-4 rounded-3 shadow-sm">
      <div class="d-flex align-items-center gap-2">
        <i class="bi bi-exclamation-triangle-fill text-warning fs-5"></i>
        <div>
          <span class="fw-bold text-dark">Attendance Warning (${lowSubjects.length} Subject${lowSubjects.length > 1 ? 's' : ''} Below ${summary.threshold}%):</span>
          <div class="text-secondary small mt-0">
            ${lowSubjects.map(s => `<strong>${escapeHtml(s.subjectCode)}</strong> (${s.percentage}%) requires ${s.classesNeeded} additional consecutive attended class${s.classesNeeded === 1 ? '' : 'es'}`).join('; ')}.
          </div>
        </div>
      </div>
      <button type="button" class="btn btn-sm btn-outline-warning text-dark mt-2 mt-md-0" onclick="document.getElementById('attendanceStatusSelect').value='Below Threshold'; document.getElementById('attendanceStatusSelect').dispatchEvent(new Event('change'));">
        Filter Low Attendance
      </button>
    </div>
  `;
}

function renderAttendanceTable(records, threshold) {
  const tbody = document.getElementById('attendanceTableBody');
  const emptyBox = document.getElementById('attendanceEmptyBox');
  const countBadge = document.getElementById('attendanceRecordsCount');

  if (countBadge) countBadge.textContent = `${records.length} Subjects`;

  if (!records || records.length === 0) {
    if (tbody) tbody.innerHTML = '';
    if (emptyBox) emptyBox.style.display = 'block';
    return;
  }

  if (emptyBox) emptyBox.style.display = 'none';

  tbody.innerHTML = records.map(r => {
    let progressBarClass = 'progress-good';
    if (r.percentage < threshold) progressBarClass = 'progress-danger';
    else if (r.percentage < threshold + 5) progressBarClass = 'progress-attention';

    let consecutiveNotice = '';
    if (r.percentage < threshold) {
      consecutiveNotice = `<div class="text-danger small mt-1 font-mono-num" style="font-size: 0.72rem;">
        <i class="bi bi-arrow-up-right me-1"></i>Need +${r.classesNeeded} consecutive to reach ${threshold}%
      </div>`;
    } else {
      consecutiveNotice = `<div class="text-success small mt-1" style="font-size: 0.72rem;">
        <i class="bi bi-shield-check me-1"></i>Benchmark satisfied
      </div>`;
    }

    return `
      <tr>
        <td>
          <span class="fw-bold text-primary font-mono-num">${escapeHtml(r.subjectCode)}</span>
        </td>
        <td>
          <div class="fw-semibold text-dark">${escapeHtml(r.subjectName)}</div>
          ${consecutiveNotice}
        </td>
        <td class="text-num-right font-mono-num fw-semibold">${r.totalClasses}</td>
        <td class="text-num-right font-mono-num text-success fw-bold">${r.attendedClasses}</td>
        <td class="text-num-right font-mono-num text-danger fw-bold">${r.missedClasses}</td>
        <td style="min-width: 170px;">
          <div class="d-flex align-items-center justify-content-between mb-1">
            <span class="fw-bold tabular-nums" style="font-size: 0.85rem;">${r.percentage}%</span>
            <span class="text-muted small">Target: ${threshold}%</span>
          </div>
          <div class="portal-progress">
            <div class="portal-progress-bar ${progressBarClass}" style="width: ${Math.min(100, r.percentage)}%;"></div>
          </div>
        </td>
        <td>
          <span class="status-badge ${r.badgeClass}">
            ${escapeHtml(r.status)}
          </span>
        </td>
        <td class="text-end">
          <button type="button" class="btn btn-portal-secondary btn-portal-sm btn-view-sessions" data-subject-code="${escapeHtml(r.subjectCode)}" title="View Session History">
            <i class="bi bi-clock-history me-1"></i>History
          </button>
        </td>
      </tr>
    `;
  }).join('');

  // Attach session history modal triggers
  tbody.querySelectorAll('.btn-view-sessions').forEach(btn => {
    btn.addEventListener('click', () => {
      const code = btn.getAttribute('data-subject-code');
      const rec = records.find(r => r.subjectCode === code);
      if (rec) openSessionHistoryModal(rec, threshold);
    });
  });
}

function openSessionHistoryModal(record, threshold) {
  let modalEl = document.getElementById('sessionHistoryModal');
  if (!modalEl) {
    modalEl = document.createElement('div');
    modalEl.id = 'sessionHistoryModal';
    modalEl.className = 'modal fade';
    modalEl.tabIndex = -1;
    modalEl.setAttribute('aria-hidden', 'true');
    modalEl.innerHTML = `
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-journal-text text-primary"></i>
              <span id="sessionModalSubject">Session Attendance History</span>
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" id="sessionModalBody">
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

  document.getElementById('sessionModalSubject').textContent = `${record.subjectCode} · ${record.subjectName}`;

  const body = document.getElementById('sessionModalBody');
  const sessions = record.sessions || [];

  body.innerHTML = `
    <!-- Subject Summary Header in Modal -->
    <div class="row g-2 mb-3 p-3 bg-light rounded border text-center">
      <div class="col-3">
        <span class="text-muted small d-block">Conducted</span>
        <strong class="font-mono-num fs-6">${record.totalClasses}</strong>
      </div>
      <div class="col-3">
        <span class="text-muted small d-block">Attended</span>
        <strong class="font-mono-num text-success fs-6">${record.attendedClasses}</strong>
      </div>
      <div class="col-3">
        <span class="text-muted small d-block">Missed</span>
        <strong class="font-mono-num text-danger fs-6">${record.missedClasses}</strong>
      </div>
      <div class="col-3">
        <span class="text-muted small d-block">Current %</span>
        <strong class="font-mono-num ${record.percentage < threshold ? 'text-danger' : 'text-primary'} fs-6">${record.percentage}%</strong>
      </div>
    </div>

    <!-- Consecutive Recovery Calculation if below threshold -->
    ${record.percentage < threshold ? `
      <div class="alert alert-danger py-2 px-3 small mb-3">
        <i class="bi bi-info-circle-fill me-1"></i>
        <strong>Recovery Target:</strong> To achieve the demonstration benchmark of ${threshold}%, you must attend at least <strong>${record.classesNeeded} consecutive upcoming classes</strong> without absence.
      </div>
    ` : ''}

    <h6 class="fw-bold text-dark mb-2" style="font-size: 0.9rem;">Recent Recorded Sessions</h6>
    <div class="table-responsive border rounded">
      <table class="portal-table table-hover mb-0">
        <thead>
          <tr>
            <th style="width: 120px;">Session Date</th>
            <th>Classroom Topic / Lab Experiment</th>
            <th style="width: 130px;" class="text-end">Student Status</th>
          </tr>
        </thead>
        <tbody>
          ${sessions.length > 0 ? sessions.map(s => `
            <tr>
              <td class="font-mono-num small text-muted">${escapeHtml(s.date)}</td>
              <td class="text-dark fw-medium small">${escapeHtml(s.topic)}</td>
              <td class="text-end">
                <span class="status-badge ${s.status === 'Present' ? 'badge-success-subtle' : 'badge-danger-subtle'}">
                  ${s.status === 'Present' ? '<i class="bi bi-check me-1"></i>' : '<i class="bi bi-x me-1"></i>'}${escapeHtml(s.status)}
                </span>
              </td>
            </tr>
          `).join('') : `
            <tr>
              <td colspan="3" class="text-center py-3 text-muted small">No session log entries available.</td>
            </tr>
          `}
        </tbody>
      </table>
    </div>
    <div class="text-muted mt-2" style="font-size: 0.72rem;">
      * Official attendance logs are digitally verified by subject professors. For discrepancies, contact the department office within 3 working days.
    </div>
  `;

  const bsModal = new bootstrap.Modal(modalEl);
  bsModal.show();
}
