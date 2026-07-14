/* =========================================================
   profile.js — logic for partials/profile.html
   ========================================================= */

function initProfile(){
  renderProfileView();
}

function renderProfileView(){
  if(!STATE.user) return;
  const avatarEl = document.getElementById('profile-avatar');
  if(!avatarEl) return; // partial not mounted yet

  avatarEl.textContent = STATE.user.avatar || '✨';
  document.getElementById('profile-name').textContent = STATE.user.name || 'You';
  document.getElementById('profile-verify').innerHTML = STATE.user.verified
    ? '<span style="color:var(--cyan)">✓ Verified profile</span>'
    : '○ Not yet verified';
  document.getElementById('stat-likes').textContent = STATE.swipesSent;
  document.getElementById('stat-matches').textContent = STATE.matches.length;
  document.getElementById('stat-msgs').textContent = STATE.matches.filter(m=>m.messages.length>0).length;
  document.getElementById('blocked-count').textContent = STATE.blocked + ' blocked';
}

function toggleSwitch(el){ el.classList.toggle('on'); }

function verifyProfile(){
  // API: POST /verification/selfie-check -> vendor liveness API -> { status }
  toast('Verifying… (30s simulated)');
  setTimeout(()=>{
    STATE.user.verified = true;
    persist();
    renderProfileView();
    toast('✅ Verified — trust badge added to your profile.');
  }, 1200);
}
