'use strict';
/* Zumi · features/assignments */
views.assignments = () => header('Assignments', 'Plan, filter and finish your work.', '<button class="btn" data-act="addAssignment">+ Add assignment</button>') + `
  <div class="bar-filters" role="search">
   <input type="search" placeholder="Search title or description" aria-label="Search assignments" data-flt="q" value="${esc(F.q)}">
   <select aria-label="Filter by subject" data-flt="subject"><option value="">All subjects</option>${S.subjects.map(s => `<option value="${s.id}"${F.subject === s.id ? ' selected' : ''}>${esc(s.name)}</option>`).join('')}</select>
   <select aria-label="Filter by priority" data-flt="priority"><option value="">All priorities</option>${Object.entries(PRI).map(([k, v]) => `<option value="${k}"${F.priority === k ? ' selected' : ''}>${v[1]}</option>`).join('')}</select>
   <select aria-label="Filter by status" data-flt="status"><option value="">All statuses</option>${Object.entries(STAT).map(([k, v]) => `<option value="${k}"${F.status === k ? ' selected' : ''}>${v}</option>`).join('')}</select>
   <label class="chk"><input type="checkbox" data-flt="overdue"${F.overdue ? ' checked' : ''}> Overdue only</label>
   <select aria-label="Sort by" data-flt="sort"><option value="due"${F.sort === 'due' ? ' selected' : ''}>Sort: due date</option><option value="priority"${F.sort === 'priority' ? ' selected' : ''}>Sort: priority</option><option value="recent"${F.sort === 'recent' ? ' selected' : ''}>Sort: recently added</option></select>
  </div><div id="aList" aria-live="polite"></div>`;
const F = { q: '', subject: '', priority: '', status: '', overdue: false, sort: 'due' };
function renderAList() {
  const box = $('#aList'); if (!box) return; const q = F.q.toLowerCase(), rank = { high: 0, medium: 1, low: 2 };
  let list = S.assignments.filter(a => (!q || (a.title + ' ' + a.desc).toLowerCase().includes(q)) && (!F.subject || a.subject === F.subject) && (!F.priority || a.priority === F.priority) && (!F.status || a.status === F.status) && (!F.overdue || (a.status !== 'done' && daysUntil(a.due) < 0)));
  list.sort((a, b) => F.sort === 'priority' ? rank[a.priority] - rank[b.priority] || a.due.localeCompare(b.due) : F.sort === 'recent' ? b.added - a.added : a.due.localeCompare(b.due));
  if (!list.length) { box.innerHTML = `<div class="card">${S.assignments.length ? empty('', 'No matches', 'Try clearing a filter or search term.') : empty('', 'No assignments yet', 'Add one and earn XP when you complete it.', '<button class="btn" data-act="addAssignment">+ Add assignment</button>')}</div>`; return; }
  box.innerHTML = `<ul class="list">${list.map(a => `<li class="item${a.status === 'done' ? ' done' : ''}" style="--c:${subj(a.subject)?.color || '#7ec8f0'}"><div><div class="t">${esc(a.title)}</div>${a.desc ? `<p class="note-body">${esc(a.desc)}</p>` : ''}<div class="meta">${countdown(a.due, a.status === 'done')}<span class="chip">${fmtDate(a.due)}</span><span class="chip">${PRI[a.priority][0]} ${PRI[a.priority][1]} priority</span><span class="chip">${a.status === 'done' ? '' : a.status === 'progress' ? '' : ''} ${STAT[a.status]}</span><span class="chip">${esc(subjName(a.subject))}</span></div></div><div class="acts">${a.status === 'todo' ? `<button class="btn small ghost" data-act="aStart" data-id="${a.id}">Start</button>` : ''}${a.status !== 'done' ? `<button class="btn small green" data-act="aDone" data-id="${a.id}">Complete</button>` : `<button class="btn small ghost" data-act="aReopen" data-id="${a.id}">Reopen</button>`}<button class="btn small ghost" data-act="editAssignment" data-id="${a.id}">Edit</button><button class="btn small danger" data-act="delAssignment" data-id="${a.id}">Delete</button></div></li>`).join('')}</ul>`;
}

function assignmentForm(a) {
  if (!S.subjects.length && !a) toast('Tip: add a subject first to link your assignment (optional).');
  openForm(a ? 'Edit assignment' : 'Add assignment', [
    { name: 'title', label: 'Title', required: true, minLen: 2, value: a?.title, max: 80 },
    { name: 'desc', label: 'Description', type: 'textarea', value: a?.desc },
    { name: 'subject', label: 'Subject', type: 'select', options: subjOptions(), value: a?.subject || '' },
    { name: 'due', label: 'Due date', type: 'date', required: true, value: a?.due || todayIso() },
    { name: 'priority', label: 'Priority', type: 'select', options: Object.entries(PRI).map(([v, x]) => ({ v, l: x[1] })), value: a?.priority || 'medium' },
    { name: 'status', label: 'Status', type: 'select', options: Object.entries(STAT).map(([v, l]) => ({ v, l })), value: a?.status || 'todo' }
  ], v => {
    if (S.assignments.some(x => x.id !== a?.id && x.title.toLowerCase() === v.title.toLowerCase() && x.subject === v.subject && x.due === v.due)) return 'An assignment with the same title, subject and due date already exists.';
    if (a) { Object.assign(a, { title: v.title, desc: v.desc, subject: v.subject, due: v.due, priority: v.priority }); setStatus(a, v.status, true); toast('Assignment updated'); }
    else { const n = { id: uid(), added: Date.now(), title: v.title, desc: v.desc, subject: v.subject, due: v.due, priority: v.priority, status: 'todo' }; S.assignments.push(n); setStatus(n, v.status, true); toast('Assignment added'); }
    render();
  });
}
function setStatus(a, status, quiet) {
  a.status = status;
  if (status === 'done' && !S.rewarded.includes(a.id)) {
    S.rewarded.push(a.id); addXp({ high: 40, medium: 30, low: 20 }[a.priority], 'assignment completed');
  } else if (status === 'done' && !quiet) toast('Completed again – XP was already awarded for this one.');
}
Object.assign(actions, {
  addAssignment: () => assignmentForm(), editAssignment: id => assignmentForm(byId(S.assignments, id)),
  delAssignment: id => confirmBox('Delete this assignment? This cannot be undone.', () => { S.assignments = S.assignments.filter(a => a.id !== id); toast('Assignment deleted'); render(); }),
  aStart: id => { byId(S.assignments, id).status = 'progress'; render(); },
  aDone: id => { setStatus(byId(S.assignments, id), 'done'); render(); },
  aReopen: id => { byId(S.assignments, id).status = 'todo'; render(); },
});
