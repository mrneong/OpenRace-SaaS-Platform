const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const browserBin = fs.existsSync(chromePath) ? chromePath : edgePath;

const browserProc = spawn(browserBin, [
  '--headless=new',
  '--remote-debugging-port=9230',
  '--disable-gpu',
  '--window-size=1440,1100',
  'http://localhost:3000'
]);

async function capture() {
  try {
    let targetInfo;
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 200));
      try {
        const res = await fetch('http://127.0.0.1:9230/json/list');
        if (res.ok) {
          const list = await res.json();
          targetInfo = list.find(t => t.url.includes('localhost:3000'));
          if (targetInfo && targetInfo.webSocketDebuggerUrl) break;
        }
      } catch (e) {}
    }

    if (!targetInfo) throw new Error('Could not connect to CDP on 9230');

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

    const call = (method, params = {}) => new Promise((resolve) => {
      const id = idCounter++;
      pending.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });

    await call('Page.enable');
    await call('Runtime.enable');
    await call('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 1000,
      deviceScaleFactor: 1,
      mobile: false
    });

    // Wait 1s for DOM
    await new Promise(r => setTimeout(r, 1000));

    // Switch to Club tab
    await call('Runtime.evaluate', {
      expression: 'window.switchTab("club");',
      awaitPromise: true
    });

    await new Promise(r => setTimeout(r, 600));

    // Capture top view of Club Hub
    const shot1 = await call('Page.captureScreenshot', { format: 'png' });
    const targetPath1 = path.resolve(__dirname, '../screenshot_subsystem_4_club.png');
    const artifactPath1 = 'C:\\Users\\nguye\\.gemini\\antigravity\\brain\\6cc28217-793d-48a4-8630-e0b049bf6838\\screenshot_subsystem_4_club.png';
    fs.writeFileSync(targetPath1, Buffer.from(shot1.result.data, 'base64'));
    fs.writeFileSync(artifactPath1, Buffer.from(shot1.result.data, 'base64'));
    console.log('Saved shot 1:', artifactPath1);

    // Scroll down to team capacity, dual consents, and members roster
    await call('Runtime.evaluate', {
      expression: 'window.scrollTo({ top: 1200, behavior: "instant" });',
      awaitPromise: true
    });
    await new Promise(r => setTimeout(r, 600));

    const shot2 = await call('Page.captureScreenshot', { format: 'png' });
    const targetPath2 = path.resolve(__dirname, '../screenshot_subsystem_4_club_roster.png');
    const artifactPath2 = 'C:\\Users\\nguye\\.gemini\\antigravity\\brain\\6cc28217-793d-48a4-8630-e0b049bf6838\\screenshot_subsystem_4_club_roster.png';
    fs.writeFileSync(targetPath2, Buffer.from(shot2.result.data, 'base64'));
    fs.writeFileSync(artifactPath2, Buffer.from(shot2.result.data, 'base64'));
    console.log('Saved shot 2:', artifactPath2);

    ws.close();
  } catch (err) {
    console.error('Capture error:', err);
  } finally {
    if (browserProc && !browserProc.killed) {
      browserProc.kill();
    }
  }
}

capture();
