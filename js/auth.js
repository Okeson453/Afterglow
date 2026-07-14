/* =========================================================
   auth.js — index.html only (login / signup)
   ========================================================= */

function switchAuthTab(which){
  document.getElementById('tab-login').classList.toggle('active', which==='login');
  document.getElementById('tab-signup').classList.toggle('active', which==='signup');
  document.getElementById('form-login').style.display = which==='login' ? 'block':'none';
  document.getElementById('form-signup').style.display = which==='signup' ? 'block':'none';
}

function handleLogin(e){
  e.preventDefault();
  // API: POST /auth/login { identifier, password } -> { token, user }
  const id = document.getElementById('login-id').value.trim();
  if(!id) return false;

  STATE.user = STATE.user || {
    id:'u_demo', email:id, verified:false, gender:'woman', seeking:['everyone'],
    distance:25, name:'You', avatar:'✨', bio:'', dob:'1998-01-01'
  };
  persist();
  toast('Welcome back.');
  window.location.href = 'pages/app.html';
  return false;
}

function handleSignup(e){
  e.preventDefault();
  const email = document.getElementById('signup-email').value.trim();
  const dob = document.getElementById('signup-dob').value;
  const errEl = document.getElementById('dob-error');

  // Server-side age gate is mandatory in production — this client check
  // is a UX convenience only, never trust it as the source of truth.
  if(!dob || calcAge(dob) < 18){
    errEl.style.display = 'block';
    return false;
  }
  errEl.style.display = 'none';

  // API: POST /auth/signup { email, password, dob } -> { token, user }
  STATE.user = {
    id:'u_'+Date.now(), email, verified:false,
    gender:'woman', seeking:['everyone'], distance:25,
    name:'', avatar:'', bio:'', dob
  };
  persist();
  toast("Account created — let's build your profile.");
  window.location.href = 'pages/onboarding.html';
  return false;
}

// Set max DOB to today-18y so the date picker nudges the correct range
(function(){
  const dobInput = document.getElementById('signup-dob');
  if(!dobInput) return;
  const d = new Date(); d.setFullYear(d.getFullYear()-18);
  dobInput.max = d.toISOString().split('T')[0];
})();

// If already logged in, skip straight to the app
if(STATE.user){
  // comment out this redirect while iterating on the auth screen design
  // window.location.href = 'pages/app.html';
}
