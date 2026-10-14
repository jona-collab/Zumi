'use strict';
/* Zumi · core/dialogs */
/* ---------- dialogs ---------- */
function closeDlg() { const d = $('#dlg'); if (d.open) d.close(); }
function fieldHTML(f) {
  const id = 'f_' + f.name, v = f.value ?? '';
  let ctl;
  if (f.type === 'textarea') ctl = `<textarea id="${id}" name="${f.name}" maxlength="${f.max || 2000}">${esc(v)}</textarea>`;
  else if (f.type === 'select') ctl = `<select id="${id}" name="${f.name}">${f.options.map(o => `<option value="${esc(o.v)}"${o.v === v ? ' selected' : ''}>${esc(o.l)}</option>`).join('')}</select>`;
  else if (f.type === 'checkbox') return `<label class="chk"><input type="checkbox" id="${id}" name="${f.name}"${v ? ' checked' : ''}> ${esc(f.label)}</label>`;
  else ctl = `<input id="${id}" name="${f.name}" type="${f.type || 'text'}" value="${esc(v)}" maxlength="${f.max || 100}"${f.min != null ? ` min="${f.min}" max="${f.maxN}"` : ''}>`;
  return `<label class="${f.required ? 'req' : ''}" for="${id}">${esc(f.label)}${ctl}<span class="err" id="e_${f.name}" role="alert"></span></label>`;
}
/* Validates one form field. Returns the cleaned value and an error message ('' when valid). */
function checkField(f, raw) {
  if (f.type === 'checkbox') return { v: !!raw, msg: '' };
  let v = String(raw ?? '');
  v = f.type === 'textarea' ? clean(v) : clean(v.replace(/\s+/g, ' '));
  const L = f.label; let msg = '';
  if (f.required && !v) msg = `${L} is required.`;
  else if (v) {
    if (f.minLen && v.length < f.minLen) msg = `${L} must be at least ${f.minLen} characters.`;
    else if (f.type === 'number' && (!/^\d+$/.test(v) || +v < f.min || +v > f.maxN)) msg = `${L} must be a whole number from ${f.min} to ${f.maxN}.`;
    else if (f.type === 'date' && !isRealDate(v)) msg = `${L} must be a real date between 2000 and 2100.`;
    else if (f.type === 'color' && !/^#[0-9a-f]{6}$/i.test(v)) msg = `${L} must be a valid colour.`;
    else if (f.type === 'select' && !f.options.some(o => String(o.v) === v)) msg = `Choose a valid option for ${L}.`;
    else if (f.pattern && !f.pattern.test(v)) msg = f.patternMsg || `${L} contains invalid characters.`;
  }
  return { v, msg };
}
function showFieldError(form, f, el, msg) { const err = $('#e_' + f.name, form); if (err) err.textContent = msg; el.setAttribute('aria-invalid', !!msg); }
function openForm(title, fields, onSave, submitLabel = 'Save') {
  const dlg = $('#dlg'); dlg.className = 'pop';
  dlg.innerHTML = `<form class="frm" novalidate><h2 id="dlgTitle">${esc(title)}</h2>${fields.map(fieldHTML).join('')}<span class="err" id="formErr" role="alert"></span><div class="row end"><button type="button" class="btn ghost" data-close>Cancel</button><button class="btn" type="submit">${esc(submitLabel)}</button></div></form>`;
  const form = $('form', dlg);
  form.addEventListener('focusout', ev => { const f = fields.find(x => x.name === ev.target.name); if (f && f.type !== 'checkbox') showFieldError(form, f, ev.target, checkField(f, ev.target.value).msg); });
  form.addEventListener('submit', e => {
    e.preventDefault(); const vals = {}; let first = null;
    fields.forEach(f => {
      const el = form.elements[f.name], r = checkField(f, f.type === 'checkbox' ? el.checked : el.value);
      vals[f.name] = r.v; showFieldError(form, f, el, r.msg);
      if (r.msg) first = first || el;
    });
    if (first) { first.focus(); return; }
    const res = onSave(vals);
    if (typeof res === 'string') $('#formErr', form).textContent = res; else closeDlg();
  });
  dlg.showModal(); $('input,textarea,select', form)?.focus();
}
function showInfo(html) { const d = $('#dlg'); d.className = 'pop'; d.innerHTML = `<div class="frm">${html}<div class="row end"><button class="btn" data-close>Close</button></div></div>`; d.showModal(); }
function confirmBox(msg, onYes, label = 'Delete') {
  const c = $('#confirm'); c.className = 'pop'; $('#cMsg').textContent = msg; $('#cYes').textContent = label;
  c.showModal(); $('#cNo').focus();
  $('#cNo').onclick = () => c.close();
  $('#cYes').onclick = () => { c.close(); onYes(); };
}
