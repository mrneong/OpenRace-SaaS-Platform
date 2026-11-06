const fs = require('fs');
const path = require('path');

console.log('=== Step 1: Update club-hub.use-case.ts ===');
const useCasePath = path.resolve(__dirname, 'backend/src/application/use-cases/club-hub.use-case.ts');
let useCaseCode = fs.readFileSync(useCasePath, 'utf8');

// 1. Update ClubLeader interface
const oldLeaderInterface = `export interface ClubLeader {
  id: string;
  memberId?: string;
  name: string;
  role: 'CHỦ NHIỆM' | 'PHÓ CHỦ NHIỆM' | 'TRƯỞNG BAN CHUYÊN MÔN' | 'THỦ QUỸ' | 'BAN CÁN SỰ' | string;
  avatar: string;
  email: string;
  phone?: string;
  description?: string;
}`;

const newLeaderInterface = `export interface ClubLeader {
  id: string;
  memberId?: string;
  name: string;
  role: 'CHỦ NHIỆM' | 'PHÓ CHỦ NHIỆM' | 'TRƯỞNG BAN CHUYÊN MÔN' | 'THỦ QUỸ' | 'BAN CÁN SỰ' | string;
  avatar: string;
  avatarUrl?: string;
  email: string;
  phone?: string;
  description?: string;
}`;

if (useCaseCode.includes(oldLeaderInterface)) {
  useCaseCode = useCaseCode.replace(oldLeaderInterface, newLeaderInterface);
  console.log('Updated ClubLeader interface with avatarUrl');
}

// 2. Update default leaders in club-hub.use-case.ts
const oldLeadersInProfile = `      leaders: [
        {
          id: 'lead-01',
          name: 'Hoàng Văn Minh',
          role: 'CHỦ NHIỆM',
          avatar: 'HM',
          email: 'minh.hoang@sarc.vn',
          phone: '0901234567',
          description: 'Điều hành chung & Đối ngoại',
        },
        {
          id: 'lead-02',
          name: 'Trần Quốc Tuấn',
          role: 'TRƯỞNG BAN CHUYÊN MÔN',
          avatar: 'TT',
          email: 'tuan.tran@sarc.vn',
          phone: '0912345678',
          description: 'Huấn luyện & Thẩm định kỷ luật',
        },
        {
          id: 'lead-03',
          name: 'Lê Thu Thảo',
          role: 'THỦ QUỸ',
          avatar: 'LT',
          email: 'thao.le@sarc.vn',
          phone: '0987654321',
          description: 'Quản trị quỹ & Thu nộp VietQR',
        },
      ],`;

const newLeadersInProfile = `      leaders: [
        {
          id: 'lead-01',
          memberId: 'lead-01',
          name: 'Hoàng Văn Minh',
          role: 'CHỦ NHIỆM',
          avatar: 'HM',
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
          email: 'minh.hoang@sarc.vn',
          phone: '0901234567',
          description: 'Điều hành chung & Đối ngoại',
        },
        {
          id: 'lead-02',
          memberId: 'lead-02',
          name: 'Trần Quốc Tuấn',
          role: 'TRƯỞNG BAN CHUYÊN MÔN',
          avatar: 'TT',
          avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
          email: 'tuan.tran@sarc.vn',
          phone: '0912345678',
          description: 'Huấn luyện & Thẩm định kỷ luật',
        },
        {
          id: 'lead-03',
          memberId: 'lead-03',
          name: 'Lê Thu Thảo',
          role: 'THỦ QUỸ',
          avatar: 'LT',
          avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
          email: 'thao.le@sarc.vn',
          phone: '0987654321',
          description: 'Quản trị quỹ & Thu nộp VietQR',
        },
      ],`;

if (useCaseCode.includes(oldLeadersInProfile)) {
  useCaseCode = useCaseCode.replace(oldLeadersInProfile, newLeadersInProfile);
  console.log('Updated default leaders with avatarUrl and memberId in use case');
}

// 3. Update addLeader & updateLeader in use case
const oldAddLeader = `    const newLeader: ClubLeader = {
      id: leaderData.id || \`lead-\${Date.now()}\`,
      memberId: member ? member.id : leaderData.memberId,
      name,
      role: (leaderData.role as any) || 'BAN CÁN SỰ',
      avatar,
      email,
      phone,
      description: leaderData.description || 'Điều hành & Hỗ trợ hoạt động CLB'
    };`;

const newAddLeader = `    const avatarUrl = leaderData.avatarUrl || (member && (member as any).avatarUrl) || undefined;
    const newLeader: ClubLeader = {
      id: leaderData.id || \`lead-\${Date.now()}\`,
      memberId: member ? member.id : leaderData.memberId,
      name,
      role: (leaderData.role as any) || 'BAN CÁN SỰ',
      avatar,
      avatarUrl,
      email,
      phone,
      description: leaderData.description || 'Điều hành & Hỗ trợ hoạt động CLB'
    };`;

if (useCaseCode.includes(oldAddLeader)) {
  useCaseCode = useCaseCode.replace(oldAddLeader, newAddLeader);
  console.log('Updated addLeader with avatarUrl support');
}

const oldUpdateLeader = `    if (updates.name) leader.name = updates.name;
    if (updates.role) leader.role = updates.role as any;
    if (updates.description) leader.description = updates.description;
    if (updates.email) leader.email = updates.email;
    if (updates.phone) leader.phone = updates.phone;
    if (updates.avatar) leader.avatar = updates.avatar;`;

const newUpdateLeader = `    if (updates.name) leader.name = updates.name;
    if (updates.role) leader.role = updates.role as any;
    if (updates.description) leader.description = updates.description;
    if (updates.email) leader.email = updates.email;
    if (updates.phone) leader.phone = updates.phone;
    if (updates.avatar) leader.avatar = updates.avatar;
    if (updates.avatarUrl) leader.avatarUrl = updates.avatarUrl;
    if (updates.memberId) leader.memberId = updates.memberId;`;

if (useCaseCode.includes(oldUpdateLeader)) {
  useCaseCode = useCaseCode.replace(oldUpdateLeader, newUpdateLeader);
  console.log('Updated updateLeader with avatarUrl and memberId support');
}

fs.writeFileSync(useCasePath, useCaseCode, 'utf8');
console.log('useCasePath written successfully.');

console.log('=== Step 2: Update main.ts ===');
const mainTsPath = path.resolve(__dirname, 'backend/src/main.ts');
let mainCode = fs.readFileSync(mainTsPath, 'utf8');

// A. Update clubMembersList with avatarUrl
const oldClubMembersList = `    let clubMembersList = [
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

const newClubMembersList = `    let clubMembersList = [
      { id: 'user-01', name: 'Nguyễn Văn A', role: 'ĐỘI TRƯỞNG', roleBadge: 'bg-orange-100 text-[#FF5B26]', team: 'Team Phoenix SARC', km: 125.0, days: 18, strava: true, email: 'athlete.nguyen@sarc.vn', phone: '0903112233', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80' },
      { id: 'lead-01', name: 'Hoàng Văn Minh', role: 'CHỦ NHIỆM', roleBadge: 'bg-purple-100 text-purple-700', team: 'Team Phoenix SARC', km: 134.0, days: 20, strava: true, email: 'minh.hoang@sarc.vn', phone: '0901234567', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80' },
      { id: 'lead-02', name: 'Trần Quốc Tuấn', role: 'BAN CÁN SỰ', roleBadge: 'bg-blue-100 text-blue-700', team: 'Team Dragons SADC', km: 140.2, days: 21, strava: true, email: 'tuan.tran@sarc.vn', phone: '0912345678', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80' },
      { id: 'lead-03', name: 'Lê Thu Thảo', role: 'BAN CÁN SỰ', roleBadge: 'bg-emerald-100 text-emerald-700', team: 'Team Phoenix SARC', km: 108.0, days: 15, strava: true, email: 'thao.le@sarc.vn', phone: '0987654321', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80' },
      { id: 'user-02', name: 'Trần Thị B', role: 'RUNNER', roleBadge: 'bg-slate-100 text-slate-700', team: 'Team Dragons SADC', km: 112.5, days: 16, strava: true, email: 'b.tran@sarc.vn', phone: '0914556677', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80' },
      { id: 'user-03', name: 'Lê Hoàng C', role: 'RUNNER', roleBadge: 'bg-slate-100 text-slate-700', team: 'Team Tigers SADC', km: 98.0, days: 14, strava: true, email: 'c.le@sarc.vn', phone: '0988991122', avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80' },
      { id: 'user-04', name: 'Phạm Minh Đức', role: 'RUNNER', roleBadge: 'bg-slate-100 text-slate-700', team: 'Team Dragons SADC', km: 96.0, days: 14, strava: true, email: 'duc.pham@sarc.vn', phone: '0977112233', avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80' },
      { id: 'user-05', name: 'Hoàng Kim Dung', role: 'RUNNER', roleBadge: 'bg-slate-100 text-slate-700', team: 'Team Phoenix SARC', km: 88.5, days: 12, strava: true, email: 'dung.hoang@sarc.vn', phone: '0966445566', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80' },
      { id: 'user-06', name: 'Đặng Tuấn Kiệt', role: 'RUNNER', roleBadge: 'bg-slate-100 text-slate-700', team: 'Team Phoenix SARC', km: 78.0, days: 11, strava: true, email: 'kiet.dang@sarc.vn', phone: '0933778899', avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80' },
      { id: 'user-07', name: 'Vũ Hải Nam', role: 'RUNNER', roleBadge: 'bg-slate-100 text-slate-700', team: 'Team Phoenix SARC', km: 72.0, days: 10, strava: true, email: 'nam.vu@sarc.vn', phone: '0911889900', avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80' }
    ];`;

if (mainCode.includes(oldClubMembersList)) {
  mainCode = mainCode.replace(oldClubMembersList, newClubMembersList);
  console.log('Updated clubMembersList with avatarUrl');
}

// B. Update clubProfileState.leaders with avatarUrl
const oldLeadersArray = `      leaders: [
        { id: 'lead-01', memberId: 'lead-01', name: 'Hoàng Văn Minh', role: 'Chủ nhiệm CLB', avatar: 'HM', description: 'Điều hành chung & Đối ngoại', email: 'minh.hoang@sarc.vn', phone: '0901234567' },
        { id: 'lead-02', memberId: 'lead-02', name: 'Trần Quốc Tuấn', role: 'Trưởng Ban Chuyên Môn', avatar: 'TT', description: 'Huấn luyện & Thẩm định kỷ luật', email: 'tuan.tran@sarc.vn', phone: '0912345678' },
        { id: 'lead-03', memberId: 'lead-03', name: 'Lê Thu Thảo', role: 'Thủ Quỹ & Hậu Cần', avatar: 'LT', description: 'Quản trị quỹ & Thu nộp VietQR', email: 'thao.le@sarc.vn', phone: '0987654321' }
      ],`;

const newLeadersArray = `      leaders: [
        { id: 'lead-01', memberId: 'lead-01', name: 'Hoàng Văn Minh', role: 'Chủ nhiệm CLB', avatar: 'HM', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80', description: 'Điều hành chung & Đối ngoại', email: 'minh.hoang@sarc.vn', phone: '0901234567' },
        { id: 'lead-02', memberId: 'lead-02', name: 'Trần Quốc Tuấn', role: 'Trưởng Ban Chuyên Môn', avatar: 'TT', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80', description: 'Huấn luyện & Thẩm định kỷ luật', email: 'tuan.tran@sarc.vn', phone: '0912345678' },
        { id: 'lead-03', memberId: 'lead-03', name: 'Lê Thu Thảo', role: 'Thủ Quỹ & Hậu Cần', avatar: 'LT', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80', description: 'Quản trị quỹ & Thu nộp VietQR', email: 'thao.le@sarc.vn', phone: '0987654321' }
      ],`;

if (mainCode.includes(oldLeadersArray)) {
  mainCode = mainCode.replace(oldLeadersArray, newLeadersArray);
  console.log('Updated leaders array with avatarUrl in main.ts');
}

// C. Update renderClubExecutives() in main.ts
const oldRenderClubExecutives = `    function renderClubExecutives() {
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
            '<button data-id="' + l.id + '" onclick="openExecutiveModal(this.dataset.id)" class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-orange-100 hover:text-orange-600 flex items-center justify-center text-xs transition" title="Sửa thông tin">✏️</button>' +
            '<button data-id="' + l.id + '" onclick="deleteExecutiveLeader(this.dataset.id)" class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-rose-100 hover:text-rose-600 flex items-center justify-center text-xs transition" title="Xóa ban cán sự">🗑️</button>' +
          '</div>' +
        '</div>';
      }).join('');
    }`;

const newRenderClubExecutives = `    function renderClubExecutives() {
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
        'Cán Sự Đường Chạy & Sự Kiện': { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-200' },
        'Ban Cán Sự': { bg: 'bg-indigo-100', text: 'text-indigo-600', border: 'border-indigo-200' }
      };

      grid.innerHTML = clubProfileState.leaders.map(l => {
        const c = roleColors[l.role] || { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };
        const initials = l.avatar || l.name.split(' ').map(n=>n[0]).slice(-2).join('').toUpperCase();
        const avatarUrl = l.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';
        const email = l.email || 'bcs@sarc.vn';
        const phone = l.phone || '0901234567';
        const cleanPhone = phone.replace(/[^0-9]/g, '');

        return '<div class="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-orange-300 transition flex flex-col justify-between space-y-3 group">' +
          '<!-- Top Header: Avatar + Identity + Admin Action Buttons -->' +
          '<div class="flex items-start justify-between gap-2.5">' +
            '<div class="flex items-center gap-3 min-w-0">' +
              '<div class="relative w-12 h-12 rounded-2xl overflow-hidden shrink-0 shadow-xs border-2 border-white ring-1 ring-slate-200 bg-slate-100">' +
                '<img src="' + avatarUrl + '" alt="' + l.name + '" class="w-full h-full object-cover" onerror="this.style.display=\\'none\\'; this.nextElementSibling.style.display=\\'flex\\';">' +
                '<div class="hidden w-full h-full ' + c.bg + ' ' + c.text + ' items-center justify-center font-bold text-sm font-mono">' +
                  initials +
                '</div>' +
                '<span class="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-xs" title="Đang phụ trách"></span>' +
              '</div>' +
              '<div class="min-w-0">' +
                '<div class="font-extrabold text-slate-900 text-sm truncate flex items-center gap-1.5">' +
                  '<span>' + l.name + '</span>' +
                '</div>' +
                '<span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ' + c.bg + ' ' + c.text + ' border ' + c.border + ' mt-0.5">' +
                  l.role +
                '</span>' +
              '</div>' +
            '</div>' +
            '<div class="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition shrink-0">' +
              '<button data-id="' + l.id + '" onclick="openExecutiveModal(this.dataset.id)" class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-orange-100 hover:text-orange-600 flex items-center justify-center text-xs transition" title="Sửa thông tin">✏️</button>' +
              '<button data-id="' + l.id + '" onclick="deleteExecutiveLeader(this.dataset.id)" class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-rose-100 hover:text-rose-600 flex items-center justify-center text-xs transition" title="Xóa ban cán sự">🗑️</button>' +
            '</div>' +
          '</div>' +

          '<!-- Middle: Role & Responsibility Box -->' +
          '<div class="text-[11px] text-slate-600 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100/80 leading-relaxed">' +
            '<span class="text-slate-400 font-bold uppercase text-[9px] block mb-0.5">Trách Nhiệm Phụ Trách</span>' +
            '<div class="font-medium text-slate-700 line-clamp-2">' + (l.description || 'Ban cán sự điều hành CLB') + '</div>' +
          '</div>' +

          '<!-- Bottom: Contact Information (Email & Phone / Zalo) -->' +
          '<div class="pt-2 border-t border-slate-100 space-y-1.5 text-[11px]">' +
            '<div class="flex items-center justify-between text-slate-600 gap-1">' +
              '<div class="flex items-center gap-1.5 truncate">' +
                '<span class="text-xs">📧</span>' +
                '<a href="mailto:' + email + '" class="font-mono text-slate-700 hover:text-[#FF5B26] truncate hover:underline" title="' + email + '">' + email + '</a>' +
              '</div>' +
              '<a href="mailto:' + email + '" class="text-[10px] text-orange-600 font-bold hover:underline shrink-0">Gửi mail</a>' +
            '</div>' +
            '<div class="flex items-center justify-between text-slate-600 gap-1">' +
              '<div class="flex items-center gap-1.5">' +
                '<span class="text-xs">📞</span>' +
                '<a href="tel:' + phone + '" class="font-mono font-bold text-slate-800 hover:text-emerald-600 hover:underline">' + phone + '</a>' +
              '</div>' +
              '<a href="https://zalo.me/' + cleanPhone + '" target="_blank" class="inline-flex items-center gap-0.5 text-[10px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 font-bold hover:bg-blue-100 transition shrink-0">' +
                '<span>Zalo</span> ↗' +
              '</a>' +
            '</div>' +
          '</div>' +
        '</div>';
      }).join('');
    }`;

if (mainCode.includes(oldRenderClubExecutives)) {
  mainCode = mainCode.replace(oldRenderClubExecutives, newRenderClubExecutives);
  console.log('Updated renderClubExecutives() with photo avatars and contact info!');
}

// D. Update onSelectExecutiveMember & saveExecutiveLeader in main.ts
const oldOnSelectMember = `      const email = member.email || (member.id + '@sarc.vn');
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
      }`;

const newOnSelectMember = `      const email = member.email || (member.id + '@sarc.vn');
      const phone = member.phone || '0901234567';
      const avatarUrl = member.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';
      if (nameInput) nameInput.value = member.name;
      if (emailInput) emailInput.value = email;
      if (phoneInput) phoneInput.value = phone;

      const initials = member.name.split(' ').map(n=>n[0]).slice(-2).join('').toUpperCase();
      if (preview) {
        preview.innerHTML = '<div class="p-3.5 rounded-2xl bg-gradient-to-r from-orange-50/80 via-white to-amber-50/50 border border-orange-200/80 shadow-xs space-y-2.5">' +
          '<div class="flex items-center justify-between flex-wrap gap-2">' +
            '<div class="flex items-center gap-2.5">' +
              '<div class="relative w-12 h-12 rounded-2xl overflow-hidden shrink-0 shadow-xs border border-orange-200 bg-slate-100">' +
                '<img src="' + avatarUrl + '" alt="' + member.name + '" class="w-full h-full object-cover" onerror="this.style.display=\\'none\\'; this.nextElementSibling.style.display=\\'flex\\';">' +
                '<div class="hidden w-full h-full bg-gradient-to-br from-[#FF5B26] to-[#e04800] text-white items-center justify-center font-black text-sm font-mono">' +
                  initials +
                '</div>' +
                '<span class="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-xs"></span>' +
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
            '<div class="text-slate-600 truncate flex items-center gap-1">' +
              '<span class="text-slate-400">📧 Email:</span> <strong class="font-mono text-slate-800 truncate">' + email + '</strong>' +
            '</div>' +
            '<div class="text-slate-600 flex items-center gap-1">' +
              '<span class="text-slate-400">📞 SĐT:</span> <strong class="font-mono text-slate-800">' + phone + '</strong>' +
            '</div>' +
          '</div>' +
        '</div>';
      }`;

if (mainCode.includes(oldOnSelectMember)) {
  mainCode = mainCode.replace(oldOnSelectMember, newOnSelectMember);
  console.log('Updated onSelectExecutiveMember preview card with photo avatar!');
}

const oldSaveLeaderInMain = `      const name = member.name;
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
      }`;

const newSaveLeaderInMain = `      const name = member.name;
      const email = member.email || (member.id + '@sarc.vn');
      const phone = member.phone || '0901234567';
      const avatarUrl = member.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';
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
          l.avatarUrl = avatarUrl;
        }
        try {
          await fetch('/api/clubs/sarc-sadc/leaders/' + editId, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ memberId: member.id, name, role, description, email, phone, avatar, avatarUrl })
          });
        } catch (e) {}
        showToast('✓ Đã cập nhật thành viên Ban cán sự thành công!');
      } else {
        const newLeader = {
          id: 'lead-' + Date.now(),
          memberId: member.id,
          name, role, description, email, phone, avatar, avatarUrl
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
      }`;

if (mainCode.includes(oldSaveLeaderInMain)) {
  mainCode = mainCode.replace(oldSaveLeaderInMain, newSaveLeaderInMain);
  console.log('Updated saveExecutiveLeader() to persist avatarUrl!');
}

fs.writeFileSync(mainTsPath, mainCode, 'utf8');
console.log('main.ts updated successfully with avatars and contacts!');

