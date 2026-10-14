'use strict';
/* Zumi · features/timer */
const T = { mode: 'focus', dur: { focus: 25, short: 5, long: 15 }, remaining: 1500, total: 1500, running: false, endAt: 0, iv: null, subject: '', sound: true, cycle: 0, history: [] };
const MODES = { focus: 'Focus', short: 'Short break', long: 'Long break' };
views.timer = () => header('Study Timer', 'Focus sessions earn XP. Breaks do not.') + `
  <div class="grid two"><section class="card timer"><div class="tabs" role="group" aria-label="Timer mode">${Object.entries(MODES).map(([k, v]) => `<button data-act="mode" data-id="${k}" aria-pressed="${T.mode === k}">${v}</button>`).join('')}</div>
  <div class="ring" id="ring"><svg width="260" height="260" viewBox="0 0 260 260" aria-hidden="true"><circle cx="130" cy="130" r="112" fill="none" stroke="#2d3e5014" stroke-width="16"/><circle id="arc" cx="130" cy="130" r="112" fill="none" stroke="#2f7d4f" stroke-width="16" stroke-linecap="round" stroke-dasharray="703.7" stroke-dashoffset="0"/></svg><div class="time" id="tTime" role="timer" aria-live="off">25:00</div></div>
  <p id="tMsg" aria-live="polite"></p>
  <div class="row" style="justify-content:center"><button class="btn" id="tGo" data-act="tGo">Start</button><button class="btn ghost" data-act="tReset">Reset</button><button class="btn ghost" data-act="tSound" id="tSnd" aria-pressed="${T.sound}">${T.sound ? 'Sound on' : 'Sound off'}</button></div></section>
  <section class="card"><h2>Settings</h2><div class="frm"><label for="tSubj">Subject (optional)<select id="tSubj" data-tset="subject">${subjOptions().map(o => `<option value="${esc(o.v)}"${o.v === T.subject ? ' selected' : ''}>${esc(o.l)}</option>`).join('')}</select></label>
  <div class="row">${['focus', 'short', 'long'].map(k => `<label>${MODES[k]} (min)<input type="number" min="1" max="180" value="${T.dur[k]}" data-tset="${k}" style="width:90px"></label>`).join('')}</div></div>
  <h2 style="margin-top:18px">This page session</h2><div id="tHist"></div></section></div>`;
function timerUI() {
  const ring = $('#ring'); if (!ring) return;
  const m = Math.floor(T.remaining / 60), s = T.remaining % 60;
  $('#tTime').textContent = `${pad(m)}:${pad(s)}`;
  $('#arc').style.strokeDashoffset = 703.7 * (1 - (T.total ? T.remaining / T.total : 0));
  ring.classList.toggle('run', T.running);
  const started = T.remaining < T.total;
  $('#tGo').textContent = T.running ? 'Pause' : started ? 'Resume' : 'Start';
  $('#tMsg').textContent = T.running ? (T.mode === 'focus' ? 'Stay focused – you got this!' : 'Relax and stretch') : '';
  $$('[data-act=mode]').forEach(b => b.setAttribute('aria-pressed', b.dataset.id === T.mode));
  $('#tHist').innerHTML = T.history.length ? `<ul class="list">${T.history.map(h => `<li class="item"><span>${h.type === 'focus' ? '' : ''} ${h.label} · ${esc(h.subject)}</span><span class="chip">${h.time}</span></li>`).join('')}</ul>` : '<p class="note">No completed sessions yet.</p>';
  document.title = T.running ? `${pad(m)}:${pad(s)} · Zumi` : 'Zumi – Grow your study world';
}
function beep() {
  if (!T.sound) return;
  try { const ac = new (window.AudioContext || window.webkitAudioContext)(); [660, 880, 1100].forEach((f, i) => { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = f; g.gain.value = .15; o.connect(g); g.connect(ac.destination); o.start(ac.currentTime + i * .2); o.stop(ac.currentTime + i * .2 + .15); }); } catch (e) { /* audio unavailable */ }
}
function tick() { T.remaining = Math.max(0, Math.round((T.endAt - Date.now()) / 1000)); timerUI(); if (T.remaining <= 0) finishTimer(); }
function setMode(m) { clearInterval(T.iv); T.running = false; T.mode = m; T.total = T.remaining = T.dur[m] * 60; timerUI(); }
function toggleTimer() {
  if (T.running) { tick(); clearInterval(T.iv); T.running = false; }
  else { if (T.iv) clearInterval(T.iv); T.endAt = Date.now() + T.remaining * 1000; T.running = true; T.iv = setInterval(tick, 250); }
  timerUI();
}
function finishTimer() {
  clearInterval(T.iv); T.running = false; const focus = T.mode === 'focus', min = Math.round(T.total / 60);
  T.history.unshift({ type: T.mode, label: `${MODES[T.mode]} ${min}m`, subject: subjName(T.subject), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
  beep(); sparkle(18);
  if (focus) {
    S.sessions.push({ type: 'focus', min, subject: T.subject, at: Date.now() });
    S.log[todayIso()] = (S.log[todayIso()] || 0) + min;
    toast(`Focus session complete! ${min} minutes studied.`, 'reward');
    addXp(min, 'focus session'); T.cycle++; sideStats();
    setMode(T.cycle % 4 === 0 ? 'long' : 'short');
  } else { toast('Break over – ready to focus?'); setMode('focus'); }
}

Object.assign(actions, {
  mode: id => { if (T.running) return toast('Pause and reset the timer before switching modes.'); setMode(id); },
  tGo: toggleTimer,
  tReset: () => { setMode(T.mode); },
  tSound: () => { T.sound = !T.sound; render(); },
});
