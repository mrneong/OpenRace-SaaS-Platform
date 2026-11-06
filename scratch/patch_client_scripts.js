const fs = require('fs');
const path = require('path');

const mainPath = path.resolve(__dirname, '../workspace/backend/src/main.ts');
let content = fs.readFileSync(mainPath, 'utf8');

// 1. ADD MODALS BEFORE </body>
const modalsHtml = `
  <!-- MODAL: ADD CLUB MEMBER [6.2] -->
  <div id="modal-admin-add-member" class="hidden fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-100">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <span class="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">[6.2] Thêm Vận Động Viên</span>
          <h3 class="text-base font-extrabold text-slate-900 mt-1">Thêm Thành Viên Vào CLB</h3>
        </div>
        <button onclick="closeAddMemberModal()" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center transition">✕</button>
      </div>

      <div class="space-y-3 text-xs">
        <div>
          <label class="block font-bold text-slate-700 mb-1">Họ và Tên VĐV</label>
          <input type="text" id="add-member-name" placeholder="Ví dụ: Hoàng Đức Anh" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800">
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">Email</label>
          <input type="email" id="add-member-email" placeholder="duc.anh@sarc.vn" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800">
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">Vai Trò</label>
          <select id="add-member-role" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800">
            <option value="RUNNER" selected>VĐV (Runner)</option>
            <option value="ĐỘI TRƯỞNG">Đội Trưởng (Captain)</option>
            <option value="BAN CÁN SỰ">Ban Cán Sự (Staff)</option>
          </select>
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">Đội Thi Đấu (Kiểm soát sức chứa)</label>
          <select id="add-member-team" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800">
            <option value="team-dragons" selected>Team Dragons SADC (Còn 2 vị trí)</option>
            <option value="team-tigers">Team Tigers SADC (Còn 1 vị trí)</option>
            <option value="team-phoenix" disabled>Team Phoenix SARC (16/16 - ĐÃ ĐẦY)</option>
          </select>
        </div>
      </div>

      <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 text-xs">
        <button onclick="closeAddMemberModal()" class="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition">Hủy bỏ</button>
        <button onclick="submitAddMember()" class="px-5 py-2 rounded-xl bg-[#FF5B26] hover:bg-[#e04800] text-white font-bold shadow-md transition">
          + Xác Nhận Thêm
        </button>
      </div>
    </div>
  </div>

  <!-- MODAL: RACE SETUP WIZARD [7.1] -->
  <div id="modal-race-wizard" class="hidden fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 border border-slate-100 max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <span class="text-[10px] font-mono font-bold text-[#FF5B26] bg-orange-50 px-2 py-0.5 rounded-full">[7.1] Wizard Cấu Hình</span>
          <h3 class="text-base font-extrabold text-slate-900 mt-1">Thiết Lập Giải Đấu Mới</h3>
        </div>
        <button onclick="closeRaceWizardModal()" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center transition">✕</button>
      </div>

      <div class="space-y-3 text-xs">
        <div>
          <label class="block font-bold text-slate-700 mb-1">Tên Giải Chạy</label>
          <input type="text" id="wz-race-name" value="SARC Spring Half Marathon 2027" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800">
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Ngày Bắt Đầu</label>
            <input type="date" id="wz-race-start" value="2027-01-01" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Ngày Kết Thúc</label>
            <input type="date" id="wz-race-end" value="2027-01-31" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800">
          </div>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Cự Ly Tối Thiểu (km)</label>
            <input type="number" id="wz-min-dist" value="3.0" step="0.5" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Khóa Sàn Pace Hệ Thống</label>
            <input type="text" value="2:45 min/km (Khóa cứng)" disabled class="w-full bg-slate-100 border border-rose-200 rounded-xl px-3 py-2 text-xs font-bold text-rose-700 cursor-not-allowed">
          </div>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Chỉ Tiêu Tuần (km)</label>
            <input type="number" id="wz-target-km" value="25.0" step="1.0" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Tiền Phạt Thiếu km</label>
            <input type="text" id="wz-penalty" value="50.000 VNĐ" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800">
          </div>
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">Khen Thưởng Top 1 Hiện Vật</label>
          <input type="text" id="wz-reward" value="Áo thi đấu CLB SARC độc bản v2027" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800">
        </div>
      </div>

      <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 text-xs">
        <button onclick="closeRaceWizardModal()" class="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition">Hủy bỏ</button>
        <button onclick="submitRaceWizard()" class="px-5 py-2 rounded-xl bg-[#FF5B26] hover:bg-[#e04800] text-white font-bold shadow-md transition">
          🚀 Xuất Bản Giải Đấu Mới
        </button>
      </div>
    </div>
  </div>
`;

if (!content.includes('modal-admin-add-member')) {
  content = content.replace(
    '<!-- ADD MANUAL ACTIVITY MODAL -->',
    modalsHtml + '\n  <!-- ADD MANUAL ACTIVITY MODAL -->'
  );
}

// 2. ADD CLIENT LOGIC FUNCTIONS
const clientLogicCode = `
    // Subsystem 5, 6, 7, 8 Client Scripts
    function goToScreen(screenCode) {
      const codeToTab = {
        '1.1': 'dashboard', '1.2': 'dashboard', '1.3': 'dashboard', '1.4': 'dashboard', '1.5': 'dashboard',
        '2.1': 'arena', '2.2': 'arena', '2.3': 'arena', '2.4': 'arena', '2.5': 'arena',
        '3.1': 'activities', '3.2': 'activities', '3.3': 'activities', '3.4': 'activities',
        '4.1': 'club', '4.2': 'club', '4.3': 'club', '4.4': 'club',
        '5.1': 'finance', '5.2': 'finance', '5.3': 'finance', '5.4': 'finance',
        '6.1': 'club-manage', '6.2': 'club-manage', '6.3': 'club-manage',
        '7.1': 'rules', '7.2': 'rules', '7.3': 'rules', '7.4': 'rules', '7.5': 'rules', '7.6': 'rules', '7.7': 'rules',
        '8.1': 'admin', '8.2': 'admin', '8.3': 'admin', '8.4': 'admin'
      };

      const targetTab = codeToTab[screenCode] || 'dashboard';
      switchTab(targetTab);

      // Scroll to specific section if present
      const sectionEl = document.getElementById('section-' + screenCode.replace('.', '-'));
      if (sectionEl) {
        sectionEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    async function saveUserProfile() {
      const name = document.getElementById('profile-name')?.value || 'Nguyễn Văn A';
      const email = document.getElementById('profile-email')?.value || '';
      const phone = document.getElementById('profile-phone')?.value || '';
      const team = document.getElementById('profile-team')?.value || '';

      try {
        await fetch('/api/me/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone, team })
        });
      } catch (e) {}

      const h1 = document.querySelector('h1');
      if (h1) h1.innerText = 'Good morning, ' + name;
      showToast('Đã lưu cập nhật hồ sơ cá nhân thành công!');
    }

    async function saveClubSettings() {
      const name = document.getElementById('club-edit-name')?.value || '';
      const slogan = document.getElementById('club-edit-slogan')?.value || '';
      const description = document.getElementById('club-edit-desc')?.value || '';

      try {
        await fetch('/api/clubs/sarc-sadc', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, slogan, description })
        });
      } catch (e) {}

      showToast('Đã lưu cài đặt CLB & tài khoản VietQR thành công!');
    }

    let adminMembers = [
      { id: 'user-01', name: 'Nguyễn Văn A', email: 'athlete.nguyen@sarc.vn', role: 'ĐỘI TRƯỞNG', team: 'Team Phoenix SARC', status: 'ACTIVE' },
      { id: 'lead-01', name: 'Hoàng Văn Minh', email: 'minh.hoang@sarc.vn', role: 'CHỦ NHIỆM', team: 'Team Phoenix SARC', status: 'ACTIVE' },
      { id: 'lead-02', name: 'Trần Quốc Tuấn', email: 'tuan.tran@sarc.vn', role: 'BAN CÁN SỰ', team: 'Team Dragons SADC', status: 'ACTIVE' },
      { id: 'user-02', name: 'Trần Thị B', email: 'b.tran@sarc.vn', role: 'RUNNER', team: 'Team Dragons SADC', status: 'ACTIVE' },
      { id: 'user-03', name: 'Lê Hoàng C', email: 'c.le@sarc.vn', role: 'RUNNER', team: 'Team Tigers SADC', status: 'ACTIVE' }
    ];

    function renderAdminMemberList(query = '') {
      const tbody = document.getElementById('admin-members-tbody');
      if (!tbody) return;

      const roleFilter = document.getElementById('admin-role-filter')?.value || 'ALL';
      const q = query.toLowerCase();

      const filtered = adminMembers.filter(m => {
        const matchQ = m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
        const matchRole = roleFilter === 'ALL' || m.role === roleFilter;
        return matchQ && matchRole;
      });

      tbody.innerHTML = filtered.map(m => {
        const initials = m.name.split(' ').map(n=>n[0]).join('').slice(0, 2);
        const isLocked = m.status === 'LOCKED';
        return '<tr class="hover:bg-slate-50 transition">' +
          '<td class="py-2.5 px-3">' +
            '<div class="flex items-center gap-2">' +
              '<div class="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-700">' + initials + '</div>' +
              '<div>' +
                '<div class="font-bold text-slate-800">' + m.name + '</div>' +
                '<div class="text-[10px] text-slate-400 font-mono">' + m.email + '</div>' +
              '</div>' +
            '</div>' +
          '</td>' +
          '<td class="py-2.5 px-3 font-semibold text-slate-700">' +
            '<select onchange="adminChangeRole(\'' + m.id + '\', this.value)" class="bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5 text-[11px] font-bold">' +
              '<option value="RUNNER" ' + (m.role === 'RUNNER' ? 'selected' : '') + '>RUNNER</option>' +
              '<option value="ĐỘI TRƯỞNG" ' + (m.role === 'ĐỘI TRƯỞNG' ? 'selected' : '') + '>ĐỘI TRƯỞNG</option>' +
              '<option value="BAN CÁN SỰ" ' + (m.role === 'BAN CÁN SỰ' ? 'selected' : '') + '>BAN CÁN SỰ</option>' +
            '</select>' +
          '</td>' +
          '<td class="py-2.5 px-3 text-slate-600 font-medium">' + m.team + '</td>' +
          '<td class="py-2.5 px-3 text-center">' +
            '<span class="px-2 py-0.5 rounded-full text-[9px] font-bold ' + (isLocked ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200') + '">' +
              (isLocked ? 'BỊ KHÓA' : 'HOẠT ĐỘNG') +
            '</span>' +
          '</td>' +
          '<td class="py-2.5 px-3 text-right">' +
            '<div class="flex items-center justify-end gap-1.5">' +
              '<button onclick="adminToggleLock(\'' + m.id + '\')" class="px-2 py-0.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 text-[10px] font-semibold">' +
                (isLocked ? 'Mở khóa' : 'Khóa') +
              '</button>' +
              '<button onclick="adminDeleteMember(\'' + m.id + '\')" class="px-2 py-0.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-[10px] font-semibold">Xóa</button>' +
            '</div>' +
          '</td>' +
        '</tr>';
      }).join('');
    }

    function openAddMemberModal() {
      document.getElementById('modal-admin-add-member')?.classList.remove('hidden');
    }

    function closeAddMemberModal() {
      document.getElementById('modal-admin-add-member')?.classList.add('hidden');
    }

    async function submitAddMember() {
      const name = document.getElementById('add-member-name')?.value;
      const email = document.getElementById('add-member-email')?.value;
      const role = document.getElementById('add-member-role')?.value;
      const teamId = document.getElementById('add-member-team')?.value;

      if (!name) {
        showToast('Vui lòng nhập họ và tên thành viên!');
        return;
      }

      const teamName = teamId === 'team-dragons' ? 'Team Dragons SADC' : (teamId === 'team-tigers' ? 'Team Tigers SADC' : 'Team Phoenix SARC');

      const newM = {
        id: 'user-' + Date.now(),
        name,
        email: email || (name.toLowerCase().replace(/\\s+/g, '.') + '@sarc.vn'),
        role,
        team: teamName,
        status: 'ACTIVE'
      };

      try {
        await fetch('/api/clubs/sarc-sadc/members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newM)
        });
      } catch (e) {}

      adminMembers.unshift(newM);
      renderAdminMemberList();
      closeAddMemberModal();
      showToast('Đã thêm thành viên mới: ' + name);
    }

    function adminChangeRole(memberId, newRole) {
      const m = adminMembers.find(mem => mem.id === memberId);
      if (m) {
        m.role = newRole;
        showToast('Đã đổi vai trò thành viên sang: ' + newRole);
      }
    }

    function adminToggleLock(memberId) {
      const m = adminMembers.find(mem => mem.id === memberId);
      if (m) {
        m.status = m.status === 'LOCKED' ? 'ACTIVE' : 'LOCKED';
        renderAdminMemberList();
        showToast('Đã cập nhật trạng thái thành viên: ' + m.status);
      }
    }

    function adminDeleteMember(memberId) {
      adminMembers = adminMembers.filter(m => m.id !== memberId);
      renderAdminMemberList();
      showToast('Đã xóa thành viên khỏi danh sách CLB!');
    }

    function createInviteCodeModal() {
      showToast('Đã tạo mã mời mới: OR-SARC-2027 (Hạn dùng 30 ngày)');
    }

    function openRaceWizardModal() {
      document.getElementById('modal-race-wizard')?.classList.remove('hidden');
    }

    function closeRaceWizardModal() {
      document.getElementById('modal-race-wizard')?.classList.add('hidden');
    }

    async function submitRaceWizard() {
      const name = document.getElementById('wz-race-name')?.value || 'Giải Chạy Mới 2027';
      const startDate = document.getElementById('wz-race-start')?.value;
      const endDate = document.getElementById('wz-race-end')?.value;

      try {
        await fetch('/api/races', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, startDate, endDate })
        });
      } catch (e) {}

      closeRaceWizardModal();
      showToast('Đã thiết lập và xuất bản thành công giải đấu: ' + name);
    }

    function saveRaceRulesConfig() {
      showToast('Đã lưu cấu hình quy chế giải Mùa 10 thành công!');
    }

    let liveWaivers = [
      { id: 'wvr-01', runner: 'Trần Thị B', cycle: 'Tuần 1', reason: 'Chấn thương cổ chân có xác nhận y tế', admin: 'admin-chief-01', amount: '50.000đ' }
    ];

    function renderWaiversHistory() {
      const c = document.getElementById('waivers-history-container');
      if (!c) return;
      c.innerHTML = liveWaivers.map(w => {
        return '<div class="p-3 rounded-2xl bg-white border border-slate-200 flex items-center justify-between text-xs">' +
          '<div>' +
            '<div class="font-bold text-slate-800">' + w.runner + ' — ' + w.cycle + '</div>' +
            '<div class="text-slate-500 text-[11px]">Lý do: ' + w.reason + ' • Người duyệt: ' + w.admin + '</div>' +
          '</div>' +
          '<span class="text-purple-700 bg-purple-50 font-bold px-2 py-0.5 rounded-full border border-purple-200 text-[10px]">Đã miễn 50k</span>' +
        '</div>';
      }).join('');
    }

    async function submitPenaltyWaiver() {
      const userSelect = document.getElementById('waiver-user-select');
      const runnerName = userSelect ? userSelect.options[userSelect.selectedIndex].text : 'Vận động viên';
      const cycle = document.getElementById('waiver-cycle-select')?.value || 'Tuần 1';
      const reason = document.getElementById('waiver-reason-input')?.value || 'Chấn thương';

      try {
        await fetch('/api/waivers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ raceId: 'race-season-10', cycleId: cycle, userId: userSelect?.value || 'user-02', reason, adminId: 'admin-chief-01' })
        });
      } catch (e) {}

      liveWaivers.unshift({
        id: 'wvr-' + Date.now(),
        runner: runnerName.split(' (')[0],
        cycle: cycle === 'cycle-w1' ? 'Tuần 1' : 'Tuần 2',
        reason,
        admin: 'admin-chief-01',
        amount: '50.000đ'
      });
      renderWaiversHistory();
      showToast('Đã cấp quyết định miễn phạt 50.000đ cho ' + runnerName.split(' (')[0]);
    }

    function confirmRunnerPayment() {
      const badge = document.getElementById('runner-pay-status-badge');
      if (badge) {
        badge.className = 'px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800';
        badge.innerText = '⏳ CHỜ THỦ QUỸ XÁC NHẬN (PENDING)';
      }
      showToast('Đã gửi thông báo xác nhận chuyển khoản cho thủ quỹ!');
    }
`;

if (!content.includes('function goToScreen')) {
  content = content.replace(
    'function renderAdminAppeals() {',
    clientLogicCode + '\n    function renderAdminAppeals() {'
  );
}

// In DOMContentLoaded event listener, invoke renderAdminMemberList() & renderWaiversHistory()
content = content.replace(
  'renderClubMembers();',
  'renderClubMembers();\n      renderAdminMemberList();\n      renderWaiversHistory();'
);

fs.writeFileSync(mainPath, content, 'utf8');
console.log('Successfully injected modals and client scripts into main.ts!');

