const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const ARTIFACT_DIR = 'C:/Users/nguye/.gemini/antigravity/brain/6cc28217-793d-48a4-8630-e0b049bf6838';

const chromePaths = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
  process.env.PROGRAMFILES + '\\Google\\Chrome\\Application\\chrome.exe',
];
const chromePath = chromePaths.find(p => fs.existsSync(p));
if (!chromePath) {
  console.error('Chrome executable not found');
  process.exit(1);
}

const cdpPort = 9229;
const chromeProc = spawn(chromePath, [
  '--headless=new',
  `--remote-debugging-port=${cdpPort}`,
  '--window-size=1400,960',
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
  'http://localhost:3000'
]);

async function run() {
  try {
    let targetInfo;
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 200));
      try {
        const res = await fetch(`http://127.0.0.1:${cdpPort}/json/list`);
        if (res.ok) {
          const list = await res.json();
          targetInfo = list.find(t => t.url.includes('localhost:3000'));
          if (targetInfo && targetInfo.webSocketDebuggerUrl) break;
        }
      } catch (e) {}
    }

    if (!targetInfo) throw new Error('CDP target not ready');

    const ws = new WebSocket(targetInfo.webSocketDebuggerUrl);
    let idCounter = 1;
    const pending = new Map();
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id && pending.has(data.id)) {
        const { resolve, reject } = pending.get(data.id);
        pending.delete(data.id);
        if (data.error) reject(data.error);
        else resolve(data.result);
      }
    };

    await new Promise(r => ws.onopen = r);

    function sendCmd(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = idCounter++;
        pending.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await sendCmd('Page.enable');
    await sendCmd('Runtime.enable');
    await new Promise(r => setTimeout(r, 1000));

    async function evalJs(expr) {
      const res = await sendCmd('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
      return res.result?.value;
    }

    async function capture(fileName) {
      await new Promise(r => setTimeout(r, 600));
      const shot = await sendCmd('Page.captureScreenshot', { format: 'png' });
      const buf = Buffer.from(shot.data, 'base64');
      const dest = path.join(ARTIFACT_DIR, fileName);
      fs.writeFileSync(dest, buf);
      console.log('Saved screenshot:', fileName);
    }

    // 1. Capture Dashboard with Top Navigation (Clean 5-pill mega nav)
    await evalJs('switchTab("dashboard")');
    await capture('screenshot_v22_top_meganav.png');

    // 2. Open Sidebar Drawer (exact match to user uploaded screenshot)
    await evalJs('toggleSidebar()');
    await capture('screenshot_v22_sidebar_tree_cards.png');

    // 3. Scroll Sidebar Drawer down to show [5.0] to [8.0]
    await evalJs('document.getElementById("main-sidebar").scrollTop = 420;');
    await capture('screenshot_v22_sidebar_scrolled_admin.png');

    // 4. Close Sidebar and open Admin Action Center
    await evalJs('toggleSidebar()');
    await evalJs('switchTab("club-manage")');
    await capture('screenshot_v22_admin_action_center.png');

    // 5. Toggle Dark Mode
    await evalJs('toggleDarkMode()');
    await capture('screenshot_v22_dark_mode_overview.png');

    ws.close();
    chromeProc.kill();
    console.log('All screenshots captured successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Screenshot capture failed:', err);
    chromeProc.kill();
    process.exit(1);
  }
}

run();

