import { useEffect, useMemo, useState } from "react";
import { getDB } from "../lib/db";
import {
  askQuestion,
  computeAnalytics,
  computeDailyRecap,
  endLecture,
  getActiveLecture,
  getLectureResponses,
  getQuestionForLecture,
  startLecture,
} from "../lib/actions";
import AppShell from "../components/AppShell";
import StatusBadge from "../components/StatusBadge";
import StudentBarChart from "../components/charts/StudentBarChart";
import LectureParticipationChart from "../components/charts/LectureParticipationChart";
import TopStudentsChart from "../components/charts/TopStudentsChart";
import DailyParticipationChart from "../components/charts/DailyParticipationChart";

const NAV = [
  { key: "live", label: "Live Lecture", icon: "◐" },
  { key: "analytics", label: "Analytics", icon: "▦" },
  { key: "recap", label: "Daily Recap", icon: "◫" },
];

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function initials(name) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function FacultyDashboard({ user, onLogout, onReset }) {
  const [tick, setTick] = useState(0);
  const [view, setView] = useState("live");
  const [subject, setSubject] = useState("");
  const [lecName, setLecName] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [formError, setFormError] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1500);
    return () => clearInterval(id);
  }, []);

  const db = useMemo(() => getDB(), [tick]);
  const lecture = getActiveLecture(db);
  const question = getQuestionForLecture(lecture);
  const responses = lecture ? getLectureResponses(lecture.id, db) : [];

  useEffect(() => {
    if (!subject && db.subjects.length) setSubject(db.subjects[0]);
  }, [db.subjects, subject]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  }

  function handleStart(e) {
    e.preventDefault();
    setFormError("");
    const result = startLecture({ name: lecName, subject, facultyId: user.id });
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    setLecName("");
    setTick((t) => t + 1);
    showToast("Lecture started.");
  }

  function handleEnd() {
    if (!lecture) return;
    endLecture(lecture.id);
    setTick((t) => t + 1);
    showToast("Lecture ended.");
  }

  function handleAsk(e) {
    e.preventDefault();
    if (!lecture) return;
    const result = askQuestion(lecture.id, questionText);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    setFormError("");
    setQuestionText("");
    setTick((t) => t + 1);
    showToast("Question posted.");
  }

  const analytics = useMemo(() => computeAnalytics(db), [db]);
  const recap = useMemo(() => computeDailyRecap(db), [db]);

  const answeredIds = useMemo(() => {
    if (!question) return new Set();
    return new Set(
      db.responses.filter((r) => r.lectureId === lecture?.id && r.questionId === question.id).map((r) => r.studentId)
    );
  }, [db, lecture, question]);

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
              <span className="eyebrow">Faculty dashboard</span>
              <h1>Hello, {user.name}</h1>
              <p className="sub">Run your session and watch responses arrive live.</p>
            </div>
          </div>

          {lecture ? (
            <div className="lecture-banner">
              <div>
                <StatusBadge status="live" />
                <div className="lec-name" style={{ marginTop: 10 }}>
                  {lecture.name}
                </div>
                <div className="lec-meta">
                  <span className="subject-pill">{lecture.subject}</span>
                  <span>Started {formatTime(lecture.startedAt)}</span>
                  <span>{lecture.questions.length} question(s) asked</span>
                  <span>{responses.length} response(s)</span>
                </div>
              </div>
              <div className="lec-actions">
                <button className="btn btn-danger" onClick={handleEnd}>
                  End lecture
                </button>
              </div>
            </div>
          ) : (
            <div className="lecture-banner idle">
              <div>
                <StatusBadge status={null} />
                <div className="lec-name" style={{ marginTop: 10 }}>
                  No lecture running
                </div>
                <div className="lec-meta">Start a session so students can join and respond.</div>
              </div>
            </div>
          )}

          {toast && (
            <div style={{ marginBottom: 16, fontSize: 13, color: "var(--leaf-dark)", fontWeight: 600 }}>
              ✓ {toast}
            </div>
          )}

          <div className="two-col">
            <div className="card">
              <div className="card-title">
                <h3>{lecture ? "Ask a question" : "Start a lecture"}</h3>
                <span className="hint">{lecture ? lecture.subject : "Only one lecture can run at a time"}</span>
              </div>

              {formError && <div className="form-error">{formError}</div>}

              {!lecture ? (
                <form onSubmit={handleStart}>
                  <div className="form-row">
                    <div className="field">
                      <label htmlFor="subject">Subject</label>
                      <select
                        id="subject"
                        className="select"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                      >
                        {db.subjects.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="field">
                      <label htmlFor="lecName">Lecture name</label>
                      <input
                        id="lecName"
                        style={{
                          width: "100%",
                          padding: "11px 13px",
                          borderRadius: "var(--radius-sm)",
                          border: "1.5px solid var(--line)",
                          fontSize: 14,
                        }}
                        placeholder="e.g. Recursion & Base Cases"
                        value={lecName}
                        onChange={(e) => setLecName(e.target.value)}
                      />
                    </div>
                  </div>
                  <button className="btn btn-amber" type="submit">
                    ▶ Start lecture
                  </button>
                </form>
              ) : (
                <form onSubmit={handleAsk}>
                  <div className="inline-form">
                    <textarea
                      className="field-input"
                      placeholder="Type a question for students to answer…"
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                    />
                    <button className="btn btn-accent" type="submit" disabled={!questionText.trim()}>
                      Post question
                    </button>
                  </div>

                  {lecture.questions.length > 0 && (
                    <div className="section-gap">
                      <div className="hint" style={{ marginBottom: 8 }}>
                        Questions asked this session
                      </div>
                      {lecture.questions
                        .slice()
                        .reverse()
                        .map((q, idx) => (
                          <div
                            key={q.id}
                            style={{
                              padding: "9px 12px",
                              borderRadius: 8,
                              background: idx === 0 ? "var(--accent-soft)" : "var(--paper)",
                              marginBottom: 6,
                              fontSize: 13.5,
                            }}
                          >
                            {q.text}
                          </div>
                        ))}
                    </div>
                  )}
                </form>
              )}
            </div>

            <div className="card">
              <div className="card-title">
                <h3>Roll call</h3>
                <span className="hint">{question ? "Current question" : "No question yet"}</span>
              </div>
              {lecture ? (
                <div className="rollcall">
                  {db.students.map((s) => {
                    const answered = answeredIds.has(s.id);
                    return (
                      <div key={s.id} className={`rollcall-chip ${answered ? "answered" : ""}`}>
                        <span className="dot">{initials(s.name)}</span>
                        {s.name.split(" ")[0]}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ fontSize: 13, color: "var(--slate)" }}>
                  Start a lecture to see who's responding in real time.
                </p>
              )}
            </div>
          </div>

          <div className="card section-gap">
            <div className="card-title">
              <h3>Student responses</h3>
              <span className="hint">{lecture ? `${responses.length} total` : "No active lecture"}</span>
            </div>
            {!lecture || responses.length === 0 ? (
              <div className="empty-state" style={{ border: "none", padding: "36px 20px" }}>
                <span className="glyph">✎</span>
                <h3>No responses yet</h3>
                <p>Post a question above — answers will appear here the moment students submit.</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>ID</th>
                      <th>Answer</th>
                      <th>Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {responses.map((r) => (
                      <tr key={r.id}>
                        <td className="cell-name">{r.studentName}</td>
                        <td className="cell-id">{r.studentId}</td>
                        <td style={{ maxWidth: 320 }}>{r.answer}</td>
                        <td className="cell-time">{formatTime(r.submittedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {view === "analytics" && (
        <>
          <div className="page-head">
            <div>
              <span className="eyebrow">Participation analytics</span>
              <h1>How the class is engaging</h1>
              <p className="sub">Across every lecture recorded in this demo.</p>
            </div>
          </div>

          <div className="grid grid-stats">
            <div className="card stat-card">
              <div className="icon">☺</div>
              <div className="value">{analytics.totalStudents}</div>
              <div className="label">Total students</div>
            </div>
            <div className="card stat-card">
              <div className="icon">?</div>
              <div className="value">{analytics.totalQuestions}</div>
              <div className="label">Total questions</div>
            </div>
            <div className="card stat-card">
              <div className="icon">✎</div>
              <div className="value">{analytics.totalResponses}</div>
              <div className="label">Total responses</div>
            </div>
            <div className="card stat-card">
              <div className="icon">%</div>
              <div className="value">{analytics.participationRate}%</div>
              <div className="label">Participation rate</div>
            </div>
          </div>

          {analytics.mostInteractiveStudent && (
            <div className="trophy-card section-gap">
              <div className="emoji">🏆</div>
              <div>
                <div className="label">Most interactive student</div>
                <div className="who-name">{analytics.mostInteractiveStudent.name}</div>
                <div className="who-sub">
                  {analytics.mostInteractiveStudent.id} · {analytics.mostInteractiveStudent.count} responses
                </div>
              </div>
            </div>
          )}

          <div className="two-col section-gap">
            <div className="card chart-card">
              <div className="card-title">
                <h3>Questions answered by each student</h3>
              </div>
              <div className="chart-holder">
                <StudentBarChart data={analytics.byStudent} />
              </div>
            </div>
            <div className="card chart-card">
              <div className="card-title">
                <h3>Top participating students</h3>
              </div>
              <div className="chart-holder">
                <TopStudentsChart data={analytics.byStudent} />
              </div>
            </div>
          </div>

          <div className="two-col section-gap">
            <div className="card chart-card">
              <div className="card-title">
                <h3>Participation by lecture</h3>
              </div>
              <div className="chart-holder">
                <LectureParticipationChart data={analytics.byLecture} />
              </div>
            </div>
            <div className="card chart-card">
              <div className="card-title">
                <h3>Daily participation</h3>
                <span className="hint">Last 7 days</span>
              </div>
              <div className="chart-holder">
                <DailyParticipationChart data={analytics.dailyParticipation} />
              </div>
            </div>
          </div>
        </>
      )}

      {view === "recap" && (
        <>
          <div className="page-head">
            <div>
              <span className="eyebrow">Daily recap</span>
              <h1>Today at a glance</h1>
              <p className="sub">{new Date().toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}</p>
            </div>
          </div>

          <div className="grid grid-stats">
            <div className="card stat-card">
              <div className="icon">◐</div>
              <div className="value">{recap.totalLectures}</div>
              <div className="label">Lectures today</div>
            </div>
            <div className="card stat-card">
              <div className="icon">?</div>
              <div className="value">{recap.totalQuestions}</div>
              <div className="label">Questions asked</div>
            </div>
            <div className="card stat-card">
              <div className="icon">✎</div>
              <div className="value">{recap.totalResponses}</div>
              <div className="label">Responses received</div>
            </div>
            <div className="card stat-card">
              <div className="icon">☺</div>
              <div className="value">{recap.totalParticipants}</div>
              <div className="label">Students participated</div>
            </div>
          </div>

          <div className="two-col section-gap">
            {recap.mostInteractiveStudent ? (
              <div className="trophy-card">
                <div className="emoji">🏆</div>
                <div>
                  <div className="label">Most interactive student today</div>
                  <div className="who-name">{recap.mostInteractiveStudent.name}</div>
                  <div className="who-sub">{recap.mostInteractiveStudent.count} responses</div>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <span className="glyph">☺</span>
                <h3>No activity yet today</h3>
                <p>Start a lecture and ask a question to populate today's recap.</p>
              </div>
            )}

            {recap.mostInteractiveLecture && (
              <div className="trophy-card" style={{ background: "var(--accent-soft)", borderColor: "#bcd2e8" }}>
                <div className="emoji">📚</div>
                <div>
                  <div className="label" style={{ color: "var(--accent-dark)" }}>
                    Most interactive lecture today
                  </div>
                  <div className="who-name">{recap.mostInteractiveLecture.name}</div>
                  <div className="who-sub">
                    {recap.mostInteractiveLecture.subject} · {recap.mostInteractiveLecture.count} responses
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="card section-gap">
            <div className="card-title">
              <h3>Participation leaderboard</h3>
              <span className="hint">Today</span>
            </div>
            {recap.leaderboardToday.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--slate)" }}>No responses recorded today yet.</p>
            ) : (
              <div>
                {recap.leaderboardToday.map((s, idx) => {
                  const max = recap.leaderboardToday[0].count || 1;
                  return (
                    <div className="leaderboard-row" key={s.id}>
                      <div className={`rank ${idx === 0 ? "top" : ""}`}>{idx === 0 ? "🏆" : `#${idx + 1}`}</div>
                      <div className="who">
                        <div className="name">{s.name}</div>
                        <div className="id">{s.id}</div>
                      </div>
                      <div className="bar-track">
                        <div className="bar-fill" style={{ width: `${(s.count / max) * 100}%` }} />
                      </div>
                      <div className="count-chip">{s.count}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </AppShell>
  );
}
