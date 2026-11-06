const fs = require('fs');
const path = require('path');

const mainTsPath = path.resolve(__dirname, 'backend/src/main.ts');
let code = fs.readFileSync(mainTsPath, 'utf8');

const oldMegaNavRegex = /<!-- 3 MEGA-GROUPS ROLE-BASED NAVIGATION[\s\S]*?<\/nav>/;

const perfectNav = `<!-- 5 ROLE-BASED PILLS WITH MEGA-DROPDOWNS (ZERO OVERFLOW, PERFECT UX) -->
      <nav class="flex items-center gap-1 bg-white/95 border border-slate-200/90 rounded-full p-1 shadow-sm">
        
        <!-- 1. Tổng Quan -->
        <div class="relative group">
          <button onclick="switchTab('dashboard')" id="nav-dashboard" class="nav-btn px-3 py-1.5 rounded-full text-xs font-bold transition bg-[#18181B] text-white shadow-sm shrink-0 flex items-center gap-1">
            <span>Tổng Quan</span>
            <span class="text-[9px] opacity-60 group-hover:rotate-180 transition-transform">▾</span>
          </button>
          <div class="hidden group-hover:block absolute top-full left-0 mt-2 w-64 bg-white/98 backdrop-blur-md rounded-2xl p-2.5 shadow-2xl border border-slate-200/90 z-50 text-[11px] space-y-1">
            <a href="javascript:void(0)" onclick="goToSection('dashboard', 'section-1-1')" class="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:text-[#FF5B26] hover:bg-orange-50 font-medium transition">
              <span class="text-orange-500 font-bold">•</span>
              <span>[1.A] Dashboard Runner & Tiến Độ</span>
            </a>
            <a href="javascript:void(0)" onclick="switchTab('strava-sync')" id="nav-strava-sync" class="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:text-orange-600 hover:bg-orange-50 font-bold transition">
              <span class="text-orange-500 font-bold">•</span>
              <span>[1.B] Quản Lý Strava & Sync Logs</span>
            </a>
            <a href="javascript:void(0)" onclick="switchTab('finance')" id="nav-finance" class="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 font-medium transition">
              <span class="text-emerald-500 font-bold">•</span>
              <span>[5.0] Sổ Nợ & VietQR Nộp Quỹ</span>
            </a>
          </div>
        </div>

        <!-- 2. Đấu Trường -->
        <div class="relative group">
          <button onclick="switchTab('arena')" id="nav-arena" class="nav-btn px-3 py-1.5 rounded-full text-xs font-semibold transition text-slate-600 hover:text-slate-900 hover:bg-slate-100 shrink-0 flex items-center gap-1">
            <span>Đấu Trường</span>
            <span class="text-[9px] opacity-60 group-hover:rotate-180 transition-transform">▾</span>
          </button>
          <div class="hidden group-hover:block absolute top-full left-0 mt-2 w-64 bg-white/98 backdrop-blur-md rounded-2xl p-2.5 shadow-2xl border border-slate-200/90 z-50 text-[11px] space-y-1">
            <a href="javascript:void(0)" onclick="goToSection('arena', 'section-2-1')" class="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:text-[#FF5B26] hover:bg-orange-50 font-medium transition">
              <span class="text-orange-500 font-bold">•</span>
              <span>[2.A] Hero & Đếm Ngược Giải</span>
            </a>
            <a href="javascript:void(0)" onclick="goToSection('arena', 'section-2-2')" class="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:text-[#FF5B26] hover:bg-orange-50 font-medium transition">
              <span class="text-orange-500 font-bold">•</span>
              <span>[2.B] Bảng Xếp Hạng Đội (Hạng 1 & 2)</span>
            </a>
            <a href="javascript:void(0)" onclick="goToSection('arena', 'section-2-3')" class="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:text-[#FF5B26] hover:bg-orange-50 font-medium transition">
              <span class="text-orange-500 font-bold">•</span>
              <span>[2.C] Bảng Xếp Hạng Cá Nhân (Áo SARC)</span>
            </a>
            <a href="javascript:void(0)" onclick="goToSection('arena', 'section-2-4')" class="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:text-[#FF5B26] hover:bg-orange-50 font-medium transition">
              <span class="text-orange-500 font-bold">•</span>
              <span>[2.D] Không Gian Đội Của Tôi</span>
            </a>
          </div>
        </div>

        <!-- 3. Nhật Ký -->
        <div class="relative group">
          <button onclick="switchTab('activities')" id="nav-activities" class="nav-btn px-3 py-1.5 rounded-full text-xs font-semibold transition text-slate-600 hover:text-slate-900 hover:bg-slate-100 shrink-0 flex items-center gap-1">
            <span>Nhật Ký</span>
            <span class="text-[9px] opacity-60 group-hover:rotate-180 transition-transform">▾</span>
          </button>
          <div class="hidden group-hover:block absolute top-full left-0 mt-2 w-64 bg-white/98 backdrop-blur-md rounded-2xl p-2.5 shadow-2xl border border-slate-200/90 z-50 text-[11px] space-y-1">
            <a href="javascript:void(0)" onclick="goToSection('activities', 'section-3-1')" class="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:text-[#FF5B26] hover:bg-orange-50 font-medium transition">
              <span class="text-orange-500 font-bold">•</span>
              <span>[3.A] Toàn Bộ Bài Chạy</span>
            </a>
            <a href="javascript:void(0)" onclick="goToSection('activities', 'section-3-3')" class="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:text-[#FF5B26] hover:bg-orange-50 font-medium transition">
              <span class="text-orange-500 font-bold">•</span>
              <span>[3.B] Chi Tiết 6 Bước Thẩm Định & Gain</span>
            </a>
            <a href="javascript:void(0)" onclick="goToSection('activities', 'section-3-4')" class="flex items-center gap-2 px-3 py-2 rounded-xl text-orange-600 hover:bg-orange-50 font-bold transition">
              <span class="text-orange-500 font-bold">•</span>
              <span>[3.C] Gửi Đơn Khiếu Nại (Drawer)</span>
            </a>
          </div>
        </div>

        <!-- 4. CỘNG ĐỒNG & ĐỘI [V2.1] MEGA DROPDOWN -->
        <div class="relative group">
          <button id="mega-btn-community" class="nav-btn px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100 border border-indigo-200/80 shadow-sm shrink-0">
            <span>🤝 Cộng Đồng & Đội</span>
            <span class="text-[9px] bg-indigo-200 text-indigo-800 px-1 rounded font-black">v2.1</span>
            <span class="text-[9px] opacity-60 group-hover:rotate-180 transition-transform">▾</span>
          </button>
          <div class="hidden group-hover:block absolute top-full left-0 mt-2 w-72 bg-white/98 backdrop-blur-md rounded-2xl p-2.5 shadow-2xl border border-slate-200/90 z-50 text-[11px] space-y-1">
            <div class="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-indigo-400">Kết Nối Thi Đua & Tương Tác</div>
            <button onclick="switchTab('club')" id="nav-club" class="w-full text-left flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 font-medium transition">
              <div class="flex items-center gap-2"><span>👥</span><span>[4.0] Không Gian CLB SARC</span></div>
              <span class="text-[9px] text-slate-400 font-mono">Portal</span>
            </button>
            <button onclick="switchTab('teams')" id="nav-teams" class="w-full text-left flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 font-bold transition">
              <div class="flex items-center gap-2"><span>🚩</span><span>[7.0] Đội Thi Đấu & Đội Trưởng</span></div>
              <span class="text-[9px] text-indigo-600 font-mono font-bold">Nudge</span>
            </button>
            <button onclick="switchTab('social')" id="nav-social" class="w-full text-left flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 hover:text-rose-600 hover:bg-rose-50 font-bold transition">
              <div class="flex items-center gap-2"><span>🔥</span><span>[8.0] Mạng Xã Hội, Kudos & Bạn Bè</span></div>
              <span class="text-[9px] text-rose-600 font-mono font-bold">Feed</span>
            </button>
            <button onclick="switchTab('chat')" id="nav-chat" class="w-full text-left flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 hover:text-amber-600 hover:bg-amber-50 font-bold transition">
              <div class="flex items-center gap-2"><span>🤖</span><span>[9.0] Chat, PacerBot AI & Banter</span></div>
              <span class="text-[9px] text-amber-600 font-mono font-bold">Live</span>
            </button>
          </div>
        </div>

        <!-- 5. ĐIỀU HÀNH & ERP MEGA DROPDOWN -->
        <div class="relative group">
          <button id="mega-btn-erp" class="nav-btn px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 text-emerald-800 bg-emerald-50/70 hover:bg-emerald-100 border border-emerald-200/80 shadow-sm shrink-0">
            <span>⚙️ Điều Hành & ERP</span>
            <span class="text-[9px] opacity-60 group-hover:rotate-180 transition-transform">▾</span>
          </button>
          <div class="hidden group-hover:block absolute top-full right-0 lg:left-0 mt-2 w-72 bg-white/98 backdrop-blur-md rounded-2xl p-2.5 shadow-2xl border border-slate-200/90 z-50 text-[11px] space-y-1">
            <div class="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-500">Quản Trị CLB & Vận Hành Giải</div>
            <button onclick="switchTab('club-manage')" id="nav-club-manage" class="w-full text-left flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 font-bold transition">
              <div class="flex items-center gap-2"><span>🏛️</span><span>[6.0] Quản Trị CLB & Sĩ Số</span></div>
              <span class="text-[9px] text-emerald-600 font-mono font-bold">BIN</span>
            </button>
            <button onclick="switchTab('rules')" id="nav-rules" class="w-full text-left flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 hover:text-[#FF5B26] hover:bg-orange-50 font-medium transition">
              <div class="flex items-center gap-2"><span>⚙️</span><span>[6.B] Wizard Thể Lệ (Khóa 2:45)</span></div>
              <span class="text-[9px] text-slate-400 font-mono">7 Bước</span>
            </button>
            <button onclick="switchTab('governance')" id="nav-governance" class="w-full text-left flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 font-bold transition">
              <div class="flex items-center gap-2"><span>🏛️</span><span>[10.0] Điều Hành CLB ERP</span></div>
              <span class="text-[9px] text-emerald-600 font-mono font-bold">RSVP/Polls</span>
            </button>
            <button onclick="switchTab('admin')" id="nav-admin" class="w-full text-left flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 hover:text-[#FF5B26] hover:bg-orange-50 font-bold transition border-t border-slate-100 mt-1 pt-2">
              <div class="flex items-center gap-2"><span>🛡️</span><span>[8.0] Hệ Thống Toàn Sàn</span></div>
              <span class="w-2 h-2 rounded-full bg-[#FF5B26] animate-pulse"></span>
            </button>
          </div>
        </div>
      </nav>`;

if (oldMegaNavRegex.test(code)) {
  code = code.replace(oldMegaNavRegex, perfectNav);
  console.log('Successfully updated to 5 clean pills with mega-dropdowns');
} else {
  console.error('Could not match oldMegaNavRegex');
}

fs.writeFileSync(mainTsPath, code, 'utf8');
console.log('Wrote main.ts');

