// Lightweight localStorage-backed "database" for the demo.
// Everything lives under one key so reset/export is a single operation.

const DB_KEY = "lit_db_v1";
const SESSION_KEY = "lit_session_v1";

export const SUBJECTS = [
  "Web Development",
  "Python",
  "Database Systems",
  "Artificial Intelligence",
  "Computer Networks",
];

const FACULTY = [{ id: "FAC001", name: "Dr. Meera Shah", password: "1234" }];

const STUDENTS = [
  { id: "STU001", name: "Dev Patel", password: "1234" },
  { id: "STU002", name: "Rahul Verma", password: "1234" },
  { id: "STU003", name: "Jay Mehta", password: "1234" },
  { id: "STU004", name: "Krisha Shah", password: "1234" },
  { id: "STU005", name: "Ananya Iyer", password: "1234" },
];

function uid(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function daysAgo(n, hour = 10, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function minutesAfter(iso, mins) {
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() + mins);
  return d.toISOString();
}

// Build a rich set of ended lectures with questions + per-student responses
// so charts and analytics are populated the first time the app opens.
function buildSeedLectures() {
  const lectures = [];

  const plan = [
    {
      daysBack: 6,
      subject: "Web Development",
      name: "Intro to Flexbox & Grid",
      questions: ["Which CSS property enables Flexbox?", "Name one use case for CSS Grid."],
    },
    {
      daysBack: 5,
      subject: "Python",
      name: "Lists vs Tuples",
      questions: ["Are Python tuples mutable?", "Give an example of a list comprehension."],
    },
    {
      daysBack: 4,
      subject: "Database Systems",
      name: "Normalization Basics",
      questions: ["What problem does 1NF solve?", "Define a foreign key."],
    },
    {
      daysBack: 3,
      subject: "Artificial Intelligence",
      name: "Search Algorithms",
      questions: ["What does BFS stand for?", "Is A* an informed search strategy?"],
    },
    {
      daysBack: 2,
      subject: "Computer Networks",
      name: "OSI Model Overview",
      questions: ["How many layers does the OSI model have?", "Which layer handles routing?"],
    },
    {
      daysBack: 1,
      subject: "Web Development",
      name: "JavaScript Event Loop",
      questions: ["What is the call stack?", "Name one Web API that uses callbacks."],
    },
  ];

  // Uneven participation per student so the leaderboard looks realistic.
  // Each lecture contributes 2 global question slots (0-11 across the 6 lectures).
  // These sets say *which* global question indices each student answered —
  // deliberately uneven so the leaderboard / charts show real variation.
  const answeredSlots = {
    STU001: new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]), // Dev — answers every question (12)
    STU002: new Set([0, 1, 2, 3, 4, 5, 6, 8, 9]), // Rahul (9)
    STU003: new Set([0, 2, 3, 4, 6, 8, 11]), // Jay (7)
    STU004: new Set([0, 3, 6, 9, 11]), // Krisha (5)
    STU005: new Set([1, 6, 11]), // Ananya (3)
  };

  const sampleAnswers = [
    "display: flex on the parent container.",
    "Grid works well for full page layouts with rows and columns.",
    "No, tuples are immutable once created.",
    "[x*x for x in range(5)]",
    "It removes repeating groups and ensures atomic column values.",
    "A key in one table that references the primary key of another table.",
    "Breadth-First Search — explores neighbours level by level.",
    "Yes, it uses a heuristic to guide the search.",
    "There are 7 layers in the OSI model.",
    "The Network layer (Layer 3) handles routing.",
    "It's where function calls are tracked during execution.",
    "setTimeout is a Web API that uses a callback.",
  ];

  let answerCursor = 0;
  let globalQuestionIndex = 0;

  plan.forEach((item, idx) => {
    const startedAt = daysAgo(item.daysBack, 10 + idx, 0);
    const questions = item.questions.map((text, qIdx) => ({
      id: uid("q"),
      text,
      createdAt: minutesAfter(startedAt, qIdx * 6),
      _globalIndex: globalQuestionIndex + qIdx,
    }));
    globalQuestionIndex += questions.length;
    const endedAt = minutesAfter(startedAt, 40);

    const responses = [];
    questions.forEach((q) => {
      STUDENTS.forEach((s, sIdx) => {
        if (answeredSlots[s.id].has(q._globalIndex)) {
          responses.push({
            id: uid("r"),
            lectureId: null, // filled below
            questionId: q.id,
            studentId: s.id,
            studentName: s.name,
            answer: sampleAnswers[answerCursor % sampleAnswers.length],
            submittedAt: minutesAfter(q.createdAt, 1 + ((sIdx * 2 + 1) % 5)),
          });
          answerCursor += 1;
        }
      });
    });

    const lecture = {
      id: uid("lec"),
      name: item.name,
      subject: item.subject,
      facultyId: "FAC001",
      status: "ended",
      startedAt,
      endedAt,
      questions: questions.map(({ id, text, createdAt }) => ({ id, text, createdAt })),
    };
    responses.forEach((r) => (r.lectureId = lecture.id));
    lectures.push({ lecture, responses });
  });

  return lectures;
}

function seedDatabase() {
  const seeded = buildSeedLectures();
  const lectures = seeded.map((s) => s.lecture);
  const responses = seeded.flatMap((s) => s.responses);

  return {
    faculty: FACULTY,
    students: STUDENTS,
    subjects: SUBJECTS,
    lectures, // includes ended + (optionally) one live lecture
    responses,
    activeLectureId: null,
  };
}

export function getDB() {
  const raw = localStorage.getItem(DB_KEY);
  if (!raw) {
    const fresh = seedDatabase();
    localStorage.setItem(DB_KEY, JSON.stringify(fresh));
    return fresh;
  }
  try {
    return JSON.parse(raw);
  } catch {
    const fresh = seedDatabase();
    localStorage.setItem(DB_KEY, JSON.stringify(fresh));
    return fresh;
  }
}

export function saveDB(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

export function resetDB() {
  const fresh = seedDatabase();
  localStorage.setItem(DB_KEY, JSON.stringify(fresh));
  localStorage.removeItem(SESSION_KEY);
  return fresh;
}

// ---- Session helpers ----
export function getSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export { uid };
