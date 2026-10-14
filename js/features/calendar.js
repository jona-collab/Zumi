'use strict';
/* Zumi · features/calendar */
const C = { y: new Date().getFullYear(), m: new Date().getMonth(), sel: todayIso() };
function eventsOn(k) {
  return [...S.assignments.filter(a => a.due === k).map(a => ({ kind: 'as', id: a.id, title: a.title, done: a.status === 'done', subject: a.subject })),
    ...S.events.filter(e => e.date === k).map(e => ({ kind: 'ex', id: e.id, title: e.title, subject: e.subject }))];
}
views.calendar = () => {
  const first = new Date(C.y, C.m, 1), dim = new Date(C.y, C.m + 1, 0).getDate(), start = first.getDay();
  const cells = []; for (let i = 0; i < start; i++) { const d = new Date(C.y, C.m, 1 - (start - i)); cells.push({ d, out: true }); }
  for (let i = 1; i <= dim; i++) cells.push({ d: new Date(C.y, C.m, i) });
  while (cells.length % 7) cells.push({ d: new Date(C.y, C.m + 1, cells.length - start - dim + 1), out: true });
  const t = todayIso();
  const grid = cells.map(c => { const k = iso(c.d), ev = eventsOn(k), a = ev.filter(e => e.kind === 'as').length, x = ev.filter(e => e.kind === 'ex').length;
    return `<button data-act="selDate" data-id="${k}" class="${c.out ? 'out ' : ''}${k === t ? 'today ' : ''}${k === C.sel ? 'sel' : ''}" aria-label="${c.d.toDateString()}: ${plural(a, 'assignment')}, ${plural(x, 'exam')}"${k === C.sel ? ' aria-pressed="true"' : ''}>${c.d.getDate()}${a ? `<span class="ev as">${a}</span>` : ''}${x ? `<span class="ev ex">${x}</span>` : ''}</button>`; }).join('');
  const sel = eventsOn(C.sel);
  const soon = []; for (let i = 0; i <= 30; i++) { const d = new Date(); d.setDate(d.getDate() + i); eventsOn(iso(d)).filter(e => !e.done).forEach(e => soon.push({ ...e, date: iso(d) })); }
  return header(`${new Date(C.y, C.m).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })} `, 'Assignments () and exams ().',
    `<button class="btn ghost small" data-act="prevM" aria-label="Previous month">Prev</button><button class="btn ghost small" data-act="todayM">Today</button><button class="btn ghost small" data-act="nextM" aria-label="Next month">Next</button><button class="btn small" data-act="addExam">+ Add exam</button>`) + `
  <div class="grid two"><section class="card"><div class="cal" role="group" aria-label="Calendar">${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => `<div class="dow">${d}</div>`).join('')}${grid}</div></section>
  <section class="card"><h2>${fmtDate(C.sel)}</h2>${sel.length ? `<ul class="list">${sel.map(e => `<li class="item" style="--c:${e.kind === 'ex' ? '#c9b6f2' : '#7ec8f0'}"><div><div class="t">${e.kind === 'ex' ? 'Exam: ' : 'Due: '}${esc(e.title)}</div><div class="meta"><span class="chip">${esc(subjName(e.subject))}</span>${e.kind === 'ex' ? `<span class="chip yellow">${daysUntil(C.sel) < 0 ? 'Past' : daysUntil(C.sel) === 0 ? 'Today' : plural(daysUntil(C.sel), 'day') + ' to go'}</span>` : countdown(C.sel, e.done)}</div></div>${e.kind === 'ex' ? `<div class="acts"><button class="btn small ghost" data-act="editExam" data-id="${e.id}">Edit</button><button class="btn small danger" data-act="delExam" data-id="${e.id}">Delete</button></div>` : ''}</li>`).join('')}</ul>` : empty('', 'Nothing scheduled', 'Pick another date or add an exam.', '<button class="btn small" data-act="addExam">+ Add exam</button>')}</section></div>
  <section class="card" style="margin-top:16px"><h2>Next 30 days</h2>${soon.length ? `<ul class="list">${soon.map(e => `<li class="item" style="--c:${e.kind === 'ex' ? '#c9b6f2' : '#7ec8f0'}"><span>${e.kind === 'ex' ? '' : ''} <b>${esc(e.title)}</b></span><span class="chip">${fmtDate(e.date)} · ${daysUntil(e.date) === 0 ? 'today' : plural(daysUntil(e.date), 'day')}</span></li>`).join('')}</ul>` : '<p class="note">No upcoming events in the next 30 days.</p>'}</section>`;
};

/* Pomodoro timer */
function examForm(e) {
  openForm(e ? 'Edit exam' : 'Add exam', [
    { name: 'title', label: 'Exam title', required: true, minLen: 2, value: e?.title, max: 80 },
    { name: 'date', label: 'Exam date', type: 'date', required: true, value: e?.date || C.sel },
    { name: 'subject', label: 'Subject', type: 'select', options: subjOptions(), value: e?.subject || '' }
  ], v => { if (S.events.some(x => x.id !== e?.id && x.title.toLowerCase() === v.title.toLowerCase() && x.date === v.date)) return 'This exam is already on the calendar for that date.'; if (e) Object.assign(e, v); else S.events.push({ id: uid(), ...v }); C.sel = v.date; C.y = parse(v.date).getFullYear(); C.m = parse(v.date).getMonth(); toast(e ? 'Exam updated' : 'Exam added'); render(); });
}
Object.assign(actions, {
  addExam: () => examForm(), editExam: id => examForm(byId(S.events, id)),
  delExam: id => confirmBox('Delete this exam event?', () => { S.events = S.events.filter(e => e.id !== id); toast('Exam deleted'); render(); }),
  selDate: id => { C.sel = id; const d = parse(id); C.y = d.getFullYear(); C.m = d.getMonth(); render(); $(`[data-id="${id}"]`)?.focus(); },
  prevM: () => { C.m--; if (C.m < 0) { C.m = 11; C.y--; } render(); },
  nextM: () => { C.m++; if (C.m > 11) { C.m = 0; C.y++; } render(); },
  todayM: () => { const d = new Date(); C.y = d.getFullYear(); C.m = d.getMonth(); C.sel = todayIso(); render(); },
});
