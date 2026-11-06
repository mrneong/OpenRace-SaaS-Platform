const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const ARTIFACT_DIR = 'C:/Users/nguye/.gemini/antigravity/brain/6cc28217-793d-48a4-8630-e0b049bf6838';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const cdpPort = 9234;
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

    // Navigate to [2.C] Bảng xếp hạng cá nhân
    await evalJs('goToSection("arena", "section-2-3")');
    await new Promise(r => setTimeout(r, 800));

    // Capture the entire section 2.3
    await capture('screenshot_fixed_individual_leaderboard_table.png');

    // Also scroll down to table
    await evalJs('document.getElementById("individual-runners-list")?.scrollIntoView({ behavior: "instant", block: "start" })');
    await capture('screenshot_fixed_individual_table_scrolled.png');

    // Also check section 2.4 (My team space & team roster table)
    await evalJs('goToSection("arena", "section-2-4")');
    await new Promise(r => setTimeout(r, 800));
    await capture('screenshot_fixed_team_roster_table.png');

    ws.close();
    chromeProc.kill();
    console.log('Table fix screenshots captured successfully!');
  } catch (err) {
    console.error(err);
    chromeProc.kill();
  }
}
run();

