const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const FRONTEND_BASE = 'http://localhost:3000';
const ARTIFACT_DIR = 'C:\\Users\\nguye\\.gemini\\antigravity\\brain\\6cc28217-793d-48a4-8630-e0b049bf6838';

async function run() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const cdpPort = 9345;
  const tempProfile = path.join(require('os').tmpdir(), 'chrome-test-' + Date.now());

  console.log('Spawning Chrome on port', cdpPort);
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
      } catch (e) {}
    }

    if (!targets || targets.length === 0) throw new Error('Chrome CDP port not responding');

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

    console.log('Connected to CDP session');
    await sendCmd('Page.enable');
    await sendCmd('Runtime.enable');
    await sendCmd('DOM.enable');

    console.log('Waiting for document to be ready and scripts loaded...');
    let ready = false;
    for (let i = 0; i < 50; i++) {
      const readyState = await sendCmd('Runtime.evaluate', {
        expression: "document.readyState === 'complete' && !!document.body && typeof switchTab === 'function' && typeof setAppTheme === 'function'",
        returnByValue: true
      });
      if (readyState?.result?.value === true) {
        ready = true;
        console.log(`Page ready after ${i * 200}ms!`);
        break;
      }
      await new Promise(r => setTimeout(r, 200));
    }

    if (!ready) throw new Error('Page scripts did not load in time');

    // 1. Test Sport Cam theme & Docked Sidebar Parity
    console.log('\n--- 1. Testing Sport Cam Theme & Docked Sidebar Parity ---');
    await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        setAppTheme('sport');
      })()`
    });
    await new Promise(r => setTimeout(r, 300));

    const sportSidebarCheck = await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        const bodyTheme = document.body.getAttribute('data-theme');
        const sportSidebar = document.getElementById('sport-docked-sidebar');
        const mantisSidebar = document.getElementById('mantis-sidebar');
        const slimRail = document.getElementById('slim-rail');
        const sportItems = sportSidebar?.querySelectorAll('[id^="sport-nav-"]') || [];
        const isSportSidebarVisible = sportSidebar && !sportSidebar.classList.contains('hidden') && sportSidebar.offsetWidth > 0;
        const isMantisSidebarHidden = !mantisSidebar || mantisSidebar.classList.contains('hidden') || mantisSidebar.offsetWidth === 0;
        const isSlimRailHidden = !slimRail || slimRail.classList.contains('hidden') || slimRail.offsetWidth === 0;
        return {
          bodyTheme,
          isSportSidebarVisible,
          isMantisSidebarHidden,
          isSlimRailHidden,
          sportItemCount: sportItems.length
        };
      })()`,
      returnByValue: true
    });

    console.log('Sport Sidebar Check:', sportSidebarCheck?.result?.value);

    // Switch tab to strava-sync while in Sport Cam
    await sendCmd('Runtime.evaluate', {
      expression: `switchTab('strava-sync')`
    });
    await new Promise(r => setTimeout(r, 400));

    // Capture screenshot of Sport Cam theme with docked sidebar
    const shotSport = await sendCmd('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'screenshot_sport_cam_docked_sidebar_parity.png'), Buffer.from(shotSport.data, 'base64'));
    console.log('📸 Screenshot saved: screenshot_sport_cam_docked_sidebar_parity.png');

    // 2. Disconnect Strava
    console.log('\n--- 2. Disconnecting Strava ---');
    await sendCmd('Runtime.evaluate', {
      expression: `disconnectStravaClient()`
    });
    await new Promise(r => setTimeout(r, 300));

    const disconnectedCheck = await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        const statusBadge = document.getElementById('strava-status-badge')?.innerText || '';
        const connBadge = document.getElementById('strava-conn-badge-text')?.innerText || '';
        return { statusBadge, connBadge };
      })()`,
      returnByValue: true
    });
    console.log('Strava badge after disconnect:', disconnectedCheck?.result?.value);

    // 3. Open Strava Authorization Modal
    console.log('\n--- 3. Testing Strava Authorization Modal ---');
    await sendCmd('Runtime.evaluate', {
      expression: `openStravaAuthorizeModal()`
    });
    await new Promise(r => setTimeout(r, 400));

    const modalCheck = await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        const modal = document.getElementById('modal-strava-authorize');
        const isVisible = modal && !modal.classList.contains('hidden');
        const scopeRead = document.getElementById('auth-scope-read')?.checked;
        const scopeAct = document.getElementById('auth-scope-activity')?.checked;
        const scopeProf = document.getElementById('auth-scope-profile')?.checked;
        const whToggle = document.getElementById('auth-webhook-toggle')?.checked;
        return { isVisible, scopeRead, scopeAct, scopeProf, whToggle };
      })()`,
      returnByValue: true
    });
    console.log('Modal Check:', modalCheck?.result?.value);

    // Capture screenshot of Strava Authorize Modal
    const shotModal = await sendCmd('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'screenshot_strava_authorize_modal.png'), Buffer.from(shotModal.data, 'base64'));
    console.log('📸 Screenshot saved: screenshot_strava_authorize_modal.png');

    // 4. Confirm Strava Authorization with Webhook 24/7
    console.log('\n--- 4. Confirming Strava Authorization & Realtime Webhook ---');
    await sendCmd('Runtime.evaluate', {
      expression: `(async () => {
        await confirmStravaAuthorization();
      })()`,
      awaitPromise: true
    });
    await new Promise(r => setTimeout(r, 600));

    const authorizedCheck = await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        const statusBadge = document.getElementById('strava-status-badge')?.innerText || '';
        const connBadge = document.getElementById('strava-conn-badge-text')?.innerText || '';
        const topRowTab = document.querySelector('#tab-strava-sync-logs-tbody tr')?.innerText || '';
        const topRowSec = document.querySelector('#strava-sync-logs-tbody tr')?.innerText || '';
        return {
          statusBadge,
          connBadge,
          topRowTab: topRowTab.substring(0, 100).replace(/\\n/g, ' '),
          topRowSec: topRowSec.substring(0, 100).replace(/\\n/g, ' ')
        };
      })()`,
      returnByValue: true
    });
    console.log('Authorized State Check:', authorizedCheck?.result?.value);

    // Capture screenshot of Strava Realtime Webhook connected state
    const shotRealtime = await sendCmd('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'screenshot_strava_webhook_realtime_connected.png'), Buffer.from(shotRealtime.data, 'base64'));
    console.log('📸 Screenshot saved: screenshot_strava_webhook_realtime_connected.png');

    // 5. Test Role-Based Navigation Filtering in Sport Cam
    console.log('\n--- 5. Testing Role-Based Navigation in Sport Cam ---');
    await sendCmd('Runtime.evaluate', {
      expression: `switchRolePortal('captain')`
    });
    await new Promise(r => setTimeout(r, 300));

    const captainCheck = await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        const captainGroup = document.getElementById('sport-group-captain');
        const runnerGroup = document.getElementById('sport-group-runner');
        return {
          captainVisible: captainGroup && !captainGroup.classList.contains('hidden'),
          runnerHidden: runnerGroup && runnerGroup.classList.contains('hidden')
        };
      })()`,
      returnByValue: true
    });
    console.log('Captain Role Filter Check:', captainCheck?.result?.value);

    // Reset back to all and mantis
    await sendCmd('Runtime.evaluate', {
      expression: `switchRolePortal('all'); setAppTheme('mantis');`
    });
    await new Promise(r => setTimeout(r, 300));

    console.log('\n[SUCCESS] All targeted tests completed!');
    ws.close();
  } finally {
    try {
      chromeProc.kill('SIGKILL');
    } catch (e) {}
  }
}

run().catch(console.error);
