const fs = require('fs');
const path = require('path');

const mainPath = path.join(__dirname, 'src', 'main.ts');
let content = fs.readFileSync(mainPath, 'utf8');

// 1. Add import
if (!content.includes("race-arena.use-case")) {
  content = content.replace(
    "import { RunnerDashboardUseCase } from './application/use-cases/runner-dashboard.use-case';",
    "import { RunnerDashboardUseCase } from './application/use-cases/runner-dashboard.use-case';\nimport { RaceArenaUseCase } from './application/use-cases/race-arena.use-case';"
  );
}

// 2. Add instantiation in bootstrap
if (!content.includes("const raceArenaUseCase = new RaceArenaUseCase(dataStore);")) {
  content = content.replace(
    "const runnerDashboardUseCase = new RunnerDashboardUseCase(dataStore);",
    "const runnerDashboardUseCase = new RunnerDashboardUseCase(dataStore);\n  const raceArenaUseCase = new RaceArenaUseCase(dataStore);"
  );
}

// 3. Add API routes in handleApiRequest
const routesToInsert = `    // [2.1] Race Hero & Countdown Details
    const raceHeroMatch = pathname.match(/^\\/api\\/races\\/([^\\/]+)$/);
    if (req.method === 'GET' && raceHeroMatch) {
      const slug = raceHeroMatch[1];
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(raceArenaUseCase.getRaceHero(slug)));
      return true;
    }

    // [2.2] Team Leaderboard
    const teamsMatch = pathname.match(/^\\/api\\/races\\/([^\\/]+)\\/leaderboard\\/teams$/);
    if (req.method === 'GET' && teamsMatch) {
      const slug = teamsMatch[1];
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(raceArenaUseCase.getTeamLeaderboard(slug)));
      return true;
    }

    // [2.3] Individual Leaderboard
    const indMatch = pathname.match(/^\\/api\\/races\\/([^\\/]+)\\/leaderboard\\/individuals$/);
    if (req.method === 'GET' && indMatch) {
      const slug = indMatch[1];
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(raceArenaUseCase.getIndividualLeaderboard(slug, 'user-01')));
      return true;
    }

    // [2.4] My Team Space
    const myTeamMatch = pathname.match(/^\\/api\\/races\\/([^\\/]+)\\/my-team$/);
    if (req.method === 'GET' && myTeamMatch) {
      const slug = myTeamMatch[1];
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(raceArenaUseCase.getMyTeamSpace(slug, 'user-01')));
      return true;
    }

    // [2.4] Post Cheer Message
    const cheerMatch = pathname.match(/^\\/api\\/races\\/([^\\/]+)\\/my-team\\/cheer$/);
    if (req.method === 'POST' && cheerMatch) {
      let body = '';
      req.on('data', (chunk) => { body += chunk; });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body || '{}');
          raceArenaUseCase.postCheer(payload.author || 'Nguyễn Văn A', payload.message || 'Cố lên cả đội!');
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: true, message: 'Đã gửi lời cổ vũ tới toàn đội!' }));
        } catch (err: any) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return true;
    }

    // [2.5] SSE Live Stream Endpoint
    const streamMatch = pathname.match(/^\\/api\\/races\\/([^\\/]+)\\/stream$/);
    if (req.method === 'GET' && streamMatch) {
      const slug = streamMatch[1];
      res.writeHead(200, {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      });
      raceArenaUseCase.addStreamClient(slug, res);
      req.on('close', () => {
        raceArenaUseCase.removeStreamClient(slug, res);
      });
      return true;
    }

    // [2.5] Broadcast Live Event
    const broadcastMatch = pathname.match(/^\\/api\\/races\\/([^\\/]+)\\/stream\\/broadcast$/);
    if (req.method === 'POST' && broadcastMatch) {
      const slug = broadcastMatch[1];
      let body = '';
      req.on('data', (chunk) => { body += chunk; });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body || '{}');
          raceArenaUseCase.broadcastLiveEvent(slug, {
            type: payload.type || 'activity_verified',
            athleteName: payload.athleteName || 'Nguyễn Văn A',
            teamName: payload.teamName || 'Team Phoenix SARC',
            distanceKm: payload.distanceKm || 5.0,
            message: payload.message || 'Cập nhật thành tích thời gian thực',
            timestamp: new Date().toISOString(),
          });
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: true, broadcasted: true }));
        } catch (err: any) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return true;
    }
`;

if (!content.includes("raceHeroMatch")) {
  content = content.replace(
    "    if (req.method === 'GET' && pathname === '/api/appeals') {",
    routesToInsert + "\n    if (req.method === 'GET' && pathname === '/api/appeals') {"
  );
}

// 4. Replace Tab 2 HTML
const tabArenaStartTag = '<div id="tab-arena" class="tab-content max-w-4xl mx-auto space-y-4">';
const tabActivitiesStartTag = '<!-- TAB 3: [3.0] NHẬT KÝ BÀI CHẠY & THẨM ĐỊNH (ACTIVITY FEED) -->';

const arenaStartIdx = content.indexOf(tabArenaStartTag);
const actStartIdx = content.indexOf(tabActivitiesStartTag);

if (arenaStartIdx === -1 || actStartIdx === -1) {
  console.error('Could not locate tab-arena bounds in main.ts!');
  process.exit(1);
}

const newTabArenaHtml = `<!-- TAB 2: [2.0] GIẢI ĐẤU & ĐẤU TRƯỜNG (RACE ARENA) -->
      <div id="tab-arena" class="tab-content max-w-4xl mx-auto space-y-5">
        <!-- [2.1] Hero Banner & Race Countdown -->
        <div id="section-2-1" class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_4px_25px_rgb(0,0,0,0.03)] space-y-4">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-100 text-[#FF5B26]">[2.1] Hero Arena</span>
                <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  [2.5] SSE Live Stream Active
                </span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">Mùa 10</span>
              </div>
              <h2 id="arena-race-title" class="text-xl md:text-2xl font-black text-slate-900 tracking-tight mt-1 uppercase">Mùa 10 Run to Techcombank 2026 – SADC/SARC</h2>
              <p class="text-xs text-slate-500 mt-1">
                Quy tắc tính điểm: <strong class="text-slate-800">50% Cự ly + 50% Chuyên cần</strong> (Trần 140 ngày) • <strong class="text-amber-600">Top 1 Dẫn Đầu</strong> vs <strong class="text-slate-600">Đồng Hạng 2</strong>
              </p>
            </div>

            <!-- Race Switcher Dropdown -->
            <div class="shrink-0 flex flex-col sm:flex-row items-end sm:items-center gap-2">
              <select id="arena-race-select" onchange="changeArenaRace(this.value)" class="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-[#FF5B26]">
                <option value="season-10-run-to-techcombank">Mùa 10 Run to Techcombank 2026</option>
                <option value="sarc-trail-challenge-bavi-2026">SARC Trail Challenge Ba Vì 2026</option>
                <option value="vpbank-hanoi-marathon-prep-2026">VPBank Hanoi Marathon Prep 2026</option>
              </select>
            </div>
          </div>

          <!-- Hero Metrics & Countdown Row -->
          <div class="grid grid-cols-1 md:grid-cols-12 gap-4 pt-2">
            <!-- 3 Core Stats Cards (7 cols) -->
            <div class="md:col-span-7 grid grid-cols-3 gap-3">
              <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <div class="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Tổng VĐV</div>
                <div class="text-xl font-extrabold font-mono text-slate-900 mt-0.5" id="hero-athletes">48</div>
                <div class="text-[9px] text-emerald-600 font-bold mt-0.5">3 Đội Thi</div>
              </div>
              <div class="p-3.5 rounded-2xl bg-orange-50/60 border border-orange-100 text-center">
                <div class="text-[10px] font-medium text-orange-600/80 uppercase tracking-wider">Tổng Cự Ly</div>
                <div class="text-xl font-extrabold font-mono text-[#FF5B26] mt-0.5" id="hero-km">3,170.0</div>
                <div class="text-[9px] text-orange-600 font-bold mt-0.5">Kilomet</div>
              </div>
              <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <div class="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Chuyên Cần</div>
                <div class="text-xl font-extrabold font-mono text-slate-900 mt-0.5" id="hero-days">348</div>
                <div class="text-[9px] text-slate-500 font-bold mt-0.5">Người-Ngày</div>
              </div>
            </div>

            <!-- Countdown Timer Card (5 cols) -->
            <div class="md:col-span-5 bg-gradient-to-br from-slate-950 to-slate-900 text-white rounded-2xl p-3.5 flex flex-col justify-between shadow-sm">
              <div class="flex items-center justify-between text-[10px] text-slate-400">
                <span class="font-bold text-amber-400">⏳ ĐẾM NGƯỢC KẾT THÚC GIẢI</span>
                <span>30/11/2026</span>
              </div>
              <div class="grid grid-cols-4 gap-1.5 text-center py-1">
                <div>
                  <span id="cd-days" class="text-lg font-black font-mono text-white">25</span>
                  <div class="text-[8px] text-slate-400 font-bold">NGÀY</div>
                </div>
                <div>
                  <span id="cd-hours" class="text-lg font-black font-mono text-white">10</span>
                  <div class="text-[8px] text-slate-400 font-bold">GIỜ</div>
                </div>
                <div>
                  <span id="cd-mins" class="text-lg font-black font-mono text-white">14</span>
                  <div class="text-[8px] text-slate-400 font-bold">PHÚT</div>
                </div>
                <div>
                  <span id="cd-secs" class="text-lg font-black font-mono text-[#FF5B26] animate-pulse">45</span>
                  <div class="text-[8px] text-slate-400 font-bold">GIÂY</div>
                </div>
              </div>
              <div class="text-[9px] text-slate-400 text-center border-t border-slate-800 pt-1 font-mono">
                Múi giờ: Asia/Ho_Chi_Minh (UTC+7)
              </div>
            </div>
          </div>

          <!-- [2.5] Real-Time Live Activity Ticker -->
          <div class="p-2.5 rounded-2xl bg-slate-900 text-white flex items-center justify-between gap-3 text-xs shadow-inner">
            <div class="flex items-center gap-2 overflow-hidden">
              <span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#FF5B26] text-white shrink-0 animate-pulse">LIVE FEED</span>
              <span id="arena-live-ticker" class="truncate text-[11px] text-slate-300 font-mono">
                ⚡ Nguyễn Văn A vừa hoàn thành bài chạy 5.2 km lúc 13:58 (+5.2 km cho Phoenix SARC)
              </span>
            </div>
            <button onclick="simulateLiveBroadcast()" class="shrink-0 px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold transition flex items-center gap-1 border border-slate-700">
              <span>📡</span> Thử Push Event
            </button>
          </div>

          <!-- Segmented Navigation Controls for 3 Views -->
          <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <div class="inline-flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <button onclick="toggleArenaTab('team')" id="arena-btn-team" class="px-4 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-900 shadow-sm transition">[2.2] BXH Đội</button>
              <button onclick="toggleArenaTab('ind')" id="arena-btn-ind" class="px-4 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 transition">[2.3] BXH Cá Nhân</button>
              <button onclick="toggleArenaTab('myteam')" id="arena-btn-myteam" class="px-4 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 transition">[2.4] Đội Của Tôi</button>
            </div>
            <button onclick="openTiebreakModal()" class="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1">
              <span>ℹ️</span> Quy tắc Hòa Điểm (Tie-Break)
            </button>
          </div>
        </div>

        <!-- [2.2] VIEW 1: TEAM LEADERBOARD -->
        <div id="section-2-2">
          <div id="arena-team-view" class="space-y-3">
            <div class="flex items-center justify-between px-2">
              <div class="text-xs font-extrabold uppercase text-slate-400 tracking-wider">[2.2] Bảng Xếp Hạng Đội Thi Đấu (Rank 1 & Tied Rank 2)</div>
              <span class="text-[11px] text-slate-400">Tỷ trọng: 50/50 • Cập nhật tự động</span>
            </div>

            <!-- Team 1: Gold / Rank 1 -->
            <div class="bg-gradient-to-r from-amber-500/10 via-white to-white border-2 border-amber-400 rounded-3xl p-5 shadow-sm space-y-3">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div class="flex items-center space-x-3">
                  <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-black text-slate-950 text-lg shadow-sm">👑 1</div>
                  <div>
                    <div class="flex items-center gap-2">
                      <div class="text-base font-bold text-slate-900">Team Phoenix SARC</div>
                      <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-slate-950 uppercase tracking-tight">Hạng 1 Dẫn Đầu</span>
                    </div>
                    <div class="text-xs text-slate-400 mt-0.5">16 VĐV • Đội trưởng: Nguyễn Văn A • Xu hướng: <span class="text-emerald-600 font-bold">▲ Giữ vững #1</span></div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-2xl font-black font-mono text-amber-600">18.43 <span class="text-xs font-normal text-slate-400">điểm</span></div>
                  <div class="text-xs font-mono text-slate-600 font-bold">1,250.0 km hợp lệ</div>
                  <div class="text-[11px] font-mono text-emerald-600 font-bold">Quỹ dự kiến: 100.000đ/người</div>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-2 pt-2 border-t border-amber-200/60 text-xs text-slate-600">
                <div class="bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/50">
                  <span class="text-slate-400 text-[10px] block font-mono">Điểm Cự Ly (Tối đa 10.0đ):</span>
                  <strong class="text-slate-900 font-mono text-sm">10.00 đ</strong> <span class="text-[10px] text-slate-500">(1,250 / 1,250 km)</span>
                </div>
                <div class="bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/50">
                  <span class="text-slate-400 text-[10px] block font-mono">Điểm Chuyên Cần (Tối đa 10.0đ):</span>
                  <strong class="text-slate-900 font-mono text-sm">8.43 đ</strong> <span class="text-[10px] text-slate-500">(118 / 140 ngày)</span>
                </div>
              </div>
            </div>

            <!-- Team 2: Silver / Tied Rank 2 (Dragons) -->
            <div class="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-3">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div class="flex items-center space-x-3">
                  <div class="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-base border border-slate-200">🥈 2</div>
                  <div>
                    <div class="flex items-center gap-2">
                      <div class="text-base font-bold text-slate-800">Team Dragons SADC</div>
                      <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">Đồng Hạng 2</span>
                    </div>
                    <div class="text-xs text-slate-400 mt-0.5">16 VĐV • Đội trưởng: Trần Thị B • Xu hướng: <span class="text-slate-500 font-bold">— Bám đuổi</span></div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-2xl font-black font-mono text-slate-800">18.00 <span class="text-xs font-normal text-slate-400">điểm</span></div>
                  <div class="text-xs font-mono text-slate-600 font-bold">1,000.0 km hợp lệ</div>
                  <div class="text-[11px] font-mono text-amber-600 font-bold">Quỹ dự kiến: 200.000đ/người</div>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span class="text-slate-400 text-[10px] block font-mono">Điểm Cự Ly (Tối đa 10.0đ):</span>
                  <strong class="text-slate-900 font-mono text-sm">8.00 đ</strong> <span class="text-[10px] text-slate-500">(1,000 / 1,250 km)</span>
                </div>
                <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span class="text-slate-400 text-[10px] block font-mono">Điểm Chuyên Cần (Chạm trần 140 ngày):</span>
                  <strong class="text-slate-900 font-mono text-sm">10.00 đ</strong> <span class="text-[10px] text-slate-500">(150 ngày -> max 140)</span>
                </div>
              </div>
            </div>

            <!-- Team 3: Silver / Tied Rank 2 (Tigers) -->
            <div class="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-3">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div class="flex items-center space-x-3">
                  <div class="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-base border border-slate-200">🥈 2</div>
                  <div>
                    <div class="flex items-center gap-2">
                      <div class="text-base font-bold text-slate-800">Team Tigers SADC</div>
                      <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">Đồng Hạng 2</span>
                    </div>
                    <div class="text-xs text-slate-400 mt-0.5">16 VĐV • Đội trưởng: Lê Hoàng C • Xu hướng: <span class="text-slate-500 font-bold">— Bám đuổi</span></div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-2xl font-black font-mono text-slate-800">16.56 <span class="text-xs font-normal text-slate-400">điểm</span></div>
                  <div class="text-xs font-mono text-slate-600 font-bold">920.0 km hợp lệ</div>
                  <div class="text-[11px] font-mono text-amber-600 font-bold">Quỹ dự kiến: 200.000đ/người</div>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span class="text-slate-400 text-[10px] block font-mono">Điểm Cự Ly (Tối đa 10.0đ):</span>
                  <strong class="text-slate-900 font-mono text-sm">7.36 đ</strong> <span class="text-[10px] text-slate-500">(920 / 1,250 km)</span>
                </div>
                <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span class="text-slate-400 text-[10px] block font-mono">Điểm Chuyên Cần (Tối đa 10.0đ):</span>
                  <strong class="text-slate-900 font-mono text-sm">9.20 đ</strong> <span class="text-[10px] text-slate-500">(129 / 140 ngày)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- [2.3] VIEW 2: INDIVIDUAL LEADERBOARD -->
        <div id="section-2-3">
          <div id="arena-ind-view" class="space-y-3 hidden">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-2">
              <div class="text-xs font-extrabold uppercase text-slate-400 tracking-wider">[2.3] Bảng Xếp Hạng Cá Nhân (Top 1 Nhận Áo SARC)</div>
              <!-- Search & Filter bar -->
              <div class="flex items-center gap-2">
                <input type="text" id="ind-search-input" oninput="filterIndividualRunners()" placeholder="Tìm VĐV..." class="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-slate-800 w-32 focus:outline-none focus:border-[#FF5B26]">
                <select id="ind-team-filter" onchange="filterIndividualRunners()" class="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-slate-700">
                  <option value="ALL">Tất cả đội</option>
                  <option value="team-phoenix">Phoenix SARC</option>
                  <option value="team-dragons">Dragons SADC</option>
                  <option value="team-tigers">Tigers SADC</option>
                </select>
              </div>
            </div>

            <!-- Top 1 Individual Hero Card -->
            <div class="p-5 rounded-3xl bg-white border-2 border-[#CCFF00] shadow-[0_4px_30px_rgba(204,255,0,0.35)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-2xl bg-[#18181B] text-[#CCFF00] font-black text-sm flex flex-col items-center justify-center shadow-sm shrink-0">
                  <span>1</span>
                  <span class="text-[9px] font-bold">👑 TOP</span>
                </div>
                <div>
                  <div class="flex flex-wrap items-center gap-2">
                    <h4 class="text-base font-extrabold text-slate-900">Nguyễn Văn A</h4>
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#CCFF00] text-slate-950 uppercase tracking-tight shadow-sm">
                      👑 Dẫn Đầu Nhận Áo SARC Độc Bản
                    </span>
                    <span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-orange-100 text-[#FF5B26]">(Bạn)</span>
                  </div>
                  <div class="text-xs text-slate-500 mt-1">Team Phoenix SARC • 18 ngày chuyên cần • Pace TB: 5:15 min/km</div>
                </div>
              </div>
              <div class="text-right shrink-0">
                <div class="text-2xl font-black font-mono text-slate-900">125.0 km</div>
                <div class="text-[11px] text-emerald-600 font-bold">10% Cự ly toàn đội</div>
              </div>
            </div>

            <!-- Runners List Container -->
            <div id="individual-runners-list" class="space-y-2.5">
              <!-- Rendered dynamically by JS -->
            </div>
          </div>
        </div>

        <!-- [2.4] VIEW 3: MY TEAM SPACE (TEAM PHOENIX SARC) -->
        <div id="section-2-4">
          <div id="arena-myteam-view" class="space-y-4 hidden">
            <!-- Team Space Header Card -->
            <div class="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 shadow-md space-y-4">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FF5B26] text-white">[2.4] Không Gian Đội</span>
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">👑 Hạng 1 Dẫn Đầu</span>
                  </div>
                  <h3 class="text-2xl font-black tracking-tight mt-1">Team Phoenix SARC</h3>
                  <div class="text-xs text-slate-300 mt-0.5">Đội trưởng: <strong class="text-white">Nguyễn Văn A</strong> • Sĩ số: <strong class="text-white">16 / 20 VĐV</strong></div>
                </div>
                <div class="text-right">
                  <div class="text-2xl font-black font-mono text-amber-400">1,250.0 km</div>
                  <div class="text-xs text-slate-400">Mục tiêu: 1,500.0 km (83.3%)</div>
                </div>
              </div>

              <!-- Team Progress Bar -->
              <div class="space-y-1">
                <div class="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5">
                  <div class="bg-gradient-to-r from-amber-400 to-[#FF5B26] h-full rounded-full transition-all duration-500" style="width: 83.3%"></div>
                </div>
                <div class="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Đã tích lũy: 1,250.0 km</span>
                  <span>Còn thiếu: 250.0 km để hoàn thành mục tiêu đội</span>
                </div>
              </div>

              <!-- Team Invite & Actions -->
              <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-700/60 text-xs">
                <div class="flex items-center gap-2">
                  <span class="text-slate-400 font-mono text-[11px]">Mã mời đội:</span>
                  <code class="px-2 py-1 rounded bg-slate-800 font-mono font-bold text-orange-400 border border-slate-700">PHOENIX-SARC-TEAM</code>
                  <button onclick="copyTeamInviteCode()" class="text-xs text-slate-300 hover:text-white font-semibold underline">Sao chép</button>
                </div>
                <span class="text-emerald-400 text-[11px] font-bold">✓ Đủ điều kiện nhận Quỹ Vô Địch 100k/người</span>
              </div>
            </div>

            <!-- Team Roster & Cheer Board 2-Col Grid -->
            <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
              <!-- Members Roster (7 cols) -->
              <div class="md:col-span-7 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-3">
                <div class="flex items-center justify-between">
                  <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wider">Danh Sách Thành Viên (16 VĐV)</h4>
                  <span class="text-[11px] text-slate-400">Đóng góp cá nhân</span>
                </div>
                <div class="space-y-2 text-xs" id="team-roster-container">
                  <!-- Rendered by JS -->
                </div>
              </div>

              <!-- Team Cheer Board (5 cols) -->
              <div class="md:col-span-5 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-3 flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between">
                    <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wider">Bảng Tin Cổ Vũ Đội</h4>
                    <span class="text-[10px] text-emerald-600 font-bold">● Trực tiếp</span>
                  </div>
                  <div class="space-y-2.5 mt-3 max-h-64 overflow-y-auto pr-1" id="team-cheer-container">
                    <!-- Cheers rendered by JS -->
                  </div>
                </div>

                <div class="pt-3 border-t border-slate-100 space-y-2">
                  <input type="text" id="cheer-input" placeholder="Gửi lời động viên anh em..." class="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-[#FF5B26]">
                  <button onclick="submitCheerMessage()" class="w-full py-2 bg-[#18181B] hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5">
                    <span>💬</span> Gửi Lời Cổ Vũ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sticky Self Row (Ghim ở đáy màn hình khi xem Đấu Trường) -->
        <div id="arena-sticky-self" class="sticky bottom-4 z-30 bg-[#18181B]/95 backdrop-blur text-white rounded-2xl p-3 px-5 shadow-2xl border border-slate-700 flex items-center justify-between transition-all duration-300">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-[#FF5B26] text-slate-950 font-black text-xs flex items-center justify-center">👑 #1</div>
            <div>
              <div class="text-xs font-bold text-white flex items-center gap-2">
                <span>Nguyễn Văn A (Vị trí hiện tại của bạn)</span>
                <span class="text-[10px] text-amber-400 font-mono">👑 Dẫn Đầu Giải</span>
              </div>
              <div class="text-[11px] text-slate-400">Team Phoenix SARC • 18 ngày chuyên cần</div>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <div class="text-right">
              <div class="text-xs font-bold text-white font-mono">125.0 km</div>
              <div class="text-[10px] text-emerald-400 font-bold">10% toàn đội</div>
            </div>
            <button onclick="scrollToMyRow()" class="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-[11px] rounded-xl font-bold transition">Xem tôi</button>
          </div>
        </div>
      </div>\n\n      `;

content = content.substring(0, arenaStartIdx) + newTabArenaHtml + content.substring(actStartIdx);

// 5. Replace the old toggleArenaTab with full Arena Client JS
const arenaClientJs = `    // Subsystem [2.0] RACE ARENA STATE & HANDLERS
    let arenaRunnersData = [
      { userId: 'user-01', name: 'Nguyễn Văn A', team: 'Team Phoenix SARC', km: 125.0, days: 18, pace: '5:15', rank: 1, isSelf: true, reward: '👑 Dẫn Đầu Nhận Áo SARC' },
      { userId: 'user-02', name: 'Trần Thị B', team: 'Team Dragons SADC', km: 118.0, days: 16, pace: '5:24', rank: 2, isSelf: false },
      { userId: 'user-03', name: 'Lê Hoàng C', team: 'Team Tigers SADC', km: 105.0, days: 15, pace: '5:32', rank: 3, isSelf: false },
      { userId: 'user-04', name: 'Phạm Minh Đức', team: 'Team Dragons SADC', km: 96.0, days: 14, pace: '5:40', rank: 4, isSelf: false },
      { userId: 'user-05', name: 'Hoàng Kim Dung', team: 'Team Phoenix SARC', km: 88.5, days: 12, pace: '5:45', rank: 5, isSelf: false },
      { userId: 'user-06', name: 'Đặng Tuấn Kiệt', team: 'Team Phoenix SARC', km: 78.0, days: 11, pace: '5:50', rank: 6, isSelf: false },
      { userId: 'user-07', name: 'Vũ Hải Nam', team: 'Team Phoenix SARC', km: 72.0, days: 10, pace: '6:00', rank: 7, isSelf: false },
    ];

    let teamCheersData = [
      { author: 'Nguyễn Văn A (Captain)', msg: 'Toàn đội duy trì phong độ nhé! Cự ly đang dẫn đầu toàn giải!', time: '10 phút trước' },
      { author: 'Hoàng Kim Dung', msg: 'Sáng mai 5h Hồ Tây chạy tiếp nhé mọi người ơi!', time: '25 phút trước' },
      { author: 'Đặng Tuấn Kiệt', msg: 'Đã hoàn thành bài chạy 10km sáng nay, điểm chuyên cần +1!', time: '1 giờ trước' },
    ];

    function toggleArenaTab(type) {
      const teamView = document.getElementById('arena-team-view');
      const indView = document.getElementById('arena-ind-view');
      const myteamView = document.getElementById('arena-myteam-view');
      const btnTeam = document.getElementById('arena-btn-team');
      const btnInd = document.getElementById('arena-btn-ind');
      const btnMyteam = document.getElementById('arena-btn-myteam');

      if (!teamView || !indView || !myteamView) return;

      teamView.classList.add('hidden');
      indView.classList.add('hidden');
      myteamView.classList.add('hidden');

      if (btnTeam) btnTeam.className = 'px-4 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 transition';
      if (btnInd) btnInd.className = 'px-4 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 transition';
      if (btnMyteam) btnMyteam.className = 'px-4 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 transition';

      if (type === 'team') {
        teamView.classList.remove('hidden');
        if (btnTeam) btnTeam.className = 'px-4 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-900 shadow-sm transition';
      } else if (type === 'ind') {
        indView.classList.remove('hidden');
        if (btnInd) btnInd.className = 'px-4 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-900 shadow-sm transition';
        renderIndividualRunners();
      } else if (type === 'myteam') {
        myteamView.classList.remove('hidden');
        if (btnMyteam) btnMyteam.className = 'px-4 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-900 shadow-sm transition';
        renderTeamRoster();
        renderTeamCheers();
      }
    }

    function renderIndividualRunners(filteredList) {
      const container = document.getElementById('individual-runners-list');
      if (!container) return;
      const list = filteredList || arenaRunnersData.slice(1);
      container.innerHTML = list.map((r) => {
        return '<div class="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between text-xs ' + (r.isSelf ? 'border-orange-400 bg-orange-50/40 ring-1 ring-orange-400/50' : '') + '">' +
          '<div class="flex items-center gap-3">' +
            '<div class="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center font-mono">#' + r.rank + '</div>' +
            '<div>' +
              '<div class="font-bold text-slate-900 flex items-center gap-1.5">' + r.name + (r.isSelf ? '<span class="text-[9px] bg-orange-100 text-[#FF5B26] px-1.5 py-0.5 rounded font-bold">Bạn</span>' : '') + '</div>' +
              '<div class="text-[11px] text-slate-400 mt-0.5">' + r.team + ' • ' + r.days + ' ngày chuyên cần</div>' +
            '</div>' +
          '</div>' +
          '<div class="text-right">' +
            '<div class="font-extrabold font-mono text-slate-900">' + r.km.toFixed(1) + ' km</div>' +
            '<div class="text-[10px] text-slate-400 font-mono">Pace ' + r.pace + '</div>' +
          '</div>' +
        '</div>';
      }).join('');
    }

    function filterIndividualRunners() {
      const query = (document.getElementById('ind-search-input')?.value || '').toLowerCase().trim();
      const teamFilter = document.getElementById('ind-team-filter')?.value || 'ALL';

      let filtered = arenaRunnersData.slice(1).filter(r => {
        const matchName = r.name.toLowerCase().includes(query);
        const matchTeam = teamFilter === 'ALL' || (teamFilter === 'team-phoenix' && r.team.includes('Phoenix')) || (teamFilter === 'team-dragons' && r.team.includes('Dragons')) || (teamFilter === 'team-tigers' && r.team.includes('Tigers'));
        return matchName && matchTeam;
      });

      renderIndividualRunners(filtered);
    }

    function renderTeamRoster() {
      const container = document.getElementById('team-roster-container');
      if (!container) return;
      const roster = [
        { name: 'Nguyễn Văn A', role: 'Captain', km: 125.0, days: 18, pct: '10.0%', isSelf: true },
        { name: 'Hoàng Kim Dung', role: 'Vice-Captain', km: 88.5, days: 12, pct: '7.1%', isSelf: false },
        { name: 'Đặng Tuấn Kiệt', role: 'Member', km: 78.0, days: 11, pct: '6.2%', isSelf: false },
        { name: 'Vũ Hải Nam', role: 'Member', km: 72.0, days: 10, pct: '5.8%', isSelf: false },
        { name: 'Ngô Thanh Tùng', role: 'Member', km: 68.0, days: 9, pct: '5.4%', isSelf: false },
        { name: 'Phan Thùy Trang', role: 'Member', km: 65.0, days: 9, pct: '5.2%', isSelf: false },
      ];

      container.innerHTML = roster.map(m => {
        return '<div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">' +
          '<div class="flex items-center gap-2">' +
            '<div class="font-bold text-slate-900">' + m.name + (m.isSelf ? ' <span class="text-[#FF5B26] font-bold">(Bạn)</span>' : '') + '</div>' +
            '<span class="text-[9px] px-2 py-0.5 rounded-full font-bold ' + (m.role === 'Captain' ? 'bg-amber-100 text-amber-900' : 'bg-slate-200 text-slate-700') + '">' + m.role + '</span>' +
          '</div>' +
          '<div class="text-right font-mono">' +
            '<span class="font-bold text-slate-900">' + m.km.toFixed(1) + ' km</span> ' +
            '<span class="text-slate-400 text-[10px]">(' + m.pct + ')</span>' +
          '</div>' +
        '</div>';
      }).join('');
    }

    function renderTeamCheers() {
      const container = document.getElementById('team-cheer-container');
      if (!container) return;
      container.innerHTML = teamCheersData.map(c => {
        return '<div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">' +
          '<div class="flex items-center justify-between text-[10px] text-slate-400">' +
            '<strong class="text-slate-800">' + c.author + '</strong>' +
            '<span>' + c.time + '</span>' +
          '</div>' +
          '<div class="mt-1 text-slate-700 leading-snug">' + c.msg + '</div>' +
        '</div>';
      }).join('');
    }

    async function submitCheerMessage() {
      const input = document.getElementById('cheer-input');
      const text = input ? input.value.trim() : '';
      if (!text) return;
      try {
        await fetch('/api/races/season-10-run-to-techcombank/my-team/cheer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ author: 'Nguyễn Văn A (Captain)', message: text })
        });
        teamCheersData.unshift({
          author: 'Nguyễn Văn A (Captain)',
          msg: text,
          time: 'Vừa xong'
        });
        renderTeamCheers();
        if (input) input.value = '';
        showToast('Đã đăng lời cổ vũ lên bảng tin đội!');
      } catch (e) {
        console.error('Cheer error:', e);
      }
    }

    function copyTeamInviteCode() {
      showToast('Đã sao chép mã mời đội PHOENIX-SARC-TEAM');
    }

    async function simulateLiveBroadcast() {
      try {
        await fetch('/api/races/season-10-run-to-techcombank/stream/broadcast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'activity_verified',
            athleteName: 'Nguyễn Văn A',
            teamName: 'Team Phoenix SARC',
            distanceKm: 5.0,
            message: 'Nguyễn Văn A vừa hoàn thành bài chạy 5.0 km lúc ' + new Date().toLocaleTimeString('vi-VN')
          })
        });

        const ticker = document.getElementById('arena-live-ticker');
        if (ticker) {
          ticker.innerText = '⚡ Nguyễn Văn A vừa hoàn thành bài chạy 5.0 km lúc ' + new Date().toLocaleTimeString('vi-VN') + ' (+5.0 km toàn đội)';
        }
        showToast('Đã phát sóng sự kiện Live Stream thành công!');
      } catch (e) {
        console.error('Broadcast error:', e);
      }
    }

    function changeArenaRace(slug) {
      const titles = {
        'season-10-run-to-techcombank': 'MÙA 10 RUN TO TECHCOMBANK 2026 – SADC/SARC',
        'sarc-trail-challenge-bavi-2026': 'SARC TRAIL CHALLENGE BA VÌ 2026',
        'vpbank-hanoi-marathon-prep-2026': 'VPBANK HANOI MARATHON PREP 2026'
      };
      const titleEl = document.getElementById('arena-race-title');
      if (titleEl) titleEl.innerText = titles[slug] || slug;
      showToast('Đã chuyển sang xem giải đấu: ' + (titles[slug] || slug));
    }

    function scrollToMyRow() {
      toggleArenaTab('ind');
      setTimeout(() => {
        window.scrollTo({ top: 300, behavior: 'smooth' });
      }, 100);
    }

    function openTiebreakModal() {
      const modal = document.getElementById('tiebreak-info-modal');
      if (modal) modal.classList.remove('hidden');
    }

    function closeTiebreakModal() {
      const modal = document.getElementById('tiebreak-info-modal');
      if (modal) modal.classList.add('hidden');
    }

    // Live countdown timer ticker
    setInterval(() => {
      const sEl = document.getElementById('cd-secs');
      if (sEl) {
        let sec = parseInt(sEl.innerText, 10);
        if (isNaN(sec)) sec = 45;
        sec = sec <= 0 ? 59 : sec - 1;
        sEl.innerText = sec < 10 ? '0' + sec : sec.toString();
      }
    }, 1000);
`;

// Replace toggleArenaTab function in script
const oldToggleStart = '    function toggleArenaTab(type) {';
const oldToggleEnd = '    function showToast(msg) {';

const tStartIdx = content.indexOf(oldToggleStart);
const tEndIdx = content.indexOf(oldToggleEnd);

if (tStartIdx !== -1 && tEndIdx !== -1) {
  content = content.substring(0, tStartIdx) + arenaClientJs + '\n\n' + content.substring(tEndIdx);
}

fs.writeFileSync(mainPath, content, 'utf8');
console.log('Successfully updated main.ts with Subsystem 2 (Race Arena) features!');
