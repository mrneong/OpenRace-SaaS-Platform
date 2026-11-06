const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\nguye\\.gemini\\antigravity\\brain\\6cc28217-793d-48a4-8630-e0b049bf6838';

async function captureScreenshots() {
  const chromeProcess = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9223',
    '--window-size=1440,960',
    '--no-first-run',
    '--no-default-browser-check',
    'http://localhost:3000'
  ]);

  let targetWsUrl = null;
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 400));
    try {
      const res = await fetch('http://localhost:9223/json');
      if (res.ok) {
        const list = await res.json();
        const t = list.find(x => x.url.includes('localhost:3000'));
        if (t && t.webSocketDebuggerUrl) {
          targetWsUrl = t.webSocketDebuggerUrl;
          break;
        }
      }
    } catch (e) {}
  }

  if (!targetWsUrl) {
    console.error('Could not connect to Chrome debugging target');
    chromeProcess.kill();
    return;
  }

  const ws = new WebSocket(targetWsUrl);
  let id = 1;

  function send(method, params = {}) {
    return new Promise((resolve) => {
      const curId = id++;
      const handler = (evt) => {
        const msg = JSON.parse(evt.data);
        if (msg.id === curId) {
          ws.removeEventListener('message', handler);
          resolve(msg.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: curId, method, params }));
    });
  }

  await new Promise((resolve) => {
    ws.addEventListener('open', resolve);
  });

  async function evalJs(expr) {
    const res = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
    return res && res.result ? res.result.value : null;
  }

  async function saveScreenshot(filename) {
    const snap = await send('Page.captureScreenshot', { format: 'png' });
    const filePath = path.join(artifactDir, filename);
    fs.writeFileSync(filePath, Buffer.from(snap.data, 'base64'));
    console.log(`Saved screenshot: ${filePath}`);
  }

  await send('Page.enable');
  await send('Runtime.enable');
  await new Promise(r => setTimeout(r, 1000));

  // 1. Screenshot Full Navigation and Dashboard Overview
  await evalJs('window.switchTab("dashboard")');
  await new Promise(r => setTimeout(r, 600));
  await saveScreenshot('screenshot_full_sidebar_taxonomy.png');

  // 2. Screenshot Subsystem 2: Race Arena (Team & Individual Leaderboard)
  await evalJs('window.switchTab("arena")');
  await evalJs('window.toggleArenaTab("ind")');
  await new Promise(r => setTimeout(r, 600));
  await saveScreenshot('screenshot_subsystem_2_arena.png');

  // 3. Screenshot Subsystem 3: Activity Feed with Tabular Metrics & Badges
  await evalJs('window.switchTab("activities")');
  await evalJs('window.setActivityFilter("all")');
  await new Promise(r => setTimeout(r, 600));
  await saveScreenshot('screenshot_subsystem_3_activities.png');

  // 4. Screenshot Subsystem 3: Appeal Drawer Open
  await evalJs('window.openAppealDrawer("act-4")');
  await new Promise(r => setTimeout(r, 600));
  await saveScreenshot('screenshot_appeal_drawer.png');

  ws.close();
  chromeProcess.kill();
  console.log('All screenshots captured successfully!');
}

captureScreenshots().catch(console.error);

