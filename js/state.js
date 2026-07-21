/* =========================================================
   state.js — single source of truth, persisted to localStorage
   so it survives navigation between real pages (index.html ->
   pages/onboarding.html -> pages/app.html). In production this
   whole file is replaced by real API calls + a session token;
   every mutation below is commented with the endpoint it maps to.
   ========================================================= */

const AVATARS = ['😎','🥰','😏','🤠','😌','🫦','😇','🥳','🤓','😍','🙃','😜','🫶','🦋','🌙','🔥'];
const STORAGE_KEY = 'afterglow_state_v1';
const PHOTO_ASSETS = [
  '../Asset/alex-azabache--Hm_xIcYbUY-unsplash.jpg',
  '../Asset/caique-nascimento-Ij24Uq1sMwM-unsplash.jpg',
  '../Asset/garin-chadwick-pecs-5NKxhk-unsplash.jpg',
  '../Asset/garin-chadwick-XNf_s_upjso-unsplash.jpg',
  '../Asset/igor-starkov-P-khwx2l5B0-unsplash.jpg',
  '../Asset/logan-weaver-lgnwvr-3yyOurQ8KxI-unsplash.jpg',
  '../Asset/mukul-kumar-oWfo8H7wvWo-unsplash.jpg',
  '../Asset/pao-dayag-9UY_vg8GBDE-unsplash.jpg',
  '../Asset/rafaella-mendes-diniz-AoL-mVxprmk-unsplash.jpg',
  '../Asset/thiago-reboucas-IT7udPaoPxc-unsplash.jpg'
];
const ICON_ASSETS = [
  '../Asset/icons/3d2c4b879be94c3232a70424bf4c7e98.jpg',
  '../Asset/icons/3f9470b34a8e3f526dbdb022f9f19cf7.jpg',
  '../Asset/icons/617aa451f29bf7034566ca4be190be30.jpg',
  '../Asset/icons/d369ce2188a656abe7b7630d1b30c217.jpg'
];

function getAssetPhoto(seed){
  const idx = Math.abs(String(seed || '').split('').reduce((sum,ch)=>sum + ch.charCodeAt(0), 0)) % PHOTO_ASSETS.length;
  return PHOTO_ASSETS[idx];
}

function getAssetIcon(index){
  const idx = Math.abs(Number(index) || 0) % ICON_ASSETS.length;
  return ICON_ASSETS[idx];
}

function renderPhotoAvatar(target, seed, extraClass=''){
  if(!target) return;
  const src = getAssetPhoto(seed);
  target.innerHTML = `<img loading="lazy" src="${src}" alt="avatar" class="avatar-photo${extraClass ? ' ' + extraClass : ''}" />`;
}

function defaultState(){
  return {
    user: null,        // { id, email, verified, gender, seeking, distance, name, avatar, bio, dob, isPremium, premiumTier, paymentMethod }
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
