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
  
  // Update upgrade status
  const planStatus = document.getElementById('plan-status');
  if(STATE.user.isPremium){
    document.getElementById('upgrade-status').style.background = 'linear-gradient(135deg, rgba(0,255,200,.1), rgba(255,200,0,.05))';
    planStatus.textContent = STATE.user.premiumTier.charAt(0).toUpperCase() + STATE.user.premiumTier.slice(1) + ' member · renews ' + (new Date(Date.now() + 30*24*3600*1000).toLocaleDateString());
  }else{
    planStatus.textContent = 'Free plan · Upgrade to unlock premium';
  }
  
  // Update payment status
  const paymentStatus = document.getElementById('payment-status');
  if(STATE.user.paymentMethod){
    paymentStatus.textContent = '•••• ' + STATE.user.paymentMethod.last4 + ' (' + STATE.user.paymentMethod.brand + ')';
  }else{
    paymentStatus.textContent = 'No payment method added';
  }
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

// ============ MODAL FUNCTIONS ============

function openModal(modalId){
  const modal = document.getElementById('modal-' + modalId);
  if(modal) modal.classList.add('show');
}

function closeModal(modalId){
  const modal = document.getElementById('modal-' + modalId);
  if(modal) modal.classList.remove('show');
}

// ============ UPGRADE FUNCTIONS ============

function openUpgradePlans(){
  openModal('upgrade');
}

function selectPlan(plan){
  toast('🔄 Redirecting to payment… (' + plan.toUpperCase() + ')');
  setTimeout(()=>{
    STATE.user.isPremium = true;
    STATE.user.premiumTier = plan;
    persist();
    renderProfileView();
    closeModal('upgrade');
    toast('✅ Welcome to Afterglow ' + (plan.charAt(0).toUpperCase() + plan.slice(1)) + '!');
  }, 1500);
}

// ============ PAYMENT FUNCTIONS ============

function openPaymentSettings(){
  renderPaymentMethods();
  openModal('payment');
}

function renderPaymentMethods(){
  const list = document.getElementById('payment-methods-list');
  list.innerHTML = '';
  
  if(STATE.user.paymentMethod){
    const item = document.createElement('div');
    item.className = 'payment-method-item';
    item.innerHTML = `
      <div class="method-info">
        <div class="method-type">💳 ${STATE.user.paymentMethod.brand.toUpperCase()}</div>
        <div class="method-last">Ending in ${STATE.user.paymentMethod.last4}</div>
      </div>
      <button class="btn btn-ghost btn-sm" style="width:auto;" onclick="removePaymentMethod()">Remove</button>
    `;
    list.appendChild(item);
  }else{
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'No payment methods saved';
    list.appendChild(empty);
  }
}

function addPaymentMethod(){
  toast('💳 Opening Stripe checkout…');
  setTimeout(()=>{
    STATE.user.paymentMethod = {
      brand: 'visa',
      last4: '4242'
    };
    persist();
    renderPaymentMethods();
    toast('✅ Card added successfully');
  }, 1200);
}

function removePaymentMethod(){
  if(confirm('Remove this payment method?')){
    STATE.user.paymentMethod = null;
    persist();
    renderPaymentMethods();
    toast('Payment method removed');
  }
}

// ============ PROFILE FUNCTIONS ============

function editProfile(){
  openSettingsModal('Edit Profile', `
    <div style="display:flex; flex-direction:column; gap:14px;">
      <div>
        <label style="font-size:12px; color:var(--text-low);">Name</label>
        <input type="text" value="${STATE.user.name}" style="width:100%; padding:10px; background:var(--navy-800); border:1px solid rgba(255,255,255,.08); border-radius:8px; color:white; margin-top:4px;" placeholder="Your name">
      </div>
      <div>
        <label style="font-size:12px; color:var(--text-low);">Bio</label>
        <textarea style="width:100%; padding:10px; background:var(--navy-800); border:1px solid rgba(255,255,255,.08); border-radius:8px; color:white; margin-top:4px; min-height:80px; font-family:inherit;" placeholder="Tell us about yourself"></textarea>
      </div>
      <button class="btn btn-primary btn-block" onclick="saveProfile()">Save Changes</button>
    </div>
  `);
}

function saveProfile(){
  toast('📝 Profile updated');
  closeModal('settings');
}

// ============ SAFETY FUNCTIONS ============

function openSafetyCenter(){
  openSettingsModal('Safety Center', `
    <div style="display:flex; flex-direction:column; gap:14px;">
      <div style="background:rgba(0,255,200,.08); padding:12px; border-radius:8px; border-left:3px solid var(--cyan);">
        <div style="font-weight:500; margin-bottom:4px;">Check-in Timer</div>
        <div style="font-size:12px; color:var(--text-mid);">Set an automatic check-in for your dates to alert your contacts.</div>
        <button class="btn btn-cyan btn-sm" style="margin-top:10px; width:auto;" onclick="setSafetyTimer()">Set Timer (30 min)</button>
      </div>
      <div style="background:rgba(255,200,0,.05); padding:12px; border-radius:8px; border-left:3px solid var(--gold-bright);">
        <div style="font-weight:500; margin-bottom:4px;">Share Date Details</div>
        <div style="font-size:12px; color:var(--text-mid);">Share your date location and time with trusted contacts.</div>
        <button class="btn btn-ghost btn-sm" style="margin-top:10px; width:auto;" onclick="shareDetails()">Share Details</button>
      </div>
      <div style="background:rgba(200,0,0,.05); padding:12px; border-radius:8px; border-left:3px solid rgba(255,100,100,0.5);">
        <div style="font-weight:500; margin-bottom:4px;">Emergency SOS</div>
        <div style="font-size:12px; color:var(--text-mid);">Quickly alert your emergency contact if you feel unsafe.</div>
        <button class="btn btn-danger btn-sm" style="margin-top:10px; width:auto;" onclick="triggerSOS()">Trigger SOS</button>
      </div>
    </div>
  `);
}

function setSafetyTimer(){
  toast('⏱️ Check-in timer set for 30 minutes');
}

function shareDetails(){
  toast('📍 Sharing date details with emergency contact');
}

function triggerSOS(){
  if(confirm('Trigger emergency SOS? Your emergency contact will be alerted.')){
    toast('🚨 SOS sent to emergency contact');
  }
}

function viewBlockedList(){
  openSettingsModal('Blocked Accounts', `
    <div style="text-align:center; padding:30px 20px; color:var(--text-low);">
      ${STATE.blocked > 0 ? `<div style="margin-bottom:20px;">${STATE.blocked} ${STATE.blocked === 1 ? 'account' : 'accounts'} blocked</div>` : '<div style="margin-bottom:20px;">No blocked accounts</div>'}
      <button class="btn btn-ghost btn-sm" style="width:auto;" onclick="unblockAccount()">Unblock Someone</button>
    </div>
  `);
}

function unblockAccount(){
  if(STATE.blocked > 0){
    STATE.blocked--;
    persist();
    toast('✅ Account unblocked');
    closeModal('settings');
    renderProfileView();
  }
}

function changePassword(){
  openSettingsModal('Change Password', `
    <div style="display:flex; flex-direction:column; gap:14px;">
      <div>
        <label style="font-size:12px; color:var(--text-low);">Current Password</label>
        <input type="password" style="width:100%; padding:10px; background:var(--navy-800); border:1px solid rgba(255,255,255,.08); border-radius:8px; color:white; margin-top:4px;" placeholder="••••••••">
      </div>
      <div>
        <label style="font-size:12px; color:var(--text-low);">New Password</label>
        <input type="password" style="width:100%; padding:10px; background:var(--navy-800); border:1px solid rgba(255,255,255,.08); border-radius:8px; color:white; margin-top:4px;" placeholder="••••••••">
      </div>
      <div>
        <label style="font-size:12px; color:var(--text-low);">Confirm Password</label>
        <input type="password" style="width:100%; padding:10px; background:var(--navy-800); border:1px solid rgba(255,255,255,.08); border-radius:8px; color:white; margin-top:4px;" placeholder="••••••••">
      </div>
      <button class="btn btn-primary btn-block" onclick="updatePassword()">Update Password</button>
    </div>
  `);
}

function updatePassword(){
  toast('🔐 Password updated');
  closeModal('settings');
}

// ============ NOTIFICATION FUNCTIONS ============

function openNotifications(){
  openSettingsModal('Notifications', `
    <div style="display:flex; flex-direction:column; gap:14px;">
      <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; background:var(--navy-800); border-radius:8px;">
        <div>
          <div style="font-weight:500;">Push Notifications</div>
          <div style="font-size:12px; color:var(--text-low);">Matches, messages, updates</div>
        </div>
        <button class="toggle on" onclick="toggleSwitch(this)"></button>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; background:var(--navy-800); border-radius:8px;">
        <div>
          <div style="font-weight:500;">Email Notifications</div>
          <div style="font-size:12px; color:var(--text-low);">Weekly digest</div>
        </div>
        <button class="toggle on" onclick="toggleSwitch(this)"></button>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; background:var(--navy-800); border-radius:8px;">
        <div>
          <div style="font-weight:500;">Messages</div>
          <div style="font-size:12px; color:var(--text-low);">New message alerts</div>
        </div>
        <button class="toggle on" onclick="toggleSwitch(this)"></button>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; background:var(--navy-800); border-radius:8px;">
        <div>
          <div style="font-weight:500;">Marketing</div>
          <div style="font-size:12px; color:var(--text-low);">Promotions and offers</div>
        </div>
        <button class="toggle" onclick="toggleSwitch(this)"></button>
      </div>
      <button class="btn btn-primary btn-block" onclick="saveNotifications()">Save Preferences</button>
    </div>
  `);
}

function saveNotifications(){
  toast('✅ Notification preferences saved');
  closeModal('settings');
}

// ============ DATA FUNCTIONS ============

function downloadData(){
  toast('📥 Preparing your data export…');
  setTimeout(()=>{
    // Simulate file download
    const data = {
      user: STATE.user,
      matches: STATE.matches,
      exportDate: new Date().toISOString()
    };
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'afterglow-data-' + Date.now() + '.json';
    a.click();
    URL.revokeObjectURL(url);
    toast('✅ Your data has been exported');
  }, 1000);
}

// ============ HELP FUNCTIONS ============

function openHelp(){
  openSettingsModal('Help & FAQ', `
    <div style="display:flex; flex-direction:column; gap:12px;">
      <div style="padding:12px; background:var(--navy-800); border-radius:8px;">
        <div style="font-weight:500; margin-bottom:4px;">🔍 How do I search for matches?</div>
        <div style="font-size:12px; color:var(--text-mid);">Use the Discover tab to swipe through profiles. Like profiles you're interested in.</div>
      </div>
      <div style="padding:12px; background:var(--navy-800); border-radius:8px;">
        <div style="font-weight:500; margin-bottom:4px;">✓ What does verified mean?</div>
        <div style="font-size:12px; color:var(--text-mid);">A verified profile has passed a liveness check, confirming the person is real.</div>
      </div>
      <div style="padding:12px; background:var(--navy-800); border-radius:8px;">
        <div style="font-weight:500; margin-bottom:4px;">💬 How do I message someone?</div>
        <div style="font-size:12px; color:var(--text-mid);">Once you match with someone, you can message them directly in the Matches tab.</div>
      </div>
      <div style="padding:12px; background:var(--navy-800); border-radius:8px;">
        <div style="font-weight:500; margin-bottom:4px;">🚫 How do I block or report?</div>
        <div style="font-size:12px; color:var(--text-mid);">Tap the profile menu and select Block or Report to keep Afterglow safe.</div>
      </div>
    </div>
  `);
}

function reportProblem(){
  openSettingsModal('Report a Problem', `
    <div style="display:flex; flex-direction:column; gap:14px;">
      <div>
        <label style="font-size:12px; color:var(--text-low);">Issue Type</label>
        <select style="width:100%; padding:10px; background:var(--navy-800); border:1px solid rgba(255,255,255,.08); border-radius:8px; color:white; margin-top:4px;">
          <option>Inappropriate profile</option>
          <option>Offensive messages</option>
          <option>Technical issue</option>
          <option>Payment issue</option>
          <option>Other</option>
        </select>
      </div>
      <div>
        <label style="font-size:12px; color:var(--text-low);">Description</label>
        <textarea style="width:100%; padding:10px; background:var(--navy-800); border:1px solid rgba(255,255,255,.08); border-radius:8px; color:white; margin-top:4px; min-height:100px; font-family:inherit;" placeholder="Tell us what happened"></textarea>
      </div>
      <button class="btn btn-primary btn-block" onclick="submitReport()">Submit Report</button>
    </div>
  `);
}

function submitReport(){
  toast('✅ Report submitted. Our team will review it shortly.');
  closeModal('settings');
}

// ============ HELPER FUNCTIONS ============

function openSettingsModal(title, content){
  document.getElementById('settings-title').textContent = title;
  document.getElementById('settings-content').innerHTML = content;
  openModal('settings');
}

function logout(){
  if(confirm('Log out of Afterglow?')){
    STATE.user = null;
    STATE.matches = [];
    STATE.swipesSent = 0;
    persist();
    // Redirect to login
    window.location.href = 'index.html';
  }
}

