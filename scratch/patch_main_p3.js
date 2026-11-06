const fs = require('fs');
const path = require('path');

const mainPath = path.resolve(__dirname, '../workspace/backend/src/main.ts');
let content = fs.readFileSync(mainPath, 'utf8');

// 1. Add ActivityFeedUseCase import
if (!content.includes('ActivityFeedUseCase')) {
  content = content.replace(
    "import { RaceArenaUseCase } from './application/use-cases/race-arena.use-case';",
    "import { RaceArenaUseCase } from './application/use-cases/race-arena.use-case';\nimport { ActivityFeedUseCase } from './application/use-cases/activity-feed.use-case';"
  );
}

// 2. Instantiate ActivityFeedUseCase in bootstrap()
if (!content.includes('const activityFeedUseCase =')) {
  content = content.replace(
    'const raceArenaUseCase = new RaceArenaUseCase(dataStore);',
    'const raceArenaUseCase = new RaceArenaUseCase(dataStore);\n  const activityFeedUseCase = new ActivityFeedUseCase(dataStore);'
  );
}

// 3. Make sidebar visible by default on desktop/laptop, removing hidden lg:flex
content = content.replace(
  'id="main-sidebar" class="w-80 bg-white/95 rounded-3xl p-4 flex flex-col justify-between border border-slate-200/80 shadow-[0_4px_25px_rgb(0,0,0,0.03)] shrink-0 my-4 ml-4 hidden lg:flex overflow-y-auto max-h-[calc(100vh-2rem)] no-scrollbar"',
  'id="main-sidebar" class="w-72 lg:w-80 bg-white/95 rounded-3xl p-4 flex flex-col justify-between border border-slate-200/80 shadow-[0_4px_25px_rgb(0,0,0,0.03)] shrink-0 my-4 ml-4 flex overflow-y-auto max-h-[calc(100vh-2rem)] no-scrollbar z-30 transition-all"'
);

// 4. Make top nav pills visible on all screens, removing hidden xl:flex
content = content.replace(
  '<nav class="hidden xl:flex items-center bg-white/90 border border-slate-200/80 rounded-full p-1 shadow-sm overflow-x-auto max-w-2xl no-scrollbar">',
  '<nav class="flex items-center bg-white/90 border border-slate-200/80 rounded-full p-1 shadow-sm overflow-x-auto max-w-2xl no-scrollbar">'
);

// 5. Add toggle button for sidebar in header if not already present
if (!content.includes('toggleSidebar()')) {
  content = content.replace(
    '<!-- Left Logo & Mobile Toggle -->\n      <div class="flex items-center gap-3">',
    '<!-- Left Logo & Mobile Toggle -->\n      <div class="flex items-center gap-3">\n        <button onclick="toggleSidebar()" class="w-9 h-9 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition shadow-sm" title="Đóng / Mở Menu Cây">\n          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>\n        </button>'
  );
}

// 6. Add Subsystem 3 API routes
const apiRoutesAnchor = 'raceArenaUseCase.postCheer(payload.author || \'Nguyễn Văn A\', payload.message || \'Cố lên cả đội!\');';
if (!content.includes('/api/me/activities')) {
  const p3Routes = `
    // [3.1] & [3.2] Activity Feed with filters
    if (req.method === 'GET' && pathname === '/api/me/activities') {
      const url = new URL(req.url || '/', \`http://\${req.headers.host || 'localhost'}\`);
      const filter = (url.searchParams.get('filter') || 'all') as 'all' | 'valid' | 'invalid';
      const raceId = url.searchParams.get('raceId') || 'season-10-run-to-techcombank';
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(activityFeedUseCase.getActivities('user-01', filter, raceId)));
      return true;
    }

    // [3.3] Activity Audit Detail
    const actDetailMatch = pathname.match(/^\\/api\\/activities\\/([^\\/]+)$/);
    if (req.method === 'GET' && actDetailMatch) {
      const actId = actDetailMatch[1];
      const detail = activityFeedUseCase.getActivityDetail(actId, 'user-01');
      if (detail) {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(detail));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'Activity not found' }));
      }
      return true;
    }

    // [3.4] Submit Appeal
    const actAppealMatch = pathname.match(/^\\/api\\/activities\\/([^\\/]+)\\/appeal$/);
    if (req.method === 'POST' && actAppealMatch) {
      const actId = actAppealMatch[1];
      let body = '';
      req.on('data', (chunk) => { body += chunk; });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body || '{}');
          const appeal = activityFeedUseCase.submitAppeal(
            'user-01',
            actId,
            payload.raceId || 'season-10-run-to-techcombank',
            payload.reason || 'Khiếu nại lỗi GPS',
            payload.evidenceUrl
          );
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: true, appeal }));
        } catch (err: any) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return true;
    }
`;
  content = content.replace(
    apiRoutesAnchor,
    apiRoutesAnchor + p3Routes
  );
}

// 7. Update Tab 3 HTML with rich filters, selectors, and status
const tab3Anchor = '<div id="tab-activities" class="tab-content max-w-4xl mx-auto space-y-4">';
if (!content.includes('id="filter-act-all"')) {
  const newTab3Html = `<div id="tab-activities" class="tab-content max-w-4xl mx-auto space-y-4">
        <div id="section-3-1" class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_4px_25px_rgb(0,0,0,0.03)] space-y-4">
          <div class="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-100 text-[#FF5B26]">[3.1] Personal Feed</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-600">[3.2] Bộ Lọc Giải</span>
              </div>
              <h3 class="text-base font-extrabold text-slate-900 mt-1">Nhật Ký Bài Chạy & Tem Thẩm Định</h3>
            </div>
            <div class="flex items-center gap-2">
              <button onclick="exportActivitiesCsv()" class="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1.5">
                <span>📥</span> Xuất CSV
              </button>
              <button onclick="openAddActModal()" class="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#FF5B26] hover:bg-[#e04800] text-white shadow-sm transition flex items-center gap-1.5">
                <span>+</span> Thêm bài chạy mới
              </button>
            </div>
          </div>

          <!-- [3.1] Filter Segmented Bar & [3.2] Race selector -->
          <div class="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-slate-100">
            <div class="inline-flex bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs">
              <button onclick="setActivityFilter('all')" id="filter-act-all" class="filter-act-btn px-3 py-1 rounded-xl font-bold bg-white text-slate-900 shadow-sm transition">
                Tất cả (<span id="count-act-all">5</span>)
              </button>
              <button onclick="setActivityFilter('valid')" id="filter-act-valid" class="filter-act-btn px-3 py-1 rounded-xl font-bold text-slate-500 hover:text-slate-900 transition">
                ✓ Hợp lệ (<span id="count-act-valid">3</span>)
              </button>
              <button onclick="setActivityFilter('invalid')" id="filter-act-invalid" class="filter-act-btn px-3 py-1 rounded-xl font-bold text-slate-500 hover:text-slate-900 transition">
                ✕ Bị loại (<span id="count-act-invalid">2</span>)
              </button>
            </div>

            <div class="flex items-center gap-2 text-xs">
              <span class="text-slate-500 font-semibold">[3.2] Giải:</span>
              <select id="act-race-filter" onchange="filterByRace(this.value)" class="bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-medium focus:ring-1 focus:ring-orange-500">
                <option value="all">Tất cả giải đấu</option>
                <option value="season-10-run-to-techcombank" selected>Mùa 10 Run to Techcombank 2026</option>
              </select>
            </div>
          </div>

          <div id="section-3-3" class="text-xs text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between flex-wrap gap-2">
            <span><strong>[3.3] Chi tiết thẩm định:</strong> Cự ly, Pace thực tế, Độ cao dốc & Thưởng Trail (+1km/100m gain)</span>
            <span class="text-[#FF5B26] font-bold">[3.4] Gửi khiếu nại (Drawer mở tức thì)</span>
          </div>

          <div id="activities-container" class="space-y-3">
            <!-- Dynamic activities list rendered by JS -->
          </div>
        </div>
      </div>`;
  content = content.replace(
    /<div id="tab-activities" class="tab-content max-w-4xl mx-auto space-y-4">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/,
    newTab3Html
  );
}

// 8. Add Appeal Drawer modal HTML before </main>
if (!content.includes('id="appeal-drawer"')) {
  const drawerHtml = `
  <!-- [3.4] Submit Appeal Drawer / Modal -->
  <div id="appeal-drawer" class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 hidden p-4">
    <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xl max-w-lg w-full space-y-4 animate-in fade-in zoom-in-95 duration-200">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-100 text-[#FF5B26]">[3.4] Khiếu Nại</span>
          <h4 class="text-base font-extrabold text-slate-900">Gửi Đơn Khiếu Nại Thẩm Định</h4>
        </div>
        <button onclick="closeAppealDrawer()" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition font-bold text-xs">✕</button>
      </div>

      <div class="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-900 space-y-1">
        <div class="font-bold flex items-center gap-1.5">
          <span>⚠️</span> <span id="appeal-act-title">Bài chạy #ACT-000072</span>
        </div>
        <div class="text-[11px] text-amber-800" id="appeal-act-reason">Lý do từ chối: Pace 2:30 min/km nhanh hơn sàn pace hệ thống 2:45 min/km (Nghi vấn phương tiện cơ giới)</div>
      </div>

      <div class="space-y-3 text-xs">
        <div>
          <label class="block font-bold text-slate-700 mb-1">Giải trình lý do khiếu nại (*):</label>
          <textarea id="appeal-reason-input" rows="3" class="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-orange-500 outline-none" placeholder="VD: Đoạn dốc cầu Nhật Tân/hầm Kim Liên bị nhảy vệ tinh GPS dẫn đến pace bị ảo, cự ly thực tế đúng 6.0km..."></textarea>
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">Link bằng chứng / Ảnh chụp GPS:</label>
          <input type="text" id="appeal-evidence-input" class="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-orange-500 outline-none" placeholder="https://www.strava.com/activities/889972" value="https://www.strava.com/activities/889972">
        </div>
      </div>

      <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 text-xs">
        <button onclick="closeAppealDrawer()" class="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition">Hủy bỏ</button>
        <button onclick="submitAppealDrawer()" id="btn-submit-appeal-drawer" class="px-5 py-2 rounded-xl bg-[#FF5B26] hover:bg-[#e04800] text-white font-bold shadow-md shadow-orange-500/20 transition flex items-center gap-1.5">
          <span>📤</span> Gửi Ban Quản Trị Duyệt
        </button>
      </div>
    </div>
  </div>
`;
  content = content.replace('</main>', drawerHtml + '\n    </main>');
}

// 9. Update client script for activities filtering, drawer, and rendering
if (!content.includes('let currentActivityFilter =')) {
  const clientScriptAdditions = `
    let currentActivityFilter = 'all';
    let currentRaceFilter = 'all';
    let currentAppealActId = null;

    function toggleSidebar() {
      const sb = document.getElementById('main-sidebar');
      if (sb) {
        sb.classList.toggle('hidden');
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
`;

  content = content.replace(
    'let liveActivities = [',
    clientScriptAdditions + '\n    let liveActivities = ['
  );
}

// 10. Update renderActivities() to filter and render Chakra Petch tabular metrics
const oldRenderActivities = `function renderActivities() {
      const container = document.getElementById('activities-container');
      if (!container) return;
      container.innerHTML = liveActivities.map(act => {
        let statusBadge = act.valid
          ? '<span class="text-emerald-700 bg-emerald-100/70 text-[10px] font-semibold px-2 py-0.5 rounded-full">✓ Hợp Lệ</span>'
          : '<span class="text-rose-700 bg-rose-100/70 text-[10px] font-semibold px-2 py-0.5 rounded-full">✕ Bị Từ Chối</span>';
        if (act.bonus > 0) {
          statusBadge += ' <span class="text-[#FF5B26] bg-orange-100/70 text-[10px] font-semibold px-2 py-0.5 rounded-full">+' + act.bonus.toFixed(1) + 'km Trail</span>';
        }
        if (act.appealStatus === 'PENDING') {
          statusBadge += ' <span class="text-amber-700 bg-amber-100 text-[10px] font-semibold px-2 py-0.5 rounded-full animate-pulse">Chờ duyệt khiếu nại</span>';
        } else if (act.appealStatus === 'APPROVED') {
          statusBadge += ' <span class="text-blue-700 bg-blue-100 text-[10px] font-semibold px-2 py-0.5 rounded-full">Đã duyệt khiếu nại</span>';
        }

        let actionBtn = '';
        if (!act.valid && act.appealStatus === 'NONE') {
          actionBtn = '<button onclick="promptAppeal(&quot;' + act.id + '&quot;)" class="mt-1 text-xs font-semibold text-[#FF5B26] hover:underline">Khiếu nại bài này</button>';
        }

        return '<div class="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-between hover:bg-slate-50 transition">' +
          '<div>' +
            '<div class="flex items-center gap-2">' +
              '<span class="text-xs font-bold text-slate-800">' + act.title + '</span>' +
              statusBadge +
            '</div>' +
            '<div class="text-[11px] text-slate-500 mt-1">' +
              'VĐV: <strong>' + act.athlete + '</strong> • ' + act.dist + ' km • ' + act.time + ' phút • Pace: ' + act.paceStr + ' • Dốc: ' + act.gain + 'm' +
              (act.reason ? ' • <span class="text-rose-600">' + act.reason + '</span>' : '') +
            '</div>' +
          '</div>' +
          '<div class="text-right">' +
            '<div class="text-sm font-bold font-mono text-slate-900">' + act.finalKm.toFixed(1) + ' km</div>' +
            actionBtn +
          '</div>' +
        '</div>';
      }).join('');
    }`;

const newRenderActivities = `function renderActivities() {
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
          statusBadge += ' <span class="text-purple-700 bg-purple-100 text-[10px] font-bold px-2 py-0.5 rounded-full">+ ' + act.bonus.toFixed(1) + ' km TRAIL</span>';
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
    }`;

content = content.replace(oldRenderActivities, newRenderActivities);

fs.writeFileSync(mainPath, content, 'utf8');
console.log('Successfully updated main.ts with Subsystem 3 and responsive navigation!');

