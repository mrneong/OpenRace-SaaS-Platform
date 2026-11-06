const fs = require('fs');
const path = require('path');

const mainTsPath = path.resolve(__dirname, 'backend/src/main.ts');
let code = fs.readFileSync(mainTsPath, 'utf8');

console.log('=== Step 1: Make V2.1 Banner Dismissable & Add Priority Hero Bar ===');

const oldBanner = `        <!-- ⭐ V2.1 HIGHLIGHTS HERO BANNER -->
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

const newBannerAndHero = `        <!-- ⭐ V2.1 HIGHLIGHTS HERO BANNER (DISMISSABLE TO OPTIMIZE INFORMATION DENSITY) -->
        <div id="v21-hero-banner" class="mb-3 bg-gradient-to-r from-slate-900 via-slate-800 to-[#FF5B26] rounded-3xl p-5 md:p-6 text-white shadow-xl shadow-orange-500/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border border-slate-700/60 relative">
          <button onclick="dismissV21Banner()" class="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs transition" title="Thu gọn banner">✕</button>
          <div class="space-y-1.5 pr-6">
            <div class="flex items-center gap-2 flex-wrap">
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
              <span>🤖</span> [9.0] PacerBot
            </button>
            <button onclick="switchTab('governance')" class="px-3.5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-1.5 border border-emerald-400/30 hover:scale-105">
              <span>🏛️</span> [10.0] Club ERP
            </button>
            <button onclick="switchTab('strava-sync')" class="px-3.5 py-2.5 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-1.5 border border-orange-400/30 hover:scale-105">
              <span>🔄</span> [1.B] Logs
            </button>
          </div>
        </div>

        <!-- [ENTERPRISE LAYER I.1] TOP PRIORITY STATS & INSTANT ACTIONS BAR (TARGET LIMIT + SYNC ACTIONS) -->
        <div id="dashboard-quick-stats-hero" class="bg-gradient-to-r from-slate-950 via-slate-900 to-zinc-900 rounded-3xl p-5 text-white shadow-xl shadow-slate-950/20 border border-slate-800 space-y-4">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <!-- Left: Weekly Target Limit Vital Progress -->
            <div class="space-y-2 flex-1">
              <div class="flex items-center justify-between flex-wrap gap-2">
                <div class="flex items-center gap-2">
                  <span class="text-base">🎯</span>
                  <span class="text-xs font-black uppercase tracking-wider text-orange-400">Tiến Độ Chỉ Tiêu Tuần (Weekly Target Limit)</span>
                  <span id="hero-progress-pill" class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> 92.5% Đạt Chuẩn
                  </span>
                </div>
                <div class="flex items-center gap-2 text-xs text-slate-300 font-mono">
                  <span class="text-slate-400">Ân hạn:</span>
                  <span class="text-orange-400 font-bold">Còn 2 ngày (34h)</span>
                </div>
              </div>

              <!-- Animated Progress Bar -->
              <div class="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 flex border border-slate-700/50">
                <div id="hero-progress-bar" class="bg-gradient-to-r from-[#FF5B26] via-amber-400 to-emerald-400 h-full rounded-full transition-all duration-700 shadow-sm" style="width: 92.5%"></div>
              </div>

              <div class="flex items-center justify-between text-xs text-slate-300 pt-0.5 flex-wrap gap-2">
                <div>
                  Đã hoàn thành: <strong id="hero-completed-km" class="text-white font-mono font-bold text-sm">18.5</strong> / <span class="font-mono text-slate-400">20.0 km</span>
                </div>
                <div id="hero-warning-text" class="text-amber-300 font-semibold flex items-center gap-1 text-[11px]">
                  <span>⚠️</span> Cần thêm <strong id="hero-remaining-km" class="font-mono text-amber-200">1.5</strong> km để tránh mức phạt 50.000đ
                </div>
              </div>
            </div>

            <!-- Right: Priority Quick Actions Cluster -->
            <div class="flex items-center gap-2 flex-wrap shrink-0">
              <!-- Queue-based Strava Sync with Optimistic UI -->
              <button id="btn-sync-strava-queue" onclick="triggerOptimisticStravaSync()" class="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF5B26] to-[#e04800] hover:scale-105 active:scale-95 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition flex items-center gap-2">
                <span id="sync-spinner" class="hidden animate-spin text-sm">🔄</span>
                <span id="sync-icon">⚡</span>
                <span id="sync-text">Đồng Bộ Strava</span>
              </button>
              <button onclick="openAddActivityModal()" class="px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/15 transition flex items-center gap-1.5">
                <span>+</span> Nộp Bài Chạy
              </button>
              <button onclick="openMultiTierAppealModal('ACT_000073')" class="px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/15 transition flex items-center gap-1.5">
                <span>⚖</span> Khiếu Nại
              </button>
              <button onclick="openDynamicVietQrModal()" class="px-3.5 py-2.5 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs border border-emerald-500/30 transition flex items-center gap-1.5">
                <span>💳</span> VietQR Nộp Quỹ
              </button>
            </div>
          </div>

          <!-- Sync Queue telemetry strip -->
          <div id="sync-queue-status-strip" class="hidden pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-300">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span id="sync-queue-msg">Đang đồng bộ qua Hàng Đợi (BullMQ Worker)...</span>
            </div>
            <span class="text-[10px] text-slate-400 font-mono">Rate Limit: 82/100 requests còn lại</span>
          </div>
        </div>

        <!-- [ENTERPRISE LAYER I.1] DASHBOARD TABBED NAVIGATION -->
        <div class="flex items-center justify-between border-b border-slate-200/80 pb-2 pt-1 flex-wrap gap-2">
          <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl text-xs font-bold text-slate-600">
            <button id="dash-nav-all" onclick="switchDashboardView('all')" class="px-3.5 py-1.5 rounded-xl bg-white text-slate-900 shadow-xs font-black transition">
              📊 Tổng Quan & Chỉ Số
            </button>
            <button id="dash-nav-heatmap" onclick="switchDashboardView('heatmap')" class="px-3.5 py-1.5 rounded-xl hover:text-slate-900 transition flex items-center gap-1">
              <span>🔥</span> Chuỗi Chuyên Cần (Streak)
            </button>
            <button id="dash-nav-activities" onclick="switchDashboardView('activities')" class="px-3.5 py-1.5 rounded-xl hover:text-slate-900 transition">
              🏃 Hoạt Động & Khiếu Nại
            </button>
            <button id="dash-nav-finance" onclick="switchDashboardView('finance')" class="px-3.5 py-1.5 rounded-xl hover:text-slate-900 transition">
              💳 Sổ Nợ & VietQR Tự Động
            </button>
          </div>
          <div class="flex items-center gap-2">
            <span id="system-cache-pill" class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1" title="Real-time Aggregation Cache">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Redis Cache: 94.7% Hit (Sub-ms)
            </span>
            <button id="btn-restore-v21" onclick="restoreV21Banner()" class="hidden text-[11px] font-bold text-orange-600 bg-orange-50 border border-orange-200 hover:bg-orange-100 px-2.5 py-1 rounded-xl transition">
              🚀 Xem Tính Năng v2.1
            </button>
          </div>
        </div>

        <!-- [ENTERPRISE LAYER I.2] GITHUB-STYLE RUNNING STREAK CONTRIBUTIONS HEATMAP -->
        <div id="dashboard-heatmap-section" class="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-base">🔥</span>
                <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider">Mức Độ Chuyên Cần & Chuỗi Chạy Bộ (Running Streak Heatmap)</h3>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-orange-50 text-[#FF5B26] border border-orange-200">GitHub Contributions Matrix</span>
              </div>
              <p class="text-[11px] text-slate-400 mt-0.5">Ma trận cự ly 13 tuần mùa giải 2026. Chạy ≥ 3.0 km hợp lệ được ghi nhận 1 ngày chuyên cần duy trì chuỗi Streak.</p>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <span class="px-3 py-1 rounded-2xl text-xs font-black bg-orange-100 text-[#FF5B26] border border-orange-200 flex items-center gap-1">
                <span>🔥</span> Chuỗi: 12 ngày liên tục
              </span>
              <span class="px-3 py-1 rounded-2xl text-xs font-bold bg-slate-100 text-slate-700">
                🏆 Kỷ lục: 18 ngày
              </span>
              <span class="px-3 py-1 rounded-2xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                🏃 34 / 42 ngày hợp lệ
              </span>
            </div>
          </div>

          <!-- Heatmap Matrix Grid -->
          <div class="overflow-x-auto pb-1">
            <div id="heatmap-calendar-grid" class="flex gap-1.5 p-3 bg-slate-50/80 rounded-2xl border border-slate-100 min-w-max">
              <!-- Rendered dynamically by renderContributionsHeatmap() -->
            </div>
          </div>

          <!-- Heatmap Legend & Tooltip hint -->
          <div class="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex-wrap gap-2">
            <span>💡 <em>Duy trì chuỗi chạy liên tục giúp tối đa hóa 50% điểm số chuyên cần của đội Phoenix SARC.</em></span>
            <div class="flex items-center gap-1.5 text-[10px]">
              <span class="text-slate-400">Ít</span>
              <span class="w-3 h-3 rounded-md bg-slate-200 inline-block" title="0 km"></span>
              <span class="w-3 h-3 rounded-md bg-orange-200 inline-block" title="3-5 km"></span>
              <span class="w-3 h-3 rounded-md bg-orange-400 inline-block" title="6-10 km"></span>
              <span class="w-3 h-3 rounded-md bg-orange-500 inline-block" title="11-15 km"></span>
              <span class="w-3 h-3 rounded-md bg-[#FF5B26] inline-block" title="> 15 km"></span>
              <span class="text-slate-400">Nhiều</span>
            </div>
          </div>
        </div>`;

if (code.includes(oldBanner)) {
  code = code.replace(oldBanner, newBannerAndHero);
  console.log('Replaced banner with dismissable banner + Priority Stats Hero Bar + Heatmap container!');
}

console.log('=== Step 2: Add Floating Action Button (FAB), Multi-tier Appeal Modal & Dynamic VietQR Modal ===');

const modalInsertionAnchor = `  <!-- 3. ANNOUNCEMENT POST MODAL (CREATE / EDIT) -->`;

const enterpriseModalsAndFab = `  <!-- [ENTERPRISE LAYER I.3] FLOATING ACTION BUTTON (FAB) FOR RAPID MOBILE & DESKTOP INTERACTIONS -->
  <div id="fab-container" class="fixed bottom-6 right-6 z-40 flex flex-col items-end">
    <!-- Expandable Speed-Dial Menu -->
    <div id="fab-menu" class="hidden flex-col items-end space-y-2 mb-3 transition-all duration-300">
      <button onclick="openMultiTierAppealModal('ACT_000073')" class="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-slate-200 text-slate-800 text-xs font-bold shadow-xl hover:bg-slate-50 hover:border-orange-300 transition group">
        <span>⚖ Gửi Khiếu Nại Bài Chạy</span>
        <span class="w-7 h-7 rounded-xl bg-orange-100 text-[#FF5B26] flex items-center justify-center text-xs group-hover:scale-110 transition">⚖</span>
      </button>
      <button onclick="openDynamicVietQrModal()" class="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-slate-200 text-slate-800 text-xs font-bold shadow-xl hover:bg-slate-50 hover:border-emerald-300 transition group">
        <span>💳 VietQR Nộp Quỹ Tức Thì</span>
        <span class="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs group-hover:scale-110 transition">💳</span>
      </button>
      <button onclick="switchTab('chat')" class="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-slate-200 text-slate-800 text-xs font-bold shadow-xl hover:bg-slate-50 hover:border-amber-300 transition group">
        <span>🤖 Chat Trợ Lý PacerBot AI</span>
        <span class="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-xs group-hover:scale-110 transition">🤖</span>
      </button>
      <button onclick="triggerOptimisticStravaSync()" class="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-slate-200 text-slate-800 text-xs font-bold shadow-xl hover:bg-slate-50 hover:border-orange-300 transition group">
        <span>⚡ Đồng Bộ Strava Ngầm</span>
        <span class="w-7 h-7 rounded-xl bg-orange-100 text-[#FF5B26] flex items-center justify-center text-xs group-hover:scale-110 transition">⚡</span>
      </button>
    </div>

    <!-- Trigger Button -->
    <button id="btn-fab-trigger" onclick="toggleFabMenu()" class="w-14 h-14 rounded-full bg-gradient-to-br from-[#FF5B26] to-[#e04800] text-white shadow-2xl hover:shadow-orange-500/50 hover:scale-105 active:scale-95 flex items-center justify-center transition border-2 border-white ring-4 ring-orange-500/20" title="Thao tác nhanh">
      <span id="fab-icon-default" class="text-xl font-bold">⚡</span>
      <span id="fab-icon-close" class="hidden text-base font-bold">✕</span>
    </button>
  </div>

  <!-- [ENTERPRISE LAYER II.1] MULTI-TIER DISPUTE & APPEAL MODAL (GARMIN/STRAVA EVIDENCE + CAPTAIN PRECHECK + ADMIN FINAL) -->
  <div id="modal-appeal-multitier" class="hidden fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 border border-slate-100 max-h-[92vh] overflow-y-auto">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <span class="text-[10px] font-bold uppercase tracking-wider text-[#FF5B26]">[3.4] Quy Trình Khiếu Nại Đa Cấp</span>
          <h3 class="text-sm font-extrabold text-slate-900">Khiếu Nại Bài Chạy & Thẩm Định Đa Cấp</h3>
        </div>
        <button onclick="closeMultiTierAppealModal()" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs">✕</button>
      </div>

      <!-- Activity Info Box with Auto-Precheck Diagnostic -->
      <div class="p-3.5 rounded-2xl bg-gradient-to-r from-rose-50/70 via-white to-orange-50/50 border border-rose-200/80 space-y-2 text-xs">
        <div class="flex items-center justify-between">
          <div class="font-extrabold text-slate-900 flex items-center gap-1.5">
            <span id="appeal-act-title">🏃 ACT_000073 - Khởi động ngắn</span>
            <span class="px-2 py-0.5 rounded-md text-[9px] font-bold bg-rose-100 text-rose-700">✕ Bị loại (&lt;3.0km)</span>
          </div>
          <span class="font-mono font-bold text-slate-700" id="appeal-act-km">2.4 km</span>
        </div>
        <div class="text-[11px] text-slate-600 bg-white/80 p-2 rounded-xl border border-rose-100 leading-relaxed">
          <span class="text-rose-600 font-bold">Auto-Precheck Rule Engine:</span> Cự ly đo được 2.4 km không thỏa điều kiện tối thiểu 3.0 km. Nếu do lỗi GPS trong hầm / tắt thiết bị giữa chừng, vui lòng đính kèm ảnh minh chứng để Đội Trưởng duyệt Tier 1.
        </div>
      </div>

      <!-- Multi-tier Progress Stepper -->
      <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
        <div class="text-[10px] font-bold uppercase text-slate-400">Tiến Trình Thẩm Định 2 Cấp</div>
        <div class="grid grid-cols-3 gap-2 text-center text-[11px]">
          <div class="p-2 rounded-xl bg-orange-100 text-[#FF5B26] border border-orange-200 font-bold">
            <div>1. Gửi Khiếu Nại</div>
            <div class="text-[9px] font-normal text-orange-600">VĐV nộp minh chứng</div>
          </div>
          <div id="step-tier1" class="p-2 rounded-xl bg-white border border-slate-200 font-bold text-slate-700">
            <div>2. Đội Trưởng</div>
            <div id="step-tier1-sub" class="text-[9px] font-normal text-slate-400">Kiểm tra sơ bộ</div>
          </div>
          <div id="step-tier2" class="p-2 rounded-xl bg-white border border-slate-200 font-bold text-slate-400">
            <div>3. Super Admin</div>
            <div id="step-tier2-sub" class="text-[9px] font-normal text-slate-400">Duyệt hoàn trả cự ly</div>
          </div>
        </div>
      </div>

      <!-- Appeal Form -->
      <div class="space-y-3 text-xs">
        <div>
          <label class="block font-bold text-slate-700 mb-1">Giải trình lý do khiếu nại <span class="text-rose-500">*</span></label>
          <textarea id="appeal-reason-input" rows="2" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500" placeholder="Ví dụ: Đồng hồ Garmin tắt nguồn khi qua hầm, cự ly thực tế chạy cùng đội là 5.5km..."></textarea>
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">Ảnh chụp Garmin / Strava gốc làm minh chứng</label>
          <input type="text" id="appeal-evidence-url" value="https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&auto=format&fit=crop" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono" placeholder="URL hình ảnh hoặc file tracklog">
          <p class="text-[10px] text-slate-400 mt-1">Đính kèm URL ảnh màn hình đồng hồ thể hiện nhịp tim và quãng đường đầy đủ.</p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center justify-between pt-3 border-t border-slate-100 text-xs flex-wrap gap-2">
        <button onclick="closeMultiTierAppealModal()" class="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition">Đóng</button>
        <div class="flex items-center gap-2">
          <!-- Simulation button for Captain Tier 1 -->
          <button id="btn-captain-endorse" onclick="simulateCaptainEndorse()" class="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold border border-indigo-200 transition">
            🚩 Đội Trưởng Sơ Duyệt (Tier 1)
          </button>
          <button id="btn-submit-appeal" onclick="submitMultiTierAppeal()" class="px-4 py-2 rounded-xl bg-[#FF5B26] hover:bg-[#e04800] text-white font-bold shadow-md transition">
            ⚖ Gửi Khiếu Nại
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- [ENTERPRISE LAYER II.2] DYNAMIC VIETQR MODAL WITH BANK WEBHOOK AUTO-SETTLEMENT SIMULATOR -->
  <div id="modal-dynamic-vietqr" class="hidden fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-100 text-center">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3 text-left">
        <div>
          <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-600">[2.0] Thanh Toán Tức Thì</span>
          <h3 class="text-sm font-extrabold text-slate-900">VietQR Dynamic & Tự Động Xóa Nợ</h3>
        </div>
        <button onclick="closeDynamicVietQrModal()" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs">✕</button>
      </div>

      <!-- QR Box with dynamic memo -->
      <div class="space-y-2">
        <div class="w-48 h-48 mx-auto bg-white p-3 rounded-2xl border-2 border-emerald-200 shadow-md flex items-center justify-center relative">
          <img id="dynamic-qr-img" src="https://img.vietqr.io/image/TCB-9988226688-compact2.png?amount=100000&addInfo=SARC_NGUYENVANA_100K_M10&accountName=CLB%20CHAY%20BO%20SARC" alt="VietQR Dynamic" class="w-full h-full object-contain rounded-xl" onerror="this.src='https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=SARC_NGUYENVANA_100K_M10'">
          <div id="qr-settled-overlay" class="hidden absolute inset-0 bg-emerald-950/80 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center text-white space-y-1">
            <span class="text-3xl">✓</span>
            <span class="text-xs font-black uppercase tracking-wider text-emerald-300">Đã Xác Nhận Thanh Toán</span>
            <span class="text-[10px] text-slate-200">Đã gạch nợ thành công!</span>
          </div>
        </div>

        <div class="text-xs text-slate-600 space-y-1">
          <div>Số tiền: <strong class="text-base font-black font-mono text-slate-900">100.000đ</strong></div>
          <div class="p-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-700 flex items-center justify-between">
            <span>Cú pháp: <strong id="dynamic-qr-memo" class="text-orange-600 font-bold">SARC_NGUYENVANA_100K_M10</strong></span>
            <button onclick="copyQrMemo()" class="text-[10px] px-2 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold">Sao chép</button>
          </div>
          <p class="text-[10px] text-slate-400 italic">Mã VietQR đính kèm định danh riêng. Webhook ngân hàng tự động cập nhật "Đã đóng quỹ" realtime.</p>
        </div>
      </div>

      <!-- Bank Webhook Simulator Button -->
      <div class="pt-2 border-t border-slate-100 space-y-2">
        <button id="btn-simulate-bank-webhook" onclick="simulateBankWebhookPayment()" class="w-full py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-1.5">
          <span>⚡</span>
          <span>Mô Phỏng Ngân Hàng Chuyển Khoản (Test Webhook)</span>
        </button>
        <button onclick="closeDynamicVietQrModal()" class="w-full py-2 rounded-xl text-slate-500 hover:bg-slate-100 text-xs font-semibold transition">Đóng</button>
      </div>
    </div>
  </div>

  <!-- 3. ANNOUNCEMENT POST MODAL (CREATE / EDIT) -->`;

if (code.includes(modalInsertionAnchor)) {
  code = code.replace(modalInsertionAnchor, enterpriseModalsAndFab);
  console.log('Inserted FAB, Multi-Tier Appeal Modal, and Dynamic VietQR Modal HTML.');
}

fs.writeFileSync(mainTsPath, code, 'utf8');
console.log('HTML components written successfully.');

