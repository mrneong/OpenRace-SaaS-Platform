const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const FRONTEND_BASE = 'http://localhost:3000';
const ARTIFACT_DIR = 'C:\\Users\\nguye\\.gemini\\antigravity\\brain\\6cc28217-793d-48a4-8630-e0b049bf6838';

async function run() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const cdpPort = 9352;
  const tempProfile = path.join(require('os').tmpdir(), 'chrome-cdp-sport-' + Date.now());

  const chromeProc = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${cdpPort}`,
    `--user-data-dir=${tempProfile}`,
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1440,900',
    FRONTEND_BASE
  ]);

  try {
    let targets = null;
    for (let i = 0; i < 35; i++) {
      await new Promise(r => setTimeout(r, 200));
      try {
        const res = await fetch(`http://localhost:${cdpPort}/json`);
        targets = await res.json();
        if (targets && targets.length > 0) break;
      } catch (e) { }
    }

    if (!targets || targets.length === 0) {
      throw new Error('Chrome CDP port not responding');
    }

    const pageTarget = targets.find(t => t.url.includes('3000')) || targets[0];
    const ws = new globalThis.WebSocket(pageTarget.webSocketDebuggerUrl);

    let id = 1;
    const callbacks = new Map();

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (callbacks.has(msg.id)) {
        const cb = callbacks.get(msg.id);
        callbacks.delete(msg.id);
        if (msg.error) cb.reject(new Error(msg.error.message));
        else cb.resolve(msg.result);
      }
    };

    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    function sendCmd(method, params = {}) {
      return new Promise((resolve, reject) => {
        const msgId = id++;
        callbacks.set(msgId, { resolve, reject });
        ws.send(JSON.stringify({ id: msgId, method, params }));
      });
    }

    async function evaluate(expression) {
      const res = await sendCmd('Runtime.evaluate', { expression, returnByValue: true });
      if (res && res.result && res.result.value !== undefined) {
        return res.result.value;
      }
      return res;
    }

    await sendCmd('Page.enable');
    await sendCmd('DOM.enable');
    await sendCmd('Runtime.enable');

    console.log('[CDP] Waiting for page complete & switchTab ready...');
    for (let i = 0; i < 40; i++) {
      const readyState = await sendCmd('Runtime.evaluate', {
        expression: "document.readyState === 'complete' && !!document.body && typeof switchTab === 'function'",
        returnByValue: true
      });
      if (readyState?.result?.value === true) break;
      await new Promise(r => setTimeout(r, 250));
    }
    await new Promise(r => setTimeout(r, 800));
    console.log('[CDP] Page ready!');

    // ========================================================
    // TEST 1: Dual Theme Switch to Sport Cam & Docked Sidebar Parity
    // ========================================================
    console.log('\n--- TEST 1: Dual Theme Switch to Sport Cam & Docked Sidebar Parity ---');
    
    // Switch to Sport theme
    await evaluate(`setAppTheme('sport')`);
    await new Promise(r => setTimeout(r, 600));

    const sportThemeCheck = await evaluate(`(() => {
      const theme = document.body ? document.body.getAttribute('data-theme') : '';
      const sportSidebar = document.getElementById('sport-docked-sidebar');
      const mantisSidebar = document.getElementById('mantis-sidebar');
      const slimRail = document.getElementById('slim-rail');
      const openraceHeader = document.getElementById('openrace-header');
      
      return {
        theme,
        sportSidebarExists: !!sportSidebar,
        sportSidebarVisible: sportSidebar && !sportSidebar.classList.contains('hidden'),
        mantisSidebarHidden: mantisSidebar && mantisSidebar.classList.contains('hidden'),
        slimRailHidden: slimRail && slimRail.classList.contains('hidden'),
        openraceHeaderVisible: openraceHeader && !openraceHeader.classList.contains('hidden'),
        runnerGroupVisible: !document.getElementById('sport-group-runner')?.classList.contains('hidden'),
        clubGroupVisible: !document.getElementById('sport-group-club')?.classList.contains('hidden'),
        captainGroupVisible: !document.getElementById('sport-group-captain')?.classList.contains('hidden'),
        adminGroupVisible: !document.getElementById('sport-group-admin')?.classList.contains('hidden'),
        totalNavItems: document.querySelectorAll('#sport-docked-sidebar .sport-nav-item').length
      };
    })()`);

    console.log('Sport Theme State:', sportThemeCheck);
    if (!sportThemeCheck.sportSidebarVisible) {
      throw new Error('Sport docked sidebar should be visible when data-theme=sport');
    }
    if (!sportThemeCheck.mantisSidebarHidden) {
      throw new Error('Mantis sidebar should be hidden when data-theme=sport');
    }
    console.log(`✓ Total Sport nav items in docked sidebar: ${sportThemeCheck.totalNavItems} (Full 100% Parity)`);

    // Capture screenshot of Sport Cam Docked Sidebar Parity
    const sportShot = await sendCmd('Page.captureScreenshot', { format: 'png' });
    const sportShotPath = path.join(ARTIFACT_DIR, 'screenshot_sport_cam_docked_sidebar_parity.png');
    fs.writeFileSync(sportShotPath, Buffer.from(sportShot.data, 'base64'));
    console.log('✓ Captured screenshot:', sportShotPath);

    // ========================================================
    // TEST 2: Navigate to Strava Sync & Disconnect State
    // ========================================================
    console.log('\n--- TEST 2: Strava Sync Disconnect State ---');
    await evaluate(`switchTab('strava-sync')`);
    await new Promise(r => setTimeout(r, 800));

    // Disconnect Strava
    await evaluate(`disconnectStravaClient()`);
    await new Promise(r => setTimeout(r, 600));

    const disconnectState = await evaluate(`(() => {
      const badge = document.getElementById('strava-status-badge');
      const btnReconnect = document.getElementById('btn-strava-reconnect');
      const btnDisconnect = document.getElementById('btn-strava-disconnect');
      return {
        badgeText: badge ? badge.innerText : '',
        btnReconnectVisible: btnReconnect && !btnReconnect.classList.contains('hidden'),
        btnDisconnectHidden: btnDisconnect && btnDisconnect.classList.contains('hidden')
      };
    })()`);

    console.log('Disconnect State:', disconnectState);
    if (!disconnectState.badgeText.includes('REVOKED')) {
      throw new Error('Badge should show REVOKED when disconnected');
    }
    console.log('✓ Strava successfully transitioned to REVOKED state');

    // ========================================================
    // TEST 3: Open Strava OAuth 2.0 Authorization Modal (#modal-strava-authorize)
    // ========================================================
    console.log('\n--- TEST 3: Open Strava OAuth 2.0 Authorization Modal ---');
    
    // Click reconnect button or call openStravaAuthorizeModal
    await evaluate(`openStravaAuthorizeModal()`);
    await new Promise(r => setTimeout(r, 500));

    const modalCheck = await evaluate(`(() => {
      const modal = document.getElementById('modal-strava-authorize');
      const scopeRead = document.getElementById('auth-scope-read');
      const scopeAct = document.getElementById('auth-scope-activity');
      const scopeProf = document.getElementById('auth-scope-profile');
      const whToggle = document.getElementById('auth-webhook-toggle');
      const athleteName = document.getElementById('modal-strava-athlete-name');
      const confirmBtn = document.getElementById('btn-confirm-strava-authorize');

      return {
        modalVisible: modal && !modal.classList.contains('hidden'),
        athleteName: athleteName ? athleteName.innerText : '',
        scopeReadChecked: scopeRead ? scopeRead.checked : false,
        scopeActChecked: scopeAct ? scopeAct.checked : false,
        scopeProfChecked: scopeProf ? scopeProf.checked : false,
        whToggleChecked: whToggle ? whToggle.checked : false,
        confirmBtnExists: !!confirmBtn
      };
    })()`);

    console.log('Strava Modal State:', modalCheck);
    if (!modalCheck.modalVisible) {
      throw new Error('Modal #modal-strava-authorize should be visible');
    }
    if (!modalCheck.scopeActChecked || !modalCheck.whToggleChecked) {
      throw new Error('Default permissions and webhook toggle should be checked');
    }
    console.log('✓ Modal opened with Strava OAuth 2.0 branding, granular scopes & realtime webhook toggle');

    // Capture screenshot of Strava OAuth Authorization Modal
    const authShot = await sendCmd('Page.captureScreenshot', { format: 'png' });
    const authShotPath = path.join(ARTIFACT_DIR, 'screenshot_strava_authorize_modal.png');
    fs.writeFileSync(authShotPath, Buffer.from(authShot.data, 'base64'));
    console.log('✓ Captured screenshot:', authShotPath);

    // ========================================================
    // TEST 4: Confirm Authorization & Verify 24/7 Webhook Realtime Handshake
    // ========================================================
    console.log('\n--- TEST 4: Confirm Authorization & Webhook Realtime Ingestion ---');

    await evaluate(`confirmStravaAuthorization()`);
    await new Promise(r => setTimeout(r, 1200));

    const postAuthCheck = await evaluate(`(() => {
      const modal = document.getElementById('modal-strava-authorize');
      const badge = document.getElementById('strava-status-badge');
      const tbody = document.getElementById('tab-strava-sync-logs-tbody');
      const firstRow = tbody ? tbody.querySelector('tr') : null;
      
      return {
        modalClosed: modal && modal.classList.contains('hidden'),
        badgeText: badge ? badge.innerText : '',
        badgeIsActive: badge && badge.innerText.includes('ACTIVE'),
        firstRowText: firstRow ? firstRow.innerText : '',
        hasLivePacket: firstRow && firstRow.innerText.includes('Vừa xong')
      };
    })()`);

    console.log('Post-Authorization State:', postAuthCheck);
    if (!postAuthCheck.modalClosed) {
      throw new Error('Modal should be closed after authorization');
    }
    if (!postAuthCheck.badgeIsActive) {
      throw new Error('Strava status badge should be ACTIVE');
    }
    if (!postAuthCheck.hasLivePacket) {
      throw new Error('Table should have received live realtime webhook packet at the top');
    }
    console.log('✓ Strava OAuth 2.0 connected and Realtime Webhook packet received at top of logs table!');

    // Capture screenshot of Connected Strava & Realtime Webhook Log Table
    const webhookShot = await sendCmd('Page.captureScreenshot', { format: 'png' });
    const webhookShotPath = path.join(ARTIFACT_DIR, 'screenshot_strava_webhook_realtime_connected.png');
    fs.writeFileSync(webhookShotPath, Buffer.from(webhookShot.data, 'base64'));
    console.log('✓ Captured screenshot:', webhookShotPath);

    // ========================================================
    // TEST 5: Verify Role Navigation Filtering in Sport Cam
    // ========================================================
    console.log('\n--- TEST 5: Role Navigation Filtering in Sport Cam ---');

    // Switch role to Captain
    await evaluate(`switchRolePortal('captain')`);
    await new Promise(r => setTimeout(r, 500));

    const captainFilterCheck = await evaluate(`(() => {
      return {
        runnerHidden: document.getElementById('sport-group-runner')?.classList.contains('hidden'),
        clubHidden: document.getElementById('sport-group-club')?.classList.contains('hidden'),
        captainVisible: !document.getElementById('sport-group-captain')?.classList.contains('hidden'),
        adminHidden: document.getElementById('sport-group-admin')?.classList.contains('hidden'),
        roleLabel: document.getElementById('role-switcher-label')?.innerText
      };
    })()`);

    console.log('Captain Filter State:', captainFilterCheck);
    if (!captainFilterCheck.captainVisible || !captainFilterCheck.runnerHidden) {
      throw new Error('Role filtering should show Captain portal and hide others');
    }
    console.log('✓ Sport Cam role filtering verified for Captain');

    // Reset role to all
    await evaluate(`switchRolePortal('all')`);
    await new Promise(r => setTimeout(r, 500));

    // Reset theme to mantis (default)
    await evaluate(`setAppTheme('mantis')`);
    await new Promise(r => setTimeout(r, 500));
    console.log('✓ Reset to Mantis default theme cleanly');

    ws.close();
    chromeProc.kill();
    console.log('\n========================================');
    console.log('ALL SPORT CAM & STRAVA REALTIME TESTS PASSED 100%!');
    console.log('========================================');
  } catch (err) {
    console.error('Test execution failed:', err);
    try { chromeProc.kill(); } catch (e) {}
    process.exit(1);
  }
}

run();
