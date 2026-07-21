/* =========================================================
   messages.js — Direct messaging between matched users
   ========================================================= */

let currentConversation = null;

function initMessages(){
  renderMessagesList();
}

function renderMessagesList(){
  const list = document.getElementById('messages-list');
  const detailView = document.getElementById('message-detail');
  
  if(!list) return;
  
  if(STATE.matches.length === 0){
    list.innerHTML = `
      <div class="empty-state" style="text-align:center; padding:40px 20px;">
        <div style="font-size:32px; margin-bottom:12px;">💬</div>
        <div style="font-weight:500;">No conversations yet</div>
        <div style="font-size:12px; color:var(--text-low); margin-top:4px;">Match with someone to start messaging</div>
      </div>`;
    detailView.classList.add('hidden');
    return;
  }

  list.innerHTML = STATE.matches.map(m=>`
    <div class="msg-card" onclick="openConversation('${m.id}')">
      <div class="msg-card-avatar"><img src="${getAssetPhoto(m.name)}" alt="${m.name}" class="avatar-photo" /></div>
      <div class="msg-card-content">
        <div class="msg-card-name">${m.name}</div>
        <div class="msg-card-preview">${m.lastMsg || '👋 Say hello!'}</div>
      </div>
      <div class="msg-card-time">${m.time}</div>
      ${m.unread ? '<div class="msg-unread-dot"></div>' : ''}
    </div>
  `).join('');
}

function openConversation(matchId){
  currentConversation = STATE.matches.find(m=>m.id === matchId);
  if(!currentConversation) return;

  // Mark as read
  currentConversation.unread = false;
  persist();

  // Show detail view
  document.getElementById('messages-list').style.display = 'none';
  document.getElementById('message-detail').classList.remove('hidden');

  // Populate header
  renderPhotoAvatar(document.getElementById('msg-avatar'), currentConversation.name, 'profile-photo');
  document.getElementById('msg-name').textContent = currentConversation.name;
  document.getElementById('msg-status').textContent = '🟢 Active';

  // Load messages
  renderMessages();
}

function renderMessages(){
  const thread = document.getElementById('msg-thread');
  if(!thread || !currentConversation) return;

  thread.innerHTML = currentConversation.messages.map((msg, idx)=>`
    <div class="msg-bubble ${msg.sender === 'me' ? 'me' : 'them'}">
      <div>${msg.text}</div>
      <div class="msg-time">${msg.time}</div>
    </div>
  `).join('');

  // Scroll to bottom
  setTimeout(()=>{ thread.scrollTop = thread.scrollHeight; }, 50);
}

function sendMessage(){
  const input = document.getElementById('msg-input');
  const text = input.value.trim();
  if(!text || !currentConversation) return;

  // Add message to conversation
  const now = new Date();
  const timeStr = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
  
  currentConversation.messages.push({
    sender: 'me',
    text: text,
    time: timeStr
  });

  // Simulate auto-reply after short delay
  setTimeout(()=>{
    const replies = [
      'Hey! How are you doing? 😊',
      'That sounds fun! When are you free? 📅',
      'OMG yes! I totally agree 💯',
      "Haha that's so funny 😂",
      "Let's keep chatting!",
      'You seem cool, wanna exchange numbers? 📱',
      'This is nice! I like your vibe ✨'
    ];
    const reply = replies[Math.floor(Math.random() * replies.length)];
    const mins = now.getMinutes() + 1;
    const timeStr2 = now.getHours().toString().padStart(2,'0') + ':' + mins.toString().padStart(2,'0');
    
    currentConversation.messages.push({
      sender: 'them',
      text: reply,
      time: timeStr2
    });
    
    currentConversation.lastMsg = reply;
    currentConversation.unread = false;
    persist();
    renderMessages();
  }, 800);

  currentConversation.lastMsg = text;
  persist();
  input.value = '';
  renderMessages();
}

function handleMsgKeypress(e){
  if(e.key === 'Enter'){
    sendMessage();
  }
}

function backToList(){
  document.getElementById('message-detail').classList.add('hidden');
  document.getElementById('messages-list').style.display = 'block';
  currentConversation = null;
  renderMessagesList();
}

function filterMessages(){
  const query = document.getElementById('msg-search').value.toLowerCase();
  const cards = document.querySelectorAll('.msg-card');
  
  cards.forEach(card=>{
    const name = card.querySelector('.msg-card-name').textContent.toLowerCase();
    const preview = card.querySelector('.msg-card-preview').textContent.toLowerCase();
    const show = name.includes(query) || preview.includes(query);
    card.style.display = show ? 'flex' : 'none';
  });
}

function openConvMenu(){
  openModal('convmenu');
}

function callMatch(){
  if(!STATE.user.isPremium){
    toast('💻 Video calling is a Gold feature. Upgrade to unlock!');
    return;
  }
  toast('📞 Starting video call with ' + currentConversation.name + '...');
}

function reportMatch(){
  if(confirm('Report ' + currentConversation.name + ' for inappropriate behavior?')){
    toast('📋 Report submitted. Our team will review it shortly.');
    deleteConversation();
  }
}

function deleteConversation(){
  const idx = STATE.matches.findIndex(m=>m.id === currentConversation.id);
  if(idx >= 0){
    STATE.matches.splice(idx, 1);
    persist();
    backToList();
    toast('Conversation deleted');
  }
}
