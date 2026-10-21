/**
 * Department Management Portal - Frontend Data Service
 *
 * Authentication is connected to the Express backend.
 * Other academic data methods still use PORTAL_DATA until their APIs
 * are integrated.
 */

class DataService {
  constructor() {
    this._data = window.PORTAL_DATA || {};
    this._initStorage();
  }

  _initStorage() {
    try {
      const readAnnouncements = localStorage.getItem('dmp_read_announcements');

      if (readAnnouncements) {
        const readIds = JSON.parse(readAnnouncements);

        if (Array.isArray(readIds) && this._data.announcements) {
          this._data.announcements.forEach(a => {
            if (readIds.includes(a.id)) a.read = true;
          });
        }
      }

      const customThreshold = localStorage.getItem('dmp_attendance_threshold');

      if (customThreshold && !isNaN(parseFloat(customThreshold))) {
        this._data.config = this._data.config || {};
        this._data.config.attendanceThreshold = parseFloat(customThreshold);
      }
    } catch (e) {
      console.warn('LocalStorage unavailable:', e);
    }
  }

  async _resolve(payload, delayMs = 10) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(JSON.parse(JSON.stringify(payload)));
      }, delayMs);
    });
  }

  // --------------------------------------------------
  // BACKEND API HELPER
  // --------------------------------------------------

  async _api(path, options = {}) {
    const response = await fetch(`/api/v1${path}`, {
      ...options,
      credentials: 'same-origin',
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers || {})
      }
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.success === false) {
      throw new Error(
        data.error ||
        data.message ||
        `Request failed (${response.status})`
      );
    }

    return data;
  }

  // --------------------------------------------------
  // STUDENT PROFILE
  // --------------------------------------------------

  async getStudentProfile() {
    try {
      const data = await this._api('/students/me');
      return data.student || data.profile || data;
    } catch (error) {
      console.error('Could not load student profile:', error);
      throw error;
    }
  }

  // --------------------------------------------------
  // PORTAL CONFIGURATION
  // --------------------------------------------------

  async getConfig() {
    return this._resolve(this._data.config || {
      attendanceThreshold: 75
    });
  }

  async setAttendanceThreshold(threshold) {
    const val = Math.max(50, Math.min(95, parseFloat(threshold) || 75));

    this._data.config = this._data.config || {};
    this._data.config.attendanceThreshold = val;

    try {
      localStorage.setItem('dmp_attendance_threshold', String(val));
    } catch (e) { }

    return this._resolve({ success: true, threshold: val });
  }

  // --------------------------------------------------
  // DASHBOARD STATISTICS
  // --------------------------------------------------

  async getStatistics() {
    try {
      const data = await this._api('/dashboard/stats');
      return data.stats || data.data || data;
    } catch (error) {
      console.warn('Dashboard API unavailable; using local data:', error);
    }

    const student = this._data.student || {};
    const subjects = this._data.subjects || [];
    const attendance = this._data.attendance || [];
    const results = this._data.results || [];
    const threshold = this._data.config?.attendanceThreshold || 75;

    let totalClasses = 0;
    let attendedClasses = 0;
    let belowThresholdCount = 0;

    attendance.forEach(rec => {
      totalClasses += Number(rec.totalClasses || 0);
      attendedClasses += Number(rec.attendedClasses || 0);

      const pct = rec.totalClasses
        ? (rec.attendedClasses / rec.totalClasses) * 100
        : 0;

      if (pct < threshold) belowThresholdCount++;
    });

    let totalObtained = 0;
    let totalMax = 0;

    results.forEach(result => {
      totalObtained += Number(result.totalObtained || 0);
      totalMax += Number(result.totalMax || 0);
    });

    const todayLectures = await this.getTodayLectures();

    return this._resolve({
      studentName: student.fullName || '',
      studentId: student.id || '',
      enrollmentNo: student.enrollmentNo || '',
      department: student.department || '',
      semester: student.semester || '',
      totalSubjects: subjects.length,
      overallAttendancePct: totalClasses
        ? Number(((attendedClasses / totalClasses) * 100).toFixed(2))
        : 0,
      totalClasses,
      attendedClasses,
      missedClasses: totalClasses - attendedClasses,
      subjectsBelowThreshold: belowThresholdCount,
      averageMarksPct: totalMax
        ? Number(((totalObtained / totalMax) * 100).toFixed(2))
        : 0,
      totalObtainedMarks: totalObtained,
      totalMaxMarks: totalMax,
      todayLecturesCount: todayLectures.length,
      cgpa: student.cgpa || 0,
      attendanceThreshold: threshold
    });
  }

  // --------------------------------------------------
  // SUBJECTS
  // --------------------------------------------------

  async getSubjects(filters = {}) {
    let list = this._data.subjects || [];

    if (filters.search) {
      const q = filters.search.toLowerCase().trim();

      list = list.filter(s =>
        (s.code || '').toLowerCase().includes(q) ||
        (s.name || '').toLowerCase().includes(q) ||
        (s.facultyName || '').toLowerCase().includes(q)
      );
    }

    if (filters.category && filters.category !== 'all') {
      list = list.filter(s =>
        (s.category || '').toLowerCase() === filters.category.toLowerCase()
      );
    }

    if (filters.type && filters.type !== 'all') {
      list = list.filter(s =>
        (s.type || '').toLowerCase().includes(filters.type.toLowerCase())
      );
    }

    if (filters.semester && filters.semester !== 'all') {
      list = list.filter(s =>
        String(s.semester) === String(filters.semester)
      );
    }

    return this._resolve(list);
  }

  async getSubjectByCode(code) {
    const sub = (this._data.subjects || []).find(
      s => (s.code || '').toUpperCase() === String(code).toUpperCase()
    );

    return this._resolve(sub || null);
  }

  // --------------------------------------------------
  // ATTENDANCE
  // --------------------------------------------------

  calculateConsecutiveClassesNeeded(attended, total, targetThreshold = 75) {
    const currentPct = total > 0 ? (attended / total) * 100 : 0;

    if (currentPct >= targetThreshold) return 0;

    const target = targetThreshold / 100;
    if (target >= 1) return 0;

    return Math.max(
      0,
      Math.ceil((target * total - attended) / (1 - target))
    );
  }

  async getAttendance(filters = {}) {
    let records;

    try {
      const data = await this._api('/attendance/records');
      records = Array.isArray(data)
        ? data
        : (data.records || data.attendance || data.data || []);
      if (!Array.isArray(records)) records = [];
    } catch (error) {
      console.warn('Attendance API unavailable; using local data:', error);
      records = this._data.attendance || [];
    }

    const threshold = this._data.config?.attendanceThreshold || 75;

    records = records.map(r => {
      const total = Number(r.totalClasses || 0);
      const attended = Number(r.attendedClasses || 0);
      const pct = Number(((attended / (total || 1)) * 100).toFixed(2));

      let status = 'Good Attendance';
      let statusClass = 'text-success';
      let badgeClass = 'badge-success-subtle';

      if (pct < threshold) {
        status = 'Below Threshold';
        statusClass = 'text-danger';
        badgeClass = 'badge-danger-subtle';
      } else if (pct < threshold + 5) {
        status = 'Needs Attention';
        statusClass = 'text-warning';
        badgeClass = 'badge-warning-subtle';
      }

      return {
        ...r,
        percentage: pct,
        status,
        statusClass,
        badgeClass,
        classesNeeded: this.calculateConsecutiveClassesNeeded(
          attended,
          total,
          threshold
        )
      };
    });

    if (filters.search) {
      const q = filters.search.toLowerCase().trim();

      records = records.filter(r =>
        (r.subjectCode || '').toLowerCase().includes(q) ||
        (r.subjectName || '').toLowerCase().includes(q)
      );
    }

    if (filters.status && filters.status !== 'all') {
      records = records.filter(
        r => r.status.toLowerCase() === filters.status.toLowerCase()
      );
    }

    if (filters.sortBy === 'percentage_asc') {
      records.sort((a, b) => a.percentage - b.percentage);
    } else if (filters.sortBy === 'percentage_desc') {
      records.sort((a, b) => b.percentage - a.percentage);
    } else if (filters.sortBy === 'name_asc') {
      records.sort((a, b) =>
        (a.subjectName || '').localeCompare(b.subjectName || '')
      );
    } else if (filters.sortBy === 'code_asc') {
      records.sort((a, b) =>
        (a.subjectCode || '').localeCompare(b.subjectCode || '')
      );
    }

    return this._resolve(records);
  }

  async getAttendanceSummary() {
    const records = await this.getAttendance();

    let totalClasses = 0;
    let attendedClasses = 0;
    let missedClasses = 0;
    let belowThresholdCount = 0;

    const threshold = this._data.config?.attendanceThreshold || 75;

    records.forEach(r => {
      totalClasses += Number(r.totalClasses || 0);
      attendedClasses += Number(r.attendedClasses || 0);
      missedClasses += Number(r.missedClasses || 0);

      if (r.percentage < threshold) belowThresholdCount++;
    });

    return this._resolve({
      totalClasses,
      attendedClasses,
      missedClasses: missedClasses || totalClasses - attendedClasses,
      overallPercentage: totalClasses
        ? Number(((attendedClasses / totalClasses) * 100).toFixed(2))
        : 0,
      belowThresholdCount,
      threshold
    });
  }

  // --------------------------------------------------
  // TIMETABLE
  // --------------------------------------------------


  async getTimetable(day = 'all', filters = {}) {
    let list = [];

    try {
      const response = await this._api('/academics/timetable');

      // Support common API response formats.
      const data = response?.data ?? response;

      if (Array.isArray(data)) {
        list = data;
      } else {
        list =
          data?.timetable ??
          data?.records ??
          data?.data?.timetable ??
          data?.data?.records ??
          data?.data ??
          [];

        if (!Array.isArray(list)) {
          list = [];
        }
      }
    } catch (error) {
      console.warn('Timetable API unavailable; using local data:', error);
      list = this._data?.timetable || [];
    }

    // Normalize backend field names to the frontend format.
    list = list.map(item => ({
      ...item,
      day: item.day ?? item.day_name ?? item.weekday ?? '',
      subjectCode:
        item.subjectCode ??
        item.subject_code ??
        item.code ??
        '',
      startTime:
        item.startTime ??
        item.start_time ??
        item.startTimeStr ??
        '',
      endTime:
        item.endTime ??
        item.end_time ??
        item.endTimeStr ??
        '',
      type: item.type ?? item.class_type ?? item.session_type ?? ''
    }));

    // Apply day filter.
    if (day && day.toLowerCase() !== 'all') {
      list = list.filter(
        item => String(item.day).toLowerCase() === day.toLowerCase()
      );
    }

    // Apply subject filter.
    if (
      filters.subjectCode &&
      filters.subjectCode.toLowerCase() !== 'all'
    ) {
      list = list.filter(
        item =>
          String(item.subjectCode).toUpperCase() ===
          filters.subjectCode.toUpperCase()
      );
    }

    // Apply lecture type filter.
    if (filters.type && filters.type.toLowerCase() !== 'all') {
      list = list.filter(
        item =>
          String(item.type).toLowerCase().includes(filters.type.toLowerCase())
      );
    }

    return this._resolve(
      list.map(item => {
        const statusInfo = this.calculateLectureStatus(
          item.day,
          item.startTime,
          item.endTime
        );

        return {
          ...item,
          status: statusInfo.status,
          statusLabel: statusInfo.label,
          statusBadgeClass: statusInfo.badgeClass
        };
      })
    );
  }

  calculateLectureStatus(lectureDay, startTimeStr, endTimeStr, simulatedDate = null) {
    const now = simulatedDate ? new Date(simulatedDate) : new Date();
    const daysOfWeek = [
      'Sunday', 'Monday', 'Tuesday', 'Wednesday',
      'Thursday', 'Friday', 'Saturday'
    ];

    const currentDayName = daysOfWeek[now.getDay()];
    const isToday = String(lectureDay).toLowerCase() === currentDayName.toLowerCase();

    if (!isToday) {
      const currentDayIdx = now.getDay();
      const dayMap = {
        Monday: 1, Tuesday: 2, Wednesday: 3,
        Thursday: 4, Friday: 5, Saturday: 6, Sunday: 0
      };

      const lectureDayIdx = dayMap[lectureDay] ?? 0;

      if (currentDayIdx > lectureDayIdx && lectureDayIdx !== 0) {
        return {
          status: 'completed',
          label: 'Completed',
          badgeClass: 'badge-neutral-subtle'
        };
      }

      return {
        status: 'scheduled',
        label: 'Scheduled',
        badgeClass: 'badge-primary-subtle'
      };
    }

    const [startH, startM] = String(startTimeStr).split(':').map(Number);
    const [endH, endM] = String(endTimeStr).split(':').map(Number);

    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    if (nowMinutes < startMinutes) {
      return {
        status: 'upcoming',
        label: 'Upcoming Today',
        badgeClass: 'badge-info-subtle'
      };
    }

    if (nowMinutes <= endMinutes) {
      return {
        status: 'ongoing',
        label: 'Happening Now',
        badgeClass: 'badge-success-subtle'
      };
    }

    return {
      status: 'completed',
      label: 'Completed',
      badgeClass: 'badge-neutral-subtle'
    };
  }

  async getTodayLectures(simulatedDate = null) {
    const now = simulatedDate ? new Date(simulatedDate) : new Date();
    const dayName = [
      'Sunday', 'Monday', 'Tuesday', 'Wednesday',
      'Thursday', 'Friday', 'Saturday'
    ][now.getDay()];

    const timetable = await this.getTimetable('all');

    const lectures = timetable.filter(
      item => (item.day || '').toLowerCase() === dayName.toLowerCase()
    );

    return this._resolve(lectures);
  }

  // --------------------------------------------------
  // RESULTS
  // --------------------------------------------------

  async getResults(filters = {}) {
    let list;

    try {
      const data = await this._api('/academics/results');
      list = Array.isArray(data)
        ? data
        : (data.results || data.records || data.data || []);
      if (!Array.isArray(list)) list = [];
    } catch (error) {
      console.warn('Results API unavailable; using local data:', error);
      list = this._data.results || [];
    }

    if (filters.search) {
      const q = filters.search.toLowerCase().trim();

      list = list.filter(r =>
        (r.subjectCode || '').toLowerCase().includes(q) ||
        (r.subjectName || '').toLowerCase().includes(q)
      );
    }

    if (filters.category && filters.category !== 'all') {
      list = list.filter(
        r => (r.performanceCategory || '').toLowerCase() === filters.category.toLowerCase()
      );
    }

    if (filters.sortBy === 'percentage_desc') {
      list.sort((a, b) => b.percentage - a.percentage);
    } else if (filters.sortBy === 'percentage_asc') {
      list.sort((a, b) => a.percentage - b.percentage);
    } else if (filters.sortBy === 'name_asc') {
      list.sort((a, b) =>
        (a.subjectName || '').localeCompare(b.subjectName || '')
      );
    } else if (filters.sortBy === 'code_asc') {
      list.sort((a, b) =>
        (a.subjectCode || '').localeCompare(b.subjectCode || '')
      );
    }

    return this._resolve(list);
  }

  async getResultsSummary() {
    const results = await this.getResults();

    let totalObtained = 0;
    let totalMax = 0;
    let highest = null;
    let lowest = null;

    results.forEach(res => {
      totalObtained += Number(res.totalObtained || 0);
      totalMax += Number(res.totalMax || 0);

      if (!highest || res.percentage > highest.percentage) highest = res;
      if (!lowest || res.percentage < lowest.percentage) lowest = res;
    });

    return this._resolve({
      totalEvaluatedSubjects: results.length,
      totalObtainedMarks: totalObtained,
      totalMaxMarks: totalMax,
      averagePercentage: totalMax
        ? Number(((totalObtained / totalMax) * 100).toFixed(2))
        : 0,
      highestScoringSubject: highest ? {
        code: highest.subjectCode,
        name: highest.subjectName,
        percentage: highest.percentage,
        grade: highest.grade
      } : null,
      lowestScoringSubject: lowest ? {
        code: lowest.subjectCode,
        name: lowest.subjectName,
        percentage: lowest.percentage,
        grade: lowest.grade
      } : null
    });
  }

  // --------------------------------------------------
  // FACULTY DIRECTORY
  // --------------------------------------------------

  async getFaculty(filters = {}) {
    let list;

    try {
      const data = await this._api('/department/faculty');
      list = Array.isArray(data)
        ? data
        : (data.faculty || data.records || data.data || []);
      if (!Array.isArray(list)) list = [];
    } catch (error) {
      console.warn('Faculty API unavailable; using local data:', error);
      list = this._data.faculty || [];
    }

    if (filters.search) {
      const q = filters.search.toLowerCase().trim();

      list = list.filter(f =>
        (f.fullName || '').toLowerCase().includes(q) ||
        (f.designation || '').toLowerCase().includes(q) ||
        (f.office || '').toLowerCase().includes(q) ||
        (f.email || '').toLowerCase().includes(q) ||
        (f.subjectsTaught || []).some(s =>
          (s.name || '').toLowerCase().includes(q) ||
          (s.code || '').toLowerCase().includes(q)
        )
      );
    }

    if (filters.designation && filters.designation !== 'all') {
      list = list.filter(
        f => (f.designation || '').toLowerCase().includes(filters.designation.toLowerCase())
      );
    }

    if (filters.sortBy === 'name_asc') {
      list.sort((a, b) =>
        (a.fullName || '').localeCompare(b.fullName || '')
      );
    } else if (filters.sortBy === 'experience_desc') {
      list.sort((a, b) => (b.experienceYears || 0) - (a.experienceYears || 0));
    } else if (filters.sortBy === 'publications_desc') {
      list.sort((a, b) => (b.publicationsCount || 0) - (a.publicationsCount || 0));
    }

    return this._resolve(list);
  }

  async getFacultyById(id) {
    const faculty = (this._data.faculty || []).find(f => f.id === id);
    return this._resolve(faculty || null);
  }

  // --------------------------------------------------
  // ANNOUNCEMENTS
  // --------------------------------------------------

  async getAnnouncements() {
    try {
      const data = await this._api('/announcements');
      if (Array.isArray(data)) return data;
      return data.announcements || data.data || [];
    } catch (error) {
      console.warn('Announcements API unavailable; using local data:', error);
      return this._resolve(this._data.announcements || []);
    }
  }

  async markAnnouncementAsRead(id) {
    try {
      const result = await this._api(
        `/announcements/${encodeURIComponent(id)}/read`,
        { method: 'POST' }
      );

      const announcement = (this._data.announcements || []).find(a => a.id === id);
      if (announcement) announcement.read = true;

      return result;
    } catch (error) {
      console.warn('Could not mark announcement as read:', error);
      return this._resolve({ success: false, id, error: error.message });
    }
  }

  async markAllAnnouncementsRead() {
    const announcements = await this.getAnnouncements();

    for (const announcement of announcements) {
      if (!announcement.read) {
        await this.markAnnouncementAsRead(announcement.id);
      }
    }

    return { success: true };
  }

  // --------------------------------------------------
  // AUTHENTICATION AND USER SESSION
  // --------------------------------------------------

  async getCurrentUser() {
    const session = await this._api('/auth/me');
    const user = session.user || session;

    if (!user || !user.role) {
      throw new Error('No active session. Please sign in again.');
    }

    const role = String(user.role).toLowerCase();
    let response;

    if (role === 'student') {
      response = await this._api('/students/me');
    } else if (role === 'faculty' || role === 'admin') {
      response = await this._api('/faculty/me');
    } else {
      throw new Error(`Unsupported account role: ${role}`);
    }

    const profile = response.student || response.faculty ||
      response.profile || response;

    return {
      ...profile,
      ...user,
      ...profile,
      role,
      isFaculty: role === 'faculty' || role === 'admin',
      displayName: profile.fullName || user.fullName || 'Portal User',
      displayRole: role === 'student'
        ? `Student · Sem ${profile.semester ?? ''}`
        : (profile.designation || role)
    };
  }

  async isFaculty() {
    try {
      const session = await this._api('/auth/me');
      const user = session.user || session;
      const role = String(user?.role || '').toLowerCase();

      return role === 'faculty' || role === 'admin';
    } catch (error) {
      return false;
    }
  }

  async loginFaculty(identifier, password = '') {
    try {
      const data = await this._api('/auth/faculty/login', {
        method: 'POST',
        body: JSON.stringify({
          email: String(identifier || '').trim(),
          password
        })
      });

      return {
        success: true,
        user: data.user || data.faculty || data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Faculty login failed.'
      };
    }
  }

  async loginStudent(identifier = '', password = '') {
    try {
      const data = await this._api('/auth/student/login', {
        method: 'POST',
        body: JSON.stringify({
          enrollmentNo: String(identifier || '').trim(),
          password
        })
      });

      return {
        success: true,
        user: data.user || data.student || data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Student login failed.'
      };
    }
  }

  async logoutUser() {
    try {
      await this._api('/auth/logout', { method: 'POST' });

      try {
        localStorage.removeItem('dmp_active_role');
        localStorage.removeItem('dmp_active_user_id');
      } catch (e) { }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Logout failed.'
      };
    }
  }

  async switchRole(targetRole) {
    return {
      success: false,
      error: `Please sign in with a ${targetRole} account to change roles.`
    };
  }

  // --------------------------------------------------
  // FACULTY TEACHING STATISTICS (LOCAL DATA)
  // --------------------------------------------------

  async getFacultyTeachingStats(facultyId = 'FAC-01') {
    const faculty = (this._data.faculty || []).find(
      f => f.id === facultyId
    ) || (this._data.faculty || [])[0] || {};

    const taughtCodes = (faculty.subjectsTaught || []).map(s => s.code);
    const timetable = this._data.timetable || [];
    const attendance = this._data.attendance || [];

    const facultyTimetable = timetable.filter(
      item => taughtCodes.includes(item.subjectCode)
    );

    const subjectAttendance = attendance.filter(
      item => taughtCodes.includes(item.subjectCode)
    );

    let totalClassesHeld = 0;
    let totalClassesAttended = 0;

    subjectAttendance.forEach(item => {
      totalClassesHeld += Number(item.totalClasses || 0);
      totalClassesAttended += Number(item.attendedClasses || 0);
    });

    const avgAttendance = totalClassesHeld
      ? Number(((totalClassesAttended / totalClassesHeld) * 100).toFixed(1))
      : 0;

    return this._resolve({
      faculty,
      taughtCodes,
      weeklyLectureHours: facultyTimetable.length,
      timetable: facultyTimetable,
      averageStudentAttendance: avgAttendance,
      subjects: subjectAttendance
    });
  }
}

window.dataService = new DataService();