import { useState } from "react";
import { login } from "../lib/actions";

const DEMO_ACCOUNTS = {
  faculty: [{ id: "FAC001", label: "Dr. Meera Shah" }],
  student: [
    { id: "STU001", label: "Dev Patel" },
    { id: "STU002", label: "Rahul Verma" },
    { id: "STU003", label: "Jay Mehta" },
    { id: "STU004", label: "Krisha Shah" },
    { id: "STU005", label: "Ananya Iyer" },
  ],
};

export default function Login({ onLogin }) {
  const [role, setRole] = useState("student");
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!id.trim() || !password.trim()) {
      setError("Enter both an ID and a password.");
      return;
    }
    setSubmitting(true);
    const result = login(role, id, password);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onLogin(result.user);
  }

  function fillDemo(demoId) {
    setId(demoId);
    setPassword("1234");
    setError("");
  }

  return (
    <div className="login-screen">
      <div className="login-hero">
        <div className="brand-mark">
          <span className="dot" />
          Lecture Interaction Tracker
        </div>

        <div className="hero-copy">
          <h1>Know who's actually with you in the room.</h1>
          <p>
            Start a lecture, ask a live question, and watch responses land in real time — one
            dashboard for faculty, one focused view for students, zero setup.
          </p>
        </div>

        <div>
          <div className="hero-stats">
            <div className="stat">
              <b>5</b>
              <span>Subjects tracked</span>
            </div>
            <div className="stat">
              <b>1</b>
              <span>Lecture live at a time</span>
            </div>
            <div className="stat">
              <b>100%</b>
              <span>Runs on your device</span>
            </div>
          </div>
          <p className="hero-footnote" style={{ marginTop: 22 }}>
            Prototype build — all data is stored locally in this browser.
          </p>
        </div>
      </div>

      <div className="login-panel">
        <div className="login-card">
          <h2>Sign in</h2>
          <p className="login-sub">Choose your role to continue to your dashboard.</p>

          <div className="role-toggle">
            <button
              type="button"
              className={role === "student" ? "active" : ""}
              onClick={() => {
                setRole("student");
                setError("");
              }}
            >
              Student Login
            </button>
            <button
              type="button"
              className={role === "faculty" ? "active" : ""}
              onClick={() => {
                setRole("faculty");
                setError("");
              }}
            >
              Faculty Login
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {error && <div className="form-error">{error}</div>}

            <div className="field">
              <label htmlFor="id">{role === "faculty" ? "Faculty ID" : "Student ID"}</label>
              <input
                id="id"
                autoComplete="username"
                placeholder={role === "faculty" ? "e.g. FAC001" : "e.g. STU001"}
                value={id}
                onChange={(e) => setId(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? "Signing in…" : `Log in as ${role === "faculty" ? "Faculty" : "Student"}`}
            </button>
          </form>

          <div className="demo-box">
            <h4>Demo accounts</h4>
            {DEMO_ACCOUNTS[role].map((acc) => (
              <div className="demo-row" key={acc.id}>
                <span>
                  {acc.id} — {acc.label}
                </span>
                <button type="button" onClick={() => fillDemo(acc.id)}>
                  Use
                </button>
              </div>
            ))}
            <div className="demo-row" style={{ color: "var(--slate)" }}>
              <span>Password for every account</span>
              <span>1234</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
