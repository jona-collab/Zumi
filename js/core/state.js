'use strict';
/* Zumi · core/state */
/* ---------- state ---------- */
const COLORS = ['#7ec8f0', '#a8dba8', '#ffc9a3', '#c9b6f2', '#ffe27a', '#f6a8c0'];
const DECOR = [
  { id: 'sprout', c: '#6cc16a', n: 'Sprout', l: 1 }, { id: 'daisy', c: '#fff2a8', n: 'Daisy', l: 1 },
  { id: 'tulip', c: '#f58fb1', n: 'Tulip', l: 2 }, { id: 'tree', c: '#3f8a4a', n: 'Oak tree', l: 2 },
  { id: 'shroom', c: '#e86a6a', n: 'Mushroom', l: 3 }, { id: 'sun', c: '#ffc83d', n: 'Sunflower', l: 3 },
  { id: 'house', c: '#e9b98a', n: 'Cottage', l: 4 }, { id: 'bfly', c: '#a58bf0', n: 'Butterfly', l: 4 },
  { id: 'fount', c: '#7ec8f0', n: 'Fountain', l: 5 }, { id: 'rain', c: '#ffb454', n: 'Rainbow', l: 6 },
  { id: 'fox', c: '#f0974a', n: 'Fox', l: 7 }, { id: 'bloom', c: '#f7b6d2', n: 'Blossom tree', l: 8 }
];
const SLOTS = { house: [400,208], bfly: [345,196], sun: [572,232], tree: [208,248], sprout: [322,238], daisy: [468,236], tulip: [512,262], shroom: [288,278], fount: [410,266], fox: [528,284], bloom: [618,252], rain: [400,150] }; /* base points of each decoration in an 800x400 island box */
const BADGES = [
  { id: 'b1', n: 'First Focus', d: 'Finish a focus session', t: () => S.sessions.some(x => x.type === 'focus') },
  { id: 'b2', n: 'Task Tamer', d: 'Complete an assignment', t: () => S.rewarded.length >= 1 },
  { id: 'b3', n: 'Collector', d: 'Add 3 subjects', t: () => S.subjects.length >= 3 },
  { id: 'b4', n: 'Note Taker', d: 'Write 3 notes', t: () => S.notes.length >= 3 },
  { id: 'b5', n: '100 XP', d: 'Earn 100 XP', t: () => S.xp >= 100 },
  { id: 'b6', n: '3-Day Streak', d: 'Study 3 days in a row', t: () => streaks().longest >= 3 },
  { id: 'b7', n: 'Goal Getter', d: 'Reach your daily goal', t: () => (S.log[todayIso()] || 0) >= S.goals.daily }
];
const initState = () => ({
  name: 'Student', subjects: [], assignments: [], events: [], notes: [], sessions: [], log: {},
  xp: 0, rewarded: [], unlocked: [], placed: [], badges: [], goals: { daily: 60, weekly: 300 }
});
let S = initState();
const level = () => Math.floor(S.xp / 100) + 1;
const subj = id => S.subjects.find(s => s.id === id);
const subjName = id => subj(id)?.name || (id ? 'Deleted subject' : 'No subject');
const subjMinutes = id => S.sessions.filter(x => x.type === 'focus' && x.subject === id).reduce((a, x) => a + x.min, 0);

function streaks() {
  const days = Object.keys(S.log).filter(k => S.log[k] > 0).sort();
  let longest = 0, run = 0, prev = null;
  days.forEach(k => { run = prev && diffDays(prev, k) === 1 ? run + 1 : 1; longest = Math.max(longest, run); prev = k; });
  let cur = 0; const d = new Date();
  if (!(S.log[iso(d)] > 0)) d.setDate(d.getDate() - 1);
  while (S.log[iso(d)] > 0) { cur++; d.setDate(d.getDate() - 1); }
  return { cur, longest };
}
function lastDays(n) {
  return Array.from({ length: n }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (n - 1 - i)); return { k: iso(d), d, min: S.log[iso(d)] || 0 }; });
}
function weekMinutes() {
  const d = new Date(); const dow = (d.getDay() + 6) % 7; d.setDate(d.getDate() - dow);
  let t = 0; for (let i = 0; i < 7; i++) { t += S.log[iso(d)] || 0; d.setDate(d.getDate() + 1); } return t;
}
