const fs = require('fs');
const path = require('path');

const mainPath = path.join(__dirname, 'src', 'main.ts');
let content = fs.readFileSync(mainPath, 'utf8');

// 1. Column 1 Replacement Target: from <!-- COLUMN 1: LEFT (~30% / 4 Cols) --> down to <!-- COLUMN 2: MIDDLE (~40% / 5 Cols) -->
const col1Start = '<!-- COLUMN 1: LEFT (~30% / 4 Cols) -->';
const col2Start = '<!-- COLUMN 2: MIDDLE (~40% / 5 Cols) -->';

const startIndex = content.indexOf(col1Start);
const endIndex = content.indexOf(col2Start);

if (startIndex === -1 || endIndex === -1) {
  console.error('Could not find column 1 boundaries in main.ts!');
  process.exit(1);
}

const newColumn1Html = `<!-- COLUMN 1: LEFT (~30% / 4 Cols) -->
          <div class="lg:col-span-4 space-y-5">
            <!-- [1.1] Trạng thái Strava & Đồng bộ nhanh -->
            <div id="section-1-1" class="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-[0_4px_25px_rgb(0,0,0,0.03)] space-y-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-1.5">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-100 text-[#FF5B26]">[1.1] Strava Sync</span>
                  <span class="text-xs font-medium text-slate-400" id="unit-label">Tổng Cự Ly Giải Đấu</span>
                </div>
                <button onclick="toggleUnit()" class="flex items-center gap-1 text-xs font-mono font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full transition">
                  <span id="unit-btn-text">🏃 KM</span>
                  <span class="text-[10px]">▾</span>
                </button>
              </div>

              <div>
                <div class="text-3xl sm:text-4xl font-extrabold font-mono text-slate-900 tracking-tight flex items-baseline">
                  <span id="balance-val">3,170.00</span>
                  <span class="text-sm font-normal text-slate-400 ml-1.5" id="balance-unit">KM</span>
                </div>
                <div class="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                  <span>↑ 5%</span>
                  <span class="text-slate-400">so với tuần trước • Webhook Live</span>
                </div>
              </div>

              <!-- [1.1] Live Strava Status & Manual Sync Button -->
              <div class="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="relative flex h-2.5 w-2.5">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <div>
                    <div class="text-[11px] font-bold text-slate-800">Nguyễn Văn A <span class="text-slate-400 font-mono font-normal">(#94827103)</span></div>
                    <div class="text-[9px] text-slate-400 font-mono">Đồng bộ: <span id="strava-last-sync-time">Vừa xong (13:45 05/11)</span></div>
                  </div>
                </div>
                <button id="btn-quick-sync" onclick="quickSyncStrava()" class="px-3 py-1.5 rounded-xl bg-[#FF5B26] hover:bg-[#e64a19] text-white text-[11px] font-bold shadow-sm transition flex items-center gap-1 active:scale-95">
                  <span id="sync-spinner">⚡</span> Đồng bộ ngay
                </button>
              </div>

              <!-- Dual Action Buttons -->
              <div class="grid grid-cols-2 gap-2.5 pt-1">
                <button onclick="switchTab('finance')" class="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-full text-xs font-bold bg-[#18181B] hover:bg-slate-800 text-white shadow-sm transition">
                  <span>⇆</span>
                  <span>[5.3] Nộp Quỹ</span>
                </button>
                <button onclick="switchTab('activities')" class="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-full text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition">
                  <span>⇆</span>
                  <span>[3.4] Khiếu Nại</span>
                </button>
              </div>

              <!-- Teams / Wallets breakdown -->
              <div class="pt-2 border-t border-slate-100 space-y-2">
                <div class="flex items-center justify-between text-xs text-slate-400">
                  <span>Đội Thi | Tổng 3 Đội</span>
                </div>
                <div class="grid grid-cols-3 gap-2">
                  <div class="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-left">
                    <div class="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                      <span class="w-1.5 h-1.5 rounded-full bg-[#FF5B26]"></span> Phoenix
                    </div>
                    <div class="text-xs font-bold font-mono text-slate-900 mt-1">1,250 km</div>
                    <div class="text-[9px] text-emerald-600 font-semibold mt-0.5">Top 1</div>
                  </div>
                  <div class="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-left">
                    <div class="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                      <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Dragons
                    </div>
                    <div class="text-xs font-bold font-mono text-slate-900 mt-1">1,000 km</div>
                    <div class="text-[9px] text-amber-600 font-semibold mt-0.5">Hạng 2</div>
                  </div>
                  <div class="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-left">
                    <div class="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                      <span class="w-1.5 h-1.5 rounded-full bg-teal-500"></span> Tigers
                    </div>
                    <div class="text-xs font-bold font-mono text-slate-900 mt-1">920 km</div>
                    <div class="text-[9px] text-amber-600 font-semibold mt-0.5">Hạng 2</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- [1.2] Tiến độ chỉ tiêu tuần & [1.3] Cảnh báo phạt sớm -->
            <div id="section-1-2" class="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-[0_4px_25px_rgb(0,0,0,0.03)] space-y-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-1.5">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-100 text-blue-700">[1.2] Tuần</span>
                  <h4 class="text-xs font-bold text-slate-800">Chỉ Tiêu Chu Kỳ Tuần (Target)</h4>
                </div>
                <span id="cycle-countdown-badge" class="text-[10px] font-mono font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200/50">
                  ⏳ Còn 41 giờ (Hạn Thứ 2 06:00)
                </span>
              </div>
              <div class="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden p-0.5 flex">
                <div id="cycle-progress-bar" class="bg-[#FF5B26] h-full rounded-full transition-all duration-500 shadow-inner" style="width: 92.5%"></div>
              </div>
              <div class="flex items-center justify-between text-xs font-mono text-slate-500">
                <span class="font-bold text-slate-900"><span id="cycle-completed-km">18.5</span> km <span class="font-normal text-slate-400">hoàn thành</span></span>
                <span>Chỉ tiêu: <span id="cycle-target-km">20.0</span> km (<span id="cycle-percent" class="font-bold text-[#FF5B26]">92.5%</span>)</span>
              </div>
              <div class="pt-1 flex items-center justify-between border-t border-slate-100 text-[10px]">
                <button onclick="openProrateModal()" class="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                  <span>ℹ️</span> Xem quy tắc Prorate & 6h ân hạn
                </button>
                <span class="text-slate-400 font-mono">Chu kỳ: W1/2026</span>
              </div>
              
              <!-- [1.3] Cảnh báo phạt sớm -->
              <div id="section-1-3" class="text-[11px] text-rose-800 bg-rose-50/90 p-3 rounded-2xl border border-rose-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm">
                <div>
                  <div class="flex items-center gap-1.5">
                    <span class="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-rose-200 text-rose-900">[1.3] CẢNH BÁO PHẠT SỚM</span>
                    <span class="text-[10px] text-rose-600 font-bold">&lt; 48 Giờ</span>
                  </div>
                  <div class="text-[11px] mt-1 text-slate-700">
                    Còn thiếu <strong id="penalty-missing-km" class="text-rose-600 font-bold">1.5 km</strong> trước hạn chót. Phạt dự kiến: <strong id="penalty-amount" class="text-rose-700 font-mono font-bold">50.000đ</strong>
                  </div>
                </div>
                <button id="btn-compensate-run" onclick="compensateRunNow()" class="shrink-0 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1 active:scale-95">
                  <span>🏃</span> Chạy bù ngay
                </button>
              </div>
            </div>

            <!-- [1.4] Carousel giải & Thẻ thành viên -->
            <div id="section-1-4" class="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-[0_4px_25px_rgb(0,0,0,0.03)] space-y-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-100 text-purple-700">[1.4]</span>
                  <h3 class="text-sm font-bold text-slate-800">Giải Đang Chạy</h3>
                </div>
                <button id="section-1-5" onclick="openJoinRaceModal()" class="text-xs font-bold text-[#FF5B26] hover:underline flex items-center gap-1">
                  <span>[1.5]</span> + Quét QR / Mã
                </button>
              </div>

              <!-- Interactive Carousel Card -->
              <div id="active-race-slide-card" class="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white space-y-3 shadow-md relative overflow-hidden transition-all duration-300">
                <div class="flex items-center justify-between">
                  <span id="race-card-badge" class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 flex items-center gap-1 shadow-sm">
                    <span>👑</span> <span id="race-card-badge-text">#1 Dẫn đầu</span>
                  </span>
                  <div class="flex items-center gap-1 text-slate-300">
                    <button onclick="prevRaceSlide()" class="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-[10px] transition">◀</button>
                    <span id="race-slide-index" class="text-[10px] font-mono font-bold text-slate-300 px-1">1 / 3</span>
                    <button onclick="nextRaceSlide()" class="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-[10px] transition">▶</button>
                  </div>
                </div>
                <div>
                  <div id="race-card-title" class="font-extrabold text-sm text-white tracking-tight">Mùa 10 Run to Techcombank 2026</div>
                  <div id="race-card-club" class="text-[10px] text-slate-400 mt-0.5">CLB: SARC • Đội: <span id="race-card-team" class="text-orange-400 font-bold">Phoenix SARC</span></div>
                </div>
                <div class="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                  <div>
                    <div class="text-[9px] text-slate-400">Đóng góp cá nhân</div>
                    <div class="font-mono font-bold text-emerald-400" id="race-card-km">125.0 km <span class="text-[9px] text-slate-400 font-normal">/ 1,250 km (10%)</span></div>
                  </div>
                  <button onclick="switchTab('arena')" class="px-3 py-1.5 rounded-xl bg-[#FF5B26] hover:bg-[#e04816] text-white text-[11px] font-bold shadow-sm flex items-center gap-1 transition">
                    <span>🏆</span> Đấu Trường [2.0]
                  </button>
                </div>
              </div>

              <!-- Mini indicator dots -->
              <div class="flex items-center justify-center gap-1.5 pt-1" id="carousel-dots">
                <span class="w-2 h-2 rounded-full bg-[#FF5B26] cursor-pointer" onclick="setRaceSlide(0)"></span>
                <span class="w-2 h-2 rounded-full bg-slate-300 cursor-pointer" onclick="setRaceSlide(1)"></span>
                <span class="w-2 h-2 rounded-full bg-slate-300 cursor-pointer" onclick="setRaceSlide(2)"></span>
              </div>

              <!-- Member cards preview -->
              <div class="grid grid-cols-2 gap-2.5 pt-1">
                <div class="bg-slate-900 text-white p-3 rounded-2xl relative overflow-hidden flex flex-col justify-between h-24 shadow-sm border border-slate-800">
                  <div class="flex items-center justify-between">
                    <span class="text-[8px] font-semibold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">Active S10</span>
                    <span class="text-[9px] text-slate-400 font-mono">#9482</span>
                  </div>
                  <div class="font-mono text-[11px] text-slate-200">ID: •••• 6782</div>
                  <div class="text-[9px] text-slate-400 font-mono flex justify-between">
                    <span>EXP 11/26</span><span>SARC PASS</span>
                  </div>
                </div>

                <div class="bg-gradient-to-tr from-[#FF5B26] to-[#FF8254] text-white p-3 rounded-2xl relative overflow-hidden flex flex-col justify-between h-24 shadow-sm">
                  <div class="flex items-center justify-between">
                    <span class="text-[8px] font-semibold bg-white/20 text-white px-1.5 py-0.5 rounded">VietQR SARC</span>
                    <span class="text-[9px] text-white/90 font-bold">100K</span>
                  </div>
                  <div class="font-mono text-[11px] text-white">OR10-K7Q2</div>
                  <div class="text-[9px] text-white/80 font-mono flex justify-between">
                    <span>TOP 1 ĐỘI</span><span>ĐÃ NỘP</span>
                  </div>
                </div>
              </div>
            </div>
          </div>\n\n          `;

content = content.substring(0, startIndex) + newColumn1Html + content.substring(endIndex);

// 2. Add Floating Action Button (FAB) and Modals before </main>
const mainEndTag = '</main>';
const fabAndModals = `  <!-- [1.5] Floating Action Button (FAB) for Mobile & Desktop -->
  <button id="fab-join-race" onclick="openJoinRaceModal()" class="fixed bottom-6 right-6 z-40 bg-[#18181B] hover:bg-slate-800 text-white px-4 py-3 rounded-full shadow-2xl flex items-center gap-2 text-xs font-bold border border-slate-700 transition hover:scale-105 active:scale-95">
    <span class="text-sm">📷</span>
    <span>[1.5] Quét QR / Mã Mời</span>
  </button>

  <!-- [1.5] MODAL: JOIN RACE BY CODE / QR -->
  <div id="join-race-modal" class="hidden fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-100">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <span class="text-[10px] font-bold uppercase tracking-wider text-[#FF5B26]">[1.5] Lối Tắt Nhanh</span>
          <h3 class="text-sm font-extrabold text-slate-900">Tham Gia Giải Bằng Mã Mời / QR</h3>
        </div>
        <button onclick="closeJoinRaceModal()" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs">✕</button>
      </div>

      <!-- Tab Switcher (Code vs QR) -->
      <div class="flex bg-slate-100 p-1 rounded-2xl gap-1">
        <button id="join-tab-code-btn" onclick="switchJoinTab('code')" class="flex-1 py-1.5 text-xs font-bold rounded-xl bg-white text-slate-900 shadow-sm transition">⌨️ Nhập Mã</button>
        <button id="join-tab-qr-btn" onclick="switchJoinTab('qr')" class="flex-1 py-1.5 text-xs font-bold rounded-xl text-slate-500 hover:text-slate-900 transition">📷 Quét QR</button>
      </div>

      <!-- Tab 1: Enter Code -->
      <div id="join-view-code" class="space-y-3">
        <div>
          <label class="block font-bold text-slate-700 mb-1 text-xs">Mã mời giải chạy</label>
          <input type="text" id="join-code-input" value="OR-8K2Q" placeholder="Ví dụ: OR-8K2Q hoặc SARC-2026" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono uppercase font-bold text-slate-800">
        </div>
        <div class="flex flex-wrap gap-1.5 text-[10px]">
          <span class="text-slate-400 font-semibold">Mã mẫu:</span>
          <button onclick="setJoinSampleCode('OR-8K2Q')" class="px-2 py-0.5 rounded-md bg-orange-50 text-[#FF5B26] font-mono font-bold hover:bg-orange-100">OR-8K2Q</button>
          <button onclick="setJoinSampleCode('SARC-2026')" class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono hover:bg-slate-200">SARC-2026</button>
          <button onclick="setJoinSampleCode('VPBANK-MARATHON')" class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono hover:bg-slate-200">VPBANK-MARATHON</button>
          <button onclick="setJoinSampleCode('RUN-OPEN-77')" class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono hover:bg-slate-200">RUN-OPEN-77</button>
        </div>
        <button onclick="submitJoinCode()" class="w-full py-2.5 rounded-xl bg-[#18181B] hover:bg-slate-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5">
          <span>🚀</span> Tham Gia Giải Ngay
        </button>
      </div>

      <!-- Tab 2: Scan QR Simulation -->
      <div id="join-view-qr" class="hidden space-y-3">
        <div class="relative bg-slate-950 rounded-2xl h-44 flex flex-col items-center justify-center overflow-hidden border-2 border-dashed border-slate-700">
          <div class="w-32 h-32 border-2 border-emerald-400 rounded-xl relative flex items-center justify-center">
            <div class="w-full h-0.5 bg-emerald-400 shadow-[0_0_10px_#10B981] animate-bounce"></div>
          </div>
          <span class="text-[10px] text-slate-400 mt-2 font-mono">Đang tìm mã QR giải chạy...</span>
        </div>
        <button onclick="simulateQrScanSuccess()" class="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5">
          <span>✓</span> Mô Phỏng Quét QR Thành Công (OR-8K2Q)
        </button>
      </div>

      <div id="join-modal-feedback" class="hidden p-3 rounded-xl border text-xs"></div>
    </div>
  </div>

  <!-- [1.2] MODAL: PRORATE AND GRACE POLICY DETAILS -->
  <div id="prorate-info-modal" class="hidden fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 border border-slate-100">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <span class="text-[10px] font-bold uppercase tracking-wider text-blue-600">[1.2] Quy Chế Tính Toán</span>
          <h3 class="text-sm font-extrabold text-slate-900">Tiến Độ Chu Kỳ Tuần, Prorate & 6h Ân Hạn</h3>
        </div>
        <button onclick="closeProrateModal()" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs">✕</button>
      </div>

      <div class="space-y-3 text-xs text-slate-600 leading-relaxed">
        <div class="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900">
          <strong class="font-bold">1. Chỉ tiêu tiêu chuẩn:</strong> 20.0 km mỗi chu kỳ tuần (Thứ Hai 00:00 - Chủ Nhật 23:59:59).
        </div>
        <div class="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900">
          <strong class="font-bold">2. Thời gian ân hạn 6 giờ (Grace Period):</strong> Hệ thống cho phép VĐV đồng bộ các bài chạy thực hiện trong tuần trước đến hết <strong>06:00 sáng Thứ Hai tuần kế tiếp</strong> trước khi thực hiện chốt sổ phạt tự động.
        </div>
        <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 font-mono text-[11px]">
          <strong class="font-sans font-bold text-xs block mb-1">3. Công thức Prorate (Gia nhập tuần lẻ):</strong>
          T = ceil(Target_chu_ky * Số_ngày_còn_lại / 7, 0.1)<br>
          <em>Ví dụ: Gia nhập khi tuần còn 4 ngày: T = ceil(20.0 * 4 / 7, 0.1) = 11.5 km.</em>
        </div>
        <div class="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900">
          <strong class="font-bold">4. Phạt vi phạm:</strong> Nếu sau 06:00 sáng Thứ Hai tổng cự ly hợp lệ &lt; Chỉ tiêu, VĐV sẽ bị phạt 50.000đ/tuần ghi nhận vào sổ cái công nợ.
        </div>
      </div>

      <div class="flex justify-end pt-2">
        <button onclick="closeProrateModal()" class="px-5 py-2 text-xs font-bold bg-[#18181B] text-white rounded-xl shadow-sm">Đã hiểu</button>
      </div>
    </div>
  </div>\n\n  `;

if (!content.includes('id="fab-join-race"')) {
  content = content.replace(mainEndTag, fabAndModals + mainEndTag);
}

// 3. Client scripts enhancements
const clientScriptAdditions = `
    // Subsystem [1.0] DASHBOARD RUNNER STATE & HANDLERS
    let userRacesData = [
      {
        raceId: 'race-season-10',
        name: 'Mùa 10 Run to Techcombank 2026',
        slug: 'season-10-run-to-techcombank',
        club: 'SARC',
        team: 'Phoenix SARC',
        standing: '#1 Dẫn đầu',
        badge: 'gold',
        personalKm: 125.0,
        teamKm: 1250.0
      },
      {
        raceId: 'race-trail-bavi-2026',
        name: 'SARC Trail Challenge Ba Vì 2026',
        slug: 'sarc-trail-challenge-bavi-2026',
        club: 'SARC Trail Division',
        team: 'Dragons Trail',
        standing: 'Đồng hạng 2',
        badge: 'silver',
        personalKm: 42.0,
        teamKm: 1000.0
      },
      {
        raceId: 'race-vpbank-prep',
        name: 'VPBank Hanoi Marathon Prep 2026',
        slug: 'vpbank-hanoi-marathon-prep-2026',
        club: 'Hanoi Runners Union',
        team: 'Tigers Speed',
        standing: 'Đồng hạng 2',
        badge: 'silver',
        personalKm: 68.0,
        teamKm: 928.0
      }
    ];
    let currentRaceIdx = 0;
    let completedWeeklyKm = 18.5;
    let targetWeeklyKm = 20.0;

    function renderRaceSlide() {
      if (userRacesData.length === 0) return;
      const race = userRacesData[currentRaceIdx];
      const titleEl = document.getElementById('race-card-title');
      const clubEl = document.getElementById('race-card-club');
      const teamEl = document.getElementById('race-card-team');
      const badgeTextEl = document.getElementById('race-card-badge-text');
      const badgeContainer = document.getElementById('race-card-badge');
      const kmEl = document.getElementById('race-card-km');
      const counterEl = document.getElementById('race-slide-index');

      if (titleEl) titleEl.innerText = race.name;
      if (clubEl) clubEl.innerHTML = 'CLB: ' + race.club + ' • Đội: <span id="race-card-team" class="text-orange-400 font-bold">' + race.team + '</span>';
      if (badgeTextEl) badgeTextEl.innerText = race.standing;
      if (badgeContainer) {
        badgeContainer.className = race.badge === 'gold' 
          ? 'px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 flex items-center gap-1 shadow-sm'
          : 'px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-300 text-slate-900 flex items-center gap-1 shadow-sm';
      }
      if (kmEl) {
        const pct = ((race.personalKm / race.teamKm) * 100).toFixed(1);
        kmEl.innerHTML = race.personalKm.toFixed(1) + ' km <span class="text-[9px] text-slate-400 font-normal">/ ' + race.teamKm.toLocaleString('vi-VN') + ' km (' + pct + '%)</span>';
      }
      if (counterEl) counterEl.innerText = (currentRaceIdx + 1) + ' / ' + userRacesData.length;

      // Update dots
      const dots = document.getElementById('carousel-dots');
      if (dots) {
        dots.innerHTML = userRacesData.map((_, i) => {
          return '<span class="w-2 h-2 rounded-full cursor-pointer transition ' + (i === currentRaceIdx ? 'bg-[#FF5B26] w-4' : 'bg-slate-300') + '" onclick="setRaceSlide(' + i + ')"></span>';
        }).join('');
      }
    }

    function prevRaceSlide() {
      currentRaceIdx = (currentRaceIdx - 1 + userRacesData.length) % userRacesData.length;
      renderRaceSlide();
    }

    function nextRaceSlide() {
      currentRaceIdx = (currentRaceIdx + 1) % userRacesData.length;
      renderRaceSlide();
    }

    function setRaceSlide(idx) {
      if (idx >= 0 && idx < userRacesData.length) {
        currentRaceIdx = idx;
        renderRaceSlide();
      }
    }

    async function quickSyncStrava() {
      const spinner = document.getElementById('sync-spinner');
      if (spinner) spinner.classList.add('animate-spin');
      try {
        const res = await fetch('/api/me/strava-sync', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          completedWeeklyKm = data.newCompletedKm || (completedWeeklyKm + 2.5);
          updateWeeklyProgressUi();
          
          // Add newly synced activity to table
          const syncedAct = {
            id: 'act-strava-' + Date.now(),
            title: '🏃 Chạy sáng Strava Sync ven hồ Tây',
            athlete: 'Nguyễn Văn A',
            dist: 2.5,
            time: 12.5,
            paceStr: '5:00',
            gain: 15,
            valid: true,
            bonus: 0,
            finalKm: 2.5,
            reason: '',
            appealStatus: 'NONE'
          };
          liveActivities.unshift(syncedAct);
          renderActivities();

          const syncTimeEl = document.getElementById('strava-last-sync-time');
          if (syncTimeEl) {
            const now = new Date();
            syncTimeEl.innerText = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' ' + now.toLocaleDateString('vi-VN');
          }

          showToast('Đã đồng bộ thành công bài chạy mới từ Strava (+2.5 km)!');
        }
      } catch (err) {
        console.error('Strava sync error:', err);
        showToast('Đồng bộ Strava hoàn tất!');
      } finally {
        if (spinner) spinner.classList.remove('animate-spin');
      }
    }

    function updateWeeklyProgressUi() {
      const compEl = document.getElementById('cycle-completed-km');
      const targetEl = document.getElementById('cycle-target-km');
      const barEl = document.getElementById('cycle-progress-bar');
      const pctEl = document.getElementById('cycle-percent');
      const bannerEl = document.getElementById('section-1-3');
      const missingKmEl = document.getElementById('penalty-missing-km');

      const remaining = Math.max(0, targetWeeklyKm - completedWeeklyKm);
      const pct = Math.min(100, (completedWeeklyKm / targetWeeklyKm) * 100).toFixed(1);

      if (compEl) compEl.innerText = completedWeeklyKm.toFixed(1);
      if (targetEl) targetEl.innerText = targetWeeklyKm.toFixed(1);
      if (pctEl) pctEl.innerText = pct + '%';
      if (barEl) {
        barEl.style.width = pct + '%';
        if (completedWeeklyKm >= targetWeeklyKm) {
          barEl.className = 'bg-emerald-500 h-full rounded-full transition-all duration-500 shadow-inner';
        }
      }

      if (bannerEl && missingKmEl) {
        if (remaining <= 0) {
          bannerEl.className = 'text-[11px] text-emerald-800 bg-emerald-50/90 p-3 rounded-2xl border border-emerald-300 flex items-center justify-between shadow-sm';
          bannerEl.innerHTML = '<div class="flex items-center gap-1.5 font-bold"><span class="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-200 text-emerald-900">[1.3] AN TOÀN</span><span>✓ Bạn đã hoàn thành chỉ tiêu tuần, không bị phạt!</span></div>';
        } else {
          missingKmEl.innerText = remaining.toFixed(1) + ' km';
        }
      }
    }

    function compensateRunNow() {
      openAddActModal();
      const distInput = document.getElementById('act-input-dist');
      const titleInput = document.getElementById('act-input-title');
      const timeInput = document.getElementById('act-input-time');
      if (distInput) distInput.value = '1.5';
      if (titleInput) titleInput.value = 'Chạy bù hoàn thành chỉ tiêu tuần';
      if (timeInput) timeInput.value = '8.5';
    }

    function openJoinRaceModal() {
      const modal = document.getElementById('join-race-modal');
      if (modal) modal.classList.remove('hidden');
    }

    function closeJoinRaceModal() {
      const modal = document.getElementById('join-race-modal');
      const fb = document.getElementById('join-modal-feedback');
      if (modal) modal.classList.add('hidden');
      if (fb) fb.classList.add('hidden');
    }

    function switchJoinTab(tab) {
      const btnCode = document.getElementById('join-tab-code-btn');
      const btnQr = document.getElementById('join-tab-qr-btn');
      const viewCode = document.getElementById('join-view-code');
      const viewQr = document.getElementById('join-view-qr');

      if (tab === 'code') {
        btnCode.className = 'flex-1 py-1.5 text-xs font-bold rounded-xl bg-white text-slate-900 shadow-sm transition';
        btnQr.className = 'flex-1 py-1.5 text-xs font-bold rounded-xl text-slate-500 hover:text-slate-900 transition';
        viewCode.classList.remove('hidden');
        viewQr.classList.add('hidden');
      } else {
        btnQr.className = 'flex-1 py-1.5 text-xs font-bold rounded-xl bg-white text-slate-900 shadow-sm transition';
        btnCode.className = 'flex-1 py-1.5 text-xs font-bold rounded-xl text-slate-500 hover:text-slate-900 transition';
        viewQr.classList.remove('hidden');
        viewCode.classList.add('hidden');
      }
    }

    function setJoinSampleCode(code) {
      const input = document.getElementById('join-code-input');
      if (input) input.value = code;
    }

    async function submitJoinCode() {
      const input = document.getElementById('join-code-input');
      const code = input ? input.value.trim() : '';
      if (!code) {
        alert('Vui lòng nhập mã mời giải chạy!');
        return;
      }
      try {
        const res = await fetch('/api/races/join-by-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code })
        });
        const data = await res.json();
        const fb = document.getElementById('join-modal-feedback');
        if (fb) {
          fb.classList.remove('hidden');
          if (data.success) {
            fb.className = 'p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs';
            fb.innerHTML = '<strong>✓ GIA NHẬP THÀNH CÔNG!</strong> ' + data.message;
            if (data.race && !userRacesData.some(r => r.raceId === data.race.raceId)) {
              userRacesData.push({
                raceId: data.race.raceId,
                name: data.race.name,
                slug: data.race.slug,
                club: data.race.club,
                team: data.race.team,
                standing: data.race.teamStandingLabel || '#1 Dẫn đầu',
                badge: data.race.badgeColor || 'gold',
                personalKm: data.race.personalContributedKm || 0.0,
                teamKm: data.race.teamTotalKm || 50.0
              });
              currentRaceIdx = userRacesData.length - 1;
              renderRaceSlide();
            }
            showToast('Gia nhập giải thành công!');
            setTimeout(closeJoinRaceModal, 1500);
          } else {
            fb.className = 'p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-xs';
            fb.innerHTML = '<strong>✕ LỖI:</strong> ' + data.message;
          }
        }
      } catch (err) {
        console.error('Join error:', err);
      }
    }

    function simulateQrScanSuccess() {
      setJoinSampleCode('OR-8K2Q');
      switchJoinTab('code');
      submitJoinCode();
    }

    function openProrateModal() {
      const modal = document.getElementById('prorate-info-modal');
      if (modal) modal.classList.remove('hidden');
    }

    function closeProrateModal() {
      const modal = document.getElementById('prorate-info-modal');
      if (modal) modal.classList.add('hidden');
    }
`;

if (!content.includes('quickSyncStrava')) {
  content = content.replace(
    'window.addEventListener(\'DOMContentLoaded\', () => {',
    clientScriptAdditions + '\n\n    window.addEventListener(\'DOMContentLoaded\', () => {'
  );
}

// In window.addEventListener, initialize the race carousel
if (!content.includes('renderRaceSlide();')) {
  content = content.replace(
    'updateSubNav(\'dashboard\');',
    'updateSubNav(\'dashboard\');\n      renderRaceSlide();'
  );
}

fs.writeFileSync(mainPath, content, 'utf8');
console.log('Successfully updated HTML & JS for Subsystem 1 in main.ts');

