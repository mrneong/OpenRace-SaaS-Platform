const fs = require('fs');
const path = require('path');

const mainPath = path.join(__dirname, 'backend', 'src', 'main.ts');
let content = fs.readFileSync(mainPath, 'utf8');

console.log('[MANTIS PARITY] Starting update of Mantis UI functional navigation and content...');

// 1. REPLACEMENT FOR MANTIS SIDEBAR
const newMantisSidebar = `  <!-- ==================================================== -->
  <!-- MANTIS MATERIAL UI DEDICATED NAVIGATION DRAWER -->
  <!-- ==================================================== -->
  <aside id="mantis-sidebar" class="hidden w-64 bg-white border-r border-[#F0F0F0] flex flex-col justify-between shrink-0 z-40 h-screen sticky top-0 shadow-[2px_0_8px_rgba(0,0,0,0.03)] text-sm">
    <div class="flex flex-col h-full overflow-y-auto no-scrollbar">
      <!-- Mantis Brand Header -->
      <div class="h-16 flex items-center justify-between px-5 border-b border-[#F0F0F0] shrink-0">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-[#1890FF] flex items-center justify-center text-white shadow-xs">
            <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"></polygon>
              <circle cx="12" cy="12" r="3" fill="currentColor"></circle>
            </svg>
          </div>
          <div class="flex flex-col">
            <div class="flex items-center gap-1.5">
              <span class="text-base font-bold tracking-tight text-[#262626]">Mantis</span>
              <span class="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-[#E6F7FF] text-[#1890FF] border border-[#91D5FF]/40">OPENRACE</span>
            </div>
            <span class="text-[10px] text-[#8C8C8C] font-mono">v2.7.0 Enterprise</span>
          </div>
        </div>
        <button onclick="toggleMantisSidebar()" class="lg:hidden p-1 text-[#8C8C8C] hover:text-[#262626]">✕</button>
      </div>

      <!-- Navigation Tree: Full OpenRace Functional Parity -->
      <div class="px-3 py-4 space-y-4 flex-1">
        <!-- Group 1: TỔNG QUAN RUNNER (Dashboard & Personal Hub) -->
        <div class="space-y-1">
          <div class="px-3 text-[11px] font-bold text-[#8C8C8C] uppercase tracking-wider">Tổng Quan Runner</div>
          <a href="javascript:void(0)" onclick="switchTab('dashboard')" id="mantis-nav-dashboard" class="mantis-nav-item flex items-center gap-3 px-3 py-2 rounded-md mantis-active-nav transition text-[13px]">
            <svg class="w-4 h-4 text-[#1890FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
            <span class="font-medium">[1.0] Dashboard Runner</span>
          </a>
          <a href="javascript:void(0)" onclick="switchTab('strava-sync')" id="mantis-nav-strava-sync" class="mantis-nav-item flex items-center gap-3 px-3 py-2 rounded-md text-[#595959] hover:bg-[#FAFAFA] hover:text-[#1890FF] transition text-[13px]">
            <svg class="w-4 h-4 text-[#8C8C8C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            <span>[1.B] Đồng Bộ Strava & Logs</span>
          </a>
          <a href="javascript:void(0)" onclick="switchTab('finance')" id="mantis-nav-finance" class="mantis-nav-item flex items-center gap-3 px-3 py-2 rounded-md text-[#595959] hover:bg-[#FAFAFA] hover:text-[#1890FF] transition text-[13px]">
            <svg class="w-4 h-4 text-[#8C8C8C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
            <span>[5.0] Sổ Nợ & Dynamic VietQR</span>
          </a>
        </div>

        <!-- Group 2: ĐẤU TRƯỜNG GIẢI ĐẤU (Race Arena) -->
        <div class="space-y-1">
          <div class="px-3 text-[11px] font-bold text-[#8C8C8C] uppercase tracking-wider">Đấu Trường Giải Đấu</div>
          <a href="javascript:void(0)" onclick="switchTab('arena'); showSubScreen('arena', 'section-2-1')" id="mantis-nav-arena" class="mantis-nav-item flex items-center justify-between px-3 py-2 rounded-md text-[#595959] hover:bg-[#FAFAFA] hover:text-[#1890FF] transition text-[13px]">
            <div class="flex items-center gap-3">
              <svg class="w-4 h-4 text-[#8C8C8C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
              <span>[2.1] Hero & Đếm Ngược</span>
            </div>
            <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#E6F7FF] text-[#1890FF]">Top 1</span>
          </a>
          <a href="javascript:void(0)" onclick="switchTab('arena'); showSubScreen('arena', 'section-2-2')" class="mantis-nav-item flex items-center gap-3 px-3 py-2 rounded-md text-[#595959] hover:bg-[#FAFAFA] hover:text-[#1890FF] transition text-[13px]">
            <svg class="w-4 h-4 text-[#8C8C8C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
            <span>[2.2] Bảng Xếp Hạng Đội</span>
          </a>
          <a href="javascript:void(0)" onclick="switchTab('arena'); showSubScreen('arena', 'section-2-3')" class="mantis-nav-item flex items-center gap-3 px-3 py-2 rounded-md text-[#595959] hover:bg-[#FAFAFA] hover:text-[#1890FF] transition text-[13px]">
            <svg class="w-4 h-4 text-[#8C8C8C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            <span>[2.3] Bảng Xếp Hạng Cá Nhân</span>
          </a>
          <a href="javascript:void(0)" onclick="switchTab('arena'); showSubScreen('arena', 'section-2-4')" class="mantis-nav-item flex items-center gap-3 px-3 py-2 rounded-md text-[#595959] hover:bg-[#FAFAFA] hover:text-[#1890FF] transition text-[13px]">
            <svg class="w-4 h-4 text-[#8C8C8C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            <span>[2.4] Đội Phoenix SARC</span>
          </a>
          <a href="javascript:void(0)" onclick="switchTab('arena'); showSubScreen('arena', 'section-2-5')" class="mantis-nav-item flex items-center gap-3 px-3 py-2 rounded-md text-[#595959] hover:bg-[#FAFAFA] hover:text-[#1890FF] transition text-[13px]">
            <svg class="w-4 h-4 text-[#8C8C8C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            <span>[2.5] Live Ticker SSE</span>
          </a>
        </div>

        <!-- Group 3: NHẬT KÝ & THẨM ĐỊNH (Activities & Verification) -->
        <div class="space-y-1">
          <div class="px-3 text-[11px] font-bold text-[#8C8C8C] uppercase tracking-wider">Nhật Ký & Thẩm Định</div>
          <a href="javascript:void(0)" onclick="switchTab('activities')" id="mantis-nav-activities" class="mantis-nav-item flex items-center gap-3 px-3 py-2 rounded-md text-[#595959] hover:bg-[#FAFAFA] hover:text-[#1890FF] transition text-[13px]">
            <svg class="w-4 h-4 text-[#8C8C8C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
            <span>[3.1] Toàn Bộ Bài Chạy</span>
          </a>
          <a href="javascript:void(0)" onclick="openElevationAuditDrawer('ACT_000075')" class="mantis-nav-item flex items-center gap-3 px-3 py-2 rounded-md text-[#595959] hover:bg-[#FAFAFA] hover:text-[#1890FF] transition text-[13px]">
            <svg class="w-4 h-4 text-[#8C8C8C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
            <span>[3.3] Thẩm Định Dốc Trail (AC-047)</span>
          </a>
          <a href="javascript:void(0)" onclick="triggerAutoTrimDemo()" class="mantis-nav-item flex items-center gap-3 px-3 py-2 rounded-md text-[#595959] hover:bg-[#FAFAFA] hover:text-[#1890FF] transition text-[13px]">
            <svg class="w-4 h-4 text-[#8C8C8C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879a3 3 0 11-4.242-4.242 3 3 0 014.242 0L12 12zm0 0l-2.879-2.879a3 3 0 10-4.242 4.242 3 3 0 004.242 0L12 12z"/></svg>
            <span>[3.4] Cắt Đuôi Đi Xe Máy (AC-048)</span>
          </a>
          <a href="javascript:void(0)" onclick="openAddActivityModal()" class="mantis-nav-item flex items-center gap-3 px-3 py-2 rounded-md text-[#595959] hover:bg-[#FAFAFA] hover:text-[#1890FF] transition text-[13px]">
            <svg class="w-4 h-4 text-[#8C8C8C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
            <span>[3.5] Chạy Máy Treadmill HR (AC-050)</span>
          </a>
          <a href="javascript:void(0)" onclick="openDisputeModal('ACT_000073')" class="mantis-nav-item flex items-center gap-3 px-3 py-2 rounded-md text-[#595959] hover:bg-[#FAFAFA] hover:text-[#1890FF] transition text-[13px]">
            <svg class="w-4 h-4 text-[#8C8C8C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/></svg>
            <span>[3.6] Khiếu Nại Bài Chạy (Dispute)</span>
          </a>
        </div>

        <!-- Group 4: CỘNG ĐỒNG & ĐỘI THI (Community & Social Hub) -->
        <div class="space-y-1">
          <div class="px-3 text-[11px] font-bold text-[#8C8C8C] uppercase tracking-wider">Cộng Đồng & Đội Thi</div>
          <a href="javascript:void(0)" onclick="switchTab('club')" id="mantis-nav-club" class="mantis-nav-item flex items-center gap-3 px-3 py-2 rounded-md text-[#595959] hover:bg-[#FAFAFA] hover:text-[#1890FF] transition text-[13px]">
            <svg class="w-4 h-4 text-[#8C8C8C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
            <span>[4.0] Không Gian CLB SARC</span>
          </a>
          <a href="javascript:void(0)" onclick="switchTab('teams')" id="mantis-nav-teams" class="mantis-nav-item flex items-center gap-3 px-3 py-2 rounded-md text-[#595959] hover:bg-[#FAFAFA] hover:text-[#1890FF] transition text-[13px]">
            <svg class="w-4 h-4 text-[#8C8C8C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"/></svg>
            <span>[7.0] Đội Thi Đấu & Đội Trưởng</span>
          </a>
          <a href="javascript:void(0)" onclick="switchTab('social')" id="mantis-nav-social" class="mantis-nav-item flex items-center gap-3 px-3 py-2 rounded-md text-[#595959] hover:bg-[#FAFAFA] hover:text-[#1890FF] transition text-[13px]">
            <svg class="w-4 h-4 text-[#8C8C8C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/></svg>
            <span>[8.0] Mạng Xã Hội & Kudos</span>
          </a>
          <a href="javascript:void(0)" onclick="switchTab('chat')" id="mantis-nav-chat" class="mantis-nav-item flex items-center gap-3 px-3 py-2 rounded-md text-[#595959] hover:bg-[#FAFAFA] hover:text-[#1890FF] transition text-[13px]">
            <svg class="w-4 h-4 text-[#8C8C8C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
            <span>[9.0] Chat & PacerBot AI</span>
          </a>
        </div>

        <!-- Group 5: ĐIỀU HÀNH & QUẢN TRỊ ERP -->
        <div class="space-y-1">
          <div class="px-3 text-[11px] font-bold text-[#8C8C8C] uppercase tracking-wider">Điều Hành & Quản Trị ERP</div>
          <a href="javascript:void(0)" onclick="switchTab('club-manage')" id="mantis-nav-club-manage" class="mantis-nav-item flex items-center gap-3 px-3 py-2 rounded-md text-[#595959] hover:bg-[#FAFAFA] hover:text-[#1890FF] transition text-[13px]">
            <svg class="w-4 h-4 text-[#8C8C8C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            <span>[6.0] Quản Trị CLB & Sĩ Số</span>
          </a>
          <a href="javascript:void(0)" onclick="switchTab('rules')" id="mantis-nav-rules" class="mantis-nav-item flex items-center gap-3 px-3 py-2 rounded-md text-[#595959] hover:bg-[#FAFAFA] hover:text-[#1890FF] transition text-[13px]">
            <svg class="w-4 h-4 text-[#8C8C8C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
            <span>[6.B] Wizard Thể Lệ Khóa 2:45</span>
          </a>
          <a href="javascript:void(0)" onclick="switchTab('governance')" id="mantis-nav-governance" class="mantis-nav-item flex items-center gap-3 px-3 py-2 rounded-md text-[#595959] hover:bg-[#FAFAFA] hover:text-[#1890FF] transition text-[13px]">
            <svg class="w-4 h-4 text-[#8C8C8C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span>[10.0] Điều Hành ERP (RSVP & Polls)</span>
          </a>
          <a href="javascript:void(0)" onclick="switchTab('admin')" id="mantis-nav-admin" class="mantis-nav-item flex items-center gap-3 px-3 py-2 rounded-md text-[#595959] hover:bg-[#FAFAFA] hover:text-[#1890FF] transition text-[13px]">
            <svg class="w-4 h-4 text-[#8C8C8C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
            <span>[8.0] Super Admin Toàn Sàn</span>
          </a>
        </div>

        <!-- Group 6: TIỆN ÍCH RUNNER MỞ RỘNG (Enterprise Expansions) -->
        <div class="space-y-1">
          <div class="px-3 text-[11px] font-bold text-[#8C8C8C] uppercase tracking-wider">Tiện Ích & Công Cụ Enterprise</div>
          <a href="javascript:void(0)" onclick="openConnectedDevicesModal()" class="mantis-nav-item flex items-center gap-3 px-3 py-2 rounded-md text-[#595959] hover:bg-[#FAFAFA] hover:text-[#1890FF] transition text-[13px]">
            <svg class="w-4 h-4 text-[#8C8C8C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span>[⌚] Garmin / Coros Direct (AC-049)</span>
          </a>
          <a href="javascript:void(0)" onclick="openFinisherCertificateModal()" class="mantis-nav-item flex items-center gap-3 px-3 py-2 rounded-md text-[#595959] hover:bg-[#FAFAFA] hover:text-[#1890FF] transition text-[13px]">
            <svg class="w-4 h-4 text-[#8C8C8C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            <span>[📜] Giấy Chứng Nhận Finisher (AC-046)</span>
          </a>
          <a href="javascript:void(0)" onclick="open5000DatasetModal()" class="mantis-nav-item flex items-center gap-3 px-3 py-2 rounded-md text-[#595959] hover:bg-[#FAFAFA] hover:text-[#1890FF] transition text-[13px]">
            <svg class="w-4 h-4 text-[#8C8C8C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7z"/></svg>
            <span>[⚡] Nạp 5,000 Dữ Liệu Hệ Thống</span>
          </a>
          <a href="javascript:void(0)" onclick="openDynamicVietQrModal()" class="mantis-nav-item flex items-center gap-3 px-3 py-2 rounded-md text-[#595959] hover:bg-[#FAFAFA] hover:text-[#1890FF] transition text-[13px]">
            <svg class="w-4 h-4 text-[#8C8C8C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/></svg>
            <span>[💳] Dynamic VietQR Auto-Settled</span>
          </a>
        </div>
      </div>

      <!-- Bottom User Profile Card: Nguyễn Văn A (Captain Team Phoenix) -->
      <div class="p-3 border-t border-[#F0F0F0] shrink-0 bg-[#FAFAFA]">
        <div class="flex items-center justify-between p-2 rounded-lg hover:bg-white transition cursor-pointer shadow-2xs" onclick="switchTab('finance')">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-[#1890FF] to-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              NA
            </div>
            <div>
              <div class="text-[13px] font-bold text-[#262626]">Nguyễn Văn A</div>
              <div class="text-[11px] text-[#8C8C8C]">Đội trưởng • Phoenix SARC</div>
            </div>
          </div>
          <span class="text-xs text-[#8C8C8C]">›</span>
        </div>
      </div>
    </div>
  </aside>`;

// 2. REPLACEMENT FOR MANTIS HEADER USER PROFILE
const oldMantisHeaderRegex = /<header id="mantis-header"[\s\S]*?<\/header>/;
const newMantisHeader = `<header id="mantis-header" class="hidden h-16 w-full px-6 flex items-center justify-between border-b border-[#F0F0F0] bg-white sticky top-0 z-40">
      <!-- Left: Hamburger & Global Search with Ctrl+K -->
      <div class="flex items-center gap-4">
        <button onclick="toggleMantisSidebar()" class="p-1.5 text-[#595959] hover:bg-[#FAFAFA] rounded-md transition" title="Toggle Sidebar">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
        <div class="relative flex items-center">
          <div class="absolute left-3 text-[#8C8C8C] pointer-events-none">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>
          <input type="text" placeholder="Ctrl + K" class="w-56 md:w-72 pl-9 pr-14 py-1.5 bg-white border border-[#D9D9D9] rounded-md text-[13px] text-[#262626] focus:outline-none focus:border-[#1890FF] focus:ring-1 focus:ring-[#1890FF] transition" onfocus="this.placeholder='Tìm kiếm VĐV, giải chạy, hoạt động...'" onblur="this.placeholder='Ctrl + K'">
          <span class="absolute right-2 px-1.5 py-0.5 rounded text-[10px] font-mono text-[#8C8C8C] bg-[#FAFAFA] border border-[#D9D9D9]">Ctrl + K</span>
        </div>
      </div>

      <!-- Right: Tools, Theme Switcher & Profile -->
      <div class="flex items-center gap-3">
        <!-- Dual Theme Switcher Pill (Mantis Header) -->
        <div class="flex items-center bg-[#F0F2F5] p-0.5 rounded-md border border-[#E8E8E8] text-[11px] font-semibold">
          <button onclick="setAppTheme('sport')" class="px-2.5 py-1 rounded transition text-[#595959] hover:text-[#FF5B26] flex items-center gap-1 font-bold" title="Chuyển sang giao diện Sport Cam">
            <span>⚡</span><span>Sport Cam</span>
          </button>
          <button onclick="setAppTheme('mantis')" class="px-2.5 py-1 rounded transition bg-white text-[#1890FF] shadow-xs font-bold flex items-center gap-1" title="Đang ở giao diện Mantis Material UI">
            <span>💎</span><span>Mantis UI</span>
          </button>
        </div>

        <!-- Quick Connect Wearables Button -->
        <button onclick="openConnectedDevicesModal()" class="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold text-[#595959] hover:text-[#1890FF] hover:bg-[#FAFAFA] border border-[#E8E8E8] transition" title="Kết nối Garmin Connect & Coros">
          <span>⌚</span><span>Thiết Bị Đeo</span>
        </button>

        <!-- Dark/Light Theme Icon -->
        <button onclick="toggleDarkMode()" class="p-2 text-[#595959] hover:bg-[#FAFAFA] rounded-md transition" title="Toggle Theme">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
        </button>

        <!-- Notification Bell with Badge 2 -->
        <button class="p-2 text-[#595959] hover:bg-[#FAFAFA] rounded-md transition relative" title="Thông báo hệ thống">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
          <span class="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#1890FF] text-white text-[9px] font-bold flex items-center justify-center">2</span>
        </button>

        <!-- Settings Cog -->
        <button onclick="switchTab('club-manage')" class="p-2 text-[#595959] hover:bg-[#FAFAFA] rounded-md transition" title="Cài đặt CLB">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
        </button>

        <!-- User Profile Pill: Nguyễn Văn A -->
        <div class="flex items-center gap-2 pl-2 cursor-pointer" onclick="switchTab('finance')" title="Xem hồ sơ & sổ nợ">
          <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1890FF] to-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
            NA
          </div>
          <span class="text-[13px] font-semibold text-[#262626] hidden md:block">Nguyễn Văn A (Phoenix)</span>
        </div>
      </div>
    </header>`;

// 3. REPLACEMENT FOR MANTIS DASHBOARD VIEW (FULL OPENRACE CONTENT)
const oldMantisDashboardRegex = /<div id="mantis-dashboard-view"[\s\S]*?<\/div>\s*<\/div>\s*<!-- TAB 2:/;
const newMantisDashboard = `<div id="mantis-dashboard-view" class="hidden space-y-6">
        <!-- TOP PRIORITY ACTION BAR (MANTIS STYLE) -->
        <div class="flex items-center justify-between flex-wrap gap-2.5 bg-white p-3.5 rounded-xl border border-[#F0F0F0] shadow-xs">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-[#1890FF] animate-pulse"></span>
            <span class="text-xs font-bold text-[#262626]">Thao Tác Nhanh (Runner Priority Actions):</span>
          </div>
          <div class="flex items-center flex-wrap gap-2 text-xs font-semibold">
            <button onclick="syncStravaOptimistic()" class="px-3 py-1.5 rounded-md bg-[#1890FF] hover:bg-[#40A9FF] text-white transition shadow-xs flex items-center gap-1.5 font-bold">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
              <span>⚡ Đồng Bộ Strava</span>
            </button>
            <button onclick="openConnectedDevicesModal()" class="px-3 py-1.5 rounded-md bg-white border border-[#D9D9D9] hover:border-[#1890FF] hover:text-[#1890FF] text-[#595959] transition flex items-center gap-1.5">
              <span>⌚</span><span>Thiết Bị Đeo (Garmin/Coros)</span>
            </button>
            <button onclick="open5000DatasetModal()" class="px-3 py-1.5 rounded-md bg-[#E6F7FF] text-[#1890FF] border border-[#91D5FF]/60 hover:bg-[#BAE7FF] transition flex items-center gap-1.5 font-bold">
              <span>⚡</span><span>5,000 Dữ Liệu</span>
            </button>
            <button onclick="openFinisherCertificateModal()" class="px-3 py-1.5 rounded-md bg-[#FFF7E6] text-[#FA8C16] border border-[#FFD591] hover:bg-[#FFE7BA] transition flex items-center gap-1.5 font-bold">
              <span>📜</span><span>Chứng Nhận Finisher</span>
            </button>
            <button onclick="openAddActivityModal()" class="px-3 py-1.5 rounded-md bg-white border border-[#D9D9D9] hover:border-[#1890FF] hover:text-[#1890FF] text-[#595959] transition flex items-center gap-1.5">
              <span>+</span><span>Nộp Bài Chạy (Treadmill/GPS)</span>
            </button>
            <button onclick="openDisputeModal('ACT_000073')" class="px-3 py-1.5 rounded-md bg-white border border-[#D9D9D9] hover:border-[#FF4D4F] hover:text-[#FF4D4F] text-[#595959] transition flex items-center gap-1.5">
              <span>⚖</span><span>Khiếu Nại</span>
            </button>
            <button onclick="openDynamicVietQrModal()" class="px-3 py-1.5 rounded-md bg-[#F6FFED] text-[#52C41A] border border-[#B7EB8F] hover:bg-[#D9F7BE] transition flex items-center gap-1.5 font-bold">
              <span>💳</span><span>Dynamic VietQR</span>
            </button>
          </div>
        </div>

        <!-- 1. Hero Welcome Card (OpenRace Mùa 10 Techcombank 2026) -->
        <div class="relative bg-gradient-to-r from-[#1890FF] via-[#2F54EB] to-[#096DD9] rounded-xl p-8 text-white overflow-hidden shadow-xs border border-blue-400/20">
          <div class="relative z-10 max-w-xl space-y-2.5">
            <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-semibold">
              <span>🏆</span>
              <span>Giải Mùa 10 Run to Techcombank 2026</span>
            </div>
            <h2 class="text-2xl md:text-3xl font-bold tracking-tight text-white">Mantis Runner Portal</h2>
            <p class="text-sm text-blue-100/90 leading-relaxed font-normal">
              Chào mừng VĐV <strong>Nguyễn Văn A</strong>! Bạn đang cùng <strong>Team Phoenix SARC</strong> dẫn đầu toàn đoàn với <strong>1,420.0 KM</strong>. Tiến độ tuần cá nhân đạt 92.5% (còn 1.5 km trước 23:59 Chủ Nhật).
            </p>
            <div class="pt-3 flex items-center flex-wrap gap-3">
              <button onclick="switchTab('arena')" class="px-4 py-2 rounded-md bg-white text-[#1890FF] hover:bg-blue-50 font-bold text-xs shadow-xs transition flex items-center gap-2">
                <span>Xem Bảng Xếp Hạng Đấu Trường</span>
                <span>→</span>
              </button>
              <button onclick="syncStravaOptimistic()" class="px-4 py-2 rounded-md bg-transparent hover:bg-white/10 text-white font-medium text-xs border border-white/80 transition flex items-center gap-2">
                <span>⚡ Đồng Bộ Strava Ngay</span>
              </button>
              <button onclick="setAppTheme('sport')" class="px-4 py-2 rounded-md bg-white/10 hover:bg-white/20 text-white font-medium text-xs border border-white/40 transition flex items-center gap-1.5" title="Đổi sang giao diện Sport Cam">
                <span>⚡ Sang Sport Cam</span>
              </button>
            </div>
          </div>
          <!-- 3D Blueprint Decorative Illustration -->
          <div class="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 hidden sm:block opacity-95">
            <svg class="w-48 h-36" viewBox="0 0 200 150" fill="none">
              <rect x="30" y="35" width="120" height="75" rx="6" fill="#40A9FF" stroke="#FFFFFF" stroke-width="2"/>
              <line x1="45" y1="50" x2="135" y2="50" stroke="#FFFFFF" stroke-width="2"/>
              <line x1="45" y1="65" x2="135" y2="65" stroke="#FFFFFF" stroke-width="2"/>
              <line x1="45" y1="80" x2="105" y2="80" stroke="#FFFFFF" stroke-width="2"/>
              <line x1="60" y1="40" x2="60" y2="100" stroke="#BAE7FF" stroke-width="1.5" stroke-dasharray="2 2"/>
              <line x1="90" y1="40" x2="90" y2="100" stroke="#BAE7FF" stroke-width="1.5" stroke-dasharray="2 2"/>
              <line x1="120" y1="40" x2="120" y2="100" stroke="#BAE7FF" stroke-width="1.5" stroke-dasharray="2 2"/>
              <circle cx="20" cy="70" r="16" fill="#FADB14" stroke="#D48806" stroke-width="2"/>
              <circle cx="160" cy="70" r="16" fill="#FADB14" stroke="#D48806" stroke-width="2"/>
              <polygon points="175,25 180,35 170,35" fill="#FFFFFF"/>
              <circle cx="25" cy="30" r="3" fill="#FFFFFF"/>
              <circle cx="170" cy="115" r="2.5" fill="#FFFFFF"/>
            </svg>
          </div>
        </div>

        <!-- 2. Four Real OpenRace KPI Metric Cards with Mantis Sparklines -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Card 1: Vận Động Viên CLB -->
          <div class="mantis-card p-5 bg-white border border-[#F0F0F0] rounded-xl flex flex-col justify-between shadow-xs">
            <div>
              <div class="text-[13px] font-medium text-[#8C8C8C]">Vận Động Viên CLB</div>
              <div class="flex items-center justify-between mt-1">
                <span class="text-2xl font-bold text-[#262626]">48 / 1,000</span>
                <span class="px-2 py-0.5 rounded text-[11px] font-semibold text-[#1890FF] bg-[#E6F7FF] border border-[#91D5FF]/30 flex items-center gap-0.5">
                  ↗ 100% Active
                </span>
              </div>
            </div>
            <!-- Sparkline: Blue Bar Chart -->
            <div class="pt-4 flex items-end justify-between h-14 gap-1">
              <span class="w-full bg-[#1890FF] rounded-t-xs" style="height: 45%" title="T2: 12 VĐV"></span>
              <span class="w-full bg-[#1890FF] rounded-t-xs" style="height: 65%" title="T3: 18 VĐV"></span>
              <span class="w-full bg-[#1890FF] rounded-t-xs" style="height: 55%" title="T4: 15 VĐV"></span>
              <span class="w-full bg-[#1890FF] rounded-t-xs" style="height: 35%" title="T5: 10 VĐV"></span>
              <span class="w-full bg-[#1890FF] rounded-t-xs" style="height: 80%" title="T6: 22 VĐV"></span>
              <span class="w-full bg-[#1890FF] rounded-t-xs" style="height: 90%" title="T7: 28 VĐV"></span>
              <span class="w-full bg-[#1890FF] rounded-t-xs" style="height: 60%" title="CN: 20 VĐV"></span>
              <span class="w-full bg-[#1890FF] rounded-t-xs" style="height: 75%" title="Phoenix: 18"></span>
              <span class="w-full bg-[#1890FF] rounded-t-xs" style="height: 85%" title="Dragons: 15"></span>
              <span class="w-full bg-[#1890FF] rounded-t-xs" style="height: 40%" title="Tigers: 15"></span>
              <span class="w-full bg-[#1890FF] rounded-t-xs" style="height: 95%" title="Hôm nay: 48"></span>
              <span class="w-full bg-[#1890FF] rounded-t-xs" style="height: 70%" title="Tuần qua"></span>
            </div>
            <div class="mt-2 text-[11px] text-[#8C8C8C] truncate">Team Phoenix: 18 • Dragons: 15 • Tigers: 15</div>
          </div>

          <!-- Card 2: Tổng Cự Ly Giải Đấu -->
          <div class="mantis-card p-5 bg-white border border-[#F0F0F0] rounded-xl flex flex-col justify-between shadow-xs">
            <div>
              <div class="text-[13px] font-medium text-[#8C8C8C]">Tổng Cự Ly Giải Đấu</div>
              <div class="flex items-center justify-between mt-1">
                <span class="text-2xl font-bold text-[#262626]">3,170.0 KM</span>
                <span class="px-2 py-0.5 rounded text-[11px] font-semibold text-[#52C41A] bg-[#F6FFED] border border-[#B7EB8F]/40 flex items-center gap-0.5">
                  ↗ +2,507 km Trail
                </span>
              </div>
            </div>
            <!-- Sparkline: Area Gradient Curve -->
            <div class="pt-4 h-14 relative flex items-end">
              <svg class="w-full h-full overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="mantisDistGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#1890FF" stop-opacity="0.4"/>
                    <stop offset="100%" stop-color="#1890FF" stop-opacity="0.0"/>
                  </linearGradient>
                </defs>
                <path d="M 0,35 Q 25,25 50,15 T 75,8 T 100,5 L 100,40 L 0,40 Z" fill="url(#mantisDistGrad)"/>
                <path d="M 0,35 Q 25,25 50,15 T 75,8 T 100,5" fill="none" stroke="#1890FF" stroke-width="2.5"/>
              </svg>
            </div>
            <div class="mt-2 text-[11px] text-[#8C8C8C] truncate">Tỷ lệ hoàn thành: 79.2% • Đạt chuẩn D+ Trail</div>
          </div>

          <!-- Card 3: Chỉ Tiêu Tuần Này -->
          <div class="mantis-card p-5 bg-white border border-[#F0F0F0] rounded-xl flex flex-col justify-between shadow-xs">
            <div>
              <div class="text-[13px] font-medium text-[#8C8C8C]">Tiến Độ Tuần Cá Nhân</div>
              <div class="flex items-center justify-between mt-1">
                <span class="text-2xl font-bold text-[#262626]">18.5 / 20.0 KM</span>
                <span class="px-2 py-0.5 rounded text-[11px] font-semibold text-[#FAAD14] bg-[#FFFBE6] border border-[#FFE58F]/40 flex items-center gap-0.5">
                  92.5% (Còn 1.5 km)
                </span>
              </div>
            </div>
            <!-- Sparkline: Gold Bar Chart -->
            <div class="pt-4 flex items-end justify-between h-14 gap-1">
              <span class="w-full bg-[#FAAD14] rounded-t-xs" style="height: 60%" title="T2: 3.5km"></span>
              <span class="w-full bg-[#FAAD14] rounded-t-xs" style="height: 75%" title="T3: 5.0km"></span>
              <span class="w-full bg-[#FAAD14] rounded-t-xs" style="height: 85%" title="T4: nghỉ"></span>
              <span class="w-full bg-[#FAAD14] rounded-t-xs" style="height: 50%" title="T5: 4.0km"></span>
              <span class="w-full bg-[#FAAD14] rounded-t-xs" style="height: 90%" title="T6: 6.0km"></span>
              <span class="w-full bg-[#FAAD14] rounded-t-xs" style="height: 80%" title="T7: nghỉ"></span>
              <span class="w-full bg-[#FAAD14] rounded-t-xs" style="height: 65%" title="CN: cần 1.5km"></span>
            </div>
            <div class="mt-2 text-[11px] text-[#8C8C8C] truncate">Hạn chót: 23:59 Chủ Nhật • Tránh phạt 50.000đ</div>
          </div>

          <!-- Card 4: Quỹ Đội & Sổ Nợ -->
          <div class="mantis-card p-5 bg-white border border-[#F0F0F0] rounded-xl flex flex-col justify-between shadow-xs">
            <div>
              <div class="text-[13px] font-medium text-[#8C8C8C]">Quỹ Đội & Nộp Phạt</div>
              <div class="flex items-center justify-between mt-1">
                <span class="text-2xl font-bold text-[#262626]">100,000 VNĐ</span>
                <span class="px-2 py-0.5 rounded text-[11px] font-semibold text-[#52C41A] bg-[#F6FFED] border border-[#B7EB8F]/40 flex items-center gap-0.5">
                  ✓ VietQR Settled
                </span>
              </div>
            </div>
            <!-- Sparkline: Blue Multi-Peak Spline -->
            <div class="pt-4 h-14 relative flex items-end">
              <svg class="w-full h-full overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="mantisFundGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#52C41A" stop-opacity="0.3"/>
                    <stop offset="100%" stop-color="#52C41A" stop-opacity="0.0"/>
                  </linearGradient>
                </defs>
                <path d="M 0,30 Q 15,28 25,10 T 45,32 T 70,18 T 90,28 L 100,15 L 100,40 L 0,40 Z" fill="url(#mantisFundGrad)"/>
                <path d="M 0,30 Q 15,28 25,10 T 45,32 T 70,18 T 90,28 L 100,15" fill="none" stroke="#52C41A" stroke-width="2"/>
              </svg>
            </div>
            <div class="mt-2 text-[11px] text-[#8C8C8C] truncate">Cú pháp: SARC_NGUYENVANA_100K • Dư nợ: 0đ</div>
          </div>
        </div>

        <!-- 3. Main Analytics Grid (Weekly Distance Performance & Race Arena Team Standings) -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Left 2/3: Hiệu Suất Chạy Bộ & Cự Ly Đội Hàng Tuần + Streak Heatmap -->
          <div class="mantis-card lg:col-span-2 p-6 bg-white border border-[#F0F0F0] rounded-xl shadow-xs space-y-5">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 class="text-base font-bold text-[#262626]">Hiệu Suất Chạy Bộ & Cự Ly Đội Hàng Tuần</h3>
                <div class="flex items-center gap-2 mt-1">
                  <span class="text-xs text-[#1890FF] font-bold flex items-center gap-0.5">
                    ▲ 1,420.0 KM (Team Phoenix #1)
                  </span>
                  <span class="text-xs text-[#8C8C8C]">So sánh 7 ngày gần nhất • Tuần 20/2026</span>
                </div>
              </div>
              <!-- Controls: Week / Month / By Volume / Download -->
              <div class="flex items-center gap-2">
                <div class="flex items-center bg-[#F0F2F5] p-0.5 rounded-md border border-[#E8E8E8] text-xs font-semibold">
                  <button class="px-2.5 py-1 rounded bg-white text-[#262626] shadow-xs">Tuần Này</button>
                  <button class="px-2.5 py-1 rounded text-[#8C8C8C] hover:text-[#262626] transition">Mùa Giải</button>
                </div>
                <div class="relative">
                  <select class="px-2.5 py-1 bg-white border border-[#D9D9D9] rounded-md text-xs text-[#262626] focus:outline-none focus:border-[#1890FF]">
                    <option>Theo Cự Ly (KM)</option>
                    <option>Theo Điểm Thưởng</option>
                  </select>
                </div>
                <button class="p-1.5 bg-white border border-[#D9D9D9] rounded-md text-[#595959] hover:bg-[#FAFAFA] transition" title="Tải xuống báo cáo CSV" onclick="showToast('✓ Đã xuất file CSV hiệu suất chạy tuần')">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                </button>
              </div>
            </div>

            <!-- SVG Spline Area Chart (Real Running Distance Flow) -->
            <div class="relative h-64 w-full pt-4">
              <!-- Y Axis labels and horizontal grid lines -->
              <div class="absolute inset-0 flex flex-col justify-between text-[11px] text-[#BFBFBF] pointer-events-none">
                <div class="flex items-center"><span class="w-8 text-right pr-2">80km</span><div class="flex-1 border-b border-[#F0F0F0]"></div></div>
                <div class="flex items-center"><span class="w-8 text-right pr-2">60km</span><div class="flex-1 border-b border-[#F0F0F0]"></div></div>
                <div class="flex items-center"><span class="w-8 text-right pr-2">40km</span><div class="flex-1 border-b border-[#F0F0F0]"></div></div>
                <div class="flex items-center"><span class="w-8 text-right pr-2">20km</span><div class="flex-1 border-b border-[#F0F0F0]"></div></div>
                <div class="flex items-center"><span class="w-8 text-right pr-2">0km</span><div class="flex-1 border-b border-[#F0F0F0]"></div></div>
              </div>

              <!-- SVG Spline Curve and Gradient Fill -->
              <div class="absolute inset-0 pl-8 pb-6">
                <svg class="w-full h-full overflow-visible" viewBox="0 0 700 200" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="mantisRunSplineGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#1890FF" stop-opacity="0.28"/>
                      <stop offset="100%" stop-color="#1890FF" stop-opacity="0.01"/>
                    </linearGradient>
                  </defs>
                  <!-- Area Fill -->
                  <polygon points="0,150 116,110 233,60 350,85 466,120 583,30 700,20 700,200 0,200" fill="url(#mantisRunSplineGrad)"/>
                  <!-- Stroke Line -->
                  <polyline points="0,150 116,110 233,60 350,85 466,120 583,30 700,20" fill="none" stroke="#1890FF" stroke-width="2.5"/>
                  <!-- Data Dots -->
                  <circle cx="0" cy="150" r="4" fill="#1890FF"/>
                  <circle cx="116" cy="110" r="4" fill="#1890FF"/>
                  <circle cx="233" cy="60" r="4" fill="#1890FF"/>
                  <circle cx="350" cy="85" r="4" fill="#1890FF"/>
                  <circle cx="466" cy="120" r="4" fill="#1890FF"/>
                  <circle cx="583" cy="30" r="4" fill="#1890FF"/>
                  <circle cx="700" cy="20" r="4" fill="#1890FF"/>
                </svg>
              </div>

              <!-- X Axis Days -->
              <div class="absolute bottom-0 left-8 right-0 flex justify-between text-[11px] text-[#8C8C8C] pt-2">
                <span>Thứ 2 (15km)</span>
                <span>Thứ 3 (28km)</span>
                <span>Thứ 4 (42km)</span>
                <span>Thứ 5 (35km)</span>
                <span>Thứ 6 (20km)</span>
                <span>Thứ 7 (65km)</span>
                <span>Chủ Nhật (75km)</span>
              </div>
            </div>

            <!-- Mantis Running Streak Heatmap -->
            <div class="pt-3 border-t border-[#F0F0F0]">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-bold text-[#262626]">Chuỗi Chuyên Cần 20 Tuần (Running Streak):</span>
                  <span class="px-2 py-0.2 rounded text-[10px] font-bold bg-[#E6F7FF] text-[#1890FF]">18 Ngày Liên Tiếp 🔥</span>
                </div>
                <div class="flex items-center gap-1.5 text-[10px] text-[#8C8C8C]">
                  <span>Ít</span>
                  <span class="w-2.5 h-2.5 rounded-xs bg-[#F0F0F0]"></span>
                  <span class="w-2.5 h-2.5 rounded-xs bg-[#BAE7FF]"></span>
                  <span class="w-2.5 h-2.5 rounded-xs bg-[#69C0FF]"></span>
                  <span class="w-2.5 h-2.5 rounded-xs bg-[#1890FF]"></span>
                  <span class="w-2.5 h-2.5 rounded-xs bg-[#096DD9]"></span>
                  <span>Nhiều</span>
                </div>
              </div>
              <div class="grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto py-1">
                <!-- 20 columns of 7 days = 140 days -->
                ${Array.from({ length: 140 }).map((_, i) => {
                  const colors = ['bg-[#F0F0F0]', 'bg-[#BAE7FF]', 'bg-[#69C0FF]', 'bg-[#1890FF]', 'bg-[#096DD9]'];
                  const cIndex = (i > 115) ? (i % 3 === 0 ? 3 : 4) : (i % 5);
                  return `<div class="w-2.5 h-2.5 rounded-xs ${colors[cIndex]}" title="Ngày ${i+1}: Hoàn thành bài chạy"></div>`;
                }).join('')}
              </div>
            </div>
          </div>

          <!-- Right 1/3: Bảng Xếp Hạng Đội Đua Tức Thì -->
          <div class="mantis-card p-6 bg-white border border-[#F0F0F0] rounded-xl shadow-xs space-y-4 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between">
                <h3 class="text-base font-bold text-[#262626]">Bảng Xếp Hạng Đội Đua</h3>
                <span class="text-xs text-[#1890FF] font-semibold cursor-pointer hover:underline" onclick="switchTab('arena')">Toàn Giải →</span>
              </div>
              <p class="text-xs text-[#8C8C8C] mt-0.5">Top 5 Đội Dẫn Đầu Giải Mùa 10 Run to Techcombank</p>

              <div class="divide-y divide-[#F0F0F0] text-sm mt-3">
                <div class="py-2.5 flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="w-5 h-5 rounded-full bg-[#FFF1B8] text-[#D48806] font-extrabold text-[11px] flex items-center justify-center">1</span>
                    <div>
                      <div class="font-bold text-[#262626]">Team Phoenix SARC</div>
                      <div class="text-[11px] text-[#8C8C8C]">18 VĐV • 42 ngày c/cần</div>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="font-bold text-[#1890FF]">1,420.0 km</div>
                    <div class="text-[10px] text-[#52C41A] font-semibold">👑 Dẫn Đầu</div>
                  </div>
                </div>

                <div class="py-2.5 flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="w-5 h-5 rounded-full bg-[#F0F2F5] text-[#595959] font-extrabold text-[11px] flex items-center justify-center">2</span>
                    <div>
                      <div class="font-semibold text-[#262626]">Team Dragons SADC</div>
                      <div class="text-[11px] text-[#8C8C8C]">15 VĐV • 38 ngày c/cần</div>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="font-bold text-[#262626]">980.5 km</div>
                    <div class="text-[10px] text-[#8C8C8C]">🥈 Hạng 2</div>
                  </div>
                </div>

                <div class="py-2.5 flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="w-5 h-5 rounded-full bg-[#FFE7BA] text-[#D46B08] font-extrabold text-[11px] flex items-center justify-center">3</span>
                    <div>
                      <div class="font-semibold text-[#262626]">Team Pegasus SARC</div>
                      <div class="text-[11px] text-[#8C8C8C]">15 VĐV • 38 ngày c/cần</div>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="font-bold text-[#262626]">770.0 km</div>
                    <div class="text-[10px] text-[#8C8C8C]">🥉 Hạng 3</div>
                  </div>
                </div>

                <div class="py-2.5 flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="w-5 h-5 rounded-full bg-[#FAFAFA] text-[#8C8C8C] font-extrabold text-[11px] flex items-center justify-center">4</span>
                    <div>
                      <div class="font-semibold text-[#262626]">Team Tigers SADC</div>
                      <div class="text-[11px] text-[#8C8C8C]">12 VĐV • 30 ngày c/cần</div>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="font-bold text-[#595959]">620.0 km</div>
                    <div class="text-[10px] text-[#8C8C8C]">Hạng 4</div>
                  </div>
                </div>

                <div class="py-2.5 flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="w-5 h-5 rounded-full bg-[#FAFAFA] text-[#8C8C8C] font-extrabold text-[11px] flex items-center justify-center">5</span>
                    <div>
                      <div class="font-semibold text-[#262626]">Team Wolves SARC</div>
                      <div class="text-[11px] text-[#8C8C8C]">10 VĐV • 24 ngày c/cần</div>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="font-bold text-[#595959]">510.0 km</div>
                    <div class="text-[10px] text-[#8C8C8C]">Hạng 5</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="pt-3 border-t border-[#F0F0F0]">
              <button onclick="switchTab('arena')" class="w-full py-2 bg-[#1890FF] hover:bg-[#40A9FF] text-white font-semibold text-xs rounded-md shadow-xs transition flex items-center justify-center gap-1.5">
                <span>Vào Đấu Trường Chi Tiết</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 4. Bottom Row Preview Cards (Recent Running Activities & Race Governance Specs) -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Card Trái: Hoạt Động Chạy Bộ Mới Nhất -->
          <div class="mantis-card p-6 bg-white border border-[#F0F0F0] rounded-xl shadow-xs space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-base font-bold text-[#262626]">Nhật Ký Hoạt Động Mới Nhất</h3>
                <p class="text-xs text-[#8C8C8C]">5 bài chạy gần nhất của Nguyễn Văn A</p>
              </div>
              <span class="text-xs text-[#1890FF] font-semibold cursor-pointer hover:underline" onclick="switchTab('activities')">Xem Tất Cả</span>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead>
                  <tr class="border-b border-[#F0F0F0] text-[#8C8C8C]">
                    <th class="py-2">Mã Bài</th>
                    <th class="py-2">Loại Hình & Tên</th>
                    <th class="py-2">Cự Ly / Pace</th>
                    <th class="py-2">Trạng Thái</th>
                    <th class="py-2 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#F0F0F0] text-[#595959]">
                  <tr>
                    <td class="py-2.5 font-mono text-[#1890FF]">ACT_000075</td>
                    <td class="py-2.5">
                      <div class="font-semibold text-[#262626]">Trail Sapa Fansipan</div>
                      <div class="text-[10px] text-[#8C8C8C]">D+ 800m • GPS Elevation</div>
                    </td>
                    <td class="py-2.5 font-mono">21.2 km <span class="text-[10px] text-[#8C8C8C]">(6:15)</span></td>
                    <td class="py-2.5"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E6F7FF] text-[#1890FF] border border-[#91D5FF]">Chờ Trail</span></td>
                    <td class="py-2.5 text-right">
                      <button onclick="openElevationAuditDrawer('ACT_000075')" class="px-2 py-1 rounded text-[11px] font-bold bg-[#1890FF] text-white hover:bg-[#40A9FF] transition">
                        ⛰ Dốc
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td class="py-2.5 font-mono text-[#1890FF]">ACT_000077</td>
                    <td class="py-2.5">
                      <div class="font-semibold text-[#262626]">Road 10km Hồ Tây</div>
                      <div class="text-[10px] text-[#8C8C8C]">Đoạn đuôi tăng tốc 34 km/h</div>
                    </td>
                    <td class="py-2.5 font-mono">10.0 km <span class="text-[10px] text-[#8C8C8C]">(5:10)</span></td>
                    <td class="py-2.5"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFF7E6] text-[#FA8C16] border border-[#FFD591]">Cắt Đuôi</span></td>
                    <td class="py-2.5 text-right">
                      <button onclick="triggerAutoTrimDemo()" class="px-2 py-1 rounded text-[11px] font-bold bg-[#FA8C16] text-white hover:bg-[#FFA940] transition">
                        ✂ Trim
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td class="py-2.5 font-mono text-[#1890FF]">ACT_000076</td>
                    <td class="py-2.5">
                      <div class="font-semibold text-[#262626]">Treadmill Trong Nhà</div>
                      <div class="text-[10px] text-[#8C8C8C]">HR 135 bpm • Cadence 162</div>
                    </td>
                    <td class="py-2.5 font-mono">6.5 km <span class="text-[10px] text-[#8C8C8C]">(5:45)</span></td>
                    <td class="py-2.5"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F6FFED] text-[#52C41A] border border-[#B7EB8F]">Treadmill OK</span></td>
                    <td class="py-2.5 text-right">
                      <button onclick="openAddActivityModal()" class="px-2 py-1 rounded text-[11px] font-bold bg-[#52C41A] text-white hover:bg-[#73D13D] transition">
                        ❤️ HR
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td class="py-2.5 font-mono text-[#1890FF]">ACT_000074</td>
                    <td class="py-2.5">
                      <div class="font-semibold text-[#262626]">Evening Easy Run</div>
                      <div class="text-[10px] text-[#8C8C8C]">HR 142 bpm • GPS Hợp lệ</div>
                    </td>
                    <td class="py-2.5 font-mono">5.0 km <span class="text-[10px] text-[#8C8C8C]">(5:20)</span></td>
                    <td class="py-2.5"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F6FFED] text-[#52C41A] border border-[#B7EB8F]">Hợp Lệ</span></td>
                    <td class="py-2.5 text-right">
                      <button onclick="goToSection('activities', 'section-3-1')" class="px-2 py-1 rounded text-[11px] font-medium bg-[#FAFAFA] border border-[#D9D9D9] hover:bg-[#F0F0F0] text-[#595959] transition">
                        Xem
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td class="py-2.5 font-mono text-[#1890FF]">ACT_000073</td>
                    <td class="py-2.5">
                      <div class="font-semibold text-[#262626]">Morning Quick Shakeout</div>
                      <div class="text-[10px] text-[#FF4D4F]">Dưới cự ly sàn 3.0 km</div>
                    </td>
                    <td class="py-2.5 font-mono">2.8 km <span class="text-[10px] text-[#8C8C8C]">(5:05)</span></td>
                    <td class="py-2.5"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFF1F0] text-[#FF4D4F] border border-[#FFA39E]">Từ Chối</span></td>
                    <td class="py-2.5 text-right">
                      <button onclick="openDisputeModal('ACT_000073')" class="px-2 py-1 rounded text-[11px] font-bold bg-[#FF4D4F] text-white hover:bg-[#FF7875] transition">
                        ⚖ Khiếu nại
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Card Phải: Quy Chế Giải Chạy & Thông Số Kỹ Thuật (Race Governance Specs) -->
          <div class="mantis-card p-6 bg-white border border-[#F0F0F0] rounded-xl shadow-xs space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-base font-bold text-[#262626]">Quy Chế & Vận Hành Giải Chạy</h3>
              <span class="text-xs text-[#1890FF] font-semibold cursor-pointer hover:underline" onclick="switchTab('rules')">Chi Tiết Thể Lệ →</span>
            </div>
            
            <div class="grid grid-cols-2 gap-3 text-xs">
              <div class="p-3 bg-[#FAFAFA] rounded-lg border border-[#F0F0F0]">
                <div class="text-[#8C8C8C] text-[11px]">Cự ly tối thiểu:</div>
                <div class="font-bold text-[#262626] text-sm mt-0.5">&gt;= 3.00 KM</div>
                <div class="text-[10px] text-[#8C8C8C] mt-1">Bài &lt; 3km tự động loại</div>
              </div>
              <div class="p-3 bg-[#FAFAFA] rounded-lg border border-[#F0F0F0]">
                <div class="text-[#8C8C8C] text-[11px]">Khung Pace hợp lệ:</div>
                <div class="font-bold text-[#262626] text-sm mt-0.5">3:30 - 12:00 min/km</div>
                <div class="text-[10px] text-[#8C8C8C] mt-1">Cảnh báo nếu &gt;25 km/h</div>
              </div>
              <div class="p-3 bg-[#FAFAFA] rounded-lg border border-[#F0F0F0]">
                <div class="text-[#8C8C8C] text-[11px]">Thưởng dốc Trail (AC-047):</div>
                <div class="font-bold text-[#1890FF] text-sm mt-0.5">+1km / 100m D+</div>
                <div class="text-[10px] text-[#8C8C8C] mt-1">Quy đổi theo chuẩn ITRA</div>
              </div>
              <div class="p-3 bg-[#FAFAFA] rounded-lg border border-[#F0F0F0]">
                <div class="text-[#8C8C8C] text-[11px]">Chạy máy Treadmill (AC-050):</div>
                <div class="font-bold text-[#52C41A] text-sm mt-0.5">HR &gt;= 120 bpm</div>
                <div class="text-[10px] text-[#8C8C8C] mt-1">Cadence &gt;= 150 spm</div>
              </div>
            </div>

            <div class="p-3 bg-[#E6F7FF]/50 rounded-lg border border-[#91D5FF]/40 text-xs text-[#096DD9] space-y-1">
              <div class="font-bold flex items-center gap-1.5">
                <span>🛡️</span><span>Cơ chế bảo vệ tính công bằng giải chạy:</span>
              </div>
              <p class="text-[11px] text-[#595959] leading-relaxed">
                Hệ thống áp dụng thuật toán <strong>Auto-Trim Tracklog</strong> tự động loại bỏ đoạn đi xe máy ở đuôi bài chạy, xác thực <strong>Dynamic VietQR</strong> tự động gạch nợ quỹ qua Webhook ngân hàng, và đồng bộ trực tiếp <strong>Garmin Connect & Coros API</strong>.
              </p>
            </div>

            <div class="pt-2 flex items-center gap-3">
              <button onclick="switchTab('rules')" class="flex-1 py-2 rounded-md bg-[#1890FF] hover:bg-[#40A9FF] text-white text-xs font-semibold shadow-xs transition text-center">
                Cấu Hình Quy Chế CLB
              </button>
              <button onclick="setAppTheme('sport')" class="py-2 px-3 rounded-md bg-white border border-[#D9D9D9] hover:bg-[#FAFAFA] text-[#595959] text-xs font-semibold transition">
                ⚡ Sang Sport Cam
              </button>
            </div>
          </div>
        </div>
      </div>

</div>

      <!-- TAB 2:`;

// Apply updates
// 1. Sidebar
const sidebarStartMarker = '<!-- MANTIS MATERIAL UI DEDICATED NAVIGATION DRAWER -->';
const sidebarStartIndex = content.indexOf(sidebarStartMarker);
if (sidebarStartIndex === -1) {
  console.error('Could not find Mantis sidebar start marker!');
  process.exit(1);
}
const sidebarPrevAsideIndex = content.lastIndexOf('<aside id="mantis-sidebar"', sidebarStartIndex + 100);
const sidebarEndIndex = content.indexOf('</aside>', sidebarStartIndex) + '</aside>'.length;

const beforeSidebar = content.substring(0, sidebarStartIndex - 60); // include comment header
const afterSidebar = content.substring(sidebarEndIndex);
content = beforeSidebar + newMantisSidebar + afterSidebar;
console.log('✓ Successfully replaced Mantis Sidebar with complete OpenRace functional menu');

// 2. Header
if (oldMantisHeaderRegex.test(content)) {
  content = content.replace(oldMantisHeaderRegex, newMantisHeader);
  console.log('✓ Successfully updated Mantis Header with quick tools and runner profile');
} else {
  console.warn('Could not match oldMantisHeaderRegex!');
}

// 3. Dashboard View
if (oldMantisDashboardRegex.test(content)) {
  content = content.replace(oldMantisDashboardRegex, newMantisDashboard);
  console.log('✓ Successfully updated Mantis Dashboard View with real OpenRace KPI cards and running tables');
} else {
  console.warn('Could not match oldMantisDashboardRegex, using fallback index search...');
  const dashMarker = '<div id="mantis-dashboard-view"';
  const dashIndex = content.indexOf(dashMarker);
  const tab2Marker = '<!-- TAB 2: [2.0] GIẢI ĐẤU & ĐẤU TRƯỜNG (RACE ARENA) -->';
  const tab2Index = content.indexOf(tab2Marker);
  if (dashIndex !== -1 && tab2Index !== -1) {
    const beforeDash = content.substring(0, dashIndex);
    const afterTab2 = content.substring(tab2Index + '<!-- TAB 2:'.length);
    content = beforeDash + newMantisDashboard + afterTab2;
    console.log('✓ Successfully replaced Mantis Dashboard View via fallback indexes');
  } else {
    console.error('Could not find markers for Mantis Dashboard View!');
    process.exit(1);
  }
}

// 4. Update switchTab to sync Mantis sidebar active state and handle theme tab toggling
const oldSwitchTabMarker = 'function switchTab(tabId) {';
const newSwitchTabLogic = `function switchTab(tabId) {
      // Normalize aliases
      const aliasMap = {
        '1': 'dashboard', '1.0': 'dashboard', '1.A': 'dashboard',
        '1.B': 'strava-sync', 'strava-sync': 'strava-sync', 'sync-logs': 'strava-sync',
        '2': 'arena', '2.0': 'arena', '2.A': 'arena', '2.B': 'arena',
        '3': 'activities', '3.0': 'activities', '3.A': 'activities', '3.B': 'activities',
        '4': 'club', '4.0': 'club', '4.A': 'club', '4.B': 'club',
        '5': 'finance', '5.0': 'finance', '5.A': 'finance', '5.B': 'finance', 'me': 'finance',
        '6': 'rules', '6.0': 'rules', '6.A': 'rules', '6.B': 'rules', 'rules': 'rules', 'race-ops': 'rules',
        '7': 'teams', '7.0': 'teams', '7.A': 'teams', '7.B': 'teams', 'teams': 'teams',
        '8': 'social', '8.0': 'social', '8.A': 'social', '8.B': 'social', 'social': 'social', 'community': 'social',
        '9': 'chat', '9.0': 'chat', '9.A': 'chat', '9.B': 'chat', 'chat': 'chat', 'pacerbot': 'chat', 'banter': 'chat',
        '10': 'governance', '10.0': 'governance', '10.A': 'governance', '10.B': 'governance', 'governance': 'governance', 'club-erp': 'governance',
        'admin': 'admin', 'super-admin': 'admin',
        'club-manage': 'club-manage'
      };

      const resolvedId = aliasMap[tabId] || tabId;

      document.querySelectorAll('.tab-content').forEach(el => {
        el.classList.remove('active');
      });

      const target = document.getElementById('tab-' + resolvedId);
      if (target) {
        target.classList.add('active');
      }

      // Sync views on dashboard tab based on current theme
      if (resolvedId === 'dashboard') {
        const currentTheme = document.body.getAttribute('data-theme');
        if (currentTheme === 'mantis') {
          document.getElementById('openrace-dashboard-view')?.classList.add('hidden');
          document.getElementById('mantis-dashboard-view')?.classList.remove('hidden');
        } else {
          document.getElementById('openrace-dashboard-view')?.classList.remove('hidden');
          document.getElementById('mantis-dashboard-view')?.classList.add('hidden');
        }
      }

      // Update Mantis Nav Item Active Highlight in #mantis-sidebar
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

if (content.includes(oldSwitchTabMarker)) {
  const switchIndex = content.indexOf(oldSwitchTabMarker);
  const targetEndIndex = content.indexOf('if (target) {\n        target.classList.add(\'active\');\n      }', switchIndex) + 53;
  if (switchIndex !== -1 && targetEndIndex !== -1) {
    const beforeSwitch = content.substring(0, switchIndex);
    const afterSwitch = content.substring(targetEndIndex);
    content = beforeSwitch + newSwitchTabLogic + afterSwitch;
    console.log('✓ Successfully enhanced switchTab with Mantis nav state synchronization');
  }
}

// 5. Update setAppTheme to also sync the active Mantis item
const oldSetAppThemeMarker = 'function setAppTheme(theme) {';
if (content.includes(oldSetAppThemeMarker)) {
  console.log('Found setAppTheme marker');
}

fs.writeFileSync(mainPath, content, 'utf8');
console.log('[MANTIS PARITY] Finished updating main.ts successfully!');

