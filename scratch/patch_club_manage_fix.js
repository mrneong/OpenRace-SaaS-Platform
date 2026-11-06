const fs = require('fs');

// 1. Update tab-club-manage.html
let tabClubManage = fs.readFileSync('scratch/screens/tab-club-manage.html', 'utf8');
tabClubManage = tabClubManage.replace('<option value="all">Tất cả vai trò</option>', '<option value="ALL">Tất cả vai trò</option>');
fs.writeFileSync('scratch/screens/tab-club-manage.html', tabClubManage, 'utf8');
console.log('tab-club-manage.html updated with option value="ALL"');

// 2. Update main.ts
const mainFile = 'workspace/backend/src/main.ts';
let mainTs = fs.readFileSync(mainFile, 'utf8');

// Replace tab-club-manage in main.ts
const manageStart = mainTs.indexOf('<div id="tab-club-manage"');
const rulesStart = mainTs.indexOf('<div id="tab-rules"');
if (manageStart !== -1 && rulesStart !== -1) {
  mainTs = mainTs.substring(0, manageStart) + tabClubManage.trim() + '\n\n      ' + mainTs.substring(rulesStart);
  console.log('Re-injected tab-club-manage.html into main.ts');
}

// Update renderAdminMemberList in mainTs
const oldRenderAdmin = `function renderAdminMemberList(query = '') {
      const tbody = document.getElementById('admin-members-tbody');
      if (!tbody) return;

      const roleFilter = document.getElementById('admin-role-filter')?.value || 'ALL';
      const q = query.toLowerCase();

      const filtered = adminMembers.filter(m => {
        const matchQ = m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
        const matchRole = roleFilter === 'ALL' || m.role === roleFilter;
        return matchQ && matchRole;
      });`;

const newRenderAdmin = `function renderAdminMemberList(query = '') {
      const tbody = document.getElementById('admin-members-tbody');
      if (!tbody) return;

      const roleFilter = (document.getElementById('admin-role-filter')?.value || 'ALL').toUpperCase();
      const q = (query || '').toLowerCase().trim();

      const filtered = adminMembers.filter(m => {
        const matchQ = m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
        const matchRole = roleFilter === 'ALL' || m.role.toUpperCase() === roleFilter;
        return matchQ && matchRole;
      });`;

mainTs = mainTs.replace(oldRenderAdmin, newRenderAdmin);

// In showSubScreen, add handler for club-manage section-6-2
const oldClubHandler = `} else if (normalizedTab === 'club') {
        if (sectionId === 'section-4-2') {
          filterClubRaces('live');
        } else if (sectionId === 'section-4-3') {
          renderClubMembers();
        }
      } else if (normalizedTab === 'rules') {`;

const newClubHandler = `} else if (normalizedTab === 'club') {
        if (sectionId === 'section-4-2') {
          filterClubRaces('live');
        } else if (sectionId === 'section-4-3') {
          renderClubMembers();
        }
      } else if (normalizedTab === 'club-manage') {
        if (sectionId === 'section-6-2') {
          renderAdminMemberList();
        }
      } else if (normalizedTab === 'rules') {`;

mainTs = mainTs.replace(oldClubHandler, newClubHandler);

fs.writeFileSync(mainFile, mainTs, 'utf8');
console.log('Successfully patched main.ts for member list rendering!');

