const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const cdpPort = 9240;
const artifactsDir = 'C:\\Users\\nguye\\.gemini\\antigravity\\brain\\6cc28217-793d-48a4-8630-e0b049bf6838';

const chromeProc = spawn(chromePath, [
  '--headless=new',
  `--remote-debugging-port=${cdpPort}`,
  '--window-size=1440,1100',
  '--disable-gpu',
  'http://localhost:3000'
]);

async function capture() {
  await new Promise(r => setTimeout(r, 2500));
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
  await sendCmd('Page.reload');
  await new Promise(r => setTimeout(r, 2000));

  async function evalJs(expr) {
    const res = await sendCmd('Runtime.evaluate', { expression: expr, returnByValue: true });
    return res && res.result ? res.result.value : null;
  }

  // Navigate to Section 4.1 (Club Hub)
  await evalJs(`
    switchTab('club');
    switchSubTab('4.1');
  `);
  await new Promise(r => setTimeout(r, 1000));

  // Screenshot 1: Section 4.1 Cover and Breakdown Cards
  const shot1 = await sendCmd('Page.captureScreenshot', { format: 'png' });
  const shot1Path = path.join(artifactsDir, 'screenshot_club_cover_and_breakdown_3_scopes.png');
  fs.writeFileSync(shot1Path, Buffer.from(shot1.data, 'base64'));
  console.log('Saved:', shot1Path);

  // Open Edit Club Profile Modal
  await evalJs(`openEditClubProfileModal()`);
  await new Promise(r => setTimeout(r, 600));

  // Screenshot 2: Edit Club Profile Modal with Auto-Aggregated Metrics
  const shot2 = await sendCmd('Page.captureScreenshot', { format: 'png' });
  const shot2Path = path.join(artifactsDir, 'screenshot_club_modal_auto_metrics.png');
  fs.writeFileSync(shot2Path, Buffer.from(shot2.data, 'base64'));
  console.log('Saved:', shot2Path);

  // Close modal and terminate chrome
  await evalJs(`closeEditClubProfileModal()`);
  ws.close();
  chromeProc.kill();
  console.log('Verification & Screenshots complete!');
}

capture().catch(err => {
  console.error(err);
  try { chromeProc.kill(); } catch (e) {}
  process.exit(1);
});

