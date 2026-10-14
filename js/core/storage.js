'use strict';
/* Zumi · core/storage: saving, loading and validating data (localStorage) */
const STORE_VER = 1, LIMITS = { name: 60, title: 80, text: 2000, note: 5000, code: 20 };
let STORE_KEY = null;
const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } },
  del(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } }
};

/* ---- validation helpers ---- */
const isRealDate = s => { if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false; const d = parse(s); return iso(d) === s && d.getFullYear() >= 2000 && d.getFullYear() <= 2100; };
const clean = v => v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim();
const str = (v, max, min = 0) => { if (typeof v !== 'string') return min ? null : ''; const c = clean(v); return c.length >= min ? c.slice(0, max) : null; };
const int = (v, lo, hi, d) => { v = Math.round(Number(v)); return Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d; };
const oneOf = (v, list, d) => (list.includes(v) ? v : d);

/* Rebuilds a clean state from untrusted data (storage or imported file). Bad records are dropped and counted. */
function sanitize(raw) {
  const out = initState(); let dropped = 0;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { state: out, dropped: 1, ok: false };
  const list = (a, fn) => (Array.isArray(a) ? a : []).map(x => { const r = x && typeof x === 'object' ? fn(x) : null; if (!r) dropped++; return r; }).filter(Boolean);
  const seen = new Set(), id = x => { const v = str(x, 40, 1); if (!v || seen.has(v)) return null; seen.add(v); return v; };
  out.name = str(raw.name, 30, 1) || 'Student';
  out.subjects = list(raw.subjects, s => { const i = id(s.id), n = str(s.name, LIMITS.name, 1); return i && n ? { id: i, name: n, code: str(s.code, LIMITS.code) || '', instructor: str(s.instructor, LIMITS.name) || '', color: /^#[0-9a-f]{6}$/i.test(s.color) ? s.color : COLORS[0], description: str(s.description, LIMITS.text) || '' } : null; });
  const sid = new Set(out.subjects.map(s => s.id)), subjRef = v => (sid.has(v) ? v : '');
  out.assignments = list(raw.assignments, a => { const i = id(a.id), t = str(a.title, LIMITS.title, 1); return i && t && isRealDate(a.due) ? { id: i, title: t, desc: str(a.desc, LIMITS.text) || '', subject: subjRef(a.subject), due: a.due, priority: oneOf(a.priority, ['high', 'medium', 'low'], 'medium'), status: oneOf(a.status, ['todo', 'progress', 'done'], 'todo'), added: int(a.added, 0, 4e12, Date.now()) } : null; });
  out.events = list(raw.events, e => { const i = id(e.id), t = str(e.title, LIMITS.title, 1); return i && t && isRealDate(e.date) ? { id: i, title: t, date: e.date, subject: subjRef(e.subject) } : null; });
  out.notes = list(raw.notes, n => { const i = id(n.id), t = str(n.title, LIMITS.title, 1), b = str(n.body, LIMITS.note, 1); return i && t && b ? { id: i, title: t, body: b, subject: subjRef(n.subject), fav: n.fav === true, updated: int(n.updated, 0, 4e12, Date.now()) } : null; });
  out.sessions = list(raw.sessions, s => (s.type === 'focus' ? { type: 'focus', min: int(s.min, 1, 600, 0) || null, subject: subjRef(s.subject), at: int(s.at, 0, 4e12, Date.now()) } : null)).filter(s => s.min);
  Object.keys(raw.log && typeof raw.log === 'object' ? raw.log : {}).forEach(k => { if (isRealDate(k)) out.log[k] = int(raw.log[k], 0, 1440, 0); else dropped++; });
  out.xp = int(raw.xp, 0, 1e6, 0);
  const ids = arr => [...new Set((Array.isArray(arr) ? arr : []).filter(x => typeof x === 'string'))];
  out.rewarded = ids(raw.rewarded).slice(0, 5000);
  out.unlocked = ids(raw.unlocked).filter(x => DECOR.some(d => d.id === x));
  out.placed = ids(raw.placed).filter(x => out.unlocked.includes(x));
  out.badges = ids(raw.badges).filter(x => BADGES.some(b => b.id === x));
  const g = raw.goals || {}; out.goals = { daily: int(g.daily, 5, 600, 60), weekly: int(g.weekly, 10, 4000, 300) };
  return { state: out, dropped, ok: true };
}

/* ---- save / load ---- */
function useStorageFor(email) { STORE_KEY = 'zumi.data.' + String(email).toLowerCase(); }
function saveNow() {
  if (!STORE_KEY) return false;
  const ok = store.set(STORE_KEY, JSON.stringify({ v: STORE_VER, savedAt: Date.now(), data: S }, (k, v) => (k === 'newDecor' ? undefined : v)));
  if (!ok && !saveNow.warned) { saveNow.warned = true; toast('Could not save: browser storage is full or disabled.'); }
  return ok;
}
function loadData() {
  const txt = STORE_KEY && store.get(STORE_KEY); if (!txt) return;
  try {
    const p = JSON.parse(txt);
    if (!p || p.v !== STORE_VER) throw new Error('version');
    const r = sanitize(p.data); if (!r.ok) throw new Error('shape');
    S = r.state; if (r.dropped) toast(`Loaded saved data. ${plural(r.dropped, 'invalid record')} removed.`);
  } catch (e) { store.set(STORE_KEY + '.backup', txt); toast('Saved data was unreadable and was reset (a backup was kept).'); }
}

/* ---- backup: export / import a JSON file ---- */
function exportData() {
  const blob = new Blob([JSON.stringify({ v: STORE_VER, app: 'zumi', exported: new Date().toISOString(), data: S }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `zumi-backup-${todayIso()}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  toast('Backup downloaded');
}
function importData() {
  const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'application/json,.json';
  inp.onchange = () => {
    const f = inp.files[0]; if (!f) return;
    if (f.size > 1e6) return toast('That file is too large (max 1 MB).');
    const rd = new FileReader();
    rd.onload = () => {
      let r; try { const p = JSON.parse(rd.result); if (!p || p.app !== 'zumi' || p.v !== STORE_VER) throw new Error(); r = sanitize(p.data); if (!r.ok) throw new Error(); } catch (e) { return toast('Import failed: this is not a valid Zumi backup.'); }
      const s = r.state;
      confirmBox(`Replace your current data with this backup (${plural(s.subjects.length, 'subject')}, ${plural(s.assignments.length, 'assignment')}, ${plural(s.notes.length, 'note')})?${r.dropped ? ' ' + plural(r.dropped, 'invalid record') + ' will be skipped.' : ''}`, () => { S = s; saveNow(); render(); toast('Backup imported'); }, 'Import');
    };
    rd.readAsText(f);
  };
  inp.click();
}
