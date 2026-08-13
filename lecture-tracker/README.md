# Lecture Interaction Tracker

A working prototype of a live classroom participation tool. Faculty start a
lecture, post questions, and watch answers arrive in real time. Students see
the current question for the lecture they're in and submit answers that only
they and their faculty member can see.

This is a **demo/prototype**, not a production system. There is no backend —
everything is stored in your browser's `localStorage`, so your data survives
page refreshes but stays on your device only.

## What's inside

- **Login** — separate Student and Faculty sign-in, with a demo-account panel
  on the page so you never have to remember credentials.
- **Student dashboard** — the active lecture, the current question, an answer
  box, and a private history of your own past answers.
- **Faculty dashboard** — start/end a lecture, post questions, watch a live
  "roll call" of who has answered, and see every response in a table.
- **Participation analytics** — total students/questions/responses,
  participation rate, a "🏆 Most Interactive Student" callout, and four
  charts (responses per student, participation by lecture, top participants,
  daily participation).
- **Daily recap** — a summary of today's activity plus a participation
  leaderboard.
- Fully responsive: a sidebar on desktop, a bottom tab bar on mobile.

## Install and run locally

You need [Node.js](https://nodejs.org) 18 or later.

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). To build a static
production bundle:

```bash
npm run build
npm run preview   # serve the built files locally to double-check the build
```

## Demo login credentials

| Role    | ID      | Password |
|---------|---------|----------|
| Faculty | FAC001  | 1234     |
| Student | STU001  | 1234     |
| Student | STU002  | 1234     |
| Student | STU003  | 1234     |
| Student | STU004  | 1234     |
| Student | STU005  | 1234     |

All of these are also listed on the login page itself, with a **Use** button
that fills the form for you.

## How the system works

**One data store, one browser.** All data (students, faculty, lectures,
questions, responses) lives in a single `localStorage` key. There's no
server, so two different browsers or devices each keep their **own**
independent copy of the data — that's the trade-off of a no-backend demo.

**To demo the live flow in one browser:**
1. Log in as faculty (`FAC001`), start a lecture, and post a question.
2. Log out and log back in as a student (`STU001`) — you'll see the same
   lecture and question, because you're still in the same browser.
3. Submit an answer, then log out and log back in as faculty — the response
   is already in the table, and the roll-call chip for that student has lit
   up.
4. Open the **Analytics** and **Daily Recap** tabs to see the numbers update.

The app also polls its local data every 1.5 seconds, so if you *do* open the
student and faculty views in two tabs of the *same* browser (which share
`localStorage`), changes appear automatically without a manual refresh.

**Only one lecture can be live at a time.** Starting a new lecture is
disabled while one is already running; ending it frees things up again.
Students only ever see the single currently-active lecture — there's no way
for them to browse or answer questions from a different one.

**Seed data.** The first time the app runs, it seeds itself with 6 realistic
past lectures (across all 5 subjects) with varied per-student participation,
so the charts and leaderboards aren't empty on first look. Use the **Reset
demo** button (bottom-right corner) at any time to wipe everything — live
lectures, questions, responses, and your session — and restore that original
sample data set.

## Project structure

```
src/
  lib/
    db.js         localStorage read/write + seed data
    actions.js    login, lecture lifecycle, analytics/recap calculations
    chartSetup.js Chart.js registration + shared colors
  components/
    AppShell.jsx      sidebar / bottom-nav layout shared by both dashboards
    StatusBadge.jsx   Live / Ended / No lecture badge
    charts/           the four Chart.js chart components
  pages/
    Login.jsx
    StudentDashboard.jsx
    FacultyDashboard.jsx
  App.jsx          session state + routing between login and dashboards
```

## Deploying

### Vercel
1. Push this folder to a GitHub repository.
2. Go to [vercel.com/new](https://vercel.com/new), import the repo.
3. Vercel auto-detects Vite — leave the defaults (Build Command
   `npm run build`, Output Directory `dist`) and click **Deploy**.

### GitHub Pages
1. `npm install -D gh-pages`
2. Add to `package.json`:
   ```json
   "homepage": "https://<your-username>.github.io/<repo-name>",
   "scripts": { "deploy": "vite build && gh-pages -d dist" }
   ```
3. In `vite.config.js`, set `base: "/<repo-name>/"`.
4. Run `npm run deploy`.

### Any static host (Netlify, Cloudflare Pages, S3, etc.)
Run `npm run build` and upload the contents of the generated `dist/` folder —
it's a fully static site with no server requirements.

## Notes on scope

This build intentionally leaves out things a real deployment would need:
accounts/passwords stored securely, a real database, multi-device sync,
notifications, and role/permission management beyond the two demo roles. It's
built to demonstrate the *concept* — the interaction loop between faculty and
students — clearly and reliably in a single browser session.
