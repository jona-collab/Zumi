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

/* ---------- island decorations drawn as small SVG illustrations (no emoji) ---------- */
function decorSVG(id) {
  const petals = (cx, cy, n, rx, ry, dist, fill) => Array.from({ length: n }, (_, i) => `<ellipse cx="${cx}" cy="${cy - dist}" rx="${rx}" ry="${ry}" fill="${fill}" transform="rotate(${i * 360 / n} ${cx} ${cy})"/>`).join('');
  const stem = (h = 14) => `<path d="M20 38 V${h}" stroke="#3f8a4a" stroke-width="2.4" stroke-linecap="round" fill="none"/>`;
  const leaf = `<ellipse cx="14" cy="30" rx="5" ry="2.4" fill="#5fae5a" transform="rotate(-25 14 30)"/><ellipse cx="26" cy="27" rx="5" ry="2.4" fill="#6cc16a" transform="rotate(25 26 27)"/>`;
  const art = {
    sprout: `${stem(22)}<ellipse cx="13" cy="22" rx="7" ry="3.4" fill="#6cc16a" transform="rotate(-30 13 22)"/><ellipse cx="27" cy="20" rx="7" ry="3.4" fill="#8fdc8a" transform="rotate(30 27 20)"/>`,
    daisy: `${stem(16)}${leaf}${petals(20, 14, 9, 2.6, 5.4, 6.4, '#fff')}<circle cx="20" cy="14" r="3.6" fill="#ffc83d"/>`,
    tulip: `${stem(18)}${leaf}<path d="M11 8 Q10 25 20 25 Q30 25 29 8 L24.5 14 L20 6 L15.5 14 Z" fill="#f58fb1"/><path d="M20 6 L24.5 14 L20 25 L15.5 14 Z" fill="#ee6f9b"/>`,
    tree: `<rect x="17.5" y="24" width="5" height="14" rx="1.5" fill="#8a6240"/><circle cx="20" cy="15" r="11" fill="#3f8a4a"/><circle cx="13" cy="20" r="7" fill="#4c9d54"/><circle cx="27" cy="20" r="7" fill="#4c9d54"/><circle cx="17" cy="11" r="3.5" fill="#6cc16a" opacity=".7"/>`,
    shroom: `<path d="M16 38 L17 25 H23 L24 38 Z" fill="#f6ead8"/><path d="M6 26 Q6 10 20 10 Q34 10 34 26 Z" fill="#e86a6a"/><circle cx="14" cy="20" r="2.6" fill="#fff"/><circle cx="23" cy="16" r="2.2" fill="#fff"/><circle cx="28" cy="22" r="2" fill="#fff"/>`,
    sun: `${stem(16)}${leaf}${petals(20, 14, 14, 2.3, 5, 7.4, '#ffc83d')}<circle cx="20" cy="14" r="5" fill="#8a5a2b"/><circle cx="20" cy="14" r="2.6" fill="#6b4220"/>`,
    house: `<rect x="7" y="19" width="26" height="19" rx="2" fill="#f3dcc0"/><path d="M3 21 L20 6 L37 21 Z" fill="#d9654f"/><rect x="17" y="27" width="7" height="11" rx="1.5" fill="#8a6240"/><rect x="9.5" y="23" width="5.5" height="5.5" rx="1" fill="#9ed6f5"/><rect x="26" y="23" width="5.5" height="5.5" rx="1" fill="#9ed6f5"/><rect x="27" y="9" width="4" height="8" fill="#a8654a"/>`,
    bfly: `<ellipse cx="13" cy="15" rx="9" ry="7" fill="#a58bf0" transform="rotate(-20 13 15)"/><ellipse cx="27" cy="15" rx="9" ry="7" fill="#c9b6f2" transform="rotate(20 27 15)"/><ellipse cx="14" cy="24" rx="6" ry="5" fill="#f7b6d2" transform="rotate(20 14 24)"/><ellipse cx="26" cy="24" rx="6" ry="5" fill="#f7b6d2" transform="rotate(-20 26 24)"/><rect x="18.8" y="10" width="2.4" height="20" rx="1.2" fill="#3b3b52"/>`,
    fount: `<path d="M5 38 L9 30 H31 L35 38 Z" fill="#b9c3d6"/><rect x="18" y="14" width="4" height="16" fill="#cfd7e6"/><path d="M20 14 Q10 14 8 26 M20 14 Q30 14 32 26" stroke="#7ec8f0" stroke-width="2.6" fill="none" stroke-linecap="round"/><ellipse cx="20" cy="30" rx="11" ry="2.4" fill="#7ec8f0"/>`,
    fox: `<path d="M30 30 Q40 26 36 14 Q30 20 28 26 Z" fill="#f0974a"/><path d="M36 14 Q34 17 33 19 Q36 20 37 17 Z" fill="#fff"/><ellipse cx="19" cy="30" rx="12" ry="7" fill="#f0974a"/><circle cx="10" cy="21" r="7" fill="#f0974a"/><path d="M4 17 L5 7 L11 14 Z M16 15 L16 6 L10 14 Z" fill="#f0974a"/><path d="M6 25 Q10 29 14 25 Z" fill="#fff"/><circle cx="8" cy="20" r="1.1" fill="#3b3b52"/><circle cx="4.4" cy="23" r="1.3" fill="#3b3b52"/>`,
    bloom: `<rect x="17.5" y="22" width="5" height="16" rx="1.5" fill="#8a6240"/><circle cx="20" cy="14" r="11" fill="#f7b6d2"/><circle cx="12" cy="19" r="7" fill="#f5a3c7"/><circle cx="28" cy="19" r="7" fill="#f5a3c7"/><circle cx="17" cy="10" r="2" fill="#fff" opacity=".7"/><circle cx="25" cy="14" r="1.6" fill="#fff" opacity=".7"/><circle cx="13" cy="18" r="1.6" fill="#fff" opacity=".7"/>`
  };
  if (id === 'rain') return RAINBOW_SVG;
  return `<svg viewBox="0 0 40 40" aria-hidden="true" focusable="false">${art[id] || art.sprout}</svg>`;
}
function islandHTML(small) {
  const grow = Math.min(1, 0.72 + level() * 0.04);
  const decos = S.placed.map(id => {
    const d = DECOR.find(x => x.id === id); if (!d) return '';
    const [px, py] = SLOTS[id] || [400, 250];
    const sc = (0.78 + (py - 205) / 90 * 0.3).toFixed(2);
    return `<span class="deco ${id}${S.newDecor === id ? ' new' : ''}" style="left:${px / 8}%;top:${py / 4}%;--s:${sc};z-index:${2 + Math.round(py / 10)}" title="${esc(d.n)}">${id === 'rain' ? RAINBOW_SVG : `<i aria-hidden="true">${decorSVG(id)}</i>`}</span>`;
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
