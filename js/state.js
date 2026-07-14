/* =========================================================
   state.js — single source of truth, persisted to localStorage
   so it survives navigation between real pages (index.html ->
   pages/onboarding.html -> pages/app.html). In production this
   whole file is replaced by real API calls + a session token;
   every mutation below is commented with the endpoint it maps to.
   ========================================================= */

const AVATARS = ['😎','🥰','😏','🤠','😌','🫦','😇','🥳','🤓','😍','🙃','😜','🫶','🦋','🌙','🔥'];
const STORAGE_KEY = 'afterglow_state_v1';

function defaultState(){
  return {
    user: null,        // { id, email, verified, gender, seeking, distance, name, avatar, bio, dob }
    candidates: [],     // discovery queue
    swipesSent: 0,
    matches: [],        // { id, name, avatar, lastMsg, time, unread, messages:[] }
    blocked: 0
  };
}

function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : defaultState();
  }catch(e){
    console.warn('State load failed, resetting.', e);
    return defaultState();
  }
}

function saveState(){
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(STATE));
  }catch(e){
    console.warn('State save failed', e);
  }
}

const STATE = loadState();

/** Call after ANY mutation to STATE so it survives a page navigation. */
function persist(){ saveState(); }

/** Guard used at the top of onboarding.html / app.html */
function requireAuth(redirectTo){
  if(!STATE.user){
    window.location.href = redirectTo;
    return false;
  }
  return true;
}
