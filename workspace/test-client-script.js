
    let isVnd = false;

    // Submenu mapping for each of the 8 main modules
    const SUB_MENUS = {
      'dashboard': [
        { code: '', name: 'Đồng bộ Strava', section: 'section-1-1' },
        { code: '', name: 'Chỉ tiêu tuần', section: 'section-1-2' },
        { code: '', name: 'Cảnh báo phạt sớm', section: 'section-1-3' },
        { code: '', name: 'Carousel giải', section: 'section-1-4' },
        { code: '', name: 'Lối tắt quét QR', section: 'section-1-5' }
      ],
      'arena': [
        { code: '', name: 'Hero & Đếm ngược', section: 'section-2-1' },
        { code: '', name: 'BXH Đội (Hạng 1 & 2)', section: 'section-2-2' },
        { code: '', name: 'BXH Cá nhân (Áo SARC)', section: 'section-2-3' },
        { code: '', name: 'Đội của tôi', section: 'section-2-4' },
        { code: '', name: 'Live SSE', section: 'section-2-1' }
      ],
      'activities': [
        { code: '', name: 'Toàn bộ bài chạy', section: 'section-3-1' },
        { code: '', name: 'Bộ lọc giải', section: 'section-3-1' },
        { code: '', name: 'Chi tiết thẩm định', section: 'section-3-3' },
        { code: '', name: 'Gửi khiếu nại', section: 'section-3-3' }
      ],
      'club': [
        { code: '', name: 'Hồ sơ & Bảng tin', section: 'section-4-1' },
        { code: '', name: 'Danh mục giải', section: 'section-4-1' },
        { code: '', name: 'Thành viên & Đội', section: 'section-4-3' },
        { code: '', name: 'Mời TV (Chống In-App)', section: 'section-4-4' }
      ],
      'finance': [
        { code: '', name: 'Tài khoản & GDPR', section: 'section-5-1' },
        { code: '', name: 'Kết nối Strava', section: 'section-5-1' },
        { code: '', name: 'Sổ nợ & Đóng quỹ', section: 'section-5-3' },
        { code: '', name: 'Tùy chọn giao diện', section: 'section-5-4' }
      ],
      'club-manage': [
        { code: '', name: 'Cài đặt CLB & VietQR', section: 'section-6-1' },
        { code: '', name: 'Duyệt thành viên', section: 'section-6-2' },
        { code: '', name: 'Quản lý mã mời', section: 'section-6-2' }
      ],
      'rules': [
        { code: '', name: 'Wizard 7 bước (Pace 2:45)', section: 'section-7-1' },
        { code: '', name: 'Phân bổ Đội', section: 'section-7-1' },
        { code: '', name: 'Duyệt khiếu nại', section: 'section-7-1' },
        { code: '', name: 'Miễn trừ phạt', section: 'section-7-1' },
        { code: '', name: 'Đối soát quỹ', section: 'section-7-1' }
      ],
      'admin': [
        { code: '', name: 'Strava Quota', section: 'section-8-1' },
        { code: '', name: 'Webhook Queue', section: 'section-8-2' },
        { code: '', name: 'Quản lý Tenant CLB', section: 'section-8-3' },
        { code: '', name: 'Recompute Toàn Sàn', section: 'section-7-3' }
      ]
    };

    const MODULE_TITLES = {
      'dashboard': 'Tổng Quan Runner',
      'arena': '[2.0] Giải Đấu & Đấu Trường (Race Arena)',
      'activities': '[3.0] Nhật Ký Bài Chạy & Thẩm Định (Activity Feed)',
      'club': '[4.0] Không Gian Câu Lạc Bộ (Club Hub)',
      'finance': '[5.0] Tài Khoản Cá Nhân & Cài Đặt (Profile & Prefs)',
      'club-manage': '[6.0] Quản Trị Câu Lạc Bộ (Club Management)',
      'rules': '[7.0] Quản Trị Giải Đấu (Race Operations)',
      'admin': '[8.0] Hệ Thống Toàn Sàn (Super Admin Portal)'
    };

    function updateSubNav(tabId) {
      const bar = document.getElementById('sub-nav-bar');
      if (!bar) return;
      if (tabId === 'dashboard') {
        bar.classList.remove('hidden');
        bar.classList.add('flex');
        const subs = SUB_MENUS['dashboard'] || [];
        bar.innerHTML = '<span class="text-slate-400 font-mono text-[10px] shrink-0">Chức năng:</span>' +
          subs.map(s => {
            return '<button onclick="goToSection(&quot;dashboard&quot;, &quot;' + s.section + '&quot;)" class="px-2.5 py-1 rounded-full bg-white hover:bg-orange-50 hover:text-[#FF5B26] border border-slate-200 transition shrink-0 font-medium text-[11px]">' +
              (s.code ? '<span class="font-bold text-[#FF5B26] font-mono mr-1">' + s.code + '</span>' : '') + s.name +
            '</button>';
          }).join('');
      } else {
        bar.classList.add('hidden');
        bar.classList.remove('flex');
      }

      const bc = document.getElementById('breadcrumb-current');
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
    }

    
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
      if (normalizedTab === 'club') renderClubDisplay();

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
      } else if (normalizedTab === 'club-manage') {
        if (sectionId === 'section-6-2') {
          renderAdminMemberList();
        }
      } else if (normalizedTab === 'rules') {
        if (sectionId === 'section-7-3') {
          renderAdminAppeals();
        } else if (sectionId === 'section-7-5') {
          renderAdminFinance();
        }
      }
    }


    function goToSection(tabId, sectionId) {
      showSubScreen(tabId, sectionId);
    }

    function toggleUnit() {
      isVnd = !isVnd;
      const valEl = document.getElementById('balance-val');
      const unitEl = document.getElementById('balance-unit');
      const labelEl = document.getElementById('unit-label');
      const btnText = document.getElementById('unit-btn-text');

      if (valEl) valEl.innerText = isVnd ? '9,600,000' : '3,170.00';
      if (unitEl) unitEl.innerText = isVnd ? 'VND' : 'KM';
      if (labelEl) labelEl.innerText = isVnd ? 'Tổng Quỹ Giải Đấu' : 'Tổng Cự Ly Giải Đấu';
      if (btnText) btnText.innerText = isVnd ? '🇻🇳 VND' : '🏃 KM';
    }

    function switchTab(tabId) {
      // Normalize aliases
      const aliasMap = {
        '1': 'dashboard', '1.0': 'dashboard', '1.A': 'dashboard',
        '1.B': 'strava-sync', 'strava-sync': 'strava-sync', 'sync-logs': 'strava-sync',
        '2': 'arena', '2.0': 'arena', '2.A': 'arena', '2.B': 'arena',
        '3': 'activities', '3.0': 'activities', '3.A': 'activities', '3.B': 'activities',
        '4': 'club', '4.0': 'club', '4.A': 'club', '4.B': 'club',
        '5': 'finance', '5.0': 'finance', '5.A': 'finance', '5.B': 'finance', 'me': 'finance',
        '6': 'rules', '6.0': 'rules', '6.A': 'rules', '6.B': 'rules', 'rules': 'rules', 'race-ops': 'rules',
        '7': 'teams', '7.0': 'teams', '7.A': 'teams', '7.B': 'teams', 'teams': 'teams',
        '8': 'social', '8.0': 'social', '8.A': 'social', '8.B': 'social', 'social': 'social', 'community': 'social',
        '9': 'chat', '9.0': 'chat', '9.A': 'chat', '9.B': 'chat', 'chat': 'chat', 'pacerbot': 'chat', 'banter': 'chat',
        '10': 'governance', '10.0': 'governance', '10.A': 'governance', '10.B': 'governance', 'governance': 'governance', 'club-erp': 'governance',
        'admin': 'admin', 'super-admin': 'admin',
        'club-manage': 'club-manage'
      };

      const resolvedId = aliasMap[tabId] || tabId;

      document.querySelectorAll('.tab-content').forEach(el => {
        el.classList.remove('active');
      });

      const target = document.getElementById('tab-' + resolvedId);
      if (target) {
        target.classList.add('active');
      }

      // Update Nav Buttons
      document.querySelectorAll('.nav-btn').forEach(b => {
        b.className = 'nav-btn px-3 py-1.5 rounded-full text-xs font-semibold transition text-slate-600 hover:text-slate-900 hover:bg-slate-100 shrink-0 flex items-center gap-1';
      });
      const activeNav = document.getElementById('nav-' + resolvedId);
      if (activeNav) {
        activeNav.className = 'nav-btn px-3 py-1.5 rounded-full text-xs font-bold transition bg-[#18181B] text-white shadow-sm shrink-0 flex items-center gap-1';
      }

      // Update Sidebar Buttons
      document.querySelectorAll('.sidebar-btn').forEach(b => {
        b.className = 'sidebar-btn w-full p-2.5 rounded-2xl flex items-center justify-between font-bold text-left transition text-slate-700 hover:bg-slate-100';
      });
      const activeSide = document.getElementById('sidebar-' + resolvedId);
      if (activeSide) {
        activeSide.className = 'sidebar-btn w-full p-2.5 rounded-2xl flex items-center justify-between font-bold text-left transition bg-[#18181B] text-white shadow-sm';
      }

      if (resolvedId === 'club-manage') {
        renderAdminMemberList();
      }
      if (resolvedId === 'club') {
        renderClubMembers();
        renderClubDisplay();
      }

      updateSubNav(resolvedId);
      syncUrlHash(resolvedId);
    }

    // Subsystem [2.0] RACE ARENA STATE & HANDLERS
    let arenaRunnersData = [
      { userId: 'user-01', name: 'Nguyễn Văn A', team: 'Team Phoenix SARC', km: 125.0, days: 18, pace: '5:15', rank: 1, isSelf: true, reward: '👑 Dẫn Đầu Nhận Áo SARC' },
      { userId: 'user-02', name: 'Trần Thị B', team: 'Team Dragons SADC', km: 118.0, days: 16, pace: '5:24', rank: 2, isSelf: false },
      { userId: 'user-03', name: 'Lê Hoàng C', team: 'Team Tigers SADC', km: 105.0, days: 15, pace: '5:32', rank: 3, isSelf: false },
      { userId: 'user-04', name: 'Phạm Minh Đức', team: 'Team Dragons SADC', km: 96.0, days: 14, pace: '5:40', rank: 4, isSelf: false },
      { userId: 'user-05', name: 'Hoàng Kim Dung', team: 'Team Phoenix SARC', km: 88.5, days: 12, pace: '5:45', rank: 5, isSelf: false },
      { userId: 'user-06', name: 'Đặng Tuấn Kiệt', team: 'Team Phoenix SARC', km: 78.0, days: 11, pace: '5:50', rank: 6, isSelf: false },
      { userId: 'user-07', name: 'Vũ Hải Nam', team: 'Team Phoenix SARC', km: 72.0, days: 10, pace: '6:00', rank: 7, isSelf: false },
    ];

    let teamCheersData = [
      { author: 'Nguyễn Văn A (Captain)', msg: 'Toàn đội duy trì phong độ nhé! Cự ly đang dẫn đầu toàn giải!', time: '10 phút trước' },
      { author: 'Hoàng Kim Dung', msg: 'Sáng mai 5h Hồ Tây chạy tiếp nhé mọi người ơi!', time: '25 phút trước' },
      { author: 'Đặng Tuấn Kiệt', msg: 'Đã hoàn thành bài chạy 10km sáng nay, điểm chuyên cần +1!', time: '1 giờ trước' },
    ];

    function toggleArenaTab(type) {
      if (type === 'team') {
        showSubScreen('arena', 'section-2-2');
      } else if (type === 'ind' || type === 'individual') {
        showSubScreen('arena', 'section-2-3');
      } else if (type === 'myteam') {
        showSubScreen('arena', 'section-2-4');
      } else if (type === 'live') {
        showSubScreen('arena', 'section-2-5');
      }
    }

    function renderIndividualRunners(filteredList) {
      const container = document.getElementById('individual-runners-list');
      if (!container) return;
      const list = filteredList || arenaRunnersData.slice(1);
      container.innerHTML = list.map((r) => {
        const isSelf = r.isSelf;
        const rowClass = isSelf 
          ? 'bg-orange-50/50 hover:bg-orange-50/80 font-semibold' 
          : 'hover:bg-slate-50 transition';
        const rankBadge = r.rank === 1 
          ? 'bg-amber-100 text-amber-900 border border-amber-300 font-extrabold' 
          : r.rank === 2 
            ? 'bg-slate-200 text-slate-800 font-bold' 
            : r.rank === 3 
              ? 'bg-amber-50 text-amber-800 font-bold border border-amber-200' 
              : 'bg-slate-100 text-slate-600 font-medium';
        const teamBadge = r.team.includes('Phoenix')
          ? 'bg-orange-50 text-orange-700 border-orange-200'
          : r.team.includes('Dragons')
            ? 'bg-blue-50 text-blue-700 border-blue-200'
            : 'bg-emerald-50 text-emerald-700 border-emerald-200';
        const teamDot = r.team.includes('Phoenix')
          ? 'bg-orange-500'
          : r.team.includes('Dragons')
            ? 'bg-blue-500'
            : 'bg-emerald-500';
        const initials = r.name.split(' ').map(n => n[0]).slice(-2).join('');

        return '<tr class="' + rowClass + ' border-b border-slate-100">' +
          '<td class="py-3.5 px-4 text-center">' +
            '<span class="inline-flex items-center justify-center w-8 h-8 rounded-xl font-mono text-xs ' + rankBadge + '">' +
              (r.rank === 1 ? '👑 #1' : '#' + r.rank) +
            '</span>' +
          '</td>' +
          '<td class="py-3.5 px-4">' +
            '<div class="flex items-center gap-3">' +
              '<div class="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 uppercase font-mono">' +
                initials +
              '</div>' +
              '<div>' +
                '<div class="font-bold text-slate-900 flex items-center gap-1.5">' +
                  '<span>' + r.name + '</span>' +
                  (isSelf ? '<span class="text-[9px] bg-orange-100 text-[#FF5B26] px-1.5 py-0.5 rounded font-bold">Bạn</span>' : '') +
                  (r.bib ? '<span class="text-[9px] font-mono bg-slate-100 text-slate-500 px-1 rounded">' + r.bib + '</span>' : '') +
                '</div>' +
                '<div class="text-[11px] text-slate-400 font-mono">Pace TB: ' + r.pace + ' min/km</div>' +
              '</div>' +
            '</div>' +
          '</td>' +
          '<td class="py-3.5 px-4">' +
            '<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ' + teamBadge + '">' +
              '<span class="w-1.5 h-1.5 rounded-full ' + teamDot + '"></span>' +
              '<span>' + r.team + '</span>' +
            '</span>' +
          '</td>' +
          '<td class="py-3.5 px-4 text-right font-mono">' +
            '<span class="font-extrabold text-slate-900 text-sm">' + r.km.toFixed(1) + '</span>' +
            '<span class="text-[10px] text-slate-400"> km</span>' +
          '</td>' +
          '<td class="py-3.5 px-4 text-right font-mono">' +
            '<span class="font-bold text-slate-800">' + r.days + '</span>' +
            '<span class="text-[10px] text-slate-400"> ngày</span>' +
          '</td>' +
          '<td class="py-3.5 px-4 text-center">' +
            '<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ' + (r.km >= 50 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600') + '">' +
              '<span class="w-1.5 h-1.5 rounded-full ' + (r.km >= 50 ? 'bg-emerald-500' : 'bg-slate-400') + '"></span>' +
              (r.km >= 50 ? 'Đạt chuẩn' : 'Đang thi đấu') +
            '</span>' +
          '</td>' +
        '</tr>';
      }).join('');
    }

    function filterIndividualRunners() {
      const query = (document.getElementById('ind-search-input')?.value || '').toLowerCase().trim();
      const rawTeam = (document.getElementById('ind-team-filter')?.value || 'ALL').toUpperCase();

      let filtered = arenaRunnersData.slice(1).filter(r => {
        const matchName = r.name.toLowerCase().includes(query) || (r.bib && r.bib.toLowerCase().includes(query));
        const matchTeam = rawTeam === 'ALL' || 
          (rawTeam.includes('PHOENIX') && r.team.toUpperCase().includes('PHOENIX')) || 
          (rawTeam.includes('DRAGONS') && r.team.toUpperCase().includes('DRAGONS')) || 
          (rawTeam.includes('TIGERS') && r.team.toUpperCase().includes('TIGERS'));
        return matchName && matchTeam;
      });

      renderIndividualRunners(filtered);
    }

    function renderTeamRoster() {
      const container = document.getElementById('team-roster-container');
      if (!container) return;
      const roster = [
        { name: 'Nguyễn Văn A', role: 'Captain', km: 125.0, days: 18, pct: '10.0%', isSelf: true },
        { name: 'Hoàng Kim Dung', role: 'Vice-Captain', km: 88.5, days: 12, pct: '7.1%', isSelf: false },
        { name: 'Đặng Tuấn Kiệt', role: 'Member', km: 78.0, days: 11, pct: '6.2%', isSelf: false },
        { name: 'Vũ Hải Nam', role: 'Member', km: 72.0, days: 10, pct: '5.8%', isSelf: false },
        { name: 'Ngô Thanh Tùng', role: 'Member', km: 68.0, days: 9, pct: '5.4%', isSelf: false },
        { name: 'Phan Thùy Trang', role: 'Member', km: 65.0, days: 9, pct: '5.2%', isSelf: false },
      ];

      container.innerHTML = roster.map(m => {
        const initials = m.name.split(' ').map(n => n[0]).slice(-2).join('');
        return '<tr class="hover:bg-slate-50 transition border-b border-slate-100">' +
          '<td class="py-3 px-4 font-bold text-slate-900">' +
            '<div class="flex items-center gap-2.5">' +
              '<div class="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">' +
                initials +
              '</div>' +
              '<span>' + m.name + '</span>' +
              (m.isSelf ? '<span class="text-[#FF5B26] font-bold text-xs ml-1">(Bạn)</span>' : '') +
            '</div>' +
          '</td>' +
          '<td class="py-3 px-4">' +
            '<span class="text-[10px] px-2.5 py-0.5 rounded-full font-bold ' + (m.role === 'Captain' ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'bg-slate-100 text-slate-700') + '">' +
              m.role +
            '</span>' +
          '</td>' +
          '<td class="py-3 px-4 text-right font-mono">' +
            '<span class="font-bold text-slate-900">' + m.km.toFixed(1) + ' km</span> ' +
            '<span class="text-slate-400 text-[10px]">(' + m.pct + ')</span>' +
          '</td>' +
          '<td class="py-3 px-4 text-right font-mono font-medium text-slate-800">' +
            m.days + ' ngày' +
          '</td>' +
          '<td class="py-3 px-4 text-center">' +
            '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ' + (m.km >= 20 ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-rose-100 text-rose-700 border border-rose-200') + '">' +
              (m.km >= 20 ? '✓ Đạt chỉ tiêu' : '⚠️ Cần đôn đốc') +
            '</span>' +
          '</td>' +
        '</tr>';
      }).join('');
    }

    function renderTeamCheers() {
      const container = document.getElementById('team-cheer-container');
      if (!container) return;
      container.innerHTML = teamCheersData.map(c => {
        return '<div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">' +
          '<div class="flex items-center justify-between text-[10px] text-slate-400">' +
            '<strong class="text-slate-800">' + c.author + '</strong>' +
            '<span>' + c.time + '</span>' +
          '</div>' +
          '<div class="mt-1 text-slate-700 leading-snug">' + c.msg + '</div>' +
        '</div>';
      }).join('');
    }

    async function submitCheerMessage() {
      const input = document.getElementById('cheer-input');
      const text = input ? input.value.trim() : '';
      if (!text) return;
      try {
        await fetch('/api/races/season-10-run-to-techcombank/my-team/cheer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ author: 'Nguyễn Văn A (Captain)', message: text })
        });
        teamCheersData.unshift({
          author: 'Nguyễn Văn A (Captain)',
          msg: text,
          time: 'Vừa xong'
        });
        renderTeamCheers();
        if (input) input.value = '';
        showToast('Đã đăng lời cổ vũ lên bảng tin đội!');
      } catch (e) {
        console.error('Cheer error:', e);
      }
    }

    function copyTeamInviteCode() {
      showToast('Đã sao chép mã mời đội PHOENIX-SARC-TEAM');
    }

    async function simulateLiveBroadcast() {
      try {
        await fetch('/api/races/season-10-run-to-techcombank/stream/broadcast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'activity_verified',
            athleteName: 'Nguyễn Văn A',
            teamName: 'Team Phoenix SARC',
            distanceKm: 5.0,
            message: 'Nguyễn Văn A vừa hoàn thành bài chạy 5.0 km lúc ' + new Date().toLocaleTimeString('vi-VN')
          })
        });

        const ticker = document.getElementById('arena-live-ticker');
        if (ticker) {
          ticker.innerText = '⚡ Nguyễn Văn A vừa hoàn thành bài chạy 5.0 km lúc ' + new Date().toLocaleTimeString('vi-VN') + ' (+5.0 km toàn đội)';
        }
        showToast('Đã phát sóng sự kiện Live Stream thành công!');
      } catch (e) {
        console.error('Broadcast error:', e);
      }
    }

    function changeArenaRace(slug) {
      const titles = {
        'season-10-run-to-techcombank': 'MÙA 10 RUN TO TECHCOMBANK 2026 – SADC/SARC',
        'sarc-trail-challenge-bavi-2026': 'SARC TRAIL CHALLENGE BA VÌ 2026',
        'vpbank-hanoi-marathon-prep-2026': 'VPBANK HANOI MARATHON PREP 2026'
      };
      const titleEl = document.getElementById('arena-race-title');
      if (titleEl) titleEl.innerText = titles[slug] || slug;
      showToast('Đã chuyển sang xem giải đấu: ' + (titles[slug] || slug));
    }

    function scrollToMyRow() {
      toggleArenaTab('ind');
      setTimeout(() => {
        window.scrollTo({ top: 300, behavior: 'smooth' });
      }, 100);
    }

    function openTiebreakModal() {
      const modal = document.getElementById('tiebreak-info-modal');
      if (modal) modal.classList.remove('hidden');
    }

    function closeTiebreakModal() {
      const modal = document.getElementById('tiebreak-info-modal');
      if (modal) modal.classList.add('hidden');
    }

    // Live countdown timer ticker
    setInterval(() => {
      const sEl = document.getElementById('cd-secs');
      if (sEl) {
        let sec = parseInt(sEl.innerText, 10);
        if (isNaN(sec)) sec = 45;
        sec = sec <= 0 ? 59 : sec - 1;
        sEl.innerText = sec < 10 ? '0' + sec : sec.toString();
      }
    }, 1000);


    function showToast(msg) {
      const banner = document.getElementById('toast-banner');
      const text = document.getElementById('toast-msg');
      if (!banner || !text) return;
      text.innerText = '✓ ' + msg;
      banner.classList.remove('hidden');
      setTimeout(() => { banner.classList.add('hidden'); }, 3000);
    }

    function copyOnboardLink() {
      showSubScreen("club", "section-4-4");
      const btn = document.getElementById('btn-copy-onboard');
      if (btn) btn.innerText = '✓ Đã sao chép link';
      showToast('Đã sao chép link mã QR & Short-link OR-8K2Q mở bằng trình duyệt hệ thống');
      setTimeout(() => { if (btn) btn.innerText = 'Sao chép link mở ngoài'; }, 2500);
    }

    function runSimulation() {
      const dist = parseFloat(document.getElementById('sim-dist').value) || 0;
      const time = parseFloat(document.getElementById('sim-time').value) || 0;
      const gain = parseFloat(document.getElementById('sim-gain').value) || 0;

      const paceMin = time / dist;
      const paceSec = (paceMin * 60) % 60;
      const paceStr = Math.floor(paceMin) + ':' + (Math.floor(paceSec) < 10 ? '0' : '') + Math.floor(paceSec);

      let isValid = true;
      let reason = '';
      let bonusKm = 0;
      let finalKm = dist;

      if (paceMin < 2.75) {
        isValid = false;
        reason = 'CẦN XÁC MINH: Pace ' + paceStr + ' min/km vượt ngưỡng sàn tuyệt đối hệ thống (2:45 min/km) - Nghi vấn gian lận/sử dụng phương tiện';
        finalKm = 0;
      } else if (dist < 3.0) {
        isValid = false;
        reason = 'Cự ly ' + dist + ' km nhỏ hơn mức tối thiểu 3.0 km';
        finalKm = 0;
      } else if (paceMin < 4.0) {
        isValid = false;
        reason = 'Pace ' + paceStr + ' quá nhanh so với quy chế giải (< 4:00)';
        finalKm = 0;
      } else if (paceMin > 10.0) {
        if (gain >= 100) {
          bonusKm = Math.floor(gain / 100) * 1.0;
          finalKm = dist + bonusKm;
        } else {
          isValid = false;
          reason = 'Pace ' + paceStr + ' > 10:00 nhưng độ cao gain ' + gain + 'm không đủ 100m';
          finalKm = 0;
        }
      }

      const resBox = document.getElementById('sim-result');
      resBox.classList.remove('hidden');
      if (isValid) {
        resBox.className = 'p-4 rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs space-y-1';
        let html = '<div class="font-bold text-sm">✓ BÀI CHẠY HỢP LỆ • Pace: ' + paceStr + ' min/km</div>';
        html += '<div>Cự ly gốc: ' + dist.toFixed(1) + ' km</div>';
        if (bonusKm > 0) {
          html += '<div class="text-[#FF5B26] font-bold">+ Thưởng Trail: +' + bonusKm.toFixed(1) + ' km</div>';
        }
        html += '<div class="text-slate-900 font-bold font-mono text-sm pt-1">Tổng cự ly ghi nhận: ' + finalKm.toFixed(1) + ' km</div>';
        resBox.innerHTML = html;
      } else {
        resBox.className = 'p-4 rounded-2xl border border-red-200 bg-red-50 text-red-800 text-xs space-y-1';
        resBox.innerHTML = '<div class="font-bold text-sm">✕ BÀI CHẠY BỊ TỪ CHỐI • Pace: ' + paceStr + ' min/km</div><div>' + reason + '</div><div class="font-bold font-mono text-red-600">Cự ly ghi nhận: 0.0 km</div>';
      }
    }

    
    let currentActivityFilter = 'all';
    let currentRaceFilter = 'all';
    let currentAppealActId = null;

    function toggleSidebar() {
      const sidebar = document.getElementById('main-sidebar');
      const backdrop = document.getElementById('sidebar-backdrop');
      if (!sidebar) return;
      const isClosed = sidebar.classList.contains('-translate-x-[150%]');
      if (isClosed) {
        sidebar.classList.remove('-translate-x-[150%]');
        sidebar.classList.add('translate-x-0');
        backdrop?.classList.remove('hidden');
      } else {
        sidebar.classList.add('-translate-x-[150%]');
        sidebar.classList.remove('translate-x-0');
        backdrop?.classList.add('hidden');
      }
    }

    function setActivityFilter(filter) {
      currentActivityFilter = filter;
      ['all', 'valid', 'invalid'].forEach(f => {
        const btn = document.getElementById('filter-act-' + f);
        if (btn) {
          if (f === filter) {
            btn.className = 'filter-act-btn px-3 py-1 rounded-xl font-bold bg-white text-slate-900 shadow-sm transition';
          } else {
            btn.className = 'filter-act-btn px-3 py-1 rounded-xl font-bold text-slate-500 hover:text-slate-900 transition';
          }
        }
      });
      renderActivities();
      renderClubRaces();
      renderClubMembers();
      renderAdminMemberList();
      renderClubDisplay();
      renderWaiversHistory();
    }

    function filterByRace(race) {
      currentRaceFilter = race;
      renderActivities();
    }

    function openAppealDrawer(actId) {
      currentAppealActId = actId;
      const act = liveActivities.find(a => a.id === actId);
      if (!act) return;

      const titleEl = document.getElementById('appeal-act-title');
      const reasonEl = document.getElementById('appeal-act-reason');
      const inputEl = document.getElementById('appeal-reason-input');

      if (titleEl) titleEl.innerText = act.title + ' (' + act.dist + ' km)';
      if (reasonEl) reasonEl.innerText = 'Lý do từ chối: ' + (act.reason || 'Không đạt chuẩn');
      if (inputEl) inputEl.value = 'Đoạn dốc cầu Nhật Tân bị mất sóng GPS trong 200m làm tốc độ hiển thị ảo, cự ly thực tế đúng 6.0 km.';

      const drawer = document.getElementById('appeal-drawer');
      if (drawer) drawer.classList.remove('hidden');
    }

    function closeAppealDrawer() {
      const drawer = document.getElementById('appeal-drawer');
      if (drawer) drawer.classList.add('hidden');
      currentAppealActId = null;
    }

    async function submitAppealDrawer() {
      if (!currentAppealActId) return;
      const reason = document.getElementById('appeal-reason-input').value.trim();
      const evidence = document.getElementById('appeal-evidence-input').value.trim();

      if (!reason) {
        alert('Vui lòng nhập giải trình lý do khiếu nại!');
        return;
      }

      const act = liveActivities.find(a => a.id === currentAppealActId);
      if (act) {
        act.appealStatus = 'PENDING';
        liveAppeals.unshift({
          id: 'app-' + Date.now(),
          actId: act.id,
          title: act.title + ' (' + act.dist + ' km)',
          runner: act.athlete || 'Nguyễn Văn A',
          reason: reason + (evidence ? ' (Link: ' + evidence + ')' : ''),
          status: 'PENDING'
        });
      }

      try {
        await fetch('/api/activities/' + currentAppealActId + '/appeal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: reason, evidenceUrl: evidence, raceId: 'season-10-run-to-techcombank' })
        });
      } catch (e) {
        // Fallback live state
      }

      closeAppealDrawer();
      renderActivities();
      renderAdminAppeals();
      showToast('Đã gửi đơn khiếu nại thành công tới Ban Quản Trị!');
    }

    let liveActivities = [
      { id: 'act-1', title: '🏃 Chạy sáng Hồ Tây đón bình minh', athlete: 'Nguyễn Văn A', dist: 5.2, time: 28.6, paceStr: '5:30', gain: 40, valid: true, bonus: 0, finalKm: 5.2, reason: '', appealStatus: 'NONE' },
      { id: 'act-2', title: '⛰️ Chạy Trail Đền Gióng Sóc Sơn', athlete: 'Nguyễn Văn A', dist: 6.0, time: 73.0, paceStr: '12:10', gain: 260, valid: true, bonus: 2.0, finalKm: 8.0, reason: '', appealStatus: 'NONE' },
      { id: 'act-3', title: '🏃 Khởi động ngắn công viên', athlete: 'Nguyễn Văn A', dist: 2.4, time: 14.4, paceStr: '6:00', gain: 10, valid: false, bonus: 0, finalKm: 0.0, reason: 'Cự ly 2.4 km nhỏ hơn mức tối thiểu 3.0 km', appealStatus: 'NONE' },
      { id: 'act-4', title: '🏃 Chạy nhanh cầu Nhật Tân', athlete: 'Trần Thị B', dist: 6.0, time: 14.0, paceStr: '2:20', gain: 20, valid: false, bonus: 0, finalKm: 0.0, reason: 'Pace 2:20 min/km vượt sàn 2:45 min/km', appealStatus: 'PENDING' }
    ];

    let liveAppeals = [
      { id: 'app-1', actId: 'act-4', title: 'Chạy nhanh cầu Nhật Tân (6.0 km)', runner: 'Trần Thị B', reason: 'Đoạn đổ dốc cầu Nhật Tân lỗi GPS làm quãng đường bị co ngắn.', status: 'PENDING' }
    ];

    let liveFinance = [
      { id: 'fin-1', runner: 'Nguyễn Văn A (Bạn)', team: 'Team Phoenix SARC', fee: 100000, penalty: 0, total: 100000, status: 'UNPAID' },
      { id: 'fin-2', runner: 'Lê Hoàng Yến', team: 'Team Dragons SADC', fee: 200000, penalty: 50000, total: 250000, status: 'PAID' },
      { id: 'fin-3', runner: 'Phạm Minh Đức', team: 'Team Tigers SADC', fee: 200000, penalty: 50000, total: 250000, status: 'PENDING_CONFIRMATION' }
    ];

    
    // Subsystem 4: Club Hub Client Logic
    let currentClubRaceTab = 'live';
    let selectedTeamId = 'team-dragons';

    const clubRacesData = {
      live: [
        {
          id: 'race-season-10',
          name: 'Mùa 10 Run to Techcombank 2026',
          statusText: 'ĐANG DIỄN RA',
          statusClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          period: '01/11/2026 - 30/11/2026',
          participants: 48,
          km: '3,170.0 km',
          desc: 'Giải chạy tích lũy điểm cự ly & chuyên cần tranh cúp SARC vô địch.'
        }
      ],
      upcoming: [
        {
          id: 'race-ny-2027',
          name: 'SARC Chào Xuân Đinh Mùi 2027',
          statusText: 'SẮP KHỞI TRANH',
          statusClass: 'bg-blue-50 text-blue-700 border-blue-200',
          period: '01/01/2027 - 15/01/2027',
          participants: 28,
          km: '0.0 km',
          desc: 'Giải khai xuân chạy cung đường di sản Hồ Tây chào đón năm mới.'
        }
      ],
      archived: [
        {
          id: 'race-season-09',
          name: 'Mùa 9 Thử Thách Mùa Hè Rực Lửa 2026',
          statusText: 'ĐÃ KẾT THÚC',
          statusClass: 'bg-slate-100 text-slate-700 border-slate-200',
          period: '01/06/2026 - 30/06/2026',
          participants: 52,
          km: '15,420.0 km',
          desc: 'Quán quân: Team Dragons SADC (Tổng thưởng quỹ 3.200.000đ).'
        }
      ]
    };

    let clubMembersList = [
      { id: 'user-01', name: 'Nguyễn Văn A', role: 'ĐỘI TRƯỞNG', roleBadge: 'bg-orange-100 text-[#FF5B26]', team: 'Team Phoenix SARC', km: 125.0, days: 18, strava: true },
      { id: 'lead-01', name: 'Hoàng Văn Minh', role: 'CHỦ NHIỆM', roleBadge: 'bg-purple-100 text-purple-700', team: 'Team Phoenix SARC', km: 134.0, days: 20, strava: true },
      { id: 'lead-02', name: 'Trần Quốc Tuấn', role: 'BAN CÁN SỰ', roleBadge: 'bg-blue-100 text-blue-700', team: 'Team Dragons SADC', km: 140.2, days: 21, strava: true },
      { id: 'user-02', name: 'Trần Thị B', role: 'RUNNER', roleBadge: 'bg-slate-100 text-slate-700', team: 'Team Dragons SADC', km: 112.5, days: 16, strava: true },
      { id: 'user-03', name: 'Lê Hoàng C', role: 'RUNNER', roleBadge: 'bg-slate-100 text-slate-700', team: 'Team Tigers SADC', km: 98.0, days: 14, strava: true }
    ];

    function filterClubRaces(tab) {
      currentClubRaceTab = tab;
      ['live', 'upcoming', 'archived'].forEach(t => {
        const btn = document.getElementById('btn-race-' + t);
        if (btn) {
          btn.className = (t === tab)
            ? 'px-3 py-1 rounded-xl font-bold bg-white text-slate-900 shadow-sm transition'
            : 'px-3 py-1 rounded-xl font-bold text-slate-500 hover:text-slate-900 transition';
        }
      });
      renderClubRaces();
    }

    function goToClubArena() {
      switchTab('arena');
    }

    function renderClubRaces() {
      const container = document.getElementById('club-races-container');
      if (!container) return;
      const list = clubRacesData[currentClubRaceTab] || [];
      container.innerHTML = list.map(race => {
        return '<div class="p-4 rounded-2xl border border-slate-200/80 bg-white hover:border-slate-300 transition shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">' +
          '<div class="space-y-1">' +
            '<div class="flex items-center gap-2">' +
              '<span class="text-xs font-bold text-slate-900">' + race.name + '</span>' +
              '<span class="px-2 py-0.5 rounded-full text-[9px] font-extrabold border ' + race.statusClass + '">' + race.statusText + '</span>' +
            '</div>' +
            '<div class="text-[11px] text-slate-500">' +
              'Thời gian: <strong>' + race.period + '</strong> • Quy mô: <strong>' + race.participants + ' VĐV</strong> • Tích lũy: <strong class="font-mono text-[#FF5B26]">' + race.km + '</strong>' +
            '</div>' +
            '<div class="text-[11px] text-slate-600">' + race.desc + '</div>' +
          '</div>' +
          '<button onclick="goToClubArena()" class="px-4 py-1.5 rounded-xl bg-[#18181B] hover:bg-slate-800 text-white text-xs font-bold shrink-0 shadow-sm transition">' +
            'Xem đấu trường →' +
          '</button>' +
        '</div>';
      }).join('');
    }

    function renderClubMembers(filterText = '') {
      const tbody = document.getElementById('club-members-tbody');
      if (!tbody) return;

      const filtered = clubMembersList.filter(m =>
        m.name.toLowerCase().includes(filterText.toLowerCase()) ||
        m.team.toLowerCase().includes(filterText.toLowerCase())
      );

      tbody.innerHTML = filtered.map(m => {
        const initials = m.name.split(' ').map(n=>n[0]).join('').slice(0, 2);
        return '<tr class="hover:bg-slate-50/80 transition">' +
          '<td class="py-2.5 px-3">' +
            '<div class="flex items-center gap-2">' +
              '<div class="w-7 h-7 rounded-full bg-gradient-to-tr from-slate-200 to-slate-300 flex items-center justify-center font-bold text-[10px] text-slate-700">' +
                initials +
              '</div>' +
              '<span class="font-bold text-slate-800">' + m.name + '</span>' +
            '</div>' +
          '</td>' +
          '<td class="py-2.5 px-3">' +
            '<span class="px-2 py-0.5 rounded-full text-[9px] font-extrabold ' + m.roleBadge + '">' + m.role + '</span>' +
          '</td>' +
          '<td class="py-2.5 px-3 text-slate-600 font-medium">' + m.team + '</td>' +
          '<td class="py-2.5 px-3 text-right font-mono font-bold text-slate-900">' + m.km.toFixed(1) + ' km</td>' +
          '<td class="py-2.5 px-3 text-center font-mono font-bold text-slate-700">' + m.days + ' ngày</td>' +
          '<td class="py-2.5 px-3 text-center">' +
            '<span class="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">' +
              '<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Kết nối' +
            '</span>' +
          '</td>' +
        '</tr>';
      }).join('');
    }

    function filterClubMembers(text) {
      renderClubMembers(text);
    }

    function selectJoinTeam(teamId, isFull) {
      showSubScreen("club", "section-4-4");
      if (isFull) {
        const fb = document.getElementById('join-team-feedback');
        if (fb) {
          fb.className = 'p-3 rounded-xl text-xs font-semibold bg-rose-50 border border-rose-200 text-rose-800 block';
          fb.innerHTML = '<strong>✕ Đội đã đầy!</strong> Team Phoenix SARC đã đạt tối đa 16/16 thành viên. Vui lòng chọn Dragons hoặc Tigers.';
        }
        return;
      }

      selectedTeamId = teamId;
      const inp = document.getElementById('selected-team-input'); if (inp) inp.value = teamId;

      const dragonsCard = document.getElementById('team-card-dragons');
      const tigersCard = document.getElementById('team-card-tigers');
      const label = document.getElementById('selected-team-name-label');

      if (dragonsCard && tigersCard) {
        if (teamId === 'team-dragons') {
          dragonsCard.className = 'p-4 rounded-2xl border-2 border-[#FF5B26] bg-orange-50/20 cursor-pointer transition shadow-xs';
          tigersCard.className = 'p-4 rounded-2xl border-2 border-slate-200 bg-white hover:border-[#FF5B26] cursor-pointer transition shadow-xs';
          if (label) label.innerText = 'Team Dragons SADC (Còn 2 vị trí)';
        } else {
          tigersCard.className = 'p-4 rounded-2xl border-2 border-[#FF5B26] bg-orange-50/20 cursor-pointer transition shadow-xs';
          dragonsCard.className = 'p-4 rounded-2xl border-2 border-slate-200 bg-white hover:border-[#FF5B26] cursor-pointer transition shadow-xs';
          if (label) label.innerText = 'Team Tigers SADC (Còn 1 vị trí)';
        }
      }

      const fb = document.getElementById('join-team-feedback');
      if (fb) fb.classList.add('hidden');
    }

    async function submitJoinTeam() {
      const consent1 = document.getElementById('consent-strava')?.checked;
      const consent2 = document.getElementById('consent-rules')?.checked;
      const teamId = document.getElementById('selected-team-input')?.value;
      const fb = document.getElementById('join-team-feedback');

      if (!consent1 || !consent2) {
        if (fb) {
          fb.className = 'p-3 rounded-xl text-xs font-semibold bg-rose-50 border border-rose-200 text-rose-800 block';
          fb.innerHTML = '<strong>✕ Thiếu cam kết bắt buộc!</strong> Bạn phải tích chọn cả 2 cam kết dữ liệu (Cam kết Strava & Cam kết minh bạch tài chính).';
        }
        return;
      }

      try {
        const res = await fetch('/api/clubs/sarc-sadc/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ teamId, consentStrava: consent1, consentRulesAndFinance: consent2 })
        });
        const data = await res.json();
        if (data.success) {
          if (fb) {
            fb.className = 'p-3 rounded-xl text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-800 block';
            fb.innerHTML = '<strong>✓ GIA NHẬP THÀNH CÔNG!</strong> ' + data.message;
          }
          // Add to live roster
          clubMembersList.push({
            id: 'user-new-' + Date.now(),
            name: 'Vận Động Viên Mới (Bạn)',
            role: 'RUNNER',
            roleBadge: 'bg-emerald-100 text-emerald-700',
            team: teamId === 'team-dragons' ? 'Team Dragons SADC' : 'Team Tigers SADC',
            km: 0.0,
            days: 0,
            strava: true
          });
          renderClubMembers();
          showToast('Đã đăng ký đội thi và kích hoạt tham gia giải!');
        } else {
          if (fb) {
            fb.className = 'p-3 rounded-xl text-xs font-semibold bg-rose-50 border border-rose-200 text-rose-800 block';
            fb.innerHTML = '<strong>✕ Lỗi:</strong> ' + data.error;
          }
        }
      } catch (err) {
        if (fb) {
          fb.className = 'p-3 rounded-xl text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-800 block';
          fb.innerHTML = '<strong>✓ GIA NHẬP THÀNH CÔNG!</strong> Đã kích hoạt VĐV tham gia giải đấu.';
        }
      }
    }

    function copyDetourCode() {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText('OR-8K2Q').catch(() => {});
      }
      showToast('Đã sao chép mã truy cập nhanh: OR-8K2Q');
    }

    function simulateDetourCheck() {
      showToast('Phát hiện: Trình duyệt Desktop Chrome (Chuẩn OAuth Strava ✓)');
    }

    function renderActivities() {
      const container = document.getElementById('activities-container');
      if (!container) return;

      // Update counters
      const countAll = liveActivities.length;
      const countValid = liveActivities.filter(a => a.valid).length;
      const countInvalid = liveActivities.filter(a => !a.valid).length;

      const countAllEl = document.getElementById('count-act-all');
      const countValidEl = document.getElementById('count-act-valid');
      const countInvalidEl = document.getElementById('count-act-invalid');

      if (countAllEl) countAllEl.innerText = countAll;
      if (countValidEl) countValidEl.innerText = countValid;
      if (countInvalidEl) countInvalidEl.innerText = countInvalid;

      // Filter activities
      let filtered = liveActivities;
      if (currentActivityFilter === 'valid') {
        filtered = filtered.filter(a => a.valid);
      } else if (currentActivityFilter === 'invalid') {
        filtered = filtered.filter(a => !a.valid);
      }

      if (filtered.length === 0) {
        container.innerHTML = '<div class="p-8 text-center text-slate-400 text-xs">Không có bài chạy nào phù hợp với bộ lọc hiện tại.</div>';
        return;
      }

      container.innerHTML = filtered.map(act => {
        let statusBadge = act.valid
          ? '<span class="text-emerald-700 bg-emerald-100/80 text-[10px] font-bold px-2 py-0.5 rounded-full">✓ HỢP LỆ</span>'
          : '<span class="text-rose-700 bg-rose-100/80 text-[10px] font-bold px-2 py-0.5 rounded-full">✕ BỊ LOẠI</span>';

        if (act.bonus > 0) {
          statusBadge += ' <span class="text-purple-700 bg-purple-100 text-[10px] font-bold px-2 py-0.5 rounded-full">+ ' + act.bonus.toFixed(1) + ' km TRAIL BONUS</span>';
        }

        if (act.paceStr && (parseFloat(act.paceStr.replace(':', '.')) < 2.75 || act.paceStr === '2:20' || act.paceStr === '2:30')) {
          statusBadge += ' <span class="text-amber-700 bg-amber-100 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">⚠️ CẦN XÁC MINH (Pace < 2:45)</span>';
        }

        if (act.appealStatus === 'PENDING') {
          statusBadge += ' <span class="text-amber-700 bg-amber-100 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">⏳ CHỜ DUYỆT KHIẾU NẠI</span>';
        } else if (act.appealStatus === 'APPROVED') {
          statusBadge += ' <span class="text-blue-700 bg-blue-100 text-[10px] font-bold px-2 py-0.5 rounded-full">✓ ĐÃ DUYỆT KHIẾU NẠI</span>';
        }

        let actionBtn = '';
        if (!act.valid && (act.appealStatus === 'NONE' || !act.appealStatus)) {
          actionBtn = '<button onclick="openAppealDrawer(&quot;' + act.id + '&quot;)" class="mt-1 px-3 py-1 bg-orange-50 hover:bg-orange-100 text-[#FF5B26] border border-orange-200 rounded-xl text-xs font-bold transition flex items-center gap-1"><span>📝</span> Khiếu nại bài này</button>';
        }

        return '<div class="p-4 rounded-3xl border border-slate-200/80 bg-white hover:border-slate-300 transition shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">' +
          '<div class="space-y-1.5">' +
            '<div class="flex items-center gap-2 flex-wrap">' +
              '<span class="text-xs font-bold text-slate-900">' + act.title + '</span>' +
              statusBadge +
            '</div>' +
            '<div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-500 pt-1">' +
              '<div>Cự ly gốc: <strong class="font-mono text-slate-800">' + act.dist.toFixed(1) + ' km</strong></div>' +
              '<div>Pace: <strong class="font-mono text-slate-800">' + act.paceStr + ' /km</strong></div>' +
              '<div>Thời gian: <strong class="font-mono text-slate-800">' + act.time + ' phút</strong></div>' +
              '<div>Độ dốc: <strong class="font-mono text-slate-800">+' + act.gain + 'm</strong></div>' +
            '</div>' +
            (act.reason ? '<div class="text-[11px] text-rose-600 font-medium">Lý do: ' + act.reason + '</div>' : '') +
          '</div>' +
          '<div class="text-right flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-2 md:pt-0 border-slate-100">' +
            '<div>' +
              '<div class="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Cự ly ghi nhận</div>' +
              '<div class="text-base font-black font-mono text-slate-900">' + act.finalKm.toFixed(1) + ' km</div>' +
            '</div>' +
            actionBtn +
          '</div>' +
        '</div>';
      }).join('');
    }

    
    // ==========================================
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
            '<button onclick="openExecutiveModal(\'' + l.id + '\')" class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-orange-100 hover:text-orange-600 flex items-center justify-center text-xs transition" title="Sửa thông tin">✏️</button>' +
            '<button onclick="deleteExecutiveLeader(\'' + l.id + '\')" class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-rose-100 hover:text-rose-600 flex items-center justify-center text-xs transition" title="Xóa ban cán sự">🗑️</button>' +
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
              '<button onclick="togglePinAnnouncement(\'' + p.id + '\')" class="px-2 py-1 rounded-lg bg-white border border-slate-200 hover:bg-amber-50 hover:text-amber-800 text-[10px] font-bold transition flex items-center gap-1" title="' + (p.pinned ? 'Bỏ ghim' : 'Ghim lên đầu') + '">' +
                (p.pinned ? '📌 Bỏ ghim' : '📌 Ghim') +
              '</button>' +
              '<button onclick="openAnnouncementModal(\'' + p.id + '\')" class="px-2 py-1 rounded-lg bg-white border border-slate-200 hover:bg-orange-50 hover:text-orange-600 text-[10px] font-bold transition flex items-center gap-1">✏️ Sửa</button>' +
              '<button onclick="deleteAnnouncementPost(\'' + p.id + '\')" class="px-2 py-1 rounded-lg bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-[10px] font-bold transition flex items-center gap-1">🗑️ Xóa</button>' +
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

    // Subsystem 5, 6, 7, 8 Client Scripts
    function goToScreen(screenCode) {
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

    function saveTeamLeaderIdentity() {
      const teamId = document.getElementById('tl-team-select')?.value || 'team-phoenix';
      const slogan = document.getElementById('tl-slogan')?.value || '';
      const color = document.getElementById('tl-color')?.value || '#FF5B26';
      showToast('Đã cập nhật nhận diện Đội trưởng & slogan: ' + slogan);
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

      const roleFilter = (document.getElementById('admin-role-filter')?.value || 'ALL').toUpperCase();
      const q = (query || '').toLowerCase().trim();

      const filtered = adminMembers.filter(m => {
        const matchQ = m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
        const matchRole = roleFilter === 'ALL' || m.role.toUpperCase() === roleFilter;
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
            '<select onchange="adminChangeRole(&quot;' + m.id + '&quot;, this.value)" class="bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5 text-[11px] font-bold">' +
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
              '<button onclick="adminToggleLock(&quot;' + m.id + '&quot;)" class="px-2 py-0.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 text-[10px] font-semibold">' +
                (isLocked ? 'Mở khóa' : 'Khóa') +
              '</button>' +
              '<button onclick="adminDeleteMember(&quot;' + m.id + '&quot;)" class="px-2 py-0.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-[10px] font-semibold">Xóa</button>' +
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
        email: email || (name.toLowerCase().replace(/\s+/g, '.') + '@sarc.vn'),
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

    function renderAdminAppeals() {
      const container = document.getElementById('admin-appeals-container');
      if (!container) return;
      if (liveAppeals.length === 0) {
        container.innerHTML = '<div class="text-slate-400 text-xs italic">Không có khiếu nại nào đang chờ.</div>';
        return;
      }
      container.innerHTML = liveAppeals.map(app => {
        return '<div class="p-3.5 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">' +
          '<div>' +
            '<div class="font-bold text-slate-900">' + app.runner + ' — ' + app.title + '</div>' +
            '<div class="text-slate-500 text-[11px] mt-0.5">Lý do: ' + app.reason + '</div>' +
            '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold ' + (app.status === 'PENDING' ? 'bg-amber-100 text-amber-800' : (app.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800')) + '">' + (app.status === 'PENDING' ? 'Chờ duyệt' : (app.status === 'APPROVED' ? 'Đã duyệt' : 'Từ chối')) + '</span>' +
          '</div>' +
          (app.status === 'PENDING' ? 
            '<div class="flex items-center gap-1.5 shrink-0">' +
              '<button onclick="adminRejectAppeal(&quot;' + app.id + '&quot;)" class="px-3 py-1 rounded-lg text-slate-500 hover:text-rose-600 border border-slate-200 text-xs font-semibold">Từ chối</button>' +
              '<button onclick="adminApproveAppeal(&quot;' + app.id + '&quot;)" class="px-3.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold">✓ Chấp thuận (+km)</button>' +
            '</div>' : '') +
        '</div>';
      }).join('');
    }

    function renderAdminFinance() {
      const container = document.getElementById('admin-finance-container');
      if (!container) return;
      container.innerHTML = liveFinance.map(f => {
        return '<div class="p-3 rounded-2xl bg-white border border-slate-200 flex items-center justify-between text-xs">' +
          '<div>' +
            '<div class="font-bold text-slate-900">' + f.runner + ' (' + f.team + ')</div>' +
            '<div class="text-slate-500 text-[11px]">Cần nộp: ' + f.total.toLocaleString('vi-VN') + 'đ • Trạng thái: ' + (f.status === 'PAID' ? '<span class="text-emerald-600 font-bold">Đã thu</span>' : (f.status === 'PENDING_CONFIRMATION' ? '<span class="text-amber-600 font-bold">Chờ xác nhận</span>' : '<span class="text-slate-500">Chưa nộp</span>')) + '</div>' +
          '</div>' +
          '<div>' +
            (f.status !== 'PAID' ? '<button onclick="adminConfirmPay(&quot;' + f.id + '&quot;)" class="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg">Xác nhận thu</button>' : '<span class="text-emerald-600 font-bold">✓ Đã thu</span>') +
          '</div>' +
        '</div>';
      }).join('');
    }

    function openAddActModal() {
      document.getElementById('add-act-modal').classList.remove('hidden');
    }

    function closeAddActModal() {
      document.getElementById('add-act-modal').classList.add('hidden');
      document.getElementById('add-act-feedback').classList.add('hidden');
    }

    function submitNewActivity() {
      const title = document.getElementById('act-input-title').value.trim() || 'Bài chạy mới';
      const dist = parseFloat(document.getElementById('act-input-dist').value) || 0;
      const gain = parseFloat(document.getElementById('act-input-gain').value) || 0;
      const time = parseFloat(document.getElementById('act-input-time').value) || 0;

      if (dist <= 0 || time <= 0) {
        alert('Vui lòng nhập cự ly và thời gian hợp lệ!');
        return;
      }

      const paceMin = time / dist;
      const paceSec = Math.round((paceMin * 60) % 60);
      const paceStr = Math.floor(paceMin) + ':' + (paceSec < 10 ? '0' : '') + paceSec;

      let valid = true;
      let reason = '';
      let bonus = 0;
      let finalKm = dist;

      if (paceMin < 2.75) {
        valid = false;
        reason = 'CẦN XÁC MINH: Pace ' + paceStr + ' min/km vượt ngưỡng sàn tuyệt đối hệ thống (2:45 min/km)';
        finalKm = 0;
      } else if (dist < 3.0) {
        valid = false;
        reason = 'Cự ly ' + dist + ' km nhỏ hơn mức tối thiểu 3.0 km';
        finalKm = 0;
      } else if (paceMin < 4.0) {
        valid = false;
        reason = 'Pace ' + paceStr + ' quá nhanh (< 4:00)';
        finalKm = 0;
      } else if (paceMin > 10.0) {
        if (gain >= 100) {
          bonus = Math.floor(gain / 100) * 1.0;
          finalKm = dist + bonus;
        } else {
          valid = false;
          reason = 'Pace > 10:00 nhưng độ dốc Gain ' + gain + 'm không đủ 100m';
          finalKm = 0;
        }
      }

      const newAct = {
        id: 'act-' + Date.now(),
        title: '🏃 ' + title,
        athlete: 'Nguyễn Văn A',
        dist: dist,
        time: time,
        paceStr: paceStr,
        gain: gain,
        valid: valid,
        bonus: bonus,
        finalKm: finalKm,
        reason: reason,
        appealStatus: 'NONE'
      };

      liveActivities.unshift(newAct);
      renderActivities();

      const fb = document.getElementById('add-act-feedback');
      fb.classList.remove('hidden');
      if (valid) {
        fb.className = 'p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs';
        fb.innerHTML = '<strong>✓ THẨM ĐỊNH THÀNH CÔNG!</strong> Đã ghi nhận ' + finalKm.toFixed(1) + ' km vào bảng xếp hạng!';
      } else {
        fb.className = 'p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-xs';
        fb.innerHTML = '<strong>✕ BÀI CHẠY BỊ TỪ CHỐI:</strong> ' + reason;
      }

      showToast(valid ? 'Ghi nhận bài chạy thành công (+ ' + finalKm.toFixed(1) + ' km)!' : 'Bài chạy bị loại do không hợp lệ');

      setTimeout(() => {
        closeAddActModal();
      }, 1500);
    }

    function promptAppeal(actId) {
      const act = liveActivities.find(a => a.id === actId);
      if (!act) return;
      const reason = prompt('Nhập lý do khiếu nại bài "' + act.title + '":', 'Đoạn đường dốc mất sóng GPS co cự ly');
      if (!reason) return;

      act.appealStatus = 'PENDING';
      liveAppeals.unshift({
        id: 'app-' + Date.now(),
        actId: act.id,
        title: act.title + ' (' + act.dist + ' km)',
        runner: act.athlete,
        reason: reason,
        status: 'PENDING'
      });

      renderActivities();
      renderAdminAppeals();
      showToast('Đã gửi đơn khiếu nại tới Ban Tổ Chức!');
    }

    function adminApproveAppeal(appId) {
      const app = liveAppeals.find(a => a.id === appId);
      if (!app) return;
      const kmStr = prompt('Nhập số km công nhận cho VĐV:', '5.0');
      if (kmStr === null) return;
      const km = parseFloat(kmStr) || 5.0;

      app.status = 'APPROVED';
      const act = liveActivities.find(a => a.id === app.actId);
      if (act) {
        act.appealStatus = 'APPROVED';
        act.valid = true;
        act.finalKm = km;
      }
      renderActivities();
      renderAdminAppeals();
      showToast('Đã duyệt khiếu nại thành công (+ ' + km + ' km)!');
    }

    function adminRejectAppeal(appId) {
      const app = liveAppeals.find(a => a.id === appId);
      if (!app) return;
      const reason = prompt('Nhập lý do từ chối khiếu nại:', 'Dữ liệu không đủ cơ sở');
      if (reason === null) return;

      app.status = 'REJECTED';
      const act = liveActivities.find(a => a.id === app.actId);
      if (act) {
        act.appealStatus = 'REJECTED';
      }
      renderActivities();
      renderAdminAppeals();
      showToast('Đã từ chối khiếu nại.');
    }

    function adminConfirmPay(finId) {
      const item = liveFinance.find(f => f.id === finId);
      if (!item) return;
      item.status = 'PAID';
      renderAdminFinance();
      showToast('Đã xác nhận thu nộp quỹ thành công!');
    }

    function changeLifecycle(val) {
      showToast('Đã chuyển trạng thái giải chạy sang: ' + val.toUpperCase());
    }

    function recalculateAllAdmin() {
      let valid = 0;
      liveActivities.forEach(a => { if (a.valid) valid++; });
      showToast('Đã tính toán lại toàn bộ: ' + valid + '/' + liveActivities.length + ' bài hợp lệ!');
    }

    function exportActivitiesCsv() {
      let csv = 'ID,Ten_Bai,VDV,Cu_ly_km,Pace,Gain,Hop_le\\n';
      liveActivities.forEach(a => {
        csv += a.id + ',"' + a.title + '","' + a.athlete + '",' + a.finalKm + ',"' + a.paceStr + '",' + a.gain + ',' + (a.valid ? 'YES' : 'NO') + '\\n';
      });
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'openrace-activities-' + Date.now() + '.csv';
      a.click();
      URL.revokeObjectURL(url);
    }

    // Subsystem [1.0] DASHBOARD RUNNER STATE & HANDLERS
    let userRacesData = [
      {
        raceId: 'race-season-10',
        name: 'Mùa 10 Run to Techcombank 2026',
        slug: 'season-10-run-to-techcombank',
        club: 'SARC',
        team: 'Phoenix SARC',
        standing: '#1 Dẫn đầu',
        badge: 'gold',
        personalKm: 125.0,
        teamKm: 1250.0
      },
      {
        raceId: 'race-trail-bavi-2026',
        name: 'SARC Trail Challenge Ba Vì 2026',
        slug: 'sarc-trail-challenge-bavi-2026',
        club: 'SARC Trail Division',
        team: 'Dragons Trail',
        standing: 'Đồng hạng 2',
        badge: 'silver',
        personalKm: 42.0,
        teamKm: 1000.0
      },
      {
        raceId: 'race-vpbank-prep',
        name: 'VPBank Hanoi Marathon Prep 2026',
        slug: 'vpbank-hanoi-marathon-prep-2026',
        club: 'Hanoi Runners Union',
        team: 'Tigers Speed',
        standing: 'Đồng hạng 2',
        badge: 'silver',
        personalKm: 68.0,
        teamKm: 928.0
      }
    ];
    let currentRaceIdx = 0;
    let completedWeeklyKm = 18.5;
    let targetWeeklyKm = 20.0;

    function renderRaceSlide() {
      if (!userRacesData || userRacesData.length === 0) return;
      const race = userRacesData[currentRaceIdx];
      const titleEl = document.getElementById('race-card-title');
      const clubEl = document.getElementById('race-card-club');
      const badgeTextEl = document.getElementById('race-card-badge-text');
      const badgeContainer = document.getElementById('race-card-badge');
      const kmEl = document.getElementById('race-card-km');
      const counterEl = document.getElementById('race-slide-index');

      if (titleEl) titleEl.innerText = race.name;
      if (clubEl) clubEl.innerHTML = 'CLB: ' + race.club + ' • Đội: <span id="race-card-team" class="text-orange-400 font-bold">' + race.team + '</span>';
      if (badgeTextEl) badgeTextEl.innerText = race.standing;
      if (badgeContainer) {
        badgeContainer.className = race.badge === 'gold' 
          ? 'px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 flex items-center gap-1 shadow-sm'
          : 'px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-300 text-slate-900 flex items-center gap-1 shadow-sm';
      }
      if (kmEl) {
        const pct = ((race.personalKm / race.teamKm) * 100).toFixed(1);
        kmEl.innerHTML = race.personalKm.toFixed(1) + ' km <span class="text-[9px] text-slate-400 font-normal">/ ' + race.teamKm.toLocaleString('vi-VN') + ' km (' + pct + '%)</span>';
      }
      if (counterEl) counterEl.innerText = (currentRaceIdx + 1) + ' / ' + userRacesData.length;

      // Update dots
      const dots = document.getElementById('carousel-dots');
      if (dots) {
        dots.innerHTML = userRacesData.map((_, i) => {
          return '<span class="h-2 rounded-full cursor-pointer transition ' + (i === currentRaceIdx ? 'bg-[#FF5B26] w-4' : 'bg-slate-300 w-2') + '" onclick="setRaceSlide(' + i + ')"></span>';
        }).join('');
      }
    }

    function prevRaceSlide() {
      currentRaceIdx = (currentRaceIdx - 1 + userRacesData.length) % userRacesData.length;
      renderRaceSlide();
    }

    function nextRaceSlide() {
      currentRaceIdx = (currentRaceIdx + 1) % userRacesData.length;
      renderRaceSlide();
    }

    function setRaceSlide(idx) {
      if (idx >= 0 && idx < userRacesData.length) {
        currentRaceIdx = idx;
        renderRaceSlide();
      }
    }

    async function quickSyncStrava() {
      const spinner = document.getElementById('sync-spinner');
      if (spinner) spinner.classList.add('animate-spin');
      try {
        const res = await fetch('/api/me/strava-sync', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          completedWeeklyKm = data.newCompletedKm || (completedWeeklyKm + 2.5);
          updateWeeklyProgressUi();
          
          // Add newly synced activity to table
          const syncedAct = {
            id: 'act-strava-' + Date.now(),
            title: '🏃 Chạy sáng Strava Sync ven hồ Tây',
            athlete: 'Nguyễn Văn A',
            dist: 2.5,
            time: 12.5,
            paceStr: '5:00',
            gain: 15,
            valid: true,
            bonus: 0,
            finalKm: 2.5,
            reason: '',
            appealStatus: 'NONE'
          };
          liveActivities.unshift(syncedAct);
          renderActivities();

          const syncTimeEl = document.getElementById('strava-last-sync-time');
          if (syncTimeEl) {
            const now = new Date();
            syncTimeEl.innerText = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' ' + now.toLocaleDateString('vi-VN');
          }

          showToast('Đã đồng bộ thành công bài chạy mới từ Strava (+2.5 km)!');
        }
      } catch (err) {
        console.error('Strava sync error:', err);
        showToast('Đồng bộ Strava hoàn tất!');
      } finally {
        if (spinner) spinner.classList.remove('animate-spin');
      }
    }

    function updateWeeklyProgressUi() {
      const compEl = document.getElementById('cycle-completed-km');
      const targetEl = document.getElementById('cycle-target-km');
      const barEl = document.getElementById('cycle-progress-bar');
      const pctEl = document.getElementById('cycle-percent');
      const bannerEl = document.getElementById('section-1-3');
      const missingKmEl = document.getElementById('penalty-missing-km');

      const remaining = Math.max(0, targetWeeklyKm - completedWeeklyKm);
      const pct = Math.min(100, (completedWeeklyKm / targetWeeklyKm) * 100).toFixed(1);

      if (compEl) compEl.innerText = completedWeeklyKm.toFixed(1);
      if (targetEl) targetEl.innerText = targetWeeklyKm.toFixed(1);
      if (pctEl) pctEl.innerText = pct + '%';
      if (barEl) {
        barEl.style.width = pct + '%';
        if (completedWeeklyKm >= targetWeeklyKm) {
          barEl.className = 'bg-emerald-500 h-full rounded-full transition-all duration-500 shadow-inner';
        }
      }

      if (bannerEl && missingKmEl) {
        if (remaining <= 0) {
          bannerEl.className = 'text-[11px] text-emerald-800 bg-emerald-50/90 p-3 rounded-2xl border border-emerald-300 flex items-center justify-between shadow-sm';
          bannerEl.innerHTML = '<div class="flex items-center gap-1.5 font-bold"><span class="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-200 text-emerald-900">[1.3] AN TOÀN</span><span>✓ Bạn đã hoàn thành chỉ tiêu tuần, không bị phạt!</span></div>';
        } else {
          missingKmEl.innerText = remaining.toFixed(1) + ' km';
        }
      }
    }

    function compensateRunNow() {
      openAddActModal();
      const distInput = document.getElementById('act-input-dist');
      const titleInput = document.getElementById('act-input-title');
      const timeInput = document.getElementById('act-input-time');
      if (distInput) distInput.value = '1.5';
      if (titleInput) titleInput.value = 'Chạy bù hoàn thành chỉ tiêu tuần';
      if (timeInput) timeInput.value = '8.5';
    }

    function openJoinRaceModal() {
      const modal = document.getElementById('join-race-modal');
      if (modal) modal.classList.remove('hidden');
    }

    function closeJoinRaceModal() {
      const modal = document.getElementById('join-race-modal');
      const fb = document.getElementById('join-modal-feedback');
      if (modal) modal.classList.add('hidden');
      if (fb) fb.classList.add('hidden');
    }

    function switchJoinTab(tab) {
      const btnCode = document.getElementById('join-tab-code-btn');
      const btnQr = document.getElementById('join-tab-qr-btn');
      const viewCode = document.getElementById('join-view-code');
      const viewQr = document.getElementById('join-view-qr');

      if (tab === 'code') {
        btnCode.className = 'flex-1 py-1.5 text-xs font-bold rounded-xl bg-white text-slate-900 shadow-sm transition';
        btnQr.className = 'flex-1 py-1.5 text-xs font-bold rounded-xl text-slate-500 hover:text-slate-900 transition';
        viewCode.classList.remove('hidden');
        viewQr.classList.add('hidden');
      } else {
        btnQr.className = 'flex-1 py-1.5 text-xs font-bold rounded-xl bg-white text-slate-900 shadow-sm transition';
        btnCode.className = 'flex-1 py-1.5 text-xs font-bold rounded-xl text-slate-500 hover:text-slate-900 transition';
        viewQr.classList.remove('hidden');
        viewCode.classList.add('hidden');
      }
    }

    function setJoinSampleCode(code) {
      const input = document.getElementById('join-code-input');
      if (input) input.value = code;
    }

    async function submitJoinCode() {
      const input = document.getElementById('join-code-input');
      const code = input ? input.value.trim() : '';
      if (!code) {
        alert('Vui lòng nhập mã mời giải chạy!');
        return;
      }
      try {
        const res = await fetch('/api/races/join-by-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code })
        });
        const data = await res.json();
        const fb = document.getElementById('join-modal-feedback');
        if (fb) {
          fb.classList.remove('hidden');
          if (data.success) {
            fb.className = 'p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs';
            fb.innerHTML = '<strong>✓ GIA NHẬP THÀNH CÔNG!</strong> ' + data.message;
            if (data.race && !userRacesData.some(r => r.raceId === data.race.raceId)) {
              userRacesData.push({
                raceId: data.race.raceId,
                name: data.race.name,
                slug: data.race.slug,
                club: data.race.club,
                team: data.race.team,
                standing: data.race.teamStandingLabel || '#1 Dẫn đầu',
                badge: data.race.badgeColor || 'gold',
                personalKm: data.race.personalContributedKm || 0.0,
                teamKm: data.race.teamTotalKm || 50.0
              });
              currentRaceIdx = userRacesData.length - 1;
              renderRaceSlide();
            }
            showToast('Gia nhập giải thành công!');
            setTimeout(closeJoinRaceModal, 1500);
          } else {
            fb.className = 'p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-xs';
            fb.innerHTML = '<strong>✕ LỖI:</strong> ' + data.message;
          }
        }
      } catch (err) {
        console.error('Join error:', err);
      }
    }

    function simulateQrScanSuccess() {
      setJoinSampleCode('OR-8K2Q');
      switchJoinTab('code');
      submitJoinCode();
    }

    function openProrateModal() {
      const modal = document.getElementById('prorate-info-modal');
      if (modal) modal.classList.remove('hidden');
    }

    function closeProrateModal() {
      const modal = document.getElementById('prorate-info-modal');
      if (modal) modal.classList.add('hidden');
    }

    
    // V2 Community & Advanced Client Handlers
    async function disconnectStravaClient() {
      try {
        const res = await fetch('/api/v1/me/strava', { method: 'DELETE' });
        const data = await res.json();
        showToast(data.message || 'Đã hủy kết nối Strava. Các bài chạy cũ vẫn được bảo lưu.');
        const btn = document.getElementById('btn-disconnect-strava');
        if (btn) btn.innerText = 'Đã hủy kết nối (Revoked)';
      } catch (e) {
        showToast('Đã hủy kết nối Strava');
      }
    }

    async function reconnectStravaClient() {
      try {
        await fetch('/api/v1/me/strava/reconnect', { method: 'POST' });
        showToast('✓ Đã kết nối lại tài khoản Strava thành công!');
      } catch (e) {
        showToast('✓ Đã kết nối lại tài khoản Strava!');
      }
    }

    async function renderStravaSyncLogs() {
      try {
        const res = await fetch('/api/v1/me/strava/sync-logs');
        const logs = await res.json();
        const tbody = document.getElementById('strava-sync-logs-tbody');
        if (!tbody || !Array.isArray(logs)) return;
        tbody.innerHTML = logs.map(l => {
          const dateStr = new Date(l.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date(l.createdAt).toLocaleDateString('vi-VN');
          const isErr = l.status === 'failed' || l.status === 'ignored';
          return '<tr class="hover:bg-slate-100/50">' +
            '<td class="py-2 px-3 font-mono text-[11px]">' + dateStr + '</td>' +
            '<td class="py-2 px-3 font-mono font-bold text-slate-800">#' + (l.stravaActivityId || 'N/A') + '</td>' +
            '<td class="py-2 px-3 font-semibold text-slate-600">' + l.syncSource + '</td>' +
            '<td class="py-2 px-3"><span class="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ' + (isErr ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800') + '">' + l.httpStatusCode + '</span></td>' +
            '<td class="py-2 px-3"><span class="' + (isErr ? 'text-rose-600' : 'text-emerald-700') + ' font-bold">' + l.status + '</span></td>' +
            '<td class="py-2 px-3 text-right"><button onclick="showToast(&quot;Chi tiết log: #' + l.id + '&quot;)" class="text-blue-600 font-bold hover:underline">Xem JSON</button></td>' +
          '</tr>';
        }).join('');
        showToast('Đã cập nhật danh sách logs truyền Strava');
      } catch (e) {}
    }

    async function toggleKudosClient(postId) {
      try {
        const res = await fetch('/api/v1/community/posts/' + postId + '/kudos', { method: 'POST' });
        const data = await res.json();
        const el = document.getElementById('kudos-count-' + postId);
        if (el) el.innerText = data.kudosCount;
        showToast(data.liked ? '🔥 Đã thả Kudos khích lệ!' : 'Đã bỏ thả Kudos');
      } catch (e) {}
    }

    async function submitCommentClient(postId) {
      const input = document.getElementById('comment-input-' + postId);
      const text = input ? input.value : '';
      if (!text) return;
      try {
        await fetch('/api/v1/community/posts/' + postId + '/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: text })
        });
        if (input) input.value = '';
        showToast('Đã gửi bình luận khích lệ!');
      } catch (e) {}
    }

    window.addEventListener('DOMContentLoaded', () => {
      renderActivities();
      renderAdminAppeals();
      renderAdminFinance();
      renderClubMembers();
      renderAdminMemberList();
      updateSubNav('dashboard');
      renderRaceSlide();
    });

    // ========================================================
    // V2.1 INTERACTIVE CLIENT-SIDE HANDLERS
    // ========================================================
    async function disconnectStravaClient() {
      try {
        const res = await fetch('/api/v1/me/strava', { method: 'DELETE' });
        const badge = document.getElementById('strava-status-badge');
        if (badge) {
          badge.className = 'px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5';
          badge.innerHTML = '<span class="w-2 h-2 rounded-full bg-rose-500"></span><span>ĐÃ HỦY LIÊN KẾT (REVOKED)</span>';
        }
        document.getElementById('btn-strava-disconnect')?.classList.add('hidden');
        document.getElementById('btn-strava-reconnect')?.classList.remove('hidden');
        showToast('⚠️ Đã ngắt kết nối Strava. Thành tích cũ vẫn được bảo lưu an toàn!');
      } catch (e) {
        showToast('Lỗi khi ngắt kết nối Strava');
      }
    }

    async function reconnectStravaClient() {
      try {
        const res = await fetch('/api/v1/me/strava/reconnect', { method: 'POST' });
        const badge = document.getElementById('strava-status-badge');
        if (badge) {
          badge.className = 'px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5';
          badge.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span><span>ĐANG KẾT NỐI (ACTIVE)</span>';
        }
        document.getElementById('btn-strava-disconnect')?.classList.remove('hidden');
        document.getElementById('btn-strava-reconnect')?.classList.add('hidden');
        showToast('✓ Đã kết nối lại Strava OAuth 2.0 thành công!');
      } catch (e) {
        showToast('Lỗi khi kết nối lại Strava');
      }
    }

    function triggerManualSync() {
      showToast('🔄 Đang quét gói tin mới từ Strava API Developer Console...');
      setTimeout(() => {
        showToast('✓ Đồng bộ hoàn tất: Không có bài chạy mới nào phát sinh');
      }, 1000);
    }

    function viewRawPayload(stravaId) {
      showToast('Payload thô Strava #' + stravaId + ': Event activity/create (200 OK)');
    }

    async function saveTeamIdentity(teamId) {
      const name = document.getElementById('team-name-input')?.value || 'Team Phoenix SARC';
      const slogan = document.getElementById('team-slogan-input')?.value || '';
      try {
        const res = await fetch('/api/v1/teams/' + teamId, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, slogan })
        });
        showToast('👑 Đã cập nhật nhận diện Đội trưởng: "' + name + '"');
      } catch (e) {
        showToast('Lỗi khi lưu nhận diện đội');
      }
    }

    function nudgeMember(memberName) {
      showToast('⚡ Đã gửi thông báo đôn đốc tới ' + memberName + ' qua kênh Chat đội!');
    }

    function filterSocialFeed(type) {
      document.querySelectorAll('#feed-filter-all, #feed-filter-club, #feed-filter-friends').forEach(b => {
        b.className = 'px-3 py-1.5 rounded-xl text-slate-600 hover:text-slate-900';
      });
      const activeBtn = document.getElementById('feed-filter-' + type);
      if (activeBtn) activeBtn.className = 'px-3 py-1.5 rounded-xl bg-[#18181B] text-white';
      showToast('Đang hiển thị luồng tin: ' + (type === 'all' ? 'Toàn sàn' : type === 'club' ? 'CLB SARC' : 'Bạn bè'));
    }

    async function toggleKudosClient(postId) {
      try {
        const res = await fetch('/api/v1/community/posts/' + postId + '/kudos', { method: 'POST' });
        const data = await res.json();
        const countEl = document.getElementById('kudos-count-' + postId);
        if (countEl) countEl.innerText = data.kudosCount || 19;
        showToast(data.liked ? '🔥 Đã thả Kudos khích lệ thành tích!' : 'Đã bỏ thả Kudos');
      } catch (e) {
        showToast('🔥 Đã thả Kudos!');
      }
    }

    async function submitCommentClient(postId) {
      const input = document.getElementById('comment-input-' + postId);
      const text = input ? input.value.trim() : '';
      if (!text) return;
      const list = document.getElementById('comments-list-' + postId);
      if (list) {
        const item = document.createElement('div');
        item.className = 'flex items-start gap-2 animate-in fade-in';
        item.innerHTML = '<span class="font-bold text-slate-900">Nguyễn Văn A:</span><span class="text-slate-700">' + text + '</span>';
        list.appendChild(item);
      }
      if (input) input.value = '';
      showToast('✓ Đã gửi bình luận');
    }

    async function respondFriendRequestClient(userId, accept) {
      try {
        await fetch('/api/v1/me/friends/requests/' + userId, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accept })
        });
        showToast(accept ? '✓ Đã đồng ý kết bạn! Hoạt động của nhau sẽ xuất hiện trên Feed bạn bè' : 'Đã từ chối lời mời');
      } catch (e) {
        showToast(accept ? '✓ Đã kết bạn thành công!' : 'Đã từ chối');
      }
    }

    function switchChatChannel(chanName) {
      document.querySelectorAll('#chan-clb, #chan-phoenix, #chan-offline, #chan-bcn').forEach(b => {
        b.className = 'w-full text-left p-2.5 rounded-xl font-medium text-slate-700 hover:bg-slate-100 flex items-center justify-between';
      });
      showToast('Đã chuyển sang kênh: ' + chanName);
    }

    function sendChatMessage() {
      const input = document.getElementById('chat-msg-input');
      const val = input ? input.value.trim() : '';
      if (!val) return;
      const container = document.getElementById('chat-messages-container');
      if (container) {
        const userMsg = document.createElement('div');
        userMsg.className = 'flex items-start gap-2.5 animate-in fade-in';
        userMsg.innerHTML = '<div class="w-8 h-8 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shrink-0">NA</div>' +
          '<div class="space-y-1 max-w-[80%]">' +
          '<div class="flex items-center gap-2"><span class="font-bold text-slate-900">Nguyễn Văn A</span><span class="text-[10px] text-slate-400">Vừa xong</span></div>' +
          '<div class="p-3 rounded-2xl rounded-tl-none bg-orange-50 border border-orange-200 text-slate-800">' + val + '</div>' +
          '</div>';
        container.appendChild(userMsg);

        // Check if @PacerBot or question
        if (val.toLowerCase().includes('@pacerbot') || val.toLowerCase().includes('luật') || val.toLowerCase().includes('trail') || val.toLowerCase().includes('pace')) {
          setTimeout(() => {
            const botMsg = document.createElement('div');
            botMsg.className = 'flex items-start gap-2.5 animate-in fade-in';
            botMsg.innerHTML = '<div class="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0">🤖</div>' +
              '<div class="space-y-1 max-w-[85%]">' +
              '<div class="flex items-center gap-2"><span class="font-bold text-indigo-600">PacerBot AI</span><span class="text-[9px] bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded font-black">AI RESPONDER</span></div>' +
              '<div class="p-3 rounded-2xl rounded-tl-none bg-indigo-50 border border-indigo-200 text-indigo-950 leading-relaxed">Chào bạn Nguyễn Văn A! Hệ thống xác nhận cự ly tối thiểu giải Mùa 10 là 3.0km, Pace cho phép từ 4:00 đến 10:00. Sàn Pace kỹ thuật chặn gian lận là 2:45 min/km. Chúc bạn chạy vui khỏe!</div>' +
              '</div>';
            container.appendChild(botMsg);
            container.scrollTop = container.scrollHeight;
          }, 600);
        }
        container.scrollTop = container.scrollHeight;
      }
      if (input) input.value = '';
    }

    function quickAskBot(type) {
      const input = document.getElementById('chat-msg-input');
      if (input) {
        input.value = type === 'Hỏi luật Trail' ? '@PacerBot giải thích công thức thưởng Trail Gain giải này?' : '@BanterBot cho một câu cà khịa thi đua đội nào!';
        sendChatMessage();
      }
    }

    function saveBanterSettings() {
      showToast('✓ Đã cập nhật cấu hình Banter Roast Engine: Mức 3 (Cà khịa thi đua)!');
    }

    function submitDisciplinaryWarning() {
      showToast('✓ Đã ban hành cảnh báo kỷ luật và gửi thông báo tới vận động viên!');
    }

    function rsvpOfflineEvent(evtId) {
      const textEl = document.getElementById('rsvp-status-text');
      if (textEl) {
        const isGoing = textEl.innerText.includes('Going');
        textEl.innerText = isGoing ? 'Hủy Tham Gia' : 'Tôi Sẽ Tham Gia (Going)';
        showToast(isGoing ? 'Đã hủy tham gia buổi chạy Offline' : '✓ Đã xác nhận tham gia Long Run cuối tuần!');
      }
    }

    function checkinOfflineEventModal(evtId) {
      showToast('📷 Đã kích hoạt camera quét mã QR Check-in điểm danh tại chỗ!');
    }

    function voteClubPoll(option) {
      if (option === 'A') {
        document.getElementById('poll-pct-a').innerText = '71% (44 phiếu)';
        document.getElementById('poll-bar-a').style.width = '71%';
      } else {
        document.getElementById('poll-pct-b').innerText = '35% (22 phiếu)';
        document.getElementById('poll-bar-b').style.width = '35%';
      }
      showToast('✓ Đã ghi nhận biểu quyết của bạn cho Phương Án ' + option + '!');
    }


    // ========================================================
    // [UX & OPS] URL HASH ROUTING, THEME & ACTION CENTER
    // ========================================================
    function toggleDarkMode() {
      const isDark = document.documentElement.classList.toggle('dark');
      document.body.classList.toggle('dark', isDark);
      const btn = document.getElementById('btn-theme-toggle');
      if (btn) btn.innerText = isDark ? '☀️' : '🌙';
      localStorage.setItem('openrace_theme', isDark ? 'dark' : 'light');
      showToast(isDark ? '🌙 Đã bật chế độ ban đêm (Dark Mode)' : '☀️ Đã chuyển sang chế độ ban ngày');
    }

    // URL Hash State Routing
    function syncUrlHash(tabId, sectionId) {
      const targetHash = sectionId ? '#' + tabId + '/' + sectionId : '#' + tabId;
      if (window.location.hash !== targetHash) {
        history.replaceState(null, '', targetHash);
      }
      const activeText = document.getElementById('header-active-text');
      if (activeText) {
        const titleMap = {
          'dashboard': '[1.0] Dashboard Runner',
          'strava-sync': '[1.B] Quản Lý Strava & Sync Logs',
          'arena': '[2.0] Đấu Trường Giải',
          'activities': '[3.0] Nhật Ký Bài Chạy',
          'club': '[4.0] Không Gian CLB',
          'finance': '[5.0] Cá Nhân & Sổ Nợ',
          'rules': '[6.0] Điều Hành Thể Lệ',
          'teams': '[7.0] Đội Thi Đấu & Đội Trưởng',
          'social': '[8.0] Mạng Xã Hội & Bạn Bè',
          'chat': '[9.0] Chat, PacerBot AI & Banter',
          'governance': '[10.0] Điều Hành CLB ERP',
          'club-manage': '[6.0] Quản Trị CLB',
          'admin': '[8.0] Super Admin Toàn Sàn'
        };
        activeText.innerText = titleMap[tabId] || tabId;
      }
    }

    function handleHashRouting() {
      const hash = window.location.hash.replace('#', '').trim();
      if (!hash) return;
      const parts = hash.split('/');
      const tab = parts[0];
      const section = parts[1];
      if (tab) {
        switchTab(tab);
        if (section) {
          setTimeout(() => showSubScreen(tab, section), 50);
        }
      }
    }

    // Initialize Theme and Hash on Load
    window.addEventListener('DOMContentLoaded', () => {
      const savedTheme = localStorage.getItem('openrace_theme');
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
        const btn = document.getElementById('btn-theme-toggle');
        if (btn) btn.innerText = '☀️';
      }
      handleHashRouting();
    });

    window.addEventListener('hashchange', handleHashRouting);

    // Admin Action Center Handlers
    let pendingActionCount = 3;

    function resolveActionItem(itemId, isApproved) {
      const el = document.getElementById('inbox-item-' + itemId);
      if (el) {
        el.className = 'p-3.5 rounded-2xl bg-slate-900 border border-emerald-500/60 opacity-60 transition';
        el.innerHTML = '<div class="text-center py-2 text-emerald-400 font-bold text-xs">✓ ' + (isApproved ? 'Đã phê duyệt thành công' : 'Đã từ chối') + '</div>';
        pendingActionCount--;
        updateInboxBadge();
      }
      showToast(isApproved ? '✓ Đã phê duyệt yêu cầu thành công!' : 'Đã từ chối yêu cầu');
    }

    function updateInboxBadge() {
      const badge = document.getElementById('inbox-zero-badge');
      if (!badge) return;
      if (pendingActionCount <= 0) {
        badge.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white';
        badge.innerText = '✓ 0 Yêu Cầu - Hoàn Tất (Inbox Zero)';
        const btn = document.getElementById('btn-batch-approve');
        if (btn) {
          btn.className = 'px-4 py-2 bg-slate-800 text-slate-500 font-bold text-xs rounded-xl cursor-not-allowed';
          btn.innerText = '✓ ĐÃ HOÀN TẤT INBOX ZERO';
          btn.disabled = true;
        }
      } else {
        badge.innerText = pendingActionCount + ' Yêu Cầu Chờ Duyệt';
      }
    }

    function batchApproveActionCenter() {
      resolveActionItem(1, true);
      resolveActionItem(2, true);
      resolveActionItem(3, true);
      pendingActionCount = 0;
      updateInboxBadge();
      showToast('🎉 Tuyệt vời! Đã duyệt thành công tất cả 3 yêu cầu và đạt trạng thái Inbox Zero!');
    }

    async function testBankWebhookAutoReconcile(refCode) {
      showToast('⚡ Đang mô phỏng Webhook Ngân Hàng nhận tiền (' + refCode + ')...');
      try {
        const res = await fetch('/api/webhooks/banking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ referenceCode: refCode, amount: 100000, bank: 'MBBank' })
        });
        const data = await res.json();
        resolveActionItem(3, true);
        showToast('✓ ' + data.message);
      } catch (e) {
        showToast('✓ Webhook tự động gạch nợ thành công!');
        resolveActionItem(3, true);
      }
    }

  