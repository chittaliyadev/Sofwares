function initials(name) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function AppShell({ user, navItems, active, onNavigate, onLogout, onReset, children }) {
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="dot" />
          Lecture Tracker
        </div>
        <nav className="nav-group">
          {navItems.map((item) => (
            <button
              key={item.key}
              className={`nav-item ${active === item.key ? "active" : ""}`}
              onClick={() => onNavigate(item.key)}
            >
              <span className="ic">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="avatar">{initials(user.name)}</div>
            <div className="who">
              <div className="name">{user.name}</div>
              <div className="id">{user.id}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={onLogout}>
            Log out
          </button>
        </div>
      </aside>

      <div className="main">
        <div className="topbar">
          <div className="brand-mark">
            <span className="dot" />
            Lecture Tracker
          </div>
          <div className="user-chip" style={{ background: "transparent", padding: 0 }}>
            <div className="avatar" style={{ width: 30, height: 30, fontSize: 11 }}>
              {initials(user.name)}
            </div>
          </div>
        </div>

        <div className="content">{children}</div>
      </div>

      <nav className="mobile-nav">
        {navItems.map((item) => (
          <button
            key={item.key}
            className={active === item.key ? "active" : ""}
            onClick={() => onNavigate(item.key)}
          >
            <span className="ic">{item.icon}</span>
            {item.label}
          </button>
        ))}
        <button onClick={onLogout}>
          <span className="ic">⎋</span>
          Log out
        </button>
      </nav>

      {onReset && (
        <button
          className="btn btn-ghost reset-fab"
          style={{ background: "var(--surface)", boxShadow: "var(--shadow-md)" }}
          onClick={onReset}
          title="Reset all demo data"
        >
          ↺ Reset demo
        </button>
      )}
    </div>
  );
}
