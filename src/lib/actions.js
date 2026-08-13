import { getDB, saveDB, uid } from "./db";

// ---------- Auth ----------
export function login(role, id, password) {
  const db = getDB();
  const list = role === "faculty" ? db.faculty : db.students;
  const user = list.find((u) => u.id.toLowerCase() === id.trim().toLowerCase());
  if (!user) return { ok: false, error: "We couldn't find that ID." };
  if (user.password !== password) return { ok: false, error: "That password doesn't match." };
  return { ok: true, user: { id: user.id, name: user.name, role } };
}

// ---------- Lecture lifecycle ----------
export function getActiveLecture(db = getDB()) {
  if (!db.activeLectureId) return null;
  return db.lectures.find((l) => l.id === db.activeLectureId) || null;
}

export function startLecture({ name, subject, facultyId }) {
  const db = getDB();
  if (db.activeLectureId) {
    return { ok: false, error: "End the current lecture before starting a new one." };
  }
  const lecture = {
    id: uid("lec"),
    name: name.trim() || `${subject} Session`,
    subject,
    facultyId,
    status: "live",
    startedAt: new Date().toISOString(),
    endedAt: null,
    questions: [],
  };
  db.lectures.unshift(lecture);
  db.activeLectureId = lecture.id;
  saveDB(db);
  return { ok: true, lecture };
}

export function endLecture(lectureId) {
  const db = getDB();
  const lecture = db.lectures.find((l) => l.id === lectureId);
  if (!lecture) return { ok: false, error: "Lecture not found." };
  lecture.status = "ended";
  lecture.endedAt = new Date().toISOString();
  if (db.activeLectureId === lectureId) db.activeLectureId = null;
  saveDB(db);
  return { ok: true };
}

export function askQuestion(lectureId, text) {
  const db = getDB();
  const lecture = db.lectures.find((l) => l.id === lectureId);
  if (!lecture) return { ok: false, error: "Lecture not found." };
  if (!text.trim()) return { ok: false, error: "Write a question first." };
  const question = { id: uid("q"), text: text.trim(), createdAt: new Date().toISOString() };
  lecture.questions.push(question);
  saveDB(db);
  return { ok: true, question };
}

export function submitAnswer({ lectureId, questionId, studentId, studentName, answer }) {
  const db = getDB();
  if (!answer.trim()) return { ok: false, error: "Write an answer before submitting." };
  const lecture = db.lectures.find((l) => l.id === lectureId);
  if (!lecture || lecture.status !== "live") {
    return { ok: false, error: "This lecture is no longer live." };
  }
  const already = db.responses.find(
    (r) => r.lectureId === lectureId && r.questionId === questionId && r.studentId === studentId
  );
  if (already) {
    already.answer = answer.trim();
    already.submittedAt = new Date().toISOString();
    saveDB(db);
    return { ok: true, response: already, updated: true };
  }
  const response = {
    id: uid("r"),
    lectureId,
    questionId,
    studentId,
    studentName,
    answer: answer.trim(),
    submittedAt: new Date().toISOString(),
  };
  db.responses.push(response);
  saveDB(db);
  return { ok: true, response, updated: false };
}

// ---------- Queries ----------
export function getStudentResponses(studentId, db = getDB()) {
  return db.responses
    .filter((r) => r.studentId === studentId)
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
}

export function getLectureResponses(lectureId, db = getDB()) {
  return db.responses
    .filter((r) => r.lectureId === lectureId)
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
}

export function getQuestionForLecture(lecture) {
  if (!lecture || lecture.questions.length === 0) return null;
  return lecture.questions[lecture.questions.length - 1];
}

// ---------- Analytics ----------
export function computeAnalytics(db = getDB()) {
  const totalStudents = db.students.length;
  const totalLectures = db.lectures.length;
  const totalQuestions = db.lectures.reduce((sum, l) => sum + l.questions.length, 0);
  const totalResponses = db.responses.length;

  const possible = db.lectures.reduce(
    (sum, l) => sum + l.questions.length * totalStudents,
    0
  );
  const participationRate = possible > 0 ? Math.round((totalResponses / possible) * 100) : 0;

  const byStudent = db.students.map((s) => {
    const count = db.responses.filter((r) => r.studentId === s.id).length;
    return { id: s.id, name: s.name, count };
  });
  byStudent.sort((a, b) => b.count - a.count);
  const mostInteractiveStudent = byStudent[0] || null;

  const byLecture = db.lectures.map((l) => {
    const responses = db.responses.filter((r) => r.lectureId === l.id).length;
    const possibleForLecture = l.questions.length * totalStudents;
    const rate = possibleForLecture > 0 ? Math.round((responses / possibleForLecture) * 100) : 0;
    return { id: l.id, name: l.name, subject: l.subject, responses, rate, questions: l.questions.length };
  });
  byLecture.sort((a, b) => b.responses - a.responses);
  const mostInteractiveLecture = byLecture[0] || null;

  // Daily participation for the last 7 days (including today)
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString(undefined, { weekday: "short", day: "numeric" });
    const count = db.responses.filter((r) => r.submittedAt.slice(0, 10) === key).length;
    days.push({ key, label, count });
  }

  return {
    totalStudents,
    totalLectures,
    totalQuestions,
    totalResponses,
    participationRate,
    byStudent,
    mostInteractiveStudent,
    byLecture,
    mostInteractiveLecture,
    dailyParticipation: days,
  };
}

export function computeDailyRecap(db = getDB()) {
  const today = new Date().toISOString().slice(0, 10);
  const todaysLectures = db.lectures.filter((l) => (l.startedAt || "").slice(0, 10) === today);
  const todaysResponses = db.responses.filter((r) => r.submittedAt.slice(0, 10) === today);
  const todaysQuestions = todaysLectures.reduce((sum, l) => sum + l.questions.length, 0);
  const participants = new Set(todaysResponses.map((r) => r.studentId));

  const byStudent = {};
  todaysResponses.forEach((r) => {
    byStudent[r.studentId] = byStudent[r.studentId] || { id: r.studentId, name: r.studentName, count: 0 };
    byStudent[r.studentId].count += 1;
  });
  const leaderboardToday = Object.values(byStudent).sort((a, b) => b.count - a.count);

  const byLecture = {};
  todaysResponses.forEach((r) => {
    byLecture[r.lectureId] = (byLecture[r.lectureId] || 0) + 1;
  });
  let mostInteractiveLecture = null;
  let max = -1;
  Object.entries(byLecture).forEach(([lecId, count]) => {
    if (count > max) {
      max = count;
      const lec = db.lectures.find((l) => l.id === lecId);
      mostInteractiveLecture = lec ? { name: lec.name, subject: lec.subject, count } : null;
    }
  });

  return {
    totalLectures: todaysLectures.length,
    totalQuestions: todaysQuestions,
    totalResponses: todaysResponses.length,
    totalParticipants: participants.size,
    mostInteractiveStudent: leaderboardToday[0] || null,
    mostInteractiveLecture,
    leaderboardToday,
  };
}
