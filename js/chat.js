/* =========================================================
   chat.js — logic for partials/chat.html
   ========================================================= */

function openChat_(matchId){
  const m = STATE.matches.find(x=>x.id===matchId);
  if(!m) return;
  STATE.activeChat = matchId;
  m.unread = false;
  persist();

  document.getElementById('chat-avatar').textContent = m.avatar;
  document.getElementById('chat-name').textContent = m.name;
  renderChatThread();
  showView('chat');
}

function activeChatObj(){
  return STATE.matches.find(m=>m.id===STATE.activeChat);
}

function renderChatThread(){
  const thread = document.getElementById('chat-thread');
  const m = activeChatObj();
  if(!thread || !m) return;
  thread.innerHTML = `<div class="bubble system">You matched with ${m.name} · be respectful, be safe</div>`;
  m.messages.forEach(msg=>{
    const b = document.createElement('div');
    b.className = 'bubble ' + (msg.from==='me' ? 'me':'them');
    b.textContent = msg.text;
    thread.appendChild(b);
  });
  thread.scrollTop = thread.scrollHeight;
}

function sendMessage(){
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  const m = activeChatObj();
  if(!text || !m) return;

  // API: POST /messages { matchId, content } -> broadcast over websocket
  m.messages.push({from:'me', text});
  m.lastMsg = text;
  m.time = 'now';
  persist();
  input.value='';
  renderChatThread();
  renderMatches();

  // Simulated reply for demo purposes only
  setTimeout(()=>{
    const replies = ["Hey! 😊","What are you up to tonight?","Haha, I like that.","Where's good around you?","Tell me more.","😏 go on..."];
    const reply = replies[Math.floor(Math.random()*replies.length)];
    m.messages.push({from:'them', text:reply});
    m.lastMsg = reply;
    persist();
    if(document.getElementById('view-chat').classList.contains('active')){
      renderChatThread();
    } else {
      m.unread = true;
      persist();
    }
    renderMatches();
  }, 1400 + Math.random()*1200);
}

function reportUser(){
  // API: POST /reports { reportedId, reason, evidence } -> moderation queue
  toast('Report submitted — our Trust & Safety team reviews within 24h.');
}

function unmatchUser(){
  const m = activeChatObj();
  if(!m) return;
  if(!confirm('Unmatch with ' + m.name + '? This removes the conversation for both of you.')) return;
  // API: DELETE /matches/:id
  STATE.matches = STATE.matches.filter(x=>x.id!==m.id);
  STATE.activeChat = null;
  persist();
  showView('matches');
  renderMatches();
  toast('Unmatched.');
}
