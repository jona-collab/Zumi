'use strict';
/* Zumi · features/analytics */
views.analytics = () => {
  const total = S.sessions.filter(x => x.type === 'focus').reduce((a, x) => a + x.min, 0), days7 = lastDays(7), st = streaks();
  const activeDays = Object.keys(S.log).filter(k => S.log[k] > 0).length, avg = activeDays ? Math.round(total / activeDays) : 0;
  const cnt = { todo: 0, progress: 0, done: 0 }; S.assignments.forEach(a => cnt[a.status]++);
  const stat = (ic, v, l) => `<div class="card stat"><div><b>${v}</b><small>${l}</small></div></div>`;
  return header('Study Analytics', 'Charts update from your current session data.') + `
  <div class="grid">${stat('', fmtMin(total), 'Total study time')}${stat('', fmtMin(avg), 'Avg per study day')}${stat('', plural(st.cur, 'day'), `Current streak (best ${st.longest})`)}${stat('', `${cnt.done}/${S.assignments.length}`, 'Assignments completed')}</div>
  <div class="grid two" style="margin-top:16px"><section class="card"><h2>Last 7 days</h2>${barChart(days7)}<br>${bar(weekMinutes(), S.goals.weekly, `Weekly goal (${fmtMin(weekMinutes())} / ${fmtMin(S.goals.weekly)})`)}</section>
  <section class="card"><h2>Study time by subject</h2>${doughnut()}</section>
  <section class="card"><h2>Assignments</h2>${stackChart(cnt)}</section></div>`;
};
function barChart(days) {
  const max = Math.max(...days.map(d => d.min), 10); if (days.every(d => !d.min)) return empty('', 'No study time yet', 'Finish a focus session to see your week.');
  return `<svg class="chart" viewBox="0 0 420 210" role="img" aria-label="Minutes studied in the last 7 days">${days.map((d, i) => { const h = d.min / max * 140, x = 14 + i * 58; return `<g tabindex="0" aria-label="${d.d.toDateString()}: ${d.min} minutes"><title>${d.d.toDateString()}: ${d.min} min</title><rect class="b" x="${x}" y="${170 - h}" width="40" height="${Math.max(h, 2)}" rx="8"/><text x="${x + 20}" y="${164 - h}" text-anchor="middle">${d.min}m</text><text x="${x + 20}" y="190" text-anchor="middle">${d.d.toLocaleDateString(undefined, { weekday: 'short' })}</text></g>`; }).join('')}</svg>`;
}
function doughnut() {
  const map = {}; S.sessions.filter(x => x.type === 'focus').forEach(x => map[x.subject] = (map[x.subject] || 0) + x.min);
  const items = Object.entries(map).map(([id, m]) => ({ name: subjName(id), m, c: subj(id)?.color || '#b0bec5' })), tot = items.reduce((a, i) => a + i.m, 0);
  if (!tot) return empty('', 'No subject data yet', 'Pick a subject in the timer and complete a focus session.');
  const R = 60, CIRC = 2 * Math.PI * R; let off = 0;
  const segs = items.map(i => { const len = i.m / tot * CIRC, s = `<circle r="${R}" cx="90" cy="90" fill="none" stroke="${esc(i.c)}" stroke-width="30" stroke-dasharray="${len} ${CIRC - len}" stroke-dashoffset="${-off}" transform="rotate(-90 90 90)"><title>${esc(i.name)}: ${i.m} min (${Math.round(i.m / tot * 100)}%)</title></circle>`; off += len; return s; }).join('');
  return `<svg class="chart" viewBox="0 0 180 180" style="max-width:240px;display:block;margin:auto" role="img" aria-label="Study time by subject">${segs}<text x="90" y="88" text-anchor="middle" style="font-size:16px;font-weight:800">${fmtMin(tot)}</text><text x="90" y="104" text-anchor="middle">total</text></svg><div class="legend">${items.map(i => `<span><i class="sw" style="background:${esc(i.c)}"></i>${esc(i.name)}: ${fmtMin(i.m)} (${Math.round(i.m / tot * 100)}%)</span>`).join('')}</div>`;
}
function stackChart(c) {
  const tot = c.todo + c.progress + c.done; if (!tot) return empty('', 'No assignments yet', 'Add assignments to track completion.');
  const col = { todo: '#ffd0b0', progress: '#fff0a8', done: '#b8e6b8' };
  return `<svg class="chart" viewBox="0 0 400 50" role="img" aria-label="Assignment status split">${(() => { let x = 0; return Object.keys(c).map(k => { const w = c[k] / tot * 400, r = `<g><title>${STAT[k]}: ${c[k]}</title><rect x="${x}" y="5" width="${w}" height="40" fill="${col[k]}" stroke="#2d3e50" stroke-width="1"/>${w > 28 ? `<text x="${x + w / 2}" y="30" text-anchor="middle">${c[k]}</text>` : ''}</g>`; x += w; return r; }).join(''); })()}</svg><div class="legend">${Object.keys(c).map(k => `<span><i class="sw" style="background:${col[k]};border:1px solid #2d3e50"></i>${STAT[k]}: ${c[k]}</span>`).join('')}</div><p><b>${Math.round(c.done / tot * 100)}%</b> completed · ${c.todo + c.progress} pending</p>`;
}
