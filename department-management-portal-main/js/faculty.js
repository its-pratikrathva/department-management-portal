/**
 * Department Management Portal - Faculty & Subject Directory Module
 * 
 * Features:
 * - Dual-view switcher: Faculty Directory & Subject Directory
 * - Search by faculty name, subject code, or subject title
 * - Designation filter, Subject category filter, Sorting
 * - Rich faculty modal with office hours, research domains, publications
 * - Subject directory table with syllabus breakdown, credits, and weekly hours
 * - Empty states & Reset filters
 */

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await initDirectoryPage();
  } catch (err) {
    console.error('Failed to initialize faculty directory:', err);
  }
});

let currentDirectoryView = 'faculty'; // 'faculty' or 'subjects'
let directorySearchQuery = '';
let facultyDesignationFilter = 'all';
let subjectCategoryFilter = 'all';
let directorySortBy = 'name_asc';

async function initDirectoryPage() {
  setupEventListeners();
  await refreshDirectoryView();
}

function setupEventListeners() {
  // View Switcher (Segmented Control)
  const viewBtns = document.querySelectorAll('.dir-view-btn');
  viewBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetView = btn.getAttribute('data-view');
      if (targetView === currentDirectoryView) return;

      viewBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentDirectoryView = targetView;

      // Adjust filter UI visibility
      const facFilters = document.getElementById('facultyFilterGroup');
      const subFilters = document.getElementById('subjectFilterGroup');
      if (facFilters) facFilters.style.display = (targetView === 'faculty') ? 'flex' : 'none';
      if (subFilters) subFilters.style.display = (targetView === 'subjects') ? 'flex' : 'none';

      refreshDirectoryView();
    });
  });

  // Search input
  const searchInput = document.getElementById('directorySearchInput');
  const clearBtn = document.getElementById('directoryClearSearchBtn');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      directorySearchQuery = e.target.value;
      if (clearBtn) {
        clearBtn.style.display = directorySearchQuery.length > 0 ? 'block' : 'none';
      }
      refreshDirectoryView();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        directorySearchQuery = '';
        clearBtn.style.display = 'none';
        refreshDirectoryView();
      }
    });
  }

  // Designation Filter (Faculty View)
  const designationSelect = document.getElementById('facultyDesignationSelect');
  if (designationSelect) {
    designationSelect.addEventListener('change', (e) => {
      facultyDesignationFilter = e.target.value;
      refreshDirectoryView();
    });
  }

  // Subject Category Filter (Subject View)
  const categorySelect = document.getElementById('subjectCategorySelect');
  if (categorySelect) {
    categorySelect.addEventListener('change', (e) => {
      subjectCategoryFilter = e.target.value;
      refreshDirectoryView();
    });
  }

  // Sort Select
  const sortSelect = document.getElementById('directorySortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      directorySortBy = e.target.value;
      refreshDirectoryView();
    });
  }

  // Reset Filters
  const resetBtn = document.getElementById('directoryResetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      directorySearchQuery = '';
      facultyDesignationFilter = 'all';
      subjectCategoryFilter = 'all';
      directorySortBy = 'name_asc';

      if (searchInput) searchInput.value = '';
      if (clearBtn) clearBtn.style.display = 'none';
      if (designationSelect) designationSelect.value = 'all';
      if (categorySelect) categorySelect.value = 'all';
      if (sortSelect) sortSelect.value = 'name_asc';

      refreshDirectoryView();
      window.portalShowToast('Filters Cleared', 'Displaying full directory listing.', 'info');
    });
  }
}

async function refreshDirectoryView() {
  const facultyContainer = document.getElementById('facultyDirectorySection');
  const subjectContainer = document.getElementById('subjectDirectorySection');
  const emptyBox = document.getElementById('directoryEmptyBox');
  const countBadge = document.getElementById('directoryCountBadge');

  if (currentDirectoryView === 'faculty') {
    if (facultyContainer) facultyContainer.style.display = 'block';
    if (subjectContainer) subjectContainer.style.display = 'none';

    const facultyList = await window.dataService.getFaculty({
      search: directorySearchQuery,
      designation: facultyDesignationFilter,
      sortBy: directorySortBy
    });

    if (countBadge) countBadge.textContent = `${facultyList.length} Faculty Members`;

    if (!facultyList || facultyList.length === 0) {
      if (facultyContainer) facultyContainer.innerHTML = '';
      if (emptyBox) emptyBox.style.display = 'block';
      return;
    }

    if (emptyBox) emptyBox.style.display = 'none';
    renderFacultyCards(facultyList);

  } else {
    // Subject View
    if (facultyContainer) facultyContainer.style.display = 'none';
    if (subjectContainer) subjectContainer.style.display = 'block';

    const subjectList = await window.dataService.getSubjects({
      search: directorySearchQuery,
      category: subjectCategoryFilter
    });

    if (countBadge) countBadge.textContent = `${subjectList.length} Academic Subjects`;

    if (!subjectList || subjectList.length === 0) {
      const tbody = document.getElementById('subjectTableBody');
      if (tbody) tbody.innerHTML = '';
      if (emptyBox) emptyBox.style.display = 'block';
      return;
    }

    if (emptyBox) emptyBox.style.display = 'none';
    renderSubjectTable(subjectList);
  }
}

function renderFacultyCards(list) {
  const container = document.getElementById('facultyGridContainer');
  if (!container) return;

  container.innerHTML = list.map(f => `
    <div class="col-12 col-md-6 col-xl-4">
      <div class="portal-card h-100 faculty-card" style="cursor: pointer;" onclick="openFacultyModal('${f.id}')">
        <div class="portal-card-body d-flex flex-column justify-content-between">
          <div>
            <div class="d-flex align-items-center gap-3 mb-3">
              <img src="${f.avatar}" class="rounded-circle border" width="62" height="62" alt="${escapeHtml(f.fullName)}"
                   onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(f.fullName)}&background=1d4ed8&color=fff'">
              <div class="min-width-0">
                <h5 class="fw-bold text-dark mb-0 fs-6 text-truncate">${escapeHtml(f.fullName)}</h5>
                <span class="status-badge badge-primary-subtle mt-1 text-truncate">${escapeHtml(f.designation)}</span>
              </div>
            </div>

            <div class="small text-muted mb-2">
              <i class="bi bi-geo-alt text-secondary me-1"></i>Office: <strong>${escapeHtml(f.office)}</strong>
            </div>

            <div class="small text-muted mb-2 text-truncate">
              <i class="bi bi-envelope text-secondary me-1"></i>${escapeHtml(f.email)}
            </div>

            <div class="border-top pt-2 mt-2">
              <span class="text-muted small d-block mb-1 fw-semibold">Modules Taught:</span>
              <div class="d-flex flex-wrap gap-1">
                ${f.subjectsTaught.map(s => `
                  <span class="status-badge badge-neutral-subtle font-mono-num">${escapeHtml(s.code)}</span>
                `).join('')}
              </div>
            </div>
          </div>

          <div class="d-flex align-items-center justify-content-between border-top pt-3 mt-3 text-muted small">
            <span><i class="bi bi-briefcase me-1"></i>${f.experienceYears} Years Exp</span>
            <span class="text-primary fw-semibold">View Profile <i class="bi bi-chevron-right ms-1"></i></span>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function renderSubjectTable(subjects) {
  const tbody = document.getElementById('subjectTableBody');
  if (!tbody) return;

  tbody.innerHTML = subjects.map(s => `
    <tr>
      <td>
        <span class="fw-bold text-primary font-mono-num">${escapeHtml(s.code)}</span>
      </td>
      <td>
        <div class="fw-semibold text-dark">${escapeHtml(s.name)}</div>
        <div class="text-muted small">${escapeHtml(s.syllabusOverview)}</div>
      </td>
      <td class="text-center font-mono-num fw-semibold">Sem ${s.semester}</td>
      <td class="text-center font-mono-num fw-bold text-dark">${s.credits}</td>
      <td>
        <span class="status-badge ${s.category === 'Program Core' ? 'badge-primary-subtle' : 'badge-neutral-subtle'}">
          ${escapeHtml(s.category)}
        </span>
      </td>
      <td>
        <span class="status-badge badge-neutral-subtle">${escapeHtml(s.type)}</span>
      </td>
      <td>
        <span class="text-secondary small fw-medium">${escapeHtml(s.facultyName)}</span>
      </td>
      <td class="text-center font-mono-num">${s.weeklyHours} hrs/wk</td>
    </tr>
  `).join('');
}

window.openFacultyModal = async function(facultyId) {
  const f = await window.dataService.getFacultyById(facultyId);
  if (!f) return;

  let modalEl = document.getElementById('facultyDetailModal');
  if (!modalEl) {
    modalEl = document.createElement('div');
    modalEl.id = 'facultyDetailModal';
    modalEl.className = 'modal fade';
    modalEl.tabIndex = -1;
    modalEl.setAttribute('aria-hidden', 'true');
    modalEl.innerHTML = `
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-person-badge text-primary"></i>
              <span id="facultyModalName">Faculty Academic Profile</span>
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" id="facultyModalBody">
            <!-- Dynamic -->
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-sm btn-secondary" data-bs-dismiss="modal">Close</button>
            <a href="#" id="facultyModalEmailBtn" class="btn btn-sm btn-portal-primary">
              <i class="bi bi-envelope me-1"></i> Send Academic Inquiry
            </a>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modalEl);
  }

  document.getElementById('facultyModalName').textContent = `${f.fullName} (${f.designation})`;

  const body = document.getElementById('facultyModalBody');
  body.innerHTML = `
    <div class="d-flex flex-wrap align-items-center gap-4 mb-4 p-3 bg-light rounded border">
      <img src="${f.avatar}" class="rounded-circle border" width="84" height="84" alt="${escapeHtml(f.fullName)}"
           onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(f.fullName)}&background=1d4ed8&color=fff'">
      <div>
        <h5 class="fw-bold text-dark mb-1">${escapeHtml(f.fullName)}</h5>
        <div class="text-primary fw-semibold small mb-1">${escapeHtml(f.designation)}</div>
        <div class="text-muted small">${escapeHtml(f.qualification)}</div>
      </div>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-12 col-md-6">
        <div class="border rounded p-3 h-100 bg-white">
          <h6 class="fw-bold text-dark mb-2 small"><i class="bi bi-building me-1 text-primary"></i>Office & Consultation Hours</h6>
          <div class="small mb-1">
            <span class="text-muted">Office Location:</span>
            <strong>${escapeHtml(f.office)}</strong>
          </div>
          <div class="small mb-1">
            <span class="text-muted">Office Hours:</span>
            <span class="status-badge badge-warning-subtle">${escapeHtml(f.officeHours)}</span>
          </div>
          <div class="small mb-1 text-truncate">
            <span class="text-muted">Institutional Email:</span>
            <span class="font-mono-num">${escapeHtml(f.email)}</span>
          </div>
          <div class="small">
            <span class="text-muted">Direct Phone:</span>
            <span class="font-mono-num">${escapeHtml(f.phone)}</span>
          </div>
        </div>
      </div>

      <div class="col-12 col-md-6">
        <div class="border rounded p-3 h-100 bg-white">
          <h6 class="fw-bold text-dark mb-2 small"><i class="bi bi-journal-richtext me-1 text-primary"></i>Scholarly Standing</h6>
          <div class="small mb-1">
            <span class="text-muted">Academic Experience:</span>
            <strong>${f.experienceYears} Years Active Faculty Service</strong>
          </div>
          <div class="small mb-1">
            <span class="text-muted">Peer-Reviewed Publications:</span>
            <strong class="font-mono-num text-success">${f.publicationsCount} Papers in Scopus/IEEE</strong>
          </div>
          <div class="small mt-2">
            <span class="text-muted d-block mb-1">Specialized Research Interests:</span>
            <div class="d-flex flex-wrap gap-1">
              ${f.researchInterests.map(r => `
                <span class="status-badge badge-primary-subtle">${escapeHtml(r)}</span>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>

    <h6 class="fw-bold text-dark mb-2 small"><i class="bi bi-book me-1 text-primary"></i>Curricular Modules Assigned</h6>
    <div class="table-responsive border rounded mb-2">
      <table class="portal-table table-hover mb-0">
        <thead>
          <tr>
            <th style="width: 110px;">Subject Code</th>
            <th>Curriculum Title</th>
          </tr>
        </thead>
        <tbody>
          ${f.subjectsTaught.map(s => `
            <tr>
              <td class="font-mono-num fw-bold text-primary">${escapeHtml(s.code)}</td>
              <td class="fw-semibold text-dark">${escapeHtml(s.name)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="text-muted mt-2" style="font-size: 0.72rem;">
      * Fictional demonstration profile. Do not treat contact information as verified collegiate directory records.
    </div>
  `;

  const emailBtn = document.getElementById('facultyModalEmailBtn');
  if (emailBtn) {
    emailBtn.href = `mailto:${f.email}?subject=Academic%20Advising%20Inquiry%20-%20Aarav%20Patel`;
  }

  const bsModal = new bootstrap.Modal(modalEl);
  bsModal.show();
};
