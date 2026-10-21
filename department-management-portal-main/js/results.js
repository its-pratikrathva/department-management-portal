/**
 * Department Management Portal - Internal Marks & Result Module
 * 
 * Features:
 * - Summary cards (Average Marks %, Evaluated Subjects, Highest Subject, Lowest Subject)
 * - Subject-wise component marks table with maximum marks explicit per component
 * - Performance Category & Grade badges
 * - Subject performance comparison Chart.js
 * - Search, Category filter, Sorting
 * - Marks detail modal with faculty qualitative feedback
 * - Print-friendly result summary
 */

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await initResultsPage();
  } catch (err) {
    console.error('Failed to initialize results page:', err);
  }
});

let resultsCategoryFilter = 'all';
let resultsSearchQuery = '';
let resultsSortBy = 'percentage_desc';
let resultsChartInstance = null;

async function initResultsPage() {
  setupEventListeners();
  await refreshResultsView();
}

function setupEventListeners() {
  // Search input
  const searchInput = document.getElementById('resultsSearchInput');
  const clearBtn = document.getElementById('resultsClearSearchBtn');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      resultsSearchQuery = e.target.value;
      if (clearBtn) {
        clearBtn.style.display = resultsSearchQuery.length > 0 ? 'block' : 'none';
      }
      refreshResultsView();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        resultsSearchQuery = '';
        clearBtn.style.display = 'none';
        refreshResultsView();
      }
    });
  }

  // Category Filter Select
  const categorySelect = document.getElementById('resultsCategorySelect');
  if (categorySelect) {
    categorySelect.addEventListener('change', (e) => {
      resultsCategoryFilter = e.target.value;
      refreshResultsView();
    });
  }

  // Sort Select
  const sortSelect = document.getElementById('resultsSortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      resultsSortBy = e.target.value;
      refreshResultsView();
    });
  }

  // Reset Filters
  const resetBtn = document.getElementById('resultsResetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      resultsSearchQuery = '';
      resultsCategoryFilter = 'all';
      resultsSortBy = 'percentage_desc';
      if (searchInput) searchInput.value = '';
      if (clearBtn) clearBtn.style.display = 'none';
      if (categorySelect) categorySelect.value = 'all';
      if (sortSelect) sortSelect.value = 'percentage_desc';
      refreshResultsView();
      window.portalShowToast('Filters Cleared', 'Displaying all subject performance records.', 'info');
    });
  }

  // Print Summary
  const printBtn = document.getElementById('resultsPrintBtn');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.portalPrint();
    });
  }
}

async function refreshResultsView() {
  const [summary, records] = await Promise.all([
    window.dataService.getResultsSummary(),
    window.dataService.getResults({
      search: resultsSearchQuery,
      category: resultsCategoryFilter,
      sortBy: resultsSortBy
    })
  ]);

  renderSummaryCards(summary);
  renderResultsTable(records);
  renderResultsChart(records);
}

function renderSummaryCards(summary) {
  const avgEl = document.getElementById('resSummaryAvg');
  const countEl = document.getElementById('resSummaryCount');
  const highestEl = document.getElementById('resSummaryHighest');
  const lowestEl = document.getElementById('resSummaryLowest');
  const totalMarksEl = document.getElementById('resSummaryTotalMarks');

  if (avgEl) avgEl.textContent = `${summary.averagePercentage}%`;
  if (countEl) countEl.textContent = summary.totalEvaluatedSubjects;
  if (totalMarksEl) totalMarksEl.textContent = `${summary.totalObtainedMarks} / ${summary.totalMaxMarks} Total Points`;

  if (highestEl && summary.highestScoringSubject) {
    highestEl.innerHTML = `
      <div class="fw-bold text-success">${escapeHtml(summary.highestScoringSubject.code)}: ${summary.highestScoringSubject.percentage}%</div>
      <div class="text-muted small text-truncate">${escapeHtml(summary.highestScoringSubject.name)} (Grade: ${summary.highestScoringSubject.grade})</div>
    `;
  }

  if (lowestEl && summary.lowestScoringSubject) {
    lowestEl.innerHTML = `
      <div class="fw-bold text-secondary">${escapeHtml(summary.lowestScoringSubject.code)}: ${summary.lowestScoringSubject.percentage}%</div>
      <div class="text-muted small text-truncate">${escapeHtml(summary.lowestScoringSubject.name)} (Grade: ${summary.lowestScoringSubject.grade})</div>
    `;
  }
}

function renderResultsTable(records) {
  const tbody = document.getElementById('resultsTableBody');
  const emptyBox = document.getElementById('resultsEmptyBox');
  const countBadge = document.getElementById('resultsRecordCount');

  if (countBadge) countBadge.textContent = `${records.length} Subjects Evaluated`;

  if (!records || records.length === 0) {
    if (tbody) tbody.innerHTML = '';
    if (emptyBox) emptyBox.style.display = 'block';
    return;
  }

  if (emptyBox) emptyBox.style.display = 'none';

  tbody.innerHTML = records.map(r => {
    // Extract individual assessment components
    const t1 = r.components.find(c => c.name.includes('Test 1')) || { obtained: '-', max: '-' };
    const t2 = r.components.find(c => c.name.includes('Test 2')) || { obtained: '-', max: '-' };
    const assign = r.components.find(c => c.name.toLowerCase().includes('assign') || c.name.toLowerCase().includes('problem')) || { obtained: '-', max: '-' };
    const prac = r.components.find(c => c.name.toLowerCase().includes('prac') || c.name.toLowerCase().includes('viva') || c.name.toLowerCase().includes('presentation')) || { obtained: '-', max: '-' };

    let categoryBadge = 'badge-primary-subtle';
    if (r.performanceCategory === 'Distinction') categoryBadge = 'badge-success-subtle';
    else if (r.performanceCategory === 'Good') categoryBadge = 'badge-neutral-subtle';

    return `
      <tr>
        <td>
          <span class="fw-bold text-primary font-mono-num">${escapeHtml(r.subjectCode)}</span>
        </td>
        <td>
          <div class="fw-semibold text-dark">${escapeHtml(r.subjectName)}</div>
          <div class="text-muted small">${r.credits} Credits · 5th Semester</div>
        </td>
        <td class="text-num-right font-mono-num small">
          <span class="fw-semibold">${t1.obtained}</span><span class="text-muted">/${t1.max}</span>
        </td>
        <td class="text-num-right font-mono-num small">
          <span class="fw-semibold">${t2.obtained}</span><span class="text-muted">/${t2.max}</span>
        </td>
        <td class="text-num-right font-mono-num small">
          <span class="fw-semibold">${assign.obtained}</span><span class="text-muted">/${assign.max}</span>
        </td>
        <td class="text-num-right font-mono-num small">
          <span class="fw-semibold">${prac.obtained}</span><span class="text-muted">/${prac.max}</span>
        </td>
        <td class="text-num-right font-mono-num fw-bold">
          <span class="text-dark">${r.totalObtained}</span><span class="text-muted">/${r.totalMax}</span>
        </td>
        <td class="text-num-right font-mono-num fw-bold text-primary" style="font-size: 0.9rem;">
          ${r.percentage}%
        </td>
        <td class="text-center">
          <span class="fw-bold text-dark font-mono-num">${escapeHtml(r.grade)}</span>
        </td>
        <td>
          <span class="status-badge ${categoryBadge}">
            ${escapeHtml(r.performanceCategory)}
          </span>
        </td>
        <td class="text-end">
          <button type="button" class="btn btn-portal-secondary btn-portal-sm btn-view-result" data-subject-code="${escapeHtml(r.subjectCode)}" title="View Detailed Report">
            <i class="bi bi-file-earmark-text me-1"></i>Report
          </button>
        </td>
      </tr>
    `;
  }).join('');

  // Attach modal handlers
  tbody.querySelectorAll('.btn-view-result').forEach(btn => {
    btn.addEventListener('click', () => {
      const code = btn.getAttribute('data-subject-code');
      const rec = records.find(r => r.subjectCode === code);
      if (rec) openResultModal(rec);
    });
  });
}

function renderResultsChart(records) {
  const canvas = document.getElementById('resultsBarChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (resultsChartInstance) {
    resultsChartInstance.destroy();
  }

  if (!records || records.length === 0) return;

  const labels = records.map(r => r.subjectCode);
  const percentages = records.map(r => r.percentage);

  resultsChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Subject Percentage (%)',
        data: percentages,
        backgroundColor: 'rgba(29, 78, 216, 0.85)',
        borderColor: '#1d4ed8',
        borderWidth: 1,
        borderRadius: 4,
        maxBarThickness: 42
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
              const sub = records.find(r => r.subjectCode === code);
              return sub ? `${sub.subjectCode} - ${sub.subjectName}` : code;
            },
            label: function (item) {
              const r = records[item.dataIndex];
              return [
                ` Percentage: ${item.raw}% (Grade: ${r.grade})`,
                ` Score: ${r.totalObtained} / ${r.totalMax} total marks`,
                ` Category: ${r.performanceCategory}`
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

function openResultModal(record) {
  let modalEl = document.getElementById('resultDetailModal');
  if (!modalEl) {
    modalEl = document.createElement('div');
    modalEl.id = 'resultDetailModal';
    modalEl.className = 'modal fade';
    modalEl.tabIndex = -1;
    modalEl.setAttribute('aria-hidden', 'true');
    modalEl.innerHTML = `
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-file-earmark-check text-primary"></i>
              <span id="resultModalTitle">Detailed Assessment Scorecard</span>
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" id="resultModalBody">
            <!-- Dynamic -->
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-sm btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-sm btn-portal-primary" onclick="window.print()">
              <i class="bi bi-printer me-1"></i> Print Scorecard
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modalEl);
  }

  document.getElementById('resultModalTitle').textContent = `${record.subjectCode} · ${record.subjectName}`;

  const body = document.getElementById('resultModalBody');
  const components = record.components || [];

  body.innerHTML = `
    <!-- Top Summary Banner in Modal -->
    <div class="d-flex flex-wrap align-items-center justify-content-between p-3 bg-light rounded border mb-3">
      <div>
        <span class="text-muted small d-block">Overall Score</span>
        <div class="fs-4 fw-bold text-dark font-mono-num">
          ${record.totalObtained} <span class="text-muted fs-6">/ ${record.totalMax}</span>
        </div>
      </div>
      <div class="text-center">
        <span class="text-muted small d-block">Percentage</span>
        <div class="fs-4 fw-bold text-primary font-mono-num">${record.percentage}%</div>
      </div>
      <div class="text-center">
        <span class="text-muted small d-block">Assigned Grade</span>
        <div class="fs-4 fw-bold text-dark font-mono-num">${escapeHtml(record.grade)}</div>
      </div>
      <div class="text-end">
        <span class="text-muted small d-block">Evaluation Status</span>
        <span class="status-badge badge-success-subtle mt-1">${escapeHtml(record.performanceCategory)}</span>
      </div>
    </div>

    <!-- Component-Wise Breakdown Table -->
    <h6 class="fw-bold text-dark mb-2" style="font-size: 0.9rem;">Component-Wise Assessment Breakdown</h6>
    <div class="table-responsive border rounded mb-3">
      <table class="portal-table table-hover mb-0">
        <thead>
          <tr>
            <th>Evaluation Component</th>
            <th style="width: 140px;" class="text-num-right">Maximum Marks</th>
            <th style="width: 140px;" class="text-num-right">Marks Obtained</th>
            <th style="width: 120px;" class="text-num-right">Attainment %</th>
          </tr>
        </thead>
        <tbody>
          ${components.map(c => {
            const compPct = c.max > 0 ? Number(((c.obtained / c.max) * 100).toFixed(1)) : 0;
            return `
              <tr>
                <td class="fw-semibold text-dark">${escapeHtml(c.name)}</td>
                <td class="text-num-right font-mono-num text-muted">${c.max}</td>
                <td class="text-num-right font-mono-num fw-bold text-dark">${c.obtained}</td>
                <td class="text-num-right font-mono-num fw-semibold ${compPct >= 75 ? 'text-success' : 'text-primary'}">${compPct}%</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>

    <!-- Faculty Qualitative Appraisal -->
    <div class="p-3 border rounded bg-white">
      <h6 class="fw-bold text-dark mb-1" style="font-size: 0.85rem;">
        <i class="bi bi-chat-left-quote text-primary me-1"></i>Faculty Appraisal &amp; Recommendations
      </h6>
      <p class="text-secondary small mb-0 leading-relaxed">
        ${escapeHtml(record.facultyFeedback || 'Student has demonstrated satisfactory mastery of the syllabus curriculum.')}
      </p>
    </div>

    <div class="text-muted mt-2" style="font-size: 0.72rem;">
      * Internal marks are certified by the Department Academic Review Board. Final semester grades will combine internal assessments and end-term university examinations.
    </div>
  `;

  const bsModal = new bootstrap.Modal(modalEl);
  bsModal.show();
}
