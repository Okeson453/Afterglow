/* =========================================================
   discover.js — logic for partials/discover.html (MVP2: swipe/match)
   initDiscover() is called once the partial is injected into app.html
   ========================================================= */

let lastPassed = null;

function initDiscover(){
  if(STATE.candidates.length===0){ STATE.candidates = seedCandidates(12); persist(); }
  renderDeck();
}

function renderDeck(){
  const deck = document.getElementById('deck');
  if(!deck) return;
  deck.innerHTML = '';

  if(STATE.candidates.length===0){
    deck.innerHTML = `
      <div class="deck-empty">
        <div class="display">That's everyone nearby</div>
        <p>Widen your distance in Filters, or check back soon — new people join Afterglow every day.</p>
        <button class="btn btn-primary" style="width:auto; margin-top:16px; padding:12px 26px;" onclick="reloadDeck()">Refresh</button>
      </div>`;
    return;
  }

  const visible = STATE.candidates.slice(0,3).reverse();
  visible.forEach((c, idx)=>{
    const el = document.createElement('div');
    el.className = 'swipe-card';
    el.dataset.id = c.id;
    const depthFromTop = visible.length - 1 - idx;
    el.style.transform = `translateY(${depthFromTop*8}px) scale(${1 - depthFromTop*0.03})`;
    el.style.zIndex = idx+1;
    el.innerHTML = `
      <div class="card-art">${c.avatar}</div>
      <div class="stamp like">LIKE</div>
      <div class="stamp pass">PASS</div>
      <div class="card-body">
        <div class="name-row"><h3>${c.name}</h3><span class="age mono">${c.age}</span>${c.verified?'<span class="verified-tick">✓ VERIFIED</span>':''}</div>
        <div class="loc mono">📍 ${c.dist} km away</div>
        <div class="bio">${c.bio}</div>
        <div class="tags">${c.tags.map(t=>`<span>${t}</span>`).join('')}</div>
      </div>`;
    if(depthFromTop===0){ attachDrag(el); }
    deck.appendChild(el);
  });
}

function reloadDeck(){
  STATE.candidates = seedCandidates(12);
  persist();
  renderDeck();
}

function attachDrag(card){
  let startX=0, startY=0, curX=0, curY=0, dragging=false;

  const onDown = (x,y)=>{ dragging=true; startX=x; startY=y; card.style.transition='none'; };
  const onMove = (x,y)=>{
    if(!dragging) return;
    curX = x-startX; curY = y-startY;
    const rot = curX/18;
    card.style.transform = `translate(${curX}px,${curY}px) rotate(${rot}deg)`;
    const like = card.querySelector('.stamp.like');
    const pass = card.querySelector('.stamp.pass');
    like.style.opacity = Math.max(0, curX/100);
    pass.style.opacity = Math.max(0, -curX/100);
  };
  const onUp = ()=>{
    if(!dragging) return;
    dragging=false;
    card.style.transition='';
    if(curX > 120){ commitSwipe(card,'like'); }
    else if(curX < -120){ commitSwipe(card,'pass'); }
    else{ card.style.transform=''; card.querySelectorAll('.stamp').forEach(s=>s.style.opacity=0); }
    curX=0; curY=0;
  };

  card.addEventListener('pointerdown', e=>{ card.setPointerCapture(e.pointerId); onDown(e.clientX,e.clientY); });
  card.addEventListener('pointermove', e=>{ onMove(e.clientX,e.clientY); });
  card.addEventListener('pointerup', onUp);
  card.addEventListener('pointercancel', onUp);
}

function swipeTop(action){
  const card = document.querySelector('.swipe-card:last-child');
  if(!card) return;
  commitSwipe(card, action);
}

function commitSwipe(card, action){
  const id = card.dataset.id;
  const candidate = STATE.candidates.find(c=>c.id===id);
  if(!candidate) return;

  // GOLD FEATURE LOCKS
  if(action==='like' && !STATE.user.isPremium){
    const likesToday = STATE.swipesSent % 10;
    if(likesToday >= 10){
      openUpgradeModal('💙 Unlimited Likes', 'You\'ve used your 10 daily likes. Upgrade to Gold for unlimited likes and more!', 'gold');
      return;
    }
  }
  if(action==='super' && !STATE.user.isPremium){
    openUpgradeModal('⭐ Super Like', 'Super Likes are a Gold membership feature. Upgrade now to express stronger interest!', 'gold');
    return;
  }

  let flyX = 0, flyRot = 0;
  if(action==='like'){ flyX=650; flyRot=25; }
  if(action==='pass'){ flyX=-650; flyRot=-25; }
  if(action==='super'){ card.style.transform='translateY(-700px) scale(1.05)'; }
  if(action!=='super'){ card.style.transform = `translate(${flyX}px, -40px) rotate(${flyRot}deg)`; }
  card.style.opacity='0';

  // API: POST /swipes { targetId, action }
  STATE.swipesSent++;
  lastPassed = { candidate, action };

  setTimeout(()=>{
    STATE.candidates = STATE.candidates.filter(c=>c.id!==id);
    persist();
    renderDeck();
    if(typeof renderProfileView === 'function') renderProfileView();

    if(action==='like' || action==='super'){
      // Simulated mutual-match probability (in production: server checks
      // reciprocal swipe row and emits a match event over the bus)
      const mutual = action==='super' ? true : Math.random() < 0.45;
      if(mutual){ createMatch(candidate); }
      else{ toast(action==='super' ? 'Super Like sent ⭐' : 'Liked ♥'); }
    }
  }, 320);
}

function rewindCard(){
  if(!lastPassed){ toast('Nothing to rewind yet.'); return; }
  // API: POST /swipes/undo (paid feature gate)
  if(!STATE.user.isPremium){
    openUpgradeModal('↶ Rewind', 'Rewind is a Gold membership feature. See your last swipe again!', 'gold');
    return;
  }
  STATE.candidates.unshift(lastPassed.candidate);
  persist();
  lastPassed = null;
  renderDeck();
  toast('Rewound last swipe.');
}

function createMatch(candidate){
  // API: server creates `matches` row on reciprocal like, emits event ->
  // push notification + this modal on both clients
  const match = {
    id:'m_'+candidate.id,
    name: candidate.name,
    avatar: candidate.avatar,
    lastMsg: '',
    time:'now',
    unread:false,
    messages:[]
  };
  STATE.matches.unshift(match);
  persist();

  document.getElementById('mm-avatar-me').textContent = STATE.user.avatar || '✨';
  document.getElementById('mm-avatar-them').textContent = candidate.avatar;
  document.getElementById('mm-sub').textContent = `You and ${candidate.name} both said yes.`;
  document.getElementById('match-modal').classList.add('active');
  window.__pendingMatch = match;

  if(typeof renderMatches === 'function') renderMatches();
  const badge = document.getElementById('unread-badge');
  const dot = document.getElementById('nav-dot');
  if(badge){ badge.style.display='flex'; badge.textContent = STATE.matches.length; }
  if(dot){ dot.style.display='block'; }
}

function closeMatchModal(openChat){
  document.getElementById('match-modal').classList.remove('active');
  if(openChat && window.__pendingMatch){ openChat_(window.__pendingMatch.id); }
}

function openFilters(){
  toast('Filters: distance ' + STATE.user.distance + 'km · seeking: ' + (STATE.user.seeking||[]).join(', '));
}
