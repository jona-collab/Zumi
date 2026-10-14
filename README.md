# Zumi: Grow Your Study World

Zumi is a student planner that turns studying into a game. Students track subjects, assignments, exams and notes, run focus timers, and earn XP that grows a small floating island with decorations and achievements.

**Live demo:** https://jona-collab.github.io/zumii/
**Author:** Jonabie Piodo. INF242


- **Sign-up and login** with validated forms and hashed passwords. A "Continue as guest" option is also available.
- **Dashboard** with study stats, daily and weekly goal progress, upcoming tasks and exams, and a preview of your island.
- **My Subjects:** add, edit, view and delete courses, with progress bars per subject.
- **Assignments:** add, edit, delete, filter (subject, priority, status, overdue), search and sort. Completing an assignment earns XP.
- **Calendar:** monthly view showing assignment due dates and exams, plus a "next 30 days" list.
- **Study Timer:** focus, short break and long break modes with a progress ring, custom durations, subject selection and a session history. Focus time earns 1 XP per minute.
- **My Study World:** every 100 XP is a new level that unlocks island decorations and achievements.
- **Analytics:** study time per day, time per subject, assignment completion and streaks.
- **My Notes:** create, edit, favorite, search and filter notes by subject.


| Technology | Purpose |
|---|---|
| HTML5 | Page structure, semantic elements, native `<dialog>` for forms |
| CSS3 | Custom theme, Flexbox and Grid layouts, responsive design, animations |
| JavaScript (ES6) | All app logic, rendering, validation, timer, charts (inline SVG) |
| Web Storage and Web Crypto APIs | Saving data, session handling, password hashing |
| Google Fonts | Inter Tight typeface |

No frameworks or build tools are needed.


1. Download or clone this repository.
2. Open `login.html` in any modern browser (Chrome, Edge, Firefox, Safari).
3. Create an account (valid email, 8+ character password with a letter and a number), or press **Continue as guest**.

Or visit the live demo link above.


Zumi/
├── index.html        # Main app shell (navigation + views)
├── login.html        # Login / sign-up screen
├── css/              # base, theme (dreamy.css), calendar, timer, world, charts, responsive
└── js/
    ├── app.js        # Navigation, rendering, global actions
    ├── login.js      # Sign-up / log-in logic, validation, password hashing
    ├── core/         # state, storage, helpers, dialogs, UI pieces, rewards, auth
    └── features/     # dashboard, subjects, assignments, calendar, timer, world, analytics, notes
```


**Storage (`js/core/storage.js`)**
- All study data is saved automatically to the browser's `localStorage`, one record per user (`zumi.data.<email>`), so it survives refreshes and restarts. It saves after every change, every 4 seconds, and when the page closes.
- Accounts are stored in `zumi.users`. Passwords are never stored in plain text: each one is salted and hashed with SHA-256 (Web Crypto API). The signed-in user lives in `sessionStorage` and ends on log out.
- **Export data / Import data** on the dashboard download and restore a JSON backup.
- Every time data is loaded or imported it passes through `sanitize()`, which rebuilds the state from scratch: wrong types, duplicate IDs, impossible dates, unknown priorities or statuses, oversized text and broken subject links are dropped or corrected, and numbers are clamped to safe ranges. Unreadable data is backed up and reset instead of crashing the app.

**Validation**
- *Sign-up:* display name (2+ characters, allowed characters only), valid email format, password of 8+ characters with a letter and a number and no spaces, matching confirmation, and a duplicate-email check.
- *Log-in:* credentials are checked against the stored hash; the error message does not reveal whether the email exists.
- *Forms (subjects, assignments, exams, notes, goals):* required fields, minimum and maximum lengths, character patterns for course codes and instructor names, real calendar dates between 2000 and 2100, whole numbers within a range for goals, allowed values for dropdowns and colours, and duplicate checks for subjects, assignments and exams. Errors appear next to the field when you leave it and again on submit.
- Whitespace is normalised and control characters are stripped. User text is HTML-escaped before it is displayed, which prevents HTML injection.


- Data lives in one browser on one device. Clearing the browser's site data deletes it, so use Export data for backups.
- Accounts are local (there is no server), so this is not secure authentication.


- Real user accounts and cloud sync with a backend database.
- Reminders and notifications for due dates.


Visual layout inspired by a lime-and-black mobile UI concept. Built for IPT.
