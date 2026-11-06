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

const cdpPort = 9228;
const chromeProc = spawn(chromePath, [
  '--headless=new',
  `--remote-debugging-port=${cdpPort}`,
  '--window-size=1280,900',
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
      const msg = JSON.parse(event.data);
      if (msg.id && pending.has(msg.id)) {
        pending.get(msg.id)(msg);
        pending.delete(msg.id);
      }
    };
    await new Promise(r => ws.onopen = r);

    const call = (method, params = {}) => new Promise(resolve => {
      const id = idCounter++;
      pending.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });

    await call('Page.enable');
    await call('Runtime.enable');
    await new Promise(r => setTimeout(r, 800));

    async function evalJs(expr) {
      const res = await call('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
      return res.result?.result?.value;
    }

    async function takeSnap(filename) {
      const snap = await call('Page.captureScreenshot', { format: 'png' });
      if (snap.result?.data) {
        const buf = Buffer.from(snap.result.data, 'base64');
        const outPath = path.join(ARTIFACT_DIR, filename);
        fs.writeFileSync(outPath, buf);
        console.log(`Saved screenshot: ${filename} (${buf.length} bytes)`);
      }
    }

    // 1. Dashboard with V2.1 Hero Banner
    await evalJs('window.switchTab("dashboard")');
    await new Promise(r => setTimeout(r, 400));
    await takeSnap('screenshot_v21_hero_dashboard.png');

    // 2. Teams Directory [7.A]
    await evalJs('window.switchTab("teams")');
    await evalJs('window.showSubScreen("teams", "section-7a")');
    await new Promise(r => setTimeout(r, 400));
    await takeSnap('screenshot_v21_teams_directory.png');

    // 3. Captain Management Portal [7.B]
    await evalJs('window.showSubScreen("teams", "section-7b")');
    await new Promise(r => setTimeout(r, 400));
    await takeSnap('screenshot_v21_captain_portal.png');

    // 4. Social Feed & Kudos [8.A]
    await evalJs('window.switchTab("social")');
    await evalJs('window.showSubScreen("social", "section-8a")');
    await new Promise(r => setTimeout(r, 400));
    await takeSnap('screenshot_v21_social_feed.png');

    // 5. Live Chat, AI PacerBot & Banter [9.A]
    await evalJs('window.switchTab("chat")');
    await evalJs('window.showSubScreen("chat", "section-9a")');
    await new Promise(r => setTimeout(r, 400));
    await takeSnap('screenshot_v21_live_chat_pacerbot.png');

    // 6. Club ERP (Offline Run RSVP, Polls, Discipline) [10.C & 10.D]
    await evalJs('window.switchTab("governance")');
    await evalJs('window.showSubScreen("governance", "section-10c")');
    await new Promise(r => setTimeout(r, 400));
    await takeSnap('screenshot_v21_club_erp_events.png');

    // 7. Strava Sync Logs [1.B]
    await evalJs('window.switchTab("strava-sync")');
    await new Promise(r => setTimeout(r, 400));
    await takeSnap('screenshot_v21_strava_sync_logs.png');

    ws.close();
  } catch (err) {
    console.error('Screenshot error:', err);
  } finally {
    chromeProc.kill();
  }
}

run();

