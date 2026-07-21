/* =========================================================
   matches.js — logic for partials/matches.html
   ========================================================= */

function initMatches(){
  renderMatches();
}

function renderMatches(){
  const strip = document.getElementById('match-strip');
  const list = document.getElementById('chat-list');
  if(!strip || !list) return;
  strip.innerHTML=''; list.innerHTML='';

  if(STATE.matches.length===0){
    strip.innerHTML = '<div class="empty-state" style="width:100%;">No sparks yet — go swipe.</div>';
    list.innerHTML = '<div class="empty-state">Matches you message will show up here.</div>';
    return;
  }

  STATE.matches.forEach(m=>{
    const b = document.createElement('div');
    b.className = 'match-bubble';
    b.innerHTML = `<div class="circ ${m.messages.length===0?'new':''}"><img src="${getAssetPhoto(m.name)}" alt="${m.name}" class="avatar-photo" /></div><p>${m.name}</p>`;
    b.onclick = ()=>openChat_(m.id);
    strip.appendChild(b);

    const row = document.createElement('div');
    row.className = 'chat-row';
    row.onclick = ()=>openChat_(m.id);
    row.innerHTML = `
      <div class="circ"><img src="${getAssetPhoto(m.name)}" alt="${m.name}" class="avatar-photo" /></div>
      <div class="meta">
        <div class="top"><h4>${m.name}</h4><span class="time mono">${m.time}</span></div>
        <div class="preview">${m.lastMsg || 'Say hi — you matched!'}</div>
      </div>
      ${m.unread?'<div class="unread"></div>':''}
    `;
    list.appendChild(row);
  });
}
