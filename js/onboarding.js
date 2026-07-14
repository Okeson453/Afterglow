/* =========================================================
   onboarding.js — pages/onboarding.html only (MVP1 profile CRUD)
   ========================================================= */

requireAuth('../index.html');

let obSeeking = [];
let obAvatar = null;

function renderAvatarPicker(){
  const grid = document.getElementById('ob-avatars');
  grid.innerHTML = '';
  AVATARS.forEach(a=>{
    const d = document.createElement('div');
    d.className = 'avatar-opt';
    d.textContent = a;
    d.onclick = ()=>{
      document.querySelectorAll('.avatar-opt').forEach(el=>el.classList.remove('selected'));
      d.classList.add('selected');
      obAvatar = a;
    };
    grid.appendChild(d);
  });
}

function toggleChip(el){
  el.classList.toggle('selected');
  const val = el.dataset.val;
  if(el.classList.contains('selected')){ obSeeking.push(val); }
  else{ obSeeking = obSeeking.filter(v=>v!==val); }
}

function obNext(step){
  if(step===1){
    const name = document.getElementById('ob-name').value.trim();
    if(!name){ toast('Enter a display name to continue.'); return; }
    STATE.user.name = name;
    STATE.user.gender = document.getElementById('ob-gender').value;
  }
  if(step===2){
    if(obSeeking.length===0){ toast('Pick at least one preference.'); return; }
    STATE.user.seeking = obSeeking;
    STATE.user.distance = document.getElementById('ob-distance').value;
  }
  if(step===3){
    if(!obAvatar){ toast('Pick an avatar to continue.'); return; }
    STATE.user.avatar = obAvatar;
  }
  persist();
  document.getElementById('ob-step-'+step).classList.remove('active');
  document.getElementById('ob-step-'+(step+1)).classList.add('active');
  document.getElementById('onboard-progress').style.width = (16 + step*21)+'%';
}

function obBack(step){
  document.getElementById('ob-step-'+step).classList.remove('active');
  document.getElementById('ob-step-'+(step-1)).classList.add('active');
  document.getElementById('onboard-progress').style.width = (16 + (step-2)*21)+'%';
}

function finishOnboarding(){
  // API: PATCH /profile { name, gender, seeking, distance, avatar, bio }
  STATE.user.bio = document.getElementById('ob-bio').value.trim();
  persist();
  toast('Profile live. Welcome to Afterglow.');
  window.location.href = 'app.html';
}

document.addEventListener('input', (e)=>{
  if(e.target && e.target.id==='ob-bio'){
    document.getElementById('bio-count').textContent = e.target.value.length;
  }
});

renderAvatarPicker();
