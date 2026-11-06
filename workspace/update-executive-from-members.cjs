const fs = require('fs');
const path = require('path');

console.log('=== Step 1: Update club-hub.use-case.ts ===');
const useCasePath = path.resolve(__dirname, 'backend/src/application/use-cases/club-hub.use-case.ts');
let useCaseCode = fs.readFileSync(useCasePath, 'utf8');

// 1. Update ClubLeader interface to have memberId
const oldClubLeaderInterface = `export interface ClubLeader {
  id: string;
  name: string;
  role: 'CHỦ NHIỆM' | 'PHÓ CHỦ NHIỆM' | 'TRƯỞNG BAN CHUYÊN MÔN' | 'THỦ QUỸ' | 'BAN CÁN SỰ' | string;
  avatar: string;
  email?: string;
  phone?: string;
  description?: string;
}`;

const newClubLeaderInterface = `export interface ClubLeader {
  id: string;
  memberId?: string;
  name: string;
  role: 'CHỦ NHIỆM' | 'PHÓ CHỦ NHIỆM' | 'TRƯỞNG BAN CHUYÊN MÔN' | 'THỦ QUỸ' | 'BAN CÁN SỰ' | string;
  avatar: string;
  email?: string;
  phone?: string;
  description?: string;
}`;

if (useCaseCode.includes(oldClubLeaderInterface)) {
  useCaseCode = useCaseCode.replace(oldClubLeaderInterface, newClubLeaderInterface);
  console.log('Updated ClubLeader interface with memberId');
}

// 2. Add lead-03 Lê Thu Thảo to membersList in club-hub.use-case.ts
const oldMembersListAnchor = `    {
      id: 'lead-02',
      name: 'Trần Quốc Tuấn',
      email: 'tuan.tran@sarc.vn',
      avatar: 'TT',
      role: 'BAN CÁN SỰ',
      teamId: 'team-dragons',
      teamName: 'Team Dragons SADC',
      totalKm: 140.2,
      diligentDays: 21,
      stravaConnected: true,
      joinedAt: '2021-06-01',
    },
  ];`;

const newMembersListAnchor = `    {
      id: 'lead-02',
      name: 'Trần Quốc Tuấn',
      email: 'tuan.tran@sarc.vn',
      avatar: 'TT',
      role: 'BAN CÁN SỰ',
      teamId: 'team-dragons',
      teamName: 'Team Dragons SADC',
      totalKm: 140.2,
      diligentDays: 21,
      stravaConnected: true,
      joinedAt: '2021-06-01',
    },
    {
      id: 'lead-03',
      name: 'Lê Thu Thảo',
      email: 'thao.le@sarc.vn',
      avatar: 'LT',
      role: 'BAN CÁN SỰ',
      teamId: 'team-phoenix',
      teamName: 'Team Phoenix SARC',
      totalKm: 108.0,
      diligentDays: 15,
      stravaConnected: true,
      joinedAt: '2021-07-01',
    },
    {
      id: 'user-04',
      name: 'Phạm Minh Đức',
      email: 'duc.pham@sarc.vn',
      avatar: 'MD',
      role: 'RUNNER',
      teamId: 'team-dragons',
      teamName: 'Team Dragons SADC',
      totalKm: 96.0,
      diligentDays: 14,
      stravaConnected: true,
      joinedAt: '2026-08-15',
    }
  ];`;

if (useCaseCode.includes(oldMembersListAnchor)) {
  useCaseCode = useCaseCode.replace(oldMembersListAnchor, newMembersListAnchor);
  console.log('Added Lê Thu Thảo and Pham Minh Đức to membersList in use case');
}

// 3. Update addLeader to support selecting from membersList
const oldAddLeader = `  /**
   * [4.1] Add Executive Leader
   */
  addLeader(slug: string, leaderData: Partial<ClubLeader>): ClubLeader {
    const profile = this.getClubProfile(slug);
    const newLeader: ClubLeader = {
      id: leaderData.id || \`lead-\${Date.now()}\`,
      name: leaderData.name || 'Thành viên Ban cán sự',
      role: (leaderData.role as any) || 'BAN CÁN SỰ',
      avatar: leaderData.avatar || (leaderData.name ? leaderData.name.split(' ').map(n=>n[0]).slice(-2).join('').toUpperCase() : 'BCS'),
      email: leaderData.email || 'bcs@sarc.vn',
      phone: leaderData.phone || '',
      description: leaderData.description || 'Điều hành & Hỗ trợ hoạt động CLB'
    };
    profile.leaders.push(newLeader);
    return newLeader;
  }`;

const newAddLeader = `  /**
   * [4.1] Add Executive Leader (Appointed from Club Member Roster)
   */
  addLeader(slug: string, leaderData: Partial<ClubLeader> & { memberId?: string }): ClubLeader {
    const profile = this.getClubProfile(slug);
    let member: ClubMemberItem | undefined;
    if (leaderData.memberId) {
      member = this.membersList.find((m) => m.id === leaderData.memberId);
    } else if (leaderData.name) {
      member = this.membersList.find((m) => m.name.toLowerCase() === leaderData.name!.toLowerCase());
    }

    const name = member ? member.name : (leaderData.name || 'Thành viên Ban cán sự');
    const email = member ? member.email : (leaderData.email || 'bcs@sarc.vn');
    const avatar = member ? member.avatar : (leaderData.avatar || (name ? name.split(' ').map(n=>n[0]).slice(-2).join('').toUpperCase() : 'BCS'));
    const phone = leaderData.phone || '';

    const newLeader: ClubLeader = {
      id: leaderData.id || \`lead-\${Date.now()}\`,
      memberId: member ? member.id : leaderData.memberId,
      name,
      role: (leaderData.role as any) || 'BAN CÁN SỰ',
      avatar,
      email,
      phone,
      description: leaderData.description || 'Điều hành & Hỗ trợ hoạt động CLB'
    };
    profile.leaders.push(newLeader);
    return newLeader;
  }`;

if (useCaseCode.includes(oldAddLeader)) {
  useCaseCode = useCaseCode.replace(oldAddLeader, newAddLeader);
  console.log('Updated addLeader in use case to link memberId');
}

fs.writeFileSync(useCasePath, useCaseCode, 'utf8');
console.log('useCasePath written successfully.');

console.log('=== Step 2: Update main.ts ===');
const mainTsPath = path.resolve(__dirname, 'backend/src/main.ts');
let mainCode = fs.readFileSync(mainTsPath, 'utf8');

// A. Update clubMembersList in main.ts
const oldClubMembersList = `    let clubMembersList = [
      { id: 'user-01', name: 'Nguyễn Văn A', role: 'ĐỘI TRƯỞNG', roleBadge: 'bg-orange-100 text-[#FF5B26]', team: 'Team Phoenix SARC', km: 125.0, days: 18, strava: true },
      { id: 'lead-01', name: 'Hoàng Văn Minh', role: 'CHỦ NHIỆM', roleBadge: 'bg-purple-100 text-purple-700', team: 'Team Phoenix SARC', km: 134.0, days: 20, strava: true },
      { id: 'lead-02', name: 'Trần Quốc Tuấn', role: 'BAN CÁN SỰ', roleBadge: 'bg-blue-100 text-blue-700', team: 'Team Dragons SADC', km: 140.2, days: 21, strava: true },
      { id: 'user-02', name: 'Trần Thị B', role: 'RUNNER', roleBadge: 'bg-slate-100 text-slate-700', team: 'Team Dragons SADC', km: 112.5, days: 16, strava: true },
      { id: 'user-03', name: 'Lê Hoàng C', role: 'RUNNER', roleBadge: 'bg-slate-100 text-slate-700', team: 'Team Tigers SADC', km: 98.0, days: 14, strava: true }
    ];`;

const newClubMembersList = `    let clubMembersList = [
      { id: 'user-01', name: 'Nguyễn Văn A', role: 'ĐỘI TRƯỞNG', roleBadge: 'bg-orange-100 text-[#FF5B26]', team: 'Team Phoenix SARC', km: 125.0, days: 18, strava: true, email: 'athlete.nguyen@sarc.vn', phone: '0903112233' },
      { id: 'lead-01', name: 'Hoàng Văn Minh', role: 'CHỦ NHIỆM', roleBadge: 'bg-purple-100 text-purple-700', team: 'Team Phoenix SARC', km: 134.0, days: 20, strava: true, email: 'minh.hoang@sarc.vn', phone: '0901234567' },
      { id: 'lead-02', name: 'Trần Quốc Tuấn', role: 'BAN CÁN SỰ', roleBadge: 'bg-blue-100 text-blue-700', team: 'Team Dragons SADC', km: 140.2, days: 21, strava: true, email: 'tuan.tran@sarc.vn', phone: '0912345678' },
      { id: 'lead-03', name: 'Lê Thu Thảo', role: 'BAN CÁN SỰ', roleBadge: 'bg-emerald-100 text-emerald-700', team: 'Team Phoenix SARC', km: 108.0, days: 15, strava: true, email: 'thao.le@sarc.vn', phone: '0987654321' },
      { id: 'user-02', name: 'Trần Thị B', role: 'RUNNER', roleBadge: 'bg-slate-100 text-slate-700', team: 'Team Dragons SADC', km: 112.5, days: 16, strava: true, email: 'b.tran@sarc.vn', phone: '0914556677' },
      { id: 'user-03', name: 'Lê Hoàng C', role: 'RUNNER', roleBadge: 'bg-slate-100 text-slate-700', team: 'Team Tigers SADC', km: 98.0, days: 14, strava: true, email: 'c.le@sarc.vn', phone: '0988991122' },
      { id: 'user-04', name: 'Phạm Minh Đức', role: 'RUNNER', roleBadge: 'bg-slate-100 text-slate-700', team: 'Team Dragons SADC', km: 96.0, days: 14, strava: true, email: 'duc.pham@sarc.vn', phone: '0977112233' },
      { id: 'user-05', name: 'Hoàng Kim Dung', role: 'RUNNER', roleBadge: 'bg-slate-100 text-slate-700', team: 'Team Phoenix SARC', km: 88.5, days: 12, strava: true, email: 'dung.hoang@sarc.vn', phone: '0966445566' },
      { id: 'user-06', name: 'Đặng Tuấn Kiệt', role: 'RUNNER', roleBadge: 'bg-slate-100 text-slate-700', team: 'Team Phoenix SARC', km: 78.0, days: 11, strava: true, email: 'kiet.dang@sarc.vn', phone: '0933778899' },
      { id: 'user-07', name: 'Vũ Hải Nam', role: 'RUNNER', roleBadge: 'bg-slate-100 text-slate-700', team: 'Team Phoenix SARC', km: 72.0, days: 10, strava: true, email: 'nam.vu@sarc.vn', phone: '0911889900' }
    ];`;

if (mainCode.includes(oldClubMembersList)) {
  mainCode = mainCode.replace(oldClubMembersList, newClubMembersList);
  console.log('Updated clubMembersList with full roster and contact info');
}

// B. Update clubProfileState.leaders in main.ts
const oldLeadersArray = `      leaders: [
        { id: 'lead-01', name: 'Hoàng Văn Minh', role: 'Chủ nhiệm CLB', avatar: 'HM', description: 'Điều hành chung & Đối ngoại', email: 'minh.hoang@sarc.vn', phone: '0901234567' },
        { id: 'lead-02', name: 'Trần Quốc Tuấn', role: 'Trưởng Ban Chuyên Môn', avatar: 'TT', description: 'Huấn luyện & Thẩm định kỷ luật', email: 'tuan.tran@sarc.vn', phone: '0912345678' },
        { id: 'lead-03', name: 'Lê Thu Thảo', role: 'Thủ Quỹ & Hậu Cần', avatar: 'LT', description: 'Quản trị quỹ & Thu nộp VietQR', email: 'thao.le@sarc.vn', phone: '0987654321' }
      ],`;

const newLeadersArray = `      leaders: [
        { id: 'lead-01', memberId: 'lead-01', name: 'Hoàng Văn Minh', role: 'Chủ nhiệm CLB', avatar: 'HM', description: 'Điều hành chung & Đối ngoại', email: 'minh.hoang@sarc.vn', phone: '0901234567' },
        { id: 'lead-02', memberId: 'lead-02', name: 'Trần Quốc Tuấn', role: 'Trưởng Ban Chuyên Môn', avatar: 'TT', description: 'Huấn luyện & Thẩm định kỷ luật', email: 'tuan.tran@sarc.vn', phone: '0912345678' },
        { id: 'lead-03', memberId: 'lead-03', name: 'Lê Thu Thảo', role: 'Thủ Quỹ & Hậu Cần', avatar: 'LT', description: 'Quản trị quỹ & Thu nộp VietQR', email: 'thao.le@sarc.vn', phone: '0987654321' }
      ],`;

if (mainCode.includes(oldLeadersArray)) {
  mainCode = mainCode.replace(oldLeadersArray, newLeadersArray);
  console.log('Updated leaders array with memberId');
}

// C. Update Modal HTML (#modal-executive-leader)
const oldModalExecutiveHtml = `  <!-- 2. EXECUTIVE LEADER MODAL (ADD / EDIT) -->
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
  </div>`;

const newModalExecutiveHtml = `  <!-- 2. EXECUTIVE LEADER MODAL (APPOINT FROM CLUB MEMBER ROSTER) -->
  <div id="modal-executive-leader" class="hidden fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 border border-slate-100">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <span class="text-[10px] font-bold uppercase tracking-wider text-orange-600">[4.1] Ban Cán Sự CLB</span>
          <h3 id="exec-modal-title" class="text-sm font-extrabold text-slate-900">Bổ Nhiệm Ban Cán Sự CLB</h3>
        </div>
        <button onclick="closeExecutiveModal()" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs">✕</button>
      </div>

      <input type="hidden" id="exec-edit-id" value="">
      <!-- Hidden inputs for backward compatibility -->
      <input type="hidden" id="exec-input-name" value="">
      <input type="hidden" id="exec-input-email" value="">
      <input type="hidden" id="exec-input-phone" value="">

      <div class="space-y-3.5 text-xs">
        <!-- 1. Select Member from Club Roster -->
        <div>
          <label class="block font-bold text-slate-700 mb-1 flex items-center justify-between">
            <span>Chọn thành viên từ Danh Sách CLB <span class="text-rose-500">*</span></span>
            <span class="text-[10px] font-normal text-slate-400">Không nhập tay • Chọn từ hội viên CLB</span>
          </label>
          <select id="exec-select-member" onchange="onSelectExecutiveMember(this.value)" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-slate-800">
            <!-- Dynamically populated by populateExecutiveMemberSelect() -->
          </select>
        </div>

        <!-- 2. Auto-Populated Member Profile Card Preview -->
        <div id="exec-member-preview">
          <!-- Live preview card rendered by onSelectExecutiveMember() -->
        </div>

        <!-- 3. Executive Role / Position -->
        <div>
          <label class="block font-bold text-slate-700 mb-1">Chức danh / Vai trò trong Ban Cán Sự <span class="text-rose-500">*</span></label>
          <select id="exec-input-role" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500">
            <option value="Chủ nhiệm CLB">Chủ nhiệm CLB</option>
            <option value="Phó Chủ nhiệm CLB">Phó Chủ nhiệm CLB</option>
            <option value="Trưởng Ban Chuyên Môn">Trưởng Ban Chuyên Môn</option>
            <option value="Thủ Quỹ & Hậu Cần">Thủ Quỹ & Hậu Cần</option>
            <option value="Trưởng Ban Truyền Thông">Trưởng Ban Truyền Thông</option>
            <option value="Cán Sự Đường Chạy & Sự Kiện">Cán Sự Đường Chạy & Sự Kiện</option>
            <option value="Ban Cán Sự">Ban Cán Sự</option>
          </select>
        </div>

        <!-- 4. Responsibilities / Description -->
        <div>
          <label class="block font-bold text-slate-700 mb-1">Trách nhiệm & Nhiệm vụ chính</label>
          <input type="text" id="exec-input-desc" placeholder="Ví dụ: Huấn luyện & Thẩm định kỷ luật, Quản trị quỹ..." class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500">
          <div class="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <span class="text-[10px] text-slate-400">Gợi ý nhanh:</span>
            <button type="button" onclick="document.getElementById('exec-input-desc').value='Điều hành chung & Đối ngoại'" class="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-orange-50 hover:text-orange-600 text-[10px] text-slate-600 transition">Điều hành chung</button>
            <button type="button" onclick="document.getElementById('exec-input-desc').value='Huấn luyện & Thẩm định kỷ luật'" class="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-orange-50 hover:text-orange-600 text-[10px] text-slate-600 transition">Chuyên môn</button>
            <button type="button" onclick="document.getElementById('exec-input-desc').value='Quản trị quỹ & Thu nộp VietQR'" class="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-orange-50 hover:text-orange-600 text-[10px] text-slate-600 transition">Thủ quỹ</button>
            <button type="button" onclick="document.getElementById('exec-input-desc').value='Truyền thông & Vận động phong trào'" class="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-orange-50 hover:text-orange-600 text-[10px] text-slate-600 transition">Truyền thông</button>
          </div>
        </div>

        <!-- 5. Notice Note -->
        <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 flex items-start gap-2">
          <span class="text-sm">ℹ️</span>
          <span>Thành viên Ban Điều Hành được bổ nhiệm trực tiếp từ danh sách thành viên hiện hữu của CLB. Dữ liệu thành tích chạy bộ và tài khoản Strava được hệ thống liên kết tự động.</span>
        </div>
      </div>

      <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 text-xs">
        <button onclick="closeExecutiveModal()" class="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition">Hủy bỏ</button>
        <button onclick="saveExecutiveLeader()" class="px-5 py-2 rounded-xl bg-[#FF5B26] hover:bg-[#e04800] text-white font-bold shadow-md transition flex items-center gap-1.5">
          <span>💾</span>
          <span>Lưu Ban Cán Sự</span>
        </button>
      </div>
    </div>
  </div>`;

if (mainCode.includes(oldModalExecutiveHtml)) {
  mainCode = mainCode.replace(oldModalExecutiveHtml, newModalExecutiveHtml);
  console.log('Updated #modal-executive-leader HTML in main.ts');
}

// D. Update Executive Leader Modal JS Functions in main.ts
const oldExecutiveJs = `    // Modal Handlers: Executive Leader
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
    }`;

const newExecutiveJs = `    // Modal Handlers: Executive Leader (Appointed from Club Members)
    function populateExecutiveMemberSelect(selectedMemberId = '') {
      const select = document.getElementById('exec-select-member');
      if (!select) return;
      let html = '<option value="">-- Chọn thành viên từ danh sách CLB --</option>';
      clubMembersList.forEach(m => {
        const isCurrentLeader = clubProfileState.leaders.some(l => l.memberId === m.id || l.id === m.id || l.name === m.name);
        const leaderTag = isCurrentLeader ? ' ★ (Đang là Ban Cán Sự)' : '';
        const isSel = (m.id === selectedMemberId || m.name === selectedMemberId) ? 'selected' : '';
        html += '<option value="' + m.id + '" ' + isSel + '>' + m.name + ' • ' + m.team + leaderTag + '</option>';
      });
      select.innerHTML = html;
    }

    function onSelectExecutiveMember(memberId) {
      const member = clubMembersList.find(m => m.id === memberId);
      const preview = document.getElementById('exec-member-preview');
      const nameInput = document.getElementById('exec-input-name');
      const emailInput = document.getElementById('exec-input-email');
      const phoneInput = document.getElementById('exec-input-phone');

      if (!member) {
        if (preview) {
          preview.innerHTML = '<div class="p-3.5 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center text-slate-400 text-xs">' +
            '<span>👆 Vui lòng chọn một thành viên từ danh sách bên trên để bổ nhiệm vào Ban Điều Hành.</span>' +
          '</div>';
        }
        if (nameInput) nameInput.value = '';
        if (emailInput) emailInput.value = '';
        if (phoneInput) phoneInput.value = '';
        return;
      }

      const email = member.email || (member.id + '@sarc.vn');
      const phone = member.phone || '0901234567';
      if (nameInput) nameInput.value = member.name;
      if (emailInput) emailInput.value = email;
      if (phoneInput) phoneInput.value = phone;

      const initials = member.name.split(' ').map(n=>n[0]).slice(-2).join('').toUpperCase();
      if (preview) {
        preview.innerHTML = '<div class="p-3.5 rounded-2xl bg-gradient-to-r from-orange-50/80 via-white to-amber-50/50 border border-orange-200/80 shadow-xs space-y-2.5">' +
          '<div class="flex items-center justify-between flex-wrap gap-2">' +
            '<div class="flex items-center gap-2.5">' +
              '<div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF5B26] to-[#e04800] text-white flex items-center justify-center font-black text-sm shadow-xs font-mono">' +
                initials +
              '</div>' +
              '<div>' +
                '<div class="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">' +
                  '<span>' + member.name + '</span>' +
                  '<span class="px-2 py-0.5 rounded-md text-[9px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">✓ Hội viên CLB</span>' +
                '</div>' +
                '<div class="text-[11px] text-slate-500 font-medium">' +
                  member.team + ' • <span class="font-mono text-orange-600 font-bold">' + (member.km || 0) + ' km</span> • ' + (member.days || 0) + ' ngày chuyên cần' +
                '</div>' +
              '</div>' +
            '</div>' +
            '<span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-orange-100 text-[#FF5B26] border border-orange-200">' +
              (member.role || 'RUNNER') +
            '</span>' +
          '</div>' +
          '<div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-orange-100/80 text-[11px]">' +
            '<div class="text-slate-600 truncate">' +
              '<span class="text-slate-400">📧 Email:</span> <strong class="font-mono text-slate-800">' + email + '</strong>' +
            '</div>' +
            '<div class="text-slate-600">' +
              '<span class="text-slate-400">📞 SĐT:</span> <strong class="font-mono text-slate-800">' + phone + '</strong>' +
            '</div>' +
          '</div>' +
        '</div>';
      }
    }

    function openExecutiveModal(leaderId) {
      const title = document.getElementById('exec-modal-title');
      const hiddenId = document.getElementById('exec-edit-id');
      const roleSelect = document.getElementById('exec-input-role');
      const descInput = document.getElementById('exec-input-desc');

      if (leaderId) {
        const l = clubProfileState.leaders.find(item => item.id === leaderId);
        if (l) {
          title.innerText = 'Cập Nhật Thành Viên Ban Cán Sự';
          hiddenId.value = l.id;
          roleSelect.value = l.role;
          descInput.value = l.description || '';

          // Match leader to member in clubMembersList
          const matchedMember = clubMembersList.find(m => m.id === l.memberId || m.name === l.name || m.id === l.id);
          const memberId = matchedMember ? matchedMember.id : (l.memberId || l.id);
          populateExecutiveMemberSelect(memberId);
          onSelectExecutiveMember(memberId);
        }
      } else {
        title.innerText = 'Bổ Nhiệm Thành Viên Ban Cán Sự Mới';
        hiddenId.value = '';
        roleSelect.value = 'Ban Cán Sự';
        descInput.value = '';
        populateExecutiveMemberSelect('');
        onSelectExecutiveMember('');
      }

      document.getElementById('modal-executive-leader')?.classList.remove('hidden');
    }

    function closeExecutiveModal() {
      document.getElementById('modal-executive-leader')?.classList.add('hidden');
    }

    async function saveExecutiveLeader() {
      const editId = document.getElementById('exec-edit-id').value;
      const memberId = document.getElementById('exec-select-member').value;
      const role = document.getElementById('exec-input-role').value;
      const description = document.getElementById('exec-input-desc').value.trim() || 'Ban cán sự điều hành CLB';

      if (!memberId) {
        return showToast('Vui lòng chọn một thành viên từ danh sách CLB');
      }

      const member = clubMembersList.find(m => m.id === memberId);
      if (!member) {
        return showToast('Không tìm thấy thông tin thành viên đã chọn');
      }

      const name = member.name;
      const email = member.email || (member.id + '@sarc.vn');
      const phone = member.phone || '0901234567';
      const avatar = name.split(' ').map(n=>n[0]).slice(-2).join('').toUpperCase();

      if (editId) {
        const l = clubProfileState.leaders.find(item => item.id === editId);
        if (l) {
          l.memberId = member.id;
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
            body: JSON.stringify({ memberId: member.id, name, role, description, email, phone, avatar })
          });
        } catch (e) {}
        showToast('✓ Đã cập nhật thành viên Ban cán sự thành công!');
      } else {
        const newLeader = {
          id: 'lead-' + Date.now(),
          memberId: member.id,
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
        showToast('✓ Đã bổ nhiệm ' + name + ' vào Ban cán sự CLB!');
      }

      renderClubExecutives();
      closeExecutiveModal();
    }`;

if (mainCode.includes(oldExecutiveJs)) {
  mainCode = mainCode.replace(oldExecutiveJs, newExecutiveJs);
  console.log('Updated Executive Modal JS functions in main.ts');
}

fs.writeFileSync(mainTsPath, mainCode, 'utf8');
console.log('main.ts updated successfully!');

