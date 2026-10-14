'use strict';
/* Zumi · features/notes */
const N = { q: '', subject: '', fav: false, sort: 'recent' };
views.notes = () => header('My Notes', 'Quick, searchable study notes.', '<button class="btn" data-act="addNote">+ New note</button>') + `
  <div class="bar-filters" role="search"><input type="search" placeholder="Search title or content" aria-label="Search notes" data-nflt="q" value="${esc(N.q)}">
  <select aria-label="Filter by subject" data-nflt="subject"><option value="">All subjects</option>${S.subjects.map(s => `<option value="${s.id}"${N.subject === s.id ? ' selected' : ''}>${esc(s.name)}</option>`).join('')}</select>
  <label class="chk"><input type="checkbox" data-nflt="fav"${N.fav ? ' checked' : ''}> Favorites only</label>
  <select aria-label="Sort notes" data-nflt="sort"><option value="recent"${N.sort === 'recent' ? ' selected' : ''}>Recently updated</option><option value="alpha"${N.sort === 'alpha' ? ' selected' : ''}>A to Z</option></select></div><div id="nList" aria-live="polite"></div>`;
function renderNList() {
  const box = $('#nList'); if (!box) return; const q = N.q.toLowerCase();
  const list = S.notes.filter(n => (!q || (n.title + ' ' + n.body).toLowerCase().includes(q)) && (!N.subject || n.subject === N.subject) && (!N.fav || n.fav))
    .sort((a, b) => N.sort === 'alpha' ? a.title.localeCompare(b.title) : b.updated - a.updated);
  if (!list.length) { box.innerHTML = `<div class="card">${S.notes.length ? empty('', 'No notes match', 'Adjust your search or filters.') : empty('', 'No notes yet', 'Capture a summary, formula or idea.', '<button class="btn" data-act="addNote">+ New note</button>')}</div>`; return; }
  box.innerHTML = `<div class="grid">${list.map(n => `<article class="card" style="border-top:8px solid ${subj(n.subject)?.color || '#d9ccf5'}"><h3>${n.fav ? ' ' : ''}${esc(n.title)}</h3><p class="chip">${esc(subjName(n.subject))}</p><p class="note-body">${esc(n.body)}</p><small class="note">Updated ${new Date(n.updated).toLocaleString()}</small><div class="acts" style="margin-top:8px"><button class="btn small ghost" data-act="favNote" data-id="${n.id}" aria-pressed="${!!n.fav}">${n.fav ? 'Unfavorite' : 'Favorite'}</button><button class="btn small ghost" data-act="editNote" data-id="${n.id}">Edit</button><button class="btn small danger" data-act="delNote" data-id="${n.id}">Delete</button></div></article>`).join('')}</div>`;
}

function noteForm(n) {
  openForm(n ? 'Edit note' : 'New note', [
    { name: 'title', label: 'Title', required: true, minLen: 2, value: n?.title, max: 80 },
    { name: 'subject', label: 'Subject', type: 'select', options: subjOptions(), value: n?.subject || '' },
    { name: 'body', label: 'Content', type: 'textarea', required: true, minLen: 3, value: n?.body, max: 5000 },
    { name: 'fav', label: 'Mark as favorite', type: 'checkbox', value: n?.fav }
  ], v => {
    if (n) Object.assign(n, v, { updated: Date.now() }); else S.notes.push({ id: uid(), ...v, updated: Date.now() });
    checkProgress(); toast(n ? 'Note updated' : 'Note added'); render();
  });
}
Object.assign(actions, {
  addNote: () => noteForm(), editNote: id => noteForm(byId(S.notes, id)),
  favNote: id => { const n = byId(S.notes, id); n.fav = !n.fav; renderNList(); },
  delNote: id => confirmBox('Delete this note?', () => { S.notes = S.notes.filter(n => n.id !== id); toast('Note deleted'); render(); }),
});
