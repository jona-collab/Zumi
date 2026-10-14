'use strict';
/* Zumi · app */
let current = 'dashboard';


/* ---------- navigation & rendering ---------- */
function render() {
  $('#view').innerHTML = views[current]();
  renderAList(); renderNList(); timerUI(); sideStats(); saveNow();
  $$('#nav button').forEach(b => b.toggleAttribute('aria-current', b.dataset.view === current));
  $$('#nav button').forEach(b => { if (b.dataset.view === current) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
}
function go(v) { current = v; render(); $('#view h1')?.focus({ preventScroll: true }); window.scrollTo(0, 0); }

Object.assign(actions, {
  reset: () => confirmBox('Reset the session? All subjects, assignments, notes, XP and decorations will be cleared.', () => { clearInterval(T.iv); Object.assign(T, { running: false, mode: 'focus', remaining: T.dur.focus * 60, total: T.dur.focus * 60, history: [], cycle: 0, subject: '' }); const keepName = S.name; S = initState(); S.name = keepName; saveNow(); Object.assign(F, { q: '', subject: '', priority: '', status: '', overdue: false }); Object.assign(N, { q: '', subject: '', fav: false }); toast('Session reset – fresh start!'); go('dashboard'); }, 'Reset'),
});


document.addEventListener('click', e => {
  if (e.target.closest('[data-close]')) return closeDlg();
  const nav = e.target.closest('[data-view]'); if (nav) return go(nav.dataset.view);
  const g = e.target.closest('[data-view-go]'); if (g) return go(g.dataset.viewGo);
  const b = e.target.closest('[data-act]'); if (b && actions[b.dataset.act]) actions[b.dataset.act](b.dataset.id, b);
});
const onFilter = e => {
  const t = e.target, v = t.type === 'checkbox' ? t.checked : t.value;
  if (t.dataset.flt) { F[t.dataset.flt] = v; renderAList(); }
  else if (t.dataset.nflt) { N[t.dataset.nflt] = v; renderNList(); }
  else if (t.dataset.tset) {
    const k = t.dataset.tset;
    if (k === 'subject') T.subject = v;
    else { const n = Math.min(180, Math.max(1, parseInt(v, 10) || T.dur[k])); T.dur[k] = n; if (k === T.mode && !T.running) { T.total = T.remaining = n * 60; } timerUI(); }
  }
};
document.addEventListener('input', onFilter); document.addEventListener('change', onFilter);
document.addEventListener('visibilitychange', () => { if (!document.hidden && T.running) tick(); });
$$('dialog').forEach(d => d.addEventListener('click', e => { if (e.target === d && d.id === 'dlg') d.close(); }));

Object.assign(actions, { exportData, importData });
document.querySelector('a[href="login.html"]')?.addEventListener('click', () => { saveNow(); sessionStorage.removeItem('zumi.session'); });
setInterval(saveNow, 4000); addEventListener('pagehide', saveNow); addEventListener('beforeunload', saveNow);
loadData();
render();
