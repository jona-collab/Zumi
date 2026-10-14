'use strict';
/* Zumi · core/ui */
/* ---------- shared UI pieces ---------- */
const bar = (v, max, label) => { const p = max ? Math.min(100, Math.round(v / max * 100)) : 0; return `<div class="lbl"><span>${label}</span><b>${p}%</b></div><div class="bar" role="progressbar" aria-valuenow="${p}" aria-valuemin="0" aria-valuemax="100" aria-label="${esc(label)}"><i style="width:${p}%"></i></div>`; };
const empty = (icon, title, msg, btn = '') => `<div class="empty"><h3>${title}</h3><p>${msg}</p>${btn}</div>`;
const PRI = { high: ['', 'High'], medium: ['', 'Medium'], low: ['', 'Low'] };
const STAT = { todo: 'To Do', progress: 'In Progress', done: 'Completed' };
const subjOptions = (withNone = true, sel = '') => [...(withNone ? [{ v: '', l: 'No subject' }] : []), ...S.subjects.map(s => ({ v: s.id, l: `${s.name}${s.code ? ' (' + s.code + ')' : ''}` }))];
function countdown(date, done) {
  if (done) return '<span class="chip green">Completed</span>';
  const d = daysUntil(date);
  if (d < 0) return `<span class="chip red">Overdue by ${plural(-d, 'day')}</span>`;
  if (d === 0) return '<span class="chip peach">Due today</span>';
  return `<span class="chip yellow">${d === 1 ? 'Tomorrow' : d + ' days left'}</span>`;
}
const RAINBOW_SVG = `<svg viewBox="0 0 200 100" aria-hidden="true" focusable="false">${['#ff7a6b','#ffb454','#ffe36e','#8fdc8a','#6cc4f5','#a58bf0'].map((c, i) => `<path d="M${10 + i * 8} 100 A${90 - i * 8} ${90 - i * 8} 0 0 1 ${190 - i * 8} 100" fill="none" stroke="${c}" stroke-width="8.4"/>`).join('')}</svg>`;
function islandHTML(small) {
  const grow = Math.min(1, 0.72 + level() * 0.04);
  const decos = S.placed.map(id => {
    const d = DECOR.find(x => x.id === id); if (!d) return '';
    const [px, py] = SLOTS[id] || [400, 250];
    const sc = (0.78 + (py - 205) / 90 * 0.3).toFixed(2);
    return `<span class="deco ${id}${S.newDecor === id ? ' new' : ''}" style="--dc:${d.c};left:${px / 8}%;top:${py / 4}%;--s:${sc};z-index:${2 + Math.round(py / 10)}" title="${esc(d.n)}">${id === 'rain' ? RAINBOW_SVG : `<i aria-hidden="true"></i>`}</span>`;
  }).join('');
  S.newDecor = null;
  const svg = `<svg class="isl-svg" viewBox="0 0 800 400" aria-hidden="true" focusable="false">
<defs>
<linearGradient id="gRock" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b58a5e"/><stop offset=".55" stop-color="#8a6240"/><stop offset="1" stop-color="#5e4129"/></linearGradient>
<linearGradient id="gRockL" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient>
<linearGradient id="gEdge" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fae5a"/><stop offset="1" stop-color="#3f8a4a"/></linearGradient>
<radialGradient id="gTop" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#cdf3b0"/><stop offset=".6" stop-color="#9fdc86"/><stop offset="1" stop-color="#78c26f"/></radialGradient>
<clipPath id="rockClip"><path d="M130 236 C146 300 292 326 352 378 Q400 402 448 378 C508 326 654 300 670 236 Z"/></clipPath>
</defs>
<ellipse cx="400" cy="392" rx="120" ry="7" fill="#2d3e50" opacity=".10"/>
<path d="M130 236 C146 300 292 326 352 378 Q400 402 448 378 C508 326 654 300 670 236 Z" fill="url(#gRock)"/>
<g clip-path="url(#rockClip)" fill="none" stroke-linecap="round">
<path d="M150 276 C260 300 330 292 400 312 C470 292 560 300 650 276" stroke="#5e4129" stroke-opacity=".35" stroke-width="3"/>
<path d="M205 312 C290 330 350 326 400 346 C450 326 510 330 595 312" stroke="#4a3320" stroke-opacity=".3" stroke-width="3"/>
<path d="M250 262 l22 20 M330 280 l-14 24 M470 284 l18 22 M556 262 l-20 20 M400 322 l0 24" stroke="#fff" stroke-opacity=".16" stroke-width="3"/>
</g>
<path d="M130 236 C146 300 292 326 352 378 Q400 402 448 378 C508 326 654 300 670 236 Z" fill="url(#gRockL)"/>
<path d="M352 378 q-10 24 -2 40 M448 378 q8 18 0 34" stroke="#6b4a30" stroke-width="9" stroke-linecap="round" fill="none" opacity=".0"/>
<ellipse cx="400" cy="250" rx="272" ry="70" fill="url(#gEdge)"/>
<ellipse cx="400" cy="236" rx="272" ry="70" fill="url(#gTop)"/>
<ellipse cx="400" cy="236" rx="272" ry="70" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="3"/>
<g fill="#6fbf6a" opacity=".5"><ellipse cx="250" cy="262" rx="46" ry="9"/><ellipse cx="560" cy="214" rx="40" ry="8"/><ellipse cx="420" cy="276" rx="60" ry="8"/></g>
<g stroke="#4e9a52" stroke-width="3" stroke-linecap="round" opacity=".7"><path d="M205 238 l-3 -9 M211 238 l3 -8 M590 232 l-3 -9 M597 232 l3 -8 M300 205 l-2 -7 M306 205 l3 -7 M505 270 l-3 -8 M512 270 l3 -7"/></g>
<ellipse cx="318" cy="214" rx="60" ry="12" fill="#fff" opacity=".22"/>
</svg>`;
  const hint = S.placed.length ? '' : `<p class="isl-hint">${small ? 'Study to plant your first sprout' : 'Finish a focus session to plant your first sprout'}</p>`;
  return `<div class="isl${small ? ' small' : ''}" role="img" aria-label="Your floating island at level ${level()} with ${S.placed.length} decorations"><span class="glow"></span><span class="cl cl1"></span><span class="cl cl2"></span><span class="cl cl3"></span><span class="islet"></span>${hint}<div class="island" style="--grow:${grow}"><div class="bob">${svg}${decos}</div></div></div>`;
}
function sideStats() { $('#sideStats').textContent = `Level ${level()} · ${S.xp} XP`; }

/* ---------- views ---------- */
const views = {};
const header = (title, sub, actions = '') => `<header class="ph"><div><h1 tabindex="-1">${String(title).trim().replace(/^(.*\S)\s+(\S+)$/, '<span class="lt">$1</span><br>$2')}</h1>${sub ? `<p>${sub}</p>` : ''}</div><div class="row">${actions}</div></header>`;

const byId = (arr, id) => arr.find(x => x.id === id);
const actions = {}; // each feature file registers its own actions here
