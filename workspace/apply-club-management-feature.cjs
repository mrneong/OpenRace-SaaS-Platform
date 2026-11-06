const fs = require('fs');
const path = require('path');

const mainTsPath = path.resolve(__dirname, 'backend/src/main.ts');
let code = fs.readFileSync(mainTsPath, 'utf8');

console.log('--- Step 1: Adding Backend API Routes for Club Profile, Leaders, Posts ---');

const apiAnchor = `    // [4.4] In-App Browser Detour Inspection`;
const newRoutes = `    // [4.1] Club Profile Update
    const clubFullProfileMatch = pathname.match(/^\\/api\\/clubs\\/([^\\/]+)\\/profile$/);
    if (req.method === 'PUT' && clubFullProfileMatch) {
      const slug = clubFullProfileMatch[1];
      let body = '';
      req.on('data', (chunk) => { body += chunk; });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body || '{}');
          const updated = clubHubUseCase.updateClubProfile(slug, payload);
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: true, club: updated }));
        } catch (err: any) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return true;
    }

    // [4.1] Executive Committee Management: Add Leader
    const clubAddLeaderMatch = pathname.match(/^\\/api\\/clubs\\/([^\\/]+)\\/leaders$/);
    if (req.method === 'POST' && clubAddLeaderMatch) {
      const slug = clubAddLeaderMatch[1];
      let body = '';
      req.on('data', (chunk) => { body += chunk; });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body || '{}');
          const leader = clubHubUseCase.addLeader(slug, payload);
          res.writeHead(201, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: true, leader }));
        } catch (err: any) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return true;
    }

    // [4.1] Executive Committee Management: Update / Delete Leader
    const clubLeaderDetailMatch = pathname.match(/^\\/api\\/clubs\\/([^\\/]+)\\/leaders\\/([^\\/]+)$/);
    if (req.method === 'PUT' && clubLeaderDetailMatch) {
      const slug = clubLeaderDetailMatch[1];
      const leaderId = clubLeaderDetailMatch[2];
      let body = '';
      req.on('data', (chunk) => { body += chunk; });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body || '{}');
          const leader = clubHubUseCase.updateLeader(slug, leaderId, payload);
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: true, leader }));
        } catch (err: any) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return true;
    }

    if (req.method === 'DELETE' && clubLeaderDetailMatch) {
      const slug = clubLeaderDetailMatch[1];
      const leaderId = clubLeaderDetailMatch[2];
      const deleted = clubHubUseCase.deleteLeader(slug, leaderId);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: deleted }));
      return true;
    }

    // [4.1] Announcement Posts Management: Add Post
    const clubAddPostMatch = pathname.match(/^\\/api\\/clubs\\/([^\\/]+)\\/posts$/);
    if (req.method === 'POST' && clubAddPostMatch) {
      const slug = clubAddPostMatch[1];
      let body = '';
      req.on('data', (chunk) => { body += chunk; });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body || '{}');
          const post = clubHubUseCase.addPost(slug, payload);
          res.writeHead(201, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: true, post }));
        } catch (err: any) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return true;
    }

    // [4.1] Announcement Posts Management: Update / Delete / Toggle Pin
    const clubPostPinMatch = pathname.match(/^\\/api\\/clubs\\/([^\\/]+)\\/posts\\/([^\\/]+)\\/pin$/);
    if (req.method === 'PUT' && clubPostPinMatch) {
      const slug = clubPostPinMatch[1];
      const postId = clubPostPinMatch[2];
      try {
        const post = clubHubUseCase.togglePinPost(slug, postId);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: true, post }));
      } catch (err: any) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
      return true;
    }

    const clubPostDetailMatch = pathname.match(/^\\/api\\/clubs\\/([^\\/]+)\\/posts\\/([^\\/]+)$/);
    if (req.method === 'PUT' && clubPostDetailMatch) {
      const slug = clubPostDetailMatch[1];
      const postId = clubPostDetailMatch[2];
      let body = '';
      req.on('data', (chunk) => { body += chunk; });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body || '{}');
          const post = clubHubUseCase.updatePost(slug, postId, payload);
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: true, post }));
        } catch (err: any) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return true;
    }

    if (req.method === 'DELETE' && clubPostDetailMatch) {
      const slug = clubPostDetailMatch[1];
      const postId = clubPostDetailMatch[2];
      const deleted = clubHubUseCase.deletePost(slug, postId);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: deleted }));
      return true;
    }

`;

if (!code.includes('/api/clubs/[^/]+/leaders')) {
  code = code.replace(apiAnchor, newRoutes + apiAnchor);
  console.log('Added backend API routes for Club Management!');
}

console.log('--- Step 2: Replacing section-4-1 HTML with Dynamic Management UI ---');
const oldSectionStart = code.indexOf('<div id="section-4-1"');
const oldSectionEnd = code.indexOf('<div id="section-4-2"');

if (oldSectionStart === -1 || oldSectionEnd === -1) {
  console.error('Cannot find section-4-1 boundaries');
  process.exit(1);
}

const newSection41 = `<div id="section-4-1" class="sub-screen-container block space-y-5">
          <!-- Standard Screen Header Banner -->
          <div class="bg-gradient-to-r from-slate-50 to-orange-50/40 rounded-3xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3 mb-5">
            <div class="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span class="hover:text-slate-800 transition cursor-pointer" onclick="switchTab('dashboard')">Trang chủ</span>
              <span class="text-slate-300">›</span>
              <span class="text-slate-700">Không Gian CLB</span>
              <span class="text-slate-300">›</span>
              <span class="text-[#FF5B26] font-bold">Hồ Sơ & Bảng Tin CLB</span>
            </div>
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
              <div>
                <div class="flex items-center gap-2.5 flex-wrap">
                  <h2 class="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Hồ Sơ & Bảng Tin CLB</h2>
                  <span class="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200">Chính Thức</span>
                  <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-[#FF5B26] border border-orange-200 flex items-center gap-1">
                    <span>👑</span> Quyền Ban Cán Sự
                  </span>
                </div>
                <p class="text-xs text-slate-500 mt-1">Thông tin Câu Lạc Bộ Chạy Bộ SARC, Ban cán sự điều hành và các thông báo mới nhất</p>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <button onclick="openEditClubProfileModal()" class="px-4 py-2 rounded-xl bg-[#FF5B26] hover:bg-[#e04800] text-white text-xs font-bold shadow-md transition flex items-center gap-1.5 hover:scale-105">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  <span>Thiết Lập Thông Tin CLB</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Club Profile & Leadership Card -->
          <div class="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-[0_4px_25px_rgb(0,0,0,0.03)]">
            <!-- Cover Header -->
            <div class="h-32 bg-gradient-to-r from-slate-900 via-orange-950 to-[#FF5B26] p-6 relative flex items-end justify-between">
              <div class="flex items-center gap-4 relative z-10 -mb-10">
                <div id="club-display-logo" class="w-20 h-20 rounded-2xl bg-white p-1 shadow-xl border border-slate-100 flex items-center justify-center font-black text-2xl text-[#FF5B26]">
                  SARC
                </div>
                <div class="text-white">
                  <h2 id="club-display-name" class="text-xl md:text-2xl font-black drop-shadow-sm">CLB Chạy Bộ SARC (Sáng Ánh Rạng Chiều)</h2>
                  <p id="club-display-meta" class="text-xs text-orange-200 drop-shadow">Thành lập: Tháng 3/2021 • Hà Nội, Việt Nam</p>
                </div>
              </div>
              <div class="hidden sm:flex items-center gap-4 text-white text-right relative z-10">
                <div>
                  <div class="text-[10px] uppercase text-orange-200 font-bold">Thành Viên</div>
                  <div id="club-stat-members" class="text-xl font-black font-mono">128 runners</div>
                </div>
                <div>
                  <div class="text-[10px] uppercase text-orange-200 font-bold">Tổng Tích Lũy</div>
                  <div id="club-stat-km" class="text-xl font-black font-mono">42,580.0 km</div>
                </div>
              </div>
            </div>

            <!-- Profile Info & Roster Section -->
            <div class="pt-14 p-6 sm:p-7 space-y-6">
              <!-- Slogan & Intro -->
              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1 relative group">
                <div class="flex items-center justify-between">
                  <div class="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Khẩu Hiệu CLB</div>
                  <button onclick="openEditClubProfileModal()" class="text-[11px] text-orange-600 hover:text-orange-700 font-bold flex items-center gap-1 opacity-80 hover:opacity-100 transition">
                    <span>✏️ Chỉnh sửa</span>
                  </button>
                </div>
                <p id="club-display-slogan" class="text-sm font-semibold italic text-[#FF5B26]">"Chạy Với Niềm Vui - Về Đích Cùng Đồng Đội - Lan Tỏa Sức Khỏe Cộng Đồng"</p>
                <p id="club-display-desc" class="text-xs text-slate-500 pt-1">CLB SARC quy tụ các vận động viên phong trào cự ly từ 5km đến Ultra Marathon. Tôn chỉ kết nối, trung thực thể thao và tương trợ lẫn nhau trên mọi cung đường.</p>
              </div>

              <!-- Executive Committee Roster -->
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider">Ban Cán Sự Điều Hành CLB</h3>
                    <span id="exec-count-badge" class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700">3 Thành Viên</span>
                  </div>
                  <button onclick="openExecutiveModal()" class="px-3 py-1.5 rounded-xl bg-orange-100 hover:bg-orange-200 text-[#FF5B26] text-xs font-bold transition flex items-center gap-1 shadow-sm">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
                    <span>Thêm Ban Cán Sự</span>
                  </button>
                </div>
                <div id="club-executives-grid" class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <!-- Dynamically populated by JS -->
                </div>
              </div>

              <!-- Community Feed & Announcements -->
              <div class="space-y-3 pt-2">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
                  <div class="flex items-center gap-2.5">
                    <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider">Bảng Tin Thông Báo CLB</h3>
                    <span id="posts-count-badge" class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700">3 Tin</span>
                  </div>
                  <div class="flex items-center gap-2 flex-wrap">
                    <!-- Filter Pills -->
                    <div class="flex items-center bg-slate-100 p-0.5 rounded-xl text-[11px] font-semibold text-slate-600">
                      <button onclick="filterClubPosts('all')" id="post-filter-all" class="px-2.5 py-1 rounded-lg bg-white text-slate-900 shadow-xs font-bold transition">Tất Cả</button>
                      <button onclick="filterClubPosts('pinned')" id="post-filter-pinned" class="px-2.5 py-1 rounded-lg hover:text-slate-900 transition">📌 Đang Ghim</button>
                      <button onclick="filterClubPosts('active')" id="post-filter-active" class="px-2.5 py-1 rounded-lg hover:text-slate-900 transition">⏳ Đang Hiệu Lực</button>
                    </div>
                    <button onclick="openAnnouncementModal()" class="px-3 py-1.5 rounded-xl bg-[#FF5B26] hover:bg-[#e04800] text-white text-xs font-bold shadow-sm transition flex items-center gap-1">
                      <span>📝</span><span>Đăng Thông Báo Mới</span>
                    </button>
                  </div>
                </div>
                <div id="club-announcements-list" class="space-y-2.5">
                  <!-- Dynamically populated by JS -->
                </div>
              </div>
            </div>
          </div>
        </div>

        `;

code = code.slice(0, oldSectionStart) + newSection41 + code.slice(oldSectionEnd);
console.log('Replaced section-4-1 with dynamic management UI!');

console.log('--- Step 3: Adding 3 Modals to HTML body ---');
const modalAnchor = `  <!-- ADD MANUAL ACTIVITY MODAL -->`;

const newModals = `  <!-- 1. EDIT CLUB PROFILE MODAL -->
  <div id="modal-edit-club-profile" class="hidden fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 border border-slate-100 max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <span class="text-[10px] font-bold uppercase tracking-wider text-[#FF5B26]">[4.1] Thiết Lập CLB</span>
          <h3 class="text-sm font-extrabold text-slate-900">Cập Nhật Thông Tin Câu Lạc Bộ</h3>
        </div>
        <button onclick="closeEditClubProfileModal()" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs">✕</button>
      </div>

      <div class="space-y-3 text-xs">
        <div>
          <label class="block font-bold text-slate-700 mb-1">Tên Câu Lạc Bộ</label>
          <input type="text" id="edit-club-name" value="CLB Chạy Bộ SARC (Sáng Ánh Rạng Chiều)" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500">
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Tên viết tắt / Mã CLB</label>
            <input type="text" id="edit-club-shortname" value="SARC" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Thời gian thành lập</label>
            <input type="text" id="edit-club-founded" value="Tháng 3/2021" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
          </div>
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">Địa điểm hoạt động</label>
          <input type="text" id="edit-club-location" value="Hà Nội, Việt Nam" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">Khẩu hiệu (Slogan)</label>
          <input type="text" id="edit-club-slogan" value="Chạy Với Niềm Vui - Về Đích Cùng Đồng Đội - Lan Tỏa Sức Khỏe Cộng Đồng" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs italic font-medium">
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">Giới thiệu ngắn về CLB</label>
          <textarea id="edit-club-desc" rows="3" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-orange-500">CLB SARC quy tụ các vận động viên phong trào cự ly từ 5km đến Ultra Marathon. Tôn chỉ kết nối, trung thực thể thao và tương trợ lẫn nhau trên mọi cung đường.</textarea>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Số lượng thành viên</label>
            <input type="number" id="edit-club-members" value="128" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Tổng KM tích lũy</label>
            <input type="number" id="edit-club-km" value="42580.0" step="10" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold">
          </div>
        </div>
      </div>

      <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 text-xs">
        <button onclick="closeEditClubProfileModal()" class="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition">Hủy bỏ</button>
        <button onclick="saveClubProfile()" class="px-5 py-2 rounded-xl bg-[#FF5B26] hover:bg-[#e04800] text-white font-bold shadow-md transition">
          💾 Lưu Thông Tin CLB
        </button>
      </div>
    </div>
  </div>

  <!-- 2. EXECUTIVE LEADER MODAL (ADD / EDIT) -->
  <div id="modal-executive-leader" class="hidden fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-100">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <span class="text-[10px] font-bold uppercase tracking-wider text-orange-600">[4.1] Ban Cán Sự CLB</span>
          <h3 id="exec-modal-title" class="text-sm font-extrabold text-slate-900">Thêm Thành Viên Ban Cán Sự</h3>
        </div>
        <button onclick="closeExecutiveModal()" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs">✕</button>
      </div>

      <input type="hidden" id="exec-edit-id" value="">
      <div class="space-y-3 text-xs">
        <div>
          <label class="block font-bold text-slate-700 mb-1">Họ và tên thành viên</label>
          <input type="text" id="exec-input-name" placeholder="Ví dụ: Hoàng Văn Minh" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500">
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">Chức danh / Vai trò</label>
          <select id="exec-input-role" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800">
            <option value="Chủ nhiệm CLB">Chủ nhiệm CLB</option>
            <option value="Phó Chủ nhiệm CLB">Phó Chủ nhiệm CLB</option>
            <option value="Trưởng Ban Chuyên Môn">Trưởng Ban Chuyên Môn</option>
            <option value="Thủ Quỹ & Hậu Cần">Thủ Quỹ & Hậu Cần</option>
            <option value="Trưởng Ban Truyền Thông">Trưởng Ban Truyền Thông</option>
            <option value="Ban Cán Sự">Ban Cán Sự</option>
          </select>
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">Trách nhiệm & Nhiệm vụ chính</label>
          <input type="text" id="exec-input-desc" placeholder="Ví dụ: Điều hành chung & Đối ngoại" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Email</label>
            <input type="email" id="exec-input-email" placeholder="runner@sarc.vn" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Số điện thoại</label>
            <input type="text" id="exec-input-phone" placeholder="0901234567" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono">
          </div>
        </div>
      </div>

      <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 text-xs">
        <button onclick="closeExecutiveModal()" class="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition">Hủy bỏ</button>
        <button onclick="saveExecutiveLeader()" class="px-5 py-2 rounded-xl bg-[#FF5B26] hover:bg-[#e04800] text-white font-bold shadow-md transition">
          💾 Lưu Ban Cán Sự
        </button>
      </div>
    </div>
  </div>

  <!-- 3. ANNOUNCEMENT POST MODAL (CREATE / EDIT) -->
  <div id="modal-announcement-post" class="hidden fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 border border-slate-100 max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <span class="text-[10px] font-bold uppercase tracking-wider text-[#FF5B26]">[4.1] Bảng Tin CLB</span>
          <h3 id="post-modal-title" class="text-sm font-extrabold text-slate-900">Đăng Thông Báo Mới</h3>
        </div>
        <button onclick="closeAnnouncementModal()" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs">✕</button>
      </div>

      <input type="hidden" id="post-edit-id" value="">
      <div class="space-y-3 text-xs">
        <div>
          <label class="block font-bold text-slate-700 mb-1">Tiêu đề thông báo</label>
          <input type="text" id="post-input-title" placeholder="Ví dụ: Thông báo chốt tuần thi đấu giải Mùa 10" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500">
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Chuyên mục</label>
            <select id="post-input-category" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800">
              <option value="THÔNG BÁO">📢 THÔNG BÁO</option>
              <option value="LỊCH CHẠY">🏃 LỊCH CHẠY</option>
              <option value="TỔNG KẾT">📊 TỔNG KẾT</option>
              <option value="KHẨN CẤP">🚨 KHẨN CẤP</option>
            </select>
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Thời hạn hiển thị (Hết hạn)</label>
            <input type="date" id="post-input-expires" value="2026-11-30" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono">
            <span class="text-[10px] text-slate-400">Sau ngày này tin sẽ chuyển sang 'Hết hạn'</span>
          </div>
        </div>

        <div class="p-3 bg-amber-50/60 rounded-2xl border border-amber-200/80 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-base">📌</span>
            <div>
              <div class="font-extrabold text-amber-900 text-xs">Ghim lên đầu bảng tin</div>
              <div class="text-[10px] text-amber-700">Thông báo được ghim sẽ luôn đứng ở vị trí ưu tiên số 1</div>
            </div>
          </div>
          <input type="checkbox" id="post-input-pinned" class="w-5 h-5 accent-orange-600 rounded cursor-pointer">
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">Nội dung thông báo</label>
          <textarea id="post-input-content" rows="4" placeholder="Nhập chi tiết nội dung thông báo cho toàn thể thành viên..." class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-orange-500"></textarea>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Người đăng / Ký tên</label>
            <input type="text" id="post-input-author" value="Hoàng Văn Minh" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Chức vụ người đăng</label>
            <input type="text" id="post-input-author-role" value="Chủ nhiệm CLB" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
          </div>
        </div>
      </div>

      <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 text-xs">
        <button onclick="closeAnnouncementModal()" class="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition">Hủy bỏ</button>
        <button onclick="saveAnnouncementPost()" class="px-5 py-2 rounded-xl bg-[#FF5B26] hover:bg-[#e04800] text-white font-bold shadow-md transition">
          🚀 Xuất Bản Thông Báo
        </button>
      </div>
    </div>
  </div>

`;

code = code.replace(modalAnchor, newModals + modalAnchor);
console.log('Added 3 modals for club management!');

console.log('--- Step 4: Adding Client JavaScript for Club Profile, Leaders, Posts ---');
const clientAnchor = `    // Subsystem 5, 6, 7, 8 Client Scripts`;

const clientScripts = `    // ==========================================
    // SUBSYSTEM 4.1 CLUB HUB ENHANCED CLIENT SCRIPTS
    // ==========================================
    let clubProfileState = {
      name: 'CLB Chạy Bộ SARC (Sáng Ánh Rạng Chiều)',
      shortName: 'SARC',
      slogan: 'Chạy Với Niềm Vui - Về Đích Cùng Đồng Đội - Lan Tỏa Sức Khỏe Cộng Đồng',
      description: 'CLB SARC quy tụ các vận động viên phong trào cự ly từ 5km đến Ultra Marathon. Tôn chỉ kết nối, trung thực thể thao và tương trợ lẫn nhau trên mọi cung đường.',
      founded: 'Tháng 3/2021',
      location: 'Hà Nội, Việt Nam',
      totalMembers: 128,
      totalCumulativeKm: 42580.0,
      leaders: [
        { id: 'lead-01', name: 'Hoàng Văn Minh', role: 'Chủ nhiệm CLB', avatar: 'HM', description: 'Điều hành chung & Đối ngoại', email: 'minh.hoang@sarc.vn', phone: '0901234567' },
        { id: 'lead-02', name: 'Trần Quốc Tuấn', role: 'Trưởng Ban Chuyên Môn', avatar: 'TT', description: 'Huấn luyện & Thẩm định kỷ luật', email: 'tuan.tran@sarc.vn', phone: '0912345678' },
        { id: 'lead-03', name: 'Lê Thu Thảo', role: 'Thủ Quỹ & Hậu Cần', avatar: 'LT', description: 'Quản trị quỹ & Thu nộp VietQR', email: 'thao.le@sarc.vn', phone: '0987654321' }
      ],
      feedPosts: [
        {
          id: 'post-1',
          title: 'Thông báo chốt tuần thi đấu giải Mùa 10',
          content: 'Các VĐV lưu ý nộp bài chạy tuần trước 23:59:59 Chủ Nhật. Hệ thống sẽ khóa sổ và áp dụng mức phạt 50.000đ cho mỗi VĐV thiếu cự ly tiêu chuẩn 20km.',
          author: 'Hoàng Văn Minh',
          authorRole: 'Chủ nhiệm CLB',
          createdAt: '2026-11-06T08:30:00Z',
          pinned: true,
          expiresAt: '2026-11-15',
          category: 'THÔNG BÁO'
        },
        {
          id: 'post-2',
          title: 'Mở đăng ký giải Trail Ba Vì Challenge',
          content: 'Đã cập nhật thể lệ tính thưởng dốc Trail (+1km cho mỗi 100m elevation gain). Các VĐV tham gia vui lòng đồng bộ tài khoản Strava trước ngày chạy.',
          author: 'Trần Quốc Tuấn',
          authorRole: 'Trưởng Ban Chuyên Môn',
          createdAt: '2026-11-03T09:00:00Z',
          pinned: false,
          expiresAt: '2026-11-30',
          category: 'THÔNG BÁO'
        },
        {
          id: 'post-3',
          title: 'Lịch tập chạy dài Long Run cuối tuần Hồ Tây 21km',
          content: 'Thứ 7 tuần này 05:00 sáng tại Vườn hoa Lạc Long Quân. Pacer hỗ trợ dẫn tốc từ 5:00 đến 6:30, trạm tiếp nước tại km 7 và km 14.',
          author: 'Lê Thu Thảo',
          authorRole: 'Thủ Quỹ & Hậu Cần',
          createdAt: '2026-11-01T15:00:00Z',
          pinned: false,
          expiresAt: '2026-11-08',
          category: 'LỊCH CHẠY'
        }
      ]
    };

    let activePostFilter = 'all';

    function renderClubDisplay() {
      const nameEl = document.getElementById('club-display-name');
      const metaEl = document.getElementById('club-display-meta');
      const sloganEl = document.getElementById('club-display-slogan');
      const descEl = document.getElementById('club-display-desc');
      const membersEl = document.getElementById('club-stat-members');
      const kmEl = document.getElementById('club-stat-km');
      const logoEl = document.getElementById('club-display-logo');

      if (nameEl) nameEl.innerText = clubProfileState.name;
      if (metaEl) metaEl.innerText = 'Thành lập: ' + clubProfileState.founded + ' • ' + clubProfileState.location;
      if (sloganEl) sloganEl.innerText = '"' + clubProfileState.slogan + '"';
      if (descEl) descEl.innerText = clubProfileState.description;
      if (membersEl) membersEl.innerText = clubProfileState.totalMembers + ' runners';
      if (kmEl) kmEl.innerText = Number(clubProfileState.totalCumulativeKm).toLocaleString('en-US', { minimumFractionDigits: 1 }) + ' km';
      if (logoEl) logoEl.innerText = clubProfileState.shortName;

      renderClubExecutives();
      renderClubAnnouncements(activePostFilter);
    }

    function renderClubExecutives() {
      const grid = document.getElementById('club-executives-grid');
      const badge = document.getElementById('exec-count-badge');
      if (badge) badge.innerText = clubProfileState.leaders.length + ' Thành Viên';
      if (!grid) return;

      const roleColors = {
        'Chủ nhiệm CLB': { bg: 'bg-orange-100', text: 'text-[#FF5B26]', border: 'border-orange-200' },
        'Phó Chủ nhiệm CLB': { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
        'Trưởng Ban Chuyên Môn': { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' },
        'Thủ Quỹ & Hậu Cần': { bg: 'bg-emerald-100', text: 'text-emerald-600', border: 'border-emerald-200' },
        'Trưởng Ban Truyền Thông': { bg: 'bg-rose-100', text: 'text-rose-600', border: 'border-rose-200' },
        'Ban Cán Sự': { bg: 'bg-indigo-100', text: 'text-indigo-600', border: 'border-indigo-200' }
      };

      grid.innerHTML = clubProfileState.leaders.map(l => {
        const c = roleColors[l.role] || { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };
        const initials = l.avatar || l.name.split(' ').map(n=>n[0]).slice(-2).join('').toUpperCase();
        return '<div class="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center justify-between group hover:border-orange-300 transition">' +
          '<div class="flex items-center gap-3">' +
            '<div class="w-10 h-10 rounded-xl ' + c.bg + ' ' + c.text + ' flex items-center justify-center font-bold text-sm shrink-0 font-mono shadow-xs">' +
              initials +
            '</div>' +
            '<div>' +
              '<div class="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">' +
                '<span>' + l.name + '</span>' +
              '</div>' +
              '<div class="text-[11px] ' + c.text + ' font-bold">' + l.role + '</div>' +
              '<div class="text-[10px] text-slate-400 mt-0.5 line-clamp-1">' + (l.description || 'Ban cán sự điều hành') + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">' +
            '<button onclick="openExecutiveModal(\\'' + l.id + '\\')" class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-orange-100 hover:text-orange-600 flex items-center justify-center text-xs transition" title="Sửa thông tin">✏️</button>' +
            '<button onclick="deleteExecutiveLeader(\\'' + l.id + '\\')" class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-rose-100 hover:text-rose-600 flex items-center justify-center text-xs transition" title="Xóa ban cán sự">🗑️</button>' +
          '</div>' +
        '</div>';
      }).join('');
    }

    function renderClubAnnouncements(filter = 'all') {
      activePostFilter = filter;
      const list = document.getElementById('club-announcements-list');
      const badge = document.getElementById('posts-count-badge');
      if (!list) return;

      // Update Filter Pills UI
      ['all', 'pinned', 'active'].forEach(f => {
        const btn = document.getElementById('post-filter-' + f);
        if (btn) {
          if (f === filter) {
            btn.className = 'px-2.5 py-1 rounded-lg bg-white text-slate-900 shadow-xs font-bold transition';
          } else {
            btn.className = 'px-2.5 py-1 rounded-lg hover:text-slate-900 transition';
          }
        }
      });

      const today = new Date().toISOString().split('T')[0];

      let posts = [...clubProfileState.feedPosts];

      // Sort pinned to top
      posts.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      if (filter === 'pinned') {
        posts = posts.filter(p => p.pinned);
      } else if (filter === 'active') {
        posts = posts.filter(p => !p.expiresAt || p.expiresAt >= today);
      }

      if (badge) badge.innerText = posts.length + ' Tin';

      if (posts.length === 0) {
        list.innerHTML = '<div class="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">Không có thông báo nào trong mục này.</div>';
        return;
      }

      list.innerHTML = posts.map(p => {
        const isExpired = p.expiresAt && p.expiresAt < today;
        const expiryBadge = p.expiresAt ? (
          isExpired
            ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-600 border border-rose-200">⏱️ Hết hạn: ' + p.expiresAt + '</span>'
            : '<span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">⏱️ Hạn: ' + p.expiresAt + ' (Hiệu lực)</span>'
        ) : '<span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500">⏱️ Vô thời hạn</span>';

        const pinnedBadge = p.pinned 
          ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 shadow-xs">📌 ĐÃ GHIM</span>'
          : '';

        const cardBorder = p.pinned 
          ? 'border-amber-300 bg-gradient-to-r from-amber-50/40 via-white to-white shadow-sm ring-1 ring-amber-300/40' 
          : 'border-slate-200/80 bg-slate-50/70 hover:bg-white';

        const dateStr = p.createdAt.includes('T') ? new Date(p.createdAt).toLocaleDateString('vi-VN') : p.createdAt;

        return '<div class="p-4 rounded-2xl ' + cardBorder + ' border text-xs space-y-2 transition relative group">' +
          '<div class="flex items-start justify-between gap-3">' +
            '<div class="flex items-center gap-2 flex-wrap">' +
              pinnedBadge +
              '<span class="font-extrabold text-slate-900 text-sm">' + p.title + '</span>' +
              '<span class="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-200/70 text-slate-700 font-mono">' + (p.category || 'THÔNG BÁO') + '</span>' +
            '</div>' +
            '<div class="flex items-center gap-2 shrink-0">' +
              expiryBadge +
              '<span class="text-[10px] text-slate-400 font-mono">' + dateStr + '</span>' +
            '</div>' +
          '</div>' +
          '<p class="text-slate-600 leading-relaxed pl-1">' + p.content + '</p>' +
          '<div class="flex items-center justify-between pt-1 border-t border-slate-100/80 text-[11px] text-slate-400">' +
            '<div>Người đăng: <strong class="text-slate-700">' + p.author + '</strong> (' + (p.authorRole || 'Ban Cán Sự') + ')</div>' +
            '<div class="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition">' +
              '<button onclick="togglePinAnnouncement(\\'' + p.id + '\\')" class="px-2 py-1 rounded-lg bg-white border border-slate-200 hover:bg-amber-50 hover:text-amber-800 text-[10px] font-bold transition flex items-center gap-1" title="' + (p.pinned ? 'Bỏ ghim' : 'Ghim lên đầu') + '">' +
                (p.pinned ? '📌 Bỏ ghim' : '📌 Ghim') +
              '</button>' +
              '<button onclick="openAnnouncementModal(\\'' + p.id + '\\')" class="px-2 py-1 rounded-lg bg-white border border-slate-200 hover:bg-orange-50 hover:text-orange-600 text-[10px] font-bold transition flex items-center gap-1">✏️ Sửa</button>' +
              '<button onclick="deleteAnnouncementPost(\\'' + p.id + '\\')" class="px-2 py-1 rounded-lg bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-[10px] font-bold transition flex items-center gap-1">🗑️ Xóa</button>' +
            '</div>' +
          '</div>' +
        '</div>';
      }).join('');
    }

    function filterClubPosts(category) {
      renderClubAnnouncements(category);
    }

    // Modal Handlers: Club Profile
    function openEditClubProfileModal() {
      document.getElementById('edit-club-name').value = clubProfileState.name;
      document.getElementById('edit-club-shortname').value = clubProfileState.shortName;
      document.getElementById('edit-club-slogan').value = clubProfileState.slogan;
      document.getElementById('edit-club-desc').value = clubProfileState.description;
      document.getElementById('edit-club-founded').value = clubProfileState.founded;
      document.getElementById('edit-club-location').value = clubProfileState.location;
      document.getElementById('edit-club-members').value = clubProfileState.totalMembers;
      document.getElementById('edit-club-km').value = clubProfileState.totalCumulativeKm;
      document.getElementById('modal-edit-club-profile')?.classList.remove('hidden');
    }

    function closeEditClubProfileModal() {
      document.getElementById('modal-edit-club-profile')?.classList.add('hidden');
    }

    async function saveClubProfile() {
      const name = document.getElementById('edit-club-name').value.trim();
      const shortName = document.getElementById('edit-club-shortname').value.trim();
      const slogan = document.getElementById('edit-club-slogan').value.trim();
      const description = document.getElementById('edit-club-desc').value.trim();
      const founded = document.getElementById('edit-club-founded').value.trim();
      const location = document.getElementById('edit-club-location').value.trim();
      const totalMembers = parseInt(document.getElementById('edit-club-members').value, 10) || 128;
      const totalCumulativeKm = parseFloat(document.getElementById('edit-club-km').value) || 42580.0;

      if (!name) return showToast('Vui lòng nhập tên Câu lạc bộ');

      clubProfileState.name = name;
      clubProfileState.shortName = shortName;
      clubProfileState.slogan = slogan;
      clubProfileState.description = description;
      clubProfileState.founded = founded;
      clubProfileState.location = location;
      clubProfileState.totalMembers = totalMembers;
      clubProfileState.totalCumulativeKm = totalCumulativeKm;

      try {
        await fetch('/api/clubs/sarc-sadc/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, shortName, slogan, description, totalMembers, totalCumulativeKm })
        });
      } catch (e) {}

      renderClubDisplay();
      closeEditClubProfileModal();
      showToast('✓ Đã cập nhật thiết lập thông tin Câu Lạc Bộ thành công!');
    }

    // Modal Handlers: Executive Leader
    function openExecutiveModal(leaderId) {
      const title = document.getElementById('exec-modal-title');
      const hiddenId = document.getElementById('exec-edit-id');
      const nameInput = document.getElementById('exec-input-name');
      const roleSelect = document.getElementById('exec-input-role');
      const descInput = document.getElementById('exec-input-desc');
      const emailInput = document.getElementById('exec-input-email');
      const phoneInput = document.getElementById('exec-input-phone');

      if (leaderId) {
        const l = clubProfileState.leaders.find(item => item.id === leaderId);
        if (l) {
          title.innerText = 'Cập Nhật Thành Viên Ban Cán Sự';
          hiddenId.value = l.id;
          nameInput.value = l.name;
          roleSelect.value = l.role;
          descInput.value = l.description || '';
          emailInput.value = l.email || '';
          phoneInput.value = l.phone || '';
        }
      } else {
        title.innerText = 'Thêm Thành Viên Ban Cán Sự Mới';
        hiddenId.value = '';
        nameInput.value = '';
        roleSelect.value = 'Ban Cán Sự';
        descInput.value = '';
        emailInput.value = '';
        phoneInput.value = '';
      }

      document.getElementById('modal-executive-leader')?.classList.remove('hidden');
    }

    function closeExecutiveModal() {
      document.getElementById('modal-executive-leader')?.classList.add('hidden');
    }

    async function saveExecutiveLeader() {
      const editId = document.getElementById('exec-edit-id').value;
      const name = document.getElementById('exec-input-name').value.trim();
      const role = document.getElementById('exec-input-role').value;
      const description = document.getElementById('exec-input-desc').value.trim();
      const email = document.getElementById('exec-input-email').value.trim();
      const phone = document.getElementById('exec-input-phone').value.trim();

      if (!name) return showToast('Vui lòng nhập họ tên thành viên ban cán sự');

      const avatar = name.split(' ').map(n=>n[0]).slice(-2).join('').toUpperCase();

      if (editId) {
        const l = clubProfileState.leaders.find(item => item.id === editId);
        if (l) {
          l.name = name;
          l.role = role;
          l.description = description;
          l.email = email;
          l.phone = phone;
          l.avatar = avatar;
        }
        try {
          await fetch('/api/clubs/sarc-sadc/leaders/' + editId, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, role, description, email, phone, avatar })
          });
        } catch (e) {}
        showToast('✓ Đã cập nhật thành viên Ban cán sự thành công!');
      } else {
        const newLeader = {
          id: 'lead-' + Date.now(),
          name, role, description, email, phone, avatar
        };
        clubProfileState.leaders.push(newLeader);
        try {
          await fetch('/api/clubs/sarc-sadc/leaders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newLeader)
          });
        } catch (e) {}
        showToast('✓ Đã bổ nhiệm thành viên Ban cán sự mới!');
      }

      renderClubExecutives();
      closeExecutiveModal();
    }

    async function deleteExecutiveLeader(leaderId) {
      if (!confirm('Bạn có chắc chắn muốn xóa thành viên này khỏi Ban Cán Sự CLB?')) return;
      clubProfileState.leaders = clubProfileState.leaders.filter(l => l.id !== leaderId);
      try {
        await fetch('/api/clubs/sarc-sadc/leaders/' + leaderId, { method: 'DELETE' });
      } catch (e) {}
      renderClubExecutives();
      showToast('✓ Đã xóa thành viên khỏi Ban Cán Sự!');
    }

    // Modal Handlers: Announcement Post
    function openAnnouncementModal(postId) {
      const title = document.getElementById('post-modal-title');
      const hiddenId = document.getElementById('post-edit-id');
      const titleInput = document.getElementById('post-input-title');
      const catSelect = document.getElementById('post-input-category');
      const expiresInput = document.getElementById('post-input-expires');
      const pinnedCheck = document.getElementById('post-input-pinned');
      const contentText = document.getElementById('post-input-content');
      const authorInput = document.getElementById('post-input-author');
      const roleInput = document.getElementById('post-input-author-role');

      if (postId) {
        const p = clubProfileState.feedPosts.find(item => item.id === postId);
        if (p) {
          title.innerText = 'Cập Nhật Thông Báo';
          hiddenId.value = p.id;
          titleInput.value = p.title;
          catSelect.value = p.category || 'THÔNG BÁO';
          expiresInput.value = p.expiresAt || '';
          pinnedCheck.checked = Boolean(p.pinned);
          contentText.value = p.content;
          authorInput.value = p.author;
          roleInput.value = p.authorRole || 'Ban Cán Sự';
        }
      } else {
        title.innerText = 'Đăng Thông Báo Mới';
        hiddenId.value = '';
        titleInput.value = '';
        catSelect.value = 'THÔNG BÁO';
        expiresInput.value = '2026-11-30';
        pinnedCheck.checked = false;
        contentText.value = '';
        authorInput.value = 'Hoàng Văn Minh';
        roleInput.value = 'Chủ nhiệm CLB';
      }

      document.getElementById('modal-announcement-post')?.classList.remove('hidden');
    }

    function closeAnnouncementModal() {
      document.getElementById('modal-announcement-post')?.classList.add('hidden');
    }

    async function saveAnnouncementPost() {
      const editId = document.getElementById('post-edit-id').value;
      const title = document.getElementById('post-input-title').value.trim();
      const category = document.getElementById('post-input-category').value;
      const expiresAt = document.getElementById('post-input-expires').value;
      const pinned = document.getElementById('post-input-pinned').checked;
      const content = document.getElementById('post-input-content').value.trim();
      const author = document.getElementById('post-input-author').value.trim();
      const authorRole = document.getElementById('post-input-author-role').value.trim();

      if (!title || !content) return showToast('Vui lòng nhập đầy đủ tiêu đề và nội dung thông báo');

      if (editId) {
        const p = clubProfileState.feedPosts.find(item => item.id === editId);
        if (p) {
          p.title = title;
          p.category = category;
          p.expiresAt = expiresAt;
          p.pinned = pinned;
          p.content = content;
          p.author = author;
          p.authorRole = authorRole;
        }
        try {
          await fetch('/api/clubs/sarc-sadc/posts/' + editId, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, category, expiresAt, pinned, content, author, authorRole })
          });
        } catch (e) {}
        showToast('✓ Đã cập nhật thông báo thành công!');
      } else {
        const newPost = {
          id: 'post-' + Date.now(),
          title, category, expiresAt, pinned, content, author, authorRole,
          createdAt: new Date().toISOString()
        };
        if (pinned) {
          clubProfileState.feedPosts.unshift(newPost);
        } else {
          clubProfileState.feedPosts.push(newPost);
        }
        try {
          await fetch('/api/clubs/sarc-sadc/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newPost)
          });
        } catch (e) {}
        showToast('✓ Đã đăng thông báo mới lên bảng tin CLB!');
      }

      renderClubAnnouncements(activePostFilter);
      closeAnnouncementModal();
    }

    async function deleteAnnouncementPost(postId) {
      if (!confirm('Bạn có chắc chắn muốn xóa thông báo này khỏi bảng tin?')) return;
      clubProfileState.feedPosts = clubProfileState.feedPosts.filter(p => p.id !== postId);
      try {
        await fetch('/api/clubs/sarc-sadc/posts/' + postId, { method: 'DELETE' });
      } catch (e) {}
      renderClubAnnouncements(activePostFilter);
      showToast('✓ Đã xóa thông báo khỏi bảng tin!');
    }

    async function togglePinAnnouncement(postId) {
      const p = clubProfileState.feedPosts.find(item => item.id === postId);
      if (!p) return;
      p.pinned = !p.pinned;
      try {
        await fetch('/api/clubs/sarc-sadc/posts/' + postId + '/pin', { method: 'PUT' });
      } catch (e) {}
      renderClubAnnouncements(activePostFilter);
      showToast(p.pinned ? '📌 Đã ghim thông báo lên đầu bảng tin!' : 'Đã bỏ ghim thông báo');
    }

    // Call renderClubDisplay on DOMContentLoaded
`;

code = code.replace(clientAnchor, clientScripts + '\n' + clientAnchor);
console.log('Added enhanced client scripts for club management!');

// Also call renderClubDisplay in window.addEventListener('DOMContentLoaded', ...)
const domContentLoadedAnchor = `handleHashRouting();`;
if (!code.includes('renderClubDisplay();')) {
  code = code.replace(domContentLoadedAnchor, `renderClubDisplay();\n      ${domContentLoadedAnchor}`);
  console.log('Registered renderClubDisplay() on DOMContentLoaded!');
}

fs.writeFileSync(mainTsPath, code, 'utf8');
console.log('Successfully written main.ts with all club management features!');

