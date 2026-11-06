/**
 * System Administration (IAM, RBAC & Config Catalogs) E2E Test Suite
 * Tests live REST APIs on port 3001 and UI on port 3000 via Headless Chrome CDP
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

async function testSystemAdminRestApis() {
  console.log('\n======================================================');
  console.log('>>> [1/2] TESTING LIVE SYSTEM ADMIN REST APIS (PORT 3001)');
  console.log('======================================================\n');

  // 1. GET /api/admin/system/users
  let users = [];
  try {
    const res = await fetch(`${API_BASE}/api/admin/system/users`);
    users = await res.json();
    assert(res.status === 200, 'GET /api/admin/system/users returns HTTP 200');
    assert(Array.isArray(users) && users.length >= 8, `Users list returned ${users.length} seeded users`);
    const superAdmin = users.find(u => u.username === 'nguyenvana');
    assert(superAdmin !== undefined && superAdmin.status === 'ACTIVE', 'Nguyen Van A exists with status ACTIVE');
  } catch (err) {
    assert(false, `GET /api/admin/system/users error: ${err.message}`);
  }

  // 2. POST /api/admin/system/users (Create User)
  let createdUser;
  try {
    const res = await fetch(`${API_BASE}/api/admin/system/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'runner_e2e_test',
        fullName: 'Lê Văn E2E',
        email: 'e2e@openrace.vn',
        phone: '0987654321',
        roleId: 'role-runner-athlete',
        roleName: 'Vận Động Viên (Runner)',
        clubName: 'SARC',
        teamName: 'Team Phoenix SARC'
      })
    });
    createdUser = await res.json();
    assert(res.status === 201, 'POST /api/admin/system/users returns HTTP 201 Created');
    assert(createdUser.username === 'runner_e2e_test', 'Created user has correct username');
    assert(createdUser.status === 'ACTIVE', 'Created user has status ACTIVE');
  } catch (err) {
    assert(false, `POST /api/admin/system/users error: ${err.message}`);
  }

  // 3. PUT /api/admin/system/users/:id (Update User)
  try {
    const res = await fetch(`${API_BASE}/api/admin/system/users/${createdUser.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Lê Văn E2E Đã Sửa',
        phone: '0999888777'
      })
    });
    const updated = await res.json();
    assert(res.status === 200, 'PUT /api/admin/system/users/:id returns HTTP 200');
    assert(updated.fullName === 'Lê Văn E2E Đã Sửa', 'User fullName updated successfully');
  } catch (err) {
    assert(false, `PUT /api/admin/system/users/:id error: ${err.message}`);
  }

  // 4. POST /api/admin/system/users/:id/toggle-status (Soft Deactivate - NON DESTRUCTIVE)
  try {
    const res = await fetch(`${API_BASE}/api/admin/system/users/${createdUser.id}/toggle-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'E2E soft deactivation test' })
    });
    const toggled = await res.json();
    assert(res.status === 200, 'POST /api/admin/system/users/:id/toggle-status returns HTTP 200');
    assert(toggled.status === 'DEACTIVATED', 'User status toggled to DEACTIVATED');

    // Verify record still exists in list (Soft delete: no data lost!)
    const listRes = await fetch(`${API_BASE}/api/admin/system/users`);
    const allUsers = await listRes.json();
    const stillExists = allUsers.find(u => u.id === createdUser.id);
    assert(stillExists !== undefined, 'User record is NOT deleted from database (Data preserved)');
    assert(stillExists.status === 'DEACTIVATED', 'User persists with DEACTIVATED status');
  } catch (err) {
    assert(false, `toggle-status error: ${err.message}`);
  }

  // 5. GET /api/admin/system/roles
  let roles = [];
  try {
    const res = await fetch(`${API_BASE}/api/admin/system/roles`);
    roles = await res.json();
    assert(res.status === 200, 'GET /api/admin/system/roles returns HTTP 200');
    assert(Array.isArray(roles) && roles.length >= 6, `Roles list contains ${roles.length} roles`);
    assert(roles.some(r => r.code === 'SUPER_ADMIN'), 'Role SUPER_ADMIN exists');
  } catch (err) {
    assert(false, `GET /api/admin/system/roles error: ${err.message}`);
  }

  // 6. POST /api/admin/system/roles (Create Role)
  let createdRole;
  try {
    const res = await fetch(`${API_BASE}/api/admin/system/roles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'E2E_INSPECTOR',
        name: 'Giám Sát Viên E2E',
        description: 'Vai trò thử nghiệm kiểm thử hệ thống',
        permissions: ['activities.view', 'telemetry.view']
      })
    });
    createdRole = await res.json();
    assert(res.status === 201, 'POST /api/admin/system/roles returns HTTP 201');
    assert(createdRole.code === 'E2E_INSPECTOR', 'Role code correctly created');
  } catch (err) {
    assert(false, `POST /api/admin/system/roles error: ${err.message}`);
  }

  // 7. GET /api/admin/system/catalogs (4 Major Sets)
  let catalogs = [];
  try {
    const res = await fetch(`${API_BASE}/api/admin/system/catalogs`);
    catalogs = await res.json();
    assert(res.status === 200, 'GET /api/admin/system/catalogs returns HTTP 200');
    assert(catalogs.length === 4, `System has exactly 4 master setup catalogs`);
    assert(catalogs.some(c => c.code === 'CATALOG_PACE_RULES'), 'Bộ 1: CATALOG_PACE_RULES exists');
    assert(catalogs.some(c => c.code === 'CATALOG_FINANCE_GATEWAY'), 'Bộ 2: CATALOG_FINANCE_GATEWAY exists');
    assert(catalogs.some(c => c.code === 'CATALOG_WEARABLES_INTEGRATION'), 'Bộ 3: CATALOG_WEARABLES_INTEGRATION exists');
    assert(catalogs.some(c => c.code === 'CATALOG_RACE_LIFECYCLE'), 'Bộ 4: CATALOG_RACE_LIFECYCLE exists');
  } catch (err) {
    assert(false, `GET /api/admin/system/catalogs error: ${err.message}`);
  }

  // 8. GET /api/admin/system/configs
  let configs = [];
  try {
    const res = await fetch(`${API_BASE}/api/admin/system/configs`);
    configs = await res.json();
    assert(res.status === 200, 'GET /api/admin/system/configs returns HTTP 200');
    assert(configs.length >= 24, `System configs returned ${configs.length} parameters`);
    const vietQrBin = configs.find(c => c.key === 'VIETQR_BANK_BIN');
    assert(vietQrBin !== undefined && vietQrBin.value === '970422', 'VietQR BIN parameter is 970422');
  } catch (err) {
    assert(false, `GET /api/admin/system/configs error: ${err.message}`);
  }

  // 9. POST /api/admin/system/configs (Create Config Parameter)
  let createdConfig;
  try {
    const res = await fetch(`${API_BASE}/api/admin/system/configs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        catalogCode: 'CATALOG_PACE_RULES',
        key: 'E2E_TEST_PARAM',
        name: 'Thông số kiểm thử E2E',
        value: '99.9',
        unit: 'km',
        dataType: 'number',
        description: 'Thông số kiểm thử thêm và bỏ kích hoạt'
      })
    });
    createdConfig = await res.json();
    assert(res.status === 201, 'POST /api/admin/system/configs returns HTTP 201');
    assert(createdConfig.key === 'E2E_TEST_PARAM', 'Parameter key correctly created');
  } catch (err) {
    assert(false, `POST /api/admin/system/configs error: ${err.message}`);
  }

  // 10. POST /api/admin/system/configs/:id/toggle-status (Soft Deactivate Config)
  try {
    const res = await fetch(`${API_BASE}/api/admin/system/configs/${createdConfig.id}/toggle-status`, {
      method: 'POST'
    });
    const toggledCfg = await res.json();
    assert(res.status === 200, 'toggle-status config returns HTTP 200');
    assert(toggledCfg.status === 'DEACTIVATED', 'Config parameter toggled to DEACTIVATED (soft delete)');

    // Parameter still exists in catalog
    const allCfgRes = await fetch(`${API_BASE}/api/admin/system/configs`);
    const allCfgs = await allCfgRes.json();
    const foundCfg = allCfgs.find(c => c.id === createdConfig.id);
    assert(foundCfg !== undefined && foundCfg.status === 'DEACTIVATED', 'Config is preserved without deleting database record');
  } catch (err) {
    assert(false, `toggle-status config error: ${err.message}`);
  }
}

async function testHeadlessChromeUI() {
  console.log('\n======================================================');
  console.log('>>> [2/2] TESTING FRONTEND VIA HEADLESS CHROME CDP (PORT 3000)');
  console.log('======================================================\n');

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const cdpPort = 9334;

  const chromeProc = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${cdpPort}`,
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1440,900',
    `${FRONTEND_BASE}`
  ]);

  try {
    // Wait for Chrome CDP to be available
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
    const wsUrl = pageTarget.webSocketDebuggerUrl;

    const ws = new globalThis.WebSocket(wsUrl);

    let msgId = 1;
    const pending = new Map();

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.id && pending.has(msg.id)) {
          const { resolve, reject } = pending.get(msg.id);
          pending.delete(msg.id);
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        }
      } catch (err) {}
    };

    await new Promise((resolve) => {
      ws.onopen = resolve;
    });

    function sendCmd(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = msgId++;
        pending.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await sendCmd('Page.enable');
    await sendCmd('Runtime.enable');

    // Wait until document.readyState === 'complete'
    for (let i = 0; i < 30; i++) {
      const readyState = await sendCmd('Runtime.evaluate', {
        expression: 'document.readyState',
        returnByValue: true
      });
      if (readyState?.result?.value === 'complete') break;
      await new Promise(r => setTimeout(r, 200));
    }

    // 1. Verify Mantis Sidebar has Quản trị hệ thống menu group without codes
    const mantisNavCheck = await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        const usersNav = document.getElementById('mantis-nav-system-admin-users');
        const rolesNav = document.getElementById('mantis-nav-system-admin-roles');
        const configsNav = document.getElementById('mantis-nav-system-admin-configs');
        return {
          usersNav: usersNav ? usersNav.textContent.trim() : null,
          rolesNav: rolesNav ? rolesNav.textContent.trim() : null,
          configsNav: configsNav ? configsNav.textContent.trim() : null,
        };
      })()`,
      returnByValue: true
    });

    const mNav = mantisNavCheck?.result?.value;
    assert(mNav && mNav.usersNav && mNav.usersNav.includes('Quản Lý Người Dùng'), 'Mantis sidebar has clean "Quản Lý Người Dùng" menu item');
    assert(mNav && mNav.rolesNav && mNav.rolesNav.includes('Phân Quyền Người Dùng'), 'Mantis sidebar has clean "Phân Quyền Người Dùng" menu item');
    assert(mNav && mNav.configsNav && mNav.configsNav.includes('Danh Mục Thiết Lập'), 'Mantis sidebar has clean "Danh Mục Thiết Lập" menu item');
    assert(!mNav.usersNav.includes('['), 'Mantis menu label has NO code prefix brackets');

    // 2. Switch to system-admin tab and verify users view
    await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        setAppTheme('mantis');
        switchTab('system-admin');
        showSystemAdminTab('users');
      })()`
    });

    // Wait for async loadSystemAdminData()
    await new Promise(r => setTimeout(r, 800));

    const usersViewCheck = await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        const tab = document.getElementById('tab-system-admin');
        const isActive = tab ? tab.classList.contains('active') : false;
        const rows = document.querySelectorAll('#sys-users-tbody tr').length;
        const totalBadge = document.getElementById('stat-total-users')?.textContent;
        return { isActive, rows, totalBadge };
      })()`,
      returnByValue: true
    });

    const uView = usersViewCheck?.result?.value;
    assert(uView && uView.isActive === true, '#tab-system-admin is actively displayed');
    assert(uView && uView.rows >= 8, `System Users table rendered ${uView.rows} user rows`);

    // Capture Mantis System Admin Users screenshot
    const shot1 = await sendCmd('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'screenshot_mantis_system_admin_users.png'), Buffer.from(shot1.data, 'base64'));
    console.log('  📸 Captured screenshot_mantis_system_admin_users.png');

    // 3. Switch to Roles & RBAC sub-tab
    await sendCmd('Runtime.evaluate', {
      expression: `showSystemAdminTab('roles')`
    });
    await new Promise(r => setTimeout(r, 400));

    const rolesViewCheck = await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        const cards = document.querySelectorAll('#sys-roles-grid > div').length;
        return { cards };
      })()`,
      returnByValue: true
    });

    const rView = rolesViewCheck?.result?.value;
    assert(rView && rView.cards >= 6, `Roles grid rendered ${rView.cards} RBAC role cards`);

    // Capture Mantis System Admin Roles screenshot
    const shot2 = await sendCmd('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'screenshot_mantis_system_admin_roles.png'), Buffer.from(shot2.data, 'base64'));
    console.log('  📸 Captured screenshot_mantis_system_admin_roles.png');

    // 4. Switch to Config Catalogs sub-tab
    await sendCmd('Runtime.evaluate', {
      expression: `showSystemAdminTab('configs')`
    });
    await new Promise(r => setTimeout(r, 400));

    const configsViewCheck = await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        const activeCat = document.getElementById('active-catalog-code')?.textContent;
        const rows = document.querySelectorAll('#sys-configs-tbody tr').length;
        return { activeCat, rows };
      })()`,
      returnByValue: true
    });

    const cView = configsViewCheck?.result?.value;
    assert(cView && cView.activeCat === 'CATALOG_PACE_RULES', 'Active catalog is CATALOG_PACE_RULES');
    assert(cView && cView.rows >= 7, `Configs table rendered ${cView.rows} parameters for Bộ 1`);

    // Capture Mantis System Admin Catalogs screenshot
    const shot3 = await sendCmd('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'screenshot_mantis_system_admin_catalogs.png'), Buffer.from(shot3.data, 'base64'));
    console.log('  📸 Captured screenshot_mantis_system_admin_catalogs.png');

    // 5. Test switching to Sport theme and verify Sport Cam left navigation
    await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        setAppTheme('sport');
        switchTab('system-admin');
      })()`
    });
    await new Promise(r => setTimeout(r, 400));

    const sportNavCheck = await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        const railBtn = document.getElementById('rail-btn-system-admin');
        const sidebarBtn = document.getElementById('sidebar-system-admin');
        return {
          hasRailBtn: !!railBtn,
          hasSidebarBtn: !!sidebarBtn,
          sidebarTitle: sidebarBtn ? sidebarBtn.textContent.trim() : null
        };
      })()`,
      returnByValue: true
    });

    const sNav = sportNavCheck?.result?.value;
    assert(sNav && sNav.hasRailBtn === true, 'Sport slim-rail has System Admin button');
    assert(sNav && sNav.hasSidebarBtn === true, 'Sport off-canvas drawer has System Admin menu');

    // Capture Sport Theme System Admin screenshot
    const shot4 = await sendCmd('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'screenshot_sport_system_admin.png'), Buffer.from(shot4.data, 'base64'));
    console.log('  📸 Captured screenshot_sport_system_admin.png');

    ws.close();
  } catch (err) {
    assert(false, `Headless Chrome CDP error: ${err.message}`);
  } finally {
    try {
      chromeProc.kill('SIGKILL');
    } catch (e) {}
  }
}

async function runAll() {
  console.log('\n================================================================');
  console.log('OPENRACE SYSTEM ADMINISTRATION (IAM & CATALOGS) E2E VERIFICATION');
  console.log('================================================================');

  await testSystemAdminRestApis();
  await testHeadlessChromeUI();

  console.log('\n------------------------------------------------------');
  console.log(`E2E TEST SUMMARY: ${passedTests}/${totalTests} PASSED (${failedTests} FAILED)`);
  console.log('------------------------------------------------------\n');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    console.log('🎉 ALL SYSTEM ADMINISTRATION VERIFICATION TESTS PASSED 100%!\n');
    process.exit(0);
  }
}

runAll();
