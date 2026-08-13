import { useEffect, useMemo, useState } from "react";
import { getDB } from "../lib/db";
import { getActiveLecture, getQuestionForLecture, getStudentResponses, submitAnswer } from "../lib/actions";
import AppShell from "../components/AppShell";
import StatusBadge from "../components/StatusBadge";

const NAV = [
  { key: "live", label: "Live Lecture", icon: "◐" },
  { key: "history", label: "My Answers", icon: "▤" },
];

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function formatDate(iso) {
  return new Date(iso).toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function StudentDashboard({ user, onLogout, onReset }) {
  const [tick, setTick] = useState(0);
  const [view, setView] = useState("live");
  const [answerText, setAnswerText] = useState("");
  const [toast, setToast] = useState("");

  // Poll so a second tab (faculty starting a lecture / asking a question) reflects here.
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1500);
    return () => clearInterval(id);
  }, []);

  const db = useMemo(() => getDB(), [tick]);
  const lecture = getActiveLecture(db);
  const question = getQuestionForLecture(lecture);
  const myResponses = getStudentResponses(user.id, db);

  const alreadyAnswered = useMemo(() => {
    if (!lecture || !question) return null;
    return db.responses.find(
      (r) => r.lectureId === lecture.id && r.questionId === question.id && r.studentId === user.id
    );
  }, [db, lecture, question, user.id]);

  useEffect(() => {
    setAnswerText(alreadyAnswered ? alreadyAnswered.answer : "");
  }, [alreadyAnswered?.id, question?.id]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!lecture || !question) return;
    const result = submitAnswer({
      lectureId: lecture.id,
      questionId: question.id,
      studentId: user.id,
      studentName: user.name,
      answer: answerText,
    });
    if (result.ok) {
      setTick((t) => t + 1);
      setToast(result.updated ? "Answer updated." : "Answer submitted.");
      setTimeout(() => setToast(""), 2200);
    }
  }

  return (
    <AppShell
      user={user}
      navItems={NAV}
      active={view}
      onNavigate={setView}
      onLogout={onLogout}
      onReset={onReset}
    >
      {view === "live" && (
        <>
          <div className="page-head">
            <div>
              <span className="eyebrow">Student dashboard</span>
              <h1>Welcome back, {user.name.split(" ")[0]}</h1>
              <p className="sub">Here's what's happening in your current lecture.</p>
            </div>
          </div>

          {lecture ? (
            <>
              <div className="lecture-banner">
                <div>
                  <StatusBadge status="live" />
                  <div className="lec-name" style={{ marginTop: 10 }}>
                    {lecture.name}
                  </div>
                  <div className="lec-meta">
                    <span className="subject-pill">{lecture.subject}</span>
                    <span>Faculty: Dr. Meera Shah</span>
                    <span>Started {formatTime(lecture.startedAt)}</span>
                  </div>
                </div>
              </div>

              {question ? (
                <div className="question-card">
                  <div className="q-eyebrow">
                    <span>●</span> Current question
                  </div>
                  <div className="q-text">{question.text}</div>

                  <form onSubmit={handleSubmit}>
                    <textarea
                      className="field-input"
                      placeholder="Type your answer here…"
                      value={answerText}
                      onChange={(e) => setAnswerText(e.target.value)}
                    />
                    <div style={{ display: "flex", gap: 10, marginTop: 12, alignItems: "center" }}>
                      <button className="btn btn-accent" type="submit" disabled={!answerText.trim()}>
                        {alreadyAnswered ? "Update answer" : "Submit answer"}
                      </button>
                      {toast && <span style={{ fontSize: 13, color: "var(--leaf-dark)" }}>✓ {toast}</span>}
                    </div>
                  </form>

                  {alreadyAnswered && (
                    <div className="answer-submitted-note">
                      ✓ You answered this at {formatTime(alreadyAnswered.submittedAt)}. You can still
                      update it while the lecture is live.
                    </div>
                  )}
                </div>
              ) : (
                <div className="empty-state">
                  <span className="glyph">⏳</span>
                  <h3>Waiting on the first question</h3>
                  <p>Your faculty member hasn't posted a question yet. This page updates automatically.</p>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <span className="glyph">○</span>
              <h3>No lecture is currently active.</h3>
              <p>Check back once your faculty member starts a session — this page will update on its own.</p>
            </div>
          )}
        </>
      )}

      {view === "history" && (
        <>
          <div className="page-head">
            <div>
              <span className="eyebrow">Your activity</span>
              <h1>My answers</h1>
              <p className="sub">Only you can see your own submissions — {myResponses.length} so far.</p>
            </div>
          </div>

          {myResponses.length === 0 ? (
            <div className="empty-state">
              <span className="glyph">▤</span>
              <h3>No answers yet</h3>
              <p>Once you answer a live question, it will show up here.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Question</th>
                    <th>Your answer</th>
                    <th>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {myResponses.map((r) => {
                    const lec = db.lectures.find((l) => l.id === r.lectureId);
                    const q = lec?.questions.find((qq) => qq.id === r.questionId);
                    return (
                      <tr key={r.id}>
                        <td style={{ maxWidth: 260 }}>
                          <div className="cell-name">{q?.text || "Question"}</div>
                          <div style={{ fontSize: 11.5, color: "var(--slate)" }}>
                            {lec?.subject} · {lec?.name}
                          </div>
                        </td>
                        <td style={{ maxWidth: 300 }}>{r.answer}</td>
                        <td className="cell-time">
                          {formatDate(r.submittedAt)} · {formatTime(r.submittedAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}
