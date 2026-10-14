'use strict';
/* Zumi · login: validated sign-up / log-in with accounts kept in this browser (passwords are salted + hashed) */
const $ = s => document.querySelector(s);
const USERS_KEY = 'zumi.users';
let signUp = false;

const readUsers = () => { try { const u = JSON.parse(localStorage.getItem(USERS_KEY) || '{}'); return u && typeof u === 'object' ? u : {}; } catch (e) { return {}; } };
const writeUsers = u => { try { localStorage.setItem(USERS_KEY, JSON.stringify(u)); return true; } catch (e) { return false; } };
const randomSalt = () => Array.from(crypto.getRandomValues(new Uint8Array(16)), b => b.toString(16).padStart(2, '0')).join('');
async function hash(pw, salt) {
  const data = new TextEncoder().encode(salt + ':' + pw);
  if (crypto.subtle) return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', data)), b => b.toString(16).padStart(2, '0')).join('');
  let h = 5381; for (const b of data) h = ((h << 5) + h + b) >>> 0; return 'x' + h.toString(16); // fallback when SubtleCrypto is unavailable
}
function enter(name, email) {
  sessionStorage.setItem('zumi.session', JSON.stringify({ name: name.slice(0, 30), email }));
  location.href = 'index.html';
}

/* Pure validation: returns an object of field -> message */
function validate(v, isSignUp) {
  const e = {};
  if (isSignUp) {
    if (!v.name) e.name = 'Display name is required.';
    else if (v.name.length < 2) e.name = 'Use at least 2 characters.';
    else if (!/^[\p{L}\p{N} .'\-_]+$/u.test(v.name)) e.name = 'Use letters, numbers, spaces and . \' - _ only.';
  }
  if (!v.email) e.email = 'Email is required.';
  else if (v.email.length > 80 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email)) e.email = 'Enter an email like name@school.edu.';
  if (!v.password) e.password = 'Password is required.';
  else if (isSignUp) {
    if (v.password.length < 8) e.password = 'Use at least 8 characters.';
    else if (!/[A-Za-z]/.test(v.password) || !/\d/.test(v.password)) e.password = 'Include at least one letter and one number.';
    else if (/\s/.test(v.password)) e.password = 'Password cannot contain spaces.';
  }
  if (isSignUp && v.password && v.confirm !== v.password) e.confirm = 'Passwords do not match.';
  return e;
}
function showErrors(errors) {
  ['name', 'email', 'password', 'confirm'].forEach(k => { $('#e_' + k).textContent = errors[k] || ''; $('#' + k).setAttribute('aria-invalid', !!errors[k]); });
  const first = ['name', 'email', 'password', 'confirm'].find(k => errors[k]);
  if (first) $('#' + first).focus();
  return !!first;
}
const values = () => ({ name: $('#name').value.replace(/\s+/g, ' ').trim(), email: $('#email').value.trim().toLowerCase(), password: $('#password').value, confirm: $('#confirm').value });

function setMode(on) {
  signUp = on;
  $('#name').closest('label').classList.toggle('hidden', !signUp);
  $('#confirmWrap').classList.toggle('hidden', !signUp);
  $('#submit').textContent = signUp ? 'Create account' : 'Log in';
  $('#sub').textContent = signUp ? 'Pick a name and start growing your island.' : 'Welcome back! Log in to visit your study world.';
  $('#switch').textContent = signUp ? 'Already have an account? Log in' : 'New here? Create an account';
  $('#password').autocomplete = signUp ? 'new-password' : 'current-password';
  document.querySelectorAll('.err').forEach(e => e.textContent = '');
}

$('#toggle').addEventListener('click', e => {
  const pw = $('#password'), show = pw.type === 'password';
  pw.type = show ? 'text' : 'password';
  e.target.textContent = show ? 'Hide' : 'Show';
  e.target.setAttribute('aria-pressed', show);
});
$('#switch').addEventListener('click', () => setMode(!signUp));
$('#guest').addEventListener('click', () => enter('Guest', 'guest'));

/* live feedback when leaving a field */
['name', 'email', 'password', 'confirm'].forEach(k => $('#' + k).addEventListener('blur', () => {
  if (!$('#' + k).value && !$('#e_' + k).textContent) return;
  const e = validate(values(), signUp); $('#e_' + k).textContent = e[k] || ''; $('#' + k).setAttribute('aria-invalid', !!e[k]);
}));

$('#form').addEventListener('submit', async ev => {
  ev.preventDefault();
  const v = values(); if (showErrors(validate(v, signUp))) return;
  const users = readUsers(), user = users[v.email];
  if (signUp) {
    if (user) return showErrors({ email: 'An account with this email already exists. Try logging in.' });
    const salt = randomSalt();
    users[v.email] = { name: v.name, salt, hash: await hash(v.password, salt), created: Date.now() };
    if (!writeUsers(users)) return showErrors({ email: 'Could not save your account (browser storage is unavailable).' });
    return enter(v.name, v.email);
  }
  if (!user || user.hash !== await hash(v.password, user.salt)) return showErrors({ password: 'Incorrect email or password.' });
  enter(user.name, v.email);
});
setMode(false);
$('#email').focus();
