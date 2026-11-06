const fs = require('fs');
const path = require('path');

const mainTsPath = path.resolve(__dirname, 'backend/src/main.ts');
let code = fs.readFileSync(mainTsPath, 'utf8');

// Locate the nav inside main-sidebar
const navStart = code.indexOf('<nav class="space-y-4 text-xs">');
const navEnd = code.indexOf('</nav>', navStart) + 6;

if (navStart === -1 || navEnd === -1) {
  console.error('Could not find nav in main-sidebar. navStart:', navStart, 'navEnd:', navEnd);
  process.exit(1);
}

const replacementNav = `<nav class="space-y-3 text-xs">
        <!-- GROUP 1: RUNNER (VẬN ĐỘNG VIÊN) -->
        <div class="px-2 text-[10px] font-extrabold tracking-wider text-slate-400 dark:text-slate-500 uppercase flex items-center justify-between">
          <span>VẬN ĐỘNG VIÊN (RUNNER)</span>
          <span class="text-[9px] text-slate-400">1.0 - 5.0</span>
        </div>

        <!-- [1.0] Tổng Quan Runner -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-3 shadow-sm border border-slate-100 dark:border-slate-700/80">
          <button onclick="switchTab('dashboard')" id="sidebar-dashboard" class="sidebar-btn w-full flex items-center justify-between font-bold text-slate-800 dark:text-slate-100 text-xs mb-1.5 text-left transition">
            <div class="flex items-center gap-1.5">
              <span class="text-orange-500">⊞</span>
              <span>[1.0] Tổng Quan Runner</span>
            </div>
            <span class="text-[10px] text-slate-400">▾</span>
          </button>
          <div class="space-y-1 text-[11px] pl-1.5">
            <a href="javascript:void(0)" onclick="goToSection('dashboard', 'section-1-1')" class="block py-0.5 text-slate-600 dark:text-slate-300 hover:text-[#FF5B26] font-medium transition">• [1.1] Đồng bộ Strava</a>
            <a href="javascript:void(0)" onclick="switchTab('strava-sync')" class="block py-0.5 text-orange-600 font-bold hover:text-orange-700 transition">• [1.B] Quản lý Strava & Sync Logs</a>
            <a href="javascript:void(0)" onclick="goToSection('dashboard', 'section-1-2')" class="block py-0.5 text-slate-600 dark:text-slate-300 hover:text-[#FF5B26] font-medium transition">• [1.2] Chỉ tiêu tuần</a>
            <a href="javascript:void(0)" onclick="goToSection('dashboard', 'section-1-3')" class="block py-0.5 text-rose-600 font-semibold hover:text-rose-700 transition">• [1.3] Cảnh báo phạt sớm</a>
            <a href="javascript:void(0)" onclick="goToSection('dashboard', 'section-1-4')" class="block py-0.5 text-slate-600 dark:text-slate-300 hover:text-[#FF5B26] font-medium transition">• [1.4] Carousel giải đấu</a>
            <a href="javascript:void(0)" onclick="goToSection('dashboard', 'section-1-5')" class="block py-0.5 text-slate-600 dark:text-slate-300 hover:text-[#FF5B26] font-medium transition">• [1.5] Lối tắt quét QR / Vào giải</a>
          </div>
        </div>

        <!-- [2.0] Đấu Trường Giải -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-3 shadow-sm border border-slate-100 dark:border-slate-700/80">
          <button onclick="switchTab('arena')" id="sidebar-arena" class="sidebar-btn w-full flex items-center justify-between font-bold text-slate-800 dark:text-slate-100 text-xs mb-1.5 text-left transition">
            <div class="flex items-center gap-1.5">
              <span class="text-amber-500">🏆</span>
              <span>[2.0] Đấu Trường Giải</span>
            </div>
            <span class="text-[10px] text-slate-400">▾</span>
          </button>
          <div class="space-y-1 text-[11px] pl-1.5">
            <a href="javascript:void(0)" onclick="goToSection('arena', 'section-2-1')" class="block py-0.5 text-slate-600 dark:text-slate-300 hover:text-[#FF5B26] font-medium transition">• [2.1] Hero & Đếm ngược</a>
            <a href="javascript:void(0)" onclick="goToSection('arena', 'section-2-2')" class="block py-0.5 text-slate-600 dark:text-slate-300 hover:text-[#FF5B26] font-medium transition">• [2.2] Bảng xếp hạng Đội</a>
            <a href="javascript:void(0)" onclick="goToSection('arena', 'section-2-3')" class="block py-0.5 text-slate-600 dark:text-slate-300 hover:text-[#FF5B26] font-medium transition">• [2.3] Bảng xếp hạng Cá nhân</a>
            <a href="javascript:void(0)" onclick="goToSection('arena', 'section-2-4')" class="block py-0.5 text-slate-600 dark:text-slate-300 hover:text-[#FF5B26] font-medium transition">• [2.4] Đội thi của tôi</a>
            <a href="javascript:void(0)" onclick="goToSection('arena', 'section-2-5')" class="block py-0.5 text-emerald-600 font-semibold hover:text-emerald-700 transition">• [2.5] Luồng Live Stream SSE</a>
          </div>
        </div>

        <!-- [3.0] Nhật Ký Hoạt Động -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-3 shadow-sm border border-slate-100 dark:border-slate-700/80">
          <button onclick="switchTab('activities')" id="sidebar-activities" class="sidebar-btn w-full flex items-center justify-between font-bold text-slate-800 dark:text-slate-100 text-xs mb-1.5 text-left transition">
            <div class="flex items-center gap-1.5">
              <span class="text-blue-500">📋</span>
              <span>[3.0] Nhật Ký Hoạt Động</span>
            </div>
            <span class="text-[10px] text-slate-400">▾</span>
          </button>
          <div class="space-y-1 text-[11px] pl-1.5">
            <a href="javascript:void(0)" onclick="goToSection('activities', 'section-3-1')" class="block py-0.5 text-slate-600 dark:text-slate-300 hover:text-[#FF5B26] font-medium transition">• [3.1] Toàn bộ bài chạy</a>
            <a href="javascript:void(0)" onclick="goToSection('activities', 'section-3-2')" class="block py-0.5 text-slate-600 dark:text-slate-300 hover:text-[#FF5B26] font-medium transition">• [3.2] Lọc theo giải đấu</a>
            <a href="javascript:void(0)" onclick="goToSection('activities', 'section-3-3')" class="block py-0.5 text-slate-600 dark:text-slate-300 hover:text-[#FF5B26] font-medium transition">• [3.3] Chi tiết thẩm định & Gain</a>
            <a href="javascript:void(0)" onclick="goToSection('activities', 'section-3-4')" class="block py-0.5 text-[#FF5B26] font-semibold transition">• [3.4] Gửi khiếu nại</a>
          </div>
        </div>

        <!-- [4.0] Không Gian CLB -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-3 shadow-sm border border-slate-100 dark:border-slate-700/80">
          <button onclick="switchTab('club')" id="sidebar-club" class="sidebar-btn w-full flex items-center justify-between font-bold text-slate-800 dark:text-slate-100 text-xs mb-1.5 text-left transition">
            <div class="flex items-center gap-1.5">
              <span class="text-purple-500">👥</span>
              <span>[4.0] Không Gian CLB</span>
            </div>
            <span class="text-[10px] text-slate-400">▾</span>
          </button>
          <div class="space-y-1 text-[11px] pl-1.5">
            <a href="javascript:void(0)" onclick="goToSection('club', 'section-4-1')" class="block py-0.5 text-slate-600 dark:text-slate-300 hover:text-[#FF5B26] font-medium transition">• [4.1] Hồ sơ & Bảng tin CLB</a>
            <a href="javascript:void(0)" onclick="goToSection('club', 'section-4-2')" class="block py-0.5 text-slate-600 dark:text-slate-300 hover:text-[#FF5B26] font-medium transition">• [4.2] Danh mục giải CLB</a>
            <a href="javascript:void(0)" onclick="goToSection('club', 'section-4-3')" class="block py-0.5 text-slate-600 dark:text-slate-300 hover:text-[#FF5B26] font-medium transition">• [4.3] Thành viên & Ban cán sự</a>
            <a href="javascript:void(0)" onclick="goToSection('club', 'section-4-4')" class="block py-0.5 text-orange-500 font-semibold hover:text-orange-600 transition">• [4.4] Mời TV (Chống In-App)</a>
          </div>
        </div>

        <!-- [5.0] Cá Nhân & Sổ Nợ -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-3 shadow-sm border border-slate-100 dark:border-slate-700/80">
          <button onclick="switchTab('finance')" id="sidebar-finance" class="sidebar-btn w-full flex items-center justify-between font-bold text-slate-800 dark:text-slate-100 text-xs mb-1.5 text-left transition">
            <div class="flex items-center gap-1.5">
              <span class="text-blue-500">💳</span>
              <span>[5.0] Cá Nhân & Sổ Nợ</span>
            </div>
            <span class="text-[10px] text-slate-400">▾</span>
          </button>
          <div class="space-y-1 text-[11px] pl-1.5">
            <a href="javascript:void(0)" onclick="goToScreen('5.1')" class="block py-0.5 text-slate-600 dark:text-slate-300 hover:text-[#FF5B26] font-medium transition">• [5.1] Tài khoản & GDPR</a>
            <a href="javascript:void(0)" onclick="goToScreen('5.2')" class="block py-0.5 text-slate-600 dark:text-slate-300 hover:text-[#FF5B26] font-medium transition">• [5.2] Kết nối Strava OAuth</a>
            <a href="javascript:void(0)" onclick="goToScreen('5.3')" class="block py-0.5 text-emerald-600 font-semibold hover:text-emerald-700 transition">• [5.3] Sổ nợ & Đóng quỹ [/me/finance]</a>
            <a href="javascript:void(0)" onclick="goToScreen('5.4')" class="block py-0.5 text-slate-600 dark:text-slate-300 hover:text-[#FF5B26] font-medium transition">• [5.4] Tùy chọn giao diện</a>
          </div>
        </div>

        <!-- GROUP 2: QUẢN TRỊ CLB (CLUB ADMIN) -->
        <div class="pt-2">
          <div class="px-2 mb-2 text-[10px] font-extrabold tracking-wider text-slate-400 dark:text-slate-500 uppercase flex items-center justify-between">
            <span>QUẢN TRỊ CLB (CLUB ADMIN)</span>
            <span class="text-[9px] text-slate-400">6.0 - 7.0</span>
          </div>

          <!-- [6.0] Quản Trị CLB -->
          <div class="bg-white dark:bg-slate-800 rounded-2xl p-3 shadow-sm border border-slate-100 dark:border-slate-700/80 mb-3">
            <button onclick="switchTab('club-manage')" id="sidebar-club-manage" class="sidebar-btn w-full flex items-center justify-between font-bold text-slate-800 dark:text-slate-100 text-xs mb-1.5 text-left transition">
              <div class="flex items-center gap-1.5">
                <span class="text-slate-500">🏛️</span>
                <span>[6.0] Quản Trị CLB</span>
              </div>
              <span class="text-[10px] text-slate-400">▾</span>
            </button>
            <div class="space-y-1 text-[11px] pl-1.5">
              <a href="javascript:void(0)" onclick="goToScreen('6.1')" class="block py-0.5 text-slate-600 dark:text-slate-300 hover:text-[#FF5B26] font-medium transition">• [6.1] Cài đặt CLB & VietQR BIN</a>
              <a href="javascript:void(0)" onclick="goToScreen('6.2')" class="block py-0.5 text-slate-600 dark:text-slate-300 hover:text-[#FF5B26] font-medium transition">• [6.2] Duyệt & Khóa thành viên</a>
              <a href="javascript:void(0)" onclick="goToScreen('6.3')" class="block py-0.5 text-slate-600 dark:text-slate-300 hover:text-[#FF5B26] font-medium transition">• [6.3] Quản lý mã mời & Hạn dùng</a>
            </div>
          </div>

          <!-- [7.0] Điều Hành Giải Đấu -->
          <div class="bg-white dark:bg-slate-800 rounded-2xl p-3 shadow-sm border border-slate-100 dark:border-slate-700/80 mb-3">
            <button onclick="switchTab('rules')" id="sidebar-rules" class="sidebar-btn w-full flex items-center justify-between font-bold text-slate-800 dark:text-slate-100 text-xs mb-1.5 text-left transition">
              <div class="flex items-center gap-1.5">
                <span class="text-slate-500">⚙️</span>
                <span>[7.0] Điều Hành Giải Đấu</span>
              </div>
              <span class="text-[10px] text-slate-400">▾</span>
            </button>
            <div class="space-y-1 text-[11px] pl-1.5">
              <a href="javascript:void(0)" onclick="goToScreen('7.1')" class="block py-0.5 text-slate-600 dark:text-slate-300 hover:text-[#FF5B26] font-medium transition">• [7.1] Wizard thể lệ (Khóa 2:45)</a>
              <a href="javascript:void(0)" onclick="goToScreen('7.2')" class="block py-0.5 text-slate-600 dark:text-slate-300 hover:text-[#FF5B26] font-medium transition">• [7.2] Phân bổ Đội & Đội trưởng</a>
              <a href="javascript:void(0)" onclick="goToScreen('7.3')" class="block py-0.5 text-slate-600 dark:text-slate-300 hover:text-[#FF5B26] font-medium transition">• [7.3] Duyệt khiếu nại (+km)</a>
              <a href="javascript:void(0)" onclick="goToScreen('7.4')" class="block py-0.5 text-slate-600 dark:text-slate-300 hover:text-[#FF5B26] font-medium transition">• [7.4] Miễn trừ phạt tuần</a>
              <a href="javascript:void(0)" onclick="goToScreen('7.5')" class="block py-0.5 text-emerald-600 font-semibold hover:text-emerald-700 transition">• [7.5] Quản lý quỹ & VietQR</a>
              <a href="javascript:void(0)" onclick="goToScreen('7.6')" class="block py-0.5 text-orange-500 font-semibold hover:text-orange-600 transition">• [7.6] Xuất dữ liệu (CSV/Excel)</a>
              <a href="javascript:void(0)" onclick="goToScreen('7.7')" class="block py-0.5 text-rose-500 font-semibold hover:text-rose-600 transition">• [7.7] Chốt giải & Đóng băng</a>
            </div>
          </div>
        </div>

        <!-- GROUP 3: TOÀN SÀN (SUPER ADMIN) -->
        <div class="pt-2">
          <div class="px-2 mb-2 text-[10px] font-extrabold tracking-wider text-slate-400 dark:text-slate-500 uppercase flex items-center justify-between">
            <span>TOÀN SÀN (SUPER ADMIN)</span>
            <span class="flex items-center gap-1 text-[9px] text-[#FF5B26] font-bold">
              <span class="w-1.5 h-1.5 rounded-full bg-[#FF5B26]"></span> 8.0
            </span>
          </div>

          <!-- [8.0] Hệ Thống Toàn Sàn -->
          <div class="bg-white dark:bg-slate-800 rounded-2xl p-3 shadow-sm border border-slate-100 dark:border-slate-700/80 mb-3">
            <button onclick="switchTab('admin')" id="sidebar-admin" class="sidebar-btn w-full flex items-center justify-between font-bold text-slate-800 dark:text-slate-100 text-xs mb-1.5 text-left transition">
              <div class="flex items-center gap-1.5">
                <span class="text-blue-500">🛡️</span>
                <span>[8.0] Hệ Thống Toàn Sàn</span>
              </div>
              <span id="badge-dot" class="w-2 h-2 rounded-full bg-[#FF5B26] animate-pulse"></span>
            </button>
            <div class="space-y-1 text-[11px] pl-1.5">
              <a href="javascript:void(0)" onclick="goToScreen('8.1')" class="block py-0.5 text-slate-600 dark:text-slate-300 hover:text-[#FF5B26] font-medium transition">• [8.1] Giám sát Strava Quota</a>
              <a href="javascript:void(0)" onclick="goToScreen('8.2')" class="block py-0.5 text-slate-600 dark:text-slate-300 hover:text-[#FF5B26] font-medium transition">• [8.2] Webhook & Queue</a>
              <a href="javascript:void(0)" onclick="goToScreen('8.3')" class="block py-0.5 text-slate-600 dark:text-slate-300 hover:text-[#FF5B26] font-medium transition">• [8.3] Quản lý Tenant / CLB</a>
              <a href="javascript:void(0)" onclick="goToScreen('8.4')" class="block py-0.5 text-orange-500 font-semibold hover:text-orange-600 transition">• [8.4] Recompute & Replay</a>
            </div>
          </div>
        </div>

        <!-- GROUP 4: CỘNG ĐỒNG & ĐỘI [V2.1 MỚI ⭐] -->
        <div class="pt-2">
          <div class="px-2 mb-2 text-[10px] font-extrabold tracking-wider text-indigo-500 dark:text-indigo-400 uppercase flex items-center justify-between">
            <span>CỘNG ĐỒNG & ĐỘI [V2.1 ⭐]</span>
            <span class="text-[9px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-bold">v2.1</span>
          </div>

          <div class="bg-white dark:bg-slate-800 rounded-2xl p-3 shadow-sm border border-slate-100 dark:border-slate-700/80 mb-3">
            <div class="font-bold text-slate-800 dark:text-slate-100 text-xs mb-1.5 flex items-center gap-1.5">
              <span class="text-indigo-500">🚀</span>
              <span>Tính Năng Mới v2.1</span>
            </div>
            <div class="space-y-1 text-[11px] pl-1.5">
              <a href="javascript:void(0)" onclick="switchTab('teams')" id="sidebar-teams" class="block py-0.5 text-indigo-600 font-semibold hover:text-indigo-700 transition">• [7.0] Đội Thi Đấu & Đội Trưởng</a>
              <a href="javascript:void(0)" onclick="switchTab('social')" id="sidebar-social" class="block py-0.5 text-rose-500 font-semibold hover:text-rose-600 transition">• [8.0] Mạng Xã Hội, Kudos & Bàn Tán</a>
              <a href="javascript:void(0)" onclick="switchTab('chat')" id="sidebar-chat" class="block py-0.5 text-amber-500 font-semibold hover:text-amber-600 transition">• [9.0] Chat Trực Tiếp & AI PacerBot</a>
              <a href="javascript:void(0)" onclick="switchTab('governance')" id="sidebar-governance" class="block py-0.5 text-emerald-600 font-semibold hover:text-emerald-700 transition">• [10.0] Điều Hành CLB ERP (RSVP & Polls)</a>
            </div>
          </div>
        </div>
      </nav>`;

code = code.slice(0, navStart) + replacementNav + code.slice(navEnd);
fs.writeFileSync(mainTsPath, code, 'utf8');
console.log('Successfully updated main-sidebar to card design matching user screenshot!');

