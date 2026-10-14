'use strict';
/* Zumi · core/rewards */
/* ---------- rewards ---------- */
function sparkle(n = 14) {
  const fx = $('#fx');
  for (let i = 0; i < n; i++) {
    const s = document.createElement('span'); s.className = 'spark';
    s.style.background = ['#ffd86b', '#f7b6d2', '#a9d7f5', '#c9b6f2'][i % 4];
    s.style.left = 10 + Math.random() * 80 + 'vw'; s.style.top = 40 + Math.random() * 40 + 'vh';
    fx.appendChild(s); setTimeout(() => s.remove(), 1400);
  }
}
function toast(msg, kind = '') {
  const t = document.createElement('div'); t.className = 'toast ' + kind; t.textContent = msg;
  $('#toasts').appendChild(t); setTimeout(() => t.remove(), 3500);
}
function checkProgress() {
  const lv = level();
  DECOR.forEach(d => {
    if (d.l <= lv && !S.unlocked.includes(d.id)) {
      S.unlocked.push(d.id); S.placed.push(d.id); S.newDecor = d.id;
      toast(`Unlocked ${d.n}!`, 'reward'); sparkle();
    }
  });
  BADGES.forEach(b => {
    if (!S.badges.includes(b.id) && b.t()) { S.badges.push(b.id); toast(`Badge earned: ${b.n}`, 'reward'); sparkle(); }
  });
}
function addXp(n, why) {
  const before = level(); S.xp += n;
  toast(`+${n} XP · ${why}`, 'reward'); checkProgress();
  if (level() > before) { toast(`Level up! You are level ${level()}`, 'reward'); sparkle(26); }
}
