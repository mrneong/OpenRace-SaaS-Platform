const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\nguye\\.gemini\\antigravity\\brain\\6cc28217-793d-48a4-8630-e0b049bf6838';

async function captureExtra() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9231',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    '--window-size=1440,1024',
    '--user-data-dir=C:\\temp\\chrome-screen-capture-extra'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  let targetInfo;
  for (let i = 0; i < 20; i++) {
    try {
      const jsonStr = await new Promise((resolve, reject) => {
        http.get('http://127.0.0.1:9231/json', (res) => {
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

  // Screen 5.3: Sổ nợ & Đóng quỹ
  await evalJs('window.goToScreen("5.3")');
  await captureToFile('screenshot_screen_5_3_ledger_finance.png');

  // Screen 8.2: Webhook Queue & DLQ
  await evalJs('window.goToScreen("8.2")');
  await captureToFile('screenshot_screen_8_2_webhook_queue.png');

  chromeProc.kill();
  ws.close();
  console.log('Extra screenshots captured successfully!');
  process.exit(0);
}

captureExtra().catch(err => {
  console.error(err);
  process.exit(1);
});

