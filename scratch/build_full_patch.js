const fs = require('fs');

// Helper to wrap a screen with standard header banner
function makeStandardHeader(moduleName, screenTitle, subtext, badgesHtml = '', actionsHtml = '') {
  return `
          <!-- Standard Screen Header Banner -->
          <div class="bg-gradient-to-r from-slate-50 to-orange-50/40 rounded-3xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3 mb-5">
            <div class="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span class="hover:text-slate-800 transition cursor-pointer" onclick="switchTab('dashboard')">Trang chủ</span>
              <span class="text-slate-300">›</span>
              <span class="text-slate-700">${moduleName}</span>
              <span class="text-slate-300">›</span>
              <span class="text-[#FF5B26] font-bold">${screenTitle}</span>
            </div>
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
              <div>
                <div class="flex items-center gap-2.5 flex-wrap">
                  <h2 class="text-xl md:text-2xl font-black text-slate-900 tracking-tight">${screenTitle}</h2>
                  ${badgesHtml}
                </div>
                <p class="text-xs text-slate-500 mt-1">${subtext}</p>
              </div>
              ${actionsHtml ? `<div class="shrink-0 flex items-center gap-2">${actionsHtml}</div>` : ''}
            </div>
          </div>
  `;
}

// ==========================================
// 4. GENERATE TAB 5: CÁ NHÂN & SỔ NỢ (FINANCE)
// ==========================================
const tabFinanceHtml = `
      <div id="tab-finance" class="tab-content max-w-5xl mx-auto space-y-5">
        <!-- Sub-navigation Pills for Tab 5 -->
        <div class="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
          <span class="text-slate-400 font-bold shrink-0">Chức năng:</span>
          <button onclick="showSubScreen('finance', 'section-5-1')" data-section="section-5-1" class="subscreen-pill px-3 py-1.5 rounded-xl font-bold transition shrink-0 bg-[#FF5B26] text-white shadow-sm">Hồ sơ cá nhân & GDPR</button>
          <button onclick="showSubScreen('finance', 'section-5-2')" data-section="section-5-2" class="subscreen-pill px-3 py-1.5 rounded-xl font-bold transition shrink-0 bg-white border border-slate-200/80 text-slate-700 hover:text-[#FF5B26]">Kết nối Strava & Logs</button>
          <button onclick="showSubScreen('finance', 'section-5-3')" data-section="section-5-3" class="subscreen-pill px-3 py-1.5 rounded-xl font-bold transition shrink-0 bg-white border border-slate-200/80 text-slate-700 hover:text-[#FF5B26]">Sổ nợ & Đóng quỹ</button>
          <button onclick="showSubScreen('finance', 'section-5-4')" data-section="section-5-4" class="subscreen-pill px-3 py-1.5 rounded-xl font-bold transition shrink-0 bg-white border border-slate-200/80 text-slate-700 hover:text-[#FF5B26]">Tùy chọn giao diện</button>
        </div>

        <!-- [SCREEN 5.1] HỒ SƠ CÁ NHÂN & QUYỀN RIÊNG TƯ (GDPR) -->
        <div id="section-5-1" class="sub-screen-container block space-y-5">
          ${makeStandardHeader(
            'Cá Nhân & Sổ Nợ',
            'Hồ Sơ Cá Nhân & GDPR',
            'Cập nhật thông tin định danh, tùy chọn xuất toàn bộ dữ liệu cá nhân hoặc quyền được lãng quên',
            '<span class="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200">Bảo Mật GDPR</span>'
          )}

          <!-- Profile Form Card -->
          <div class="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_4px_25px_rgb(0,0,0,0.03)] space-y-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label class="block text-slate-600 font-bold mb-1">Họ và tên:</label>
                <input type="text" id="profile-name" value="Nguyễn Văn A" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-orange-500 shadow-sm">
              </div>
              <div>
                <label class="block text-slate-600 font-bold mb-1">Email liên kết:</label>
                <input type="email" id="profile-email" value="athlete.nguyen@sarc.vn" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-orange-500 shadow-sm">
              </div>
              <div>
                <label class="block text-slate-600 font-bold mb-1">Số điện thoại:</label>
                <input type="tel" id="profile-phone" value="0912 345 678" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-orange-500 shadow-sm">
              </div>
              <div>
                <label class="block text-slate-600 font-bold mb-1">Đội thi đấu hiện tại:</label>
                <select id="profile-team" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-orange-500 shadow-sm">
                  <option value="phoenix" selected>Team Phoenix SARC</option>
                  <option value="dragons">Team Dragons SARC</option>
                  <option value="tigers">Team Tigers SARC</option>
                </select>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center justify-between flex-wrap gap-3 pt-3 border-t border-slate-100">
              <div class="flex items-center gap-2">
                <button onclick="gdprExportData()" class="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1.5">
                  <span>📥</span> [GDPR] Xuất Dữ Liệu JSON
                </button>
                <button onclick="gdprDeleteAccount()" class="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition flex items-center gap-1.5">
                  <span>🗑️</span> [GDPR] Quyền Quên
                </button>
              </div>
              <button onclick="saveUserProfile()" class="px-5 py-2 rounded-xl text-xs font-bold bg-[#FF5B26] hover:bg-[#e04800] text-white shadow-sm transition">
                Lưu Thay Đổi Hồ Sơ
              </button>
            </div>
          </div>
        </div>

        <!-- [SCREEN 5.2] KẾT NỐI STRAVA OAUTH & NHẬT KÝ INGESTION THÔ -->
        <div id="section-5-2" class="sub-screen-container hidden space-y-5">
          ${makeStandardHeader(
            'Cá Nhân & Sổ Nợ',
            'Kết Nối Strava & Logs',
            'Quản lý kết nối tài khoản Strava tự phục vụ (Disconnect / Reconnect) và kiểm tra nhật ký Webhook',
            `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
               <span class="w-2 h-2 rounded-full bg-emerald-500"></span> Đã Kết Nối Strava (Athlete ID #9482012)
             </span>`,
            `<button onclick="triggerManualStravaSync()" class="px-4 py-2 rounded-xl text-xs font-bold bg-[#18181B] hover:bg-slate-800 text-white shadow-sm transition flex items-center gap-1.5">
               <span>🔄</span> Đồng Bộ Ngay
             </button>`
          )}

          <!-- Strava Status & Controls Card -->
          <div class="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_4px_25px_rgb(0,0,0,0.03)] space-y-6">
            <div class="flex items-center justify-between flex-wrap gap-4 p-4 rounded-2xl bg-orange-50/60 border border-orange-200 text-xs">
              <div class="space-y-1">
                <div class="font-bold text-orange-950 flex items-center gap-2">
                  <span class="text-base">🏃</span>
                  <span>Tài Khoản Strava: <strong>Nguyễn Văn A</strong> (Athlete #9482012)</span>
                </div>
                <div class="text-slate-600">Lần đồng bộ cuối: <strong id="strava-last-sync-time" class="font-mono text-slate-800">10 phút trước</strong> • Trạng thái Webhook: <strong class="text-emerald-600">Đang hoạt động ✓</strong></div>
              </div>
              <div class="flex items-center gap-2">
                <button onclick="disconnectStrava()" class="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 shadow-sm transition">
                  Ngắt Kết Nối
                </button>
                <button onclick="reconnectStrava()" class="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm transition">
                  Kết Nối Lại
                </button>
              </div>
            </div>

            <!-- Raw Sync Logs Table -->
            <div class="space-y-3">
              <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wider">Nhật Ký Tiếp Nhận Webhook Strava Thô</h4>
              <div class="overflow-x-auto rounded-2xl border border-slate-200 text-xs">
                <table class="w-full text-left">
                  <thead class="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <tr>
                      <th class="py-3 px-4">Thời Gian</th>
                      <th class="py-3 px-4">Nguồn Sync</th>
                      <th class="py-3 px-4">Activity ID</th>
                      <th class="py-3 px-4">Mã HTTP</th>
                      <th class="py-3 px-4">Trạng Thái</th>
                      <th class="py-3 px-4">Chi Tiết / Payload</th>
                    </tr>
                  </thead>
                  <tbody id="strava-sync-logs-tbody" class="divide-y divide-slate-100">
                    <!-- Preseeded logs for tests & display -->
                    <tr>
                      <td class="py-3 px-4 font-mono text-slate-500">2 giờ trước</td>
                      <td class="py-3 px-4"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">webhook</span></td>
                      <td class="py-3 px-4 font-mono text-slate-800">12894102941</td>
                      <td class="py-3 px-4 font-mono text-emerald-600 font-bold">200</td>
                      <td class="py-3 px-4"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">processed</span></td>
                      <td class="py-3 px-4 text-slate-600">Run • 6.2km • Hợp lệ</td>
                    </tr>
                    <tr>
                      <td class="py-3 px-4 font-mono text-slate-500">1 ngày trước</td>
                      <td class="py-3 px-4"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">webhook</span></td>
                      <td class="py-3 px-4 font-mono text-slate-800">12883910231</td>
                      <td class="py-3 px-4 font-mono text-emerald-600 font-bold">200</td>
                      <td class="py-3 px-4"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">processed</span></td>
                      <td class="py-3 px-4 text-slate-600">TrailRun • 4.1km • Gain 250m</td>
                    </tr>
                    <tr>
                      <td class="py-3 px-4 font-mono text-slate-500">2 ngày trước</td>
                      <td class="py-3 px-4"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">webhook</span></td>
                      <td class="py-3 px-4 font-mono text-slate-800">12861029311</td>
                      <td class="py-3 px-4 font-mono text-amber-600 font-bold">200</td>
                      <td class="py-3 px-4"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">ignored</span></td>
                      <td class="py-3 px-4 text-rose-500">Cự ly nhỏ hơn mức tối thiểu 3.0 km</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- [SCREEN 5.3] SỔ NỢ CÁ NHÂN & ĐÓNG QUÝ VIETQR -->
        <div id="section-5-3" class="sub-screen-container hidden space-y-5">
          ${makeStandardHeader(
            'Cá Nhân & Sổ Nợ',
            'Sổ Nợ & Đóng Quỹ',
            'Báo cáo chi tiết nghĩa vụ đóng quỹ, phạt thiếu cự ly chu kỳ tuần và quét mã VietQR tự động điền cú pháp',
            '<span class="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">Đã Hoàn Thành Quỹ</span>'
          )}

          <!-- Financial Details & VietQR Card -->
          <div class="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_4px_25px_rgb(0,0,0,0.03)] space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div class="md:col-span-7 space-y-4 text-xs">
                <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div class="text-[10px] uppercase font-bold text-slate-400">Trạng Thái Sổ Nợ Cá Nhân</div>
                  <div class="text-3xl font-black font-mono text-[#FF5B26]">100.000 <span class="text-sm font-semibold text-slate-500">VND</span></div>
                  <p class="text-slate-600">Đóng quỹ giải Mùa 10 theo xếp hạng Top 1 của Team Phoenix SARC (100.000đ/người). Không có khoản phạt thiếu cự ly tồn đọng.</p>
                </div>

                <div class="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                  <div class="font-bold text-emerald-900">Thông Tin Chuyển Khoản CLB SARC</div>
                  <div class="text-slate-700">Ngân hàng: <strong>Techcombank (BIN 970407)</strong></div>
                  <div class="text-slate-700">Số tài khoản: <strong class="font-mono text-emerald-700">1903688899901</strong></div>
                  <div class="text-slate-700">Chủ tài khoản: <strong>CLB CHAY BO SARC</strong></div>
                  <div class="text-slate-700">Cú pháp: <strong class="font-mono bg-white px-2 py-0.5 rounded border border-emerald-300">SARC10 NGUYENVANA</strong></div>
                </div>
              </div>

              <!-- VietQR Code Preview Box -->
              <div class="md:col-span-5 flex flex-col items-center justify-center p-5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <div class="w-40 h-40 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center mb-2">
                  <!-- VietQR SVG Illustration -->
                  <svg class="w-36 h-36" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="100" height="100" rx="12" fill="white"/>
                    <rect x="10" y="10" width="30" height="30" rx="6" fill="#18181B"/>
                    <rect x="16" y="16" width="18" height="18" rx="3" fill="white"/>
                    <rect x="20" y="20" width="10" height="10" rx="2" fill="#FF5B26"/>
                    <rect x="60" y="10" width="30" height="30" rx="6" fill="#18181B"/>
                    <rect x="66" y="16" width="18" height="18" rx="3" fill="white"/>
                    <rect x="70" y="20" width="10" height="10" rx="2" fill="#FF5B26"/>
                    <rect x="10" y="60" width="30" height="30" rx="6" fill="#18181B"/>
                    <rect x="16" y="66" width="18" height="18" rx="3" fill="white"/>
                    <rect x="20" y="70" width="10" height="10" rx="2" fill="#FF5B26"/>
                    <circle cx="50" cy="50" r="8" fill="#FF5B26"/>
                    <rect x="50" y="25" width="4" height="10" fill="#18181B"/>
                    <rect x="70" y="60" width="15" height="15" fill="#18181B"/>
                    <rect x="55" y="75" width="10" height="10" fill="#18181B"/>
                  </svg>
                </div>
                <div class="text-[11px] font-bold text-slate-800">VietQR Tự Động Điền Cú Pháp</div>
                <div class="text-[10px] text-slate-400">Số tiền: 100.000đ • Tức thì 24/7</div>
              </div>
            </div>
          </div>
        </div>

        <!-- [SCREEN 5.4] TÙY CHỌN GIAO DIỆN & TRẢI NGHIỆM -->
        <div id="section-5-4" class="sub-screen-container hidden space-y-5">
          ${makeStandardHeader(
            'Cá Nhân & Sổ Nợ',
            'Tùy Chọn Giao Diện',
            'Cài đặt ngôn ngữ, chế độ hiển thị thẻ, định dạng cự ly (KM/Miles) và thông báo qua Web/Email',
            '<span class="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-slate-100 text-slate-700">Cấu Hình</span>'
          )}

          <!-- Settings Options Card -->
          <div class="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_4px_25px_rgb(0,0,0,0.03)] space-y-6">
            <div class="space-y-4 text-xs">
              <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <div class="font-bold text-slate-800">Đơn vị đo lường cự ly</div>
                  <div class="text-slate-500">Chuyển đổi hiển thị giữa Kilometers (KM) và Dặm (Miles)</div>
                </div>
                <button onclick="toggleUnit()" class="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 shadow-sm text-slate-800 hover:border-orange-500 transition">
                  <span id="unit-btn-text">🏃 KM</span>
                </button>
              </div>

              <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <div class="font-bold text-slate-800">Chế độ giao diện (Theme)</div>
                  <div class="text-slate-500">Tùy biến bảng màu sắc giao diện sáng hoặc tối</div>
                </div>
                <span class="px-3 py-1.5 rounded-xl bg-orange-100 text-[#FF5B26] font-bold">Chế độ Sáng (Soft Clay)</span>
              </div>

              <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <div class="font-bold text-slate-800">Thông báo đẩy & Email nhắc nộp phạt</div>
                  <div class="text-slate-500">Nhận thông báo khi chu kỳ tuần sắp kết thúc hoặc có hoạt động cần xác minh</div>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked class="sr-only peer">
                  <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF5B26]"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
`;

console.log('Tab 5 Finance generated cleanly.');

