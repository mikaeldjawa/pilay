import type { SessionData } from "@/modules/reports/renderers/counseling-case-report/sections";

export const MOCK_COUNSELING_SESSION: SessionData = {
  id: "mock-session-1",
  studentId: "mock-student-witness",
  subjectStudentId: "mock-student-subject",
  counselorId: "mock-user-counselor",
  counselingCategoryId: "mock-category-behavioral",
  sessionDate: new Date("2026-03-14"),
  startTime: "13:00",
  endTime: "13:40",
  purpose: "Follow-up interview regarding a reported classroom incident.",
  riskLevel: "MODERATE",
  status: "FOLLOW_UP",
  followUpRequired: true,
  deletedAt: null,
  deletedBy: null,
  createdAt: new Date("2026-03-14T13:45:00"),
  updatedAt: new Date("2026-03-14T13:45:00"),

  student: {
    id: "mock-student-witness",
    studentId: "STU-1201",
    firstName: "Priya",
    middleName: null,
    lastName: "Nair",
    dateOfBirth: new Date("2013-02-20"),
    gender: "Female",
    status: "ACTIVE",
    photoUrl: null,
    notes: null,
    deletedAt: null,
    deletedBy: null,
    createdAt: new Date("2024-08-01"),
    updatedAt: new Date("2024-08-01"),
  },

  subjectStudent: {
    id: "mock-student-subject",
    studentId: "STU-1042",
    firstName: "Amara",
    middleName: null,
    lastName: "Chen",
    dateOfBirth: new Date("2013-05-02"),
    gender: "Female",
    status: "ACTIVE",
    photoUrl: null,
    notes: null,
    deletedAt: null,
    deletedBy: null,
    createdAt: new Date("2024-08-01"),
    updatedAt: new Date("2024-08-01"),
  },

  counselor: {
    id: "mock-user-counselor",
    roleId: "mock-role-counselor",
    email: "r.souza@example.edu",
    passwordHash: "",
    fullName: "Renata Souza",
    isActive: true,
    lastLoginAt: null,
    deletedAt: null,
    deletedBy: null,
    createdAt: new Date("2024-08-01"),
    updatedAt: new Date("2024-08-01"),
  },

  counselingCategory: {
    id: "mock-category-behavioral",
    code: "BEHAV",
    name: "Behavioral",
    description: "Behavioral concerns and follow-up",
    isActive: true,
  },

  note: {
    id: "mock-note-1",
    counselingSessionId: "mock-session-1",
    presentationEngagement:
      "Calm and cooperative; answered questions directly without prompting.",
    emotionalAffect:
      "Slightly anxious at the start of the session, settled after a few minutes.",
    credibilityObjectivity:
      "Account was consistent and specific, with no notable contradictions.",
    credibilityRating: "HIGH",
    actionTaken:
      "Recommended a brief cool-down check-in plan for both students involved.",
    followUpNotes: "Revisit in one week to confirm the plan is working.",
    summaryContext:
      "The session was prompted by a courtyard altercation between two students earlier in the week.",
    summaryPeerDynamic:
      "Priya described the group as generally supportive but noted some recent tension after the incident.",
    summaryConclusion:
      "No ongoing safety concern identified; recommend monitoring and a brief follow-up next week.",
    encryptedPayload: null,
    createdAt: new Date("2026-03-14T13:45:00"),
    updatedAt: new Date("2026-03-14T13:45:00"),
  },

  keyTakeaways: [
    {
      id: "mock-takeaway-1",
      counselingSessionId: "mock-session-1",
      sequenceOrder: 1,
      title: "Isolated incident",
      body: "Priya described the altercation as a one-time disagreement rather than an ongoing pattern.",
      createdAt: new Date("2026-03-14T13:45:00"),
    },
    {
      id: "mock-takeaway-2",
      counselingSessionId: "mock-session-1",
      sequenceOrder: 2,
      title: "No safety concern",
      body: "Priya did not report feeling unsafe around either student involved.",
      createdAt: new Date("2026-03-14T13:45:00"),
    },
  ],

  timelineEvents: [
    {
      id: "mock-timeline-1",
      counselingSessionId: "mock-session-1",
      sequenceOrder: 1,
      phase: "BEFORE",
      title: "Waiting in line",
      body: "Students were lining up for the courtyard when a basketball was dropped and rolled away.",
      createdAt: new Date("2026-03-14T13:45:00"),
    },
    {
      id: "mock-timeline-2",
      counselingSessionId: "mock-session-1",
      sequenceOrder: 2,
      phase: "DURING",
      title: "Confrontation",
      body: "A brief shoving match occurred before a staff member stepped in to separate the students.",
      createdAt: new Date("2026-03-14T13:45:00"),
    },
    {
      id: "mock-timeline-3",
      counselingSessionId: "mock-session-1",
      sequenceOrder: 3,
      phase: "AFTER",
      title: "Separation",
      body: "Both students were escorted to separate areas and calmed down within a few minutes.",
      createdAt: new Date("2026-03-14T13:45:00"),
    },
    {
      id: "mock-timeline-3",
      counselingSessionId: "mock-session-1",
      sequenceOrder: 3,
      phase: "AFTER",
      title: "Separation",
      body: "Both students were escorted to separate areas and calmed down within a few minutes.",
      createdAt: new Date("2026-03-14T13:45:00"),
    },
    {
      id: "mock-timeline-3",
      counselingSessionId: "mock-session-1",
      sequenceOrder: 3,
      phase: "AFTER",
      title: "Separation",
      body: "Both students were escorted to separate areas and calmed down within a few minutes.",
      createdAt: new Date("2026-03-14T13:45:00"),
    },
  ],

  peerPerceptions: [
    {
      id: "mock-peer-1",
      counselingSessionId: "mock-session-1",
      sequenceOrder: 1,
      title: "General reputation",
      body: "Priya said both students are usually well-liked and this was seen as out of character.",
      createdAt: new Date("2026-03-14T13:45:00"),
    },
  ],

  groupObservations: [
    {
      id: "mock-group-1",
      counselingSessionId: "mock-session-1",
      sequenceOrder: 1,
      title: "Class reaction",
      body: "Priya said classmates were surprised but not alarmed, and things returned to normal by lunch.",
      createdAt: new Date("2026-03-14T13:45:00"),
    },
  ],

  objectiveFindings: [
    {
      id: "mock-finding-1",
      counselingSessionId: "mock-session-1",
      sequenceOrder: 1,
      title: "Consistent account",
      body: "Priya's account matches the staff report and the other participant interviews with no material discrepancies.",
      createdAt: new Date("2026-03-14T13:45:00"),
    },
    {
      id: "mock-finding-2",
      counselingSessionId: "mock-session-1",
      sequenceOrder: 2,
      title: "No prior pattern",
      body: "No prior behavior records link these two students to each other.",
      createdAt: new Date("2026-03-14T13:45:00"),
    },
  ],

  riskAssessments: [
    {
      id: "mock-risk-1",
      counselingSessionId: "mock-session-1",
      riskDimensionId: "mock-risk-dim-safety",
      sequenceOrder: 1,
      subjectLabel: "Peer safety",
      riskLevel: "LOW",
      justification:
        "No ongoing conflict reported; both students expressed willingness to move past the incident.",
      createdAt: new Date("2026-03-14T13:45:00"),
      riskDimension: {
        id: "mock-risk-dim-safety",
        name: "Peer Safety",
        description: "Risk of continued conflict between peers",
        isActive: true,
        sortOrder: 1,
      },
    },
    {
      id: "mock-risk-2",
      counselingSessionId: "mock-session-1",
      riskDimensionId: "mock-risk-dim-emotional",
      sequenceOrder: 2,
      subjectLabel: "Emotional wellbeing",
      riskLevel: "MODERATE",
      justification:
        "Some residual anxiety noted; worth a brief follow-up to confirm it resolves.",
      createdAt: new Date("2026-03-14T13:45:00"),
      riskDimension: {
        id: "mock-risk-dim-emotional",
        name: "Emotional Wellbeing",
        description: "Risk of ongoing emotional distress",
        isActive: true,
        sortOrder: 2,
      },
    },
  ],

  actionItems: [
    {
      id: "mock-action-1",
      counselingSessionId: "mock-session-1",
      sequenceOrder: 1,
      title: "Follow-up check-in",
      body: "Brief check-in with Priya in one week to confirm the situation has settled.",
      owner: "Renata Souza",
      createdAt: new Date("2026-03-14T13:45:00"),
    },
    {
      id: "mock-action-2",
      counselingSessionId: "mock-session-1",
      sequenceOrder: 2,
      title: "Homeroom monitoring",
      body: "Homeroom teacher to informally monitor interactions between the two students for two weeks.",
      owner: "Ms. Alvarez",
      createdAt: new Date("2026-03-14T13:45:00"),
    },
  ],
};
