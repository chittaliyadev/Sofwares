import { useState } from "react";
import "./App.css";
import { clearSession, getSession, resetDB, setSession } from "./lib/db";
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import FacultyDashboard from "./pages/FacultyDashboard";

export default function App() {
  const [session, setSessionState] = useState(() => getSession());
  const [resetFlash, setResetFlash] = useState(false);

  function handleLogin(user) {
    setSession(user);
    setSessionState(user);
  }

  function handleLogout() {
    clearSession();
    setSessionState(null);
  }

  function handleReset() {
    const ok = window.confirm(
      "Reset all demo data? This clears every lecture, question, and response and restores the sample data set."
    );
    if (!ok) return;
    resetDB();
    setSessionState(null);
    setResetFlash(true);
    setTimeout(() => setResetFlash(false), 2400);
  }

  if (!session) {
    return (
      <>
        <Login onLogin={handleLogin} />
        {resetFlash && <div className="toast">↺ Demo data reset</div>}
      </>
    );
  }

  if (session.role === "faculty") {
    return <FacultyDashboard user={session} onLogout={handleLogout} onReset={handleReset} />;
  }

  return <StudentDashboard user={session} onLogout={handleLogout} onReset={handleReset} />;
}
