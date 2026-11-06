const fs = require('fs');
const path = require('path');

const mainPath = path.resolve(__dirname, '../workspace/backend/src/main.ts');
let content = fs.readFileSync(mainPath, 'utf8');

// 1. Locate Tabs 5-8 HTML range
const startMarker = '<!-- TAB 5: [5.0] TÀI KHOẢN CÁ NHÂN & CÀI ĐẶT (PROFILE & PREFERENCES) -->';
const endMarker = '<!-- [1.5] Floating Action Button (FAB) for Mobile & Desktop -->';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error('Markers not found! Start:', startIndex, 'End:', endIndex);
  process.exit(1);
}

// 2. Build the new rich HTML for Tabs 5, 6, 7, 8 with 32 dedicated screen anchors, full CRUD forms, member management, approvals, and race configurator
const newTabsHtml = `<!-- TAB 5: [5.0] TÀI KHOẢN CÁ NHÂN & CÀI ĐẶT (PROFILE & PREFERENCES) -->
      <div id="tab-finance" class="tab-content max-w-4xl mx-auto space-y-6">
        <!-- Sub-nav Breadcrumb Bar -->
        <div class="flex items-center gap-2 overflow-x-auto no-scrollbar text-xs pb-1">
          <span class="text-slate-400 font-bold shrink-0">Chức năng:</span>
          <button onclick="goToScreen('5.1')" class="px-2.5 py-1 rounded-xl bg-white border border-slate-200/80 font-bold text-slate-700 hover:text-[#FF5B26] transition shrink-0">[5.1] Hồ sơ & GDPR</button>
          <button onclick="goToScreen('5.2')" class="px-2.5 py-1 rounded-xl bg-white border border-slate-200/80 font-bold text-slate-700 hover:text-[#FF5B26] transition shrink-0">[5.2] Kết nối Strava</button>
          <button onclick="goToScreen('5.3')" class="px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 font-bold text-emerald-800 hover:text-[#FF5B26] transition shrink-0">[5.3] Sổ nợ & Đóng quỹ</button>
          <button onclick="goToScreen('5.4')" class="px-2.5 py-1 rounded-xl bg-white border border-slate-200/80 font-bold text-slate-700 hover:text-[#FF5B26] transition shrink-0">[5.4] Tùy chọn giao diện</button>
        </div>

        <!-- [5.1] HỒ SƠ CÁ NHÂN & QUYỀN RIÊNG TƯ (GDPR/NĐ 13) -->
        <div id="section-5-1" class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_4px_25px_rgb(0,0,0,0.03)] space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-100 text-blue-800">[5.1] Hồ Sơ Cá Nhân</span>
              <h3 class="text-base font-extrabold text-slate-900 mt-1">Thông Tin Cá Nhân & Bằng Chứng Đồng Thuận Dữ Liệu</h3>
            </div>
            <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Đã xác thực CCCD & Strava ✓
            </span>
          </div>

          <!-- Edit Profile Form -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
            <div class="space-y-1.5">
              <label class="block font-bold text-slate-700">Họ và Tên VĐV</label>
              <input type="text" id="profile-name" value="Nguyễn Văn A" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800">
            </div>
            <div class="space-y-1.5">
              <label class="block font-bold text-slate-700">Email Đăng Ký</label>
              <input type="email" id="profile-email" value="athlete.nguyen@sarc.vn" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800">
            </div>
            <div class="space-y-1.5">
              <label class="block font-bold text-slate-700">Số Điện Thoại</label>
              <input type="tel" id="profile-phone" value="0912 345 678" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800">
            </div>
            <div class="space-y-1.5">
              <label class="block font-bold text-slate-700">Đội Thi Đấu Trực Thuộc</label>
              <select id="profile-team" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800">
                <option value="team-phoenix" selected>Team Phoenix SARC (Hạng 1)</option>
                <option value="team-dragons">Team Dragons SADC (Hạng 2)</option>
                <option value="team-tigers">Team Tigers SADC (Hạng 2)</option>
              </select>
            </div>
            <div class="sm:col-span-2 flex justify-end gap-2 pt-2">
              <button onclick="saveUserProfile()" class="px-5 py-2 rounded-xl bg-[#18181B] hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5">
                <span>💾</span> Lưu Thay Đổi Hồ Sơ
              </button>
            </div>
          </div>

          <!-- Consent Logs Table -->
          <div class="pt-3 border-t border-slate-100 space-y-2">
            <h4 class="text-xs font-extrabold uppercase tracking-wider text-slate-400">Bằng Chứng Đồng Ý Dữ Liệu (Nghị định 13/2023/NĐ-CP & GDPR)</h4>
            <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs text-slate-600">
              <div class="flex items-center justify-between">
                <span>✓ <strong>Cam kết 1 (Dữ liệu Strava):</strong> Quyền đọc tự động hoạt động chạy bộ</span>
                <span class="font-mono text-[10px] text-slate-400">Ký: 01/08/2026 09:30</span>
              </div>
              <div class="flex items-center justify-between">
                <span>✓ <strong>Cam kết 2 (Công khai & Tài chính):</strong> Đồng ý BXH nội bộ & nộp quỹ/phạt tuần</span>
                <span class="font-mono text-[10px] text-slate-400">Ký: 01/08/2026 09:30</span>
              </div>
            </div>
          </div>
        </div>

        <!-- [5.2] KẾT NỐI STRAVA OAUTH & THIẾT BỊ -->
        <div id="section-5-2" class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_4px_25px_rgb(0,0,0,0.03)] space-y-4">
          <div>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-100 text-[#FF5B26]">[5.2] Kết Nối Strava OAuth</span>
            <h3 class="text-base font-extrabold text-slate-900 mt-1">Cấu Hình Tài Khoản Đồng Bộ & Webhook Gateway</h3>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div class="text-slate-400 font-semibold">Tài Khoản Strava</div>
              <div class="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <span class="text-[#FF5B26] font-black">Strava:</span> Nguyễn Văn A (ID: 94827103)
              </div>
              <div class="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> OAuth Token: Có hiệu lực (Auto Refresh)
              </div>
            </div>
            <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div class="text-slate-400 font-semibold">Trạng Thái Webhook Tức Thì</div>
              <div class="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <span class="text-emerald-600 font-black">● HOẠT ĐỘNG</span> (SLA < 2.0s)
              </div>
              <div class="text-[11px] text-slate-500">Cập nhật tự động ngay khi bạn bấm Kết thúc bài chạy trên đồng hồ.</div>
            </div>
          </div>
          <div class="flex items-center gap-2 pt-1">
            <button onclick="syncStravaNow()" class="px-4 py-2 rounded-xl bg-[#FF5B26] hover:bg-[#e04800] text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5">
              <span>🔄</span> Đồng bộ ngay từ Strava
            </button>
            <button onclick="showToast('Đã làm mới OAuth Access Token thành công!')" class="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition">
              Làm mới Token
            </button>
          </div>
        </div>

        <!-- [5.3] SỔ NỢ & LỊCH SỬ ĐÓNG QUÝ CÁ NHÂN [/me/finance] -->
        <div id="section-5-3" class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_4px_25px_rgb(0,0,0,0.03)] space-y-4">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">[5.3] Sổ Nợ Cá Nhân [/me/finance]</span>
              <h3 class="text-base font-extrabold text-slate-900 mt-1">Nghĩa Vụ Nộp Quỹ & Tiền Phạt Chu Kỳ</h3>
            </div>
            <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Mã tham chiếu VietQR: <strong class="font-mono">OR10-K7Q2</strong>
            </span>
          </div>
          <p class="text-xs text-slate-500">Quy chế CLB: Đội Hạng 1 đóng 100.000đ/người • Đội đồng hạng 2 đóng 200.000đ/người • Phạt thiếu km tuần 50.000đ.</p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
              <div class="flex justify-between"><span>Đóng quỹ bậc Hạng 1 (Team Phoenix):</span><strong class="font-mono">100.000đ</strong></div>
              <div class="flex justify-between"><span>Tiền phạt thiếu chỉ tiêu tuần (Tuần 1):</span><strong class="text-emerald-600 font-mono">0đ (Đạt 18.5/20km)</strong></div>
              <div class="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200 pt-2">
                <span>Tổng phải nộp:</span><span class="text-[#FF5B26] font-mono text-base font-black">100.000đ</span>
              </div>
            </div>

            <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-center items-center gap-2">
              <div id="runner-pay-status-badge" class="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                ⏳ CHƯA THANH TOÁN (UNPAID)
              </div>
              <button onclick="confirmRunnerPayment()" id="btn-runner-pay" class="w-full py-2.5 rounded-xl text-xs font-bold bg-[#FF5B26] hover:bg-[#e04800] text-white shadow-md transition">
                Tôi Đã Chuyển Khoản Qua VietQR
              </button>
            </div>
          </div>
        </div>

        <!-- [5.4] TÙY CHỌN GIAO DIỆN & ĐƠN VỊ ĐO -->
        <div id="section-5-4" class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_4px_25px_rgb(0,0,0,0.03)] space-y-4">
          <div>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-700">[5.4] Tùy Chọn Hệ Thống</span>
            <h3 class="text-base font-extrabold text-slate-900 mt-1">Cài Đặt Hiển Thị & Đơn Vị Đo Lường</h3>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <div class="font-bold text-slate-700">Đơn vị cự ly:</div>
              <div class="flex items-center gap-2 pt-1">
                <button onclick="toggleUnit('km')" id="btn-unit-km" class="px-3 py-1 rounded-lg font-bold bg-white text-slate-900 border border-slate-300 shadow-xs">Kilomet (km)</button>
                <button onclick="toggleUnit('mi')" id="btn-unit-mi" class="px-3 py-1 rounded-lg font-bold text-slate-500 hover:text-slate-900">Dặm (miles)</button>
              </div>
            </div>
            <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <div class="font-bold text-slate-700">Chế độ giao diện:</div>
              <div class="text-xs text-slate-600 pt-1 font-semibold">Soft-Clay Light (Chuẩn thiết kế SaaS)</div>
            </div>
            <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <div class="font-bold text-slate-700">Ngôn ngữ hiển thị:</div>
              <div class="text-xs text-slate-600 pt-1 font-semibold">Tiếng Việt (Mặc định)</div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 6: [6.0] QUẢN TRỊ CÂU LẠC BỘ (CLUB MANAGEMENT) -->
      <div id="tab-club-manage" class="tab-content max-w-4xl mx-auto space-y-6">
        <!-- Sub-nav Breadcrumb Bar -->
        <div class="flex items-center gap-2 overflow-x-auto no-scrollbar text-xs pb-1">
          <span class="text-slate-400 font-bold shrink-0">Chức năng:</span>
          <button onclick="goToScreen('6.1')" class="px-2.5 py-1 rounded-xl bg-white border border-slate-200/80 font-bold text-slate-700 hover:text-[#FF5B26] transition shrink-0">[6.1] Cài đặt CLB & VietQR</button>
          <button onclick="goToScreen('6.2')" class="px-2.5 py-1 rounded-xl bg-blue-50 border border-blue-200 font-bold text-blue-900 hover:text-[#FF5B26] transition shrink-0">[6.2] Quản trị thành viên</button>
          <button onclick="goToScreen('6.3')" class="px-2.5 py-1 rounded-xl bg-white border border-slate-200/80 font-bold text-slate-700 hover:text-[#FF5B26] transition shrink-0">[6.3] Quản lý mã mời</button>
        </div>

        <!-- [6.1] CÀI ĐẶT THÔNG TIN CLB & VIETQR BIN NGÂN HÀNG -->
        <div id="section-6-1" class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_4px_25px_rgb(0,0,0,0.03)] space-y-4">
          <div>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800">[6.1] Cài Đặt CLB & VietQR</span>
            <h3 class="text-base font-extrabold text-slate-900 mt-1">Thông Tin Câu Lạc Bộ & Tài Khoản Thu Quỹ VietQR</h3>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div class="space-y-1.5">
              <label class="block font-bold text-slate-700">Tên Câu Lạc Bộ</label>
              <input type="text" id="club-edit-name" value="CLB Chạy Bộ SARC (Sáng Ánh Rạng Chiều)" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800">
            </div>
            <div class="space-y-1.5">
              <label class="block font-bold text-slate-700">Slogan CLB</label>
              <input type="text" id="club-edit-slogan" value="Chạy Với Niềm Vui - Về Đích Cùng Đồng Đội" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800">
            </div>
            <div class="space-y-1.5 sm:col-span-2">
              <label class="block font-bold text-slate-700">Mô Tả Câu Lạc Bộ</label>
              <textarea id="club-edit-desc" rows="2" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800">Cộng đồng chạy bộ bán chuyên quy tụ các runners nhiệt huyết, gắn kết qua các mùa giải trực tuyến kỷ luật, minh bạch và tràn đầy năng lượng tích cực.</textarea>
            </div>
            <div class="space-y-1.5">
              <label class="block font-bold text-slate-700">Ngân Hàng Nhận Quỹ (VietQR BIN)</label>
              <select id="club-edit-bankbin" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800">
                <option value="970407" selected>970407 - Techcombank (TCB)</option>
                <option value="970422">970422 - MB Bank (MB)</option>
                <option value="970436">970436 - Vietcombank (VCB)</option>
              </select>
            </div>
            <div class="space-y-1.5">
              <label class="block font-bold text-slate-700">Số Tài Khoản Nhận Quỹ</label>
              <input type="text" id="club-edit-bankacc" value="1903688899901" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800">
            </div>
            <div class="space-y-1.5 sm:col-span-2">
              <label class="block font-bold text-slate-700">Tên Chủ Tài Khoản (Không dấu)</label>
              <input type="text" id="club-edit-bankname" value="CLB CHAY BO SARC" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 uppercase">
            </div>
          </div>
          <div class="flex justify-end pt-2">
            <button onclick="saveClubSettings()" class="px-5 py-2 rounded-xl bg-[#18181B] hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5">
              <span>💾</span> Lưu Cài Đặt CLB & Ngân Hàng
            </button>
          </div>
        </div>

        <!-- [6.2] QUẢN TRỊ THÀNH VIÊN & PHÂN ĐỘI THI ĐẤU -->
        <div id="section-6-2" class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_4px_25px_rgb(0,0,0,0.03)] space-y-4">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-100 text-blue-800">[6.2] Quản Trị Thành Viên</span>
              <h3 class="text-base font-extrabold text-slate-900 mt-1">Danh Sách Runners, Phân Quyền & Phân Bổ Đội</h3>
            </div>
            <button onclick="openAddMemberModal()" class="px-4 py-2 rounded-xl bg-[#FF5B26] hover:bg-[#e04800] text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5">
              <span>+</span> Thêm Thành Viên Mới
            </button>
          </div>

          <!-- Team Capacity Badges -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div class="p-3 rounded-2xl border border-rose-200 bg-rose-50/50">
              <div class="font-bold text-slate-800">Team Phoenix SARC</div>
              <div class="text-rose-600 font-bold font-mono mt-0.5">16/16 (ĐẦY - Khóa gia nhập)</div>
            </div>
            <div class="p-3 rounded-2xl border border-emerald-200 bg-emerald-50/50">
              <div class="font-bold text-slate-800">Team Dragons SADC</div>
              <div class="text-emerald-700 font-bold font-mono mt-0.5">14/16 (Còn 2 vị trí)</div>
            </div>
            <div class="p-3 rounded-2xl border border-blue-200 bg-blue-50/50">
              <div class="font-bold text-slate-800">Team Tigers SADC</div>
              <div class="text-blue-700 font-bold font-mono mt-0.5">15/16 (Còn 1 vị trí)</div>
            </div>
          </div>

          <!-- Search & Filter Controls -->
          <div class="flex items-center justify-between gap-3 flex-wrap">
            <input type="text" id="admin-member-search" oninput="filterAdminMemberList(this.value)" placeholder="Tìm kiếm theo tên hoặc email..." class="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 w-full sm:w-72">
            <div class="flex items-center gap-1.5 text-xs">
              <span class="text-slate-400 font-medium">Lọc vai trò:</span>
              <select id="admin-role-filter" onchange="filterAdminMemberList('')" class="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-700">
                <option value="ALL">Tất cả vai trò</option>
                <option value="ĐỘI TRƯỞNG">Đội trưởng</option>
                <option value="BAN CÁN SỰ">Ban cán sự</option>
                <option value="RUNNER">VĐV / Runner</option>
              </select>
            </div>
          </div>

          <!-- Members Table with Actions -->
          <div class="overflow-x-auto">
            <table class="w-full text-xs text-left border-collapse">
              <thead>
                <tr class="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-black">
                  <th class="py-2.5 px-3">Vận Động Viên</th>
                  <th class="py-2.5 px-3">Vai Trò</th>
                  <th class="py-2.5 px-3">Đội Thi Đấu</th>
                  <th class="py-2.5 px-3 text-center">Trạng Thái</th>
                  <th class="py-2.5 px-3 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody id="admin-members-tbody" class="divide-y divide-slate-100">
                <!-- Dynamic via JS -->
              </tbody>
            </table>
          </div>
        </div>

        <!-- [6.3] QUẢN LÝ LỜI MỜI & MÃ THAM GIA -->
        <div id="section-6-3" class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_4px_25px_rgb(0,0,0,0.03)] space-y-4">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-700">[6.3] Quản Lý Lời Mời</span>
              <h3 class="text-base font-extrabold text-slate-900 mt-1">Danh Sách Mã Mời Thành Viên & Hạn Mức</h3>
            </div>
            <button onclick="createInviteCodeModal()" class="px-4 py-2 rounded-xl bg-[#18181B] hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5">
              <span>+</span> Tạo Mã Mời Mới
            </button>
          </div>
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
            <div class="flex items-center justify-between">
              <div>
                <span class="font-bold text-slate-900 font-mono text-sm">OR-8K2Q</span>
                <span class="ml-2 text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">Đang hoạt động</span>
              </div>
              <span class="text-slate-500 font-mono">Đã dùng: <strong>48 / 100 lượt</strong> • Hết hạn: 31/12/2026</span>
            </div>
            <div class="text-[11px] text-slate-500">Mã gia nhập giải Mùa 10 kèm tự động phát hiện In-App Browser Detour.</div>
          </div>
        </div>
      </div>

      <!-- TAB 7: [7.0] QUẢN TRỊ GIẢI ĐẤU (RACE OPERATIONS & WIZARD 7 BƯỚC) -->
      <div id="tab-rules" class="tab-content max-w-4xl mx-auto space-y-6">
        <!-- Sub-nav Breadcrumb Bar -->
        <div class="flex items-center gap-2 overflow-x-auto no-scrollbar text-xs pb-1">
          <span class="text-slate-400 font-bold shrink-0">Chức năng:</span>
          <button onclick="goToScreen('7.1')" class="px-2.5 py-1 rounded-xl bg-orange-50 border border-orange-200 font-bold text-[#FF5B26] transition shrink-0">[7.1] Thiết lập giải & Wizard</button>
          <button onclick="goToScreen('7.2')" class="px-2.5 py-1 rounded-xl bg-white border border-slate-200/80 font-bold text-slate-700 hover:text-[#FF5B26] transition shrink-0">[7.2] Phân bổ đội</button>
          <button onclick="goToScreen('7.3')" class="px-2.5 py-1 rounded-xl bg-white border border-slate-200/80 font-bold text-slate-700 hover:text-[#FF5B26] transition shrink-0">[7.3] Phê duyệt khiếu nại</button>
          <button onclick="goToScreen('7.4')" class="px-2.5 py-1 rounded-xl bg-white border border-slate-200/80 font-bold text-slate-700 hover:text-[#FF5B26] transition shrink-0">[7.4] Miễn trừ phạt</button>
          <button onclick="goToScreen('7.5')" class="px-2.5 py-1 rounded-xl bg-white border border-slate-200/80 font-bold text-slate-700 hover:text-[#FF5B26] transition shrink-0">[7.5] Quản lý quỹ & Đối soát</button>
          <button onclick="goToScreen('7.6')" class="px-2.5 py-1 rounded-xl bg-white border border-slate-200/80 font-bold text-slate-700 hover:text-[#FF5B26] transition shrink-0">[7.6] Báo cáo xuất CSV</button>
          <button onclick="goToScreen('7.7')" class="px-2.5 py-1 rounded-xl bg-white border border-slate-200/80 font-bold text-slate-700 hover:text-[#FF5B26] transition shrink-0">[7.7] Chốt giải</button>
        </div>

        <!-- [7.1] THIẾT LẬP GIẢI ĐẤU & WIZARD 7 BƯỚC -->
        <div id="section-7-1" class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_4px_25px_rgb(0,0,0,0.03)] space-y-5">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-100 text-[#FF5B26]">[7.1] Thiết Lập & Cấu Hình Thể Lệ</span>
              <h3 class="text-base font-extrabold text-slate-900 mt-1">Bộ Điều Hành Thể Lệ Giải & Khóa Cứng Sàn Pace 2:45</h3>
            </div>
            <button onclick="openRaceWizardModal()" class="px-4 py-2 rounded-xl bg-[#FF5B26] hover:bg-[#e04800] text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5">
              <span>+</span> Thiết Lập Giải Đấu Mới
            </button>
          </div>

          <!-- Wizard 7-Step Chips Navigation -->
          <div class="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px] font-bold">
            <span class="px-3 py-1 bg-slate-900 text-white rounded-xl shrink-0">1. Cự ly tối thiểu (3.0km)</span>
            <span class="px-3 py-1 bg-orange-100 text-[#FF5B26] rounded-xl shrink-0">2. Pace Floor (Khoá 2:45)</span>
            <span class="px-3 py-1 bg-slate-100 text-slate-600 rounded-xl shrink-0">3. Chỉ tiêu tuần (20km)</span>
            <span class="px-3 py-1 bg-slate-100 text-slate-600 rounded-xl shrink-0">4. Phạt tuần (50.000đ)</span>
            <span class="px-3 py-1 bg-slate-100 text-slate-600 rounded-xl shrink-0">5. Trail Bonus (+gain)</span>
            <span class="px-3 py-1 bg-slate-100 text-slate-600 rounded-xl shrink-0">6. Bậc Quỹ (100k/200k)</span>
            <span class="px-3 py-1 bg-slate-100 text-slate-600 rounded-xl shrink-0">7. Áo SARC Top 1</span>
          </div>

          <!-- Interactive Rule Configurator Edit Form -->
          <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
            <div class="flex items-center justify-between">
              <h4 class="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span>⚙️</span> Cấu Hình Thể Lệ Giải Hiện Tại: <strong>Mùa 10 Run to Techcombank 2026</strong>
              </h4>
              <span class="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full font-bold">Quy chế v2.3 (Hiệu lực)</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label class="block font-bold text-slate-600 mb-1">Cự ly tối thiểu / bài</label>
                <input type="number" id="cfg-min-dist" value="3.0" step="0.5" class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800">
              </div>
              <div>
                <label class="block font-bold text-slate-600 mb-1">Sàn Pace Tối Đa Cho Phép</label>
                <div class="relative">
                  <input type="text" id="cfg-pace-floor" value="2:45 min/km (Khóa cứng)" disabled class="w-full bg-slate-100 border border-rose-200 rounded-xl px-3 py-2 text-xs font-bold text-rose-700 cursor-not-allowed">
                  <span class="absolute right-2.5 top-2 text-[10px] text-rose-500 font-bold">🔒 Khóa</span>
                </div>
              </div>
              <div>
                <label class="block font-bold text-slate-600 mb-1">Chỉ tiêu tuần cá nhân</label>
                <input type="number" id="cfg-target-km" value="20.0" step="1.0" class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800">
              </div>
              <div>
                <label class="block font-bold text-slate-600 mb-1">Mức phạt thiếu km tuần</label>
                <input type="text" id="cfg-penalty-vnd" value="50.000 VNĐ" class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800">
              </div>
              <div>
                <label class="block font-bold text-slate-600 mb-1">Bậc đóng quỹ Đội Hạng 1</label>
                <input type="text" id="cfg-fund-rank1" value="100.000 VNĐ" class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800">
              </div>
              <div>
                <label class="block font-bold text-slate-600 mb-1">Bậc đóng quỹ Đồng Hạng 2</label>
                <input type="text" id="cfg-fund-rank2" value="200.000 VNĐ" class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800">
              </div>
            </div>

            <div class="flex items-center justify-between pt-1">
              <span class="text-[11px] text-slate-400">Thời gian ân hạn chốt số liệu tuần: <strong>06:00:00 sáng Thứ Hai</strong>.</span>
              <button onclick="saveRaceRulesConfig()" class="px-5 py-2 rounded-xl bg-[#18181B] hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition">
                💾 Cập Nhật Quy Chế Mùa 10
              </button>
            </div>
          </div>

          <!-- Simulator Tool -->
          <div class="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
            <h4 class="text-xs font-bold text-slate-800 flex items-center gap-1">
              <span>🧪</span> Bộ Mô Phỏng Thẩm Định Nhanh (Dry-Run Simulator)
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-500 mb-1">Cự ly (km)</label>
                <input type="number" id="sim-dist" value="5.0" step="0.1" class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 mb-1">Thời gian (phút)</label>
                <input type="number" id="sim-time" value="27.5" step="0.5" class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 mb-1">Độ cao Gain (m)</label>
                <input type="number" id="sim-gain" value="40" step="10" class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs">
              </div>
              <div class="sm:col-span-3">
                <button onclick="runSimulation()" class="w-full py-2.5 rounded-full text-xs font-bold bg-[#18181B] text-white">
                  Chạy Thử Thẩm Định Tức Thì (500 mẫu)
                </button>
              </div>
            </div>
            <div id="sim-result" class="hidden p-4 rounded-2xl border text-xs"></div>
          </div>
        </div>

        <!-- [7.2] PHÂN BỔ ĐỘI & BỔ NHIỆM ĐỘI TRƯỞNG -->
        <div id="section-7-2" class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_4px_25px_rgb(0,0,0,0.03)] space-y-4">
          <div>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-100 text-blue-800">[7.2] Phân Bổ Đội</span>
            <h3 class="text-base font-extrabold text-slate-900 mt-1">Cơ Cấu Đội Thi Đấu & Giới Hạn Sức Chứa (Tối đa 16 VĐV)</h3>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div class="p-4 rounded-2xl bg-orange-50/40 border border-orange-200 space-y-1">
              <div class="font-bold text-slate-900">Team Phoenix SARC</div>
              <div class="text-[11px] text-slate-500">Đội trưởng: <strong>Nguyễn Văn A</strong></div>
              <div class="text-rose-600 font-mono font-bold mt-1">16/16 thành viên (ĐẦY)</div>
            </div>
            <div class="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
              <div class="font-bold text-slate-900">Team Dragons SADC</div>
              <div class="text-[11px] text-slate-500">Đội trưởng: <strong>Lê Hoàng Yến</strong></div>
              <div class="text-emerald-700 font-mono font-bold mt-1">14/16 thành viên (Còn 2)</div>
            </div>
            <div class="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
              <div class="font-bold text-slate-900">Team Tigers SADC</div>
              <div class="text-[11px] text-slate-500">Đội trưởng: <strong>Phạm Minh Đức</strong></div>
              <div class="text-emerald-700 font-mono font-bold mt-1">15/16 thành viên (Còn 1)</div>
            </div>
          </div>
        </div>

        <!-- [7.3] THẨM ĐỊNH THỦ CÔNG & PHÊ DUYỆT KHIẾU NẠI -->
        <div id="section-7-3" class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_4px_25px_rgb(0,0,0,0.03)] space-y-4">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-800">[7.3] Phê Duyệt Khiếu Nại</span>
              <h3 class="text-base font-extrabold text-slate-900 mt-1">Hàng Đợi Thẩm Định Bài Chạy Lỗi & Điều Chỉnh Cự Ly</h3>
            </div>
            <span class="text-xs font-bold text-slate-500 font-mono">Ban Trọng Tài & Điều Hành</span>
          </div>

          <div id="admin-appeals-container" class="space-y-2.5">
            <!-- Dynamic via JS -->
          </div>
        </div>

        <!-- [7.4] CẤP & PHÊ DUYỆT MIỄN TRỪ PHẠT TUẦN -->
        <div id="section-7-4" class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_4px_25px_rgb(0,0,0,0.03)] space-y-4">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-100 text-purple-800">[7.4] Miễn Trừ Phạt Tuần</span>
              <h3 class="text-base font-extrabold text-slate-900 mt-1">Cấp & Phê Duyệt Miễn Trừ Phạt (Chấn Thương / Y Tế)</h3>
            </div>
          </div>

          <!-- Create Waiver Form -->
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs">
            <h4 class="font-bold text-slate-800">Cấp Quyết Định Miễn Trừ Mới</h4>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="block font-semibold text-slate-600 mb-1">Chọn VĐV Miễn Phạt</label>
                <select id="waiver-user-select" class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800">
                  <option value="user-02">Trần Thị B (Team Dragons)</option>
                  <option value="user-03">Lê Hoàng C (Team Tigers)</option>
                  <option value="user-01">Nguyễn Văn A (Team Phoenix)</option>
                </select>
              </div>
              <div>
                <label class="block font-semibold text-slate-600 mb-1">Chu Kỳ Áp Dụng</label>
                <select id="waiver-cycle-select" class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800">
                  <option value="cycle-w1">Tuần 1 (01/11 - 07/11)</option>
                  <option value="cycle-w2">Tuần 2 (08/11 - 14/11)</option>
                </select>
              </div>
              <div>
                <label class="block font-semibold text-slate-600 mb-1">Lý Do Miễn Trừ</label>
                <input type="text" id="waiver-reason-input" value="Chấn thương cổ chân có xác nhận bệnh viện" class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800">
              </div>
            </div>
            <div class="flex justify-end pt-1">
              <button onclick="submitPenaltyWaiver()" class="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition">
                ✓ Phê Duyệt Miễn Phạt 50.000đ
              </button>
            </div>
          </div>

          <!-- Existing Waivers List -->
          <div id="waivers-history-container" class="space-y-2">
            <!-- Dynamic via JS -->
          </div>
        </div>

        <!-- [7.5] QUẢN LÝ QUỸ, ĐỐI SOÁT & PHÊ DUYỆT THU TIỀN VIETQR -->
        <div id="section-7-5" class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_4px_25px_rgb(0,0,0,0.03)] space-y-4">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">[7.5] Quản Lý Quỹ & Đối Soát VietQR</span>
              <h3 class="text-base font-extrabold text-slate-900 mt-1">Sổ Cái Kế Toán & Phê Duyệt Xác Nhận Đã Thu Tiền</h3>
            </div>
            <span class="text-xs font-bold text-slate-500 font-mono">Thủ Quỹ CLB</span>
          </div>

          <div id="admin-finance-container" class="space-y-2.5">
            <!-- Dynamic via JS -->
          </div>
        </div>

        <!-- [7.6] XUẤT DỮ LIỆU & BÁO CÁO TỔNG KẾT -->
        <div id="section-7-6" class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_4px_25px_rgb(0,0,0,0.03)] space-y-4">
          <div>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-700">[7.6] Xuất Dữ Liệu Báo Cáo</span>
            <h3 class="text-base font-extrabold text-slate-900 mt-1">Trích Xuất Báo Cáo Hoạt Động & Sổ Nợ</h3>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button onclick="exportActivitiesCsv()" class="p-4 rounded-2xl border border-slate-200 bg-white hover:border-[#FF5B26] text-left transition shadow-xs">
              <div class="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span>📊</span> Nhật Ký Hoạt Động
              </div>
              <div class="text-[11px] text-slate-500 mt-1">Xuất file CSV toàn bộ bài chạy đã thẩm định.</div>
            </button>
            <button onclick="showToast('Đã xuất báo cáo sổ cái tài chính sang định dạng CSV!')" class="p-4 rounded-2xl border border-slate-200 bg-white hover:border-[#FF5B26] text-left transition shadow-xs">
              <div class="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span>💰</span> Sổ Cái Tài Chính
              </div>
              <div class="text-[11px] text-slate-500 mt-1">Xuất danh sách nộp quỹ & tiền phạt tuần.</div>
            </button>
            <button onclick="showToast('Đã xuất bảng xếp hạng giải đấu sang CSV!')" class="p-4 rounded-2xl border border-slate-200 bg-white hover:border-[#FF5B26] text-left transition shadow-xs">
              <div class="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span>🏆</span> Bảng Xếp Hạng
              </div>
              <div class="text-[11px] text-slate-500 mt-1">Xuất điểm số cá nhân và thứ hạng đội.</div>
            </button>
          </div>
        </div>

        <!-- [7.7] CHỐT GIẢI & ĐÓNG BĂNG SỐ LIỆU -->
        <div id="section-7-7" class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_4px_25px_rgb(0,0,0,0.03)] space-y-4">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-100 text-rose-800">[7.7] Vòng Đời & Đóng Băng</span>
              <h3 class="text-base font-extrabold text-slate-900 mt-1">Chốt Giải Đấu & Khóa Số Liệu Bất Biến</h3>
            </div>
            <div class="flex items-center gap-2">
              <button onclick="changeLifecycle('running')" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition">
                Chạy giải (Running)
              </button>
              <button onclick="changeLifecycle('paused')" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition">
                Tạm dừng (Paused)
              </button>
              <button onclick="changeLifecycle('closed')" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#18181B] hover:bg-slate-800 text-white shadow-sm transition">
                Chốt & Đóng Băng (Closed)
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 8: [8.0] HỆ THỐNG TOÀN SÀN (SUPER ADMIN PORTAL) -->
      <div id="tab-admin" class="tab-content max-w-4xl mx-auto space-y-6">
        <!-- Sub-nav Breadcrumb Bar -->
        <div class="flex items-center gap-2 overflow-x-auto no-scrollbar text-xs pb-1">
          <span class="text-slate-400 font-bold shrink-0">Chức năng:</span>
          <button onclick="goToScreen('8.1')" class="px-2.5 py-1 rounded-xl bg-white border border-slate-200/80 font-bold text-slate-700 hover:text-[#FF5B26] transition shrink-0">[8.1] Strava API Quota</button>
          <button onclick="goToScreen('8.2')" class="px-2.5 py-1 rounded-xl bg-white border border-slate-200/80 font-bold text-slate-700 hover:text-[#FF5B26] transition shrink-0">[8.2] Webhook Queue</button>
          <button onclick="goToScreen('8.3')" class="px-2.5 py-1 rounded-xl bg-white border border-slate-200/80 font-bold text-slate-700 hover:text-[#FF5B26] transition shrink-0">[8.3] Quản lý Tenants</button>
          <button onclick="goToScreen('8.4')" class="px-2.5 py-1 rounded-xl bg-orange-50 border border-orange-200 font-bold text-[#FF5B26] transition shrink-0">[8.4] Recompute Toàn Sàn</button>
        </div>

        <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_4px_25px_rgb(0,0,0,0.03)] space-y-5">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-100 text-[#FF5B26]">[8.0] Super Admin</span>
              <h3 class="text-base font-extrabold text-slate-900 mt-1">Giám Sát Hạ Tầng & Vận Hành Lõi Toàn Hệ Thống</h3>
            </div>
            <button onclick="recalculateAllAdmin()" class="px-4 py-2 rounded-xl bg-[#18181B] hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5">
              <span>⚡</span> [8.4] Tính Toán Lại Toàn Bộ
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div id="section-8-1" class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div class="font-bold text-slate-800">[8.1] Strava API Quota (Token Bucket)</div>
              <div class="text-emerald-600 font-mono font-bold text-sm mt-1">124 / 600 req (15-min)</div>
              <div class="text-[10px] text-slate-400">Daily: 3,450 / 30,000 req (An toàn)</div>
            </div>
            <div id="section-8-2" class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div class="font-bold text-slate-800">[8.2] Webhook Ingestion & DLQ</div>
              <div class="text-slate-900 font-mono font-bold text-sm mt-1">0 pending • 1,420 events OK</div>
              <div class="text-[10px] text-emerald-600 font-bold">Dead-letter queue: Trống ✓</div>
            </div>
            <div id="section-8-3" class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div class="font-bold text-slate-800">[8.3] Quản Lý Tenant / CLB</div>
              <div class="text-slate-900 font-mono font-bold text-sm mt-1">1 CLB Active • 48 VĐV</div>
              <div class="text-[10px] text-slate-400">Gói SaaS: Enterprise Unlimited</div>
            </div>
          </div>
        </div>
      </div>
      `;

content = content.substring(0, startIndex) + newTabsHtml + content.substring(endIndex);

fs.writeFileSync(mainPath, content, 'utf8');
console.log('Successfully replaced Tabs 5-8 with dedicated 32-screen system!');

