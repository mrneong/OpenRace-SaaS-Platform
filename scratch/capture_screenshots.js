const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\nguye\\.gemini\\antigravity\\brain\\6cc28217-793d-48a4-8630-e0b049bf6838';
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const CDP_PORT = 9228;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function captureScreens() {
  console.log('Launching headless browser on port ' + CDP_PORT + '...');
  const proc = spawn(EDGE_PATH, [
    '--headless=new',
    '--remote-debugging-port=' + CDP_PORT,
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1440,900',
    'http://localhost:3000'
  ]);

  try {
    let target = null;
    for (let i = 0; i < 30; i++) {
      await sleep(400);
      try {
        const targets = await fetchJson('http://localhost:' + CDP_PORT + '/json');
        target = targets.find(t => t.type === 'page');
        if (target) break;
      } catch (e) {}
    }

    if (!target) throw new Error('Could not find CDP page target');

    const ws = new WebSocket(target.webSocketDebuggerUrl);
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

    const call = (method, params = {}) => new Promise((resolve) => {
      const id = idCounter++;
      pending.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });

    await call('Page.enable');
    await call('Runtime.enable');
    await sleep(1500);

    async function takeScreenshot(filePath) {
      const res = await call('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(filePath, Buffer.from(res.result.data, 'base64'));
      console.log('Saved screenshot:', filePath);
    }

    // 1. Screen [6.2] Quản lý thành viên
    console.log('Capturing Screen [6.2] Quản lý thành viên...');
    await call('Runtime.evaluate', { expression: 'goToScreen("6.2")' });
    await sleep(800);
    await takeScreenshot(path.join(ARTIFACT_DIR, 'screenshot_subsystem_6_member_management.png'));

    // 2. Modal [6.2] Thêm thành viên
    console.log('Capturing Modal [6.2] Thêm thành viên...');
    await call('Runtime.evaluate', { expression: 'openAddMemberModal()' });
    await sleep(500);
    await takeScreenshot(path.join(ARTIFACT_DIR, 'screenshot_modal_add_member.png'));
    await call('Runtime.evaluate', { expression: 'closeAddMemberModal()' });
    await sleep(300);

    // 3. Screen [7.1] Thiết lập giải đấu & Wizard
    console.log('Capturing Modal [7.1] Race Wizard...');
    await call('Runtime.evaluate', { expression: 'goToScreen("7.1")' });
    await sleep(600);
    await call('Runtime.evaluate', { expression: 'openRaceWizardModal()' });
    await sleep(500);
    await takeScreenshot(path.join(ARTIFACT_DIR, 'screenshot_subsystem_7_race_wizard.png'));
    await call('Runtime.evaluate', { expression: 'closeRaceWizardModal()' });
    await sleep(300);

    // 4. Screen [7.3] Phê duyệt khiếu nại GPS
    console.log('Capturing Screen [7.3] Phê duyệt khiếu nại...');
    await call('Runtime.evaluate', { expression: 'goToScreen("7.3")' });
    await sleep(600);
    await takeScreenshot(path.join(ARTIFACT_DIR, 'screenshot_subsystem_7_appeals_approval.png'));

    // 5. Screen [5.1] Hồ sơ & thông tin cá nhân
    console.log('Capturing Screen [5.1] Hồ sơ cá nhân...');
    await call('Runtime.evaluate', { expression: 'goToScreen("5.1")' });
    await sleep(600);
    await takeScreenshot(path.join(ARTIFACT_DIR, 'screenshot_subsystem_5_profile_management.png'));

    ws.close();
    console.log('ALL SCREENSHOTS CAPTURED SUCCESSFULLY!');
  } finally {
    proc.kill();
  }
}

captureScreens().catch(err => {
  console.error('Screenshot error:', err);
  process.exit(1);
});
