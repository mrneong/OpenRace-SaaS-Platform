/**
 * Role-Based Navigation & Dynamic Sidebar E2E Automation Suite
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

async function testNavigationRestApis() {
  console.log('\n======================================================');
  console.log('>>> [1/2] TESTING LIVE NAVIGATION REST APIS (PORT 3001)');
  console.log('======================================================\n');

  // 1. GET /api/me/navigation-context
  try {
    const res = await fetch(`${API_BASE}/api/me/navigation-context`);
    const data = await res.json();

    assert(res.status === 200, 'GET /api/me/navigation-context returns HTTP 200');
    assert(data.userName === 'Nguyễn Văn A', `User name is ${data.userName}`);
    assert(data.availableRoles && data.availableRoles.length === 5, 'Available roles has 5 options');
    assert(data.totalMenuItems === 19, `Total standard menu items is 19 (got ${data.totalMenuItems})`);
    assert(data.groups && data.groups.length >= 1, 'Returns navigation groups');
  } catch (err) {
    assert(false, `GET /api/me/navigation-context error: ${err.message}`);
  }

  // 2. POST /api/me/active-role (runner)
  try {
    const res = await fetch(`${API_BASE}/api/me/active-role`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'user-01', role: 'runner' })
    });
    const result = await res.json();
    assert(res.status === 200, 'POST /api/me/active-role (runner) returns HTTP 200');
    assert(result.activeRole === 'runner', 'Active role set to runner');
    assert(result.groupCount === 1, 'Group count filtered to 1 (Runner Portal)');
  } catch (err) {
    assert(false, `POST /api/me/active-role (runner) error: ${err.message}`);
  }

  // 3. POST /api/me/active-role (captain)
  try {
    const res = await fetch(`${API_BASE}/api/me/active-role`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'user-01', role: 'captain' })
    });
    const result = await res.json();
    assert(res.status === 200, 'POST /api/me/active-role (captain) returns HTTP 200');
    assert(result.activeRole === 'captain', 'Active role set to captain');
    assert(result.groupCount === 1, 'Group count filtered to 1 (Club Admin Portal)');
  } catch (err) {
    assert(false, `POST /api/me/active-role (captain) error: ${err.message}`);
  }

  // 4. POST /api/me/active-role (admin)
  try {
    const res = await fetch(`${API_BASE}/api/me/active-role`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'user-01', role: 'admin' })
    });
    const result = await res.json();
    assert(res.status === 200, 'POST /api/me/active-role (admin) returns HTTP 200');
    assert(result.activeRole === 'admin', 'Active role set to admin');
    assert(result.groupCount === 1, 'Group count filtered to 1 (Super Admin Portal)');
  } catch (err) {
    assert(false, `POST /api/me/active-role (admin) error: ${err.message}`);
  }

  // 5. POST /api/me/active-role (all)
  try {
    const res = await fetch(`${API_BASE}/api/me/active-role`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'user-01', role: 'all' })
    });
    const result = await res.json();
    assert(res.status === 200, 'POST /api/me/active-role (all) returns HTTP 200');
    assert(result.activeRole === 'all', 'Active role set to all');
    assert(result.groupCount === 4, 'Group count reset to all 4 Portal Groups');
  } catch (err) {
    assert(false, `POST /api/me/active-role (all) error: ${err.message}`);
  }
}

async function testHeadlessChromeUI() {
  console.log('\n======================================================');
  console.log('>>> [2/2] TESTING FRONTEND VIA HEADLESS CHROME CDP (PORT 3000)');
  console.log('======================================================\n');

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const cdpPort = 9339;

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
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        }
      } catch (err) {}
    };

    await new Promise((resolve) => { ws.onopen = resolve; });

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

    await new Promise(r => setTimeout(r, 600));

    // 1. Verify Top Header Context Switcher in Sport Cam theme
    const headerCheck = await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        const btn = document.getElementById('role-context-switcher-btn');
        const icon = document.getElementById('role-switcher-icon')?.textContent;
        const label = document.getElementById('role-switcher-label')?.textContent;
        const menu = document.getElementById('role-dropdown-menu');
        const roleBtns = menu ? menu.querySelectorAll('.role-opt-btn').length : 0;
        return { hasBtn: !!btn, icon, label, hasMenu: !!menu, roleBtns };
      })()`,
      returnByValue: true
    });
    const hC = headerCheck?.result?.value;
    assert(hC && hC.hasBtn, 'Sport Cam Header has Context Switcher Button (#role-context-switcher-btn)');
    assert(hC && hC.roleBtns === 5, 'Context Switcher Dropdown provides 5 selectable roles');

    // 2. Verify all 4 Sport Cam Sidebar Groups exist
    const groupsCheck = await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        const gRunner = document.getElementById('group-sidebar-runner');
        const gClub = document.getElementById('group-sidebar-club');
        const gCaptain = document.getElementById('group-sidebar-captain');
        const gAdmin = document.getElementById('group-sidebar-admin');

        return {
          hasRunner: !!gRunner,
          hasClub: !!gClub,
          hasCaptain: !!gCaptain,
          hasAdmin: !!gAdmin
        };
      })()`,
      returnByValue: true
    });
    const gC = groupsCheck?.result?.value;
    assert(gC && gC.hasRunner, 'Sport Sidebar has Group I: Runner Portal (#group-sidebar-runner)');
    assert(gC && gC.hasClub, 'Sport Sidebar has Group II: Club & Team Space (#group-sidebar-club)');
    assert(gC && gC.hasCaptain, 'Sport Sidebar has Group III: Club Admin & Captain (#group-sidebar-captain)');
    assert(gC && gC.hasAdmin, 'Sport Sidebar has Group IV: Super Admin (#group-sidebar-admin)');

    // 3. Test Dynamic Sidebar Filtering: Switch to RUNNER
    await sendCmd('Runtime.evaluate', { expression: `switchRolePortal('runner')` });
    await new Promise(r => setTimeout(r, 300));

    const runnerFilterCheck = await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        const gRunner = document.getElementById('group-sidebar-runner');
        const gClub = document.getElementById('group-sidebar-club');
        const gCaptain = document.getElementById('group-sidebar-captain');
        const gAdmin = document.getElementById('group-sidebar-admin');
        const label = document.getElementById('role-switcher-label')?.textContent;

        return {
          runnerVisible: gRunner && !gRunner.classList.contains('hidden'),
          clubHidden: gClub && gClub.classList.contains('hidden'),
          captainHidden: gCaptain && gCaptain.classList.contains('hidden'),
          adminHidden: gAdmin && gAdmin.classList.contains('hidden'),
          label
        };
      })()`,
      returnByValue: true
    });
    const rFC = runnerFilterCheck?.result?.value;
    assert(rFC && rFC.runnerVisible && rFC.clubHidden && rFC.captainHidden && rFC.adminHidden, 'Dynamic Sidebar: "runner" role shows only Group I, hiding admin groups');
    assert(rFC && rFC.label.includes('Runner'), `Header displays active role: ${rFC?.label}`);

    // Capture Screenshot 1: Role Runner
    const shotRunner = await sendCmd('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'screenshot_nav_role_runner.png'), Buffer.from(shotRunner.data, 'base64'));
    console.log('  📸 Captured screenshot_nav_role_runner.png');

    // 4. Test Dynamic Sidebar Filtering: Switch to CLUB SPACE
    await sendCmd('Runtime.evaluate', { expression: `switchRolePortal('club')` });
    await new Promise(r => setTimeout(r, 300));

    const clubFilterCheck = await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        const gRunner = document.getElementById('group-sidebar-runner');
        const gClub = document.getElementById('group-sidebar-club');
        const gCaptain = document.getElementById('group-sidebar-captain');
        const gAdmin = document.getElementById('group-sidebar-admin');
        return {
          clubVisible: gClub && !gClub.classList.contains('hidden'),
          runnerHidden: gRunner && gRunner.classList.contains('hidden'),
          captainHidden: gCaptain && gCaptain.classList.contains('hidden'),
          adminHidden: gAdmin && gAdmin.classList.contains('hidden')
        };
      })()`,
      returnByValue: true
    });
    const cFC = clubFilterCheck?.result?.value;
    assert(cFC && cFC.clubVisible && cFC.runnerHidden && cFC.captainHidden && cFC.adminHidden, 'Dynamic Sidebar: "club" role shows only Group II (Club Space)');

    // Capture Screenshot 2: Role Club Space
    const shotClub = await sendCmd('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'screenshot_nav_role_club_space.png'), Buffer.from(shotClub.data, 'base64'));
    console.log('  📸 Captured screenshot_nav_role_club_space.png');

    // 5. Test Dynamic Sidebar Filtering: Switch to CLUB ADMIN & CAPTAIN
    await sendCmd('Runtime.evaluate', { expression: `switchRolePortal('captain')` });
    await new Promise(r => setTimeout(r, 300));

    const captainFilterCheck = await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        const gRunner = document.getElementById('group-sidebar-runner');
        const gCaptain = document.getElementById('group-sidebar-captain');
        const gAdmin = document.getElementById('group-sidebar-admin');
        return {
          captainVisible: gCaptain && !gCaptain.classList.contains('hidden'),
          runnerHidden: gRunner && gRunner.classList.contains('hidden'),
          adminHidden: gAdmin && gAdmin.classList.contains('hidden')
        };
      })()`,
      returnByValue: true
    });
    const cpFC = captainFilterCheck?.result?.value;
    assert(cpFC && cpFC.captainVisible && cpFC.runnerHidden && cpFC.adminHidden, 'Dynamic Sidebar: "captain" role shows only Group III (Club Admin & Captain)');

    // Capture Screenshot 3: Role Club Admin
    const shotCaptain = await sendCmd('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'screenshot_nav_role_club_admin.png'), Buffer.from(shotCaptain.data, 'base64'));
    console.log('  📸 Captured screenshot_nav_role_club_admin.png');

    // 6. Test Dynamic Sidebar Filtering: Switch to SUPER ADMIN
    await sendCmd('Runtime.evaluate', { expression: `switchRolePortal('admin')` });
    await new Promise(r => setTimeout(r, 300));

    const adminFilterCheck = await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        const gRunner = document.getElementById('group-sidebar-runner');
        const gCaptain = document.getElementById('group-sidebar-captain');
        const gAdmin = document.getElementById('group-sidebar-admin');
        return {
          adminVisible: gAdmin && !gAdmin.classList.contains('hidden'),
          runnerHidden: gRunner && gRunner.classList.contains('hidden'),
          captainHidden: gCaptain && gCaptain.classList.contains('hidden')
        };
      })()`,
      returnByValue: true
    });
    const aFC = adminFilterCheck?.result?.value;
    assert(aFC && aFC.adminVisible && aFC.runnerHidden && aFC.captainHidden, 'Dynamic Sidebar: "admin" role shows only Group IV (Super Admin)');

    // Capture Screenshot 4: Role Super Admin
    const shotAdmin = await sendCmd('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'screenshot_nav_role_super_admin.png'), Buffer.from(shotAdmin.data, 'base64'));
    console.log('  📸 Captured screenshot_nav_role_super_admin.png');

    // 7. Reset to ALL PORTALS
    await sendCmd('Runtime.evaluate', { expression: `switchRolePortal('all')` });
    await new Promise(r => setTimeout(r, 300));

    const allFilterCheck = await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        const gRunner = document.getElementById('group-sidebar-runner');
        const gClub = document.getElementById('group-sidebar-club');
        const gCaptain = document.getElementById('group-sidebar-captain');
        const gAdmin = document.getElementById('group-sidebar-admin');
        return {
          allVisible: (!gRunner.classList.contains('hidden') &&
                       !gClub.classList.contains('hidden') &&
                       !gCaptain.classList.contains('hidden') &&
                       !gAdmin.classList.contains('hidden'))
        };
      })()`,
      returnByValue: true
    });
    assert(allFilterCheck?.result?.value?.allVisible, 'Dynamic Sidebar: "all" role displays all 4 Portal Groups simultaneously');

    // 8. Test Mantis Material UI Parity
    await sendCmd('Runtime.evaluate', {
      expression: `setAppTheme('mantis')`
    });
    await new Promise(r => setTimeout(r, 500));

    const mantisNavCheck = await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        const btn = document.getElementById('mantis-role-context-switcher-btn');
        const gRunner = document.getElementById('mantis-group-runner');
        const gClub = document.getElementById('mantis-group-club');
        const gCaptain = document.getElementById('mantis-group-captain');
        const gAdmin = document.getElementById('mantis-group-admin');

        return {
          hasBtn: !!btn,
          hasRunner: !!gRunner,
          hasClub: !!gClub,
          hasCaptain: !!gCaptain,
          hasAdmin: !!gAdmin
        };
      })()`,
      returnByValue: true
    });
    const mNC = mantisNavCheck?.result?.value;
    assert(mNC && mNC.hasBtn, 'Mantis Material UI has Context Switcher Button (#mantis-role-context-switcher-btn)');
    assert(mNC && mNC.hasRunner && mNC.hasClub && mNC.hasCaptain && mNC.hasAdmin, 'Mantis Sidebar has all 4 Portal Groups synced');

    // Capture Screenshot 5: Mantis All Portals
    const shotMantisAll = await sendCmd('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'screenshot_nav_role_all_mantis.png'), Buffer.from(shotMantisAll.data, 'base64'));
    console.log('  📸 Captured screenshot_nav_role_all_mantis.png');

    // Switch back to Sport Cam theme
    await sendCmd('Runtime.evaluate', { expression: `setAppTheme('sport')` });
    await new Promise(r => setTimeout(r, 200));

    ws.close();
  } catch (err) {
    assert(false, `Headless Chrome E2E error: ${err.message}`);
  } finally {
    try { chromeProc.kill(); } catch (e) {}
  }
}

async function main() {
  console.log('Starting Role-Based Navigation & Dynamic Sidebar E2E Tests...');
  await testNavigationRestApis();
  await testHeadlessChromeUI();

  console.log('\n======================================================');
  console.log(`E2E TEST SUMMARY: ${passedTests}/${totalTests} PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
  if (failedTests > 0) {
    console.error(`FAILED TESTS: ${failedTests}`);
    process.exit(1);
  } else {
    console.log('ALL ROLE-BASED NAVIGATION E2E ACCEPTANCE CRITERIA VERIFIED SUCCESSFULLY!');
    process.exit(0);
  }
}

main();

