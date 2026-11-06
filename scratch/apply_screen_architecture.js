const fs = require('fs');
const vm = require('vm');

console.log('Loading tab HTML files from scratch/screens/ ...');
const tabArena = fs.readFileSync('scratch/screens/tab-arena.html', 'utf8');
const tabActivities = fs.readFileSync('scratch/screens/tab-activities.html', 'utf8');
const tabClub = fs.readFileSync('scratch/screens/tab-club.html', 'utf8');
const tabFinance = fs.readFileSync('scratch/screens/tab-finance.html', 'utf8');
const tabClubManage = fs.readFileSync('scratch/screens/tab-club-manage.html', 'utf8');
const tabRules = fs.readFileSync('scratch/screens/tab-rules.html', 'utf8');
const tabAdmin = fs.readFileSync('scratch/screens/tab-admin.html', 'utf8');

const mainFile = 'workspace/backend/src/main.ts';
let content = fs.readFileSync(mainFile, 'utf8');

console.log('Original main.ts lines:', content.split('\n').length);

const arenaStart = content.indexOf('<div id="tab-arena"');
const fabStart = content.indexOf('<!-- [1.5] Floating Action Button');

if (arenaStart === -1 || fabStart === -1) {
  console.error('Markers not found in main.ts!');
  process.exit(1);
}

const allNewTabs = [
  tabArena,
  tabActivities,
  tabClub,
  tabFinance,
  tabClubManage,
  tabRules,
  tabAdmin
].join('\n\n');

content = content.substring(0, arenaStart) + allNewTabs.trim() + '\n\n      ' + content.substring(fabStart);

console.log('Tabs HTML updated. Now updating navigation and subscreen engine in client JS...');

// Subsystem Screen Registry & Navigation Engine
const subscreenJs = `
    // Subsystem Screen Registry & Navigation Engine
    const SCREEN_REGISTRY = {
      'section-2-1': { tab: 'arena', code: '2.1', title: 'Hero & Đếm Ngược' },
      'section-2-2': { tab: 'arena', code: '2.2', title: 'Bảng Xếp Hạng Đội' },
      'section-2-3': { tab: 'arena', code: '2.3', title: 'Bảng Xếp Hạng Cá Nhân' },
      'section-2-4': { tab: 'arena', code: '2.4', title: 'Đội Thi Của Tôi' },
      'section-2-5': { tab: 'arena', code: '2.5', title: 'Luồng Trực Tiếp SSE' },

      'section-3-1': { tab: 'activities', code: '3.1', title: 'Toàn Bộ Bài Chạy' },
      'section-3-2': { tab: 'activities', code: '3.2', title: 'Lọc Theo Giải Đấu' },
      'section-3-3': { tab: 'activities', code: '3.3', title: 'Chi Tiết Thẩm Định & Trail' },
      'section-3-4': { tab: 'activities', code: '3.4', title: 'Trung Tâm Khiếu Nại' },

      'section-4-1': { tab: 'club', code: '4.1', title: 'Hồ Sơ & Bảng Tin CLB' },
      'section-4-2': { tab: 'club', code: '4.2', title: 'Danh Mục Giải CLB' },
      'section-4-3': { tab: 'club', code: '4.3', title: 'Thành Viên & Cơ Cấu Đội' },
      'section-4-4': { tab: 'club', code: '4.4', title: 'Mời TV & Chống In-App' },

      'section-5-1': { tab: 'finance', code: '5.1', title: 'Hồ Sơ Cá Nhân & GDPR' },
      'section-5-2': { tab: 'finance', code: '5.2', title: 'Kết Nối Strava & Logs' },
      'section-5-3': { tab: 'finance', code: '5.3', title: 'Sổ Nợ & Đóng Quỹ' },
      'section-5-4': { tab: 'finance', code: '5.4', title: 'Tùy Chọn Giao Diện' },

      'section-6-1': { tab: 'club-manage', code: '6.1', title: 'Cài Đặt CLB & VietQR' },
      'section-6-2': { tab: 'club-manage', code: '6.2', title: 'Quản Trị Thành Viên' },
      'section-6-3': { tab: 'club-manage', code: '6.3', title: 'Quản Lý Mã Mời' },
      'section-6-4': { tab: 'club-manage', code: '6.4', title: 'Nhận Diện Đội Trưởng' },

      'section-7-1': { tab: 'rules', code: '7.1', title: 'Thiết Lập Giải & Wizard' },
      'section-7-2': { tab: 'rules', code: '7.2', title: 'Phân Bổ Đội & Đội Trưởng' },
      'section-7-3': { tab: 'rules', code: '7.3', title: 'Phê Duyệt Khiếu Nại' },
      'section-7-4': { tab: 'rules', code: '7.4', title: 'Miễn Trừ Phạt Tuần' },
      'section-7-5': { tab: 'rules', code: '7.5', title: 'Quản Lý Quỹ & VietQR' },
      'section-7-6': { tab: 'rules', code: '7.6', title: 'Xuất Dữ Liệu Báo Cáo' },
      'section-7-7': { tab: 'rules', code: '7.7', title: 'Chốt Giải & Đóng Băng' },

      'section-8-1': { tab: 'admin', code: '8.1', title: 'Strava API Quota' },
      'section-8-2': { tab: 'admin', code: '8.2', title: 'Webhook Queue & DLQ' },
      'section-8-3': { tab: 'admin', code: '8.3', title: 'Quản Lý Tenants CLB' },
      'section-8-4': { tab: 'admin', code: '8.4', title: 'Recompute Toàn Sàn' }
    };

    function showSubScreen(tabId, sectionId) {
      const aliasMap = {
        '1': 'dashboard', '1.0': 'dashboard',
        '2': 'arena', '2.0': 'arena',
        '3': 'activities', '3.0': 'activities',
        '4': 'club', '4.0': 'club',
        '5': 'finance', '5.0': 'finance',
        '6': 'club-manage', '6.0': 'club-manage',
        '7': 'rules', '7.0': 'rules',
        '8': 'admin', '8.0': 'admin'
      };
      const normalizedTab = aliasMap[tabId] || tabId;
      switchTab(normalizedTab);

      // Close mobile sidebar drawer if open
      document.getElementById('main-sidebar')?.classList.add('-translate-x-[150%]');
      document.getElementById('main-sidebar')?.classList.remove('translate-x-0');
      document.getElementById('sidebar-backdrop')?.classList.add('hidden');

      if (normalizedTab === 'dashboard') {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('section-highlight');
          setTimeout(() => el.classList.remove('section-highlight'), 1600);
        }
        return;
      }

      const tabEl = document.getElementById('tab-' + normalizedTab);
      if (!tabEl) return;

      // Toggle sub-screen containers: ONLY target section visible
      const containers = tabEl.querySelectorAll('.sub-screen-container');
      containers.forEach(c => {
        if (c.id === sectionId) {
          c.classList.remove('hidden');
          c.classList.add('block');
        } else {
          c.classList.add('hidden');
          c.classList.remove('block');
        }
      });

      // Update Sub-nav pills in this tab
      const pills = tabEl.querySelectorAll('.subscreen-pill');
      pills.forEach(p => {
        if (p.getAttribute('data-section') === sectionId) {
          p.className = 'subscreen-pill px-3 py-1.5 rounded-xl font-bold transition shrink-0 bg-[#FF5B26] text-white shadow-sm';
        } else {
          p.className = 'subscreen-pill px-3 py-1.5 rounded-xl font-bold transition shrink-0 bg-white border border-slate-200/80 text-slate-700 hover:text-[#FF5B26]';
        }
      });

      // Update Breadcrumb Current Title
      const reg = SCREEN_REGISTRY[sectionId];
      const bc = document.getElementById('breadcrumb-current');
      if (bc && reg) {
        bc.innerText = (MODULE_TITLES[normalizedTab] || normalizedTab) + ' › ' + reg.title;
      }

      // Special tab handlers
      if (normalizedTab === 'arena') {
        if (sectionId === 'section-2-2') {
          document.getElementById('arena-team-view')?.classList.remove('hidden');
        } else if (sectionId === 'section-2-3') {
          document.getElementById('arena-ind-view')?.classList.remove('hidden');
          renderIndividualRunners();
        } else if (sectionId === 'section-2-4') {
          document.getElementById('arena-myteam-view')?.classList.remove('hidden');
          renderTeamRoster();
          renderTeamCheers();
        }
      } else if (normalizedTab === 'club') {
        if (sectionId === 'section-4-2') {
          filterClubRaces('live');
        } else if (sectionId === 'section-4-3') {
          renderClubMembers();
        }
      } else if (normalizedTab === 'rules') {
        if (sectionId === 'section-7-3') {
          renderAdminAppeals();
        } else if (sectionId === 'section-7-5') {
          renderAdminFinance();
        }
      }
    }
`;

// Replace goToSection
const oldGoToSectionRegex = /function goToSection\(tabId, sectionId\) \{[\s\S]*?setTimeout\(\(\) => el\.classList\.remove\('section-highlight'\), 1600\);\s*\}\s*\}, 100\);\s*\}/;
if (content.match(oldGoToSectionRegex)) {
  content = content.replace(oldGoToSectionRegex, `function goToSection(tabId, sectionId) {\n      showSubScreen(tabId, sectionId);\n    }`);
  console.log('Replaced goToSection');
}

// Replace goToScreen
const oldGoToScreenRegex = /function goToScreen\(screenCode\) \{[\s\S]*?sectionEl\.scrollIntoView\(\{ behavior: 'smooth', block: 'start' \}\);\s*\}\s*\}/;
if (content.match(oldGoToScreenRegex)) {
  const newGoToScreen = `function goToScreen(screenCode) {
      const codeToMeta = {
        '1.1': { tab: 'dashboard', section: 'section-1-1' },
        '1.2': { tab: 'dashboard', section: 'section-1-2' },
        '1.3': { tab: 'dashboard', section: 'section-1-3' },
        '1.4': { tab: 'dashboard', section: 'section-1-4' },
        '1.5': { tab: 'dashboard', section: 'section-1-5' },

        '2.1': { tab: 'arena', section: 'section-2-1' },
        '2.2': { tab: 'arena', section: 'section-2-2' },
        '2.3': { tab: 'arena', section: 'section-2-3' },
        '2.4': { tab: 'arena', section: 'section-2-4' },
        '2.5': { tab: 'arena', section: 'section-2-5' },

        '3.1': { tab: 'activities', section: 'section-3-1' },
        '3.2': { tab: 'activities', section: 'section-3-2' },
        '3.3': { tab: 'activities', section: 'section-3-3' },
        '3.4': { tab: 'activities', section: 'section-3-4' },

        '4.1': { tab: 'club', section: 'section-4-1' },
        '4.2': { tab: 'club', section: 'section-4-2' },
        '4.3': { tab: 'club', section: 'section-4-3' },
        '4.4': { tab: 'club', section: 'section-4-4' },

        '5.1': { tab: 'finance', section: 'section-5-1' },
        '5.2': { tab: 'finance', section: 'section-5-2' },
        '5.3': { tab: 'finance', section: 'section-5-3' },
        '5.4': { tab: 'finance', section: 'section-5-4' },

        '6.1': { tab: 'club-manage', section: 'section-6-1' },
        '6.2': { tab: 'club-manage', section: 'section-6-2' },
        '6.3': { tab: 'club-manage', section: 'section-6-3' },
        '6.4': { tab: 'club-manage', section: 'section-6-4' },

        '7.1': { tab: 'rules', section: 'section-7-1' },
        '7.2': { tab: 'rules', section: 'section-7-2' },
        '7.3': { tab: 'rules', section: 'section-7-3' },
        '7.4': { tab: 'rules', section: 'section-7-4' },
        '7.5': { tab: 'rules', section: 'section-7-5' },
        '7.6': { tab: 'rules', section: 'section-7-6' },
        '7.7': { tab: 'rules', section: 'section-7-7' },

        '8.1': { tab: 'admin', section: 'section-8-1' },
        '8.2': { tab: 'admin', section: 'section-8-2' },
        '8.3': { tab: 'admin', section: 'section-8-3' },
        '8.4': { tab: 'admin', section: 'section-8-4' }
      };

      const meta = codeToMeta[screenCode];
      if (meta) {
        showSubScreen(meta.tab, meta.section);
      } else {
        switchTab('dashboard');
      }
    }`;
  content = content.replace(oldGoToScreenRegex, newGoToScreen);
  console.log('Replaced goToScreen');
}

// Update switchTab to default to first subscreen
const oldSwitchTabEnd = /const bc = document\.getElementById\('breadcrumb-current'\);\s*if \(bc\) bc\.innerText = MODULE_TITLES\[tabId\] \|\| tabId;\s*\}/;
if (content.match(oldSwitchTabEnd)) {
  const newSwitchTabEnd = `const bc = document.getElementById('breadcrumb-current');
      if (bc) bc.innerText = MODULE_TITLES[tabId] || tabId;

      // If not dashboard, ensure at least one subscreen is visible
      if (tabId !== 'dashboard') {
        const tabEl = document.getElementById('tab-' + tabId);
        if (tabEl) {
          const visibleScreen = tabEl.querySelector('.sub-screen-container:not(.hidden)');
          if (!visibleScreen) {
            const firstScreen = tabEl.querySelector('.sub-screen-container');
            if (firstScreen) showSubScreen(tabId, firstScreen.id);
          }
        }
      }
    }`;
  content = content.replace(oldSwitchTabEnd, newSwitchTabEnd);
  console.log('Updated switchTab end');
}

// Update toggleArenaTab to showSubScreen
const oldToggleArenaTabRegex = /function toggleArenaTab\(type\) \{[\s\S]*?renderTeamCheers\(\);\s*\}\s*\}/;
if (content.match(oldToggleArenaTabRegex)) {
  const newToggleArena = `function toggleArenaTab(type) {
      if (type === 'team') {
        showSubScreen('arena', 'section-2-2');
      } else if (type === 'ind' || type === 'individual') {
        showSubScreen('arena', 'section-2-3');
      } else if (type === 'myteam') {
        showSubScreen('arena', 'section-2-4');
      } else if (type === 'live') {
        showSubScreen('arena', 'section-2-5');
      }
    }`;
  content = content.replace(oldToggleArenaTabRegex, newToggleArena);
  console.log('Updated toggleArenaTab');
}

// In filterClubRaces: ensure showSubScreen('club', 'section-4-2')
if (content.includes('function filterClubRaces(filter) {')) {
  content = content.replace('function filterClubRaces(filter) {', 'function filterClubRaces(filter) {\n      showSubScreen("club", "section-4-2");');
  console.log('Updated filterClubRaces');
}

// In filterClubMembers: ensure showSubScreen('club', 'section-4-3')
if (content.includes('function filterClubMembers(query) {')) {
  content = content.replace('function filterClubMembers(query) {', 'function filterClubMembers(query) {\n      showSubScreen("club", "section-4-3");');
  console.log('Updated filterClubMembers');
}

// In copyOnboardLink & selectJoinTeam: ensure showSubScreen('club', 'section-4-4')
if (content.includes('function copyOnboardLink() {')) {
  content = content.replace('function copyOnboardLink() {', 'function copyOnboardLink() {\n      showSubScreen("club", "section-4-4");');
  console.log('Updated copyOnboardLink');
}
if (content.includes('function selectJoinTeam(teamId, isFull) {')) {
  content = content.replace('function selectJoinTeam(teamId, isFull) {', 'function selectJoinTeam(teamId, isFull) {\n      showSubScreen("club", "section-4-4");');
  console.log('Updated selectJoinTeam');
}

// Inject SCREEN_REGISTRY and showSubScreen right before goToSection
if (!content.includes('const SCREEN_REGISTRY =')) {
  content = content.replace('function goToSection(tabId, sectionId) {', subscreenJs + '\n\n    function goToSection(tabId, sectionId) {');
  console.log('Injected SCREEN_REGISTRY and showSubScreen');
}

// Validate <script> in content with vm.Script
const scriptMatch = content.match(/<script>([\s\S]*?)<\/script>/);
if (scriptMatch) {
  try {
    new vm.Script(scriptMatch[1]);
    console.log('VM Script validation PASSED! No syntax errors.');
  } catch (err) {
    console.error('VM Script validation FAILED:', err.message);
    process.exit(1);
  }
}

// Write updated content to file
fs.writeFileSync(mainFile, content, 'utf8');
console.log('Successfully wrote updated workspace/backend/src/main.ts! Total lines:', content.split('\n').length);

