const fs = require('fs');
const path = require('path');

const mainPath = path.join(__dirname, 'backend', 'src', 'main.ts');
let content = fs.readFileSync(mainPath, 'utf8');

console.log('[CLEAN SIDEBAR LABELS] Removing menu codes from left menus...');

// 1. Clean up Mantis Sidebar (aside id="mantis-sidebar")
const mantisSidebarStart = content.indexOf('<aside id="mantis-sidebar"');
const mantisSidebarEnd = content.indexOf('</aside>', mantisSidebarStart) + '</aside>'.length;

if (mantisSidebarStart !== -1 && mantisSidebarEnd !== -1) {
  let mantisSidebarHtml = content.substring(mantisSidebarStart, mantisSidebarEnd);

  // Replace menu codes in Mantis sidebar
  mantisSidebarHtml = mantisSidebarHtml
    .replace('>\[1.0\] Dashboard Runner<', '>Dashboard Runner<')
    .replace('>\[1.B\] Đồng Bộ Strava & Logs<', '>Đồng Bộ Strava & Logs<')
    .replace('>\[5.0\] Sổ Nợ & Dynamic VietQR<', '>Sổ Nợ & Dynamic VietQR<')
    .replace('>\[2.1\] Hero & Đếm Ngược<', '>Hero & Đếm Ngược<')
    .replace('>\[2.2\] Bảng Xếp Hạng Đội<', '>Bảng Xếp Hạng Đội<')
    .replace('>\[2.3\] Bảng Xếp Hạng Cá Nhân<', '>Bảng Xếp Hạng Cá Nhân<')
    .replace('>\[2.4\] Đội Phoenix SARC<', '>Đội Phoenix SARC<')
    .replace('>\[2.5\] Live Ticker SSE<', '>Live Ticker SSE<')
    .replace('>\[3.1\] Toàn Bộ Bài Chạy<', '>Toàn Bộ Bài Chạy<')
    .replace('>\[3.3\] Thẩm Định Dốc Trail (AC-047)<', '>Thẩm Định Dốc Trail<')
    .replace('>\[3.4\] Cắt Đuôi Đi Xe Máy (AC-048)<', '>Cắt Đuôi Đi Xe Máy<')
    .replace('>\[3.5\] Chạy Máy Treadmill HR (AC-050)<', '>Chạy Máy Treadmill HR<')
    .replace('>\[3.6\] Khiếu Nại Bài Chạy (Dispute)<', '>Khiếu Nại Bài Chạy<')
    .replace('>\[4.0\] Không Gian CLB SARC<', '>Không Gian CLB SARC<')
    .replace('>\[7.0\] Đội Thi Đấu & Đội Trưởng<', '>Đội Thi Đấu & Đội Trưởng<')
    .replace('>\[8.0\] Mạng Xã Hội & Kudos<', '>Mạng Xã Hội & Kudos<')
    .replace('>\[9.0\] Chat & PacerBot AI<', '>Chat & PacerBot AI<')
    .replace('>\[6.0\] Quản Trị CLB & Sĩ Số<', '>Quản Trị CLB & Sĩ Số<')
    .replace('>\[6.B\] Wizard Thể Lệ Khóa 2:45<', '>Wizard Thể Lệ Khóa 2:45<')
    .replace('>\[10.0\] Điều Hành ERP (RSVP & Polls)<', '>Điều Hành ERP (RSVP & Polls)<')
    .replace('>\[8.0\] Super Admin Toàn Sàn<', '>Super Admin Toàn Sàn<')
    .replace('>\[⌚\] Garmin / Coros Direct (AC-049)<', '>Garmin / Coros Direct<')
    .replace('>\[📜\] Giấy Chứng Nhận Finisher (AC-046)<', '>Giấy Chứng Nhận Finisher<')
    .replace('>\[⚡\] Nạp 5,000 Dữ Liệu Hệ Thống<', '>5,000 Dữ Liệu Hệ Thống<')
    .replace('>\[💳\] Dynamic VietQR Auto-Settled<', '>Dynamic VietQR Auto-Settled<');

  content = content.substring(0, mantisSidebarStart) + mantisSidebarHtml + content.substring(mantisSidebarEnd);
  console.log('✓ Successfully removed menu codes from Mantis Sidebar');
}

// 2. Clean up Sport Sidebar Drawer (aside id="main-sidebar")
const sportSidebarStart = content.indexOf('<aside id="main-sidebar"');
const sportSidebarEnd = content.indexOf('</aside>', sportSidebarStart) + '</aside>'.length;

if (sportSidebarStart !== -1 && sportSidebarEnd !== -1) {
  let sportSidebarHtml = content.substring(sportSidebarStart, sportSidebarEnd);

  // Group headers: remove 1.0 - 5.0, 6.0 - 7.0, 8.0
  sportSidebarHtml = sportSidebarHtml
    .replace('<span class="text-[9px] text-slate-400">1.0 - 5.0</span>', '')
    .replace('<span class="text-[9px] text-slate-400">6.0 - 7.0</span>', '')
    .replace('<span class="flex items-center gap-1 text-[9px] text-[#FF5B26] font-bold">\\s*<span class="w-1.5 h-1.5 rounded-full bg-[#FF5B26]"></span> 8.0\\s*</span>', '')
    .replace('<span>QUẢN TRỊ CLB (CLUB ADMIN)</span>\\s*<span class="text-[9px] text-slate-400">6.0 - 7.0</span>', '<span>QUẢN TRỊ CLB (CLUB ADMIN)</span>')
    .replace('<span>VẬN ĐỘNG VIÊN (RUNNER)</span>\\s*<span class="text-[9px] text-slate-400">1.0 - 5.0</span>', '<span>VẬN ĐỘNG VIÊN (RUNNER)</span>');

  // Main menu titles
  sportSidebarHtml = sportSidebarHtml
    .replace('<span>[1.0] Tổng Quan Runner</span>', '<span>Tổng Quan Runner</span>')
    .replace('<span>[2.0] Đấu Trường Giải</span>', '<span>Đấu Trường Giải</span>')
    .replace('<span>[3.0] Nhật Ký Hoạt Động</span>', '<span>Nhật Ký Hoạt Động</span>')
    .replace('<span>[4.0] Không Gian CLB</span>', '<span>Không Gian CLB</span>')
    .replace('<span>[5.0] Cá Nhân & Sổ Nợ</span>', '<span>Cá Nhân & Sổ Nợ</span>')
    .replace('<span>[6.0] Quản Trị CLB</span>', '<span>Quản Trị CLB</span>')
    .replace('<span>[7.0] Điều Hành Giải Đấu</span>', '<span>Điều Hành Giải Đấu</span>')
    .replace('<span>[8.0] Hệ Thống Toàn Sàn</span>', '<span>Hệ Thống Toàn Sàn</span>');

  // Sub-menu items
  sportSidebarHtml = sportSidebarHtml
    .replace('• [1.1] Đồng bộ Strava', '• Đồng bộ Strava')
    .replace('• [1.B] Quản lý Strava & Sync Logs', '• Quản lý Strava & Sync Logs')
    .replace('• [1.2] Chỉ tiêu tuần', '• Chỉ tiêu tuần')
    .replace('• [1.3] Cảnh báo phạt sớm', '• Cảnh báo phạt sớm')
    .replace('• [1.4] Carousel giải đấu', '• Danh sách giải đấu')
    .replace('• [1.5] Lối tắt quét QR / Vào giải', '• Lối tắt quét QR / Vào giải')
    .replace('• [2.1] Hero & Đếm ngược', '• Hero & Đếm ngược')
    .replace('• [2.2] Bảng xếp hạng Đội', '• Bảng xếp hạng Đội')
    .replace('• [2.3] Bảng xếp hạng Cá nhân', '• Bảng xếp hạng Cá nhân')
    .replace('• [2.4] Đội thi của tôi', '• Đội thi của tôi')
    .replace('• [2.5] Luồng Live Stream SSE', '• Luồng Live Stream SSE')
    .replace('• [3.1] Toàn bộ bài chạy', '• Toàn bộ bài chạy')
    .replace('• [3.2] Lọc theo giải đấu', '• Lọc theo giải đấu')
    .replace('• [3.3] Chi tiết thẩm định & Gain', '• Chi tiết thẩm định & Gain')
    .replace('• [3.4] Gửi khiếu nại', '• Gửi khiếu nại')
    .replace('• [4.1] Hồ sơ & Bảng tin CLB', '• Hồ sơ & Bảng tin CLB')
    .replace('• [4.2] Danh mục giải CLB', '• Danh mục giải CLB')
    .replace('• [4.3] Thành viên & Ban cán sự', '• Thành viên & Ban cán sự')
    .replace('• [4.4] Mời TV (Chống In-App)', '• Mời thành viên (Chống In-App)')
    .replace('• [5.1] Tài khoản & GDPR', '• Tài khoản & GDPR')
    .replace('• [5.2] Kết nối Strava OAuth', '• Kết nối Strava OAuth')
    .replace('• [5.3] Sổ nợ & Đóng quỹ [/me/finance]', '• Sổ nợ & Đóng quỹ')
    .replace('• [5.4] Tùy chọn giao diện', '• Tùy chọn giao diện')
    .replace('• [6.1] Cài đặt CLB & VietQR BIN', '• Cài đặt CLB & VietQR BIN')
    .replace('• [6.2] Duyệt & Khóa thành viên', '• Duyệt & Khóa thành viên')
    .replace('• [6.3] Quản lý mã mời & Hạn dùng', '• Quản lý mã mời & Hạn dùng')
    .replace('• [7.1] Wizard thể lệ (Khóa 2:45)', '• Wizard thể lệ (Khóa 2:45)')
    .replace('• [7.2] Phân bổ Đội & Đội trưởng', '• Phân bổ Đội & Đội trưởng')
    .replace('• [7.3] Duyệt khiếu nại (+km)', '• Duyệt khiếu nại (+km)')
    .replace('• [7.4] Miễn trừ phạt tuần', '• Miễn trừ phạt tuần')
    .replace('• [7.5] Quản lý quỹ & VietQR', '• Quản lý quỹ & VietQR')
    .replace('• [7.6] Xuất dữ liệu (CSV/Excel)', '• Xuất dữ liệu (CSV/Excel)')
    .replace('• [7.7] Chốt giải & Đóng băng', '• Chốt giải & Đóng băng')
    .replace('• [8.1] Giám sát Strava Quota', '• Giám sát Strava Quota')
    .replace('• [8.2] Webhook & Queue', '• Webhook & Queue')
    .replace('• [8.3] Quản lý Tenant / CLB', '• Quản lý Tenant / CLB')
    .replace('• [8.4] Recompute & Replay', '• Recompute & Replay')
    .replace('• [7.0] Đội Thi Đấu & Đội Trưởng', '• Đội Thi Đấu & Đội Trưởng')
    .replace('• [8.0] Mạng Xã Hội, Kudos & Bàn Tán', '• Mạng Xã Hội, Kudos & Bàn Tán')
    .replace('• [9.0] Chat Trực Tiếp & AI PacerBot', '• Chat Trực Tiếp & AI PacerBot')
    .replace('• [10.0] Điều Hành CLB ERP (RSVP & Polls)', '• Điều Hành CLB ERP (RSVP & Polls)');

  content = content.substring(0, sportSidebarStart) + sportSidebarHtml + content.substring(sportSidebarEnd);
  console.log('✓ Successfully removed menu codes from Sport Sidebar Drawer');
}

// 3. Clean up Slim Rail Tooltips (aside id="slim-rail")
const slimRailStart = content.indexOf('<aside id="slim-rail"');
const slimRailEnd = content.indexOf('</aside>', slimRailStart) + '</aside>'.length;

if (slimRailStart !== -1 && slimRailEnd !== -1) {
  let slimRailHtml = content.substring(slimRailStart, slimRailEnd);

  slimRailHtml = slimRailHtml
    .replace('title="[1.0] Overview / Runner Hub"', 'title="Overview / Runner Hub"')
    .replace('title="[2.0] Đấu Trường"', 'title="Đấu Trường"')
    .replace('title="[3.0] Nhật Ký Hoạt Động"', 'title="Nhật Ký Hoạt Động"')
    .replace('title="[4.0] Không Gian CLB"', 'title="Không Gian CLB"')
    .replace('title="[5.0] Cá Nhân & Sổ Nợ"', 'title="Cá Nhân & Sổ Nợ"')
    .replace('title="[6.0] Điều Hành Thể Lệ"', 'title="Điều Hành Thể Lệ"')
    .replace('title="[7.0] Đội Thi Đấu & Quyền Đội Trưởng (v2.1)"', 'title="Đội Thi Đấu & Quyền Đội Trưởng"')
    .replace('title="[8.0] Mạng Xã Hội, Kudos & Bạn Bè (v2.1)"', 'title="Mạng Xã Hội, Kudos & Bạn Bè"')
    .replace('title="[9.0] Chat Trực Tiếp & AI PacerBot, Banter (v2.1)"', 'title="Chat Trực Tiếp & AI PacerBot"')
    .replace('title="[10.0] Điều Hành CLB ERP (RSVP & Polls) (v2.1)"', 'title="Điều Hành CLB ERP (RSVP & Polls)"')
    .replace('title="[1.B] Quản Lý Strava & Nhật Ký Sync (v2.1)"', 'title="Quản Lý Strava & Nhật Ký Sync"')
    .replace('title="[8.0] Super Admin"', 'title="Super Admin"')
    .replace('title="Mở danh mục đầy đủ [1.0] - [8.0]"', 'title="Mở danh mục đầy đủ"');

  content = content.substring(0, slimRailStart) + slimRailHtml + content.substring(slimRailEnd);
  console.log('✓ Successfully removed menu codes from Slim Rail tooltips');
}

fs.writeFileSync(mainPath, content, 'utf8');
console.log('[CLEAN SIDEBAR LABELS] Completed successfully!');
