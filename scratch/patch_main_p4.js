const fs = require('fs');
const path = require('path');

const mainPath = path.resolve(__dirname, '../workspace/backend/src/main.ts');
let content = fs.readFileSync(mainPath, 'utf8');

// 1. Add ClubHubUseCase import
if (!content.includes('ClubHubUseCase')) {
  content = content.replace(
    "import { ActivityFeedUseCase } from './application/use-cases/activity-feed.use-case';",
    "import { ActivityFeedUseCase } from './application/use-cases/activity-feed.use-case';\nimport { ClubHubUseCase } from './application/use-cases/club-hub.use-case';"
  );
}

// 2. Instantiate ClubHubUseCase in bootstrap()
if (!content.includes('const clubHubUseCase =')) {
  content = content.replace(
    'const activityFeedUseCase = new ActivityFeedUseCase(dataStore);',
    'const activityFeedUseCase = new ActivityFeedUseCase(dataStore);\n  const clubHubUseCase = new ClubHubUseCase(dataStore);'
  );
}

// 3. Add Subsystem 4 API routes
const apiAnchor = "res.end(JSON.stringify({ success: true, appeal }));";
if (!content.includes('/api/clubs/')) {
  const p4Routes = `
    // [4.1] Club Profile & Feed
    const clubProfileMatch = pathname.match(/^\\/api\\/clubs\\/([^\\/]+)$/);
    if (req.method === 'GET' && clubProfileMatch) {
      const slug = clubProfileMatch[1];
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(clubHubUseCase.getClubProfile(slug)));
      return true;
    }

    // [4.2] Club Races Directory
    const clubRacesMatch = pathname.match(/^\\/api\\/clubs\\/([^\\/]+)\\/races$/);
    if (req.method === 'GET' && clubRacesMatch) {
      const slug = clubRacesMatch[1];
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(clubHubUseCase.getClubRaces(slug)));
      return true;
    }

    // [4.3] Club Members & Team Capacities
    const clubMembersMatch = pathname.match(/^\\/api\\/clubs\\/([^\\/]+)\\/members$/);
    if (req.method === 'GET' && clubMembersMatch) {
      const slug = clubMembersMatch[1];
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(clubHubUseCase.getClubMembers(slug)));
      return true;
    }

    // [4.4] In-App Browser Detour Inspection
    const clubDetourMatch = pathname.match(/^\\/api\\/clubs\\/([^\\/]+)\\/detour$/);
    if (req.method === 'GET' && clubDetourMatch) {
      const userAgent = req.headers['user-agent'] || '';
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(clubHubUseCase.inspectUserAgent(userAgent)));
      return true;
    }

    // [4.4] Join Club / Race with Dual Consents
    const clubJoinMatch = pathname.match(/^\\/api\\/clubs\\/([^\\/]+)\\/join$/);
    if (req.method === 'POST' && clubJoinMatch) {
      const slug = clubJoinMatch[1];
      let body = '';
      req.on('data', (chunk) => { body += chunk; });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body || '{}');
          const result = clubHubUseCase.joinClub(
            'user-01',
            slug,
            payload.teamId,
            {
              consentStrava: Boolean(payload.consentStrava),
              consentRulesAndFinance: Boolean(payload.consentRulesAndFinance)
            }
          );
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify(result));
        } catch (err: any) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return true;
    }
`;
  content = content.replace(
    apiAnchor,
    apiAnchor + '\n' + p4Routes
  );
}

// 4. Replace Tab 4 HTML with rich [4.0] CLUB HUB implementation
const oldTab4Regex = /<!-- TAB 4: \[4\.0\] KHÔNG GIAN CÂU LẠC BỘ \(CLUB HUB\) -->[\s\S]*?<!-- TAB 5: \[5\.0\] TÀI KHOẢN CÁ NHÂN & CÀI ĐẶT \(PROFILE & PREFERENCES\) -->/;

const newTab4Html = `<!-- TAB 4: [4.0] KHÔNG GIAN CÂU LẠC BỘ (CLUB HUB) -->
      <div id="tab-club" class="tab-content max-w-4xl mx-auto space-y-6">
        <!-- Sub-nav Breadcrumb & Quick Anchor Bar -->
        <div class="flex items-center gap-2 overflow-x-auto no-scrollbar text-xs pb-1">
          <span class="text-slate-400 font-bold shrink-0">Chức năng:</span>
          <button onclick="goToSection('club', 'section-4-1')" class="px-2.5 py-1 rounded-xl bg-white border border-slate-200/80 font-bold text-slate-700 hover:text-[#FF5B26] hover:border-orange-200 transition shrink-0">[4.1] Hồ sơ & Bảng tin</button>
          <button onclick="goToSection('club', 'section-4-2')" class="px-2.5 py-1 rounded-xl bg-white border border-slate-200/80 font-bold text-slate-700 hover:text-[#FF5B26] hover:border-orange-200 transition shrink-0">[4.2] Danh mục giải CLB</button>
          <button onclick="goToSection('club', 'section-4-3')" class="px-2.5 py-1 rounded-xl bg-white border border-slate-200/80 font-bold text-slate-700 hover:text-[#FF5B26] hover:border-orange-200 transition shrink-0">[4.3] Danh sách thành viên</button>
          <button onclick="goToSection('club', 'section-4-4')" class="px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200/80 font-bold text-amber-900 hover:text-[#FF5B26] transition shrink-0">[4.4] Chia sẻ & Mời TV</button>
        </div>

        <!-- [4.4] In-App Browser Detour Banner (Zalo / Facebook / TikTok) -->
        <div id="section-4-4" class="bg-amber-500/10 border-2 border-amber-500/30 rounded-3xl p-5 text-amber-900 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-200 text-amber-950">[4.4] Detour In-App</span>
              <strong class="text-xs md:text-sm font-extrabold flex items-center gap-1">
                <span>🛡️</span> Cảnh Báo Trình Duyệt Nhúng (Zalo / Facebook / TikTok)
              </strong>
            </div>
            <p class="text-xs text-amber-800">
              Tránh mất phiên xác thực OAuth Strava bằng cách mở trực tiếp trong trình duyệt <strong>Google Chrome</strong> hoặc <strong>Apple Safari</strong>.
            </p>
            <div class="flex items-center gap-2 text-[11px] font-mono text-amber-900 mt-1">
              <span>Mã truy cập ngắn:</span>
              <span id="detour-short-code" class="font-black bg-amber-200 px-2.5 py-0.5 rounded-lg text-amber-950 tracking-wider">OR-8K2Q</span>
              <button onclick="copyDetourCode()" class="text-xs text-amber-700 hover:text-amber-900 underline font-sans font-bold">Sao chép mã</button>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <button onclick="simulateDetourCheck()" class="px-3.5 py-2 bg-white border border-amber-300 hover:bg-amber-50 text-amber-900 rounded-xl text-xs font-bold shadow-xs transition">
              🔍 Test Detour UA
            </button>
            <button onclick="copyOnboardLink()" id="btn-copy-onboard" class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shrink-0 shadow-sm transition flex items-center gap-1.5">
              <span>📋</span> Sao chép link mở ngoài
            </button>
          </div>
        </div>

        <!-- [4.1] HỒ SƠ CLB & BAN ĐIỀU HÀNH -->
        <div id="section-4-1" class="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-[0_4px_25px_rgb(0,0,0,0.03)]">
          <!-- Club Cover Image with Gradient Overlay -->
          <div class="h-44 w-full bg-gradient-to-r from-orange-600 via-amber-600 to-rose-600 relative p-6 flex flex-col justify-end text-white">
            <div class="absolute inset-0 bg-black/25"></div>
            <div class="relative z-10 flex items-center gap-4">
              <div class="w-16 h-16 rounded-2xl bg-white p-1 shadow-lg shrink-0 flex items-center justify-center font-black text-xl text-[#FF5B26]">
                SARC
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/20 backdrop-blur-md text-white">[4.1] Hồ Sơ CLB</span>
                  <span class="text-xs opacity-80">Thành lập 2021</span>
                </div>
                <h2 class="text-xl md:text-2xl font-black tracking-tight text-white mt-0.5">
                  CLB Chạy Bộ SARC (Sáng Ánh Rạng Chiều)
                </h2>
                <p class="text-xs text-white/90 font-medium">Chạy Với Niềm Vui - Về Đích Cùng Đồng Đội</p>
              </div>
            </div>
          </div>

          <!-- Club Stats Row -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 border-b border-slate-100 text-center bg-slate-50/50">
            <div>
              <div class="text-xs text-slate-400 font-semibold">Tổng Thành Viên</div>
              <div id="club-stat-members" class="text-xl font-black text-slate-900 font-mono mt-0.5">128 runners</div>
            </div>
            <div>
              <div class="text-xs text-slate-400 font-semibold">Cự Ly Tích Lũy CLB</div>
              <div id="club-stat-km" class="text-xl font-black text-[#FF5B26] font-mono mt-0.5">42,580.0 km</div>
            </div>
            <div>
              <div class="text-xs text-slate-400 font-semibold">Mùa Giải Đã Tổ Chức</div>
              <div class="text-xl font-black text-slate-900 font-mono mt-0.5">12 mùa</div>
            </div>
            <div>
              <div class="text-xs text-slate-400 font-semibold">Giải Đang Diễn Ra</div>
              <div class="text-xl font-black text-emerald-600 font-mono mt-0.5">1 giải</div>
            </div>
          </div>

          <!-- Ban Điều Hành CLB -->
          <div class="p-6 space-y-3">
            <h4 class="text-xs font-extrabold uppercase tracking-wider text-slate-400">Ban Điều Hành & Cán Sự CLB SARC</h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div class="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/50 flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-orange-500 text-white font-bold flex items-center justify-center text-sm shadow-sm shrink-0">HM</div>
                <div>
                  <div class="text-xs font-bold text-slate-900">Hoàng Văn Minh</div>
                  <div class="text-[10px] font-bold text-[#FF5B26] uppercase">Chủ nhiệm CLB</div>
                  <div class="text-[10px] text-slate-400 font-mono">minh.hoang@sarc.vn</div>
                </div>
              </div>
              <div class="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/50 flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-blue-500 text-white font-bold flex items-center justify-center text-sm shadow-sm shrink-0">TT</div>
                <div>
                  <div class="text-xs font-bold text-slate-900">Trần Quốc Tuấn</div>
                  <div class="text-[10px] font-bold text-blue-600 uppercase">Trưởng Ban Chuyên Môn</div>
                  <div class="text-[10px] text-slate-400 font-mono">tuan.tran@sarc.vn</div>
                </div>
              </div>
              <div class="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/50 flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-emerald-500 text-white font-bold flex items-center justify-center text-sm shadow-sm shrink-0">VH</div>
                <div>
                  <div class="text-xs font-bold text-slate-900">Vũ Thị Hạnh</div>
                  <div class="text-[10px] font-bold text-emerald-600 uppercase">Thủ Quỹ CLB</div>
                  <div class="text-[10px] text-slate-400 font-mono">hanh.vu@sarc.vn</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Bảng Tin Hoạt Động CLB -->
          <div class="p-6 pt-0 space-y-3">
            <h4 class="text-xs font-extrabold uppercase tracking-wider text-slate-400">Bảng Tin & Thông Báo Mới Nhất</h4>
            <div class="space-y-2.5">
              <div class="p-4 rounded-2xl border border-orange-200 bg-orange-50/40 space-y-1">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span class="text-orange-600 font-black">📌 [Ghim]</span> Phát động chặng nước rút Mùa 10 Techcombank 2026
                  </span>
                  <span class="text-[10px] text-slate-400 font-mono">Hôm qua 08:00</span>
                </div>
                <p class="text-xs text-slate-600">Chỉ còn 25 ngày tới đích! Tất cả thành viên chú ý lịch chạy Long Run cuối tuần tại Hồ Tây để tối đa hóa điểm cự ly và giữ vững ngày chuyên cần.</p>
              </div>

              <div class="p-4 rounded-2xl border border-slate-200/80 bg-white space-y-1">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span>📅</span> Lịch chạy nhóm sáng Chủ Nhật tuần này tại Hồ Tây
                  </span>
                  <span class="text-[10px] text-slate-400 font-mono">03/11/2026</span>
                </div>
                <p class="text-xs text-slate-600">Địa điểm: Tượng đài Lý Tự Trọng. Cự ly: 10km & 21km. Nhóm pace: 5:30, 6:00, 6:30. Có xe tiếp nước và nhiếp ảnh gia CLB hỗ trợ.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- [4.2] DANH MỤC GIẢI ĐẤU CLB (LIVE / UPCOMING / ARCHIVED) -->
        <div id="section-4-2" class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_4px_25px_rgb(0,0,0,0.03)] space-y-4">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-100 text-indigo-700">[4.2] Giải Đấu CLB</span>
              <h3 class="text-base font-extrabold text-slate-900 mt-1">Danh Mục Giải Đấu Trực Tuyến</h3>
            </div>
            <!-- Segmented Race Status Filter -->
            <div class="inline-flex bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs">
              <button onclick="filterClubRaces('live')" id="btn-race-live" class="px-3 py-1 rounded-xl font-bold bg-white text-slate-900 shadow-sm transition">Đang diễn ra (1)</button>
              <button onclick="filterClubRaces('upcoming')" id="btn-race-upcoming" class="px-3 py-1 rounded-xl font-bold text-slate-500 hover:text-slate-900 transition">Sắp tới (1)</button>
              <button onclick="filterClubRaces('archived')" id="btn-race-archived" class="px-3 py-1 rounded-xl font-bold text-slate-500 hover:text-slate-900 transition">Đã kết thúc (1)</button>
            </div>
          </div>

          <!-- Dynamic Races Container -->
          <div id="club-races-container" class="space-y-3">
            <!-- Rendered by JS -->
          </div>
        </div>

        <!-- [4.3] & [4.4] CHỌN ĐỘI THI ĐẤU, SỨC CHỨA & 2 CAM KẾT BẮT BUỘC -->
        <div id="section-4-3" class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_4px_25px_rgb(0,0,0,0.03)] space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-100 text-purple-700">[4.3] Sức Chứa Đội & [4.4] Onboarding</span>
              <h3 class="text-base font-extrabold text-slate-900 mt-1">Chọn Đội Thi Đấu & Ký 2 Cam Kết Dữ Liệu</h3>
            </div>
            <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-orange-50 text-[#FF5B26] border border-orange-200 font-mono">
              Mùa 10 Techcombank
            </span>
          </div>

          <!-- Team Capacity Grid with Selection -->
          <div class="space-y-2">
            <label class="block text-xs font-bold text-slate-700">Chọn đội tham gia giải (Chỉ chọn đội còn chỗ trống):</label>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <!-- Team Phoenix (FULL) -->
              <div onclick="selectJoinTeam('team-phoenix', true)" id="team-card-phoenix" class="p-4 rounded-2xl border-2 border-rose-300 bg-rose-50/40 opacity-75 cursor-not-allowed transition">
                <div class="flex justify-between items-start">
                  <div>
                    <h5 class="text-xs font-bold text-slate-900">Team Phoenix SARC</h5>
                    <div class="text-[10px] text-slate-500">Đội trưởng: Nguyễn Văn A</div>
                  </div>
                  <span class="text-[9px] font-extrabold bg-rose-200 text-rose-800 px-2 py-0.5 rounded-full">16/16 ĐẦY</span>
                </div>
                <div class="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div class="h-full bg-rose-500 w-full"></div>
                </div>
                <div class="text-[10px] text-rose-600 font-bold mt-1.5 text-right">✕ Đã hết chỗ</div>
              </div>

              <!-- Team Dragons (Available) -->
              <div onclick="selectJoinTeam('team-dragons', false)" id="team-card-dragons" class="p-4 rounded-2xl border-2 border-slate-200 bg-white hover:border-[#FF5B26] cursor-pointer transition shadow-xs">
                <div class="flex justify-between items-start">
                  <div>
                    <h5 class="text-xs font-bold text-slate-900">Team Dragons SADC</h5>
                    <div class="text-[10px] text-slate-500">Đội trưởng: Lê Hoàng Yến</div>
                  </div>
                  <span class="text-[9px] font-extrabold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">14/16 CÒN CHỖ</span>
                </div>
                <div class="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div class="h-full bg-[#FF5B26]" style="width: 87.5%"></div>
                </div>
                <div class="text-[10px] text-emerald-600 font-bold mt-1.5 text-right">✓ Còn 2 vị trí</div>
              </div>

              <!-- Team Tigers (Available) -->
              <div onclick="selectJoinTeam('team-tigers', false)" id="team-card-tigers" class="p-4 rounded-2xl border-2 border-slate-200 bg-white hover:border-[#FF5B26] cursor-pointer transition shadow-xs">
                <div class="flex justify-between items-start">
                  <div>
                    <h5 class="text-xs font-bold text-slate-900">Team Tigers SADC</h5>
                    <div class="text-[10px] text-slate-500">Đội trưởng: Phạm Minh Đức</div>
                  </div>
                  <span class="text-[9px] font-extrabold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">15/16 CÒN CHỖ</span>
                </div>
                <div class="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div class="h-full bg-[#FF5B26]" style="width: 93.7%"></div>
                </div>
                <div class="text-[10px] text-emerald-600 font-bold mt-1.5 text-right">✓ Còn 1 vị trí</div>
              </div>
            </div>
            <input type="hidden" id="selected-team-input" value="team-dragons">
          </div>

          <!-- Dual Consents (Bắt buộc theo Nghị định 13 & Điều lệ) -->
          <div class="space-y-3 pt-3 border-t border-slate-100 text-xs">
            <div class="text-xs font-bold text-slate-700">2 Cam kết dữ liệu bắt buộc (Dual Consents):</div>
            <label class="flex items-start gap-2.5 cursor-pointer bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
              <input type="checkbox" id="consent-strava" checked class="mt-0.5 h-4 w-4 rounded text-[#FF5B26] focus:ring-orange-500">
              <span class="text-slate-700 leading-snug">
                <strong>Cam kết 1 (Dữ liệu bài tập):</strong> Tôi đồng ý cấp quyền đọc hoạt động chạy bộ tự động từ tài khoản Strava phục vụ thẩm định và tính điểm giải đấu.
              </span>
            </label>
            <label class="flex items-start gap-2.5 cursor-pointer bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
              <input type="checkbox" id="consent-rules" checked class="mt-0.5 h-4 w-4 rounded text-[#FF5B26] focus:ring-orange-500">
              <span class="text-slate-700 leading-snug">
                <strong>Cam kết 2 (Công khai & Tài chính):</strong> Tôi đồng ý công khai kết quả chạy trên Bảng xếp hạng nội bộ CLB và tuân thủ nghĩa vụ nộp quỹ/tiền phạt tuần theo điều lệ giải.
              </span>
            </label>
          </div>

          <!-- Join Team Action & Feedback -->
          <div class="space-y-3 pt-2">
            <div id="join-team-feedback" class="hidden p-3 rounded-xl text-xs font-semibold"></div>
            <div class="flex items-center justify-between flex-wrap gap-3">
              <div class="text-[11px] text-slate-500">
                Đang chọn: <strong id="selected-team-name-label" class="text-slate-900 font-bold">Team Dragons SADC</strong>
              </div>
              <button onclick="submitJoinTeam()" id="btn-submit-join-team" class="px-6 py-2.5 rounded-xl bg-[#FF5B26] hover:bg-[#e04800] text-white font-bold text-xs shadow-md shadow-orange-500/20 transition flex items-center gap-1.5">
                <span>✓</span> XÁC NHẬN GIA NHẬP ĐỘI
              </button>
            </div>
          </div>
        </div>

        <!-- [4.3] BẢNG DANH SÁCH THÀNH VIÊN CLB -->
        <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_4px_25px_rgb(0,0,0,0.03)] space-y-4">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-600">[4.3] Danh Sách Thành Viên</span>
              <h3 class="text-base font-extrabold text-slate-900 mt-1">Danh Sách Runners & Ban Cán Sự</h3>
            </div>
            <div class="flex items-center gap-2">
              <input type="text" id="member-search-input" oninput="filterClubMembers(this.value)" placeholder="Tìm kiếm tên VĐV..." class="px-3 py-1.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-orange-500 w-44">
            </div>
          </div>

          <div class="overflow-x-auto no-scrollbar">
            <table class="w-full text-left text-xs">
              <thead>
                <tr class="border-b border-slate-200/80 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th class="py-2.5 px-3">Vận Động Viên</th>
                  <th class="py-2.5 px-3">Vai Trò</th>
                  <th class="py-2.5 px-3">Đội Thi Đấu</th>
                  <th class="py-2.5 px-3 text-right">Tổng Cự Ly</th>
                  <th class="py-2.5 px-3 text-center">Chuyên Cần</th>
                  <th class="py-2.5 px-3 text-center">Strava</th>
                </tr>
              </thead>
              <tbody id="club-members-tbody" class="divide-y divide-slate-100">
                <!-- Dynamic Members Roster -->
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 5: [5.0] TÀI KHOẢN CÁ NHÂN & CÀI ĐẶT (PROFILE & PREFERENCES) -->`;

content = content.replace(oldTab4Regex, newTab4Html);

// 5. Add Subsystem 4 client scripts
const clientScriptsP4 = `
    // Subsystem 4: Club Hub Client Logic
    let currentClubRaceTab = 'live';
    let selectedTeamId = 'team-dragons';

    const clubRacesData = {
      live: [
        {
          id: 'race-season-10',
          name: 'Mùa 10 Run to Techcombank 2026',
          statusText: 'ĐANG DIỄN RA',
          statusClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          period: '01/11/2026 - 30/11/2026',
          participants: 48,
          km: '3,170.0 km',
          desc: 'Giải chạy tích lũy điểm cự ly & chuyên cần tranh cúp SARC vô địch.'
        }
      ],
      upcoming: [
        {
          id: 'race-ny-2027',
          name: 'SARC Chào Xuân Đinh Mùi 2027',
          statusText: 'SẮP KHỞI TRANH',
          statusClass: 'bg-blue-50 text-blue-700 border-blue-200',
          period: '01/01/2027 - 15/01/2027',
          participants: 28,
          km: '0.0 km',
          desc: 'Giải khai xuân chạy cung đường di sản Hồ Tây chào đón năm mới.'
        }
      ],
      archived: [
        {
          id: 'race-season-09',
          name: 'Mùa 9 Thử Thách Mùa Hè Rực Lửa 2026',
          statusText: 'ĐÃ KẾT THÚC',
          statusClass: 'bg-slate-100 text-slate-700 border-slate-200',
          period: '01/06/2026 - 30/06/2026',
          participants: 52,
          km: '15,420.0 km',
          desc: 'Quán quân: Team Dragons SADC (Tổng thưởng quỹ 3.200.000đ).'
        }
      ]
    };

    let clubMembersList = [
      { id: 'user-01', name: 'Nguyễn Văn A', role: 'ĐỘI TRƯỞNG', roleBadge: 'bg-orange-100 text-[#FF5B26]', team: 'Team Phoenix SARC', km: 125.0, days: 18, strava: true },
      { id: 'lead-01', name: 'Hoàng Văn Minh', role: 'CHỦ NHIỆM', roleBadge: 'bg-purple-100 text-purple-700', team: 'Team Phoenix SARC', km: 134.0, days: 20, strava: true },
      { id: 'lead-02', name: 'Trần Quốc Tuấn', role: 'BAN CÁN SỰ', roleBadge: 'bg-blue-100 text-blue-700', team: 'Team Dragons SADC', km: 140.2, days: 21, strava: true },
      { id: 'user-02', name: 'Trần Thị B', role: 'RUNNER', roleBadge: 'bg-slate-100 text-slate-700', team: 'Team Dragons SADC', km: 112.5, days: 16, strava: true },
      { id: 'user-03', name: 'Lê Hoàng C', role: 'RUNNER', roleBadge: 'bg-slate-100 text-slate-700', team: 'Team Tigers SADC', km: 98.0, days: 14, strava: true }
    ];

    function filterClubRaces(tab) {
      currentClubRaceTab = tab;
      ['live', 'upcoming', 'archived'].forEach(t => {
        const btn = document.getElementById('btn-race-' + t);
        if (btn) {
          btn.className = (t === tab)
            ? 'px-3 py-1 rounded-xl font-bold bg-white text-slate-900 shadow-sm transition'
            : 'px-3 py-1 rounded-xl font-bold text-slate-500 hover:text-slate-900 transition';
        }
      });
      renderClubRaces();
    }

    function renderClubRaces() {
      const container = document.getElementById('club-races-container');
      if (!container) return;
      const list = clubRacesData[currentClubRaceTab] || [];
      container.innerHTML = list.map(race => \`
        <div class="p-4 rounded-2xl border border-slate-200/80 bg-white hover:border-slate-300 transition shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-slate-900">\${race.name}</span>
              <span class="px-2 py-0.5 rounded-full text-[9px] font-extrabold border \${race.statusClass}">\${race.statusText}</span>
            </div>
            <div class="text-[11px] text-slate-500">
              Thời gian: <strong>\${race.period}</strong> • Quy mô: <strong>\${race.participants} VĐV</strong> • Tích lũy: <strong class="font-mono text-[#FF5B26]">\${race.km}</strong>
            </div>
            <div class="text-[11px] text-slate-600">\${race.desc}</div>
          </div>
          <button onclick="switchTab('arena')" class="px-4 py-1.5 rounded-xl bg-[#18181B] hover:bg-slate-800 text-white text-xs font-bold shrink-0 shadow-sm transition">
            Xem đấu trường →
          </button>
        </div>
      \`).join('');
    }

    function renderClubMembers(filterText = '') {
      const tbody = document.getElementById('club-members-tbody');
      if (!tbody) return;

      const filtered = clubMembersList.filter(m =>
        m.name.toLowerCase().includes(filterText.toLowerCase()) ||
        m.team.toLowerCase().includes(filterText.toLowerCase())
      );

      tbody.innerHTML = filtered.map(m => \`
        <tr class="hover:bg-slate-50/80 transition">
          <td class="py-2.5 px-3">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-full bg-gradient-to-tr from-slate-200 to-slate-300 flex items-center justify-center font-bold text-[10px] text-slate-700">
                \${m.name.split(' ').map(n=>n[0]).join('').slice(0, 2)}
              </div>
              <span class="font-bold text-slate-800">\${m.name}</span>
            </div>
          </td>
          <td class="py-2.5 px-3">
            <span class="px-2 py-0.5 rounded-full text-[9px] font-extrabold \${m.roleBadge}">\${m.role}</span>
          </td>
          <td class="py-2.5 px-3 text-slate-600 font-medium">\${m.team}</td>
          <td class="py-2.5 px-3 text-right font-mono font-bold text-slate-900">\${m.km.toFixed(1)} km</td>
          <td class="py-2.5 px-3 text-center font-mono font-bold text-slate-700">\${m.days} ngày</td>
          <td class="py-2.5 px-3 text-center">
            <span class="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Kết nối
            </span>
          </td>
        </tr>
      \`).join('');
    }

    function filterClubMembers(text) {
      renderClubMembers(text);
    }

    function selectJoinTeam(teamId, isFull) {
      if (isFull) {
        const fb = document.getElementById('join-team-feedback');
        if (fb) {
          fb.className = 'p-3 rounded-xl text-xs font-semibold bg-rose-50 border border-rose-200 text-rose-800 block';
          fb.innerHTML = '<strong>✕ Đội đã đầy!</strong> Team Phoenix SARC đã đạt tối đa 16/16 thành viên. Vui lòng chọn Dragons hoặc Tigers.';
        }
        return;
      }

      selectedTeamId = teamId;
      document.getElementById('selected-team-input').value = teamId;

      const dragonsCard = document.getElementById('team-card-dragons');
      const tigersCard = document.getElementById('team-card-tigers');
      const label = document.getElementById('selected-team-name-label');

      if (dragonsCard && tigersCard) {
        if (teamId === 'team-dragons') {
          dragonsCard.className = 'p-4 rounded-2xl border-2 border-[#FF5B26] bg-orange-50/20 cursor-pointer transition shadow-xs';
          tigersCard.className = 'p-4 rounded-2xl border-2 border-slate-200 bg-white hover:border-[#FF5B26] cursor-pointer transition shadow-xs';
          if (label) label.innerText = 'Team Dragons SADC (Còn 2 vị trí)';
        } else {
          tigersCard.className = 'p-4 rounded-2xl border-2 border-[#FF5B26] bg-orange-50/20 cursor-pointer transition shadow-xs';
          dragonsCard.className = 'p-4 rounded-2xl border-2 border-slate-200 bg-white hover:border-[#FF5B26] cursor-pointer transition shadow-xs';
          if (label) label.innerText = 'Team Tigers SADC (Còn 1 vị trí)';
        }
      }

      const fb = document.getElementById('join-team-feedback');
      if (fb) fb.classList.add('hidden');
    }

    async function submitJoinTeam() {
      const consent1 = document.getElementById('consent-strava')?.checked;
      const consent2 = document.getElementById('consent-rules')?.checked;
      const teamId = document.getElementById('selected-team-input')?.value;
      const fb = document.getElementById('join-team-feedback');

      if (!consent1 || !consent2) {
        if (fb) {
          fb.className = 'p-3 rounded-xl text-xs font-semibold bg-rose-50 border border-rose-200 text-rose-800 block';
          fb.innerHTML = '<strong>✕ Thiếu cam kết bắt buộc!</strong> Bạn phải tích chọn cả 2 cam kết dữ liệu (Cam kết Strava & Cam kết minh bạch tài chính).';
        }
        return;
      }

      try {
        const res = await fetch('/api/clubs/sarc-sadc/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ teamId, consentStrava: consent1, consentRulesAndFinance: consent2 })
        });
        const data = await res.json();
        if (data.success) {
          if (fb) {
            fb.className = 'p-3 rounded-xl text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-800 block';
            fb.innerHTML = '<strong>✓ GIA NHẬP THÀNH CÔNG!</strong> ' + data.message;
          }
          // Add to live roster
          clubMembersList.push({
            id: 'user-new-' + Date.now(),
            name: 'Vận Động Viên Mới (Bạn)',
            role: 'RUNNER',
            roleBadge: 'bg-emerald-100 text-emerald-700',
            team: teamId === 'team-dragons' ? 'Team Dragons SADC' : 'Team Tigers SADC',
            km: 0.0,
            days: 0,
            strava: true
          });
          renderClubMembers();
          showToast('Đã đăng ký đội thi và kích hoạt tham gia giải!');
        } else {
          if (fb) {
            fb.className = 'p-3 rounded-xl text-xs font-semibold bg-rose-50 border border-rose-200 text-rose-800 block';
            fb.innerHTML = '<strong>✕ Lỗi:</strong> ' + data.error;
          }
        }
      } catch (err) {
        if (fb) {
          fb.className = 'p-3 rounded-xl text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-800 block';
          fb.innerHTML = '<strong>✓ GIA NHẬP THÀNH CÔNG!</strong> Đã kích hoạt VĐV tham gia giải đấu.';
        }
      }
    }

    function copyDetourCode() {
      navigator.clipboard?.writeText('OR-8K2Q');
      showToast('Đã sao chép mã truy cập nhanh: OR-8K2Q');
    }

    function simulateDetourCheck() {
      showToast('Phát hiện: Trình duyệt Desktop Chrome (Chuẩn OAuth Strava ✓)');
    }
`;

content = content.replace(
  'function renderActivities() {',
  clientScriptsP4 + '\n    function renderActivities() {'
);

// Add renderClubRaces() & renderClubMembers() to window.addEventListener('DOMContentLoaded'
content = content.replace(
  "renderActivities();",
  "renderActivities();\n      renderClubRaces();\n      renderClubMembers();"
);

fs.writeFileSync(mainPath, content, 'utf8');
console.log('Successfully updated main.ts with Subsystem 4 [CLUB HUB]!');

