/**
 * Department Management Portal - Shared App Core
 * 
 * Manages shared shell behaviors:
 * - Responsive mobile sidebar drawer
 * - Active navigation highlighting
 * - Notifications dropdown & read state
 * - Profile and demo settings modal
 * - System toast notification manager
 * - Simulated time/day tester for timetable evaluation
 */

(function () {
  'use strict';

  // Global toast helper
  window.portalShowToast = function (title, message, type = 'info') {
    let container = document.getElementById('portalToastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'portalToastContainer';
      container.className = 'portal-toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'portal-toast';

    let iconClass = 'bi-info-circle-fill text-primary';
    if (type === 'success') iconClass = 'bi-check-circle-fill text-success';
    if (type === 'warning') iconClass = 'bi-exclamation-triangle-fill text-warning';
    if (type === 'danger' || type === 'error') iconClass = 'bi-x-circle-fill text-danger';

    toast.innerHTML = `
      <i class="bi ${iconClass} portal-toast-icon"></i>
      <div class="portal-toast-content">
        <div class="portal-toast-title">${escapeHtml(title)}</div>
        <div class="portal-toast-message">${escapeHtml(message)}</div>
      </div>
      <button type="button" class="portal-toast-close" aria-label="Close">
        <i class="bi bi-x"></i>
      </button>
    `;

    const closeBtn = toast.querySelector('.portal-toast-close');
    closeBtn.addEventListener('click', () => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px) scale(0.95)';
      setTimeout(() => toast.remove(), 200);
    });

    container.appendChild(toast);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      if (toast.isConnected) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px) scale(0.95)';
        setTimeout(() => toast.remove(), 200);
      }
    }, 4000);
  };

  // Helper: safe HTML escaping
  window.escapeHtml = function (str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  // Helper: print current view
  window.portalPrint = function () {
    window.print();
  };

  // Initialize App Shell when DOM ready
  document.addEventListener('DOMContentLoaded', async () => {
    initSidebar();
    initNotifications();
    initProfileDropdown();
    initSimulatedTimeBadge();
    initSettingsModal();
  });

  /**
   * Mobile Sidebar Drawer & Active Links
   */
  function initSidebar() {
    const sidebar = document.querySelector('.app-sidebar');
    const toggleBtn = document.querySelector('.sidebar-toggle-btn');
    if (!sidebar) return;

    // Create backdrop for mobile drawer if missing
    let backdrop = document.querySelector('.sidebar-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'sidebar-backdrop';
      document.body.appendChild(backdrop);
    }

    if (toggleBtn) {
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebar.classList.toggle('show-mobile-sidebar');
        backdrop.classList.toggle('active');
      });
    }

    backdrop.addEventListener('click', () => {
      sidebar.classList.remove('show-mobile-sidebar');
      backdrop.classList.remove('active');
    });

    // Close sidebar on link click on mobile
    const navLinks = sidebar.querySelectorAll('.sidebar-nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth < 992) {
          sidebar.classList.remove('show-mobile-sidebar');
          backdrop.classList.remove('active');
        }
      });
    });

    // Mark current active link based on page URL
    const currentPath = window.location.pathname;
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;
      
      // Check matching path
      const isRoot = (currentPath === '/' || currentPath.endsWith('index.html')) && (href === '/' || href === 'index.html' || href === './index.html' || href === '../index.html');
      const isMatch = href.length > 2 && currentPath.endsWith(href.replace('../', '').replace('./', ''));

      if (isRoot || isMatch) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  /**
   * Notifications Drawer / Dropdown
   */
  async function initNotifications() {
    const notifBtn = document.getElementById('topbarNotificationBtn');
    const notifBadge = document.getElementById('topbarNotificationBadge');
    const notifMenu = document.getElementById('topbarNotificationList');

    if (!notifBtn || !notifMenu) return;

    try {
      const announcements = await window.dataService.getAnnouncements();
      const unreadCount = announcements.filter(a => !a.read).length;

      if (notifBadge) {
        if (unreadCount > 0) {
          notifBadge.style.display = 'block';
        } else {
          notifBadge.style.display = 'none';
        }
      }

      // Render notification items inside dropdown
      renderNotificationDropdown(announcements);

      // Wire mark all read button
      const markAllReadBtn = document.getElementById('notifMarkAllReadBtn');
      if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', async (e) => {
          e.preventDefault();
          e.stopPropagation();
          await window.dataService.markAllAnnouncementsRead();
          if (notifBadge) notifBadge.style.display = 'none';
          const refreshed = await window.dataService.getAnnouncements();
          renderNotificationDropdown(refreshed);
          window.portalShowToast('Notifications Updated', 'All announcements marked as read.', 'success');
        });
      }
    } catch (err) {
      console.warn('Error loading notifications:', err);
    }
  }

  function renderNotificationDropdown(announcements) {
    const listContainer = document.getElementById('topbarNotificationList');
    if (!listContainer) return;

    if (!announcements || announcements.length === 0) {
      listContainer.innerHTML = `
        <div class="p-3 text-center text-muted small">
          <i class="bi bi-bell-slash mb-1 d-block text-secondary" style="font-size: 1.5rem;"></i>
          No new announcements
        </div>
      `;
      return;
    }

    listContainer.innerHTML = announcements.slice(0, 5).map(item => `
      <div class="dropdown-item p-2 border-bottom notif-item-row ${item.read ? 'opacity-75' : 'bg-light'}" 
           data-announcement-id="${item.id}" style="cursor: pointer; white-space: normal;">
        <div class="d-flex align-items-center justify-content-between mb-1">
          <span class="badge ${item.priority === 'Urgent' || item.priority === 'High' ? 'bg-danger-subtle text-danger border border-danger-subtle' : 'bg-primary-subtle text-primary border border-primary-subtle'}" style="font-size: 0.65rem;">
            ${escapeHtml(item.category)}
          </span>
          <span class="text-muted tabular-nums" style="font-size: 0.7rem;">${escapeHtml(item.date)}</span>
        </div>
        <div class="fw-semibold text-dark text-truncate" style="font-size: 0.8rem;">
          ${!item.read ? '<span class="text-primary me-1">●</span>' : ''}${escapeHtml(item.title)}
        </div>
        <div class="text-muted text-truncate" style="font-size: 0.72rem;">${escapeHtml(item.summary)}</div>
      </div>
    `).join('');

    // Clicking an announcement opens full modal
    listContainer.querySelectorAll('.notif-item-row').forEach(row => {
      row.addEventListener('click', async () => {
        const id = row.getAttribute('data-announcement-id');
        openAnnouncementModal(id);
      });
    });
  }

  window.openAnnouncementModal = async function (id) {
    const announcements = await window.dataService.getAnnouncements();
    const item = announcements.find(a => a.id === id);
    if (!item) return;

    // Mark as read
    await window.dataService.markAnnouncementAsRead(id);
    const notifBadge = document.getElementById('topbarNotificationBadge');
    const remainingUnread = (await window.dataService.getAnnouncements()).filter(a => !a.read).length;
    if (notifBadge) {
      notifBadge.style.display = remainingUnread > 0 ? 'block' : 'none';
    }

    // Populate and show Bootstrap modal
    let modalEl = document.getElementById('announcementDetailModal');
    if (!modalEl) {
      modalEl = document.createElement('div');
      modalEl.id = 'announcementDetailModal';
      modalEl.className = 'modal fade';
      modalEl.tabIndex = -1;
      modalEl.setAttribute('aria-hidden', 'true');
      modalEl.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="bi bi-megaphone text-primary"></i>
                <span id="announcementModalTitle">Announcement</span>
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div class="d-flex align-items-center gap-2 mb-3">
                <span id="announcementModalCategory" class="status-badge badge-primary-subtle"></span>
                <span id="announcementModalPriority" class="status-badge badge-warning-subtle"></span>
                <span class="meta-divider">·</span>
                <span id="announcementModalDate" class="text-muted small tabular-nums"></span>
              </div>
              <p id="announcementModalBody" class="text-secondary small leading-relaxed"></p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-sm btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modalEl);
    }

    document.getElementById('announcementModalTitle').textContent = item.title;
    document.getElementById('announcementModalCategory').textContent = item.category;
    document.getElementById('announcementModalPriority').textContent = `${item.priority} Priority`;
    document.getElementById('announcementModalDate').textContent = `Posted: ${item.date}`;
    document.getElementById('announcementModalBody').textContent = item.body || item.summary;

    const bsModal = new bootstrap.Modal(modalEl);
    bsModal.show();
  };

  /**
   * User Profile Dropdown & Modal
   */
  async function initProfileDropdown() {
    const user = await window.dataService.getCurrentUser();
    const isInsidePages = window.location.pathname.includes('/pages/');
    const loginUrl = isInsidePages ? 'login.html' : 'pages/login.html';
    const indexUrl = isInsidePages ? '../index.html' : 'index.html';

    // Fill in topbar user name, role, and avatar
    const nameEl = document.getElementById('topbarUserName');
    const roleEl = document.getElementById('topbarUserRole');
    const avatarEl = document.getElementById('topbarUserAvatar');

    if (nameEl) nameEl.textContent = user.displayName;
    if (roleEl) {
      if (user.isFaculty) {
        roleEl.innerHTML = `<span class="badge bg-warning-subtle text-dark border border-warning-subtle" style="font-size: 0.65rem;">Faculty</span> ${escapeHtml(user.office)}`;
      } else {
        roleEl.textContent = `ID: ${user.enrollmentNo}`;
      }
    }
    if (avatarEl && user.avatar) {
      avatarEl.src = user.avatar.startsWith('http') || user.avatar.startsWith('/') 
        ? (isInsidePages && user.avatar.startsWith('/') ? '..' + user.avatar : user.avatar)
        : user.avatar;
      avatarEl.onerror = () => {
        avatarEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=1d4ed8&color=fff`;
      };
    }

    // Populate profile dropdown menu dynamically
    const profileDropdown = document.querySelector('.topbar-user-profile + .dropdown-menu');
    if (profileDropdown) {
      if (user.isFaculty) {
        profileDropdown.innerHTML = `
          <li><h6 class="dropdown-header text-primary fw-bold"><i class="bi bi-person-workspace me-1"></i> Faculty Account (Demo)</h6></li>
          <li>
            <a class="dropdown-item" href="#" id="menuViewProfileBtn">
              <i class="bi bi-person-badge me-2 text-primary"></i>My Faculty Profile
            </a>
          </li>
          <li>
            <a class="dropdown-item" href="${isInsidePages ? 'faculty.html' : 'pages/faculty.html'}">
              <i class="bi bi-journal-bookmark me-2 text-info"></i>Department Directory
            </a>
          </li>
          <li><hr class="dropdown-divider"></li>
          <li>
            <a class="dropdown-item text-primary fw-semibold" href="#" id="menuSwitchToStudentBtn">
              <i class="bi bi-arrow-repeat me-2"></i>Switch to Student View
            </a>
          </li>
          <li>
            <a class="dropdown-item" href="${loginUrl}">
              <i class="bi bi-person-plus me-2 text-secondary"></i>Switch Faculty Account
            </a>
          </li>
          <li><hr class="dropdown-divider"></li>
          <li>
            <a class="dropdown-item text-danger" href="#" id="menuDemoLogoutBtn">
              <i class="bi bi-box-arrow-right me-2"></i>Sign Out (Demo)
            </a>
          </li>
        `;
      } else {
        profileDropdown.innerHTML = `
          <li><h6 class="dropdown-header text-muted"><i class="bi bi-mortarboard me-1"></i> Student Account (Demo)</h6></li>
          <li>
            <a class="dropdown-item" href="#" id="menuViewProfileBtn">
              <i class="bi bi-person-badge me-2 text-primary"></i>View Academic Profile
            </a>
          </li>
          <li>
            <a class="dropdown-item" href="${isInsidePages ? 'results.html' : 'pages/results.html'}">
              <i class="bi bi-journal-check me-2 text-success"></i>My Transcripts &amp; Marks
            </a>
          </li>
          <li><hr class="dropdown-divider"></li>
          <li>
            <a class="dropdown-item text-primary fw-semibold" href="${loginUrl}?role=faculty" id="menuFacultyLoginBtn">
              <i class="bi bi-person-workspace me-2"></i>Faculty Portal Login
            </a>
          </li>
          <li>
            <a class="dropdown-item" href="#" id="menuQuickSwitchFacultyBtn">
              <i class="bi bi-lightning-charge me-2 text-warning"></i>Quick Demo: Login as HOD
            </a>
          </li>
          <li><hr class="dropdown-divider"></li>
          <li>
            <a class="dropdown-item text-danger" href="#" id="menuDemoLogoutBtn">
              <i class="bi bi-box-arrow-right me-2"></i>Demo Logout
            </a>
          </li>
        `;
      }

      // Wire quick switch to faculty
      const quickSwitchBtn = document.getElementById('menuQuickSwitchFacultyBtn');
      if (quickSwitchBtn) {
        quickSwitchBtn.addEventListener('click', async (e) => {
          e.preventDefault();
          await window.dataService.switchRole('faculty', 'FAC-01');
          window.portalShowToast('Faculty Mode Active', 'Switched to Dr. Sunita Sharma (Professor & HOD).', 'success');
          setTimeout(() => window.location.reload(), 400);
        });
      }

      // Wire switch to student
      const switchToStudentBtn = document.getElementById('menuSwitchToStudentBtn');
      if (switchToStudentBtn) {
        switchToStudentBtn.addEventListener('click', async (e) => {
          e.preventDefault();
          await window.dataService.switchRole('student');
          window.portalShowToast('Student Mode Active', 'Switched back to Aarav Patel.', 'info');
          setTimeout(() => window.location.reload(), 400);
        });
      }
    }

    // View Profile action click
    const viewProfileBtn = document.getElementById('menuViewProfileBtn');
    if (viewProfileBtn) {
      viewProfileBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (user.isFaculty) {
          window.openFacultyModal ? window.openFacultyModal(user.id) : openFacultyProfileModal(user);
        } else {
          openProfileModal(user);
        }
      });
    }

    // Demo Logout action click
    const logoutBtn = document.getElementById('menuDemoLogoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        await window.dataService.logoutUser();
        window.portalShowToast(
          'Session Cleared',
          'Demo session reset. Redirecting to login portal...',
          'info'
        );
        setTimeout(() => {
          window.location.href = loginUrl;
        }, 600);
      });
    }
  }

  function openFacultyProfileModal(fac) {
    if (window.openFacultyModal) {
      window.openFacultyModal(fac.id);
      return;
    }
    window.portalShowToast(fac.fullName, `${fac.designation} · ${fac.department}`, 'info');
  }

  function openProfileModal(student) {
    let modalEl = document.getElementById('studentProfileModal');
    if (!modalEl) {
      modalEl = document.createElement('div');
      modalEl.id = 'studentProfileModal';
      modalEl.className = 'modal fade';
      modalEl.tabIndex = -1;
      modalEl.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="bi bi-person-badge text-primary"></i>
                Student Academic Profile
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body" id="studentProfileModalBody"></div>
            <div class="modal-footer">
              <button type="button" class="btn btn-sm btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modalEl);
    }

    const body = document.getElementById('studentProfileModalBody');
    body.innerHTML = `
      <div class="text-center mb-4">
        <img src="${student.avatar}" class="rounded-circle border mb-2" width="76" height="76" alt="${escapeHtml(student.fullName)}"
             onerror="this.src='https://ui-avatars.com/api/?name=Aarav+Patel&background=1d4ed8&color=fff'">
        <h6 class="fw-bold mb-0">${escapeHtml(student.fullName)}</h6>
        <div class="text-muted small">${escapeHtml(student.department)}</div>
        <span class="status-badge badge-primary-subtle mt-1">${escapeHtml(student.program)}</span>
      </div>

      <div class="row g-2 small border rounded p-3 bg-light">
        <div class="col-6">
          <div class="text-muted">Enrollment No:</div>
          <div class="fw-semibold tabular-nums">${escapeHtml(student.enrollmentNo)}</div>
        </div>
        <div class="col-6">
          <div class="text-muted">Current Semester:</div>
          <div class="fw-semibold">Semester ${student.semester} (${student.section})</div>
        </div>
        <div class="col-6">
          <div class="text-muted">Academic Year:</div>
          <div class="fw-semibold">${escapeHtml(student.academicYear)}</div>
        </div>
        <div class="col-6">
          <div class="text-muted">Faculty Advisor:</div>
          <div class="fw-semibold">${escapeHtml(student.advisor)}</div>
        </div>
        <div class="col-6">
          <div class="text-muted">Cumulative GPA:</div>
          <div class="fw-bold text-primary tabular-nums">${student.cgpa} / 10.0</div>
        </div>
        <div class="col-6">
          <div class="text-muted">Institutional Email:</div>
          <div class="fw-semibold text-truncate">${escapeHtml(student.email)}</div>
        </div>
      </div>
      <div class="mt-3 text-muted" style="font-size: 0.72rem;">
        * Note: Profile data is read-only in the student portal. Official biographical modifications require department administrative clearance.
      </div>
    `;

    const bsModal = new bootstrap.Modal(modalEl);
    bsModal.show();
  }

  /**
   * Academic Settings Modal (Allows adjusting demo attendance threshold to test below/above threshold math)
   */
  function initSettingsModal() {
    const settingsBtn = document.getElementById('menuSettingsBtn');
    if (!settingsBtn) return;

    settingsBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const config = await window.dataService.getConfig();

      let modalEl = document.getElementById('academicSettingsModal');
      if (!modalEl) {
        modalEl = document.createElement('div');
        modalEl.id = 'academicSettingsModal';
        modalEl.className = 'modal fade';
        modalEl.tabIndex = -1;
        modalEl.innerHTML = `
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">
                  <i class="bi bi-sliders text-primary"></i>
                  Demonstration Settings
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <div class="mb-3">
                  <label class="form-label small fw-semibold">Attendance Threshold Percentage</label>
                  <div class="input-group input-group-sm">
                    <input type="number" id="settingThresholdInput" class="form-control" min="50" max="95" step="1" value="${config.attendanceThreshold}">
                    <span class="input-group-text">%</span>
                  </div>
                  <div class="form-text" style="font-size: 0.72rem;">
                    Demonstration threshold used to dynamically test "Below Threshold" calculations, warnings, and consecutive classes required. (Default: 75%).
                  </div>
                </div>
                <div class="alert alert-info py-2 px-3 small mb-0" style="font-size: 0.75rem;">
                  <i class="bi bi-info-circle me-1"></i>
                  Changes are stored locally in your browser session for testing and do not alter permanent university policies.
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-sm btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" id="saveSettingsBtn" class="btn btn-sm btn-portal-primary">Apply Settings</button>
              </div>
            </div>
          </div>
        `;
        document.body.appendChild(modalEl);

        document.getElementById('saveSettingsBtn').addEventListener('click', async () => {
          const input = document.getElementById('settingThresholdInput');
          const val = parseFloat(input.value) || 75;
          await window.dataService.setAttendanceThreshold(val);
          const modalInstance = bootstrap.Modal.getInstance(modalEl);
          if (modalInstance) modalInstance.hide();
          window.portalShowToast('Threshold Updated', `Attendance benchmark set to ${val}%. Reloading data...`, 'success');
          setTimeout(() => window.location.reload(), 600);
        });
      }

      const bsModal = new bootstrap.Modal(modalEl);
      bsModal.show();
    });
  }

  /**
   * Topbar Simulated Time & Day Display
   */
  function initSimulatedTimeBadge() {
    const badgeEl = document.getElementById('topbarSimTimeBadge');
    if (!badgeEl) return;

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    const dayStr = days[now.getDay()];
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    badgeEl.innerHTML = `
      <i class="bi bi-clock-history text-primary"></i>
      <span class="sim-label">${dayStr}</span>
      <span class="tabular-nums">${timeStr}</span>
    `;
  }
})();
