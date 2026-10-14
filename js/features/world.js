'use strict';
/* Zumi · features/world */
views.world = () => {
  const st = streaks(), lv = level();
  return header('My Study World', 'Your island grows as you study and finish work.') + `
  <section class="card">${islandHTML(false)}
  <div class="lvl"><div class="lvl-n" aria-hidden="true"><div><small>Level</small><b>${lv}</b></div></div><div class="lvl-main"><div class="lvl-top"><b>Level ${lv} to ${lv + 1}</b><span>${S.xp % 100} / 100 XP</span></div><div class="bar" role="progressbar" aria-valuenow="${S.xp % 100}" aria-valuemin="0" aria-valuemax="100" aria-label="XP towards level ${lv + 1}"><i style="width:${S.xp % 100}%"></i></div></div></div>
  <div class="stats"><div class="xp"><span><b>${S.xp}</b><small>Total XP</small></span></div><div class="st"><span><b>${st.cur} ${st.cur === 1 ? 'day' : 'days'}</b><small>Study streak</small></span></div><div class="dc"><span><b>${S.placed.length} / ${DECOR.length}</b><small>Decorations placed</small></span></div></div></section>
  <div class="grid two" style="margin-top:16px"><section class="card"><h2>Decoration collection</h2><p class="note">Click an unlocked item to place or remove it.</p><div class="dgrid">${DECOR.map(d => { const un = S.unlocked.includes(d.id); return `<button data-act="decor" data-id="${d.id}"${un ? ` aria-pressed="${S.placed.includes(d.id)}"` : ' disabled'}><span class="sw${un ? '' : ' lock'}" aria-hidden="true">${un ? decorSVG(d.id) : ''}</span><b>${un ? esc(d.n) : '???'}</b><br><small>${un ? (S.placed.includes(d.id) ? 'Placed' : 'In storage') : 'Level ' + d.l}</small></button>`; }).join('')}</div></section>
  <section class="card"><h2>Achievements</h2><div class="dgrid">${BADGES.map(b => { const on = S.badges.includes(b.id); return `<div class="badge${on ? ' on' : ''}"><b>${b.n}</b><br><small>${b.d}</small><br><small>${on ? 'Earned' : 'Locked'}</small></div>`; }).join('')}</div>
  <h3 style="margin-top:16px">Rewards guide</h3><p class="note">Focus session: 1 XP per minute ·  Assignment: 20–40 XP (once each) · Every 100 XP = a new level and new decorations. Streak: ${st.cur} day(s), best ${st.longest}.</p></section></div>`;
};

Object.assign(actions, {
  decor: id => { S.placed = S.placed.includes(id) ? S.placed.filter(x => x !== id) : [...S.placed, id]; render(); },
});
