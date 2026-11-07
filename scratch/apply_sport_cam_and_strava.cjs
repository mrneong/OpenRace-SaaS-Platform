const fs = require('fs');

const mainPath = 'workspace/backend/src/main.ts';
let code = fs.readFileSync(mainPath, 'utf8');

// 1. Add .sport-active-nav CSS style
const targetStyle = `.mantis-active-nav {
      background-color: #E6F7FF !important;
      color: #1890FF !important;
      border-right: 3px solid #1890FF !important;
      font-weight: 600 !important;
    }`;

const replStyle = `.mantis-active-nav {
      background-color: #E6F7FF !important;
      color: #1890FF !important;
      border-right: 3px solid #1890FF !important;
      font-weight: 600 !important;
    }
    /* [AC-SPORT-CAM-PARITY-01] Sport Cam Sidebar & Active Nav */
    .sport-active-nav {
      background: linear-gradient(135deg, rgba(255, 91, 38, 0.12) 0%, rgba(255, 130, 84, 0.08) 100%) !important;
      color: #FF5B26 !important;
      border-left: 3px solid #FF5B26 !important;
      font-weight: 700 !important;
    }
    .sport-active-nav svg {
      color: #FF5B26 !important;
    }`;

if (!code.includes('.sport-active-nav')) {
  code = code.replace(targetStyle, replStyle);
  console.log('✓ Added .sport-active-nav CSS');
}

// 2. Add #sport-docked-sidebar after #mantis-sidebar
const targetMantisSidebarEnd = `          <span class="text-xs text-[#8C8C8C]">›</span>
        </div>
      </div>
    </div>
  </aside>`;

const sportDockedSidebarHtml = `          <span class="text-xs text-[#8C8C8C]">›</span>
        </div>
      </div>
    </div>
  </aside>

  <!-- ==================================================== -->
  <!-- [AC-SPORT-CAM-PARITY-01] SPORT CAM DOCKED SIDEBAR NAVIGATION -->
  <!-- Full 100% Parity with Mantis Material UI (Orange #FF5B26 Branding) -->
  <!-- ==================================================== -->
  <aside id="sport-docked-sidebar" class="hidden w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col justify-between shrink-0 z-40 h-screen sticky top-0 shadow-[2px_0_8px_rgba(0,0,0,0.03)] text-sm">
    <div class="flex flex-col h-full overflow-y-auto no-scrollbar">
      <!-- Brand Header: Sport Cam Orange Logo & App Name -->
      <div class="h-16 flex items-center justify-between px-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div class="flex items-center gap-2.5 cursor-pointer" onclick="switchTab('dashboard')">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#FF5B26] to-[#FF8254] flex items-center justify-center text-white shadow-xs">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          </div>
          <div class="flex flex-col">
            <div class="flex items-center gap-1.5">
              <span class="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">OpenRace</span>
              <span class="px-1.5 py-0.2 rounded text-[10px] font-black bg-orange-50 text-[#FF5B26] border border-orange-200 uppercase">SPORT</span>
            </div>
            <span class="text-[10px] text-slate-400 font-mono">v3.31 Enterprise</span>
          </div>
        </div>
      </div>

      <!-- Navigation Tree: Full 34 Menu Items & 4 Portals -->
      <div class="px-3 py-4 space-y-4 flex-1" id="sport-docked-navigation-container">
        <!-- GROUP I: PHÂN HỆ VẬN ĐỘNG VIÊN (RUNNER PORTAL) -->
        <div id="sport-group-runner" class="sport-portal-group space-y-1 transition-all">
          <div class="px-3 text-[11px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
            <span>🏃</span>
            <span>Phân Hệ Vận Động Viên</span>
          </div>

          <a href="javascript:void(0)" onclick="switchTab('dashboard')" id="sport-nav-dashboard" class="sport-nav-item flex items-center gap-3 px-3 py-2 rounded-xl text-slate-700 hover:bg-orange-50 hover:text-[#FF5B26] transition text-[13px] font-medium sport-active-nav">
            <svg class="w-4 h-4 text-[#FF5B26]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
            <span class="font-medium">Tổng Quan</span>
          </a>

          <a href="javascript:void(0)" onclick="switchTab('activities-all')" id="sport-nav-activities-all" class="sport-nav-item flex items-center gap-3 px-3 py-2 rounded-xl text-slate-700 hover:bg-orange-50 hover:text-[#FF5B26] transition text-[13px]">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            <span>Toàn bộ bài chạy</span>
          </a>

          <a href="javascript:void(0)" onclick="switchTab('activities-filter')" id="sport-nav-activities-filter" class="sport-nav-item flex items-center gap-3 px-3 py-2 rounded-xl text-slate-700 hover:bg-orange-50 hover:text-[#FF5B26] transition text-[13px]">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
            <span>Lọc theo giải đấu</span>
          </a>

          <a href="javascript:void(0)" onclick="switchTab('activities-inspection')" id="sport-nav-activities-inspection" class="sport-nav-item flex items-center gap-3 px-3 py-2 rounded-xl text-slate-700 hover:bg-orange-50 hover:text-[#FF5B26] transition text-[13px]">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
            <span>Chi tiết thẩm định &amp; Trail</span>
          </a>

          <a href="javascript:void(0)" onclick="switchTab('activities-appeals')" id="sport-nav-activities-appeals" class="sport-nav-item flex items-center gap-3 px-3 py-2 rounded-xl text-slate-700 hover:bg-orange-50 hover:text-[#FF5B26] transition text-[13px]">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            <span>Trung tâm khiếu nại</span>
          </a>

          <a href="javascript:void(0)" onclick="switchTab('my-races')" id="sport-nav-my-races" class="sport-nav-item flex items-center gap-3 px-3 py-2 rounded-xl text-slate-700 hover:bg-orange-50 hover:text-[#FF5B26] transition text-[13px]">
            <span class="w-4 h-4 flex items-center justify-center text-sm">🎖️</span>
            <span>Giải Đấu Của Tôi</span>
          </a>

          <a href="javascript:void(0)" onclick="switchTab('arena')" id="sport-nav-arena" class="sport-nav-item flex items-center gap-3 px-3 py-2 rounded-xl text-slate-700 hover:bg-orange-50 hover:text-[#FF5B26] transition text-[13px]">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span>Bảng Xếp Hạng</span>
          </a>

          <a href="javascript:void(0)" onclick="switchTab('strava-sync')" id="sport-nav-strava-sync" class="sport-nav-item flex items-center gap-3 px-3 py-2 rounded-xl text-slate-700 hover:bg-orange-50 hover:text-[#FF5B26] transition text-[13px]">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            <span>Kết Nối Thiết Bị</span>
          </a>

          <a href="javascript:void(0)" onclick="switchTab('athlete-debt')" id="sport-nav-athlete-debt" class="sport-nav-item flex items-center gap-3 px-3 py-2 rounded-xl text-slate-700 hover:bg-orange-50 hover:text-[#FF5B26] transition text-[13px]">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
            <span>Sổ nợ &amp; Đóng quỹ</span>
          </a>

          <a href="javascript:void(0)" onclick="switchTab('athlete-profile')" id="sport-nav-athlete-profile" class="sport-nav-item flex items-center gap-3 px-3 py-2 rounded-xl text-slate-700 hover:bg-orange-50 hover:text-[#FF5B26] transition text-[13px]">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            <span>Hồ sơ cá nhân &amp; GDPR</span>
          </a>

          <a href="javascript:void(0)" onclick="switchTab('theme-preferences')" id="sport-nav-theme-preferences" class="sport-nav-item flex items-center gap-3 px-3 py-2 rounded-xl text-slate-700 hover:bg-orange-50 hover:text-[#FF5B26] transition text-[13px]">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4 4 4 0 014-4h2a4 4 0 014 4 4 4 0 01-4 4H7zm0 0V9a4 4 0 014-4h2a4 4 0 014 4v12M7 9h10"/></svg>
            <span>Tùy chọn giao diện</span>
          </a>
        </div>

        <!-- GROUP II: PHÂN HỆ CÂU LẠC BỘ & ĐỘI -->
        <div id="sport-group-club" class="sport-portal-group space-y-1 transition-all">
          <div class="px-3 text-[11px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
            <span>🤝</span>
            <span>Phân Hệ Câu Lạc Bộ &amp; Đội</span>
          </div>

          <a href="javascript:void(0)" onclick="switchTab('club-feed')" id="sport-nav-club-feed" class="sport-nav-item flex items-center gap-3 px-3 py-2 rounded-xl text-slate-700 hover:bg-orange-50 hover:text-[#FF5B26] transition text-[13px]">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
            <span>Hồ sơ &amp; Bảng tin CLB</span>
          </a>

          <a href="javascript:void(0)" onclick="switchTab('club-races')" id="sport-nav-club-races" class="sport-nav-item flex items-center gap-3 px-3 py-2 rounded-xl text-slate-700 hover:bg-orange-50 hover:text-[#FF5B26] transition text-[13px]">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>
            <span>Giải thi đấu nội bộ CLB</span>
          </a>

          <a href="javascript:void(0)" onclick="switchTab('club-members')" id="sport-nav-club-members" class="sport-nav-item flex items-center gap-3 px-3 py-2 rounded-xl text-slate-700 hover:bg-orange-50 hover:text-[#FF5B26] transition text-[13px]">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            <span>Thành viên &amp; Cơ cấu đội</span>
          </a>

          <a href="javascript:void(0)" onclick="switchTab('club-invites')" id="sport-nav-club-invites" class="sport-nav-item flex items-center gap-3 px-3 py-2 rounded-xl text-slate-700 hover:bg-orange-50 hover:text-[#FF5B26] transition text-[13px]">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
            <span>Mời TV &amp; Chống In-App</span>
          </a>

          <a href="javascript:void(0)" onclick="openClubDiscoveryModal()" id="sport-nav-club-discovery" class="sport-nav-item flex items-center gap-3 px-3 py-2 rounded-xl text-slate-700 hover:bg-orange-50 hover:text-[#FF5B26] transition text-[13px]">
            <svg class="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <span class="font-bold text-orange-600">Khám Phá &amp; Đăng Ký CLB</span>
          </a>

          <a href="javascript:void(0)" onclick="switchTab('teams')" id="sport-nav-teams" class="sport-nav-item flex items-center gap-3 px-3 py-2 rounded-xl text-slate-700 hover:bg-orange-50 hover:text-[#FF5B26] transition text-[13px]">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            <span>Đội Của Tôi</span>
          </a>

          <a href="javascript:void(0)" onclick="switchTab('social')" id="sport-nav-social" class="sport-nav-item flex items-center gap-3 px-3 py-2 rounded-xl text-slate-700 hover:bg-orange-50 hover:text-[#FF5B26] transition text-[13px]">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/></svg>
            <span>Bảng Tin &amp; Kudos</span>
          </a>

          <a href="javascript:void(0)" onclick="switchTab('chat')" id="sport-nav-chat" class="sport-nav-item flex items-center gap-3 px-3 py-2 rounded-xl text-slate-700 hover:bg-orange-50 hover:text-[#FF5B26] transition text-[13px]">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
            <span>Trợ Lý AI</span>
          </a>

          <a href="javascript:void(0)" onclick="switchTab('governance')" id="sport-nav-governance" class="sport-nav-item flex items-center gap-3 px-3 py-2 rounded-xl text-slate-700 hover:bg-orange-50 hover:text-[#FF5B26] transition text-[13px]">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
            <span>Hoạt Động &amp; Biểu Quyết</span>
          </a>
        </div>

        <!-- GROUP III: PHÂN HỆ BAN ĐIỀU HÀNH CLB -->
        <div id="sport-group-captain" class="sport-portal-group space-y-1 transition-all">
          <div class="px-3 text-[11px] font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
            <span>⚡</span>
            <span>Phân Hệ Ban Điều Hành CLB</span>
          </div>

          <a href="javascript:void(0)" onclick="switchTab('club-profile-manage')" id="sport-nav-club-profile-manage" class="sport-nav-item flex items-center gap-3 px-3 py-2 rounded-xl text-slate-700 hover:bg-orange-50 hover:text-[#FF5B26] transition text-[13px]">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
            <span>Hồ Sơ &amp; Ban Cán Sự CLB</span>
          </a>

          <a href="javascript:void(0)" onclick="switchTab('club-manage')" id="sport-nav-club-manage" class="sport-nav-item flex items-center gap-3 px-3 py-2 rounded-xl text-slate-700 hover:bg-orange-50 hover:text-[#FF5B26] transition text-[13px]">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            <span>Thành Viên</span>
          </a>

          <a href="javascript:void(0)" onclick="switchTab('rules')" id="sport-nav-rules" class="sport-nav-item flex items-center gap-3 px-3 py-2 rounded-xl text-slate-700 hover:bg-orange-50 hover:text-[#FF5B26] transition text-[13px]">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/></svg>
            <span>Quản Lý Giải Đấu</span>
          </a>

          <a href="javascript:void(0)" onclick="switchTab('club-admin')" id="sport-nav-club-admin" class="sport-nav-item flex items-center gap-3 px-3 py-2 rounded-xl text-slate-700 hover:bg-orange-50 hover:text-[#FF5B26] transition text-[13px]">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            <span class="flex-1">Quản Lý Chuyên Môn</span>
          </a>

          <a href="javascript:void(0)" onclick="switchTab('finance-hub')" id="sport-nav-finance-hub" class="sport-nav-item flex items-center gap-3 px-3 py-2 rounded-xl text-slate-700 hover:bg-orange-50 hover:text-[#FF5B26] transition text-[13px]">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            <span>Quản Lý Tài Chính</span>
          </a>

          <a href="javascript:void(0)" onclick="openAdminBroadcastModal()" id="sport-nav-captain-broadcast" class="sport-nav-item flex items-center gap-3 px-3 py-2 rounded-xl text-slate-700 hover:bg-orange-50 hover:text-[#FF5B26] transition text-[13px]">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/></svg>
            <span>Truyền Thông &amp; Chốt Tuần</span>
          </a>
        </div>

        <!-- GROUP IV: PHÂN HỆ QUẢN TRỊ NỀN TẢNG -->
        <div id="sport-group-admin" class="sport-portal-group space-y-1 transition-all">
          <div class="px-3 text-[11px] font-bold text-purple-600 uppercase tracking-wider flex items-center gap-1.5">
            <span>🛡️</span>
            <span>Phân Hệ Quản Trị Nền Tảng</span>
          </div>

          <a href="javascript:void(0)" onclick="switchTab('ops-quota')" id="sport-nav-ops-quota" class="sport-nav-item flex items-center gap-3 px-3 py-2 rounded-xl text-slate-700 hover:bg-orange-50 hover:text-[#FF5B26] transition text-[13px]">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            <span>Strava Quota &amp; Burn Rate</span>
          </a>

          <a href="javascript:void(0)" onclick="switchTab('ops-dlq')" id="sport-nav-ops-dlq" class="sport-nav-item flex items-center gap-3 px-3 py-2 rounded-xl text-slate-700 hover:bg-orange-50 hover:text-[#FF5B26] transition text-[13px]">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
            <span>Webhook &amp; Phẫu Thuật DLQ</span>
          </a>

          <a href="javascript:void(0)" onclick="switchTab('ops-tenants')" id="sport-nav-ops-tenants" class="sport-nav-item flex items-center gap-3 px-3 py-2 rounded-xl text-slate-700 hover:bg-orange-50 hover:text-[#FF5B26] transition text-[13px]">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
            <span>Quản Lý Tenants CLB</span>
          </a>

          <a href="javascript:void(0)" onclick="switchTab('ops-recompute')" id="sport-nav-ops-recompute" class="sport-nav-item flex items-center gap-3 px-3 py-2 rounded-xl text-slate-700 hover:bg-orange-50 hover:text-[#FF5B26] transition text-[13px]">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            <span>Recompute Có Phạm Vi</span>
          </a>

          <a href="javascript:void(0)" onclick="switchTab('ops-traffic')" id="sport-nav-ops-traffic" class="sport-nav-item flex items-center gap-3 px-3 py-2 rounded-xl text-slate-700 hover:bg-orange-50 hover:text-[#FF5B26] transition text-[13px]">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
            <span>Lưu Lượng &amp; Heatmap 24h</span>
          </a>

          <a href="javascript:void(0)" onclick="switchTab('ops-partners')" id="sport-nav-ops-partners" class="sport-nav-item flex items-center gap-3 px-3 py-2 rounded-xl text-slate-700 hover:bg-orange-50 hover:text-[#FF5B26] transition text-[13px]">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>
            <span>Đối Tác &amp; Uptime SLA</span>
          </a>

          <a href="javascript:void(0)" onclick="switchTab('ops-billing')" id="sport-nav-ops-billing" class="sport-nav-item flex items-center gap-3 px-3 py-2 rounded-xl text-slate-700 hover:bg-orange-50 hover:text-[#FF5B26] transition text-[13px]">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span>Kinh Doanh &amp; SaaS MRR</span>
          </a>

          <a href="javascript:void(0)" onclick="switchTab('ops-security')" id="sport-nav-ops-security" class="sport-nav-item flex items-center gap-3 px-3 py-2 rounded-xl text-slate-700 hover:bg-orange-50 hover:text-[#FF5B26] transition text-[13px]">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
            <span>An Ninh &amp; Audit SHA-256</span>
          </a>

          <a href="javascript:void(0)" onclick="switchTab('system-admin'); switchSysAdminTab('users');" id="sport-nav-system-admin" class="sport-nav-item flex items-center gap-3 px-3 py-2 rounded-xl text-slate-700 hover:bg-orange-50 hover:text-[#FF5B26] transition text-[13px]">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            <span>Phân Quyền (RBAC)</span>
          </a>

          <a href="javascript:void(0)" onclick="switchTab('system-admin'); switchSysAdminTab('catalogs');" id="sport-nav-system-catalogs" class="sport-nav-item flex items-center gap-3 px-3 py-2 rounded-xl text-slate-700 hover:bg-orange-50 hover:text-[#FF5B26] transition text-[13px]">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
            <span>Tham Số Hệ Thống</span>
          </a>
        </div>
      </div>

      <!-- Bottom User Profile Card: Sport Orange Style -->
      <div class="p-3 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/60 dark:bg-slate-800/40">
        <div class="flex items-center justify-between p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition cursor-pointer shadow-2xs" onclick="switchTab('finance')">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-[#FF5B26] to-amber-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              NA
            </div>
            <div>
              <div class="text-[13px] font-bold text-slate-800 dark:text-slate-100">Nguyễn Văn A</div>
              <div class="text-[11px] text-[#FF5B26] font-semibold">Đội trưởng • Phoenix SARC</div>
            </div>
          </div>
          <span class="text-xs text-slate-400">›</span>
        </div>
      </div>
    </div>
  </aside>`;

if (!code.includes('id="sport-docked-sidebar"')) {
  code = code.replace(targetMantisSidebarEnd, sportDockedSidebarHtml);
  console.log('✓ Added #sport-docked-sidebar');
}

// 3. Add #modal-strava-authorize before #modal-strava-setup
const modalStravaAuthorizeHtml = `  <!-- [AC-STRAVA-OAUTH-WEBHOOK-01..02] MODAL: STRAVA OAUTH 2.0 AUTHORIZATION & 24/7 REALTIME WEBHOOK -->
  <div id="modal-strava-authorize" class="hidden fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
    <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in duration-200">
      <!-- Modal Header with Official Strava Brand Color #FC4C02 -->
      <div class="bg-gradient-to-r from-[#FC4C02] via-[#E34000] to-[#C93300] text-white p-5 flex items-center justify-between shadow-md">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-white shrink-0">
            <svg class="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7.01 13.828h4.172"/></svg>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-black tracking-wider uppercase bg-white/20 px-2 py-0.5 rounded-full">OAuth 2.0 Consent</span>
              <span class="text-xs font-bold text-orange-100">Live Handshake</span>
            </div>
            <h3 class="text-base font-extrabold text-white mt-0.5 tracking-tight">Ủy Quyền Strava &amp; Kích Hoạt Webhook</h3>
          </div>
        </div>
        <button onclick="closeStravaAuthorizeModal()" class="w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 text-white flex items-center justify-center text-xs font-bold transition cursor-pointer">✕</button>
      </div>

      <div class="p-5 sm:p-6 space-y-4 text-xs">
        <!-- Athlete Profile Identity Confirmation -->
        <div class="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-full bg-gradient-to-tr from-[#FC4C02] to-amber-500 text-white font-bold flex items-center justify-center text-sm shadow-sm">
              NA
            </div>
            <div>
              <div class="font-extrabold text-slate-900 dark:text-white text-sm" id="modal-strava-athlete-name">Nguyễn Văn A</div>
              <div class="text-[11px] text-slate-500 font-mono">Strava Athlete ID: <span class="font-bold text-[#FC4C02]">#9482012</span></div>
            </div>
          </div>
          <span class="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            ✓ Đã xác thực
          </span>
        </div>

        <!-- Granular Scope Checkboxes -->
        <div class="space-y-2">
          <div class="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Phạm Vi Cấp Quyền Truy Cập (Scopes)</div>
          
          <label class="flex items-start gap-3 p-3 bg-slate-50/70 hover:bg-slate-50 rounded-2xl border border-slate-200/70 cursor-pointer transition">
            <input type="checkbox" id="auth-scope-read" checked class="mt-0.5 w-4 h-4 text-[#FC4C02] rounded border-slate-300 focus:ring-[#FC4C02] accent-[#FC4C02]">
            <div class="flex-1">
              <div class="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <code class="font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded text-[11px]">read</code>
                <span>Hồ sơ cơ bản</span>
              </div>
              <p class="text-[11px] text-slate-500 mt-0.5">Cho phép OpenRace đọc tên, ảnh đại diện, giới tính và câu lạc bộ công khai trên Strava.</p>
            </div>
          </label>

          <label class="flex items-start gap-3 p-3 bg-orange-50/40 hover:bg-orange-50/70 rounded-2xl border border-orange-200/80 cursor-pointer transition">
            <input type="checkbox" id="auth-scope-activity" checked class="mt-0.5 w-4 h-4 text-[#FC4C02] rounded border-slate-300 focus:ring-[#FC4C02] accent-[#FC4C02]">
            <div class="flex-1">
              <div class="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <code class="font-mono text-[#FC4C02] bg-orange-50 px-1.5 py-0.5 rounded text-[11px] font-bold">activity:read_all</code>
                <span class="text-[#FC4C02] font-black">[BẮT BUỘC]</span>
                <span>Toàn bộ bài chạy</span>
              </div>
              <p class="text-[11px] text-slate-600 mt-0.5">Tự động tiếp nhận bài chạy (kể cả bài để chế độ chỉ mình tôi) để đối soát Pace, cự ly và tính điểm giải đấu.</p>
            </div>
          </label>

          <label class="flex items-start gap-3 p-3 bg-slate-50/70 hover:bg-slate-50 rounded-2xl border border-slate-200/70 cursor-pointer transition">
            <input type="checkbox" id="auth-scope-profile" checked class="mt-0.5 w-4 h-4 text-[#FC4C02] rounded border-slate-300 focus:ring-[#FC4C02] accent-[#FC4C02]">
            <div class="flex-1">
              <div class="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <code class="font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded text-[11px]">profile:read_all</code>
                <span>Thông số cảm biến &amp; thiết bị</span>
              </div>
              <p class="text-[11px] text-slate-500 mt-0.5">Đọc thông số nhịp tim, guồng chân (cadence), độ cao D+ và thiết bị đeo (Garmin / Coros / Apple Watch).</p>
            </div>
          </label>
        </div>

        <!-- 24/7 Webhook Real-time Connection Toggle -->
        <div class="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200/80 space-y-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-base">⚡</span>
              <div>
                <div class="font-bold text-slate-900 text-xs">Kết Nối Webhook Thời Gian Thực 24/7</div>
                <div class="text-[10px] text-orange-600 font-semibold">Tự động đẩy bài chạy về OpenRace (Zero Delay)</div>
              </div>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" id="auth-webhook-toggle" checked class="sr-only peer">
              <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FC4C02]"></div>
            </label>
          </div>
          <div class="text-[11px] text-slate-600 pt-1 border-t border-orange-200/40 flex items-center justify-between flex-wrap gap-1 font-mono">
            <span>Callback Handshake:</span>
            <code class="text-slate-800 font-bold bg-white/80 px-2 py-0.5 rounded text-[10px]">https://openrace.vn/api/webhooks/strava</code>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button onclick="closeStravaAuthorizeModal()" class="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs transition cursor-pointer">
            Đóng
          </button>
          <button id="btn-confirm-strava-authorize" onclick="confirmStravaAuthorization()" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FC4C02] to-[#E34000] hover:from-[#e04300] hover:to-[#c93300] text-white font-extrabold text-xs shadow-md shadow-orange-500/20 transition flex items-center gap-2 active:scale-95 cursor-pointer">
            <span>⚡ Xác Nhận Ủy Quyền &amp; Kích Hoạt Webhook</span>
          </button>
        </div>
      </div>
    </div>
  </div>\n\n`;

const targetSetupModal = '  <!-- [AC-STRAVA-CONNECT-01] MODAL: STRAVA OAUTH 2.0 CONNECTION SETUP & CREDENTIALS CONFIG -->';
if (!code.includes('id="modal-strava-authorize"')) {
  code = code.replace(targetSetupModal, modalStravaAuthorizeHtml + targetSetupModal);
  console.log('✓ Added #modal-strava-authorize');
}

// 4. Update reconnection button in #tab-strava-sync and modal setup
code = code.replace(
  `button onclick="reconnectStravaClient()" id="btn-strava-reconnect"`,
  `button onclick="openStravaAuthorizeModal()" id="btn-strava-reconnect"`
);
code = code.replace(
  `button id="btn-strava-1click-connect" onclick="reconnectStrava()"`,
  `button id="btn-strava-1click-connect" onclick="openStravaAuthorizeModal()"`
);

// 5. Update backend API routes in main.ts
const targetApiReconnect = `    // 2. POST /api/v1/me/strava/reconnect
    if (req.method === 'POST' && (pathname === '/api/v1/me/strava/reconnect' || pathname === '/api/me/strava/reconnect')) {
      const result = v2CommunityUseCase.reconnectStrava('user-01');
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(result));
      return true;
    }`;

const replApiAuthorize = `    // 2. POST /api/v1/me/strava/reconnect
    if (req.method === 'POST' && (pathname === '/api/v1/me/strava/reconnect' || pathname === '/api/me/strava/reconnect')) {
      const result = v2CommunityUseCase.reconnectStrava('user-01');
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(result));
      return true;
    }

    // [AC-STRAVA-OAUTH-WEBHOOK-01..02] POST /api/me/strava/authorize (Granular Scopes & Realtime Webhook Handshake)
    if (req.method === 'POST' && (pathname === '/api/v1/me/strava/authorize' || pathname === '/api/me/strava/authorize')) {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body || '{}');
          const result = v2CommunityUseCase.authorizeStrava('user-01', payload);
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify(result));
        } catch (e: any) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: e.message || 'Lỗi ủy quyền Strava' }));
        }
      });
      return true;
    }`;

if (!code.includes("pathname === '/api/v1/me/strava/authorize'")) {
  code = code.replace(targetApiReconnect, replApiAuthorize);
  console.log('✓ Added POST /api/me/strava/authorize endpoint');
}

// 6. Update Strava client scripts
const targetReconnectFunc = `    async function reconnectStrava() {
      try {
        const res = await fetch('/api/me/strava/reconnect', { method: 'POST' });
        const data = await res.json();
        currentStravaConfig.status = 'ACTIVE';
        updateStravaUiState('ACTIVE');
        const modal = document.getElementById('modal-strava-setup');
        if (modal && !modal.classList.contains('hidden')) modal.classList.add('hidden');
        showToast('✓ Đã kết nối lại Strava OAuth 2.0 thành công!');
      } catch (e) {
        currentStravaConfig.status = 'ACTIVE';
        updateStravaUiState('ACTIVE');
        showToast('✓ Đã kết nối lại Strava OAuth 2.0 thành công!');
      }
    }`;

const replAuthorizeFuncs = `    function openStravaAuthorizeModal() {
      const modal = document.getElementById('modal-strava-authorize');
      if (modal) {
        modal.classList.remove('hidden');
        const sRead = document.getElementById('auth-scope-read');
        const sAct = document.getElementById('auth-scope-activity');
        const sProf = document.getElementById('auth-scope-profile');
        const whToggle = document.getElementById('auth-webhook-toggle');
        if (sRead) sRead.checked = true;
        if (sAct) sAct.checked = true;
        if (sProf) sProf.checked = true;
        if (whToggle) whToggle.checked = true;
      }
    }

    function closeStravaAuthorizeModal() {
      const modal = document.getElementById('modal-strava-authorize');
      if (modal) modal.classList.add('hidden');
    }

    async function confirmStravaAuthorization() {
      const sRead = document.getElementById('auth-scope-read')?.checked;
      const sAct = document.getElementById('auth-scope-activity')?.checked;
      const sProf = document.getElementById('auth-scope-profile')?.checked;
      const whToggle = document.getElementById('auth-webhook-toggle')?.checked !== false;

      const scopes = [];
      if (sRead) scopes.push('read');
      if (sAct) scopes.push('activity:read_all');
      if (sProf) scopes.push('profile:read_all');

      try {
        const res = await fetch('/api/me/strava/authorize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scopes: scopes.length > 0 ? scopes : ['read', 'activity:read_all', 'profile:read_all'],
            webhookRealtime: whToggle,
            athleteId: 9482012,
            athleteName: 'Nguyễn Văn A'
          })
        });
        const data = await res.json();
        currentStravaConfig.status = 'ACTIVE';
        updateStravaUiState('ACTIVE');
        closeStravaAuthorizeModal();

        const setupModal = document.getElementById('modal-strava-setup');
        if (setupModal && !setupModal.classList.contains('hidden')) setupModal.classList.add('hidden');

        // Prepend real-time webhook packet row into table
        const packet = data.webhookPacket || {};
        const actId = packet.stravaActivityId || ('128941' + Math.floor(10000 + Math.random() * 90000));
        const tbody = document.getElementById('tab-strava-sync-logs-tbody');
        if (tbody) {
          const newRow = document.createElement('tr');
          newRow.className = 'hover:bg-slate-50/70 transition bg-emerald-50/30 font-semibold';
          newRow.innerHTML =
            '<td class="p-3.5 font-mono text-[11px] text-emerald-700 font-bold">Vừa xong (Live)</td>' +
            '<td class="p-3.5 font-mono text-blue-600 font-bold">#' + actId + '</td>' +
            '<td class="p-3.5"><span class="px-2 py-0.5 rounded bg-orange-100 text-orange-800 font-mono text-[10px] font-bold">activity/create</span></td>' +
            '<td class="p-3.5 font-mono text-emerald-600 font-bold">200 OK</td>' +
            '<td class="p-3.5"><span class="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">✓ Processed</span></td>' +
            '<td class="p-3.5 text-slate-700 font-medium">Run • 5.5km • Hợp lệ (Realtime Webhook 24/7 Handshake)</td>' +
            '<td class="p-3.5 text-right">' +
              '<button onclick="viewRawPayload(\\'' + actId + '\\')" class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-mono text-[10px] font-bold transition">Xem JSON</button>' +
            '</td>';
          tbody.insertBefore(newRow, tbody.firstChild);
        }

        showToast('✓ Đã cấp quyền Strava OAuth 2.0 & kích hoạt thành công Webhook Realtime 24/7!');
      } catch (e: any) {
        showToast('Lỗi ủy quyền Strava: ' + e.message);
      }
    }

    async function reconnectStrava() {
      openStravaAuthorizeModal();
    }`;

if (!code.includes('function openStravaAuthorizeModal')) {
  code = code.replace(targetReconnectFunc, replAuthorizeFuncs);
  console.log('✓ Updated reconnectStrava to open authorization modal and added confirmStravaAuthorization');
}

// 7. Update setAppTheme to toggle #sport-docked-sidebar
const targetSetAppTheme = `    function setAppTheme(theme, notify = true) {
      if (theme === 'mantis') {
        document.body.setAttribute('data-theme', 'mantis');
        document.body.classList.add('theme-mantis');
        
        // Hide Sport layout elements
        document.getElementById('slim-rail')?.classList.add('hidden');
        document.getElementById('openrace-header')?.classList.add('hidden');
        document.getElementById('sub-nav-bar')?.classList.add('hidden');
        document.getElementById('openrace-dashboard-view')?.classList.add('hidden');
        
        // Show Mantis layout elements
        document.getElementById('mantis-sidebar')?.classList.remove('hidden');
        document.getElementById('mantis-header')?.classList.remove('hidden');
        const activeTabEl = document.querySelector('.tab-content.active');
        if (!activeTabEl || activeTabEl.id === 'tab-dashboard') {
          document.getElementById('mantis-dashboard-view')?.classList.remove('hidden');
        } else {
          document.getElementById('mantis-dashboard-view')?.classList.add('hidden');
        }
        
        localStorage.setItem('openrace_ui_theme', 'mantis');
        localStorage.setItem('openrace_theme', 'mantis');
        if (notify) showToast('✓ Đã kích hoạt Giao diện Mantis Material UI');
      } else {
        document.body.setAttribute('data-theme', 'sport');
        document.body.classList.remove('theme-mantis');
        
        // Show Sport layout elements
        document.getElementById('slim-rail')?.classList.remove('hidden');
        document.getElementById('openrace-header')?.classList.remove('hidden');
        document.getElementById('sub-nav-bar')?.classList.remove('hidden');
        document.getElementById('openrace-dashboard-view')?.classList.remove('hidden');
        
        // Hide Mantis layout elements
        document.getElementById('mantis-sidebar')?.classList.add('hidden');
        document.getElementById('mantis-header')?.classList.add('hidden');
        document.getElementById('mantis-dashboard-view')?.classList.add('hidden');
        
        localStorage.setItem('openrace_ui_theme', 'sport');
        localStorage.setItem('openrace_theme', 'sport');
        if (notify) showToast('✓ Đã quay lại Giao diện OpenRace Thể Thao Cam');
      }
    }`;

const replSetAppTheme = `    function setAppTheme(theme, notify = true) {
      if (theme === 'mantis') {
        document.body.setAttribute('data-theme', 'mantis');
        document.body.classList.add('theme-mantis');
        
        // Hide Sport layout elements
        document.getElementById('slim-rail')?.classList.add('hidden');
        document.getElementById('sport-docked-sidebar')?.classList.add('hidden');
        document.getElementById('openrace-header')?.classList.add('hidden');
        document.getElementById('sub-nav-bar')?.classList.add('hidden');
        document.getElementById('openrace-dashboard-view')?.classList.add('hidden');
        
        // Show Mantis layout elements
        document.getElementById('mantis-sidebar')?.classList.remove('hidden');
        document.getElementById('mantis-header')?.classList.remove('hidden');
        const activeTabEl = document.querySelector('.tab-content.active');
        if (!activeTabEl || activeTabEl.id === 'tab-dashboard') {
          document.getElementById('mantis-dashboard-view')?.classList.remove('hidden');
        } else {
          document.getElementById('mantis-dashboard-view')?.classList.add('hidden');
        }
        
        localStorage.setItem('openrace_ui_theme', 'mantis');
        localStorage.setItem('openrace_theme', 'mantis');
        if (notify) showToast('✓ Đã kích hoạt Giao diện Mantis Material UI');
      } else {
        document.body.setAttribute('data-theme', 'sport');
        document.body.classList.remove('theme-mantis');
        
        // Hide Mantis layout elements
        document.getElementById('mantis-sidebar')?.classList.add('hidden');
        document.getElementById('mantis-header')?.classList.add('hidden');
        document.getElementById('mantis-dashboard-view')?.classList.add('hidden');
        
        // Show Sport layout elements with full docked sidebar
        document.getElementById('slim-rail')?.classList.add('hidden');
        document.getElementById('sport-docked-sidebar')?.classList.remove('hidden');
        document.getElementById('openrace-header')?.classList.remove('hidden');
        document.getElementById('sub-nav-bar')?.classList.remove('hidden');
        
        const activeTabEl = document.querySelector('.tab-content.active');
        if (!activeTabEl || activeTabEl.id === 'tab-dashboard') {
          document.getElementById('openrace-dashboard-view')?.classList.remove('hidden');
        } else {
          document.getElementById('openrace-dashboard-view')?.classList.add('hidden');
        }
        
        localStorage.setItem('openrace_ui_theme', 'sport');
        localStorage.setItem('openrace_theme', 'sport');
        if (notify) showToast('✓ Đã quay lại Giao diện Sport Cam Thể Thao Cam');
      }
    }`;

if (code.includes(targetSetAppTheme)) {
  code = code.replace(targetSetAppTheme, replSetAppTheme);
  console.log('✓ Updated setAppTheme to toggle #sport-docked-sidebar');
}

// 8. Update switchTab to highlight active item in #sport-docked-sidebar
const targetSwitchTabHighlight = `      // Update Mantis Nav Item Active Highlight in #mantis-sidebar
      document.querySelectorAll('#mantis-sidebar .mantis-nav-item').forEach(el => {
        el.classList.remove('mantis-active-nav');
        const icon = el.querySelector('svg');
        if (icon) {
          icon.classList.remove('text-[#1890FF]');
          icon.classList.add('text-[#8C8C8C]');
        }
      });
      const activeMantisNav = document.getElementById('mantis-nav-' + resolvedId);
      if (activeMantisNav) {
        activeMantisNav.classList.add('mantis-active-nav');
        const icon = activeMantisNav.querySelector('svg');
        if (icon) {
          icon.classList.remove('text-[#8C8C8C]');
          icon.classList.add('text-[#1890FF]');
        }
      }`;

const replSwitchTabHighlight = `      // Update Mantis Nav Item Active Highlight in #mantis-sidebar
      document.querySelectorAll('#mantis-sidebar .mantis-nav-item').forEach(el => {
        el.classList.remove('mantis-active-nav');
        const icon = el.querySelector('svg');
        if (icon) {
          icon.classList.remove('text-[#1890FF]');
          icon.classList.add('text-[#8C8C8C]');
        }
      });
      const activeMantisNav = document.getElementById('mantis-nav-' + resolvedId);
      if (activeMantisNav) {
        activeMantisNav.classList.add('mantis-active-nav');
        const icon = activeMantisNav.querySelector('svg');
        if (icon) {
          icon.classList.remove('text-[#8C8C8C]');
          icon.classList.add('text-[#1890FF]');
        }
      }

      // [AC-SPORT-CAM-PARITY-01] Update Sport Nav Item Active Highlight in #sport-docked-sidebar
      document.querySelectorAll('#sport-docked-sidebar .sport-nav-item').forEach(el => {
        el.classList.remove('sport-active-nav');
        const icon = el.querySelector('svg');
        if (icon) {
          icon.classList.remove('text-[#FF5B26]');
          icon.classList.add('text-slate-400');
        }
      });
      const activeSportNav = document.getElementById('sport-nav-' + resolvedId);
      if (activeSportNav) {
        activeSportNav.classList.add('sport-active-nav');
        const icon = activeSportNav.querySelector('svg');
        if (icon) {
          icon.classList.remove('text-slate-400');
          icon.classList.add('text-[#FF5B26]');
        }
      }`;

if (code.includes(targetSwitchTabHighlight)) {
  code = code.replace(targetSwitchTabHighlight, replSwitchTabHighlight);
  console.log('✓ Updated switchTab to highlight active item in #sport-docked-sidebar');
}

// 9. Update switchRolePortal to filter #sport-group-
const targetRoleFilter = `      // Filter Mantis Sidebar Groups
      ['runner', 'club', 'captain', 'admin'].forEach(r => {
        const el = document.getElementById('mantis-group-' + r);
        if (el) {
          if (role === 'all' || role === r) {
            el.classList.remove('hidden');
          } else {
            el.classList.add('hidden');
          }
        }
      });`;

const replRoleFilter = `      // Filter Mantis Sidebar Groups
      ['runner', 'club', 'captain', 'admin'].forEach(r => {
        const el = document.getElementById('mantis-group-' + r);
        if (el) {
          if (role === 'all' || role === r) {
            el.classList.remove('hidden');
          } else {
            el.classList.add('hidden');
          }
        }
      });

      // [AC-SPORT-CAM-PARITY-01] Filter Sport Docked Sidebar Groups
      ['runner', 'club', 'captain', 'admin'].forEach(r => {
        const el = document.getElementById('sport-group-' + r);
        if (el) {
          if (role === 'all' || role === r) {
            el.classList.remove('hidden');
          } else {
            el.classList.add('hidden');
          }
        }
      });`;

if (code.includes(targetRoleFilter)) {
  code = code.replace(targetRoleFilter, replRoleFilter);
  console.log('✓ Updated switchRolePortal to filter sport groups');
}

fs.writeFileSync(mainPath, code, 'utf8');
console.log('Successfully updated main.ts!');
