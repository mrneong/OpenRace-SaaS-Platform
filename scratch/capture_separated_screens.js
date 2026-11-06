const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\nguye\\.gemini\\antigravity\\brain\\6cc28217-793d-48a4-8630-e0b049bf6838';

async function captureScreens() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9230',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    '--window-size=1440,1024',
    '--user-data-dir=C:\\temp\\chrome-screen-capture'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  let targetInfo;
  for (let i = 0; i < 20; i++) {
    try {
      const jsonStr = await new Promise((resolve, reject) => {
        http.get('http://127.0.0.1:9230/json', (res) => {
          let b = '';
          res.on('data', c => b += c);
          res.on('end', () => resolve(b));
        }).on('error', reject);
      });
      const targets = JSON.parse(jsonStr);
      targetInfo = targets.find(t => t.type === 'page');
      if (targetInfo) break;
    } catch (e) {
      await new Promise(r => setTimeout(r, 300));
    }
  }

  const ws = new WebSocket(targetInfo.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let idCounter = 1;
  const pending = new Map();
  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    }
  };

  const call = (method, params = {}) => new Promise((resolve) => {
    const id = idCounter++;
    pending.set(id, resolve);
    ws.send(JSON.stringify({ id, method, params }));
  });

  const evalJs = async (expr) => {
    const res = await call('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    return res.result?.result?.value;
  };

  const captureToFile = async (filename) => {
    await new Promise(r => setTimeout(r, 500));
    const shot = await call('Page.captureScreenshot', { format: 'png' });
    const buf = Buffer.from(shot.result.data, 'base64');
    const outPath = path.join(ARTIFACT_DIR, filename);
    fs.writeFileSync(outPath, buf);
    console.log(`Saved screenshot: ${outPath} (${(buf.length / 1024).toFixed(1)} KB)`);
  };

  await call('Page.enable');
  await call('Page.navigate', { url: 'http://localhost:3000' });
  await new Promise(r => setTimeout(r, 1500));

  // 1. Dashboard (1.0) Overview - Must remain intact
  await evalJs('window.switchTab("dashboard")');
  await captureToFile('screenshot_screen_1_0_overview_intact.png');

  // 2. Screen 2.2: Bảng xếp hạng Đội
  await evalJs('window.goToScreen("2.2")');
  await captureToFile('screenshot_screen_2_2_team_leaderboard.png');

  // 3. Screen 3.1: Toàn bộ bài chạy
  await evalJs('window.goToScreen("3.1")');
  await captureToFile('screenshot_screen_3_1_all_activities.png');

  // 4. Screen 4.1: Hồ sơ & Bảng tin CLB
  await evalJs('window.goToScreen("4.1")');
  await captureToFile('screenshot_screen_4_1_club_profile.png');

  // 5. Screen 6.2: Quản trị thành viên
  await evalJs('window.goToScreen("6.2")');
  await captureToFile('screenshot_screen_6_2_member_management.png');

  // 6. Screen 7.1: Thiết lập giải đấu & Wizard
  await evalJs('window.goToScreen("7.1")');
  await captureToFile('screenshot_screen_7_1_race_setup.png');

  chromeProc.kill();
  ws.close();
  console.log('All screenshots captured successfully!');
  process.exit(0);
}

captureScreens().catch(err => {
  console.error(err);
  process.exit(1);
});

