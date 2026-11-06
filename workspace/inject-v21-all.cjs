const fs = require('fs');
const path = require('path');

const mainTsPath = path.resolve(__dirname, 'backend/src/main.ts');
let code = fs.readFileSync(mainTsPath, 'utf8');

console.log('Beginning injection of 5 new V2.1 tabs and client handlers...');

// ==========================================
// 1. THE 5 NEW TABS HTML
// ==========================================
const fiveNewTabsHtml = `
      <!-- ======================================================== -->
      <!-- TAB: [1.B] QUẢN LÝ KẾT NỐI & NHẬT KÝ STRAVA SYNC (v2.1) -->
      <!-- ======================================================== -->
      <div id="tab-strava-sync" class="tab-content max-w-5xl mx-auto space-y-5">
        <!-- Sub-navigation Pills for Strava Sync -->
        <div class="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
          <span class="text-slate-400 font-bold shrink-0">Chức năng:</span>
          <button onclick="showSubScreen('strava-sync', 'sync-sec-1')" class="subscreen-pill px-3 py-1.5 rounded-xl font-bold transition shrink-0 bg-[#FF5B26] text-white shadow-sm">Kết Nối OAuth</button>
          <button onclick="showSubScreen('strava-sync', 'sync-sec-2')" class="subscreen-pill px-3 py-1.5 rounded-xl font-bold transition shrink-0 bg-white border border-slate-200/80 text-slate-700 hover:text-[#FF5B26]">Nhật Ký Truyền Dữ Liệu Webhook</button>
        </div>

        <div id="sync-sec-1" class="sub-screen-container block space-y-5">
          <!-- Banner -->
          <div class="bg-gradient-to-r from-orange-50 to-amber-50/40 rounded-3xl p-6 border border-orange-200/80 shadow-sm space-y-3">
            <div class="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span class="hover:text-slate-800 transition cursor-pointer" onclick="switchTab('dashboard')">Trang chủ</span>
              <span class="text-slate-300">›</span>
              <span class="text-slate-700">[1.0] Cá Nhân</span>
              <span class="text-slate-300">›</span>
              <span class="text-[#FF5B26] font-bold">[1.B] Quản Lý Strava & Nhật Ký Sync</span>
            </div>
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
              <div>
                <div class="flex items-center gap-2.5 flex-wrap">
                  <h2 class="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Quản Lý Kết Nối & Nhật Ký Strava Sync</h2>
                  <span id="strava-status-badge" class="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>ĐANG KẾT NỐI (ACTIVE)</span>
                  </span>
                </div>
                <p class="text-xs text-slate-500 mt-1">Cấp quyền hoặc ngắt kết nối tự phục vụ OAuth 2.0, theo dõi chi tiết từng gói tin webhook truyền về từ máy chủ Strava [AC-035, AC-036]</p>
              </div>
            </div>
          </div>

          <!-- Connection Card -->
          <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-2xl bg-[#FC4C02] flex items-center justify-center text-white font-black text-lg shadow-md shadow-orange-500/20">
                  <svg class="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7.01 13.828h4.172"/></svg>
                </div>
                <div>
                  <div class="font-extrabold text-sm text-slate-900">Tài Khoản Strava: Nguyễn Văn A (ID: 9482012)</div>
                  <div class="text-xs text-slate-400">Quyền hạn cấp: <span class="font-mono text-slate-600 font-bold">read, activity:read_all</span> • Tự động kích hoạt qua Webhook</div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <button onclick="triggerManualSync()" id="btn-strava-resync" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm">
                  <span>🔄</span> Quét Lại Dữ Liệu
                </button>
                <button onclick="disconnectStravaClient()" id="btn-strava-disconnect" class="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5">
                  <span>⚠️</span> Ngắt Kết Nối
                </button>
                <button onclick="reconnectStravaClient()" id="btn-strava-reconnect" class="hidden px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm">
                  <span>⚡</span> Kết Nối Lại Strava
                </button>
              </div>
            </div>

            <!-- Webhook Live Table -->
            <div id="sync-sec-2" class="space-y-3 pt-2">
              <div class="flex items-center justify-between">
                <h3 class="font-extrabold text-xs uppercase tracking-wider text-slate-600">Nhật Ký Nhận Gói Tin Webhook (strava_sync_logs)</h3>
                <span class="text-[11px] text-slate-400 font-mono">5 sự kiện gần nhất</span>
              </div>

              <div class="overflow-x-auto rounded-2xl border border-slate-200/80">
                <table class="w-full text-left text-xs">
                  <thead class="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 text-[11px]">
                    <tr>
                      <th class="p-3">Thời Gian (UTC+7)</th>
                      <th class="p-3">Strava ID</th>
                      <th class="p-3">Sự Kiện</th>
                      <th class="p-3">Mã HTTP</th>
                      <th class="p-3">Trạng Thái</th>
                      <th class="p-3">Chi Tiết Thẩm Định</th>
                      <th class="p-3 text-right">Payload Thô</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 font-medium text-slate-700">
                    <tr class="hover:bg-slate-50/70">
                      <td class="p-3 font-mono text-[11px]">05/11 16:30:10</td>
                      <td class="p-3 font-mono text-blue-600 font-bold">#12894102941</td>
                      <td class="p-3"><span class="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[10px]">activity/create</span></td>
                      <td class="p-3 font-mono text-emerald-600 font-bold">200 OK</td>
                      <td class="p-3"><span class="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">✓ Processed</span></td>
                      <td class="p-3 text-slate-600">Đã thẩm định 6 bước: Đạt cự ly 6.2km, Pace 5:15 min/km</td>
                      <td class="p-3 text-right">
                        <button onclick="viewRawPayload('12894102941')" class="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-mono text-[10px] font-bold">Xem JSON</button>
                      </td>
                    </tr>
                    <tr class="hover:bg-slate-50/70">
                      <td class="p-3 font-mono text-[11px]">04/11 06:12:45</td>
                      <td class="p-3 font-mono text-blue-600 font-bold">#12883910231</td>
                      <td class="p-3"><span class="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[10px]">activity/create</span></td>
                      <td class="p-3 font-mono text-emerald-600 font-bold">200 OK</td>
                      <td class="p-3"><span class="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">✓ Processed</span></td>
                      <td class="p-3 text-purple-700 font-semibold">Trail Run 4.1km, Gain 180m -> Thưởng +1.8km Trail Bonus</td>
                      <td class="p-3 text-right">
                        <button onclick="viewRawPayload('12883910231')" class="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-mono text-[10px] font-bold">Xem JSON</button>
                      </td>
                    </tr>
                    <tr class="hover:bg-slate-50/70">
                      <td class="p-3 font-mono text-[11px]">03/11 18:20:00</td>
                      <td class="p-3 font-mono text-blue-600 font-bold">#12861029311</td>
                      <td class="p-3"><span class="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[10px]">activity/create</span></td>
                      <td class="p-3 font-mono text-slate-600 font-bold">200 OK</td>
                      <td class="p-3"><span class="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold text-[10px]">⊘ Ignored</span></td>
                      <td class="p-3 text-amber-700">Cự ly 1.5km nhỏ hơn mức tối thiểu 3.0km (AC-002)</td>
                      <td class="p-3 text-right">
                        <button onclick="viewRawPayload('12861029311')" class="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-mono text-[10px] font-bold">Xem JSON</button>
                      </td>
                    </tr>
                    <tr class="hover:bg-slate-50/70">
                      <td class="p-3 font-mono text-[11px]">02/11 17:05:22</td>
                      <td class="p-3 font-mono text-blue-600 font-bold">#12845610200</td>
                      <td class="p-3"><span class="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[10px]">activity/create</span></td>
                      <td class="p-3 font-mono text-rose-600 font-bold">200 OK</td>
                      <td class="p-3"><span class="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold text-[10px]">✕ Rejected</span></td>
                      <td class="p-3 text-rose-600 font-bold">Pace 2:30 min/km vi phạm sàn pace hệ thống 2:45 (PACE_IMPLAUSIBLE)</td>
                      <td class="p-3 text-right">
                        <button onclick="viewRawPayload('12845610200')" class="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-mono text-[10px] font-bold">Xem JSON</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- TAB: [7.0] ĐỘI THI ĐẤU & QUYỀN ĐỘI TRƯỞNG (v2.1) -->
      <!-- ======================================================== -->
      <div id="tab-teams" class="tab-content max-w-5xl mx-auto space-y-5">
        <!-- Sub-navigation Pills for Tab 7 -->
        <div class="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
          <span class="text-slate-400 font-bold shrink-0">Chức năng:</span>
          <button onclick="showSubScreen('teams', 'section-7a')" class="subscreen-pill px-3 py-1.5 rounded-xl font-bold transition shrink-0 bg-[#FF5B26] text-white shadow-sm">[7.A] Danh Bạ Đội Thi Đấu</button>
          <button onclick="showSubScreen('teams', 'section-7b')" class="subscreen-pill px-3 py-1.5 rounded-xl font-bold transition shrink-0 bg-white border border-slate-200/80 text-slate-700 hover:text-[#FF5B26]">[7.B] Không Gian Quản Trị Đội Trưởng</button>
        </div>

        <!-- [7.A] DANH BẠ ĐỘI THI ĐẤU -->
        <div id="section-7a" class="sub-screen-container block space-y-5">
          <div class="bg-gradient-to-r from-indigo-50 to-slate-50 rounded-3xl p-6 border border-indigo-200/80 shadow-sm space-y-3">
            <div class="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span class="hover:text-slate-800 transition cursor-pointer" onclick="switchTab('dashboard')">Trang chủ</span>
              <span class="text-slate-300">›</span>
              <span class="text-slate-700">[7.0] Đội Thi Đấu</span>
              <span class="text-slate-300">›</span>
              <span class="text-indigo-600 font-bold">[7.A] Danh Bạ Đội Thi Đấu</span>
            </div>
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
              <div>
                <h2 class="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Danh Bạ & Bảng Phong Độ Các Đội</h2>
                <p class="text-xs text-slate-500 mt-1">Theo dõi tương quan lực lượng giữa các đội trong giải đấu Mùa 10, sĩ số và điểm 50/50 [AC-039]</p>
              </div>
              <button onclick="showSubScreen('teams', 'section-7b')" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 self-start md:self-auto">
                <span>👑</span> Không Gian Đội Trưởng
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Team 1 -->
            <div class="bg-white rounded-3xl p-5 border-2 border-amber-400 shadow-md space-y-3 relative overflow-hidden">
              <div class="absolute top-0 right-0 bg-amber-400 text-amber-950 font-black text-[10px] px-3 py-1 rounded-bl-xl uppercase tracking-wider">Hạng 1 (Quỹ 100k)</div>
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white font-black text-lg flex items-center justify-center shadow-md">🦅</div>
                <div>
                  <h3 class="font-black text-base text-slate-900">Team Falcons VKL</h3>
                  <p class="text-xs text-slate-500">Đội trưởng: <span class="font-bold text-slate-700">Lê Văn B</span> • Sĩ số: <span class="font-bold text-emerald-600">15/15 (Đủ)</span></p>
                </div>
              </div>
              <div class="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl text-center text-xs">
                <div><div class="text-[10px] text-slate-400">Tổng KM</div><div class="font-mono font-bold text-slate-900">3,691.1</div></div>
                <div><div class="text-[10px] text-slate-400">Chuyên Cần</div><div class="font-mono font-bold text-slate-900">140 ngày</div></div>
                <div><div class="text-[10px] text-slate-400">Điểm 50/50</div><div class="font-mono font-black text-amber-600">20.00 pts</div></div>
              </div>
            </div>

            <!-- Team 2 -->
            <div class="bg-white rounded-3xl p-5 border-2 border-indigo-300 shadow-sm space-y-3 relative overflow-hidden">
              <div class="absolute top-0 right-0 bg-indigo-100 text-indigo-800 font-bold text-[10px] px-3 py-1 rounded-bl-xl uppercase">Đồng Hạng 2 (Đội Của Bạn)</div>
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-black text-lg flex items-center justify-center shadow-md">🔥</div>
                <div>
                  <h3 class="font-black text-base text-slate-900">Team Phoenix SARC</h3>
                  <p class="text-xs text-slate-500">Đội trưởng: <span class="font-bold text-indigo-600">Nguyễn Văn A (Bạn)</span> • Sĩ số: <span class="font-bold text-emerald-600">15/15</span></p>
                </div>
              </div>
              <div class="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl text-center text-xs">
                <div><div class="text-[10px] text-slate-400">Tổng KM</div><div class="font-mono font-bold text-slate-900">3,146.4</div></div>
                <div><div class="text-[10px] text-slate-400">Chuyên Cần</div><div class="font-mono font-bold text-slate-900">138 ngày</div></div>
                <div><div class="text-[10px] text-slate-400">Điểm 50/50</div><div class="font-mono font-black text-indigo-600">18.52 pts</div></div>
              </div>
            </div>
          </div>
        </div>

        <!-- [7.B] KHÔNG GIAN QUẢN TRỊ ĐỘI TRƯỞNG -->
        <div id="section-7b" class="sub-screen-container hidden space-y-5">
          <div class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-3xl p-6 border border-indigo-200/80 shadow-sm space-y-3">
            <div class="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span class="hover:text-slate-800 transition cursor-pointer" onclick="switchTab('dashboard')">Trang chủ</span>
              <span class="text-slate-300">›</span>
              <span class="text-slate-700">[7.0] Đội Thi Đấu</span>
              <span class="text-slate-300">›</span>
              <span class="text-indigo-600 font-bold">[7.B] Quyền Năng Đội Trưởng</span>
            </div>
            <h2 class="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Không Gian Quản Trị Của Đội Trưởng</h2>
            <p class="text-xs text-slate-500">Đổi tên đội, cờ hiệu nhận diện, kiểm soát ma trận roster thành viên và đôn đốc thi đua thoát phạt [AC-039]</p>
          </div>

          <!-- Identity Card -->
          <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h3 class="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <span>🎨</span> Tùy Biến Nhận Diện Đội Thi Đấu
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Tên Đội Thi Đấu (*)</label>
                <input type="text" id="team-name-input" value="Team Phoenix SARC" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800">
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Khẩu Hiệu (Slogan)</label>
                <input type="text" id="team-slogan-input" value="Sải bước kiêu hãnh, bứt phá giới hạn!" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800">
              </div>
            </div>
            <div class="flex justify-end pt-2">
              <button onclick="saveTeamIdentity('team-phoenix')" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition">
                ✓ Lưu Thay Đổi Nhận Diện
              </button>
            </div>
          </div>

          <!-- Roster Matrix -->
          <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <span>📊</span> Ma Trận Roster Phong Độ Thành Viên
                </h3>
                <p class="text-xs text-slate-400">Giám sát tiến độ tuần và đôn đốc thành viên có nguy cơ vi phạm</p>
              </div>
              <span class="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-xl">15 Thành Viên</span>
            </div>

            <div class="overflow-x-auto rounded-2xl border border-slate-200/80">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th class="p-3">Thành Viên</th>
                    <th class="p-3">Cự Ly Toàn Giải</th>
                    <th class="p-3">Ngày Chuyên Cần</th>
                    <th class="p-3">Tiến Độ Tuần (Chỉ tiêu 20km)</th>
                    <th class="p-3">Trạng Thái</th>
                    <th class="p-3 text-right">Đôn Đốc Thi Đua</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 font-medium text-slate-700">
                  <tr class="hover:bg-slate-50/70">
                    <td class="p-3 font-bold flex items-center gap-2">
                      <div class="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">NA</div>
                      <span>Nguyễn Văn A (Captain)</span>
                    </td>
                    <td class="p-3 font-mono font-bold">125.0 km</td>
                    <td class="p-3 font-mono">18 ngày</td>
                    <td class="p-3 font-mono text-emerald-600 font-bold">20.0 / 20.0 km (100%)</td>
                    <td class="p-3"><span class="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">✓ Đạt Tuần</span></td>
                    <td class="p-3 text-right"><span class="text-slate-400 text-[11px]">Đội trưởng</span></td>
                  </tr>
                  <tr class="hover:bg-slate-50/70">
                    <td class="p-3 font-bold flex items-center gap-2">
                      <div class="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs">KD</div>
                      <span>Hoàng Kim Dung</span>
                    </td>
                    <td class="p-3 font-mono font-bold">88.5 km</td>
                    <td class="p-3 font-mono">12 ngày</td>
                    <td class="p-3 font-mono text-emerald-600 font-bold">17.5 / 20.0 km (88%)</td>
                    <td class="p-3"><span class="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">An Toàn</span></td>
                    <td class="p-3 text-right">
                      <button onclick="nudgeMember('Hoàng Kim Dung')" class="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] rounded-lg">Khen Ngợi</button>
                    </td>
                  </tr>
                  <tr class="hover:bg-rose-50/50 bg-rose-50/20">
                    <td class="p-3 font-bold flex items-center gap-2 text-rose-900">
                      <div class="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-xs">VN</div>
                      <span>Vũ Hải Nam</span>
                    </td>
                    <td class="p-3 font-mono font-bold">72.0 km</td>
                    <td class="p-3 font-mono">10 ngày</td>
                    <td class="p-3 font-mono text-rose-600 font-bold">14.5 / 20.0 km (Thiếu 5.5km)</td>
                    <td class="p-3"><span class="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold text-[10px] animate-pulse">⚠️ Nguy Cơ Phạt</span></td>
                    <td class="p-3 text-right">
                      <button onclick="nudgeMember('Vũ Hải Nam')" class="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[10px] rounded-xl shadow-sm transition flex items-center gap-1 ml-auto">
                        <span>⚡</span> Đôn Đốc Thi Đua
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- TAB: [8.0] MẠNG XÃ HỘI CHẠY BỘ & BẠN BÈ (v2.1) -->
      <!-- ======================================================== -->
      <div id="tab-social" class="tab-content max-w-5xl mx-auto space-y-5">
        <!-- Sub-navigation Pills for Tab 8 -->
        <div class="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
          <span class="text-slate-400 font-bold shrink-0">Chức năng:</span>
          <button onclick="showSubScreen('social', 'section-8a')" class="subscreen-pill px-3 py-1.5 rounded-xl font-bold transition shrink-0 bg-[#FF5B26] text-white shadow-sm">[8.A] Bảng Tin Cộng Đồng & Kudos</button>
          <button onclick="showSubScreen('social', 'section-8b')" class="subscreen-pill px-3 py-1.5 rounded-xl font-bold transition shrink-0 bg-white border border-slate-200/80 text-slate-700 hover:text-[#FF5B26]">[8.B] Mạng Lưới Bạn Bè 2 Chiều</button>
        </div>

        <!-- [8.A] SOCIAL FEED -->
        <div id="section-8a" class="sub-screen-container block space-y-5">
          <div class="bg-gradient-to-r from-rose-50 to-orange-50 rounded-3xl p-6 border border-rose-200/80 shadow-sm space-y-3">
            <div class="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span class="hover:text-slate-800 transition cursor-pointer" onclick="switchTab('dashboard')">Trang chủ</span>
              <span class="text-slate-300">›</span>
              <span class="text-slate-700">[8.0] Mạng Xã Hội</span>
              <span class="text-slate-300">›</span>
              <span class="text-rose-600 font-bold">[8.A] Bảng Tin Cộng Đồng</span>
            </div>
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
              <div>
                <h2 class="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Bảng Tin Hoạt Động & Kudos Thể Thao</h2>
                <p class="text-xs text-slate-500 mt-1">Chia sẻ bài chạy, thả Kudos khích lệ và bình luận kết nối cộng đồng chạy bộ [AC-041]</p>
              </div>
              <div class="flex items-center bg-white p-1 rounded-2xl border border-slate-200 text-xs font-bold">
                <button onclick="filterSocialFeed('all')" id="feed-filter-all" class="px-3 py-1.5 rounded-xl bg-[#18181B] text-white">Toàn Sàn</button>
                <button onclick="filterSocialFeed('club')" id="feed-filter-club" class="px-3 py-1.5 rounded-xl text-slate-600 hover:text-slate-900">CLB SARC</button>
                <button onclick="filterSocialFeed('friends')" id="feed-filter-friends" class="px-3 py-1.5 rounded-xl text-slate-600 hover:text-slate-900">Bạn Bè</button>
              </div>
            </div>
          </div>

          <!-- Feed Posts -->
          <div class="space-y-4">
            <!-- Post 1 -->
            <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FF5B26] to-amber-500 text-white font-bold flex items-center justify-center text-xs">NA</div>
                  <div>
                    <div class="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                      <span>Nguyễn Văn A</span>
                      <span class="text-[10px] bg-orange-100 text-[#FF5B26] px-2 py-0.5 rounded-full font-bold">SARC Hà Nội</span>
                    </div>
                    <div class="text-[11px] text-slate-400">2 giờ trước • Giải Mùa 10 Techcombank</div>
                  </div>
                </div>
                <span class="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-extrabold">+1.8km Trail Bonus</span>
              </div>

              <div>
                <p class="text-xs text-slate-800 font-medium">Sáng sớm leo dốc sóc Sơn cùng anh em Team Phoenix, không khí mát lành sảng khoái! Hoàn thành 10.5km với độ cao 180m gain.</p>
              </div>

              <div class="grid grid-cols-4 gap-2 bg-slate-50 p-3.5 rounded-2xl text-center text-xs font-mono">
                <div><div class="text-[10px] text-slate-400 font-sans">Cự ly</div><div class="font-bold text-slate-900 text-sm">10.5 km</div></div>
                <div><div class="text-[10px] text-slate-400 font-sans">Pace TB</div><div class="font-bold text-slate-900 text-sm">5:12</div></div>
                <div><div class="text-[10px] text-slate-400 font-sans">Độ Cao</div><div class="font-bold text-purple-600 text-sm">+180 m</div></div>
                <div><div class="text-[10px] text-slate-400 font-sans">Thời Gian</div><div class="font-bold text-slate-900 text-sm">54:36</div></div>
              </div>

              <!-- Kudos and Comments Action Bar -->
              <div class="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                <div class="flex items-center gap-3">
                  <button onclick="toggleKudosClient('post-01')" id="kudos-btn-post-01" class="px-3.5 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#FF5B26] font-bold flex items-center gap-1.5 transition">
                    <span>🔥</span> <span id="kudos-count-post-01">18</span> Kudos
                  </button>
                  <span class="text-slate-400">•</span>
                  <span class="text-slate-500 font-medium">2 Bình luận</span>
                </div>
              </div>

              <!-- Comments Section -->
              <div id="comments-list-post-01" class="space-y-2 text-xs bg-slate-50/70 p-3 rounded-2xl">
                <div class="flex items-start gap-2">
                  <span class="font-bold text-slate-900">Đặng Tuấn Kiệt:</span>
                  <span class="text-slate-700">Pace đều quá anh ơi, cung này đẹp mê ly!</span>
                </div>
                <div class="flex items-start gap-2">
                  <span class="font-bold text-slate-900">Hoàng Kim Dung:</span>
                  <span class="text-slate-700">Mai chạy tiếp cung này không anh A? Cho em bám đuôi với!</span>
                </div>
              </div>

              <!-- Add Comment Input -->
              <div class="flex items-center gap-2 pt-1 text-xs">
                <input type="text" id="comment-input-post-01" placeholder="Viết bình luận khích lệ..." class="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800">
                <button onclick="submitCommentClient('post-01')" class="px-4 py-2 bg-[#18181B] hover:bg-slate-800 text-white font-bold rounded-xl transition">
                  Gửi
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- [8.B] MẠNG LƯỚI BẠN BÈ 2 CHIỀU -->
        <div id="section-8b" class="sub-screen-container hidden space-y-5">
          <div class="bg-gradient-to-r from-rose-50 to-purple-50 rounded-3xl p-6 border border-rose-200/80 shadow-sm space-y-3">
            <div class="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span class="hover:text-slate-800 transition cursor-pointer" onclick="switchTab('dashboard')">Trang chủ</span>
              <span class="text-slate-300">›</span>
              <span class="text-slate-700">[8.0] Mạng Xã Hội</span>
              <span class="text-slate-300">›</span>
              <span class="text-rose-600 font-bold">[8.B] Mạng Lưới Bạn Bè 2 Chiều</span>
            </div>
            <h2 class="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Đồ Thị Bạn Bè & Kết Nối Vận Động Viên</h2>
            <p class="text-xs text-slate-500">Mạng lưới kết nối 2 chiều giữa các runners đa CLB trên toàn sàn [AC-040]</p>
          </div>

          <!-- Pending Friend Requests -->
          <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h3 class="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <span>👋</span> Lời Mời Kết Bạn Đang Chờ Phản Hồi (1)
            </h3>
            <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center">DH</div>
                <div>
                  <div class="font-extrabold text-slate-900">Đỗ Mạnh Hùng</div>
                  <div class="text-slate-400">CLB VKL Runners • 3 giải chung</div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <button onclick="respondFriendRequestClient('user-ext-2', true)" class="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition">Chấp Thuận</button>
                <button onclick="respondFriendRequestClient('user-ext-2', false)" class="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition">Từ Chối</button>
              </div>
            </div>
          </div>

          <!-- Official Friends List -->
          <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h3 class="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <span>👥</span> Danh Sách Bạn Chạy Chính Thức (3)
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center">TB</div>
                  <div>
                    <div class="font-bold text-slate-900">Trần Thị B</div>
                    <div class="text-[10px] text-slate-400">Team Dragons • 118km</div>
                  </div>
                </div>
                <button onclick="switchTab('chat')" class="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 font-bold">Chat</button>
              </div>
              <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-full bg-indigo-500 text-white font-bold flex items-center justify-center">HC</div>
                  <div>
                    <div class="font-bold text-slate-900">Lê Hoàng C</div>
                    <div class="text-[10px] text-slate-400">Team Tigers • 105km</div>
                  </div>
                </div>
                <button onclick="switchTab('chat')" class="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 font-bold">Chat</button>
              </div>
              <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-full bg-rose-500 text-white font-bold flex items-center justify-center">KD</div>
                  <div>
                    <div class="font-bold text-slate-900">Hoàng Kim Dung</div>
                    <div class="text-[10px] text-slate-400">Team Phoenix • 88km</div>
                  </div>
                </div>
                <button onclick="switchTab('chat')" class="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 font-bold">Chat</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- TAB: [9.0] CHAT, PACERBOT AI & BANTER ROAST (v2.1) -->
      <!-- ======================================================== -->
      <div id="tab-chat" class="tab-content max-w-5xl mx-auto space-y-5">
        <!-- Sub-navigation Pills for Tab 9 -->
        <div class="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
          <span class="text-slate-400 font-bold shrink-0">Chức năng:</span>
          <button onclick="showSubScreen('chat', 'section-9a')" class="subscreen-pill px-3 py-1.5 rounded-xl font-bold transition shrink-0 bg-[#FF5B26] text-white shadow-sm">[9.A] Phòng Chat Thời Gian Thực</button>
          <button onclick="showSubScreen('chat', 'section-9b')" class="subscreen-pill px-3 py-1.5 rounded-xl font-bold transition shrink-0 bg-white border border-slate-200/80 text-slate-700 hover:text-[#FF5B26]">[9.B] Cấu Hình Banter & PacerBot AI</button>
        </div>

        <!-- [9.A] LIVE CHAT -->
        <div id="section-9a" class="sub-screen-container block space-y-5">
          <div class="bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl p-6 border border-amber-200/80 shadow-sm space-y-3">
            <div class="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span class="hover:text-slate-800 transition cursor-pointer" onclick="switchTab('dashboard')">Trang chủ</span>
              <span class="text-slate-300">›</span>
              <span class="text-slate-700">[9.0] Chat & AI</span>
              <span class="text-slate-300">›</span>
              <span class="text-amber-600 font-bold">[9.A] Phòng Chat Thời Gian Thực</span>
            </div>
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Phòng Chat CLB, Trợ Lý AI & Banter Bot</h2>
                <p class="text-xs text-slate-500 mt-1">Kênh trao đổi chiến thuật thi đấu, hỏi đáp luật giải tự động với PacerBot AI và trêu đùa thi đua</p>
              </div>
              <span class="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-extrabold">Online: 42 Runners</span>
            </div>
          </div>

          <!-- Chat Layout -->
          <div class="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[460px]">
            <!-- Channels List (4 cols) -->
            <div class="md:col-span-4 border-r border-slate-100 p-4 space-y-3 bg-slate-50/50">
              <div class="font-extrabold text-xs uppercase tracking-wider text-slate-400">Kênh CLB & Đội</div>
              <div class="space-y-1 text-xs">
                <button onclick="switchChatChannel('#chung-clb-sarc')" id="chan-clb" class="w-full text-left p-2.5 rounded-xl font-bold bg-[#18181B] text-white flex items-center justify-between shadow-sm">
                  <span># chung-clb-sarc</span>
                  <span class="text-[10px] bg-orange-500 text-white px-1.5 py-0.5 rounded-full">New</span>
                </button>
                <button onclick="switchChatChannel('#doi-phoenix-sarc')" id="chan-phoenix" class="w-full text-left p-2.5 rounded-xl font-medium text-slate-700 hover:bg-slate-100 flex items-center justify-between">
                  <span># doi-phoenix-sarc</span>
                  <span class="text-[10px] text-slate-400">15 TV</span>
                </button>
                <button onclick="switchChatChannel('#lich-chay-offline')" id="chan-offline" class="w-full text-left p-2.5 rounded-xl font-medium text-slate-700 hover:bg-slate-100 flex items-center justify-between">
                  <span># lich-chay-offline</span>
                </button>
                <button onclick="switchChatChannel('#ban-chu-nhiem')" id="chan-bcn" class="w-full text-left p-2.5 rounded-xl font-medium text-slate-700 hover:bg-slate-100 flex items-center justify-between">
                  <span>🔒 ban-chu-nhiem</span>
                </button>
              </div>

              <div class="pt-3 border-t border-slate-200/60">
                <div class="font-extrabold text-[11px] text-slate-500 mb-1.5">Gợi ý thử nghiệm nhanh:</div>
                <div class="space-y-1">
                  <button onclick="quickAskBot('Hỏi luật Trail')" class="w-full text-left p-2 rounded-lg bg-white border border-slate-200 text-[11px] text-indigo-700 font-bold hover:bg-indigo-50">🤖 Hỏi PacerBot luật Trail</button>
                  <button onclick="quickAskBot('Kích hoạt Banter Bot')" class="w-full text-left p-2 rounded-lg bg-white border border-slate-200 text-[11px] text-amber-700 font-bold hover:bg-amber-50">🔥 Kích hoạt Banter Roast Bot</button>
                </div>
              </div>
            </div>

            <!-- Chat Window (8 cols) -->
            <div class="md:col-span-8 flex flex-col justify-between p-4 bg-white">
              <div id="chat-messages-container" class="space-y-3 overflow-y-auto max-h-[360px] pr-2 text-xs">
                <!-- User Msg -->
                <div class="flex items-start gap-2.5">
                  <div class="w-8 h-8 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shrink-0">NA</div>
                  <div class="space-y-1 max-w-[80%]">
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-slate-900">Nguyễn Văn A (Captain)</span>
                      <span class="text-[10px] text-slate-400">10:15</span>
                    </div>
                    <div class="p-3 rounded-2xl rounded-tl-none bg-slate-100 text-slate-800">
                      Chào cả nhà, sáng mai 5h Hồ Tây chạy Long Run nhé! Ai tham gia điểm danh nào!
                    </div>
                  </div>
                </div>

                <!-- Banter Bot Msg -->
                <div class="flex items-start gap-2.5">
                  <div class="w-8 h-8 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center shrink-0">🔥</div>
                  <div class="space-y-1 max-w-[85%]">
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-amber-600">Banter Roast Bot (Cà khịa thi đua)</span>
                      <span class="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-black">AI ROAST</span>
                    </div>
                    <div class="p-3 rounded-2xl rounded-tl-none bg-amber-50 border border-amber-200 text-amber-900">
                      ⚠️ <strong>Cảnh báo thi đua:</strong> @Vũ Hải Nam tuần này mới được 14.5km, còn 18 giờ nữa là chuẩn bị tự giác nộp 50.000đ vào quỹ CLB nhé! Team Phoenix đang trông chờ vào bạn đấy 😂
                    </div>
                  </div>
                </div>

                <!-- PacerBot AI Msg -->
                <div class="flex items-start gap-2.5">
                  <div class="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0">🤖</div>
                  <div class="space-y-1 max-w-[85%]">
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-indigo-600">PacerBot AI (Trợ lý giải đấu)</span>
                      <span class="text-[9px] bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded font-black">OFFICIAL BOT</span>
                    </div>
                    <div class="p-3 rounded-2xl rounded-tl-none bg-indigo-50 border border-indigo-200 text-indigo-950 leading-relaxed">
                      💡 <strong>Quy định giải Mùa 10:</strong> Bài chạy có Pace chậm hơn 10:00 vẫn hợp lệ nếu đạt Elevation Gain từ 100m trở lên. Cứ mỗi 100m Gain được thưởng thêm 1.0 km (tối đa +5.0 km/bài). Chúc toàn đội luyện tập an toàn!
                    </div>
                  </div>
                </div>
              </div>

              <!-- Input bar -->
              <div class="pt-3 border-t border-slate-100 flex items-center gap-2">
                <input type="text" id="chat-msg-input" placeholder="Nhập tin nhắn... (Gõ @PacerBot để hỏi luật chạy)" class="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 outline-none focus:ring-1 focus:ring-orange-500">
                <button onclick="sendChatMessage()" class="px-5 py-2.5 bg-[#FF5B26] hover:bg-[#e04800] text-white font-bold text-xs rounded-xl shadow transition">
                  Gửi
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- [9.B] BANTER CONTROLS -->
        <div id="section-9b" class="sub-screen-container hidden space-y-5">
          <div class="bg-gradient-to-r from-amber-50 to-purple-50 rounded-3xl p-6 border border-amber-200/80 shadow-sm space-y-3">
            <div class="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span class="hover:text-slate-800 transition cursor-pointer" onclick="switchTab('dashboard')">Trang chủ</span>
              <span class="text-slate-300">›</span>
              <span class="text-slate-700">[9.0] Chat & AI</span>
              <span class="text-slate-300">›</span>
              <span class="text-amber-600 font-bold">[9.B] Cấu Hình Banter Engine</span>
            </div>
            <h2 class="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Cấu Hình Banter Roast Bot & AI Pacer</h2>
            <p class="text-xs text-slate-500">Điều chỉnh mức độ trêu chọc hài hước tạo động lực thi đua và bật tắt trợ lý ảo</p>
          </div>

          <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h3 class="font-extrabold text-sm text-slate-900">Mức Độ Cà Khịa / Trêu Chọc Thi Đua (Roast Level)</h3>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <label class="p-3.5 rounded-2xl border border-slate-200 flex items-center gap-2.5 cursor-pointer hover:bg-slate-50">
                <input type="radio" name="banter-level" value="1">
                <div><div class="font-bold text-slate-900">Mức 1: Tắt Hoàn Toàn</div><div class="text-slate-400 text-[10px]">Không gửi tin trêu chọc</div></div>
              </label>
              <label class="p-3.5 rounded-2xl border border-slate-200 flex items-center gap-2.5 cursor-pointer hover:bg-slate-50">
                <input type="radio" name="banter-level" value="2">
                <div><div class="font-bold text-slate-900">Mức 2: Nhẹ Nhàng & Động Viên</div><div class="text-slate-400 text-[10px]">Nhắc giờ chạy thân thiện</div></div>
              </label>
              <label class="p-3.5 rounded-2xl border-2 border-amber-400 bg-amber-50/50 flex items-center gap-2.5 cursor-pointer">
                <input type="radio" name="banter-level" value="3" checked>
                <div><div class="font-bold text-amber-900">Mức 3: Cà Khịa Thi Đua (Savage)</div><div class="text-amber-700 text-[10px]">Trêu nộp phạt, tụt hạng, sát pace trần</div></div>
              </label>
            </div>

            <div class="pt-2">
              <button onclick="saveBanterSettings()" class="px-5 py-2.5 bg-[#18181B] hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow transition">
                ✓ Lưu Cấu Hình Banter Engine
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- TAB: [10.0] ĐIỀU HÀNH TOÀN DIỆN CLB ERP (v2.1) -->
      <!-- ======================================================== -->
      <div id="tab-governance" class="tab-content max-w-5xl mx-auto space-y-5">
        <!-- Sub-navigation Pills for Tab 10 -->
        <div class="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
          <span class="text-slate-400 font-bold shrink-0">Chức năng ERP:</span>
          <button onclick="showSubScreen('governance', 'section-10a')" class="subscreen-pill px-3 py-1.5 rounded-xl font-bold transition shrink-0 bg-[#FF5B26] text-white shadow-sm">[10.A] Trung Tâm Điều Hành & VietQR</button>
          <button onclick="showSubScreen('governance', 'section-10b')" class="subscreen-pill px-3 py-1.5 rounded-xl font-bold transition shrink-0 bg-white border border-slate-200/80 text-slate-700 hover:text-[#FF5B26]">[10.B] Cảnh Báo Kỷ Luật & Chế Tài</button>
          <button onclick="showSubScreen('governance', 'section-10c')" class="subscreen-pill px-3 py-1.5 rounded-xl font-bold transition shrink-0 bg-white border border-slate-200/80 text-slate-700 hover:text-[#FF5B26]">[10.C] Buổi Chạy Offline (RSVP & QR)</button>
          <button onclick="showSubScreen('governance', 'section-10d')" class="subscreen-pill px-3 py-1.5 rounded-xl font-bold transition shrink-0 bg-white border border-slate-200/80 text-slate-700 hover:text-[#FF5B26]">[10.D] Biểu Quyết Nội Bộ (Polls)</button>
          <button onclick="showSubScreen('governance', 'section-10e')" class="subscreen-pill px-3 py-1.5 rounded-xl font-bold transition shrink-0 bg-white border border-slate-200/80 text-slate-700 hover:text-[#FF5B26]">[10.E] Kho Giáo Án Tri Thức</button>
        </div>

        <!-- [10.A] HUB ĐIỀU HÀNH -->
        <div id="section-10a" class="sub-screen-container block space-y-5">
          <div class="bg-gradient-to-r from-emerald-50 to-slate-50 rounded-3xl p-6 border border-emerald-200/80 shadow-sm space-y-3">
            <div class="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span class="hover:text-slate-800 transition cursor-pointer" onclick="switchTab('dashboard')">Trang chủ</span>
              <span class="text-slate-300">›</span>
              <span class="text-slate-700">[10.0] Điều Hành ERP CLB</span>
              <span class="text-slate-300">›</span>
              <span class="text-emerald-600 font-bold">[10.A] Trung Tâm Điều Hành</span>
            </div>
            <h2 class="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Trung Tâm Điều Hành & Cấu Hình VietQR Quỹ CLB</h2>
            <p class="text-xs text-slate-500">Quản trị toàn diện thông tin CLB, cấu hình tài khoản thụ hưởng VietQR NAPAS 247 và phân quyền ban điều hành</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div class="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm text-center">
              <div class="text-xs text-slate-400">Tổng Thành Viên</div>
              <div class="text-xl font-black text-slate-900 font-mono mt-1">128 VĐV</div>
            </div>
            <div class="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm text-center">
              <div class="text-xs text-slate-400">Giải Đang Chạy</div>
              <div class="text-xl font-black text-emerald-600 font-mono mt-1">2 Giải</div>
            </div>
            <div class="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm text-center">
              <div class="text-xs text-slate-400">Tổng Quỹ CLB</div>
              <div class="text-xl font-black text-amber-600 font-mono mt-1">18,500,000 đ</div>
            </div>
            <div class="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm text-center">
              <div class="text-xs text-slate-400">Tỷ Lệ Active Tuần</div>
              <div class="text-xl font-black text-indigo-600 font-mono mt-1">94.2%</div>
            </div>
          </div>
        </div>

        <!-- [10.B] QUẢN TRỊ KỶ LUẬT -->
        <div id="section-10b" class="sub-screen-container hidden space-y-5">
          <div class="bg-gradient-to-r from-rose-50 to-slate-50 rounded-3xl p-6 border border-rose-200/80 shadow-sm space-y-3">
            <div class="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span class="hover:text-slate-800 transition cursor-pointer" onclick="switchTab('dashboard')">Trang chủ</span>
              <span class="text-slate-300">›</span>
              <span class="text-slate-700">[10.0] Điều Hành ERP CLB</span>
              <span class="text-slate-300">›</span>
              <span class="text-rose-600 font-bold">[10.B] Kỷ Luật & Chế Tài</span>
            </div>
            <h2 class="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Hệ Thống Quản Trị Kỷ Luật & Chế Tài Vận Động Viên</h2>
            <p class="text-xs text-slate-500">Ban hành cảnh báo vi phạm nợ quỹ, nghi vấn gian lận GPS và tạm treo quyền thi đấu [AC-10B]</p>
          </div>

          <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="font-extrabold text-sm text-slate-900">Danh Sách Cảnh Báo Hiệu Lực</h3>
              <button onclick="submitDisciplinaryWarning()" class="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow transition">
                + Ban Hành Cảnh Báo Mới
              </button>
            </div>
            <div class="space-y-2 text-xs">
              <div class="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                <div>
                  <div class="font-bold text-amber-900 flex items-center gap-2">
                    <span>🟨 Thẻ Vàng: Hoàng Văn T</span>
                    <span class="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">Nợ quỹ 2 tuần</span>
                  </div>
                  <div class="text-amber-800 mt-1">Chưa đóng quỹ vi phạm 100.000đ từ Tuần 4. Hạn chót giải trình: 08/11/2026.</div>
                </div>
                <span class="px-2.5 py-1 bg-amber-200 text-amber-900 font-bold rounded-xl text-[10px]">Đang Hiệu Lực</span>
              </div>
              <div class="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between">
                <div>
                  <div class="font-bold text-rose-900 flex items-center gap-2">
                    <span>🟥 Treo Điểm Thi Đấu: Trần Đức M</span>
                    <span class="text-[10px] bg-rose-200 text-rose-900 px-2 py-0.5 rounded-full">Nghi vấn gian lận GPS</span>
                  </div>
                  <div class="text-rose-800 mt-1">Bài chạy Pace 2:35 vi phạm sàn kỹ thuật. Tạm dừng tính điểm và yêu cầu nộp file GPX trong 24h.</div>
                </div>
                <span class="px-2.5 py-1 bg-rose-200 text-rose-900 font-bold rounded-xl text-[10px]">Treo Điểm</span>
              </div>
            </div>
          </div>
        </div>

        <!-- [10.C] BUỔI CHẠY OFFLINE RSVP & QR -->
        <div id="section-10c" class="sub-screen-container hidden space-y-5">
          <div class="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-3xl p-6 border border-emerald-200/80 shadow-sm space-y-3">
            <div class="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span class="hover:text-slate-800 transition cursor-pointer" onclick="switchTab('dashboard')">Trang chủ</span>
              <span class="text-slate-300">›</span>
              <span class="text-slate-700">[10.0] Điều Hành ERP CLB</span>
              <span class="text-slate-300">›</span>
              <span class="text-emerald-600 font-bold">[10.C] Lịch Chạy Offline & RSVP</span>
            </div>
            <h2 class="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Sự Kiện Chạy Bộ Offline, RSVP & Check-in QR</h2>
            <p class="text-xs text-slate-500">Tổ chức các buổi Long Run cuối tuần, phân bổ Pacer dẫn tốc và điểm danh bằng mã QR tại chỗ</p>
          </div>

          <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">CHỦ NHẬT TUẦN NÀY</span>
                <h3 class="font-black text-base text-slate-900 mt-1">Long Run 21km Chinh Phục Cầu Nhật Tân & Hồ Tây</h3>
                <p class="text-xs text-slate-500">05:00 Sáng • Tập trung: Công viên Bách Thảo • Pacer: 5:30 & 6:00</p>
              </div>
              <div class="flex items-center gap-2">
                <button onclick="rsvpOfflineEvent('evt-01')" id="btn-rsvp-evt-01" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5">
                  <span>✓</span> <span id="rsvp-status-text">Tôi Sẽ Tham Gia (Going)</span>
                </button>
                <button onclick="checkinOfflineEventModal('evt-01')" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition flex items-center gap-1.5">
                  <span>📷</span> Quét QR Điểm Danh
                </button>
              </div>
            </div>
            <div class="text-xs text-slate-600">
              <strong>Danh sách đã xác nhận tham gia:</strong> 28 Runners (Nguyễn Văn A, Hoàng Kim Dung, Đặng Tuấn Kiệt, Lê Hoàng C...)
            </div>
          </div>
        </div>

        <!-- [10.D] BIỂU QUYẾT NỘI BỘ POLLS -->
        <div id="section-10d" class="sub-screen-container hidden space-y-5">
          <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-6 border border-blue-200/80 shadow-sm space-y-3">
            <div class="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span class="hover:text-slate-800 transition cursor-pointer" onclick="switchTab('dashboard')">Trang chủ</span>
              <span class="text-slate-300">›</span>
              <span class="text-slate-700">[10.0] Điều Hành ERP CLB</span>
              <span class="text-slate-300">›</span>
              <span class="text-blue-600 font-bold">[10.D] Biểu Quyết Nội Bộ (Polls)</span>
            </div>
            <h2 class="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Thăm Dò Ý Kiến & Biểu Quyết Nội Bộ CLB</h2>
            <p class="text-xs text-slate-500">Lấy ý kiến dân chủ của các thành viên CLB với biểu đồ tỷ lệ thời gian thực</p>
          </div>

          <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="font-extrabold text-sm text-slate-900">Thăm Dò: "Chọn mẫu áo thi đấu chính thức Techcombank 2026"</h3>
              <span class="text-xs text-slate-400 font-mono">Còn 3 ngày</span>
            </div>
            <div class="space-y-3 text-xs">
              <div class="p-3.5 rounded-2xl border border-orange-200 bg-orange-50/40 space-y-2">
                <div class="flex items-center justify-between font-bold">
                  <span class="text-orange-950">Phương án A: Cam Neon Volt Dynamic</span>
                  <span id="poll-pct-a" class="font-mono text-[#FF5B26]">68% (42 phiếu)</span>
                </div>
                <div class="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div id="poll-bar-a" class="bg-[#FF5B26] h-full rounded-full transition-all duration-300" style="width: 68%"></div>
                </div>
                <button onclick="voteClubPoll('A')" class="px-3 py-1 bg-[#FF5B26] text-white font-bold rounded-lg text-[10px]">Bình Chọn Phương Án Này</button>
              </div>

              <div class="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                <div class="flex items-center justify-between font-bold">
                  <span class="text-slate-800">Phương án B: Đen Carbon Minimalist</span>
                  <span id="poll-pct-b" class="font-mono text-slate-600">32% (20 phiếu)</span>
                </div>
                <div class="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div id="poll-bar-b" class="bg-slate-700 h-full rounded-full transition-all duration-300" style="width: 32%"></div>
                </div>
                <button onclick="voteClubPoll('B')" class="px-3 py-1 bg-slate-800 text-white font-bold rounded-lg text-[10px]">Bình Chọn Phương Án Này</button>
              </div>
            </div>
          </div>
        </div>

        <!-- [10.E] KHO GIÁO ÁN TRI THỨC -->
        <div id="section-10e" class="sub-screen-container hidden space-y-5">
          <div class="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-3xl p-6 border border-purple-200/80 shadow-sm space-y-3">
            <div class="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span class="hover:text-slate-800 transition cursor-pointer" onclick="switchTab('dashboard')">Trang chủ</span>
              <span class="text-slate-300">›</span>
              <span class="text-slate-700">[10.0] Điều Hành ERP CLB</span>
              <span class="text-slate-300">›</span>
              <span class="text-purple-600 font-bold">[10.E] Kho Giáo Án Tri Thức</span>
            </div>
            <h2 class="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Kho Giáo Án Tập Luyện & Tri Thức Thể Thao</h2>
            <p class="text-xs text-slate-500">Tài liệu chuyên môn từ Ban huấn luyện dành cho các cấp độ chạy</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2.5">
              <span class="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-extrabold">MARATHON (42KM)</span>
              <h3 class="font-extrabold text-sm text-slate-900">Giáo Án Chinh Phục Sub-4 Marathon 16 Tuần</h3>
              <p class="text-xs text-slate-500">Phân kỳ tập luyện khoa học: Xây dựng nền tảng Aerobic, bài chạy Interval cải thiện VO2Max và Long Run cuối tuần.</p>
              <button onclick="showToast('Đang mở giáo án Sub-4 Marathon PDF...')" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl">Đọc Toàn Văn</button>
            </div>
            <div class="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2.5">
              <span class="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold">TRAIL RUNNING</span>
              <h3 class="font-extrabold text-sm text-slate-900">Chiến Thuật Leo Dốc Trail & Sử Dụng Gậy Chạy Địa Hình</h3>
              <p class="text-xs text-slate-500">Kỹ thuật sải bước dốc đứng, phân phối nhịp thở và cách nạp gel/điện giải phòng tránh chuột rút trên cung đường núi.</p>
              <button onclick="showToast('Đang mở cẩm nang Trail Running PDF...')" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl">Đọc Toàn Văn</button>
            </div>
          </div>
        </div>
      </div>
`;

// Insert the 5 tabs before FAB button
const fabTarget = `      <!-- [1.5] Floating Action Button (FAB) for Mobile & Desktop -->`;
if (code.includes(fabTarget)) {
  code = code.replace(fabTarget, fiveNewTabsHtml + '\n' + fabTarget);
  console.log('Inserted 5 new V2.1 tabs before FAB button');
} else {
  console.error('Could not find fabTarget in main.ts');
}

// ==========================================
// 2. EXPAND ALIAS MAP IN switchTab
// ==========================================
const oldAliasMap = `      const aliasMap = {
        '1': 'dashboard', '1.0': 'dashboard',
        '2': 'arena', '2.0': 'arena',
        '3': 'activities', '3.0': 'activities',
        '4': 'club', '4.0': 'club',
        '5': 'finance', '5.0': 'finance', 'me': 'finance',
        '6': 'club-manage', '6.0': 'club-manage',
        '7': 'rules', '7.0': 'rules', 'race-ops': 'rules',
        '8': 'admin', '8.0': 'admin'
      };`;

const newAliasMap = `      const aliasMap = {
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
      };`;

if (code.includes(oldAliasMap)) {
  code = code.replace(oldAliasMap, newAliasMap);
  console.log('Updated aliasMap in switchTab');
} else {
  console.log('Could not find oldAliasMap, checking...');
}

// ==========================================
// 3. ADD CLIENT HANDLERS
// ==========================================
const clientHandlers = `
    // ========================================================
    // V2.1 INTERACTIVE CLIENT-SIDE HANDLERS
    // ========================================================
    async function disconnectStravaClient() {
      try {
        const res = await fetch('/api/v1/me/strava', { method: 'DELETE' });
        const badge = document.getElementById('strava-status-badge');
        if (badge) {
          badge.className = 'px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5';
          badge.innerHTML = '<span class="w-2 h-2 rounded-full bg-rose-500"></span><span>ĐÃ HỦY LIÊN KẾT (REVOKED)</span>';
        }
        document.getElementById('btn-strava-disconnect')?.classList.add('hidden');
        document.getElementById('btn-strava-reconnect')?.classList.remove('hidden');
        showToast('⚠️ Đã ngắt kết nối Strava. Thành tích cũ vẫn được bảo lưu an toàn!');
      } catch (e) {
        showToast('Lỗi khi ngắt kết nối Strava');
      }
    }

    async function reconnectStravaClient() {
      try {
        const res = await fetch('/api/v1/me/strava/reconnect', { method: 'POST' });
        const badge = document.getElementById('strava-status-badge');
        if (badge) {
          badge.className = 'px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5';
          badge.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span><span>ĐANG KẾT NỐI (ACTIVE)</span>';
        }
        document.getElementById('btn-strava-disconnect')?.classList.remove('hidden');
        document.getElementById('btn-strava-reconnect')?.classList.add('hidden');
        showToast('✓ Đã kết nối lại Strava OAuth 2.0 thành công!');
      } catch (e) {
        showToast('Lỗi khi kết nối lại Strava');
      }
    }

    function triggerManualSync() {
      showToast('🔄 Đang quét gói tin mới từ Strava API Developer Console...');
      setTimeout(() => {
        showToast('✓ Đồng bộ hoàn tất: Không có bài chạy mới nào phát sinh');
      }, 1000);
    }

    function viewRawPayload(stravaId) {
      alert('PAYLOAD THÔ TỪ STRAVA WEBHOOK (# ' + stravaId + '):\\n\\n' + JSON.stringify({
        object_id: parseInt(stravaId, 10),
        aspect_type: "create",
        event_time: Math.floor(Date.now() / 1000),
        object_type: "activity",
        owner_id: 9482012,
        subscription_id: 998811,
        updates: {}
      }, null, 2));
    }

    async function saveTeamIdentity(teamId) {
      const name = document.getElementById('team-name-input')?.value || 'Team Phoenix SARC';
      const slogan = document.getElementById('team-slogan-input')?.value || '';
      try {
        const res = await fetch('/api/v1/teams/' + teamId, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, slogan })
        });
        showToast('👑 Đã cập nhật nhận diện Đội trưởng: "' + name + '"');
      } catch (e) {
        showToast('Lỗi khi lưu nhận diện đội');
      }
    }

    function nudgeMember(memberName) {
      showToast('⚡ Đã gửi thông báo đôn đốc tới ' + memberName + ' qua kênh Chat đội!');
    }

    function filterSocialFeed(type) {
      document.querySelectorAll('#feed-filter-all, #feed-filter-club, #feed-filter-friends').forEach(b => {
        b.className = 'px-3 py-1.5 rounded-xl text-slate-600 hover:text-slate-900';
      });
      const activeBtn = document.getElementById('feed-filter-' + type);
      if (activeBtn) activeBtn.className = 'px-3 py-1.5 rounded-xl bg-[#18181B] text-white';
      showToast('Đang hiển thị luồng tin: ' + (type === 'all' ? 'Toàn sàn' : type === 'club' ? 'CLB SARC' : 'Bạn bè'));
    }

    async function toggleKudosClient(postId) {
      try {
        const res = await fetch('/api/v1/community/posts/' + postId + '/kudos', { method: 'POST' });
        const data = await res.json();
        const countEl = document.getElementById('kudos-count-' + postId);
        if (countEl) countEl.innerText = data.kudosCount || 19;
        showToast(data.liked ? '🔥 Đã thả Kudos khích lệ thành tích!' : 'Đã bỏ thả Kudos');
      } catch (e) {
        showToast('🔥 Đã thả Kudos!');
      }
    }

    async function submitCommentClient(postId) {
      const input = document.getElementById('comment-input-' + postId);
      const text = input ? input.value.trim() : '';
      if (!text) return;
      const list = document.getElementById('comments-list-' + postId);
      if (list) {
        const item = document.createElement('div');
        item.className = 'flex items-start gap-2 animate-in fade-in';
        item.innerHTML = '<span class="font-bold text-slate-900">Nguyễn Văn A:</span><span class="text-slate-700">' + text + '</span>';
        list.appendChild(item);
      }
      if (input) input.value = '';
      showToast('✓ Đã gửi bình luận');
    }

    async function respondFriendRequestClient(userId, accept) {
      try {
        await fetch('/api/v1/me/friends/requests/' + userId, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accept })
        });
        showToast(accept ? '✓ Đã đồng ý kết bạn! Hoạt động của nhau sẽ xuất hiện trên Feed bạn bè' : 'Đã từ chối lời mời');
      } catch (e) {
        showToast(accept ? '✓ Đã kết bạn thành công!' : 'Đã từ chối');
      }
    }

    function switchChatChannel(chanName) {
      document.querySelectorAll('#chan-clb, #chan-phoenix, #chan-offline, #chan-bcn').forEach(b => {
        b.className = 'w-full text-left p-2.5 rounded-xl font-medium text-slate-700 hover:bg-slate-100 flex items-center justify-between';
      });
      showToast('Đã chuyển sang kênh: ' + chanName);
    }

    function sendChatMessage() {
      const input = document.getElementById('chat-msg-input');
      const val = input ? input.value.trim() : '';
      if (!val) return;
      const container = document.getElementById('chat-messages-container');
      if (container) {
        const userMsg = document.createElement('div');
        userMsg.className = 'flex items-start gap-2.5 animate-in fade-in';
        userMsg.innerHTML = '<div class="w-8 h-8 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shrink-0">NA</div>' +
          '<div class="space-y-1 max-w-[80%]">' +
          '<div class="flex items-center gap-2"><span class="font-bold text-slate-900">Nguyễn Văn A</span><span class="text-[10px] text-slate-400">Vừa xong</span></div>' +
          '<div class="p-3 rounded-2xl rounded-tl-none bg-orange-50 border border-orange-200 text-slate-800">' + val + '</div>' +
          '</div>';
        container.appendChild(userMsg);

        // Check if @PacerBot or question
        if (val.toLowerCase().includes('@pacerbot') || val.toLowerCase().includes('luật') || val.toLowerCase().includes('trail') || val.toLowerCase().includes('pace')) {
          setTimeout(() => {
            const botMsg = document.createElement('div');
            botMsg.className = 'flex items-start gap-2.5 animate-in fade-in';
            botMsg.innerHTML = '<div class="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0">🤖</div>' +
              '<div class="space-y-1 max-w-[85%]">' +
              '<div class="flex items-center gap-2"><span class="font-bold text-indigo-600">PacerBot AI</span><span class="text-[9px] bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded font-black">AI RESPONDER</span></div>' +
              '<div class="p-3 rounded-2xl rounded-tl-none bg-indigo-50 border border-indigo-200 text-indigo-950 leading-relaxed">Chào bạn Nguyễn Văn A! Hệ thống xác nhận cự ly tối thiểu giải Mùa 10 là 3.0km, Pace cho phép từ 4:00 đến 10:00. Sàn Pace kỹ thuật chặn gian lận là 2:45 min/km. Chúc bạn chạy vui khỏe!</div>' +
              '</div>';
            container.appendChild(botMsg);
            container.scrollTop = container.scrollHeight;
          }, 600);
        }
        container.scrollTop = container.scrollHeight;
      }
      if (input) input.value = '';
    }

    function quickAskBot(type) {
      const input = document.getElementById('chat-msg-input');
      if (input) {
        input.value = type === 'Hỏi luật Trail' ? '@PacerBot giải thích công thức thưởng Trail Gain giải này?' : '@BanterBot cho một câu cà khịa thi đua đội nào!';
        sendChatMessage();
      }
    }

    function saveBanterSettings() {
      showToast('✓ Đã cập nhật cấu hình Banter Roast Engine: Mức 3 (Cà khịa thi đua)!');
    }

    function submitDisciplinaryWarning() {
      showToast('✓ Đã ban hành cảnh báo kỷ luật và gửi thông báo tới vận động viên!');
    }

    function rsvpOfflineEvent(evtId) {
      const textEl = document.getElementById('rsvp-status-text');
      if (textEl) {
        const isGoing = textEl.innerText.includes('Going');
        textEl.innerText = isGoing ? 'Hủy Tham Gia' : 'Tôi Sẽ Tham Gia (Going)';
        showToast(isGoing ? 'Đã hủy tham gia buổi chạy Offline' : '✓ Đã xác nhận tham gia Long Run cuối tuần!');
      }
    }

    function checkinOfflineEventModal(evtId) {
      showToast('📷 Đã kích hoạt camera quét mã QR Check-in điểm danh tại chỗ!');
    }

    function voteClubPoll(option) {
      if (option === 'A') {
        document.getElementById('poll-pct-a').innerText = '71% (44 phiếu)';
        document.getElementById('poll-bar-a').style.width = '71%';
      } else {
        document.getElementById('poll-pct-b').innerText = '35% (22 phiếu)';
        document.getElementById('poll-bar-b').style.width = '35%';
      }
      showToast('✓ Đã ghi nhận biểu quyết của bạn cho Phương Án ' + option + '!');
    }
`;

// Insert client handlers before the end of the script tag
const scriptEndAnchor = `  </script>`;
if (code.includes(scriptEndAnchor)) {
  code = code.replace(scriptEndAnchor, clientHandlers + '\n  </script>');
  console.log('Appended V2.1 client handlers before </script>');
} else {
  console.error('Could not find </script>');
}

fs.writeFileSync(mainTsPath, code, 'utf8');
console.log('Successfully wrote updated main.ts. New file size:', code.length);

