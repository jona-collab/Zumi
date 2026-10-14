'use strict';
/* Zumi · features/subjects */
views.subjects = () => header('My Subjects', 'Courses you are working on.', '<button class="btn" data-act="addSubject">+ Add subject</button>') +
  (S.subjects.length ? `<div class="grid">${S.subjects.map(s => {
    const as = S.assignments.filter(a => a.subject === s.id), dn = as.filter(a => a.status === 'done').length;
    return `<article class="card" style="border-top:10px solid ${esc(s.color)}"><h2>${esc(s.name)}</h2><p class="chip">${esc(s.code || 'No code')}</p><p>${esc(s.instructor || 'Instructor not set')}</p>${bar(dn, as.length, `Assignments done (${dn}/${as.length})`)}<p>Study time: <b>${fmtMin(subjMinutes(s.id))}</b></p><div class="acts"><button class="btn small ghost" data-act="viewSubject" data-id="${s.id}">View</button><button class="btn small ghost" data-act="editSubject" data-id="${s.id}">Edit</button><button class="btn small danger" data-act="delSubject" data-id="${s.id}">Delete</button></div></article>`;
  }).join('')}</div>` : `<div class="card">${empty('', 'No subjects yet', 'Add your first subject to organize assignments, notes and study time.', '<button class="btn" data-act="addSubject">+ Add subject</button>')}</div>`);

function subjectForm(s) {
  openForm(s ? 'Edit subject' : 'Add subject', [
    { name: 'name', label: 'Subject name', required: true, minLen: 2, value: s?.name, max: 60 },
    { name: 'code', label: 'Course code', value: s?.code, max: 20, pattern: /^[A-Za-z0-9][A-Za-z0-9 \-_.\/]*$/, patternMsg: 'Course code may use letters, numbers, spaces and - _ . / only.' },
    { name: 'instructor', label: 'Instructor', value: s?.instructor, max: 60, pattern: /^[\p{L}][\p{L} .,'\-]*$/u, patternMsg: 'Instructor name may contain letters, spaces and . , \' - only.' },
    { name: 'color', label: 'Color', type: 'color', value: s?.color || COLORS[S.subjects.length % COLORS.length] },
    { name: 'description', label: 'Description', type: 'textarea', value: s?.description }
  ], v => {
    if (S.subjects.some(x => x.id !== s?.id && x.name.toLowerCase() === v.name.toLowerCase())) return 'A subject with this name already exists.';
    if (s) Object.assign(s, v); else S.subjects.push({ id: uid(), ...v });
    checkProgress(); toast(s ? 'Subject updated' : 'Subject added'); render();
  });
}
Object.assign(actions, {
  addSubject: () => subjectForm(), editSubject: id => subjectForm(byId(S.subjects, id)),
  viewSubject: id => { const s = byId(S.subjects, id), as = S.assignments.filter(a => a.subject === id); showInfo(`<h2 id="dlgTitle">${esc(s.name)} <small>${esc(s.code)}</small></h2><p>${esc(s.instructor || 'Not set')}</p><p class="note-body">${esc(s.description || 'No description.')}</p><p>Study time: <b>${fmtMin(subjMinutes(id))}</b> · ${S.notes.filter(n => n.subject === id).length} notes</p><h3>Assignments</h3>${as.length ? `<ul class="list">${as.map(a => `<li class="item"><span>${esc(a.title)}</span>${countdown(a.due, a.status === 'done')}</li>`).join('')}</ul>` : '<p class="note">None yet.</p>'}`); },
  delSubject: id => confirmBox('Delete this subject and its assignments? Notes will be kept without a subject.', () => { S.subjects = S.subjects.filter(s => s.id !== id); S.assignments = S.assignments.filter(a => a.subject !== id); S.notes.forEach(n => { if (n.subject === id) n.subject = ''; }); S.events.forEach(e => { if (e.subject === id) e.subject = ''; }); toast('Subject deleted'); render(); }),
});
