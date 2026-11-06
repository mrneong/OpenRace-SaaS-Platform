const fs = require('fs');
const path = require('path');

const mainTsPath = path.resolve(__dirname, 'backend/src/main.ts');
let content = fs.readFileSync(mainTsPath, 'utf8');

// ==========================================
// 1. TOP HEADER NAV WITH V2.1 PILLS
// ==========================================
const oldHeaderNavTarget = `        <!-- 8. Hệ Thống Toàn Sàn -->
        <button onclick="switchTab('admin')" id="nav-admin" class="nav-btn px-3 py-1.5 rounded-full text-xs font-semibold transition text-slate-600 hover:text-slate-900 hover:bg-slate-100 shrink-0 flex items-center gap-1.5 relative">
          <span>Toàn Sàn</span>
          <span class="w-1.5 h-1.5 rounded-full bg-[#FF5B26] animate-pulse"></span>
        </button>
      </nav>`;

const newHeaderNavReplacement = `        <!-- 7. Đội Thi Đấu (v2.1) -->
        <div class="relative group">
          <button onclick="switchTab('teams')" id="nav-teams" class="nav-btn px-3 py-1.5 rounded-full text-xs font-semibold transition text-slate-600 hover:text-slate-900 hover:bg-slate-100 shrink-0 flex items-center gap-1 border border-indigo-200/60 bg-indigo-50/30">
            <span class="text-indigo-600 font-bold">Đội Thi Đấu</span>
            <span class="text-[9px] bg-indigo-100 text-indigo-700 px-1 rounded font-extrabold">v2.1</span>
            <span class="text-[9px] opacity-60 group-hover:rotate-180 transition-transform">▾</span>
          </button>
          <div class="hidden group-hover:block absolute top-full left-0 mt-2 w-56 bg-white/98 backdrop-blur-md rounded-2xl p-2 shadow-2xl border border-slate-200/90 z-50 text-[11px] space-y-0.5">
            <a href="javascript:void(0)" onclick="showSubScreen('teams', 'section-7a')" class="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 font-medium transition">
              <span class="text-indigo-500 font-bold">•</span>
              <span>[7.A] Danh Bạ Đội Thi Đấu</span>
            </a>
            <a href="javascript:void(0)" onclick="showSubScreen('teams', 'section-7b')" class="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 font-medium transition">
              <span class="text-indigo-500 font-bold">•</span>
              <span>[7.B] Quản Trị Đội Trưởng & Nudge</span>
            </a>
          </div>
        </div>

        <!-- 8. Mạng Xã Hội (v2.1) -->
        <div class="relative group">
          <button onclick="switchTab('social')" id="nav-social" class="nav-btn px-3 py-1.5 rounded-full text-xs font-semibold transition text-slate-600 hover:text-slate-900 hover:bg-slate-100 shrink-0 flex items-center gap-1 border border-rose-200/60 bg-rose-50/30">
            <span class="text-rose-600 font-bold">Mạng Xã Hội</span>
            <span class="text-[9px] bg-rose-100 text-rose-700 px-1 rounded font-extrabold">v2.1</span>
            <span class="text-[9px] opacity-60 group-hover:rotate-180 transition-transform">▾</span>
          </button>
          <div class="hidden group-hover:block absolute top-full left-0 mt-2 w-56 bg-white/98 backdrop-blur-md rounded-2xl p-2 shadow-2xl border border-slate-200/90 z-50 text-[11px] space-y-0.5">
            <a href="javascript:void(0)" onclick="showSubScreen('social', 'section-8a')" class="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:text-rose-600 hover:bg-rose-50 font-medium transition">
              <span class="text-rose-500 font-bold">•</span>
              <span>[8.A] Bảng Tin Cộng Đồng & Kudos</span>
            </a>
            <a href="javascript:void(0)" onclick="showSubScreen('social', 'section-8b')" class="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:text-rose-600 hover:bg-rose-50 font-medium transition">
              <span class="text-rose-500 font-bold">•</span>
              <span>[8.B] Mạng Lưới Bạn Bè 2 Chiều</span>
            </a>
          </div>
        </div>

        <!-- 9. Chat & AI PacerBot (v2.1) -->
        <div class="relative group">
          <button onclick="switchTab('chat')" id="nav-chat" class="nav-btn px-3 py-1.5 rounded-full text-xs font-semibold transition text-slate-600 hover:text-slate-900 hover:bg-slate-100 shrink-0 flex items-center gap-1 border border-amber-200/60 bg-amber-50/30">
            <span class="text-amber-600 font-bold">Chat & AI</span>
            <span class="text-[9px] bg-amber-100 text-amber-800 px-1 rounded font-extrabold">v2.1</span>
            <span class="text-[9px] opacity-60 group-hover:rotate-180 transition-transform">▾</span>
          </button>
          <div class="hidden group-hover:block absolute top-full left-0 mt-2 w-56 bg-white/98 backdrop-blur-md rounded-2xl p-2 shadow-2xl border border-slate-200/90 z-50 text-[11px] space-y-0.5">
            <a href="javascript:void(0)" onclick="showSubScreen('chat', 'section-9a')" class="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:text-amber-600 hover:bg-amber-50 font-medium transition">
              <span class="text-amber-500 font-bold">•</span>
              <span>[9.A] Kênh Chat Trực Tiếp CLB/Đội</span>
            </a>
            <a href="javascript:void(0)" onclick="showSubScreen('chat', 'section-9b')" class="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:text-amber-600 hover:bg-amber-50 font-medium transition">
              <span class="text-amber-500 font-bold">•</span>
              <span>[9.B] Cấu Hình Banter & PacerBot AI</span>
            </a>
          </div>
        </div>

        <!-- 10. ERP Điều Hành CLB (v2.1) -->
        <div class="relative group">
          <button onclick="switchTab('governance')" id="nav-governance" class="nav-btn px-3 py-1.5 rounded-full text-xs font-semibold transition text-slate-600 hover:text-slate-900 hover:bg-slate-100 shrink-0 flex items-center gap-1 border border-emerald-200/60 bg-emerald-50/30">
            <span class="text-emerald-600 font-bold">ERP CLB</span>
            <span class="text-[9px] bg-emerald-100 text-emerald-800 px-1 rounded font-extrabold">v2.1</span>
            <span class="text-[9px] opacity-60 group-hover:rotate-180 transition-transform">▾</span>
          </button>
          <div class="hidden group-hover:block absolute top-full left-0 mt-2 w-60 bg-white/98 backdrop-blur-md rounded-2xl p-2 shadow-2xl border border-slate-200/90 z-50 text-[11px] space-y-0.5">
            <a href="javascript:void(0)" onclick="showSubScreen('governance', 'section-10a')" class="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 font-medium transition">
              <span class="text-emerald-500 font-bold">•</span>
              <span>[10.A] Trung Tâm Điều Hành & VietQR</span>
            </a>
            <a href="javascript:void(0)" onclick="showSubScreen('governance', 'section-10b')" class="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 font-medium transition">
              <span class="text-emerald-500 font-bold">•</span>
              <span>[10.B] Cảnh Báo Kỷ Luật & Chế Tài</span>
            </a>
            <a href="javascript:void(0)" onclick="showSubScreen('governance', 'section-10c')" class="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 font-medium transition">
              <span class="text-emerald-500 font-bold">•</span>
              <span>[10.C] Buổi Chạy Offline (RSVP & QR)</span>
            </a>
            <a href="javascript:void(0)" onclick="showSubScreen('governance', 'section-10d')" class="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 font-medium transition">
              <span class="text-emerald-500 font-bold">•</span>
              <span>[10.D] Biểu Quyết Nội Bộ (Polls)</span>
            </a>
            <a href="javascript:void(0)" onclick="showSubScreen('governance', 'section-10e')" class="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 font-medium transition">
              <span class="text-emerald-500 font-bold">•</span>
              <span>[10.E] Kho Giáo Án Tri Thức</span>
            </a>
          </div>
        </div>

        <!-- 8. Hệ Thống Toàn Sàn -->
        <button onclick="switchTab('admin')" id="nav-admin" class="nav-btn px-3 py-1.5 rounded-full text-xs font-semibold transition text-slate-600 hover:text-slate-900 hover:bg-slate-100 shrink-0 flex items-center gap-1.5 relative">
          <span>Toàn Sàn</span>
          <span class="w-1.5 h-1.5 rounded-full bg-[#FF5B26] animate-pulse"></span>
        </button>
      </nav>`;

if (content.includes(oldHeaderNavTarget)) {
  content = content.replace(oldHeaderNavTarget, newHeaderNavReplacement);
  console.log('Updated top header nav with V2.1 items');
} else {
  console.log('Could not find oldHeaderNavTarget');
}

// ==========================================
// 2. SIDEBAR DRAWER WITH V2.1 GROUPS
// ==========================================
const oldSidebarGroup2Target = `        <!-- GROUP 2: CLUB ADMIN (BAN QUẢN TRỊ CLB) -->
        <div class="space-y-1 pt-2 border-t border-slate-100">
          <div class="px-2 text-[10px] font-extrabold tracking-wider text-slate-400 uppercase flex items-center justify-between">
            <span>QUẢN TRỊ CLB (CLUB ADMIN)</span>
            <span class="text-[9px] text-slate-400">6.0 - 7.0</span>
          </div>`;

const newSidebarGroup2Replacement = `        <!-- GROUP 2: CỘNG ĐỒNG & ĐỘI THI ĐẤU [V2.1 MỚI ⭐] -->
        <div class="space-y-1 pt-2 border-t border-indigo-100 bg-indigo-50/30 p-2 rounded-2xl">
          <div class="px-2 text-[10px] font-extrabold tracking-wider text-indigo-700 uppercase flex items-center justify-between">
            <span>CỘNG ĐỒNG & ĐỘI [V2.1]</span>
            <span class="text-[9px] bg-indigo-200 text-indigo-800 px-1.5 py-0.5 rounded-full font-black">7.0 - 9.0</span>
          </div>

          <!-- [7.0] Đội Thi Đấu & Quyền Đội Trưởng -->
          <div class="rounded-2xl overflow-hidden">
            <button onclick="switchTab('teams')" id="sidebar-teams" class="sidebar-btn w-full p-2.5 rounded-2xl flex items-center justify-between font-bold text-left transition text-slate-700 hover:bg-indigo-100/50">
              <div class="flex items-center gap-2">
                <span class="text-sm">🚩</span>
                <span>[7.0] Đội Thi Đấu & Đội Trưởng</span>
              </div>
              <span class="text-[10px] text-indigo-600 font-extrabold">NEW</span>
            </button>
            <div class="pl-6 pr-2 py-1.5 space-y-1 bg-white/80 border-l-2 border-indigo-500 ml-3 mt-1 rounded-r-xl text-[11px]">
              <a href="javascript:void(0)" onclick="showSubScreen('teams', 'section-7a')" class="block py-1 text-slate-600 hover:text-indigo-600 font-medium">• [7.A] Danh bạ & Phong độ đội</a>
              <a href="javascript:void(0)" onclick="showSubScreen('teams', 'section-7b')" class="block py-1 text-slate-600 hover:text-indigo-600 font-medium">• [7.B] Đổi tên đội, Avatar & Nudge</a>
            </div>
          </div>

          <!-- [8.0] Mạng Xã Hội Chạy Bộ & Bạn Bè -->
          <div class="rounded-2xl overflow-hidden">
            <button onclick="switchTab('social')" id="sidebar-social" class="sidebar-btn w-full p-2.5 rounded-2xl flex items-center justify-between font-bold text-left transition text-slate-700 hover:bg-rose-100/50">
              <div class="flex items-center gap-2">
                <span class="text-sm">🔥</span>
                <span>[8.0] Mạng Xã Hội & Bạn Bè</span>
              </div>
              <span class="text-[10px] text-rose-600 font-extrabold">NEW</span>
            </button>
            <div class="pl-6 pr-2 py-1.5 space-y-1 bg-white/80 border-l-2 border-rose-500 ml-3 mt-1 rounded-r-xl text-[11px]">
              <a href="javascript:void(0)" onclick="showSubScreen('social', 'section-8a')" class="block py-1 text-slate-600 hover:text-rose-600 font-medium">• [8.A] Feed cộng đồng, Kudos & Comments</a>
              <a href="javascript:void(0)" onclick="showSubScreen('social', 'section-8b')" class="block py-1 text-slate-600 hover:text-rose-600 font-medium">• [8.B] Kết bạn 2 chiều & Profile</a>
            </div>
          </div>

          <!-- [9.0] Tán Gẫu, AI PacerBot & Banter -->
          <div class="rounded-2xl overflow-hidden">
            <button onclick="switchTab('chat')" id="sidebar-chat" class="sidebar-btn w-full p-2.5 rounded-2xl flex items-center justify-between font-bold text-left transition text-slate-700 hover:bg-amber-100/50">
              <div class="flex items-center gap-2">
                <span class="text-sm">🤖</span>
                <span>[9.0] Chat, PacerBot AI & Banter</span>
              </div>
              <span class="text-[10px] text-amber-600 font-extrabold">NEW</span>
            </button>
            <div class="pl-6 pr-2 py-1.5 space-y-1 bg-white/80 border-l-2 border-amber-500 ml-3 mt-1 rounded-r-xl text-[11px]">
              <a href="javascript:void(0)" onclick="showSubScreen('chat', 'section-9a')" class="block py-1 text-slate-600 hover:text-amber-600 font-medium">• [9.A] Kênh chat thời gian thực</a>
              <a href="javascript:void(0)" onclick="showSubScreen('chat', 'section-9b')" class="block py-1 text-slate-600 hover:text-amber-600 font-medium">• [9.B] Cấu hình Banter Roast Bot</a>
            </div>
          </div>
        </div>

        <!-- GROUP 3: CLUB ADMIN & ERP (6.0, 10.0) -->
        <div class="space-y-1 pt-2 border-t border-slate-100">
          <div class="px-2 text-[10px] font-extrabold tracking-wider text-slate-400 uppercase flex items-center justify-between">
            <span>ĐIỀU HÀNH CLB & ERP</span>
            <span class="text-[9px] text-slate-400">6.0, 10.0</span>
          </div>

          <!-- [10.0] Điều Hành Toàn Diện CLB (ERP) -->
          <div class="rounded-2xl overflow-hidden">
            <button onclick="switchTab('governance')" id="sidebar-governance" class="sidebar-btn w-full p-2.5 rounded-2xl flex items-center justify-between font-bold text-left transition text-slate-700 hover:bg-emerald-100/50">
              <div class="flex items-center gap-2">
                <span class="text-sm">🏛️</span>
                <span>[10.0] Điều Hành CLB ERP</span>
              </div>
              <span class="text-[10px] text-emerald-600 font-extrabold">NEW</span>
            </button>
            <div class="pl-6 pr-2 py-1.5 space-y-1 bg-slate-50/70 border-l-2 border-emerald-500 ml-3 mt-1 rounded-r-xl text-[11px]">
              <a href="javascript:void(0)" onclick="showSubScreen('governance', 'section-10a')" class="block py-1 text-slate-600 hover:text-emerald-600 font-medium">• [10.A] Cài đặt VietQR & Quản lý TV</a>
              <a href="javascript:void(0)" onclick="showSubScreen('governance', 'section-10b')" class="block py-1 text-slate-600 hover:text-emerald-600 font-medium">• [10.B] Cảnh báo kỷ luật & Chế tài</a>
              <a href="javascript:void(0)" onclick="showSubScreen('governance', 'section-10c')" class="block py-1 text-slate-600 hover:text-emerald-600 font-medium">• [10.C] Buổi chạy Offline RSVP & QR</a>
              <a href="javascript:void(0)" onclick="showSubScreen('governance', 'section-10d')" class="block py-1 text-slate-600 hover:text-emerald-600 font-medium">• [10.D] Biểu quyết nội bộ (Polls)</a>
              <a href="javascript:void(0)" onclick="showSubScreen('governance', 'section-10e')" class="block py-1 text-slate-600 hover:text-emerald-600 font-medium">• [10.E] Kho giáo án tri thức</a>
            </div>
          </div>`;

if (content.includes(oldSidebarGroup2Target)) {
  content = content.replace(oldSidebarGroup2Target, newSidebarGroup2Replacement);
  console.log('Updated sidebar drawer with V2.1 groups');
} else {
  console.log('Could not find oldSidebarGroup2Target');
}

// Also add [1.B] Strava Sync Logs link in Sidebar under [1.0]
const oldSidebar10 = `              <a href="javascript:void(0)" onclick="goToSection('dashboard', 'section-1-1')" class="block py-1 text-slate-600 hover:text-[#FF5B26] font-medium">• Đồng bộ Strava</a>`;
const newSidebar10 = `              <a href="javascript:void(0)" onclick="goToSection('dashboard', 'section-1-1')" class="block py-1 text-slate-600 hover:text-[#FF5B26] font-medium">• Đồng bộ Strava</a>
              <a href="javascript:void(0)" onclick="switchTab('strava-sync')" class="block py-1 text-orange-600 hover:text-orange-700 font-bold">• [1.B] Quản lý & Nhật ký Strava Sync</a>`;
if (content.includes(oldSidebar10)) {
  content = content.replace(oldSidebar10, newSidebar10);
  console.log('Added 1.B Strava Sync to sidebar');
}

fs.writeFileSync(mainTsPath, content, 'utf8');
console.log('Header and Sidebar updated.');

