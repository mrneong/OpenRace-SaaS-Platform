/**
 * OpenRace SaaS Platform v3.0.0-PROD E2E Automation Suite
 * Tests REST APIs on port 3001 and UI interactions on port 3000 via Headless Chrome CDP
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:3001';
const FRONTEND_BASE = 'http://localhost:3000';
const ARTIFACT_DIR = 'C:\\Users\\nguye\\.gemini\\antigravity\\brain\\6cc28217-793d-48a4-8630-e0b049bf6838';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`  ✕ FAIL: ${message}`);
  }
}

async function testSaasV3RestApis() {
  console.log('\n======================================================');
  console.log('>>> [1/2] TESTING OPENRACE SAAS V3 REST APIS (PORT 3001)');
  console.log('======================================================\n');

  // Reset platform config to standard OpenRace defaults at start of test run
  try {
    await fetch(`${API_BASE}/api/system/platform-config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appName: 'OpenRace',
        brandTag: 'SAAS',
        version: 'v3.2.0 Enterprise',
        defaultTheme: 'mantis'
      })
    });
  } catch (e) {}

  // 1. GET /api/me/navigation-context
  try {
    const res = await fetch(`${API_BASE}/api/me/navigation-context`);
    const data = await res.json();

    assert(res.status === 200, 'GET /api/me/navigation-context returns HTTP 200');
    assert(data.userName === 'Nguyễn Văn A', `User name is ${data.userName}`);
    assert(data.availableRoles && data.availableRoles.length === 5, 'Available roles has 5 options');
    assert(data.totalMenuItems === 19, `Total standard menu items is 19 (got ${data.totalMenuItems})`);

    const expectedTitles = [
      'Tổng Quan', 'Nhật Ký & Bài Chạy', 'Bảng Xếp Hạng', 'Kết Nối Thiết Bị', 'Quỹ & Sổ Nợ',
      'Câu Lạc Bộ', 'Đội Của Tôi', 'Bảng Tin & Kudos', 'Trợ Lý AI', 'Hoạt Động & Biểu Quyết',
      'Thành Viên', 'Thiết Lập Giải', 'Kiểm Duyệt Bài', 'Tài Chính & Quỹ', 'Truyền Thông & Chốt Tuần',
      'Giám Sát Hệ Thống', 'Quản Lý Tenant', 'Phân Quyền (RBAC)', 'Tham Số Hệ Thống'
    ];

    const allItems = (data.groups || []).flatMap(g => g.items);
    assert(allItems.length === 19, `Flat menu item count is 19 (got ${allItems.length})`);

    let titlesMatched = true;
    let badgesClean = true;
    for (let i = 0; i < 19; i++) {
      if (allItems[i].title !== expectedTitles[i]) {
        titlesMatched = false;
        console.error(`Mismatch item ${i}: expected "${expectedTitles[i]}", got "${allItems[i].title}"`);
      }
      if (allItems[i].badge && allItems[i].badge.trim() !== '') {
        badgesClean = false;
      }
    }

    assert(titlesMatched, 'All 19 sidebar menu items match concise standard SaaS names');
    assert(badgesClean, 'Dynamic status badges eliminated from sidebar to keep UI uncluttered');
  } catch (err) {
    assert(false, `GET /api/me/navigation-context error: ${err.message}`);
  }

  // 2. POST /api/me/submit-activity (Optimistic Activity Submission)
  try {
    const res = await fetch(`${API_BASE}/api/me/submit-activity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'user-01',
        distanceKm: 5.2,
        durationMinutes: 28,
        type: 'road'
      })
    });
    const data = await res.json();
    assert(res.status === 200, 'POST /api/me/submit-activity returns HTTP 200');
    assert(data.success === true, 'Activity submission acknowledged as success');
    assert(data.distanceKm === 5.2, `Submitted distance is 5.2 km (got ${data.distanceKm})`);
    assert(data.updatedRaceTotalKm > 0, `Updated race total km returned: ${data.updatedRaceTotalKm}`);
  } catch (err) {
    assert(false, `POST /api/me/submit-activity error: ${err.message}`);
  }

  // 3. POST /api/me/strava-sync-queue (BullMQ worker optimistic queue)
  try {
    const res = await fetch(`${API_BASE}/api/me/strava-sync-queue`, { method: 'POST' });
    const data = await res.json();
    assert(res.status === 200 || res.status === 202, `POST /api/me/strava-sync-queue returns HTTP 202/200 (got ${res.status})`);
    assert(data.queued === true || data.success === true, 'Strava sync job successfully queued in worker');
  } catch (err) {
    assert(false, `POST /api/me/strava-sync-queue error: ${err.message}`);
  }

  // 4. Live Ticker API
  try {
    const res = await fetch(`${API_BASE}/api/races/race-season-10/live-ticker`);
    const data = await res.json();
    assert(res.status === 200, 'GET /api/races/race-season-10/live-ticker returns HTTP 200');
    assert(data.totalAccumulatedKm > 0, `Live ticker reports distance: ${data.totalAccumulatedKm} km`);
  } catch (err) {
    assert(false, `Live ticker API error: ${err.message}`);
  }

  // 5. [AC-PLATFORM-CONFIG-02..04] Platform Configuration REST APIs
  try {
    const res = await fetch(`${API_BASE}/api/system/platform-config`);
    const data = await res.json();
    assert(res.status === 200, 'GET /api/system/platform-config returns HTTP 200');
    assert(data.appName === 'OpenRace', `Platform default appName is OpenRace (got ${data.appName})`);
    assert(data.defaultTheme === 'mantis', `Platform defaultTheme is mantis (got ${data.defaultTheme})`);
    assert(data.customParameters && data.customParameters.length >= 2, `Platform has >= 2 custom parameters (got ${data.customParameters?.length})`);

    // Test PUT update
    const putRes = await fetch(`${API_BASE}/api/system/platform-config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appName: 'OpenRace Enterprise Edition' })
    });
    const putData = await putRes.json();
    assert(putRes.status === 200, 'PUT /api/system/platform-config returns HTTP 200');
    assert(putData.appName === 'OpenRace Enterprise Edition', 'Updated appName returned in PUT response');

    // Test Toggle custom param
    const toggleRes = await fetch(`${API_BASE}/api/system/platform-config/toggle-param`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paramId: 'cfg-cust-01' })
    });
    const toggleData = await toggleRes.json();
    const p1 = toggleData.customParameters.find(p => p.id === 'cfg-cust-01');
    assert(p1.status === 'DEACTIVATED', 'Custom param cfg-cust-01 toggled to DEACTIVATED');

    // Toggle back to ACTIVE and reset appName
    await fetch(`${API_BASE}/api/system/platform-config/toggle-param`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paramId: 'cfg-cust-01' })
    });
    await fetch(`${API_BASE}/api/system/platform-config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appName: 'OpenRace' })
    });
  } catch (err) {
    assert(false, `Platform config API error: ${err.message}`);
  }
}

async function testHeadlessChromeUI() {
  console.log('\n======================================================');
  console.log('>>> [2/2] TESTING FRONTEND VIA HEADLESS CHROME CDP (PORT 3000)');
  console.log('======================================================\n');

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const cdpPort = 9340;

  const chromeProc = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${cdpPort}`,
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1440,900',
    `${FRONTEND_BASE}`
  ]);

  try {
    let targets = null;
    for (let i = 0; i < 35; i++) {
      await new Promise(r => setTimeout(r, 200));
      try {
        const res = await fetch(`http://localhost:${cdpPort}/json`);
        targets = await res.json();
        if (targets && targets.length > 0) break;
      } catch (e) {}
    }

    if (!targets || targets.length === 0) {
      throw new Error('Chrome CDP port not responding');
    }

    const pageTarget = targets.find(t => t.url.includes('3000')) || targets.find(t => t.type === 'page' && !t.url.startsWith('chrome-extension:')) || targets[0];
    const ws = new globalThis.WebSocket(pageTarget.webSocketDebuggerUrl);

    let msgId = 1;
    const pending = new Map();

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.id && pending.has(msg.id)) {
          const { resolve, reject } = pending.get(msg.id);
          pending.delete(msg.id);
          if (msg.error) reject(new Error(msg.error.message));
          else resolve(msg.result);
        }
      } catch (e) {}
    };

    function sendCmd(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = msgId++;
        pending.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    console.log(`  ✓ Connected to Chrome CDP session on port ${cdpPort}`);

    await sendCmd('Page.enable');
    await sendCmd('Runtime.enable');
    await sendCmd('DOM.enable');

    // Wait until document.readyState === 'complete' and switchTab is defined
    for (let i = 0; i < 40; i++) {
      const readyState = await sendCmd('Runtime.evaluate', {
        expression: "document.readyState === 'complete' && !!document.body && typeof switchTab === 'function'",
        returnByValue: true
      });
      if (readyState?.result?.value === true) break;
      await new Promise(r => setTimeout(r, 200));
    }
    await new Promise(r => setTimeout(r, 600));

    // --- Verify AC-MANTIS-DEFAULT-01: Mantis Material UI as Default System Theme ---
    console.log('\n  --- Testing Mantis Material UI as Default Theme (AC-MANTIS-DEFAULT-01) ---');
    await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        localStorage.clear();
        initAppTheme();
      })()`
    });
    await new Promise(r => setTimeout(r, 300));

    const defaultThemeCheck = await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        const bodyTheme = document.body.getAttribute('data-theme');
        const bodyMantisClass = document.body.classList.contains('theme-mantis');
        const mantisSidebarHidden = document.getElementById('mantis-sidebar')?.classList.contains('hidden');
        const mantisHeaderHidden = document.getElementById('mantis-header')?.classList.contains('hidden');
        const mantisDashHidden = document.getElementById('mantis-dashboard-view')?.classList.contains('hidden');
        const slimRailHidden = document.getElementById('slim-rail')?.classList.contains('hidden');
        const openraceHeaderHidden = document.getElementById('openrace-header')?.classList.contains('hidden');
        const openraceDashHidden = document.getElementById('openrace-dashboard-view')?.classList.contains('hidden');
        return {
          bodyTheme,
          bodyMantisClass,
          mantisSidebarHidden,
          mantisHeaderHidden,
          mantisDashHidden,
          slimRailHidden,
          openraceHeaderHidden,
          openraceDashHidden
        };
      })()`,
      returnByValue: true
    });
    const dtc = defaultThemeCheck?.result?.value;
    assert(dtc?.bodyTheme === 'mantis', `Default body data-theme is "mantis" (got "${dtc?.bodyTheme}")`);
    assert(dtc?.bodyMantisClass === true, 'Default body has "theme-mantis" class');
    assert(dtc?.mantisSidebarHidden === false, 'Mantis Sidebar (#mantis-sidebar) is visible by default');
    assert(dtc?.mantisHeaderHidden === false, 'Mantis Header (#mantis-header) is visible by default');
    assert(dtc?.mantisDashHidden === false, 'Mantis Dashboard (#mantis-dashboard-view) is visible by default');
    assert(dtc?.slimRailHidden === true, 'Sport Slim Rail (#slim-rail) is hidden by default');
    assert(dtc?.openraceHeaderHidden === true, 'Sport Header (#openrace-header) is hidden by default');
    assert(dtc?.openraceDashHidden === true, 'Sport Dashboard (#openrace-dashboard-view) is hidden by default');

    // Screenshot: Default Mantis Theme
    const shotMantisDefault = await sendCmd('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'screenshot_mantis_default_theme.png'), Buffer.from(shotMantisDefault.data, 'base64'));
    console.log('  📸 Screenshot saved: screenshot_mantis_default_theme.png');

    // AC-PORTAL-GROUP-BADGE-REMOVAL-01: Verify Portal Group Headers have NO item count badges in Mantis sidebar
    const portalBadgesCheck = await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        const gRunner = document.getElementById('mantis-group-runner')?.firstElementChild?.textContent || '';
        const gClub = document.getElementById('mantis-group-club')?.firstElementChild?.textContent || '';
        const gCaptain = document.getElementById('mantis-group-captain')?.firstElementChild?.textContent || '';
        const gAdmin = document.getElementById('mantis-group-admin')?.firstElementChild?.textContent || '';
        const hasBadges = [gRunner, gClub, gCaptain, gAdmin].some(t => /mục/i.test(t));
        return {
          hasBadges,
          gRunner: gRunner.trim(),
          gClub: gClub.trim(),
          gCaptain: gCaptain.trim(),
          gAdmin: gAdmin.trim()
        };
      })()`,
      returnByValue: true
    });
    const pBC = portalBadgesCheck?.result?.value;
    assert(pBC && !pBC.hasBadges, 'Portal group headers in Mantis sidebar do NOT contain item count badges (clean titles)');
    assert(pBC && pBC.gRunner.includes('Phân Hệ Vận Động Viên'), `Runner Portal Header: "${pBC?.gRunner}"`);
    assert(pBC && pBC.gClub.includes('Phân Hệ Câu Lạc Bộ & Đội'), `Club Portal Header: "${pBC?.gClub}"`);

    // Screenshot: Clean portal headers
    const shotClean = await sendCmd('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'screenshot_sidebar_clean_portal_headers.png'), Buffer.from(shotClean.data, 'base64'));
    console.log('  📸 Screenshot saved: screenshot_sidebar_clean_portal_headers.png');

    // Switch to Sport Cam to verify dynamic theme switcher and test Sport Cam sidebar items
    await sendCmd('Runtime.evaluate', { expression: `setAppTheme('sport')` });
    await new Promise(r => setTimeout(r, 400));

    // 1. Verify concise titles across Sport Cam sidebar
    const titlesCheck = await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        const btnDashboard = document.getElementById('sidebar-dashboard')?.textContent || '';
        const btnActivities = document.getElementById('sidebar-activities')?.textContent || '';
        const btnArena = document.getElementById('sidebar-arena')?.textContent || '';
        const btnDevices = document.getElementById('sidebar-devices')?.textContent || '';
        const btnFinance = document.getElementById('sidebar-finance')?.textContent || '';
        const btnClub = document.getElementById('sidebar-club')?.textContent || '';
        const btnTeams = document.getElementById('sidebar-teams')?.textContent || '';
        const btnSocial = document.getElementById('sidebar-social')?.textContent || '';
        const btnChat = document.getElementById('sidebar-chat')?.textContent || '';
        const btnGov = document.getElementById('sidebar-governance')?.textContent || '';
        const btnMembers = document.getElementById('sidebar-club-manage')?.textContent || '';
        const btnRules = document.getElementById('sidebar-rules')?.textContent || '';
        const btnAdminBatch = document.getElementById('sidebar-club-admin')?.textContent || '';
        const btnAdminFinance = document.getElementById('sidebar-captain-finance')?.textContent || '';
        const btnAdminBroadcast = document.getElementById('sidebar-captain-broadcast')?.textContent || '';
        const btnAdmin = document.getElementById('sidebar-admin')?.textContent || '';
        const btnTenants = document.getElementById('sidebar-admin-tenants')?.textContent || '';
        const btnIam = document.getElementById('sidebar-system-admin')?.textContent || '';
        const btnCatalogs = document.getElementById('sidebar-system-catalogs')?.textContent || '';

        return {
          dashboard: btnDashboard.trim(),
          activities: btnActivities.trim(),
          arena: btnArena.trim(),
          devices: btnDevices.trim(),
          finance: btnFinance.trim(),
          club: btnClub.trim(),
          teams: btnTeams.trim(),
          social: btnSocial.trim(),
          chat: btnChat.trim(),
          governance: btnGov.trim(),
          members: btnMembers.trim(),
          rules: btnRules.trim(),
          adminBatch: btnAdminBatch.trim(),
          adminFinance: btnAdminFinance.trim(),
          adminBroadcast: btnAdminBroadcast.trim(),
          admin: btnAdmin.trim(),
          tenants: btnTenants.trim(),
          iam: btnIam.trim(),
          catalogs: btnCatalogs.trim()
        };
      })()`,
      returnByValue: true
    });

    const t = titlesCheck?.result?.value;
    assert(t && t.dashboard.includes('Tổng Quan') && !t.dashboard.includes('1.'), `Runner: Tổng Quan (got "${t?.dashboard}")`);
    assert(t && t.activities.includes('Nhật Ký & Bài Chạy'), `Runner: Nhật Ký & Bài Chạy (got "${t?.activities}")`);
    assert(t && t.arena.includes('Bảng Xếp Hạng'), `Runner: Bảng Xếp Hạng (got "${t?.arena}")`);
    assert(t && t.devices.includes('Kết Nối Thiết Bị'), `Runner: Kết Nối Thiết Bị (got "${t?.devices}")`);
    assert(t && t.finance.includes('Quỹ & Sổ Nợ'), `Runner: Quỹ & Sổ Nợ (got "${t?.finance}")`);

    assert(t && t.club.includes('Câu Lạc Bộ'), `Club Space: Câu Lạc Bộ (got "${t?.club}")`);
    assert(t && t.teams.includes('Đội Của Tôi'), `Club Space: Đội Của Tôi (got "${t?.teams}")`);
    assert(t && t.social.includes('Bảng Tin & Kudos'), `Club Space: Bảng Tin & Kudos (got "${t?.social}")`);
    assert(t && t.chat.includes('Trợ Lý AI'), `Club Space: Trợ Lý AI (got "${t?.chat}")`);
    assert(t && t.governance.includes('Hoạt Động & Biểu Quyết'), `Club Space: Hoạt Động & Biểu Quyết (got "${t?.governance}")`);

    assert(t && t.members.includes('Thành Viên'), `Club Admin: Thành Viên (got "${t?.members}")`);
    assert(t && t.rules.includes('Thiết Lập Giải'), `Club Admin: Thiết Lập Giải (got "${t?.rules}")`);
    assert(t && t.adminBatch.includes('Kiểm Duyệt Bài'), `Club Admin: Kiểm Duyệt Bài (got "${t?.adminBatch}")`);
    assert(t && t.adminFinance.includes('Tài Chính & Quỹ'), `Club Admin: Tài Chính & Quỹ (got "${t?.adminFinance}")`);
    assert(t && t.adminBroadcast.includes('Truyền Thông & Chốt Tuần'), `Club Admin: Truyền Thông & Chốt Tuần (got "${t?.adminBroadcast}")`);

    assert(t && t.admin.includes('Giám Sát Hệ Thống'), `Super Admin: Giám Sát Hệ Thống (got "${t?.admin}")`);
    assert(t && t.tenants.includes('Quản Lý Tenant'), `Super Admin: Quản Lý Tenant (got "${t?.tenants}")`);
    assert(t && t.iam.includes('Phân Quyền (RBAC)'), `Super Admin: Phân Quyền (RBAC) (got "${t?.iam}")`);
    assert(t && t.catalogs.includes('Tham Số Hệ Thống'), `Super Admin: Tham Số Hệ Thống (got "${t?.catalogs}")`);

    // Screenshot 1: Concise Menu
    const shot1 = await sendCmd('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'screenshot_saas_v3_concise_menu.png'), Buffer.from(shot1.data, 'base64'));
    console.log('  📸 Screenshot saved: screenshot_saas_v3_concise_menu.png');

    // 2. Test Context Switcher Multi-Persona Switching
    console.log('\n  --- Testing Header Context Switcher ---');
    await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        const btn = document.getElementById('mantis-role-context-switcher-btn') || document.getElementById('role-context-switcher-btn');
        if (btn) btn.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 200));

    const dropdownCheck = await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        const menu = document.getElementById('mantis-role-dropdown-menu') || document.getElementById('role-dropdown-menu');
        return menu && !menu.classList.contains('hidden');
      })()`,
      returnByValue: true
    });
    assert(dropdownCheck?.result?.value === true, 'Context Switcher dropdown menu opens on click');

    // Switch to Runner
    await sendCmd('Runtime.evaluate', { expression: `switchRolePortal('runner')` });
    await new Promise(r => setTimeout(r, 200));

    const runnerOnlyCheck = await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        const gRunner = document.getElementById('mantis-group-runner') || document.getElementById('group-sidebar-runner');
        const gClub = document.getElementById('mantis-group-club') || document.getElementById('group-sidebar-club');
        const gCaptain = document.getElementById('mantis-group-captain') || document.getElementById('group-sidebar-captain');
        const gAdmin = document.getElementById('mantis-group-admin') || document.getElementById('group-sidebar-admin');
        return {
          runnerVisible: gRunner && !gRunner.classList.contains('hidden'),
          othersHidden: gClub?.classList.contains('hidden') && gCaptain?.classList.contains('hidden') && gAdmin?.classList.contains('hidden')
        };
      })()`,
      returnByValue: true
    });
    assert(runnerOnlyCheck?.result?.value?.runnerVisible && runnerOnlyCheck?.result?.value?.othersHidden, 'Context Switcher filters dynamic sidebar to Runner Portal only');

    // Screenshot 2: Context Switcher
    const shot2 = await sendCmd('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'screenshot_saas_v3_context_switcher.png'), Buffer.from(shot2.data, 'base64'));
    console.log('  📸 Screenshot saved: screenshot_saas_v3_context_switcher.png');

    // Switch back to All
    await sendCmd('Runtime.evaluate', { expression: `switchRolePortal('all')` });
    await new Promise(r => setTimeout(r, 200));

    // 3. Test Mobile Sticky Bottom Action Bar
    console.log('\n  --- Testing Mobile Sticky Bottom Action Bar ---');
    const bottomBarCheck = await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        const bar = document.getElementById('mobile-bottom-bar');
        if (!bar) return false;
        const buttons = bar.querySelectorAll('button');
        const labels = Array.from(buttons).map(b => b.textContent.trim());
        return {
          exists: true,
          count: buttons.length,
          hasSync: labels.some(l => l.includes('Đồng Bộ')),
          hasSubmit: labels.some(l => l.includes('Nộp Bài')),
          hasQr: labels.some(l => l.includes('Sổ Nợ QR')),
          hasPacer: labels.some(l => l.includes('PacerBot'))
        };
      })()`,
      returnByValue: true
    });
    const bBC = bottomBarCheck?.result?.value;
    assert(bBC && bBC.exists, 'Mobile bottom bar (#mobile-bottom-bar) is present');
    assert(bBC && bBC.hasSync && bBC.hasSubmit && bBC.hasQr && bBC.hasPacer, 'Mobile bottom bar contains 1-touch actions: Đồng Bộ, Nộp Bài, Sổ Nợ QR, PacerBot');

    // 4. Test Optimistic Activity Submission
    console.log('\n  --- Testing Optimistic Activity Submission ---');
    await sendCmd('Runtime.evaluate', { expression: `openAddActivityModal()` });
    await new Promise(r => setTimeout(r, 200));

    const modalCheck = await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        const m = document.getElementById('modal-add-activity');
        return m && !m.classList.contains('hidden');
      })()`,
      returnByValue: true
    });
    assert(modalCheck?.result?.value === true, 'Modal + Nộp Bài Chạy opens smoothly (#modal-add-activity)');

    // Screenshot 3: Modal Add Activity
    const shot3 = await sendCmd('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'screenshot_saas_v3_add_activity_modal.png'), Buffer.from(shot3.data, 'base64'));
    console.log('  📸 Screenshot saved: screenshot_saas_v3_add_activity_modal.png');

    // Trigger submitOptimisticActivity
    const beforeKmCheck = await sendCmd('Runtime.evaluate', {
      expression: `parseFloat(document.getElementById('hero-completed-km')?.textContent || '18.5')`,
      returnByValue: true
    });
    const beforeKm = beforeKmCheck?.result?.value || 18.5;

    await sendCmd('Runtime.evaluate', { expression: `submitOptimisticActivity()` });
    await new Promise(r => setTimeout(r, 100));

    const afterKmCheck = await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        const m = document.getElementById('modal-add-activity');
        const km = parseFloat(document.getElementById('hero-completed-km')?.textContent || '0');
        const toast = document.getElementById('toast-banner')?.textContent || '';
        return {
          modalHidden: m && m.classList.contains('hidden'),
          km,
          toast
        };
      })()`,
      returnByValue: true
    });
    const aKC = afterKmCheck?.result?.value;
    assert(aKC && aKC.modalHidden, 'Modal closes instantly upon optimistic submission');
    assert(aKC && aKC.km > beforeKm, `Runner distance incremented optimistically on UI (from ${beforeKm} to ${aKC?.km} km)`);

    // Screenshot 4: Optimistic Submit Result
    await new Promise(r => setTimeout(r, 400));
    const shot4 = await sendCmd('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'screenshot_saas_v3_optimistic_submit.png'), Buffer.from(shot4.data, 'base64'));
    console.log('  📸 Screenshot saved: screenshot_saas_v3_optimistic_submit.png');

    // 5. Test Mantis Material UI Theme Parity
    console.log('\n  --- Testing Mantis Material UI Theme Parity ---');
    await sendCmd('Runtime.evaluate', { expression: `setAppTheme('mantis')` });
    await new Promise(r => setTimeout(r, 300));

    const mantisNavCheck = await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        const d = document.getElementById('mantis-nav-dashboard')?.textContent || '';
        const a = document.getElementById('mantis-nav-arena')?.textContent || '';
        const b = document.getElementById('mantis-nav-club-admin')?.textContent || '';
        const s = document.getElementById('mantis-nav-admin')?.textContent || '';
        return {
          dashboard: d.trim(),
          arena: a.trim(),
          clubAdmin: b.trim(),
          admin: s.trim()
        };
      })()`,
      returnByValue: true
    });
    const mNC = mantisNavCheck?.result?.value;
    assert(mNC && mNC.dashboard.includes('Tổng Quan') && !mNC.dashboard.includes('1.'), `Mantis: Tổng Quan (got "${mNC?.dashboard}")`);
    assert(mNC && mNC.arena.includes('Bảng Xếp Hạng'), `Mantis: Bảng Xếp Hạng (got "${mNC?.arena}")`);
    assert(mNC && mNC.clubAdmin.includes('Kiểm Duyệt Bài'), `Mantis: Kiểm Duyệt Bài (got "${mNC?.clubAdmin}")`);
    assert(mNC && mNC.admin.includes('Giám Sát Hệ Thống'), `Mantis: Giám Sát Hệ Thống (got "${mNC?.admin}")`);

    // Screenshot 5: Mantis Theme Parity
    const shot5 = await sendCmd('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'screenshot_saas_v3_mantis_parity.png'), Buffer.from(shot5.data, 'base64'));
    console.log('  📸 Screenshot saved: screenshot_saas_v3_mantis_parity.png');

    // 6. Test Refined Global Race Selector Bar with Top-Level Title Row (AC-RACE-BAR-TOP-01)
    console.log('\n  --- Testing Top-Level Title Race Selector Bar (AC-RACE-BAR-TOP-01) ---');
    await sendCmd('Runtime.evaluate', { expression: `switchTab('arena')` });
    await new Promise(r => setTimeout(r, 400));

    const raceBarCheck = await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        const bar = document.getElementById('global-race-selector-bar');
        const isMantisCard = bar?.classList.contains('mantis-card') && bar?.classList.contains('bg-white');
        const title = bar?.querySelector('h2')?.textContent || '';
        const subtitle = bar?.querySelector('p')?.textContent || '';
        const select = document.getElementById('global-race-select-dropdown');
        const hasAntBorder = select?.classList.contains('border-[#D9D9D9]');
        const sseTicker = document.getElementById('race-live-sse-ticker');
        const ssePillGreen = sseTicker?.classList.contains('bg-[#F6FFED]');
        const exportBtn = document.getElementById('btn-export-race-report');
        const exportBtnBlue = exportBtn?.classList.contains('bg-[#1890FF]');
        const stripKm = document.getElementById('race-strip-km');
        const hasTopTierDivider = !!bar?.querySelector('.border-b');
        return {
          isMantisCard,
          title: title.trim(),
          subtitle: subtitle.trim(),
          hasAntBorder,
          ssePillGreen,
          exportBtnBlue,
          hasTopTierDivider,
          stripKmText: stripKm?.textContent?.trim() || ''
        };
      })()`,
      returnByValue: true
    });
    const rBC = raceBarCheck?.result?.value;
    assert(rBC && rBC.isMantisCard, 'Global Race Selector Bar has mantis-card bg-white styling');
    assert(rBC && rBC.title.includes('Bảng Điều Khiển Giải Đấu'), `Race Bar title is "Bảng Điều Khiển Giải Đấu" on top row (got "${rBC?.title}")`);
    assert(rBC && rBC.hasTopTierDivider, 'Top title row has border-b divider separating it from controls');
    assert(rBC && rBC.subtitle.includes('Tự động đồng bộ dữ liệu 4 khu vực thông tin'), 'Race Bar subtitle is clean and positioned below title');
    assert(rBC && rBC.hasAntBorder, 'Race Select dropdown has Ant Design border styling');
    assert(rBC && rBC.ssePillGreen, 'SSE Live ticker has harmonious green badge styling');
    assert(rBC && rBC.exportBtnBlue, 'Export button has Mantis primary blue styling');
    assert(rBC && rBC.stripKmText.includes('KM'), `Progress strip displays distance: ${rBC?.stripKmText}`);

    // Screenshot 6: Top-Level Title Race Selector Bar
    const shot6 = await sendCmd('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'screenshot_race_selector_top_title.png'), Buffer.from(shot6.data, 'base64'));
    console.log('  📸 Screenshot saved: screenshot_race_selector_top_title.png');

    // --- Verify AC-PLATFORM-CONFIG-01 to 04: Dynamic Platform Branding & Configuration ---
    console.log('\n  --- Testing Dynamic Platform Branding & Platform Config (AC-PLATFORM-CONFIG-01..04) ---');

    // 1. Verify sidebar header displays dynamic app name (not Mantis)
    const brandHeaderCheck = await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        const appNameEl = document.getElementById('platform-app-name-display');
        const tagEl = document.getElementById('platform-app-tag-display');
        const verEl = document.getElementById('platform-app-version-display');
        const brandArea = document.querySelector('#mantis-sidebar .h-16');
        const hasMantisText = brandArea ? brandArea.textContent.includes('Mantis') : false;
        return {
          appName: appNameEl?.textContent?.trim() || '',
          brandTag: tagEl?.textContent?.trim() || '',
          version: verEl?.textContent?.trim() || '',
          hasMantisText
        };
      })()`,
      returnByValue: true
    });
    const bHC = brandHeaderCheck?.result?.value;
    assert(bHC && !bHC.hasMantisText, 'Hardcoded word "Mantis" is eliminated from top-left sidebar brand logo');
    assert(bHC && bHC.appName === 'OpenRace', `Sidebar brand displays dynamic App Name "OpenRace" (got "${bHC?.appName}")`);
    assert(bHC && bHC.brandTag === 'SAAS', `Sidebar brand displays Tag "SAAS" (got "${bHC?.brandTag}")`);
    assert(bHC && bHC.version.includes('v3.2.0'), `Sidebar brand displays version v3.2.0 (got "${bHC?.version}")`);

    // 2. Navigate to System Admin -> Cấu Hình Nền Tảng (Platform Configuration)
    await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        switchTab('system-admin');
        showSystemAdminTab('platform');
        const view = document.getElementById('view-system-platform');
        if (view) view.scrollIntoView({ behavior: 'instant', block: 'start' });
      })()`
    });
    await new Promise(r => setTimeout(r, 1000));

    // 3. Verify Platform Config Form & 4 Categorized Groups
    const configFormCheck = await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        const view = document.getElementById('view-system-platform');
        const isVisible = view && !view.classList.contains('hidden');
        const appNameVal = document.getElementById('cfg-app-name')?.value || '';
        const tagVal = document.getElementById('cfg-brand-tag')?.value || '';
        const defaultTheme = document.getElementById('cfg-default-theme')?.value || '';
        const colorMode = document.getElementById('cfg-color-mode')?.value || '';
        const language = document.getElementById('cfg-language')?.value || '';
        const timezone = document.getElementById('cfg-timezone')?.value || '';
        const supportEmail = document.getElementById('cfg-support-email')?.value || '';
        const hotline = document.getElementById('cfg-hotline')?.value || '';
        const stravaSync = document.getElementById('cfg-strava-sync')?.checked;
        const wearablesApi = document.getElementById('cfg-wearables-api')?.checked;
        const vietqrReconcile = document.getElementById('cfg-vietqr-reconcile')?.checked;
        const customParamsList = document.getElementById('platform-custom-params-list')?.innerHTML || '';
        return {
          isVisible,
          appNameVal,
          tagVal,
          defaultTheme,
          colorMode,
          language,
          timezone,
          supportEmail,
          hotline,
          stravaSync,
          wearablesApi,
          vietqrReconcile,
          hasCustomParams: customParamsList.includes('PLATFORM_MULTI_TENANCY')
        };
      })()`,
      returnByValue: true
    });
    const cFC = configFormCheck?.result?.value;
    assert(cFC && cFC.isVisible, 'Platform Configuration view (#view-system-platform) is open and visible');
    assert(cFC && cFC.appNameVal === 'OpenRace', `Group 1 Brand input loads appName "OpenRace" (got "${cFC?.appNameVal}")`);
    assert(cFC && cFC.defaultTheme === 'mantis', `Group 2 Regional input loads defaultTheme "mantis" (got "${cFC?.defaultTheme}")`);
    assert(cFC && cFC.supportEmail.includes('@'), `Group 3 Legal/Support input loads email: ${cFC?.supportEmail}`);
    assert(cFC && cFC.stravaSync === true, 'Group 4 Integration Strava Webhook toggle is enabled');
    assert(cFC && cFC.vietqrReconcile === true, 'Group 4 Dynamic VietQR Auto-Reconciliation toggle is enabled');
    assert(cFC && cFC.hasCustomParams, 'Group 5 Custom parameters list rendered with non-destructive deactivation mechanism');

    // Screenshot 7: Platform Configuration View
    const shot7 = await sendCmd('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'screenshot_platform_configuration_view.png'), Buffer.from(shot7.data, 'base64'));
    console.log('  📸 Screenshot saved: screenshot_platform_configuration_view.png');

    // 4. Test Real-Time Client Reflection: Update App Name to "SuperSport SaaS"
    await sendCmd('Runtime.evaluate', {
      expression: `(async () => {
        const input = document.getElementById('cfg-app-name');
        if (input) input.value = 'SuperSport SaaS';
        const tagInput = document.getElementById('cfg-brand-tag');
        if (tagInput) tagInput.value = 'PRO';
        await savePlatformConfigForm();
        window.scrollTo(0, 0);
      })()`,
      awaitPromise: true
    });
    await new Promise(r => setTimeout(r, 800));

    const rebrandedCheck = await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        const appNameEl = document.getElementById('platform-app-name-display');
        const tagEl = document.getElementById('platform-app-tag-display');
        const docTitle = document.title;
        return {
          appName: appNameEl?.textContent?.trim() || '',
          brandTag: tagEl?.textContent?.trim() || '',
          docTitle
        };
      })()`,
      returnByValue: true
    });
    const rC = rebrandedCheck?.result?.value;
    assert(rC && rC.appName === 'SuperSport SaaS', `Sidebar brand dynamically reflects updated App Name "SuperSport SaaS" (got "${rC?.appName}") without page reload`);
    assert(rC && rC.brandTag === 'PRO', `Sidebar brand dynamically reflects updated Tag "PRO" (got "${rC?.brandTag}")`);
    assert(rC && rC.docTitle.includes('SuperSport SaaS'), `Browser document.title dynamically updated: "${rC?.docTitle}"`);

    // Screenshot 8: Dynamic Rebranding in Real-Time
    const shot8 = await sendCmd('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'screenshot_platform_dynamic_branding.png'), Buffer.from(shot8.data, 'base64'));
    console.log('  📸 Screenshot saved: screenshot_platform_dynamic_branding.png');

    // Reset back to OpenRace defaults
    await sendCmd('Runtime.evaluate', {
      expression: `(async () => {
        const input = document.getElementById('cfg-app-name');
        if (input) input.value = 'OpenRace';
        const tagInput = document.getElementById('cfg-brand-tag');
        if (tagInput) tagInput.value = 'SAAS';
        await savePlatformConfigForm();
      })()`,
      awaitPromise: true
    });
    await new Promise(r => setTimeout(r, 400));

    ws.close();
  } catch (err) {
    assert(false, `Headless Chrome E2E error: ${err.message}`);
  } finally {
    try {
      chromeProc.kill('SIGKILL');
    } catch (e) {}
  }
}

async function runAll() {
  console.log('######################################################');
  console.log('### OPENRACE SAAS V3.0.0-PROD FULL E2E AUTOMATION  ###');
  console.log('######################################################');

  await testSaasV3RestApis();
  await testHeadlessChromeUI();

  console.log('\n======================================================');
  console.log('>>> FINAL TEST RESULTS');
  console.log('======================================================');
  console.log(`Total Assertions: ${totalTests}`);
  console.log(`Passed:           ${passedTests}`);
  console.log(`Failed:           ${failedTests}`);

  if (failedTests === 0) {
    console.log('\n[✓] 100% E2E VERIFICATION PASSED FOR OPENRACE SAAS V3.0.0-PROD!\n');
    process.exit(0);
  } else {
    console.error('\n[✕] E2E VERIFICATION FAILED\n');
    process.exit(1);
  }
}

runAll();
