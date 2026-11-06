const fs = require('fs');
const path = require('path');

const mainTsPath = path.resolve(__dirname, 'backend/src/main.ts');
let code = fs.readFileSync(mainTsPath, 'utf8');

console.log('--- Step 1: Adding Backend API Routes for Races Overview and Details ---');

const apiAnchor = `    // [2.1] Hero Banner & Race Countdown`;
const newRoutes = `    // [2.0] Get All Races Overview (Status & Participation)
    if (req.method === 'GET' && (pathname === '/api/races' || pathname === '/api/races/')) {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: true, races: raceArenaUseCase.getAllRacesOverview('user-01') }));
      return true;
    }

    // [2.0] Get Race Full Detail & Rules
    const raceDetailMatch = pathname.match(/^\\/api\\/races\\/([^\\/]+)\\/details$/);
    if (req.method === 'GET' && raceDetailMatch) {
      const slug = raceDetailMatch[1];
      const hero = raceArenaUseCase.getRaceHero(slug);
      const teamLeaderboard = raceArenaUseCase.getTeamLeaderboard(slug);
      const individualLeaderboard = raceArenaUseCase.getIndividualLeaderboard(slug, 'user-01');
      const myTeam = raceArenaUseCase.getMyTeamSpace(slug, 'user-01');
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: true, hero, teamLeaderboard, individualLeaderboard, myTeam }));
      return true;
    }

`;

if (!code.includes("pathname === '/api/races'")) {
  code = code.replace(apiAnchor, newRoutes + apiAnchor);
  console.log('Added /api/races and /api/races/:slug/details routes!');
}

console.log('--- Step 2: Adding Race Selector Hub to Section 2.1 ---');

const section21OldHeader = `        <!-- [SCREEN 2.1] HERO BANNER & RACE COUNTDOWN -->
        <div id="section-2-1" class="sub-screen-container block space-y-5">
          <!-- Standard Screen Header Banner -->`;

const section21NewHeader = `        <!-- [SCREEN 2.1] HERO BANNER & RACE COUNTDOWN -->
        <div id="section-2-1" class="sub-screen-container block space-y-5">
          <!-- Comprehensive Race Switcher & Active Races Overview Hub -->
          <div class="bg-gradient-to-r from-slate-50 via-orange-50/40 to-amber-50/30 rounded-3xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/70">
              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="text-base">🏆</span>
                  <h3 class="text-sm font-black text-slate-900 uppercase tracking-wider">Các Giải Đấu Đang Diễn Ra & Cá Nhân Đang Tham Gia</h3>
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-orange-100 text-[#FF5B26] border border-orange-200">Đấu Trường Giải Chạy</span>
                </div>
                <p class="text-xs text-slate-500 mt-1">Khám phá các giải chạy trực tuyến, theo dõi thứ hạng cá nhân / đội và chuyển đổi linh hoạt</p>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <button onclick="openRaceFullDetailModal()" class="px-4 py-2 rounded-xl bg-[#FF5B26] hover:bg-[#e04800] text-white text-xs font-bold shadow-md transition flex items-center gap-1.5 hover:scale-105">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  <span>Xem Chi Tiết Giải & Điều Lệ</span>
                </button>
              </div>
            </div>

            <!-- Filter Pills for Races -->
            <div class="flex items-center justify-between flex-wrap gap-2 pt-0.5">
              <div class="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-2xl text-xs font-bold text-slate-600">
                <button id="race-pill-all" onclick="filterArenaRaces('all')" class="px-3 py-1 rounded-xl bg-white text-slate-900 shadow-xs font-bold transition">Tất Cả (4)</button>
                <button id="race-pill-participating" onclick="filterArenaRaces('participating')" class="px-3 py-1 rounded-xl hover:text-slate-900 transition">🏃 Đang Tham Gia (3)</button>
                <button id="race-pill-running" onclick="filterArenaRaces('running')" class="px-3 py-1 rounded-xl hover:text-slate-900 transition">🟢 Đang Diễn Ra (3)</button>
                <button id="race-pill-upcoming" onclick="filterArenaRaces('upcoming')" class="px-3 py-1 rounded-xl hover:text-slate-900 transition">🔵 Sắp Diễn Ra (1)</button>
              </div>
              <span class="text-[11px] text-slate-400 font-medium">Bấm "Chuyển Sang Giải Này" để đồng bộ toàn bộ Đấu Trường</span>
            </div>

            <!-- Dynamic Race Cards Grid -->
            <div id="arena-races-selector-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-1">
              <!-- Dynamically populated by JS renderArenaRaceCards() -->
            </div>
          </div>

          <!-- Standard Screen Header Banner -->`;

if (!code.includes('arena-races-selector-grid')) {
  code = code.replace(section21OldHeader, section21NewHeader);
  console.log('Added Race Selector Hub to Section 2.1!');
}

console.log('--- Step 3: Updating Arena Race Select dropdown in Header Banner ---');

const oldSelect = `<select id="arena-race-select" onchange="changeArenaRace(this.value)" class="text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-[#FF5B26] shadow-sm">
                  <option value="season-10-run-to-techcombank">Mùa 10 Run to Techcombank 2026</option>
                  <option value="sarc-trail-challenge-bavi-2026">SARC Trail Challenge Ba Vì 2026</option>
                  <option value="vpbank-hanoi-marathon-prep-2026">VPBank Hanoi Marathon Prep 2026</option>
                </select>`;

const newSelect = `<div class="flex items-center gap-2">
                <select id="arena-race-select" onchange="changeArenaRace(this.value)" class="text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-[#FF5B26] shadow-sm">
                  <option value="season-10-run-to-techcombank">Mùa 10 Run to Techcombank 2026 (Đang tham gia - Hạng 1)</option>
                  <option value="sarc-trail-challenge-bavi-2026">SARC Trail Challenge Ba Vì 2026 (Đang tham gia - Hạng 2)</option>
                  <option value="vpbank-hanoi-marathon-prep-2026">VPBank Hanoi Marathon Prep 2026 (Đang tham gia - Hạng 2)</option>
                  <option value="vnexpress-marathon-hue-2027">VnExpress Marathon Cố Đô Huế 2027 (Mở đăng ký)</option>
                </select>
                <button onclick="openRaceFullDetailModal()" class="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#FF5B26] hover:bg-[#e04800] text-white shadow-sm transition flex items-center gap-1.5 shrink-0" title="Xem chi tiết, điều lệ, bảng xếp hạng và các đội">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  <span>Chi Tiết Giải</span>
                </button>
              </div>`;

if (code.includes(oldSelect)) {
  code = code.replace(oldSelect, newSelect);
  console.log('Updated Arena race select with full race options & detail button!');
}

console.log('--- Step 4: Adding Full Race Detail Modal to HTML body ---');

const modalAnchor = `  <!-- 1. EDIT CLUB PROFILE MODAL -->`;

const newRaceModal = `  <!-- 0. COMPREHENSIVE RACE DETAIL & RULES MODAL -->
  <div id="modal-race-full-detail" class="hidden fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl p-6 sm:p-7 max-w-4xl w-full shadow-2xl space-y-4 border border-slate-100 max-h-[92vh] overflow-y-auto">
      <!-- Modal Header -->
      <div class="flex items-start justify-between border-b border-slate-100 pb-3 gap-3">
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-[10px] font-bold uppercase tracking-wider text-[#FF5B26]">[2.0] Đấu Trường Giải Chạy</span>
            <span id="modal-race-status-badge" class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">🟢 Đang diễn ra</span>
            <span id="modal-race-user-badge" class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-[#FF5B26] border border-orange-200">🏃 Đang tham gia</span>
          </div>
          <h3 id="modal-race-title" class="text-base sm:text-lg font-black text-slate-900 mt-1">MÙA 10 RUN TO TECHCOMBANK 2026 – SADC/SARC</h3>
          <p id="modal-race-subtitle" class="text-xs text-slate-500">Đơn vị tổ chức: CLB Chạy Bộ SARC • Hình thức: Trực tuyến qua Strava</p>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <button id="modal-race-btn-switch" onclick="selectRaceFromModal()" class="px-3.5 py-1.5 rounded-xl bg-orange-100 hover:bg-orange-200 text-[#FF5B26] font-bold text-xs transition flex items-center gap-1 shadow-xs">
            <span>✓ Đang xem giải này</span>
          </button>
          <button onclick="closeRaceFullDetailModal()" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold transition">✕</button>
        </div>
      </div>

      <!-- Modal Tab Navigation Pills -->
      <div class="flex items-center gap-2 border-b border-slate-100 pb-2 overflow-x-auto no-scrollbar text-xs font-bold">
        <button id="mod-tab-btn-info" onclick="switchRaceDetailTab('info')" class="px-3.5 py-1.5 rounded-xl bg-[#18181B] text-white shadow-xs flex items-center gap-1.5 transition">
          <span>📋</span><span>Thông Tin & Điều Lệ</span>
        </button>
        <button id="mod-tab-btn-leaderboard" onclick="switchRaceDetailTab('leaderboard')" class="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center gap-1.5 transition">
          <span>🏆</span><span>Bảng Xếp Hạng</span>
        </button>
        <button id="mod-tab-btn-summary" onclick="switchRaceDetailTab('summary')" class="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center gap-1.5 transition">
          <span>📊</span><span>Tổng Hợp & Chỉ Số</span>
        </button>
        <button id="mod-tab-btn-teams" onclick="switchRaceDetailTab('teams')" class="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center gap-1.5 transition">
          <span>🏃‍♂️</span><span>Đội Thi Đấu</span>
        </button>
      </div>

      <!-- Tab 1: Thông Tin & Điều Lệ -->
      <div id="modal-tab-content-info" class="space-y-4 text-xs">
        <!-- Dynamically populated by JS -->
      </div>

      <!-- Tab 2: Bảng Xếp Hạng -->
      <div id="modal-tab-content-leaderboard" class="hidden space-y-4 text-xs">
        <!-- Dynamically populated by JS -->
      </div>

      <!-- Tab 3: Tổng Hợp & Chỉ Số -->
      <div id="modal-tab-content-summary" class="hidden space-y-4 text-xs">
        <!-- Dynamically populated by JS -->
      </div>

      <!-- Tab 4: Đội Thi Đấu -->
      <div id="modal-tab-content-teams" class="hidden space-y-4 text-xs">
        <!-- Dynamically populated by JS -->
      </div>

      <!-- Modal Footer -->
      <div class="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
        <span id="modal-race-footer-note">Đồng bộ tự động theo chu kỳ 15 phút từ API Strava</span>
        <button onclick="closeRaceFullDetailModal()" class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition">Đóng Cửa Sổ</button>
      </div>
    </div>
  </div>

`;

if (!code.includes('modal-race-full-detail')) {
  code = code.replace(modalAnchor, newRaceModal + modalAnchor);
  console.log('Added modal-race-full-detail to HTML!');
}

console.log('--- Step 5: Updating Client JavaScript for Multi-Race Arena ---');

// Replace function changeArenaRace with complete multi-race management logic
const oldFnAnchor = `function changeArenaRace(slug) {`;
const oldFnEnd = `showToast('Đã chuyển sang xem giải đấu: ' + (titles[slug] || slug));\n    }`;

const oldFnIdx = code.indexOf(oldFnAnchor);
const oldFnEndIdx = code.indexOf(oldFnEnd, oldFnIdx);

if (oldFnIdx === -1 || oldFnEndIdx === -1) {
  console.error('Cannot find changeArenaRace function boundaries');
  process.exit(1);
}

const fullOldFn = code.slice(oldFnIdx, oldFnEndIdx + oldFnEnd.length);

const newArenaScripts = `// ==========================================
    // MULTI-RACE ARENA CLIENT ENGINE
    // ==========================================
    let currentActiveRaceSlug = 'season-10-run-to-techcombank';
    let currentRaceFilter = 'all';
    let modalActiveRaceSlug = 'season-10-run-to-techcombank';
    let modalActiveTab = 'info';

    const fullRacesDictionary = {
      'season-10-run-to-techcombank': {
        id: 'race-season-10',
        slug: 'season-10-run-to-techcombank',
        name: 'MÙA 10 RUN TO TECHCOMBANK 2026 – SADC/SARC',
        shortName: 'Mùa 10 Run to Techcombank 2026',
        clubName: 'CLB Chạy Bộ SARC (Sáng Ánh Rạng Chiều)',
        category: 'Road & Phong Trào Tính Điểm',
        status: 'running',
        statusLabel: 'Đang diễn ra',
        startAt: '01/11/2026',
        endAt: '30/11/2026',
        location: 'Toàn quốc (Đồng bộ Strava)',
        totalAthletes: 48,
        totalTeams: 3,
        totalKm: 3170.0,
        daysRemaining: 348,
        cdDate: '30/11/2026',
        userParticipation: {
          isParticipating: true,
          teamId: 'team-phoenix',
          teamName: 'Team Phoenix SARC',
          role: 'Captain (Đội Trưởng)',
          personalKm: 125.0,
          standing: '#1 Dẫn đầu',
          rank: 1
        },
        topReward: {
          title: 'Áo thi đấu CLB SARC độc bản 2026',
          desc: 'Dành riêng cho Top 1 cá nhân xuất sắc nhất giải đấu'
        },
        rulesSummary: {
          formula: '50% Cự ly bình quân + 50% Ngày chuyên cần (Trần tối đa 140 ngày cho toàn đội)',
          minDistanceKm: '3.0 km / bài chạy',
          paceFloor: 'Pace sàn 2:45 / Pace trần 12:00',
          trailBonus: 'Không áp dụng (Giải Road phong trào)',
          fundFormula: 'Đội Vô Địch đóng 100.000đ/VĐV • Các đội Đồng Hạng 2 đóng 200.000đ/VĐV',
          tieBreak: 'Nếu bằng điểm: Ưu tiên đội có số km cao hơn, kế đến là ngày nộp bài sớm hơn'
        },
        teams: [
          { teamId: 'team-phoenix', name: 'Team Phoenix SARC', rank: 1, rankLabel: 'Hạng 1 (Vô Địch Dẫn Đầu)', badge: 'gold', totalKm: 1250.0, days: 118, score: 92.1, fund: '100.000đ/người (Quỹ Vô Địch)', membersCount: 16, captain: 'Nguyễn Văn A' },
          { teamId: 'team-dragons', name: 'Team Dragons SADC', rank: 2, rankLabel: 'Đồng Hạng 2', badge: 'silver', totalKm: 1000.0, days: 140, score: 90.0, fund: '200.000đ/người (Quỹ Đồng Hạng 2)', membersCount: 16, captain: 'Trần Thị B' },
          { teamId: 'team-tigers', name: 'Team Tigers SADC', rank: 2, rankLabel: 'Đồng Hạng 2', badge: 'silver', totalKm: 920.0, days: 129, score: 82.8, fund: '200.000đ/người (Quỹ Đồng Hạng 2)', membersCount: 16, captain: 'Lê Hoàng C' }
        ],
        runners: [
          { userId: 'user-01', name: 'Nguyễn Văn A', team: 'Team Phoenix SARC', km: 125.0, days: 18, pace: '5:15', rank: 1, isSelf: true, reward: '👑 Dẫn Đầu Nhận Áo SARC' },
          { userId: 'user-02', name: 'Trần Thị B', team: 'Team Dragons SADC', km: 118.0, days: 16, pace: '5:24', rank: 2, isSelf: false },
          { userId: 'user-03', name: 'Lê Hoàng C', team: 'Team Tigers SADC', km: 105.0, days: 15, pace: '5:32', rank: 3, isSelf: false },
          { userId: 'user-04', name: 'Phạm Minh Đức', team: 'Team Dragons SADC', km: 96.0, days: 14, pace: '5:40', rank: 4, isSelf: false },
          { userId: 'user-05', name: 'Hoàng Kim Dung', team: 'Team Phoenix SARC', km: 88.5, days: 12, pace: '5:45', rank: 5, isSelf: false },
          { userId: 'user-06', name: 'Đặng Tuấn Kiệt', team: 'Team Phoenix SARC', km: 78.0, days: 11, pace: '5:50', rank: 6, isSelf: false },
          { userId: 'user-07', name: 'Vũ Hải Nam', team: 'Team Phoenix SARC', km: 72.0, days: 10, pace: '6:00', rank: 7, isSelf: false }
        ],
        myTeam: {
          teamName: 'Team Phoenix SARC',
          captain: 'Nguyễn Văn A (Đội trưởng)',
          rank: 1,
          rankLabel: 'Hạng 1 (Vô Địch Dẫn Đầu)',
          totalKm: 1250.0,
          targetKm: 1500.0,
          members: [
            { name: 'Nguyễn Văn A', role: 'Captain', km: 125.0, days: 18, isCurrentUser: true },
            { name: 'Hoàng Kim Dung', role: 'Vice-Captain', km: 88.5, days: 12, isCurrentUser: false },
            { name: 'Đặng Tuấn Kiệt', role: 'Member', km: 78.0, days: 11, isCurrentUser: false },
            { name: 'Vũ Hải Nam', role: 'Member', km: 72.0, days: 10, isCurrentUser: false },
            { name: 'Ngô Thanh Tùng', role: 'Member', km: 68.0, days: 9, isCurrentUser: false },
            { name: 'Phan Thùy Trang', role: 'Member', km: 65.0, days: 9, isCurrentUser: false }
          ]
        }
      },

      'sarc-trail-challenge-bavi-2026': {
        id: 'race-trail-bavi-2026',
        slug: 'sarc-trail-challenge-bavi-2026',
        name: 'SARC TRAIL CHALLENGE BA VÌ 2026',
        shortName: 'SARC Trail Challenge Ba Vì 2026',
        clubName: 'SARC Trail Division',
        category: 'Địa Hình & Thưởng Dốc Trail',
        status: 'running',
        statusLabel: 'Đang diễn ra',
        startAt: '15/10/2026',
        endAt: '31/12/2026',
        location: 'Vườn Quốc Gia Ba Vì & Núi đồi tự do',
        totalAthletes: 64,
        totalTeams: 4,
        totalKm: 4890.5,
        daysRemaining: 185,
        cdDate: '31/12/2026',
        userParticipation: {
          isParticipating: true,
          teamId: 'team-dragons-trail',
          teamName: 'Dragons Trail',
          role: 'Thành viên',
          personalKm: 42.0,
          standing: 'Đồng hạng 2',
          rank: 2
        },
        topReward: {
          title: 'Kỷ niệm chương Vàng Ultra Ba Vì & Áo gió leo núi SARC Pro',
          desc: 'Dành riêng cho cá nhân xuất sắc nhất trên cung đường mòn Ba Vì'
        },
        rulesSummary: {
          formula: '60% Cự ly quy đổi (gồm thưởng dốc D+) + 40% Chuyên cần đường mòn',
          minDistanceKm: '5.0 km / bài chạy địa hình',
          paceFloor: 'Pace sàn 3:15 / Pace trần 15:00',
          trailBonus: '+1.0 km cho mỗi 100m elevation gain (D+) từ Strava',
          fundFormula: 'Đội Vô Địch đóng 150.000đ/VĐV • Các đội còn lại đóng 250.000đ/VĐV',
          tieBreak: 'Ưu tiên đội có tổng độ cao tích lũy Elevation Gain lớn hơn'
        },
        teams: [
          { teamId: 'team-phoenix-mountain', name: 'Phoenix Mountain SARC', rank: 1, rankLabel: 'Hạng 1 (Dẫn Đầu)', badge: 'gold', totalKm: 1480.0, days: 135, score: 94.5, fund: '150.000đ/người (Quỹ Vô Địch)', membersCount: 16, captain: 'Hoàng Kim Dung' },
          { teamId: 'team-dragons-trail', name: 'Dragons Trail', rank: 2, rankLabel: 'Đồng Hạng 2', badge: 'silver', totalKm: 1210.5, days: 128, score: 88.2, fund: '250.000đ/người (Quỹ Đồng Hạng 2)', membersCount: 16, captain: 'Phạm Minh Đức' },
          { teamId: 'team-tigers-trail', name: 'Tigers Trail', rank: 2, rankLabel: 'Đồng Hạng 2', badge: 'silver', totalKm: 1120.0, days: 120, score: 85.0, fund: '250.000đ/người (Quỹ Đồng Hạng 2)', membersCount: 16, captain: 'Lê Hoàng C' },
          { teamId: 'team-bavi-ultra', name: 'Ba Vì Ultra Runners', rank: 2, rankLabel: 'Đồng Hạng 2', badge: 'silver', totalKm: 1080.0, days: 115, score: 82.0, fund: '250.000đ/người (Quỹ Đồng Hạng 2)', membersCount: 16, captain: 'Vũ Hải Nam' }
        ],
        runners: [
          { userId: 'user-05', name: 'Hoàng Kim Dung', team: 'Phoenix Mountain SARC', km: 145.0, days: 19, pace: '5:45', rank: 1, isSelf: false, reward: '👑 Dẫn Đầu Nhận Cup Vàng Ba Vì' },
          { userId: 'user-04', name: 'Phạm Minh Đức', team: 'Dragons Trail', km: 122.0, days: 17, pace: '5:40', rank: 2, isSelf: false },
          { userId: 'user-02', name: 'Trần Thị B', team: 'Dragons Trail', km: 110.5, days: 16, pace: '5:35', rank: 3, isSelf: false },
          { userId: 'user-01', name: 'Nguyễn Văn A', team: 'Dragons Trail', km: 42.0, days: 8, pace: '6:10', rank: 4, isSelf: true },
          { userId: 'user-06', name: 'Đặng Tuấn Kiệt', team: 'Tigers Trail', km: 38.0, days: 7, pace: '6:30', rank: 5, isSelf: false },
          { userId: 'user-07', name: 'Vũ Hải Nam', team: 'Ba Vì Ultra Runners', km: 35.0, days: 6, pace: '6:45', rank: 6, isSelf: false }
        ],
        myTeam: {
          teamName: 'Dragons Trail',
          captain: 'Phạm Minh Đức (Đội trưởng)',
          rank: 2,
          rankLabel: 'Đồng Hạng 2',
          totalKm: 1210.5,
          targetKm: 1500.0,
          members: [
            { name: 'Phạm Minh Đức', role: 'Captain', km: 122.0, days: 17, isCurrentUser: false },
            { name: 'Trần Thị B', role: 'Vice-Captain', km: 110.5, days: 16, isCurrentUser: false },
            { name: 'Nguyễn Văn A', role: 'Member', km: 42.0, days: 8, isCurrentUser: true },
            { name: 'Lê Hải Đăng', role: 'Member', km: 95.0, days: 14, isCurrentUser: false },
            { name: 'Vũ Bích Hạnh', role: 'Member', km: 88.0, days: 13, isCurrentUser: false }
          ]
        }
      },

      'vpbank-hanoi-marathon-prep-2026': {
        id: 'race-vpbank-prep',
        slug: 'vpbank-hanoi-marathon-prep-2026',
        name: 'VPBANK HANOI MARATHON PREP 2026',
        shortName: 'VPBank Hanoi Marathon Prep 2026',
        clubName: 'Hanoi Runners Union & SARC',
        category: 'Tích Lũy Tốc Độ & Long Run Hồ Tây',
        status: 'running',
        statusLabel: 'Đang diễn ra',
        startAt: '01/10/2026',
        endAt: '20/12/2026',
        location: 'Hà Nội (Hồ Tây, Phố Cổ)',
        totalAthletes: 36,
        totalTeams: 3,
        totalKm: 2450.0,
        daysRemaining: 92,
        cdDate: '20/12/2026',
        userParticipation: {
          isParticipating: true,
          teamId: 'team-tigers-speed',
          teamName: 'Tigers Speed',
          role: 'Thành viên',
          personalKm: 68.0,
          standing: 'Đồng hạng 2',
          rank: 2
        },
        topReward: {
          title: 'Vé xuất phát VIP Marathon 2026 & Đai chạy bộ cao cấp',
          desc: 'Vinh danh cá nhân dẫn đầu giai đoạn luyện tốc độ'
        },
        rulesSummary: {
          formula: '70% Cự ly tích lũy + 30% Chuyên cần',
          minDistanceKm: '5.0 km / bài chạy',
          paceFloor: 'Pace sàn 3:00 / Pace trần 10:00',
          trailBonus: 'Không áp dụng (Giải Road tốc độ)',
          fundFormula: 'Đội dẫn đầu đóng 100.000đ/VĐV • Các đội sau đóng 150.000đ/VĐV',
          tieBreak: 'Ưu tiên VĐV có Pace trung bình cao hơn'
        },
        teams: [
          { teamId: 'team-hanoi-fast', name: 'Hanoi Fast Striders', rank: 1, rankLabel: 'Hạng 1 (Dẫn Đầu)', badge: 'gold', totalKm: 980.0, days: 88, score: 91.0, fund: '100.000đ/người', membersCount: 12, captain: 'Lê Hoàng C' },
          { teamId: 'team-tigers-speed', name: 'Tigers Speed', rank: 2, rankLabel: 'Đồng Hạng 2', badge: 'silver', totalKm: 810.0, days: 80, score: 84.5, fund: '150.000đ/người', membersCount: 12, captain: 'Đặng Tuấn Kiệt' },
          { teamId: 'team-old-quarter', name: 'Old Quarter Runners', rank: 2, rankLabel: 'Đồng Hạng 2', badge: 'silver', totalKm: 660.0, days: 74, score: 79.0, fund: '150.000đ/người', membersCount: 12, captain: 'Ngô Thanh Tùng' }
        ],
        runners: [
          { userId: 'user-03', name: 'Lê Hoàng C', team: 'Hanoi Fast Striders', km: 115.0, days: 17, pace: '4:55', rank: 1, isSelf: false, reward: '👑 Vé Xuất Phát VIP Marathon' },
          { userId: 'user-01', name: 'Nguyễn Văn A', team: 'Tigers Speed', km: 68.0, days: 11, pace: '5:10', rank: 2, isSelf: true },
          { userId: 'user-06', name: 'Đặng Tuấn Kiệt', team: 'Tigers Speed', km: 65.0, days: 10, pace: '5:18', rank: 3, isSelf: false },
          { userId: 'user-02', name: 'Trần Thị B', team: 'Old Quarter Runners', km: 62.0, days: 9, pace: '5:25', rank: 4, isSelf: false }
        ],
        myTeam: {
          teamName: 'Tigers Speed',
          captain: 'Đặng Tuấn Kiệt (Đội trưởng)',
          rank: 2,
          rankLabel: 'Đồng Hạng 2',
          totalKm: 810.0,
          targetKm: 1000.0,
          members: [
            { name: 'Đặng Tuấn Kiệt', role: 'Captain', km: 65.0, days: 10, isCurrentUser: false },
            { name: 'Nguyễn Văn A', role: 'Member', km: 68.0, days: 11, isCurrentUser: true },
            { name: 'Bùi Đức Anh', role: 'Member', km: 75.0, days: 11, isCurrentUser: false }
          ]
        }
      },

      'vnexpress-marathon-hue-2027': {
        id: 'race-vm-hue-2027',
        slug: 'vnexpress-marathon-hue-2027',
        name: 'VNEXPRESS MARATHON CỐ ĐÔ HUẾ 2027',
        shortName: 'VnExpress Marathon Cố Đô Huế 2027',
        clubName: 'Huế Heritage Runners & SARC',
        category: 'Giải Chạy Du Lịch Cố Đô',
        status: 'upcoming',
        statusLabel: 'Sắp diễn ra',
        startAt: '15/03/2027',
        endAt: '30/04/2027',
        location: 'Thành phố Huế, Thừa Thiên Huế',
        totalAthletes: 24,
        totalTeams: 2,
        totalKm: 0.0,
        daysRemaining: 455,
        cdDate: '15/03/2027',
        userParticipation: {
          isParticipating: false,
          standing: 'Chưa tham gia (Mở đăng ký)'
        },
        topReward: {
          title: 'Huy chương mạ bạc men lam Huế & Vé máy bay tài trợ',
          desc: 'Vinh danh đoàn thể thao có thành tích xuất sắc nhất'
        },
        rulesSummary: {
          formula: 'Điểm tích lũy theo số VĐV hoàn thành đúng Cut-Off Time',
          minDistanceKm: '21.0 km & 42.0 km',
          paceFloor: 'Pace sàn 2:45 / Pace trần 12:00',
          trailBonus: 'Không áp dụng',
          fundFormula: 'Quỹ tài trợ giải thưởng theo gói hội viên CLB',
          tieBreak: 'Ưu tiên đội có số lượng VĐV Full Marathon cao hơn'
        },
        teams: [
          { teamId: 'team-huong-giang', name: 'Hương Giang Striders', rank: 1, rankLabel: 'Đăng Ký Sớm', badge: 'gold', totalKm: 0.0, days: 0, score: 0, fund: 'Gói Hội Viên', membersCount: 12, captain: 'Phan Thùy Trang' },
          { teamId: 'team-ngu-binh', name: 'Ngự Bình Runners', rank: 1, rankLabel: 'Đăng Ký Sớm', badge: 'gold', totalKm: 0.0, days: 0, score: 0, fund: 'Gói Hội Viên', membersCount: 12, captain: 'Vũ Hải Nam' }
        ],
        runners: [
          { userId: 'user-09', name: 'Phan Thùy Trang', team: 'Hương Giang Striders', km: 0.0, days: 0, pace: '0:00', rank: 1, isSelf: false },
          { userId: 'user-07', name: 'Vũ Hải Nam', team: 'Ngự Bình Runners', km: 0.0, days: 0, pace: '0:00', rank: 2, isSelf: false }
        ],
        myTeam: {
          teamName: 'Chưa tham gia đội',
          captain: 'Đang mở cổng đăng ký',
          rank: 0,
          rankLabel: 'Chưa có thứ hạng',
          totalKm: 0.0,
          targetKm: 5000.0,
          members: []
        }
      }
    };

    function renderArenaRaceCards(filter = 'all') {
      currentRaceFilter = filter;
      const grid = document.getElementById('arena-races-selector-grid');
      if (!grid) return;

      // Update Filter Pills UI
      ['all', 'participating', 'running', 'upcoming'].forEach(f => {
        const btn = document.getElementById('race-pill-' + f);
        if (btn) {
          if (f === filter) {
            btn.className = 'px-3 py-1 rounded-xl bg-white text-slate-900 shadow-xs font-bold transition';
          } else {
            btn.className = 'px-3 py-1 rounded-xl hover:text-slate-900 transition';
          }
        }
      });

      const racesList = Object.values(fullRacesDictionary);
      let filtered = racesList;
      if (filter === 'participating') {
        filtered = racesList.filter(r => r.userParticipation && r.userParticipation.isParticipating);
      } else if (filter === 'running') {
        filtered = racesList.filter(r => r.status === 'running');
      } else if (filter === 'upcoming') {
        filtered = racesList.filter(r => r.status === 'upcoming');
      }

      grid.innerHTML = filtered.map(r => {
        const isActive = r.slug === currentActiveRaceSlug;
        const cardRing = isActive 
          ? 'border-2 border-[#FF5B26] ring-2 ring-orange-200 bg-gradient-to-b from-orange-50/50 to-white shadow-md' 
          : 'border border-slate-200/90 bg-white hover:border-orange-300 hover:shadow-md';

        const statusPill = r.status === 'running' 
          ? '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Đang diễn ra</span>'
          : '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200"><span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Sắp diễn ra</span>';

        const userPill = (r.userParticipation && r.userParticipation.isParticipating)
          ? '<div class="p-2 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between text-[11px]">' +
              '<span class="font-extrabold text-emerald-800 flex items-center gap-1"><span>🏃</span> Đang tham gia</span>' +
              '<span class="font-mono font-bold text-emerald-700">' + r.userParticipation.teamName + '</span>' +
            '</div>'
          : '<div class="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px] text-slate-500">' +
              '<span>⚪ Chưa tham gia</span>' +
              '<span class="font-semibold text-slate-600">Mở đăng ký</span>' +
            '</div>';

        const switchBtn = isActive
          ? '<button disabled class="w-full py-2 rounded-xl bg-orange-100 text-[#FF5B26] font-extrabold text-xs flex items-center justify-center gap-1 cursor-default">✓ Đang Xem</button>'
          : '<button onclick="changeArenaRace(\\'' + r.slug + '\\')" class="w-full py-2 rounded-xl bg-[#FF5B26] hover:bg-[#e04800] text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-1">Chuyển Sang Giải Này</button>';

        return '<div class="p-4 rounded-2xl ' + cardRing + ' flex flex-col justify-between space-y-3 transition">' +
          '<div class="space-y-2.5">' +
            '<div class="flex items-center justify-between gap-1">' +
              '<span class="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-600 font-mono">' + r.category + '</span>' +
              statusPill +
            '</div>' +
            '<div>' +
              '<h4 class="font-black text-slate-900 text-xs leading-snug line-clamp-2">' + r.name + '</h4>' +
              '<p class="text-[11px] text-slate-400 mt-0.5 font-medium">' + r.clubName + '</p>' +
            '</div>' +
            userPill +
            '<div class="grid grid-cols-2 gap-1.5 pt-1 text-[11px] font-mono text-slate-600 border-t border-slate-100">' +
              '<div>VĐV: <strong class="text-slate-900">' + r.totalAthletes + '</strong></div>' +
              '<div>Số đội: <strong class="text-slate-900">' + r.totalTeams + '</strong></div>' +
              '<div>Tổng: <strong class="text-orange-600">' + Number(r.totalKm).toLocaleString('en-US') + ' km</strong></div>' +
              '<div>Còn: <strong class="text-slate-900">' + r.daysRemaining + ' ngày</strong></div>' +
            '</div>' +
          '</div>' +
          '<div class="space-y-1.5 pt-2 border-t border-slate-100">' +
            switchBtn +
            '<button onclick="openRaceFullDetailModal(\\'' + r.slug + '\\')" class="w-full py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition flex items-center justify-center gap-1">' +
              '<span>ℹ️ Chi Tiết & Điều Lệ</span>' +
            '</button>' +
          '</div>' +
        '</div>';
      }).join('');
    }

    function filterArenaRaces(filter) {
      renderArenaRaceCards(filter);
    }

    function changeArenaRace(slug) {
      const race = fullRacesDictionary[slug] || fullRacesDictionary['season-10-run-to-techcombank'];
      currentActiveRaceSlug = race.slug;

      // 1. Sync Dropdown
      const selectEl = document.getElementById('arena-race-select');
      if (selectEl) selectEl.value = race.slug;

      // 2. Update Hero Banner Elements
      const titleEl = document.getElementById('arena-race-title');
      if (titleEl) titleEl.innerText = race.name;

      const athletesEl = document.getElementById('hero-athletes');
      if (athletesEl) athletesEl.innerText = race.totalAthletes;

      const kmEl = document.getElementById('hero-km');
      if (kmEl) kmEl.innerText = Number(race.totalKm).toLocaleString('en-US', { minimumFractionDigits: 1 });

      const daysEl = document.getElementById('hero-days');
      if (daysEl) daysEl.innerText = race.daysRemaining;

      const cdDays = document.getElementById('cd-days');
      if (cdDays) cdDays.innerText = race.daysRemaining;

      // 3. Update Team Leaderboard in Section 2.2
      renderArenaTeamsForRace(race);

      // 4. Update Individual Leaderboard in Section 2.3
      renderArenaRunnersForRace(race);

      // 5. Update My Team Space in Section 2.4
      renderArenaMyTeamForRace(race);

      // 6. Refresh Race Selector Cards
      renderArenaRaceCards(currentRaceFilter);

      showToast('✓ Đã chuyển sang xem giải đấu: ' + (race.shortName || race.name));
    }

    function renderArenaTeamsForRace(race) {
      const container = document.getElementById('arena-team-view');
      if (!container) return;

      container.innerHTML = race.teams.map((t, idx) => {
        const isGold = t.rank === 1;
        const borderStyle = isGold ? 'border-2 border-amber-300 bg-gradient-to-br from-amber-50 via-orange-50/50 to-white' : 'border border-slate-200 bg-white';
        const badgeBg = isGold ? 'bg-amber-100 text-amber-900 border border-amber-300 font-extrabold' : 'bg-slate-100 text-slate-700 font-bold';

        return '<div class="relative overflow-hidden rounded-2xl ' + borderStyle + ' p-5 shadow-sm space-y-3">' +
          '<div class="flex items-center justify-between flex-wrap gap-3">' +
            '<div class="flex items-center gap-3">' +
              '<div class="w-12 h-12 rounded-2xl ' + (isGold ? 'bg-gradient-to-tr from-amber-400 to-orange-500 text-white' : 'bg-slate-200 text-slate-700') + ' flex items-center justify-center font-black text-lg shadow-sm">' +
                (isGold ? '🥇' : '🥈') +
              '</div>' +
              '<div>' +
                '<div class="flex items-center gap-2">' +
                  '<h3 class="text-base font-black text-slate-900">' + t.name + '</h3>' +
                  '<span class="px-2.5 py-0.5 rounded-full text-xs ' + badgeBg + '">' + t.rankLabel + '</span>' +
                '</div>' +
                '<p class="text-xs text-slate-500 mt-0.5">Đội trưởng: <strong class="text-slate-700">' + t.captain + '</strong> • Sĩ số: <strong>' + t.membersCount + ' VĐV</strong></p>' +
              '</div>' +
            '</div>' +
            '<div class="text-right">' +
              '<div class="text-[10px] text-slate-400 uppercase font-bold">Mức đóng quỹ dự kiến</div>' +
              '<div class="text-sm font-black font-mono text-slate-900 mt-0.5">' + t.fund + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="grid grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-xs text-center">' +
            '<div class="p-2 rounded-xl bg-slate-50">' +
              '<div class="text-[10px] text-slate-400 font-bold uppercase">Tổng Cự Ly</div>' +
              '<div class="text-sm font-black font-mono text-[#FF5B26] mt-0.5">' + Number(t.totalKm).toLocaleString('en-US', { minimumFractionDigits: 1 }) + ' km</div>' +
            '</div>' +
            '<div class="p-2 rounded-xl bg-slate-50">' +
              '<div class="text-[10px] text-slate-400 font-bold uppercase">Chuyên Cần</div>' +
              '<div class="text-sm font-black font-mono text-slate-800 mt-0.5">' + t.days + ' ngày</div>' +
            '</div>' +
            '<div class="p-2 rounded-xl bg-slate-50">' +
              '<div class="text-[10px] text-slate-400 font-bold uppercase">Điểm Tổng Hợp</div>' +
              '<div class="text-sm font-black font-mono text-emerald-600 mt-0.5">' + t.score + ' pts</div>' +
            '</div>' +
          '</div>' +
        '</div>';
      }).join('');
    }

    function renderArenaRunnersForRace(race) {
      const container = document.getElementById('individual-runners-list');
      if (!container) return;

      arenaRunnersData = race.runners || [];

      // Update Sticky Self Row
      const selfRunner = arenaRunnersData.find(r => r.isSelf) || arenaRunnersData[0];
      const stickySelf = document.getElementById('arena-sticky-self');
      if (stickySelf && selfRunner) {
        stickySelf.innerHTML = '<div class="flex items-center gap-3">' +
          '<div class="w-9 h-9 rounded-xl bg-[#FF5B26] text-white flex items-center justify-center font-bold text-sm">#' + selfRunner.rank + '</div>' +
          '<div>' +
            '<div class="flex items-center gap-2">' +
              '<span class="font-extrabold text-sm">' + selfRunner.name + ' (Bạn)</span>' +
              '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-white/20 text-slate-200">' + selfRunner.team + '</span>' +
            '</div>' +
            '<div class="text-[11px] text-slate-400">Pace trung bình: <strong class="text-amber-400">' + selfRunner.pace + '</strong> • Số ngày: <strong>' + selfRunner.days + ' ngày</strong></div>' +
          '</div>' +
        '</div>' +
        '<div class="text-right">' +
          '<div class="text-lg font-black font-mono text-[#FF5B26]">' + Number(selfRunner.km).toFixed(1) + ' km</div>' +
          '<div class="text-[10px] text-emerald-400 font-semibold">Hợp lệ 100% ✓</div>' +
        '</div>';
      }

      renderIndividualRunners();
    }

    function renderArenaMyTeamForRace(race) {
      const team = race.myTeam;
      if (!team) return;

      const nameEl = document.getElementById('myteam-display-name');
      if (nameEl) nameEl.innerText = team.teamName;

      const captEl = document.getElementById('myteam-display-captain');
      if (captEl) captEl.innerText = team.captain;

      const kmEl = document.getElementById('myteam-display-km');
      if (kmEl) kmEl.innerText = Number(team.totalKm).toLocaleString('en-US', { minimumFractionDigits: 1 }) + ' km';
    }

    // Modal Handlers: Full Race Detail & Rules
    function openRaceFullDetailModal(slug) {
      modalActiveRaceSlug = slug || currentActiveRaceSlug;
      const race = fullRacesDictionary[modalActiveRaceSlug] || fullRacesDictionary['season-10-run-to-techcombank'];

      document.getElementById('modal-race-title').innerText = race.name;
      document.getElementById('modal-race-subtitle').innerText = 'Đơn vị tổ chức: ' + race.clubName + ' • ' + race.location + ' • Thời gian: ' + race.startAt + ' - ' + race.endAt;

      // Status Badge
      const statusBadge = document.getElementById('modal-race-status-badge');
      if (statusBadge) {
        statusBadge.innerHTML = race.status === 'running' 
          ? '🟢 ' + race.statusLabel 
          : '🔵 ' + race.statusLabel;
        statusBadge.className = race.status === 'running'
          ? 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200'
          : 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200';
      }

      // User Participation Badge
      const userBadge = document.getElementById('modal-race-user-badge');
      if (userBadge) {
        if (race.userParticipation && race.userParticipation.isParticipating) {
          userBadge.innerText = '🏃 Đang tham gia: ' + race.userParticipation.teamName + ' (' + race.userParticipation.standing + ')';
          userBadge.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300';
        } else {
          userBadge.innerText = '⚪ Chưa tham gia';
          userBadge.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200';
        }
      }

      // Switch Button inside Modal
      const btnSwitch = document.getElementById('modal-race-btn-switch');
      if (btnSwitch) {
        if (race.slug === currentActiveRaceSlug) {
          btnSwitch.innerHTML = '✓ Đang xem giải này';
          btnSwitch.className = 'px-3.5 py-1.5 rounded-xl bg-orange-100 text-[#FF5B26] font-bold text-xs transition cursor-default shadow-xs';
        } else {
          btnSwitch.innerHTML = '🚀 Chuyển sang giải này ngay';
          btnSwitch.className = 'px-3.5 py-1.5 rounded-xl bg-[#FF5B26] hover:bg-[#e04800] text-white font-bold text-xs transition shadow-sm';
        }
      }

      renderRaceDetailTabContent(race);
      switchRaceDetailTab('info');
      document.getElementById('modal-race-full-detail')?.classList.remove('hidden');
    }

    function closeRaceFullDetailModal() {
      document.getElementById('modal-race-full-detail')?.classList.add('hidden');
    }

    function selectRaceFromModal() {
      changeArenaRace(modalActiveRaceSlug);
      closeRaceFullDetailModal();
    }

    function switchRaceDetailTab(tabName) {
      modalActiveTab = tabName;
      ['info', 'leaderboard', 'summary', 'teams'].forEach(t => {
        const btn = document.getElementById('mod-tab-btn-' + t);
        const pane = document.getElementById('modal-tab-content-' + t);
        if (btn) {
          if (t === tabName) {
            btn.className = 'px-3.5 py-1.5 rounded-xl bg-[#18181B] text-white shadow-xs flex items-center gap-1.5 transition font-bold';
          } else {
            btn.className = 'px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center gap-1.5 transition font-bold';
          }
        }
        if (pane) {
          if (t === tabName) pane.classList.remove('hidden');
          else pane.classList.add('hidden');
        }
      });
    }

    function renderRaceDetailTabContent(race) {
      // 1. Tab Info & Rules
      const infoPane = document.getElementById('modal-tab-content-info');
      if (infoPane) {
        infoPane.innerHTML = '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">' +
          '<div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">' +
            '<h4 class="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5"><span>📋</span> Thông Tin Chung & Quy Chuẩn</h4>' +
            '<div class="space-y-2 text-slate-600">' +
              '<div>• <strong>Tên giải:</strong> ' + race.name + '</div>' +
              '<div>• <strong>Đơn vị tổ chức:</strong> ' + race.clubName + '</div>' +
              '<div>• <strong>Chuyên mục:</strong> ' + race.category + '</div>' +
              '<div>• <strong>Thời gian thi đấu:</strong> ' + race.startAt + ' đến ' + race.endAt + ' (' + race.daysRemaining + ' ngày)</div>' +
              '<div>• <strong>Địa điểm & Hình thức:</strong> ' + race.location + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="p-4 rounded-2xl bg-orange-50/50 border border-orange-200/80 space-y-3">' +
            '<h4 class="font-black text-orange-950 text-xs uppercase tracking-wider flex items-center gap-1.5"><span>⚖️</span> Thể Lệ & Cơ Chế Tính Điểm</h4>' +
            '<div class="space-y-2 text-slate-700">' +
              '<div>• <strong>Công thức xếp hạng:</strong> ' + race.rulesSummary.formula + '</div>' +
              '<div>• <strong>Cự ly tối thiểu mỗi bài:</strong> ' + race.rulesSummary.minDistanceKm + '</div>' +
              '<div>• <strong>Giới hạn tốc độ:</strong> ' + race.rulesSummary.paceFloor + '</div>' +
              '<div>• <strong>Thưởng dốc Elevation:</strong> ' + race.rulesSummary.trailBonus + '</div>' +
              '<div>• <strong>Quy định đóng quỹ:</strong> ' + race.rulesSummary.fundFormula + '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex items-center gap-3.5">' +
          '<div class="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-2xl shrink-0">🎁</div>' +
          '<div>' +
            '<div class="font-extrabold text-amber-950 text-xs uppercase tracking-wider">Cơ Cấu Giải Thưởng Top 1 Vinh Danh</div>' +
            '<div class="font-black text-slate-900 text-sm mt-0.5">' + race.topReward.title + '</div>' +
            '<p class="text-xs text-slate-600 mt-0.5">' + race.topReward.desc + '</p>' +
          '</div>' +
        '</div>';
      }

      // 2. Tab Leaderboard
      const lbPane = document.getElementById('modal-tab-content-leaderboard');
      if (lbPane) {
        lbPane.innerHTML = '<div class="space-y-4">' +
          '<div>' +
            '<h4 class="font-black text-slate-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5"><span>👥</span> Bảng Xếp Hạng Đội Thi Đấu</h4>' +
            '<div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">' +
              race.teams.map(t => '<div class="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">' +
                '<div class="flex items-center gap-2.5">' +
                  '<span class="w-7 h-7 rounded-lg ' + (t.rank === 1 ? 'bg-amber-100 text-amber-900 font-black' : 'bg-slate-200 text-slate-700 font-bold') + ' flex items-center justify-center text-xs font-mono">#' + t.rank + '</span>' +
                  '<div>' +
                    '<div class="font-extrabold text-slate-900 text-xs">' + t.name + '</div>' +
                    '<div class="text-[10px] text-slate-400">Đội trưởng: ' + t.captain + ' • ' + t.membersCount + ' VĐV</div>' +
                  '</div>' +
                '</div>' +
                '<div class="text-right">' +
                  '<div class="text-xs font-black font-mono text-[#FF5B26]">' + Number(t.totalKm).toFixed(1) + ' km</div>' +
                  '<div class="text-[10px] text-slate-500 font-semibold">' + t.days + ' ngày CC</div>' +
                '</div>' +
              '</div>').join('') +
            '</div>' +
          '</div>' +
          '<div>' +
            '<h4 class="font-black text-slate-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5"><span>🏃</span> Top Vận Động Viên Dẫn Đầu</h4>' +
            '<div class="overflow-x-auto rounded-xl border border-slate-200">' +
              '<table class="w-full text-left text-xs">' +
                '<thead class="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">' +
                  '<tr><th class="py-2.5 px-3">Hạng</th><th class="py-2.5 px-3">VĐV</th><th class="py-2.5 px-3">Đội Thi</th><th class="py-2.5 px-3 text-right">Tổng KM</th><th class="py-2.5 px-3 text-right">Chuyên Cần</th><th class="py-2.5 px-3 text-right">Pace</th></tr>' +
                '</thead>' +
                '<tbody class="divide-y divide-slate-100">' +
                  race.runners.slice(0, 5).map(r => '<tr class="' + (r.isSelf ? 'bg-orange-50/60 font-bold' : '') + '">' +
                    '<td class="py-2.5 px-3 font-mono font-bold">#' + r.rank + '</td>' +
                    '<td class="py-2.5 px-3">' + r.name + (r.isSelf ? ' <span class="text-[10px] text-[#FF5B26] font-bold">(Bạn)</span>' : '') + '</td>' +
                    '<td class="py-2.5 px-3 text-slate-600">' + r.team + '</td>' +
                    '<td class="py-2.5 px-3 text-right font-mono font-black text-[#FF5B26]">' + Number(r.km).toFixed(1) + ' km</td>' +
                    '<td class="py-2.5 px-3 text-right font-mono">' + r.days + ' ngày</td>' +
                    '<td class="py-2.5 px-3 text-right font-mono font-bold text-slate-800">' + r.pace + '</td>' +
                  '</tr>').join('') +
                '</tbody>' +
              '</table>' +
            '</div>' +
          '</div>' +
        '</div>';
      }

      // 3. Tab Summary & Metrics
      const sumPane = document.getElementById('modal-tab-content-summary');
      if (sumPane) {
        sumPane.innerHTML = '<div class="space-y-4">' +
          '<div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">' +
            '<div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">' +
              '<div class="text-[10px] text-slate-400 font-bold uppercase">Tổng Vận Động Viên</div>' +
              '<div class="text-xl font-black font-mono text-slate-900 mt-0.5">' + race.totalAthletes + '</div>' +
              '<div class="text-[10px] text-emerald-600 font-bold mt-0.5">Tham gia thi đấu</div>' +
            '</div>' +
            '<div class="p-3.5 rounded-2xl bg-orange-50/60 border border-orange-100">' +
              '<div class="text-[10px] text-orange-600 font-bold uppercase">Tổng Cự Ly Tích Lũy</div>' +
              '<div class="text-xl font-black font-mono text-[#FF5B26] mt-0.5">' + Number(race.totalKm).toLocaleString('en-US', { minimumFractionDigits: 1 }) + '</div>' +
              '<div class="text-[10px] text-orange-600 font-bold mt-0.5">km hoàn thành</div>' +
            '</div>' +
            '<div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">' +
              '<div class="text-[10px] text-slate-400 font-bold uppercase">Số Đội Tranh Tài</div>' +
              '<div class="text-xl font-black font-mono text-slate-900 mt-0.5">' + race.totalTeams + '</div>' +
              '<div class="text-[10px] text-slate-500 font-bold mt-0.5">Chia bảng thi đấu</div>' +
            '</div>' +
            '<div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">' +
              '<div class="text-[10px] text-slate-400 font-bold uppercase">Thời Gian Thi Đấu</div>' +
              '<div class="text-xl font-black font-mono text-slate-900 mt-0.5">' + race.daysRemaining + '</div>' +
              '<div class="text-[10px] text-slate-500 font-bold mt-0.5">ngày còn lại</div>' +
            '</div>' +
          '</div>' +
          '<div class="p-4 rounded-2xl bg-[#18181B] text-white flex items-center justify-between flex-wrap gap-3">' +
            '<div>' +
              '<div class="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-semibold">Chốt Nộp Bài Chạy Strava</div>' +
              '<div class="text-base font-black font-mono text-amber-400 mt-0.5">23:59:59 Hàng Ngày • Chốt Giải: ' + race.cdDate + '</div>' +
            '</div>' +
            '<div class="px-3 py-1.5 rounded-xl bg-white/10 text-emerald-400 font-bold text-xs flex items-center gap-1.5">' +
              '<span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Chống gian lận & Chống nộp muộn: BẬT' +
            '</div>' +
          '</div>' +
        '</div>';
      }

      // 4. Tab Competing Teams
      const teamsPane = document.getElementById('modal-tab-content-teams');
      if (teamsPane) {
        teamsPane.innerHTML = '<div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">' +
          race.teams.map(t => '<div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2.5">' +
            '<div class="flex items-center justify-between">' +
              '<h4 class="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">' +
                '<span class="w-6 h-6 rounded-lg bg-orange-100 text-[#FF5B26] flex items-center justify-center font-bold text-xs">' + (t.rank === 1 ? '🥇' : '🥈') + '</span>' +
                '<span>' + t.name + '</span>' +
              '</h4>' +
              '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-slate-700 border border-slate-200">' + t.membersCount + ' VĐV</span>' +
            '</div>' +
            '<div class="text-xs text-slate-600 space-y-1">' +
              '<div>• Đội trưởng: <strong class="text-slate-900">' + t.captain + '</strong></div>' +
              '<div>• Tổng cự ly: <strong class="text-[#FF5B26] font-mono">' + Number(t.totalKm).toFixed(1) + ' km</strong></div>' +
              '<div>• Ngày chuyên cần: <strong class="font-mono">' + t.days + ' ngày</strong></div>' +
              '<div>• Điểm số xếp hạng: <strong class="text-emerald-700 font-mono">' + t.score + ' pts</strong></div>' +
            '</div>' +
          '</div>').join('') +
        '</div>';
      }
    }

    `;

code = code.replace(fullOldFn, newArenaScripts);
console.log('Replaced changeArenaRace with full Multi-Race Engine!');

// Make sure renderArenaRaceCards() is called on DOMContentLoaded
const domContentLoadedAnchor = `renderClubDisplay();`;
if (!code.includes('renderArenaRaceCards();')) {
  code = code.replace(domContentLoadedAnchor, `${domContentLoadedAnchor}\n      renderArenaRaceCards();`);
  console.log('Added renderArenaRaceCards() to DOMContentLoaded!');
}

fs.writeFileSync(mainTsPath, code, 'utf8');
console.log('Successfully written main.ts with all multi-race features!');

