'use strict';
/* Zumi · core/auth: the signed-in user comes from the session set by login.html */
let SESSION = null;
try { SESSION = JSON.parse(sessionStorage.getItem('zumi.session') || 'null'); } catch (e) { /* ignore */ }
if (!SESSION || typeof SESSION.email !== 'string') location.replace('login.html');
else { S.name = String(SESSION.name || 'Student').slice(0, 30); useStorageFor(SESSION.email); }
