/* =========================================================
   partial-loader.js — pages/app.html only.
   Fetches each section (discover/matches/chat/profile/topbar/
   bottomnav/match-modal) from /partials and injects it into
   the shell, then wires up the bottom-nav view router.


   ========================================================= */

async function loadPartial(url, mountSelector){
  const res = await fetch(url);
  if(!res.ok) throw new Error('Failed to load partial: ' + url);
  const html = await res.text();
  document.querySelector(mountSelector).innerHTML = html;
}

async function bootApp(){
  requireAuth('../index.html');

  await Promise.all([
    loadPartial('../partials/topbar.html', '#mount-topbar'),
    loadPartial('../partials/discover.html', '#mount-discover'),
    loadPartial('../partials/messages.html', '#mount-messages'),
    loadPartial('../partials/matches.html', '#mount-matches'),
    loadPartial('../partials/chat.html', '#mount-chat'),
    loadPartial('../partials/profile.html', '#mount-profile'),
    loadPartial('../partials/match-modal.html', '#mount-modal'),
    loadPartial('../partials/bottomnav.html', '#bottomnav'),
  ]);

  // Partials are in the DOM now — safe to init each section's module.
  initDiscover();
  initMatches();
  initMessages();
  initProfile();
  document.getElementById('bottomnav').style.display = 'flex';
  showView('discover');
}

function showView(name){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.getElementById('view-'+name).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active', b.dataset.view===name));
  if(name==='matches'){
    const badge = document.getElementById('unread-badge');
    const dot = document.getElementById('nav-dot');
    if(badge) badge.style.display='none';
    if(dot) dot.style.display='none';
  }
}

function logout(){
  STATE.user = null;
  STATE.matches = [];
  STATE.candidates = [];
  persist();
  window.location.href = '../index.html';
}

document.addEventListener('DOMContentLoaded', bootApp);
