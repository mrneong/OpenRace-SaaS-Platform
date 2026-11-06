const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const ARTIFACT_DIR = 'C:/Users/nguye/.gemini/antigravity/brain/6cc28217-793d-48a4-8630-e0b049bf6838';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const cdpPort = 9232;
const chromeProc = spawn(chromePath, [
  '--headless=new',
  `--remote-debugging-port=${cdpPort}`,
  '--window-size=1400,960',
  '--disable-gpu',
  'http://localhost:3000'
]);

async function run() {
  try {
    await new Promise(r => setTimeout(r, 2000));
    const res = await fetch(`http://127.0.0.1:${cdpPort}/json/list`);
    const list = await res.json();
    const target = list.find(t => t.url.includes('localhost:3000'));
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    let id = 1;
    const sendCmd = (method, params = {}) => new Promise((resolve) => {
      const curId = id++;
      const handler = (e) => {
        const d = JSON.parse(e.data);
        if (d.id === curId) {
          ws.removeEventListener('message', handler);
          resolve(d.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: curId, method, params }));
    });

    await new Promise(r => ws.onopen = r);
    await sendCmd('Page.enable');
    await sendCmd('Runtime.enable');
    await new Promise(r => setTimeout(r, 1000));

    async function evalJs(expr) {
      const r = await sendCmd('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
      return r?.result?.value;
    }

    async function capture(fileName) {
      await new Promise(r => setTimeout(r, 600));
      const shot = await sendCmd('Page.captureScreenshot', { format: 'png' });
      const buf = Buffer.from(shot.data, 'base64');
      const dest = path.join(ARTIFACT_DIR, fileName);
      fs.writeFileSync(dest, buf);
      console.log('Saved screenshot:', fileName);
    }

    // 1. Switch to tab-arena
    await evalJs('switchTab("arena")');
    await new Promise(r => setTimeout(r, 500));
    const activeTab = await evalJs('document.querySelector(".tab-content.active")?.id');
    console.log('Active tab after switchTab("arena"):', activeTab);

    // Capture clean full width arena (No greeting header, full width edge-to-edge cards)
    await capture('screenshot_fixed_arena_fullwidth_clean.png');

    // 2. Open dropdown for [Đấu Trường] to verify solid opaque background over the arena page
    await evalJs(`
      const dd = document.querySelector("#nav-arena").parentElement.querySelector(".nav-dropdown");
      if (dd) {
        dd.classList.remove("hidden");
        dd.style.display = "block";
      }
    `);
    await capture('screenshot_fixed_arena_menu_and_fullwidth.png');

    // Hide dropdown back
    await evalJs(`
      const dd = document.querySelector("#nav-arena").parentElement.querySelector(".nav-dropdown");
      if (dd) {
        dd.classList.add("hidden");
        dd.style.display = "";
      }
    `);

    // 3. Switch back to tab-dashboard to verify greeting header is still intact on Dashboard
    await evalJs('switchTab("dashboard")');
    await new Promise(r => setTimeout(r, 500));
    await capture('screenshot_fixed_dashboard_greeting_intact.png');

    ws.close();
    chromeProc.kill();
    console.log('Verification screenshots captured successfully!');
  } catch (err) {
    console.error('Error:', err);
    chromeProc.kill();
  }
}

run();
