const fs = require('fs');
const path = require('path');

const mainTsPath = path.resolve(__dirname, 'backend/src/main.ts');
let code = fs.readFileSync(mainTsPath, 'utf8');

console.log('Original main.ts size:', code.length);

// 1. INSERT TOP HEADER NAV ITEMS
const navAdminAnchor = `        <!-- 8. Hệ Thống Toàn Sàn -->
        <div class="relative group">
          <button onclick="switchTab('admin')" id="nav-admin"`;

const newNavItems = `        <!-- 7. Đội Thi Đấu (v2.1) -->
        <div class="relative group">
          <button onclick="switchTab('teams')" id="nav-teams" class="nav-btn px-3 py-1.5 rounded-full text-xs font-semibold transition text-slate-600 hover:text-slate-900 hover:bg-slate-100 shrink-0 flex items-center gap-1 border border-indigo-200/60 bg-indigo-50/40">
            <span class="text-indigo-600 font-bold">Đội Thi Đấu</span>
            <span class="text-[9px] bg-indigo-100 text-indigo-700 px-1 rounded font-black">v2.1</span>
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
          <button onclick="switchTab('social')" id="nav-social" class="nav-btn px-3 py-1.5 rounded-full text-xs font-semibold transition text-slate-600 hover:text-slate-900 hover:bg-slate-100 shrink-0 flex items-center gap-1 border border-rose-200/60 bg-rose-50/40">
            <span class="text-rose-600 font-bold">Mạng Xã Hội</span>
            <span class="text-[9px] bg-rose-100 text-rose-700 px-1 rounded font-black">v2.1</span>
            <span class="text-[9px] opacity-60 group-hover:rotate-180 transition-transform">▾</span>
          </button>
          <div class="hidden group-hover:block absolute top-full left-0 mt-2 w-56 bg-white/98 backdrop-blur-md rounded-2xl p-2 shadow-2xl border border-slate-200/90 z-50 text-[11px] space-y-0.5">
            <a href="javascript:void(0)" onclick="showSubScreen('social', 'section-8a')" class="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:text-rose-600 hover:bg-rose-50 font-medium transition">
              <span class="text-rose-500 font-bold">•</span>
              <span>[8.A] Feed Cộng Đồng & Kudos</span>
            </a>
            <a href="javascript:void(0)" onclick="showSubScreen('social', 'section-8b')" class="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:text-rose-600 hover:bg-rose-50 font-medium transition">
              <span class="text-rose-500 font-bold">•</span>
              <span>[8.B] Mạng Lưới Bạn Bè 2 Chiều</span>
            </a>
          </div>
        </div>

        <!-- 9. Chat & AI PacerBot (v2.1) -->
        <div class="relative group">
          <button onclick="switchTab('chat')" id="nav-chat" class="nav-btn px-3 py-1.5 rounded-full text-xs font-semibold transition text-slate-600 hover:text-slate-900 hover:bg-slate-100 shrink-0 flex items-center gap-1 border border-amber-200/60 bg-amber-50/40">
            <span class="text-amber-600 font-bold">Chat & AI</span>
            <span class="text-[9px] bg-amber-100 text-amber-800 px-1 rounded font-black">v2.1</span>
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
          <button onclick="switchTab('governance')" id="nav-governance" class="nav-btn px-3 py-1.5 rounded-full text-xs font-semibold transition text-slate-600 hover:text-slate-900 hover:bg-slate-100 shrink-0 flex items-center gap-1 border border-emerald-200/60 bg-emerald-50/40">
            <span class="text-emerald-600 font-bold">ERP CLB</span>
            <span class="text-[9px] bg-emerald-100 text-emerald-800 px-1 rounded font-black">v2.1</span>
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
        <div class="relative group">
          <button onclick="switchTab('admin')" id="nav-admin"`;

if (code.includes(navAdminAnchor)) {
  code = code.replace(navAdminAnchor, newNavItems);
  console.log('Step 1: Nav Header updated with V2.1 items');
} else {
  console.log('Could not find navAdminAnchor');
}

// 2. INSERT V2.1 HERO BANNER IN MAIN AREA
const mainAnchor = `<div id="tab-dashboard" class="tab-content active">`;
const heroBanner = `<div id="tab-dashboard" class="tab-content active">
        <!-- ⭐ V2.1 HIGHLIGHTS HERO BANNER -->
        <div class="mb-5 bg-gradient-to-r from-slate-900 via-slate-800 to-[#FF5B26] rounded-3xl p-5 md:p-6 text-white shadow-xl shadow-orange-500/10 flex flex-col lg:flex-row lg:items-center justify-between gap-5 border border-slate-700/60">
          <div class="space-y-1.5">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30">Hệ Thống Đã Nâng Cấp Version 2.1</span>
              <span class="text-xs text-slate-300 font-mono">OR-SRS-SDS-2026-V2.1</span>
            </div>
            <h2 class="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>🚀</span> Danh Sách 5 Phân Hệ Tính Năng Mới Version 2.1
            </h2>
            <p class="text-xs text-slate-300 max-w-2xl leading-relaxed">
              OpenRace 2.1 bổ sung bộ tính năng Mạng xã hội thể thao (Feed, Kudos, Comments), Đồ thị bạn bè 2 chiều, Quyền năng Đội trưởng (Roster Matrix, Nudge), Trợ lý ảo AI PacerBot, Bộ máy Banter Roast Bot cà khịa thi đua, và Hệ thống ERP CLB (Sự kiện Offline RSVP, Biểu quyết Polls, Kỷ luật VĐV).
            </p>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap items-center gap-2 shrink-0">
            <button onclick="switchTab('teams')" class="px-3.5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-1.5 border border-indigo-400/30 hover:scale-105">
              <span>🚩</span> [7.0] Đội Trưởng
            </button>
            <button onclick="switchTab('social')" class="px-3.5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-1.5 border border-rose-400/30 hover:scale-105">
              <span>🔥</span> [8.0] Mạng Xã Hội
            </button>
            <button onclick="switchTab('chat')" class="px-3.5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-1.5 border border-amber-400/30 hover:scale-105">
              <span>🤖</span> [9.0] PacerBot & Chat
            </button>
            <button onclick="switchTab('governance')" class="px-3.5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-1.5 border border-emerald-400/30 hover:scale-105">
              <span>🏛️</span> [10.0] Club ERP
            </button>
            <button onclick="switchTab('strava-sync')" class="px-3.5 py-2.5 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-1.5 border border-orange-400/30 hover:scale-105">
              <span>🔄</span> [1.B] Strava Sync Logs
            </button>
          </div>
        </div>`;

if (code.includes(mainAnchor)) {
  code = code.replace(mainAnchor, heroBanner);
  console.log('Step 2: V2.1 Hero Banner added to Dashboard');
} else {
  console.log('Could not find mainAnchor');
}

fs.writeFileSync(mainTsPath, code, 'utf8');
console.log('Step 1 & 2 applied.');

