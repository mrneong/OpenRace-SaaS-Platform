const fs = require('fs');
const path = require('path');

const mainTsPath = path.resolve(__dirname, 'backend/src/main.ts');
let content = fs.readFileSync(mainTsPath, 'utf8');

// Backup original file if not exists
if (!fs.existsSync(mainTsPath + '.bak')) {
  fs.writeFileSync(mainTsPath + '.bak', content, 'utf8');
  console.log('Backed up main.ts');
}

// 1. UPDATE SLIM RAIL to include icons for [7.0] Teams, [8.0] Social, [9.0] Chat & AI, [10.0] ERP, [1.B] Strava
const oldRail = `        <button onclick="switchTab('finance')" id="rail-btn-finance" class="w-10 h-10 rounded-2xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition" title="[5.0] Cá Nhân & Sổ Nợ">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
        </button>
        <button onclick="switchTab('rules')" id="rail-btn-rules" class="w-10 h-10 rounded-2xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition" title="[7.0] Điều Hành Giải Đấu">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
        </button>`;

const newRail = `        <button onclick="switchTab('finance')" id="rail-btn-finance" class="w-10 h-10 rounded-2xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition" title="[5.0] Cá Nhân & Sổ Nợ">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
        </button>
        <button onclick="switchTab('rules')" id="rail-btn-rules" class="w-10 h-10 rounded-2xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition" title="[6.0] Điều Hành Thể Lệ">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
        </button>
        <!-- V2.1 NEW RAIL BUTTONS -->
        <button onclick="switchTab('teams')" id="rail-btn-teams" class="w-10 h-10 rounded-2xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition relative" title="[7.0] Đội Thi Đấu & Quyền Đội Trưởng (v2.1)">
          <svg class="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"/></svg>
          <span class="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-500"></span>
        </button>
        <button onclick="switchTab('social')" id="rail-btn-social" class="w-10 h-10 rounded-2xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition relative" title="[8.0] Mạng Xã Hội, Kudos & Bạn Bè (v2.1)">
          <svg class="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
          <span class="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500"></span>
        </button>
        <button onclick="switchTab('chat')" id="rail-btn-chat" class="w-10 h-10 rounded-2xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition relative" title="[9.0] Chat Trực Tiếp & AI PacerBot, Banter (v2.1)">
          <svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
          <span class="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
        </button>
        <button onclick="switchTab('governance')" id="rail-btn-governance" class="w-10 h-10 rounded-2xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition relative" title="[10.0] Điều Hành CLB ERP (RSVP & Polls) (v2.1)">
          <svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
          <span class="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500"></span>
        </button>
        <button onclick="switchTab('strava-sync')" id="rail-btn-strava-sync" class="w-10 h-10 rounded-2xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition relative" title="[1.B] Quản Lý Strava & Nhật Ký Sync (v2.1)">
          <svg class="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
        </button>`;

if (content.includes(oldRail)) {
  content = content.replace(oldRail, newRail);
  console.log('Updated slim rail');
} else {
  console.log('Could not find exact oldRail, checking if already updated');
}

fs.writeFileSync(mainTsPath, content, 'utf8');
console.log('Step 1 complete');
