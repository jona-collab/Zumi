'use strict';
/* Zumi · features/dashboard */
views.dashboard = () => {
  const pend = S.assignments.filter(a => a.status !== 'done');
  const hr = new Date().getHours(); const greet = hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening';
  const today = S.log[todayIso()] || 0; const st = streaks();
  const exams = S.events.filter(e => daysUntil(e.date) >= 0).sort((a, b) => a.date.localeCompare(b.date));
  const upcoming = [...pend].sort((a, b) => a.due.localeCompare(b.due)).slice(0, 4);
  const notes = [...S.notes].sort((a, b) => b.updated - a.updated).slice(0, 3);
  const stat = (ic, v, l) => `<div class="card stat"><div><b>${v}</b><small>${l}</small></div></div>`;
  return header(`${greet}, ${esc(S.name)}! `, new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
    `<button class="btn ghost small" data-act="editName">Change name</button><button class="btn ghost small" data-act="goals">Edit goals</button><button class="btn ghost small" data-act="exportData">Export data</button><button class="btn ghost small" data-act="importData">Import data</button>`) + `
  <div class="grid">${stat('', S.subjects.length, 'Subjects')}${stat('', pend.length, 'Pending assignments')}${stat('', exams.length, 'Upcoming exams')}${stat('', fmtMin(today), 'Studied today')}${stat('', plural(st.cur, 'day'), 'Study streak')}${stat('', `Lv ${level()}`, `${S.xp} XP total`)}</div>
  <div class="grid two" style="margin-top:16px">
   <section class="card"><h2>Today's goals</h2>${bar(today, S.goals.daily, `Daily goal (${fmtMin(today)} of ${fmtMin(S.goals.daily)})`)}<br>${bar(weekMinutes(), S.goals.weekly, `Weekly goal (${fmtMin(weekMinutes())} of ${fmtMin(S.goals.weekly)})`)}<br>${bar(S.xp % 100, 100, `Progress to level ${level() + 1}`)}
    <h3 style="margin-top:16px">Quick actions</h3><div class="row"><button class="btn small" data-act="addAssignment">+ Assignment</button><button class="btn small green" data-act="addSubject">+ Subject</button><button class="btn small ghost" data-act="addNote">+ Note</button></div></section>
   <section class="card"><h2>My island</h2>${islandHTML(true)}<p><button class="btn small ghost" data-view-go="world">Visit My Study World</button></p></section>
   <section class="card"><h2>Upcoming tasks</h2>${upcoming.length ? `<ul class="list">${upcoming.map(a => `<li class="item" style="--c:${subj(a.subject)?.color || '#7ec8f0'}"><div><div class="t">${esc(a.title)}</div><div class="meta">${countdown(a.due)}<span class="chip">${esc(subjName(a.subject))}</span></div></div></li>`).join('')}</ul>` : empty('', 'Nothing pending', 'Add an assignment to start growing your island.')}</section>
   <section class="card"><h2>Upcoming exams & recent notes</h2>${exams.slice(0, 3).map(e => `<p> <b>${esc(e.title)}</b> · ${fmtDate(e.date)} · ${daysUntil(e.date) === 0 ? 'today!' : plural(daysUntil(e.date), 'day') + ' left'}</p>`).join('') || '<p class="note">No exams scheduled. Add one in the Calendar.</p>'}<hr>${notes.map(n => `<p> <b>${esc(n.title)}</b> <small>${esc(subjName(n.subject))}</small></p>`).join('') || '<p class="note">No notes yet.</p>'}</section>
  </div>`;
};

Object.assign(actions, {
  editName: () => openForm('Change name', [{ name: 'name', label: 'Your name', required: true, value: S.name, max: 30 }], v => { S.name = v.name; render(); }),
  goals: () => openForm('Study goals', [{ name: 'daily', label: 'Daily goal (minutes)', type: 'number', min: 5, maxN: 600, required: true, value: S.goals.daily }, { name: 'weekly', label: 'Weekly goal (minutes)', type: 'number', min: 10, maxN: 4000, required: true, value: S.goals.weekly }], v => { S.goals = { daily: +v.daily, weekly: +v.weekly }; checkProgress(); render(); }),
});
