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
// 5. GENERATE TAB 6: QUẢN TRỊ CLB (CLUB MANAGE)
// ==========================================
const tabClubManageHtml = `
      <div id="tab-club-manage" class="tab-content max-w-5xl mx-auto space-y-5">
        <!-- Sub-navigation Pills for Tab 6 -->
        <div class="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
          <span class="text-slate-400 font-bold shrink-0">Chức năng:</span>
          <button onclick="showSubScreen('club-manage', 'section-6-1')" data-section="section-6-1" class="subscreen-pill px-3 py-1.5 rounded-xl font-bold transition shrink-0 bg-[#FF5B26] text-white shadow-sm">Cài đặt CLB & VietQR</button>
          <button onclick="showSubScreen('club-manage', 'section-6-2')" data-section="section-6-2" class="subscreen-pill px-3 py-1.5 rounded-xl font-bold transition shrink-0 bg-white border border-slate-200/80 text-slate-700 hover:text-[#FF5B26]">Quản trị thành viên</button>
          <button onclick="showSubScreen('club-manage', 'section-6-3')" data-section="section-6-3" class="subscreen-pill px-3 py-1.5 rounded-xl font-bold transition shrink-0 bg-white border border-slate-200/80 text-slate-700 hover:text-[#FF5B26]">Quản lý mã mời</button>
          <button onclick="showSubScreen('club-manage', 'section-6-4')" data-section="section-6-4" class="subscreen-pill px-3 py-1.5 rounded-xl font-bold transition shrink-0 bg-white border border-slate-200/80 text-slate-700 hover:text-[#FF5B26]">Nhận diện Đội Trưởng</button>
        </div>

        <!-- [SCREEN 6.1] CÀI ĐẶT CLB & CẤU HÌNH VIETQR BIN -->
        <div id="section-6-1" class="sub-screen-container block space-y-5">
          ${makeStandardHeader(
            'Quản Trị CLB',
            'Cài Đặt CLB & VietQR',
            'Cập nhật tên CLB, slogan đại diện, thông tin tài khoản ngân hàng thụ hưởng quỹ giải đấu',
            '<span class="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200">Club Settings</span>'
          )}

          <!-- Settings Form Card -->
          <div class="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_4px_25px_rgb(0,0,0,0.03)] space-y-6">
            <div class="space-y-4 text-xs">
              <div>
                <label class="block text-slate-600 font-bold mb-1">Tên Câu Lạc Bộ:</label>
                <input type="text" id="club-edit-name" value="CLB Chạy Bộ SARC (Sáng Ánh Rạng Chiều)" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-orange-500 shadow-sm">
              </div>
              <div>
                <label class="block text-slate-600 font-bold mb-1">Khẩu hiệu / Slogan chính thức:</label>
                <input type="text" id="club-edit-slogan" value="Chạy Với Niềm Vui - Về Đích Cùng Đồng Đội" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-orange-500 shadow-sm">
              </div>
              <div>
                <label class="block text-slate-600 font-bold mb-1">Giới thiệu ngắn về CLB:</label>
                <textarea id="club-edit-desc" rows="2" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-orange-500 shadow-sm">Cộng đồng chạy bộ rèn luyện sức khỏe, kỷ luật và kết nối tương trợ lẫn nhau trên mọi cung đường.</textarea>
              </div>

              <!-- Banking Config -->
              <div class="pt-2 border-t border-slate-100 space-y-3">
                <div class="font-bold text-slate-800">Cấu Hình Tài Khoản Thu Quỹ VietQR</div>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label class="block text-slate-500 font-semibold mb-1">Ngân hàng thụ hưởng (BIN):</label>
                    <select id="club-edit-bankbin" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-orange-500 shadow-sm">
                      <option value="970407" selected>Techcombank (970407)</option>
                      <option value="970415">VietinBank (970415)</option>
                      <option value="970436">Vietcombank (970436)</option>
                      <option value="970422">MB Bank (970422)</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-slate-500 font-semibold mb-1">Số tài khoản nhận quỹ:</label>
                    <input type="text" id="club-edit-bankacc" value="1903688899901" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-orange-500 shadow-sm">
                  </div>
                  <div>
                    <label class="block text-slate-500 font-semibold mb-1">Tên chủ tài khoản:</label>
                    <input type="text" id="club-edit-bankname" value="CLB CHAY BO SARC" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-orange-500 shadow-sm">
                  </div>
                </div>
              </div>
            </div>

            <div class="pt-2 flex justify-end">
              <button onclick="saveClubSettings()" class="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#FF5B26] hover:bg-[#e04800] text-white shadow-sm transition">
                Lưu Cài Đặt CLB
              </button>
            </div>
          </div>
        </div>

        <!-- [SCREEN 6.2] QUẢN TRỊ THÀNH VIÊN & PHÂN QUYỀN CLB -->
        <div id="section-6-2" class="sub-screen-container hidden space-y-5">
          ${makeStandardHeader(
            'Quản Trị CLB',
            'Quản Trị Thành Viên',
            'Danh sách quản trị toàn bộ thành viên CLB: Thêm mới, phân quyền Admin/Member/Captain, khóa thành viên',
            '<span class="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200">Phân Quyền</span>',
            `<button onclick="openAddMemberModal()" class="px-4 py-2 rounded-xl text-xs font-bold bg-[#FF5B26] hover:bg-[#e04800] text-white shadow-sm transition flex items-center gap-1.5">
               <span>+</span> Thêm Thành Viên
             </button>`
          )}

          <!-- Members Management Card -->
          <div class="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_4px_25px_rgb(0,0,0,0.03)] space-y-5">
            <!-- Filter Toolbar -->
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div class="relative flex-1">
                <input type="text" id="admin-member-search" oninput="filterAdminMemberList(this.value)" placeholder="Tìm kiếm theo tên, email hoặc BIB..." class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none">
                <span class="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
              </div>
              <div class="shrink-0 flex items-center gap-2">
                <span class="text-xs text-slate-400 font-semibold">Vai trò:</span>
                <select id="admin-role-filter" onchange="filterAdminMemberList('')" class="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-orange-500 shadow-sm">
                  <option value="all">Tất cả vai trò</option>
                  <option value="ADMIN">Ban Cán Sự (Admin)</option>
                  <option value="CAPTAIN">Đội Trưởng (Captain)</option>
                  <option value="RUNNER">Vận Động Viên (Runner)</option>
                </select>
              </div>
            </div>

            <!-- Member Roster Table -->
            <div class="overflow-x-auto rounded-2xl border border-slate-200">
              <table class="w-full text-xs text-left">
                <thead class="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th class="py-3 px-4">Thành Viên</th>
                    <th class="py-3 px-4">Vai Trò</th>
                    <th class="py-3 px-4">Đội Thi</th>
                    <th class="py-3 px-4">Trạng Thái</th>
                    <th class="py-3 px-4 text-center">Thao Tác</th>
                  </tr>
                </thead>
                <tbody id="admin-members-tbody" class="divide-y divide-slate-100">
                  <!-- Rendered dynamically by JS -->
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- [SCREEN 6.3] QUẢN LÝ MÃ MỜI & HẠN DÙNG -->
        <div id="section-6-3" class="sub-screen-container hidden space-y-5">
          ${makeStandardHeader(
            'Quản Trị CLB',
            'Quản Lý Mã Mời',
            'Tạo và kiểm soát mã mời gia nhập CLB có giới hạn số lượt sử dụng và thời hạn hiệu lực',
            '<span class="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">Invite Codes</span>'
          )}

          <!-- Invite Codes Card -->
          <div class="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_4px_25px_rgb(0,0,0,0.03)] space-y-5">
            <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div>
                <div class="font-bold text-slate-800">Tạo Mã Mời Mới Cho CLB</div>
                <div class="text-slate-500">Giới hạn số lượng thành viên tham gia hoặc đặt thời hạn hết hạn</div>
              </div>
              <button onclick="createClubInviteCode()" class="px-4 py-2 bg-[#FF5B26] hover:bg-[#e04800] text-white font-bold rounded-xl text-xs shadow-sm transition">
                + Sinh Mã Mời Mới
              </button>
            </div>

            <div class="overflow-x-auto rounded-2xl border border-slate-200 text-xs">
              <table class="w-full text-left">
                <thead class="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th class="py-3 px-4">Mã Mời</th>
                    <th class="py-3 px-4">Đội Gán</th>
                    <th class="py-3 px-4">Đã Dùng / Giới Hạn</th>
                    <th class="py-3 px-4">Hạn Dùng</th>
                    <th class="py-3 px-4">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr>
                    <td class="py-3 px-4 font-mono font-bold text-slate-800">SARC-SPRING-2026</td>
                    <td class="py-3 px-4">Chung CLB</td>
                    <td class="py-3 px-4 font-mono">18 / 50 lượt</td>
                    <td class="py-3 px-4">31/12/2026</td>
                    <td class="py-3 px-4"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Hoạt động</span></td>
                  </tr>
                  <tr>
                    <td class="py-3 px-4 font-mono font-bold text-slate-800">PHX-JOIN-88</td>
                    <td class="py-3 px-4">Team Phoenix</td>
                    <td class="py-3 px-4 font-mono">16 / 16 lượt (Đầy)</td>
                    <td class="py-3 px-4">30/11/2026</td>
                    <td class="py-3 px-4"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">Đã khóa</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- [SCREEN 6.4] NHẬN DIỆN ĐỘI TRƯỞNG & TÙY BIẾN ĐỘI THI -->
        <div id="section-6-4" class="sub-screen-container hidden space-y-5">
          ${makeStandardHeader(
            'Quản Trị CLB',
            'Nhận Diện Đội Trưởng',
            'Đội trưởng tự do tùy biến Tên đội, Ảnh đại diện (Avatar), và Khẩu hiệu (Slogan) truyền cảm hứng',
            '<span class="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-orange-100 text-[#FF5B26] border border-orange-200">Tùy Biến Đội</span>'
          )}

          <!-- Team Leader Identity Card -->
          <div class="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_4px_25px_rgb(0,0,0,0.03)] space-y-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label class="block text-slate-600 font-bold mb-1">Tên Đội Thi Đấu:</label>
                <input type="text" id="team-identity-name" value="Team Phoenix SARC" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-orange-500 shadow-sm">
              </div>
              <div>
                <label class="block text-slate-600 font-bold mb-1">Ảnh Đại Diện Đội (Avatar URL):</label>
                <input type="text" id="team-identity-avatar" value="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-orange-500 shadow-sm">
              </div>
              <div class="sm:col-span-2">
                <label class="block text-slate-600 font-bold mb-1">Khẩu Hiệu / Slogan Tiếp Lửa Đội:</label>
                <input type="text" id="team-identity-slogan" value="Bứt phá giới hạn - Chinh phục đường đua" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-orange-500 shadow-sm">
              </div>
            </div>

            <div class="flex justify-end pt-2 border-t border-slate-100">
              <button onclick="saveTeamIdentity()" class="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#FF5B26] hover:bg-[#e04800] text-white shadow-sm transition">
                Lưu Nhận Diện Đội Thi
              </button>
            </div>
          </div>
        </div>
      </div>
`;

// ==========================================
// 6. GENERATE TAB 7: ĐIỀU HÀNH GIẢI ĐẤU (RULES)
// ==========================================
const tabRulesHtml = `
      <div id="tab-rules" class="tab-content max-w-5xl mx-auto space-y-5">
        <!-- Sub-navigation Pills for Tab 7 -->
        <div class="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
          <span class="text-slate-400 font-bold shrink-0">Chức năng:</span>
          <button onclick="showSubScreen('rules', 'section-7-1')" data-section="section-7-1" class="subscreen-pill px-3 py-1.5 rounded-xl font-bold transition shrink-0 bg-[#FF5B26] text-white shadow-sm">Thiết lập giải & Wizard</button>
          <button onclick="showSubScreen('rules', 'section-7-2')" data-section="section-7-2" class="subscreen-pill px-3 py-1.5 rounded-xl font-bold transition shrink-0 bg-white border border-slate-200/80 text-slate-700 hover:text-[#FF5B26]">Phân bổ đội & Đội trưởng</button>
          <button onclick="showSubScreen('rules', 'section-7-3')" data-section="section-7-3" class="subscreen-pill px-3 py-1.5 rounded-xl font-bold transition shrink-0 bg-white border border-slate-200/80 text-slate-700 hover:text-[#FF5B26]">Phê duyệt khiếu nại</button>
          <button onclick="showSubScreen('rules', 'section-7-4')" data-section="section-7-4" class="subscreen-pill px-3 py-1.5 rounded-xl font-bold transition shrink-0 bg-white border border-slate-200/80 text-slate-700 hover:text-[#FF5B26]">Miễn trừ phạt tuần</button>
          <button onclick="showSubScreen('rules', 'section-7-5')" data-section="section-7-5" class="subscreen-pill px-3 py-1.5 rounded-xl font-bold transition shrink-0 bg-white border border-slate-200/80 text-slate-700 hover:text-[#FF5B26]">Quản lý quỹ & VietQR</button>
          <button onclick="showSubScreen('rules', 'section-7-6')" data-section="section-7-6" class="subscreen-pill px-3 py-1.5 rounded-xl font-bold transition shrink-0 bg-white border border-slate-200/80 text-slate-700 hover:text-[#FF5B26]">Xuất dữ liệu báo cáo</button>
          <button onclick="showSubScreen('rules', 'section-7-7')" data-section="section-7-7" class="subscreen-pill px-3 py-1.5 rounded-xl font-bold transition shrink-0 bg-white border border-slate-200/80 text-slate-700 hover:text-[#FF5B26]">Chốt giải & Đóng băng</button>
        </div>

        <!-- [SCREEN 7.1] THIẾT LẬP GIẢI ĐẤU & WIZARD THỂ LỆ (KHÓA SÀN 2:45) -->
        <div id="section-7-1" class="sub-screen-container block space-y-5">
          ${makeStandardHeader(
            'Điều Hành Giải',
            'Thiết Lập Giải & Wizard',
            'Trình hướng dẫn thiết lập giải: Tên giải, ngày bắt đầu/kết thúc, 3 phạm vi (Nội bộ, Cộng đồng, Chỉ định) và khóa sàn 2:45',
            '<span class="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-orange-100 text-[#FF5B26] border border-orange-200">Rule Wizard</span>',
            `<button onclick="openRaceWizardModal()" class="px-4 py-2 rounded-xl text-xs font-bold bg-[#FF5B26] hover:bg-[#e04800] text-white shadow-sm transition flex items-center gap-1.5">
               <span>⚡</span> Mở Wizard Thiết Lập Giải
             </button>`
          )}

          <!-- Rule Wizard Summary & Simulator Card -->
          <div class="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_4px_25px_rgb(0,0,0,0.03)] space-y-6">
            <!-- Active Rule Parameters Matrix -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span class="text-slate-400 block text-[10px] uppercase font-bold">Cự Ly Tối Thiểu</span>
                <strong class="text-slate-900 font-mono text-sm">3.0 km / bài</strong>
              </div>
              <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span class="text-slate-400 block text-[10px] uppercase font-bold">Khoảng Pace Hợp Lệ</span>
                <strong class="text-slate-900 font-mono text-sm">4:00 - 10:00 /km</strong>
              </div>
              <div class="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-100">
                <span class="text-rose-500 block text-[10px] uppercase font-bold">Khóa Sàn Tuyệt Đối</span>
                <strong class="text-rose-700 font-mono text-sm">2:45 min/km</strong>
              </div>
              <div class="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100">
                <span class="text-purple-500 block text-[10px] uppercase font-bold">Thưởng Dốc Trail</span>
                <strong class="text-purple-700 font-mono text-sm">+1.0 km / 100m D+</strong>
              </div>
            </div>

            <!-- Rule Simulator Embedded in Screen 7.1 -->
            <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div class="flex items-center justify-between">
                <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wider">Bộ Thẩm Định Thể Lệ Trực Quan (Rule Simulator)</h4>
                <span class="text-[10px] text-slate-400 font-mono">Độc lập kiểm thử</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label class="block text-slate-500 font-semibold mb-1">Cự ly thực tế (km)</label>
                  <input type="number" id="sim-dist" value="5.0" step="0.1" class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-orange-500 shadow-sm">
                </div>
                <div>
                  <label class="block text-slate-500 font-semibold mb-1">Thời gian chạy (phút)</label>
                  <input type="number" id="sim-time" value="27.5" step="0.5" class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-orange-500 shadow-sm">
                </div>
                <div>
                  <label class="block text-slate-500 font-semibold mb-1">Độ cao D+ (mét)</label>
                  <input type="number" id="sim-gain" value="40" step="10" class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-orange-500 shadow-sm">
                </div>
              </div>
              <div>
                <button onclick="runSimulation()" class="px-5 py-2 rounded-xl text-xs font-bold bg-[#FF5B26] hover:bg-[#e04800] text-white shadow-sm transition">
                  Chạy Mô Phỏng Thẩm Định
                </button>
              </div>
              <div id="sim-result" class="hidden p-4 rounded-2xl border text-xs"></div>
            </div>
          </div>
        </div>

        <!-- [SCREEN 7.2] PHÂN BỔ ĐỘI THI & BỔ NHIỆM ĐỘI TRƯỞNG -->
        <div id="section-7-2" class="sub-screen-container hidden space-y-5">
          ${makeStandardHeader(
            'Điều Hành Giải',
            'Phân Bổ Đội & Đội Trưởng',
            'Phân bổ VĐV vào các đội thi đấu trong giải, chỉ định đội trưởng phụ trách tiếp lửa và quản lý',
            '<span class="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200">Đội Thi</span>'
          )}

          <!-- Team Allocation Card -->
          <div class="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_4px_25px_rgb(0,0,0,0.03)] space-y-5">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div class="p-4 rounded-2xl bg-orange-50/60 border border-orange-200 space-y-2">
                <div class="flex items-center justify-between font-bold text-slate-800">
                  <span>Team Phoenix SARC</span>
                  <span class="text-orange-600 font-mono">16/16 (Đầy)</span>
                </div>
                <div class="text-slate-600">Đội trưởng: <strong class="text-slate-900">Nguyễn Văn A</strong></div>
                <button class="w-full py-1.5 rounded-xl bg-white border border-slate-200 font-bold text-slate-700 hover:border-orange-500 transition">Đổi Đội Trưởng</button>
              </div>

              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div class="flex items-center justify-between font-bold text-slate-800">
                  <span>Team Dragons SARC</span>
                  <span class="text-emerald-600 font-mono">15/16 (Còn 1)</span>
                </div>
                <div class="text-slate-600">Đội trưởng: <strong class="text-slate-900">Trần Quốc Tuấn</strong></div>
                <button class="w-full py-1.5 rounded-xl bg-white border border-slate-200 font-bold text-slate-700 hover:border-orange-500 transition">Đổi Đội Trưởng</button>
              </div>

              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div class="flex items-center justify-between font-bold text-slate-800">
                  <span>Team Tigers SARC</span>
                  <span class="text-slate-600 font-mono">16/16 (Đầy)</span>
                </div>
                <div class="text-slate-600">Đội trưởng: <strong class="text-slate-900">Lê Thu Thảo</strong></div>
                <button class="w-full py-1.5 rounded-xl bg-white border border-slate-200 font-bold text-slate-700 hover:border-orange-500 transition">Đổi Đội Trưởng</button>
              </div>
            </div>
          </div>
        </div>

        <!-- [SCREEN 7.3] PHÊ DUYỆT KHIẾU NẠI & CỘNG BÙ KM -->
        <div id="section-7-3" class="sub-screen-container hidden space-y-5">
          ${makeStandardHeader(
            'Điều Hành Giải',
            'Phê Duyệt Khiếu Nại',
            'Ban tổ chức thẩm tra bằng chứng bài chạy bị lỗi, duyệt khiếu nại và tự động cộng bù cự ly vào bảng xếp hạng',
            '<span class="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-50 text-amber-800 border border-amber-200">Xét Duyệt</span>'
          )}

          <!-- Appeals Review Card -->
          <div class="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_4px_25px_rgb(0,0,0,0.03)] space-y-5">
            <div id="admin-appeals-container" class="space-y-3">
              <!-- Rendered by JS adminAppeals -->
            </div>
          </div>
        </div>

        <!-- [SCREEN 7.4] MIỄN TRỪ PHẠT TUẦN (PENALTY WAIVER) -->
        <div id="section-7-4" class="sub-screen-container hidden space-y-5">
          ${makeStandardHeader(
            'Điều Hành Giải',
            'Miễn Trừ Phạt Tuần',
            'Miễn trừ phạt thiếu cự ly cho VĐV có lý do chính đáng (chấn thương, công tác xa, lỗi đồng bộ thiết bị)',
            '<span class="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">Waivers</span>'
          )}

          <!-- Waiver Form & History Card -->
          <div class="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_4px_25px_rgb(0,0,0,0.03)] space-y-6">
            <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <div class="font-bold text-slate-800">Cấp Quyền Miễn Trừ Phạt Tuần Cho VĐV</div>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label class="block text-slate-500 font-semibold mb-1">Vận Động Viên:</label>
                  <select id="waiver-user-select" class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-orange-500 shadow-sm">
                    <option value="user-01">Nguyễn Văn A (Phoenix)</option>
                    <option value="user-02">Trần Quốc Tuấn (Dragons)</option>
                  </select>
                </div>
                <div>
                  <label class="block text-slate-500 font-semibold mb-1">Lý Do Miễn Trừ:</label>
                  <input type="text" id="waiver-reason" value="Chấn thương cổ chân có xác nhận y tế" class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-orange-500 shadow-sm">
                </div>
                <div class="flex items-end">
                  <button onclick="adminGrantWaiver()" class="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm transition">
                    Xác Nhận Miễn Phạt
                  </button>
                </div>
              </div>
            </div>

            <!-- Active Waivers Table -->
            <div class="space-y-3">
              <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wider">Danh Sách Miễn Trừ Đã Phê Duyệt</h4>
              <div class="overflow-x-auto rounded-2xl border border-slate-200 text-xs">
                <table class="w-full text-left">
                  <thead class="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <tr>
                      <th class="py-3 px-4">VĐV</th>
                      <th class="py-3 px-4">Lý Do Miễn Trừ</th>
                      <th class="py-3 px-4">Người Phê Duyệt</th>
                      <th class="py-3 px-4">Trạng Thái</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    <tr>
                      <td class="py-3 px-4 font-bold text-slate-800">Hoàng Văn Minh</td>
                      <td class="py-3 px-4 text-slate-600">Công tác nước ngoài lệch múi giờ</td>
                      <td class="py-3 px-4 font-mono text-slate-500">Admin</td>
                      <td class="py-3 px-4"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Đã miễn 50.000đ</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- [SCREEN 7.5] QUẢN LÝ QUỸ GIẢI ĐẤU & ĐỐI SOÁT ĐÓNG TIỀN VIETQR -->
        <div id="section-7-5" class="sub-screen-container hidden space-y-5">
          ${makeStandardHeader(
            'Điều Hành Giải',
            'Quản Lý Quỹ & VietQR',
            'Theo dõi số dư quỹ, danh sách VĐV có nghĩa vụ nộp phạt và đối soát chuyển khoản ngân hàng',
            '<span class="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">Sổ Cái Quỹ</span>'
          )}

          <!-- Financial Settlements Card -->
          <div class="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_4px_25px_rgb(0,0,0,0.03)] space-y-5">
            <div id="admin-finance-container" class="space-y-2.5">
              <!-- Dynamic via JS renderAdminFinance() -->
            </div>
          </div>
        </div>

        <!-- [SCREEN 7.6] XUẤT BÁO CÁO DỮ LIỆU TOÀN DIỆN (CSV/EXCEL) -->
        <div id="section-7-6" class="sub-screen-container hidden space-y-5">
          ${makeStandardHeader(
            'Điều Hành Giải',
            'Xuất Dữ Liệu Báo Cáo',
            'Tải xuống toàn bộ dữ liệu bài chạy, kết quả xếp hạng đội và lịch sử đóng quỹ phục vụ lưu trữ',
            '<span class="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200">Export CSV</span>'
          )}

          <!-- Export Options Card -->
          <div class="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_4px_25px_rgb(0,0,0,0.03)] space-y-5">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div class="font-bold text-slate-800">Dữ Liệu Bài Chạy (Activities)</div>
                <p class="text-slate-500">Toàn bộ bài chạy, pace, thời gian, cự ly và trạng thái thẩm định.</p>
                <button onclick="exportActivitiesCsv()" class="w-full py-2 bg-[#FF5B26] hover:bg-[#e04800] text-white font-bold rounded-xl shadow-sm transition">
                  Xuất File CSV Bài Chạy
                </button>
              </div>

              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div class="font-bold text-slate-800">Bảng Xếp Hạng Đội & Điểm Số</div>
                <p class="text-slate-500">Điểm tổng hợp 50/50, tỷ lệ cự ly và số ngày chuyên cần của các đội.</p>
                <button onclick="exportActivitiesCsv()" class="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl shadow-sm transition">
                  Xuất Xếp Hạng Đội
                </button>
              </div>

              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div class="font-bold text-slate-800">Sổ Thu Chi Quỹ Giải</div>
                <p class="text-slate-500">Đối soát nghĩa vụ đóng quỹ, phạt thiếu tuần và trạng thái thanh toán.</p>
                <button onclick="exportActivitiesCsv()" class="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl shadow-sm transition">
                  Xuất Sổ Cái Quỹ
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- [SCREEN 7.7] CHỐT GIẢI & ĐÓNG BĂNG THÀNH TÍCH -->
        <div id="section-7-7" class="sub-screen-container hidden space-y-5">
          ${makeStandardHeader(
            'Điều Hành Giải',
            'Chốt Giải & Đóng Băng',
            'Kiểm soát trạng thái giải đấu: Kích hoạt (ACTIVE), Tạm dừng bảo trì (PAUSED) hoặc Đóng băng kết quả chung cuộc (FROZEN/CLOSED)',
            '<span class="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-50 text-rose-700 border border-rose-200">Lifecycle Control</span>'
          )}

          <!-- Lifecycle Control Card -->
          <div class="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_4px_25px_rgb(0,0,0,0.03)] space-y-5">
            <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
              <div>
                <div class="font-bold text-slate-900">Trạng Thái Giải Đấu Hiện Tại: <span class="text-emerald-600 font-mono">ĐANG CHẠY (RUNNING)</span></div>
                <div class="text-slate-500">Chuyển đổi trạng thái giải để phục vụ bảo trì hoặc tổng kết trao giải chung cuộc</div>
              </div>
              <div class="flex items-center gap-2">
                <button onclick="changeLifecycle('paused')" class="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-sm transition">
                  Tạm Dừng (PAUSE)
                </button>
                <button onclick="changeLifecycle('running')" class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition">
                  Kích Hoạt (RESUME)
                </button>
                <button onclick="changeLifecycle('closed')" class="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-sm transition">
                  Đóng Băng & Chốt Giải
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
`;

// ==========================================
// 7. GENERATE TAB 8: HỆ THỐNG TOÀN SÀN (ADMIN)
// ==========================================
const tabAdminHtml = `
      <div id="tab-admin" class="tab-content max-w-5xl mx-auto space-y-5">
        <!-- Sub-navigation Pills for Tab 8 -->
        <div class="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
          <span class="text-slate-400 font-bold shrink-0">Chức năng:</span>
          <button onclick="showSubScreen('admin', 'section-8-1')" data-section="section-8-1" class="subscreen-pill px-3 py-1.5 rounded-xl font-bold transition shrink-0 bg-[#FF5B26] text-white shadow-sm">Strava API Quota</button>
          <button onclick="showSubScreen('admin', 'section-8-2')" data-section="section-8-2" class="subscreen-pill px-3 py-1.5 rounded-xl font-bold transition shrink-0 bg-white border border-slate-200/80 text-slate-700 hover:text-[#FF5B26]">Webhook Queue & DLQ</button>
          <button onclick="showSubScreen('admin', 'section-8-3')" data-section="section-8-3" class="subscreen-pill px-3 py-1.5 rounded-xl font-bold transition shrink-0 bg-white border border-slate-200/80 text-slate-700 hover:text-[#FF5B26]">Quản lý Tenants CLB</button>
          <button onclick="showSubScreen('admin', 'section-8-4')" data-section="section-8-4" class="subscreen-pill px-3 py-1.5 rounded-xl font-bold transition shrink-0 bg-white border border-slate-200/80 text-slate-700 hover:text-[#FF5B26]">Recompute Toàn Sàn</button>
        </div>

        <!-- [SCREEN 8.1] GIÁM SÁT HẠN MỨC STRAVA API QUOTA -->
        <div id="section-8-1" class="sub-screen-container block space-y-5">
          ${makeStandardHeader(
            'Hệ Thống Toàn Sàn',
            'Strava API Quota',
            'Theo dõi thời gian thực hạn mức 600 req/15 phút và 30,000 req/ngày từ Strava API Developer Console',
            '<span class="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">Token Bucket: An Toàn</span>'
          )}

          <div class="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_4px_25px_rgb(0,0,0,0.03)] space-y-5">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div class="font-bold text-slate-800">Cửa sổ 15 Phút (Rate Limit)</div>
                <div class="text-emerald-600 font-mono font-black text-xl">124 / 600 requests</div>
                <div class="w-full bg-slate-200 rounded-full h-2">
                  <div class="bg-emerald-500 h-2 rounded-full" style="width: 20%"></div>
                </div>
                <div class="text-[10px] text-slate-400">Tỷ lệ sử dụng: 20.6% (Ngưỡng an toàn)</div>
              </div>

              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div class="font-bold text-slate-800">Hạn Mức Hàng Ngày (Daily Limit)</div>
                <div class="text-emerald-600 font-mono font-black text-xl">3,450 / 30,000 requests</div>
                <div class="w-full bg-slate-200 rounded-full h-2">
                  <div class="bg-emerald-500 h-2 rounded-full" style="width: 11.5%"></div>
                </div>
                <div class="text-[10px] text-slate-400">Tỷ lệ sử dụng: 11.5% (Ngưỡng an toàn)</div>
              </div>
            </div>
          </div>
        </div>

        <!-- [SCREEN 8.2] HÀNG ĐỢI WEBHOOK & XỬ LÝ DEAD-LETTER QUEUE -->
        <div id="section-8-2" class="sub-screen-container hidden space-y-5">
          ${makeStandardHeader(
            'Hệ Thống Toàn Sàn',
            'Webhook Queue & DLQ',
            'Kiểm soát đường ống tiếp nhận webhook Strava: Tốc độ xử lý < 200ms, hàng đợi chờ và DLQ khi gặp sự cố',
            '<span class="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">DLQ: Trống ✓</span>'
          )}

          <div class="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_4px_25px_rgb(0,0,0,0.03)] space-y-5">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <span class="text-slate-400 block text-[10px] uppercase font-bold">Hàng Đợi Chờ Xử Lý</span>
                <strong class="text-2xl font-black font-mono text-slate-900 mt-1">0 pending</strong>
              </div>
              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <span class="text-slate-400 block text-[10px] uppercase font-bold">Sự Kiện Đã Xử Lý</span>
                <strong class="text-2xl font-black font-mono text-emerald-600 mt-1">1,420 events OK</strong>
              </div>
              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <span class="text-slate-400 block text-[10px] uppercase font-bold">Dead-Letter Queue</span>
                <strong class="text-2xl font-black font-mono text-slate-900 mt-1">0 lỗi</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- [SCREEN 8.3] QUẢN LÝ ĐA KHÁCH HÀNG (MULTI-TENANT) -->
        <div id="section-8-3" class="sub-screen-container hidden space-y-5">
          ${makeStandardHeader(
            'Hệ Thống Toàn Sàn',
            'Quản Lý Tenants CLB',
            'Cấu hình các tenant/CLB trên nền tảng SaaS OpenRace: Gói đăng ký, giới hạn VĐV và phân vùng dữ liệu',
            '<span class="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200">SaaS Multi-Tenant</span>'
          )}

          <div class="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_4px_25px_rgb(0,0,0,0.03)] space-y-5">
            <div class="overflow-x-auto rounded-2xl border border-slate-200 text-xs">
              <table class="w-full text-left">
                <thead class="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th class="py-3 px-4">Tên Tenant / CLB</th>
                    <th class="py-3 px-4">Gói SaaS</th>
                    <th class="py-3 px-4">Số VĐV</th>
                    <th class="py-3 px-4">Database Tenant ID</th>
                    <th class="py-3 px-4">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr>
                    <td class="py-3 px-4 font-bold text-slate-900">CLB Chạy Bộ SARC</td>
                    <td class="py-3 px-4"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">Enterprise Unlimited</span></td>
                    <td class="py-3 px-4 font-mono">48 / Không giới hạn</td>
                    <td class="py-3 px-4 font-mono text-slate-500">tenant-sarc-prod-01</td>
                    <td class="py-3 px-4"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Active ✓</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- [SCREEN 8.4] TÍNH TOÁN LẠI TOÀN SÀN (RECOMPUTE & REPLAY) -->
        <div id="section-8-4" class="sub-screen-container hidden space-y-5">
          ${makeStandardHeader(
            'Hệ Thống Toàn Sàn',
            'Recompute Toàn Sàn',
            'Tính toán lại toàn bộ điểm số, thứ hạng và sổ nợ cho mọi VĐV khi điều chỉnh thể lệ hoặc cập nhật trọng số',
            '<span class="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-orange-100 text-[#FF5B26] border border-orange-200">Batch Engine</span>',
            `<button onclick="recalculateAllAdmin()" class="px-5 py-2.5 rounded-xl bg-[#18181B] hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5">
               <span>⚡</span> Tính Toán Lại Toàn Bộ
             </button>`
          )}

          <div class="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_4px_25px_rgb(0,0,0,0.03)] space-y-5">
            <div class="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-2">
              <div class="font-bold flex items-center gap-1.5">
                <span>⚠️</span> Cảnh báo vận hành hệ thống:
              </div>
              <p>Chức năng này sẽ duyệt lại toàn bộ các bài chạy trong cơ sở dữ liệu, áp dụng lại các điều kiện lọc (Pace Floor 2:45, Min Distance 3.0km, Thưởng dốc Trail) và tính lại toàn bộ điểm số các đội theo tỷ lệ 50/50. Chỉ thực hiện khi có thay đổi lớn về thể lệ giải.</p>
            </div>
          </div>
        </div>
      </div>
`;

console.log('All tabs generated cleanly.');
module.exports = {
  tabArenaHtml,
  tabActivitiesHtml,
  tabClubHtml,
  tabFinanceHtml,
  tabClubManageHtml,
  tabRulesHtml,
  tabAdminHtml
};

