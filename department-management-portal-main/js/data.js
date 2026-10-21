/**
 * Department Management Portal - Centralized Fictional Sample Data
 * 
 * DISCLAIMER: All data contained in this file is strictly fictional demonstration content
 * created for frontend testing, visualization, and validation. It does not represent
 * real student, faculty, or institutional records.
 */

window.PORTAL_DATA = {
  // Student Profile Information
  student: {
    id: "STU-2023-0482",
    enrollmentNo: "0827CS231048",
    fullName: "Aarav Patel",
    email: "aarav.patel@eng.university.edu",
    avatar: "/assets/images/student_avatar.jpg",
    department: "Computer Science & Engineering",
    program: "Bachelor of Technology (B.Tech)",
    semester: 5,
    academicYear: "2026–2027",
    section: "CS-A",
    rollNo: "48",
    admissionYear: 2023,
    advisor: "Dr. Sunita Sharma",
    mentorOffice: "Tech Block A-304",
    status: "Active Full-Time",
    cgpa: 8.74,
    phone: "+1 (555) 234-8901",
    dateOfBirth: "March 14, 2005",
    bloodGroup: "O+"
  },

  // Configurable demonstration threshold (Not institutional policy)
  config: {
    attendanceThreshold: 75.0,
    passingMarksPercentage: 40.0,
    distinctionMarksPercentage: 75.0
  },

  // Department Academic Subjects (Semester 5)
  subjects: [
    {
      code: "CS501",
      name: "Advanced Database Management Systems",
      shortName: "Adv DBMS",
      semester: 5,
      credits: 4,
      category: "Program Core",
      type: "Theory + Lab",
      weeklyHours: 5,
      facultyId: "FAC-01",
      facultyName: "Dr. Sunita Sharma",
      syllabusOverview: "Distributed databases, query optimization, ACID & concurrency control, NoSQL architectures, indexing.",
      classroom: "Tech Block A-302",
      lab: "Systems & Data Lab (Lab 3)"
    },
    {
      code: "CS502",
      name: "Operating Systems & Kernel Architecture",
      shortName: "OS & Kernel",
      semester: 5,
      credits: 4,
      category: "Program Core",
      type: "Theory + Lab",
      weeklyHours: 5,
      facultyId: "FAC-06",
      facultyName: "Prof. Marcus Vance",
      syllabusOverview: "Process scheduling, thread synchronization, virtual memory management, file systems, IPC and POSIX.",
      classroom: "Tech Block A-302",
      lab: "UNIX & OS Lab (Lab 2)"
    },
    {
      code: "CS503",
      name: "Design & Analysis of Algorithms",
      shortName: "Algorithms",
      semester: 5,
      credits: 4,
      category: "Program Core",
      type: "Theory",
      weeklyHours: 4,
      facultyId: "FAC-03",
      facultyName: "Dr. Rajesh Patel",
      syllabusOverview: "Divide-and-conquer, dynamic programming, greedy algorithms, amortized analysis, NP-completeness.",
      classroom: "Hall 101 (Main Auditorium)",
      lab: null
    },
    {
      code: "CS504",
      name: "Computer Networks & Protocols",
      shortName: "Comp Networks",
      semester: 5,
      credits: 3,
      category: "Program Core",
      type: "Theory",
      weeklyHours: 3,
      facultyId: "FAC-04",
      facultyName: "Prof. Elena Rostova",
      syllabusOverview: "OSI and TCP/IP stack, routing protocols, flow control, transport layer primitives, DNS, HTTP/3.",
      classroom: "Tech Block B-108",
      lab: null
    },
    {
      code: "CS505",
      name: "Software Engineering & Agile Methods",
      shortName: "Software Eng",
      semester: 5,
      credits: 3,
      category: "Program Elective",
      type: "Theory",
      weeklyHours: 3,
      facultyId: "FAC-05",
      facultyName: "Dr. Priya Nair",
      syllabusOverview: "Agile Scrum frameworks, requirement engineering, UML modeling, CI/CD pipelines, automated testing.",
      classroom: "Tech Block A-204",
      lab: null
    },
    {
      code: "CS506",
      name: "Cloud Computing & Distributed Systems",
      shortName: "Cloud Computing",
      semester: 5,
      credits: 3,
      category: "Program Elective",
      type: "Theory + Lab",
      weeklyHours: 4,
      facultyId: "FAC-02",
      facultyName: "Prof. David Chen",
      syllabusOverview: "Virtualization, container orchestration (Docker/Kubernetes), microservices, serverless, consensus algorithms.",
      classroom: "Tech Block B-201",
      lab: "Cloud & Virtualization Lab (Lab 5)"
    }
  ],

  // Faculty Records
  faculty: [
    {
      id: "FAC-01",
      fullName: "Dr. Sunita Sharma",
      designation: "Professor & Head of Department",
      qualification: "Ph.D. in Computer Science (Distributed Databases)",
      department: "Computer Science & Engineering",
      email: "s.sharma@eng.university.edu",
      phone: "+1 (555) 432-1001",
      office: "Tech Block A-304",
      officeHours: "Mon & Wed: 14:00 – 16:00",
      avatar: "/assets/images/faculty_dr_sharma.jpg",
      subjectsTaught: [
        { code: "CS501", name: "Advanced Database Management Systems" },
        { code: "CS702", name: "Big Data Architectures" }
      ],
      researchInterests: ["Distributed Consensus", "Query Optimization", "Stream Processing"],
      experienceYears: 18,
      publicationsCount: 34
    },
    {
      id: "FAC-02",
      fullName: "Prof. David Chen",
      designation: "Associate Professor",
      qualification: "Ph.D. in Systems Engineering (Cloud Systems)",
      department: "Computer Science & Engineering",
      email: "d.chen@eng.university.edu",
      phone: "+1 (555) 432-1002",
      office: "Tech Block B-211",
      officeHours: "Tue & Thu: 11:00 – 13:00",
      avatar: "/assets/images/faculty_prof_chen.jpg",
      subjectsTaught: [
        { code: "CS506", name: "Cloud Computing & Distributed Systems" },
        { code: "CS604", name: "DevOps & SRE Engineering" }
      ],
      researchInterests: ["Kubernetes Scheduling", "Edge Computing", "Serverless Infrastructure"],
      experienceYears: 12,
      publicationsCount: 21
    },
    {
      id: "FAC-03",
      fullName: "Dr. Rajesh Patel",
      designation: "Dean of Academics & Senior Professor",
      qualification: "Ph.D. in Theoretical Computer Science",
      department: "Computer Science & Engineering",
      email: "r.patel@eng.university.edu",
      phone: "+1 (555) 432-1003",
      office: "Administration Wing Admin-201",
      officeHours: "Friday: 15:00 – 17:00 (By Appointment)",
      avatar: "/assets/images/faculty_dr_patel.jpg",
      subjectsTaught: [
        { code: "CS503", name: "Design & Analysis of Algorithms" },
        { code: "CS701", name: "Computational Complexity" }
      ],
      researchInterests: ["Approximation Algorithms", "Graph Theory", "Quantum Computing Foundations"],
      experienceYears: 24,
      publicationsCount: 52
    },
    {
      id: "FAC-04",
      fullName: "Prof. Elena Rostova",
      designation: "Assistant Professor",
      qualification: "M.Tech in Telecommunications & Cybersecurity",
      department: "Computer Science & Engineering",
      email: "e.rostova@eng.university.edu",
      phone: "+1 (555) 432-1004",
      office: "Tech Block B-108",
      officeHours: "Mon & Thu: 10:00 – 12:00",
      avatar: "/assets/images/faculty_dr_sharma.jpg", // fallback avatar
      subjectsTaught: [
        { code: "CS504", name: "Computer Networks & Protocols" },
        { code: "CS601", name: "Network Security & Cryptography" }
      ],
      researchInterests: ["Software-Defined Networking", "Zero-Trust Architecture", "QUIC Protocol"],
      experienceYears: 8,
      publicationsCount: 14
    },
    {
      id: "FAC-05",
      fullName: "Dr. Priya Nair",
      designation: "Associate Professor",
      qualification: "Ph.D. in Empirical Software Engineering",
      department: "Computer Science & Engineering",
      email: "p.nair@eng.university.edu",
      phone: "+1 (555) 432-1005",
      office: "Tech Block A-208",
      officeHours: "Wed & Fri: 13:00 – 15:00",
      avatar: "/assets/images/faculty_prof_chen.jpg", // fallback avatar
      subjectsTaught: [
        { code: "CS505", name: "Software Engineering & Agile Methods" },
        { code: "CS608", name: "Product Engineering & UX" }
      ],
      researchInterests: ["Code Quality Metrics", "Human Factors in Agile", "Automated Defect Prediction"],
      experienceYears: 11,
      publicationsCount: 19
    },
    {
      id: "FAC-06",
      fullName: "Prof. Marcus Vance",
      designation: "Assistant Professor",
      qualification: "M.S. in Computer Engineering & Embedded Systems",
      department: "Computer Science & Engineering",
      email: "m.vance@eng.university.edu",
      phone: "+1 (555) 432-1006",
      office: "Tech Block B-204",
      officeHours: "Tue & Fri: 09:30 – 11:30",
      avatar: "/assets/images/faculty_dr_patel.jpg", // fallback avatar
      subjectsTaught: [
        { code: "CS502", name: "Operating Systems & Kernel Architecture" },
        { code: "CS512", name: "Embedded Linux Programming" }
      ],
      researchInterests: ["Kernel Preemption", "Real-Time OS", "Device Drivers"],
      experienceYears: 7,
      publicationsCount: 9
    }
  ],

  // Attendance Records (Strictly calculated and cross-verified)
  attendance: [
    {
      subjectCode: "CS501",
      subjectName: "Advanced Database Management Systems",
      totalClasses: 36,
      attendedClasses: 32,
      missedClasses: 4,
      percentage: 88.89,
      status: "Good Attendance",
      statusClass: "text-success",
      badgeClass: "badge-success-subtle",
      sessions: [
        { date: "2026-10-19", topic: "B+ Tree Indexing in Distributed Engines", status: "Present" },
        { date: "2026-10-16", topic: "Two-Phase Commit Protocol Implementation", status: "Present" },
        { date: "2026-10-14", topic: "Vector Search & High-Dimensional Storage", status: "Present" },
        { date: "2026-10-12", topic: "ACID Isolation Levels & Write Skew", status: "Absent" },
        { date: "2026-10-09", topic: "Query Cost Modeling & Optimizer Trees", status: "Present" },
        { date: "2026-10-07", topic: "Distributed Deadlock Detection Algorithms", status: "Present" },
        { date: "2026-10-05", topic: "Multi-Version Concurrency Control (MVCC)", status: "Present" },
        { date: "2026-10-02", topic: "CAP Theorem Tradeoffs & Dynamo Patterns", status: "Absent" }
      ]
    },
    {
      subjectCode: "CS502",
      subjectName: "Operating Systems & Kernel Architecture",
      totalClasses: 34,
      attendedClasses: 30,
      missedClasses: 4,
      percentage: 88.24,
      status: "Good Attendance",
      statusClass: "text-success",
      badgeClass: "badge-success-subtle",
      sessions: [
        { date: "2026-10-19", topic: "Virtual Memory Paging & TLB Miss Handling", status: "Present" },
        { date: "2026-10-17", topic: "Linux CFS (Completely Fair Scheduler)", status: "Present" },
        { date: "2026-10-14", topic: "Kernel Space vs User Space Context Switch", status: "Present" },
        { date: "2026-10-10", topic: "Semaphores, Futexes and Race Conditions", status: "Present" },
        { date: "2026-10-08", topic: "Interrupt Handlers and Bottom Halves", status: "Absent" },
        { date: "2026-10-03", topic: "Copy-On-Write and fork() Internal Logic", status: "Present" },
        { date: "2026-10-01", topic: "Page Replacement: LRU vs Clock Algorithm", status: "Present" },
        { date: "2026-09-28", topic: "EXT4 Journaling & Inode Structures", status: "Present" }
      ]
    },
    {
      subjectCode: "CS503",
      subjectName: "Design & Analysis of Algorithms",
      totalClasses: 35,
      attendedClasses: 24,
      missedClasses: 11,
      percentage: 68.57,
      status: "Below Threshold",
      statusClass: "text-danger",
      badgeClass: "badge-danger-subtle",
      sessions: [
        { date: "2026-10-18", topic: "Dynamic Programming: Matrix Chain Multiplication", status: "Absent" },
        { date: "2026-10-16", topic: "Bellman-Ford & Negative Cycle Detection", status: "Present" },
        { date: "2026-10-13", topic: "Max Flow Min Cut & Ford-Fulkerson", status: "Absent" },
        { date: "2026-10-11", topic: "Disjoint Set Union & Kruskal Algorithm", status: "Present" },
        { date: "2026-10-09", topic: "Amortized Analysis: Potential Method", status: "Absent" },
        { date: "2026-10-06", topic: "Divide and Conquer: Fast Fourier Transform", status: "Present" },
        { date: "2026-10-04", topic: "NP-Completeness Reductions: 3-SAT to CLIQUE", status: "Absent" },
        { date: "2026-09-30", topic: "Approximation Algorithms for Vertex Cover", status: "Present" }
      ]
    },
    {
      subjectCode: "CS504",
      subjectName: "Computer Networks & Protocols",
      totalClasses: 30,
      attendedClasses: 23,
      missedClasses: 7,
      percentage: 76.67,
      status: "Needs Attention",
      statusClass: "text-warning",
      badgeClass: "badge-warning-subtle",
      sessions: [
        { date: "2026-10-18", topic: "BGP Autonomous Systems & Inter-domain Routing", status: "Present" },
        { date: "2026-10-15", topic: "TCP Congestion Control: Reno, Cubic, BBR", status: "Present" },
        { date: "2026-10-13", topic: "TLS 1.3 Handshake & Cipher Suite Negotiation", status: "Present" },
        { date: "2026-10-08", topic: "DNSSEC and Recursive Resolver Lookups", status: "Absent" },
        { date: "2026-10-06", topic: "IPv6 Header Format & Neighbor Discovery", status: "Present" },
        { date: "2026-10-01", topic: "HTTP/2 Multiplexing vs HTTP/3 QUIC Streams", status: "Absent" },
        { date: "2026-09-29", topic: "VLAN Tagging (802.1Q) and Trunking", status: "Present" },
        { date: "2026-09-24", topic: "Network Address Translation (NAT) Traversal", status: "Present" }
      ]
    },
    {
      subjectCode: "CS505",
      subjectName: "Software Engineering & Agile Methods",
      totalClasses: 28,
      attendedClasses: 26,
      missedClasses: 2,
      percentage: 92.86,
      status: "Good Attendance",
      statusClass: "text-success",
      badgeClass: "badge-success-subtle",
      sessions: [
        { date: "2026-10-19", topic: "Sprint Retrospectives & Velocity Estimation", status: "Present" },
        { date: "2026-10-15", topic: "Domain-Driven Design (DDD) Aggregates", status: "Present" },
        { date: "2026-10-12", topic: "Continuous Integration Pipelines & GitHub Actions", status: "Present" },
        { date: "2026-10-08", topic: "Test-Driven Development (TDD) Refactoring", status: "Present" },
        { date: "2026-10-05", topic: "Static Code Analysis & SonarQube Metrics", status: "Absent" },
        { date: "2026-10-01", topic: "Design Patterns: Observer, Strategy, Factory", status: "Present" },
        { date: "2026-09-26", topic: "Microservices vs Modular Monolith Architectural Tradeoffs", status: "Present" },
        { date: "2026-09-22", topic: "User Story Mapping & Acceptance Criteria", status: "Present" }
      ]
    },
    {
      subjectCode: "CS506",
      subjectName: "Cloud Computing & Distributed Systems",
      totalClasses: 32,
      attendedClasses: 27,
      missedClasses: 5,
      percentage: 84.38,
      status: "Good Attendance",
      statusClass: "text-success",
      badgeClass: "badge-success-subtle",
      sessions: [
        { date: "2026-10-17", topic: "Container Security & Seccomp Profiles", status: "Present" },
        { date: "2026-10-14", topic: "Kubernetes DaemonSets & StatefulSets", status: "Present" },
        { date: "2026-10-11", topic: "Raft Consensus Algorithm Leader Election", status: "Present" },
        { date: "2026-10-07", topic: "Distributed Caching: Redis Cluster Invalidation", status: "Absent" },
        { date: "2026-10-04", topic: "Cloud Object Storage & S3 Multipart Uploads", status: "Present" },
        { date: "2026-09-30", topic: "Serverless Event Triggers & Cold Start Reduction", status: "Present" },
        { date: "2026-09-25", topic: "Edge CDN Caching & Anycast Routing", status: "Absent" },
        { date: "2026-09-21", topic: "Service Mesh: Envoy Sidecars & Mutual TLS", status: "Present" }
      ]
    }
  ],

  // Internal Marks & Assessment Scheme (Max Marks specified for every component)
  results: [
    {
      subjectCode: "CS501",
      subjectName: "Advanced Database Management Systems",
      credits: 4,
      components: [
        { name: "Internal Test 1", obtained: 22, max: 25 },
        { name: "Internal Test 2", obtained: 24, max: 25 },
        { name: "Assignments & Quiz", obtained: 18, max: 20 },
        { name: "Practical / Lab Viva", obtained: 27, max: 30 }
      ],
      totalObtained: 91,
      totalMax: 100,
      percentage: 91.0,
      grade: "A+",
      performanceCategory: "Distinction",
      facultyFeedback: "Demonstrated exceptional competence in query planning, distributed commit protocols, and practical database indexing labs."
    },
    {
      subjectCode: "CS502",
      subjectName: "Operating Systems & Kernel Architecture",
      credits: 4,
      components: [
        { name: "Internal Test 1", obtained: 21, max: 25 },
        { name: "Internal Test 2", obtained: 20, max: 25 },
        { name: "Assignments & Quiz", obtained: 17, max: 20 },
        { name: "Practical / Lab Viva", obtained: 26, max: 30 }
      ],
      totalObtained: 84,
      totalMax: 100,
      percentage: 84.0,
      grade: "A",
      performanceCategory: "Very Good",
      facultyFeedback: "Solid execution in memory virtualization experiments; recommended to deepen familiarity with POSIX thread synchronization primitives."
    },
    {
      subjectCode: "CS503",
      subjectName: "Design & Analysis of Algorithms",
      credits: 4,
      components: [
        { name: "Internal Test 1", obtained: 19, max: 30 },
        { name: "Internal Test 2", obtained: 21, max: 30 },
        { name: "Assignments & Problem Sets", obtained: 15, max: 20 },
        { name: "Technical Presentation", obtained: 16, max: 20 }
      ],
      totalObtained: 71,
      totalMax: 100,
      percentage: 71.0,
      grade: "B+",
      performanceCategory: "Good",
      facultyFeedback: "Good conceptual intuition on greedy algorithms and shortest path proofs, but requires additional practice with NP-completeness reductions."
    },
    {
      subjectCode: "CS504",
      subjectName: "Computer Networks & Protocols",
      credits: 3,
      components: [
        { name: "Internal Test 1", obtained: 24, max: 30 },
        { name: "Internal Test 2", obtained: 25, max: 30 },
        { name: "Assignments & Packet Analysis", obtained: 18, max: 20 },
        { name: "Technical Viva", obtained: 18, max: 20 }
      ],
      totalObtained: 85,
      totalMax: 100,
      percentage: 85.0,
      grade: "A",
      performanceCategory: "Very Good",
      facultyFeedback: "Strong analytical skill displayed in Wireshark packet inspections and TCP congestion flow analysis."
    },
    {
      subjectCode: "CS505",
      subjectName: "Software Engineering & Agile Methods",
      credits: 3,
      components: [
        { name: "Internal Test 1", obtained: 26, max: 30 },
        { name: "Internal Test 2", obtained: 27, max: 30 },
        { name: "Agile Project Sprint Submissions", obtained: 19, max: 20 },
        { name: "Code Review & Presentation", obtained: 18, max: 20 }
      ],
      totalObtained: 90,
      totalMax: 100,
      percentage: 90.0,
      grade: "A+",
      performanceCategory: "Distinction",
      facultyFeedback: "Exemplary team communication, architecture documentation, and adherence to test-driven design standards throughout the simulated sprints."
    },
    {
      subjectCode: "CS506",
      subjectName: "Cloud Computing & Distributed Systems",
      credits: 3,
      components: [
        { name: "Internal Test 1", obtained: 23, max: 25 },
        { name: "Internal Test 2", obtained: 22, max: 25 },
        { name: "Assignments & Architectures", obtained: 17, max: 20 },
        { name: "Cloud Lab Deployment Project", obtained: 25, max: 30 }
      ],
      totalObtained: 87,
      totalMax: 100,
      percentage: 87.0,
      grade: "A",
      performanceCategory: "Very Good",
      facultyFeedback: "Superb work deploying and load-testing multi-tier microservices on Kubernetes cluster. Clean Helm configuration."
    }
  ],

  // Weekly Schedule (Monday - Saturday)
  timetable: [
    // MONDAY
    {
      id: "TT-MON-01",
      day: "Monday",
      dayIndex: 1,
      startTime: "09:00",
      endTime: "10:00",
      timeDisplay: "09:00 AM – 10:00 AM",
      subjectCode: "CS501",
      subjectName: "Advanced Database Management Systems",
      facultyName: "Dr. Sunita Sharma",
      room: "Tech Block A-302",
      type: "Lecture"
    },
    {
      id: "TT-MON-02",
      day: "Monday",
      dayIndex: 1,
      startTime: "10:00",
      endTime: "11:00",
      timeDisplay: "10:00 AM – 11:00 AM",
      subjectCode: "CS502",
      subjectName: "Operating Systems & Kernel Architecture",
      facultyName: "Prof. Marcus Vance",
      room: "Tech Block A-302",
      type: "Lecture"
    },
    {
      id: "TT-MON-03",
      day: "Monday",
      dayIndex: 1,
      startTime: "11:15",
      endTime: "12:15",
      timeDisplay: "11:15 AM – 12:15 PM",
      subjectCode: "CS503",
      subjectName: "Design & Analysis of Algorithms",
      facultyName: "Dr. Rajesh Patel",
      room: "Hall 101",
      type: "Lecture"
    },
    {
      id: "TT-MON-04",
      day: "Monday",
      dayIndex: 1,
      startTime: "13:15",
      endTime: "15:15",
      timeDisplay: "01:15 PM – 03:15 PM",
      subjectCode: "CS501",
      subjectName: "Adv DBMS - Distributed DB Lab",
      facultyName: "Dr. Sunita Sharma",
      room: "Systems & Data Lab (Lab 3)",
      type: "Lab Practical"
    },
    {
      id: "TT-MON-05",
      day: "Monday",
      dayIndex: 1,
      startTime: "15:30",
      endTime: "16:30",
      timeDisplay: "03:30 PM – 04:30 PM",
      subjectCode: "CS505",
      subjectName: "Software Engineering & Agile Methods",
      facultyName: "Dr. Priya Nair",
      room: "Tech Block A-204",
      type: "Tutorial"
    },

    // TUESDAY
    {
      id: "TT-TUE-01",
      day: "Tuesday",
      dayIndex: 2,
      startTime: "09:00",
      endTime: "10:00",
      timeDisplay: "09:00 AM – 10:00 AM",
      subjectCode: "CS504",
      subjectName: "Computer Networks & Protocols",
      facultyName: "Prof. Elena Rostova",
      room: "Tech Block B-108",
      type: "Lecture"
    },
    {
      id: "TT-TUE-02",
      day: "Tuesday",
      dayIndex: 2,
      startTime: "10:00",
      endTime: "11:00",
      timeDisplay: "10:00 AM – 11:00 AM",
      subjectCode: "CS506",
      subjectName: "Cloud Computing & Distributed Systems",
      facultyName: "Prof. David Chen",
      room: "Tech Block B-201",
      type: "Lecture"
    },
    {
      id: "TT-TUE-03",
      day: "Tuesday",
      dayIndex: 2,
      startTime: "11:15",
      endTime: "12:15",
      timeDisplay: "11:15 AM – 12:15 PM",
      subjectCode: "CS502",
      subjectName: "Operating Systems & Kernel Architecture",
      facultyName: "Prof. Marcus Vance",
      room: "Tech Block A-302",
      type: "Lecture"
    },
    {
      id: "TT-TUE-04",
      day: "Tuesday",
      dayIndex: 2,
      startTime: "13:15",
      endTime: "15:15",
      timeDisplay: "01:15 PM – 03:15 PM",
      subjectCode: "CS502",
      subjectName: "OS Kernel & System Calls Lab",
      facultyName: "Prof. Marcus Vance",
      room: "UNIX & OS Lab (Lab 2)",
      type: "Lab Practical"
    },

    // WEDNESDAY
    {
      id: "TT-WED-01",
      day: "Wednesday",
      dayIndex: 3,
      startTime: "09:00",
      endTime: "10:00",
      timeDisplay: "09:00 AM – 10:00 AM",
      subjectCode: "CS503",
      subjectName: "Design & Analysis of Algorithms",
      facultyName: "Dr. Rajesh Patel",
      room: "Hall 101",
      type: "Lecture"
    },
    {
      id: "TT-WED-02",
      day: "Wednesday",
      dayIndex: 3,
      startTime: "10:00",
      endTime: "11:00",
      timeDisplay: "10:00 AM – 11:00 AM",
      subjectCode: "CS501",
      subjectName: "Advanced Database Management Systems",
      facultyName: "Dr. Sunita Sharma",
      room: "Tech Block A-302",
      type: "Lecture"
    },
    {
      id: "TT-WED-03",
      day: "Wednesday",
      dayIndex: 3,
      startTime: "11:15",
      endTime: "12:15",
      timeDisplay: "11:15 AM – 12:15 PM",
      subjectCode: "CS505",
      subjectName: "Software Engineering & Agile Methods",
      facultyName: "Dr. Priya Nair",
      room: "Tech Block A-204",
      type: "Lecture"
    },
    {
      id: "TT-WED-04",
      day: "Wednesday",
      dayIndex: 3,
      startTime: "14:00",
      endTime: "16:00",
      timeDisplay: "02:00 PM – 04:00 PM",
      subjectCode: "CS506",
      subjectName: "Cloud & Container Orchestration Lab",
      facultyName: "Prof. David Chen",
      room: "Cloud & Virtualization Lab (Lab 5)",
      type: "Lab Practical"
    },

    // THURSDAY
    {
      id: "TT-THU-01",
      day: "Thursday",
      dayIndex: 4,
      startTime: "09:00",
      endTime: "10:00",
      timeDisplay: "09:00 AM – 10:00 AM",
      subjectCode: "CS504",
      subjectName: "Computer Networks & Protocols",
      facultyName: "Prof. Elena Rostova",
      room: "Tech Block B-108",
      type: "Lecture"
    },
    {
      id: "TT-THU-02",
      day: "Thursday",
      dayIndex: 4,
      startTime: "10:00",
      endTime: "11:00",
      timeDisplay: "10:00 AM – 11:00 AM",
      subjectCode: "CS503",
      subjectName: "Design & Analysis of Algorithms",
      facultyName: "Dr. Rajesh Patel",
      room: "Hall 101",
      type: "Lecture"
    },
    {
      id: "TT-THU-03",
      day: "Thursday",
      dayIndex: 4,
      startTime: "11:15",
      endTime: "12:15",
      timeDisplay: "11:15 AM – 12:15 PM",
      subjectCode: "CS506",
      subjectName: "Cloud Computing & Distributed Systems",
      facultyName: "Prof. David Chen",
      room: "Tech Block B-201",
      type: "Lecture"
    },
    {
      id: "TT-THU-04",
      day: "Thursday",
      dayIndex: 4,
      startTime: "13:30",
      endTime: "15:00",
      timeDisplay: "01:30 PM – 03:00 PM",
      subjectCode: "CS504",
      subjectName: "Network Packet Analysis Workshop",
      facultyName: "Prof. Elena Rostova",
      room: "Tech Block B-108",
      type: "Tutorial"
    },

    // FRIDAY
    {
      id: "TT-FRI-01",
      day: "Friday",
      dayIndex: 5,
      startTime: "09:00",
      endTime: "10:00",
      timeDisplay: "09:00 AM – 10:00 AM",
      subjectCode: "CS502",
      subjectName: "Operating Systems & Kernel Architecture",
      facultyName: "Prof. Marcus Vance",
      room: "Tech Block A-302",
      type: "Lecture"
    },
    {
      id: "TT-FRI-02",
      day: "Friday",
      dayIndex: 5,
      startTime: "10:00",
      endTime: "11:00",
      timeDisplay: "10:00 AM – 11:00 AM",
      subjectCode: "CS505",
      subjectName: "Software Engineering & Agile Methods",
      facultyName: "Dr. Priya Nair",
      room: "Tech Block A-204",
      type: "Lecture"
    },
    {
      id: "TT-FRI-03",
      day: "Friday",
      dayIndex: 5,
      startTime: "11:15",
      endTime: "12:15",
      timeDisplay: "11:15 AM – 12:15 PM",
      subjectCode: "CS501",
      subjectName: "Advanced Database Management Systems",
      facultyName: "Dr. Sunita Sharma",
      room: "Tech Block A-302",
      type: "Lecture"
    },
    {
      id: "TT-FRI-04",
      day: "Friday",
      dayIndex: 5,
      startTime: "14:00",
      endTime: "16:00",
      timeDisplay: "02:00 PM – 04:00 PM",
      subjectCode: "CS505",
      subjectName: "Agile Project Review & Sprint Demo",
      facultyName: "Dr. Priya Nair",
      room: "Innovation Hub Room 12",
      type: "Tutorial"
    },

    // SATURDAY
    {
      id: "TT-SAT-01",
      day: "Saturday",
      dayIndex: 6,
      startTime: "09:30",
      endTime: "11:00",
      timeDisplay: "09:30 AM – 11:00 AM",
      subjectCode: "CS503",
      subjectName: "Competitive Problem Solving Seminar",
      facultyName: "Dr. Rajesh Patel",
      room: "Hall 101",
      type: "Tutorial"
    },
    {
      id: "TT-SAT-02",
      day: "Saturday",
      dayIndex: 6,
      startTime: "11:15",
      endTime: "12:45",
      timeDisplay: "11:15 AM – 12:45 PM",
      subjectCode: "CS506",
      subjectName: "Distributed Systems Research Colloquium",
      facultyName: "Prof. David Chen",
      room: "Tech Block B-201",
      type: "Lecture"
    }
  ],

  // Department Announcements
  announcements: [
    {
      id: "ANN-01",
      title: "Mid-Semester Internal Assessment 2 (IA-2) Schedule Announced",
      date: "2026-10-18",
      category: "Examinations",
      priority: "High",
      summary: "Detailed timetables for IA-2 theory assessments covering CS501 through CS506 have been finalized. Written papers commence on November 04, 2026.",
      body: "All Semester 5 B.Tech CSE students are hereby notified that Internal Assessment 2 (IA-2) examinations are scheduled from November 04, 2026 to November 09, 2026. Each test carries 25–30 maximum marks and accounts for key internal grading components. Students must bring their university identity cards to the assigned examination halls.",
      read: false
    },
    {
      id: "ANN-02",
      title: "Guest Masterclass: Production Kubernetes & Observability in FinTech",
      date: "2026-10-16",
      category: "Seminars",
      priority: "Normal",
      summary: "Distinguished engineering speaker Mr. Jason Thorne (Principal SRE) will deliver a 2-hour technical session on distributed telemetry this Thursday.",
      body: "The Department of Computer Science & Engineering invites students to an interactive masterclass on Thursday at 15:30 in the Main Auditorium. Topics include eBPF tracing, high-throughput Prometheus ingestion, and zero-downtime cluster upgrades.",
      read: false
    },
    {
      id: "ANN-03",
      title: "Assignment Submission Reminder: OS Virtual Memory Kernel Module",
      date: "2026-10-14",
      category: "Academic",
      priority: "Urgent",
      summary: "Deadline for submitting the page-replacement kernel module simulation (CS502) is this Friday at 23:59 via the department repository.",
      body: "Submissions for Lab Assignment 4: Virtual Memory Inverted Page Table Simulation must be pushed to your assigned GitLab repository before October 24, 2026 at 23:59. Late submissions incur a 10% penalty per calendar day.",
      read: true
    },
    {
      id: "ANN-04",
      title: "Annual Department Hackathon 'CodeSphere 2026' Registrations Open",
      date: "2026-10-10",
      category: "Events",
      priority: "Normal",
      summary: "36-hour collegiate hackathon focused on AI systems, Cloud infrastructure, and resilient networks. Cash prize pool of $15,000.",
      body: "CodeSphere 2026 will take place November 20–22, 2026 in the Tech Block Innovation Hub. Teams of 3–4 students from CSE and IT departments can apply. Mentorship from industry sponsors will be available.",
      read: true
    },
    {
      id: "ANN-05",
      title: "Smart Timetable Revision: Friday Afternoon Lab Slot Reallocated",
      date: "2026-10-08",
      category: "Timetable",
      priority: "Low",
      summary: "The Friday afternoon CS505 Agile Sprint Review has been shifted from Seminar Room 4 to Innovation Hub Room 12.",
      body: "To accommodate group sprint presentations and projector requirements, the weekly Friday tutorial for Software Engineering (CS505) has been permanently moved to Innovation Hub Room 12.",
      read: true
    }
  ]
};
