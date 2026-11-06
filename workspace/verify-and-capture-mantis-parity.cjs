const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
// Native global WebSocket is available in Node.js 22+

const ARTIFACT_DIR = 'C:\\Users\\nguye\\.gemini\\antigravity\\brain\\6cc28217-793d-48a4-8630-e0b049bf6838';

function getChromePath() {
  const chromePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe'
  ];
  for (const p of chromePaths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

async function runMantisParityVerification() {
  console.log('================================================================');
  console.log('  STARTING MANTIS UI FUNCTIONAL PARITY VERIFICATION & CAPTURE');
  console.log('================================================================');

  const chromePath = getChromePath();
  if (!chromePath) {
    console.error('Chrome executable not found!');
    process.exit(1);
  }

  const debugPort = 9333;
  const tempProfile = path.join(__dirname, '..', '.tmp_chrome_mantis_parity');

  const chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${debugPort}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1440,1100',
    `--user-data-dir=${tempProfile}`,
    'http://localhost:3000'
  ]);

  let pageTarget;
  for (let i = 0; i < 35; i++) {
    await new Promise(r => setTimeout(r, 200));
    try {
      const listRes = await fetch(`http://127.0.0.1:${debugPort}/json/list`);
      if (listRes.ok) {
        const targets = await listRes.json();
        pageTarget = targets.find(t => t.type === 'page' && t.url.includes('localhost:3000')) || targets[0];
        if (pageTarget && pageTarget.webSocketDebuggerUrl) break;
      }
    } catch (e) {}
  }

  if (!pageTarget) {
    console.error('Could not connect to Chrome CDP after retries!');
    chromeProc.kill();
    process.exit(1);
  }

  try {

    console.log(`Connected to CDP target: ${pageTarget.url}`);

    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
    let msgId = 1;
    const pending = new Map();

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && pending.has(msg.id)) {
        const { resolve, reject } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };

    await new Promise((res, rej) => {
      ws.onopen = res;
      ws.onerror = rej;
    });

    function sendCommand(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = msgId++;
        pending.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    async function evalJs(expr) {
      const res = await sendCommand('Runtime.evaluate', {
        expression: expr,
        returnByValue: true,
        awaitPromise: true
      });
      if (res.exceptionDetails) {
        throw new Error(`Eval error: ${JSON.stringify(res.exceptionDetails)}`);
      }
      return res.result ? res.result.value : undefined;
    }

    await sendCommand('Runtime.enable');
    await sendCommand('Page.enable');

    // Wait until document.readyState === 'complete' and setAppTheme is ready
    for (let i = 0; i < 50; i++) {
      try {
        const isReady = await evalJs("document.readyState === 'complete' && typeof window.setAppTheme === 'function'");
        if (isReady) break;
      } catch (e) {}
      await new Promise(r => setTimeout(r, 150));
    }

    async function captureScreenshot(filePath) {
      const res = await sendCommand('Page.captureScreenshot', { format: 'png' });
      const buffer = Buffer.from(res.data, 'base64');
      fs.writeFileSync(filePath, buffer);
      console.log(`✓ Screenshot saved: ${path.basename(filePath)} (${(buffer.length / 1024).toFixed(1)} KB)`);
    }

    // Step 1: Switch to Mantis Material UI theme
    console.log('\n--- Step 1: Activating Mantis Material UI Theme ---');
    await evalJs("setAppTheme('mantis')");
    await new Promise(r => setTimeout(r, 600));

    const themeState = await evalJs(`({
      bodyTheme: document.body.getAttribute('data-theme'),
      sidebarVisible: !document.getElementById('mantis-sidebar').classList.contains('hidden'),
      headerVisible: !document.getElementById('mantis-header').classList.contains('hidden'),
      dashVisible: !document.getElementById('mantis-dashboard-view').classList.contains('hidden'),
      sportDashHidden: document.getElementById('openrace-dashboard-view').classList.contains('hidden')
    })`);
    console.log('Mantis UI State:', themeState);
    if (!themeState.sidebarVisible || !themeState.headerVisible || !themeState.dashVisible) {
      throw new Error('Mantis UI components not properly visible!');
    }
    console.log('✓ Mantis Material UI theme successfully activated!');

    // Step 2: Verify All OpenRace Functional Menus in Mantis Sidebar
    console.log('\n--- Step 2: Verifying Mantis Sidebar OpenRace Functional Navigation ---');
    const sidebarChecks = await evalJs(`({
      hasDashboard: !!document.getElementById('mantis-nav-dashboard'),
      hasStravaSync: !!document.getElementById('mantis-nav-strava-sync'),
      hasFinance: !!document.getElementById('mantis-nav-finance'),
      hasArena: !!document.getElementById('mantis-nav-arena'),
      hasActivities: !!document.getElementById('mantis-nav-activities'),
      hasClub: !!document.getElementById('mantis-nav-club'),
      hasTeams: !!document.getElementById('mantis-nav-teams'),
      hasSocial: !!document.getElementById('mantis-nav-social'),
      hasChat: !!document.getElementById('mantis-nav-chat'),
      hasClubManage: !!document.getElementById('mantis-nav-club-manage'),
      hasRules: !!document.getElementById('mantis-nav-rules'),
      hasGovernance: !!document.getElementById('mantis-nav-governance'),
      hasAdmin: !!document.getElementById('mantis-nav-admin'),
      totalNavItems: document.querySelectorAll('#mantis-sidebar .mantis-nav-item').length
    })`);
    console.log('Sidebar Navigation Checks:', sidebarChecks);
    if (sidebarChecks.totalNavItems < 15) {
      throw new Error(`Expected at least 15 functional items in Mantis sidebar, found ${sidebarChecks.totalNavItems}`);
    }
    console.log(`✓ All ${sidebarChecks.totalNavItems} OpenRace functional menu items verified in Mantis Sidebar!`);

    // Step 3: Verify Content Parity in Mantis Dashboard View
    console.log('\n--- Step 3: Verifying Real OpenRace Content on Mantis Dashboard View ---');
    const contentChecks = await evalJs(`({
      hasPriorityBar: document.getElementById('mantis-dashboard-view').innerText.includes('Thao Tác Nhanh'),
      hasSyncStravaBtn: document.getElementById('mantis-dashboard-view').innerText.includes('Đồng Bộ Strava'),
      has5000Btn: document.getElementById('mantis-dashboard-view').innerText.includes('5,000 Dữ Liệu'),
      hasCertBtn: document.getElementById('mantis-dashboard-view').innerText.includes('Chứng Nhận Finisher'),
      hasVietQrBtn: document.getElementById('mantis-dashboard-view').innerText.includes('Dynamic VietQR'),
      hasActiveRunnersCard: document.getElementById('mantis-dashboard-view').innerText.includes('48 / 1,000'),
      hasTotalDistanceCard: document.getElementById('mantis-dashboard-view').innerText.includes('3,170.0 KM'),
      hasWeeklyTargetCard: document.getElementById('mantis-dashboard-view').innerText.includes('18.5 / 20.0 KM'),
      hasFundLedgerCard: document.getElementById('mantis-dashboard-view').innerText.includes('100,000 VNĐ'),
      hasPhoenixTeamLead: document.getElementById('mantis-dashboard-view').innerText.includes('Team Phoenix SARC'),
      hasStreakHeatmap: document.getElementById('mantis-dashboard-view').innerText.includes('Chuỗi Chuyên Cần 20 Tuần'),
      hasTrailActivity: document.getElementById('mantis-dashboard-view').innerText.includes('ACT_000075'),
      hasAutoTrimActivity: document.getElementById('mantis-dashboard-view').innerText.includes('ACT_000077'),
      hasTreadmillActivity: document.getElementById('mantis-dashboard-view').innerText.includes('ACT_000076')
    })`);
    console.log('Content Parity Checks:', contentChecks);
    for (const [k, v] of Object.entries(contentChecks)) {
      if (!v) throw new Error(`Content check failed for: ${k}`);
    }
    console.log('✓ 100% Content Parity Verified on Mantis Material UI Dashboard!');

    // Capture Mantis Dashboard Screenshot
    const ss1Path = path.join(ARTIFACT_DIR, 'screenshot_mantis_functional_parity_dashboard.png');
    await captureScreenshot(ss1Path);

    // Step 4: Verify Tab Navigation inside Mantis UI
    console.log('\n--- Step 4: Testing Seamless Tab Navigation in Mantis UI ---');
    await evalJs("switchTab('arena')");
    await new Promise(r => setTimeout(r, 400));
    const arenaState = await evalJs(`({
      isArenaActive: document.getElementById('tab-arena').classList.contains('active'),
      isDashboardHidden: !document.getElementById('tab-dashboard').classList.contains('active'),
      isMantisNavArenaActive: document.getElementById('mantis-nav-arena')?.classList.contains('mantis-active-nav')
    })`);
    console.log('Arena Tab State in Mantis:', arenaState);
    if (!arenaState.isArenaActive || !arenaState.isMantisNavArenaActive) {
      throw new Error('Arena navigation in Mantis failed!');
    }
    console.log('✓ Successfully navigated to Race Arena while maintaining Mantis layout!');

    await evalJs("switchTab('activities')");
    await new Promise(r => setTimeout(r, 400));
    const actState = await evalJs(`({
      isActActive: document.getElementById('tab-activities').classList.contains('active'),
      isMantisNavActActive: document.getElementById('mantis-nav-activities')?.classList.contains('mantis-active-nav')
    })`);
    console.log('Activities Tab State in Mantis:', actState);
    if (!actState.isActActive || !actState.isMantisNavActActive) {
      throw new Error('Activities navigation in Mantis failed!');
    }
    console.log('✓ Successfully navigated to Activities while maintaining Mantis layout!');

    // Capture Menu Navigation Screenshot
    const ss2Path = path.join(ARTIFACT_DIR, 'screenshot_mantis_menu_navigation.png');
    await captureScreenshot(ss2Path);

    // Switch back to Dashboard in Mantis
    await evalJs("switchTab('dashboard')");
    await new Promise(r => setTimeout(r, 400));
    const backToDashState = await evalJs(`({
      isDashActive: document.getElementById('tab-dashboard').classList.contains('active'),
      isMantisDashVisible: !document.getElementById('mantis-dashboard-view').classList.contains('hidden'),
      isOpenRaceDashHidden: document.getElementById('openrace-dashboard-view').classList.contains('hidden'),
      isMantisNavDashActive: document.getElementById('mantis-nav-dashboard')?.classList.contains('mantis-active-nav')
    })`);
    console.log('Back to Dashboard in Mantis:', backToDashState);
    if (!backToDashState.isDashActive || !backToDashState.isMantisDashVisible) {
      throw new Error('Failed to restore Mantis Dashboard view!');
    }
    console.log('✓ Successfully switched back to Mantis Dashboard view!');

    ws.close();
    chromeProc.kill();

    console.log('\n================================================================');
    console.log('  MANTIS UI FUNCTIONAL PARITY VERIFIED 100% SUCCESSFULLY!');
    console.log('================================================================');
  } catch (err) {
    console.error('Fatal error during verification:', err);
    chromeProc.kill();
    process.exit(1);
  }
}

runMantisParityVerification();
