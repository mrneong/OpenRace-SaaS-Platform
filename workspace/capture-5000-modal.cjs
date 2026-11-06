const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const ARTIFACT_DIR = 'C:/Users/nguye/.gemini/antigravity/brain/6cc28217-793d-48a4-8630-e0b049bf6838';

const chromePaths = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
  process.env.PROGRAMFILES + '\\Google\\Chrome\\Application\\chrome.exe',
];
const chromePath = chromePaths.find(p => p && fs.existsSync(p));

async function run() {
  console.log('=== CAPTURING 5,000 DATASET SYSTEM MODAL VIA ISOLATED CDP ===');
  const cdpPort = 9283;
  const tempProfile = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-prof-'));

  const chromeProc = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${cdpPort}`,
    `--user-data-dir=${tempProfile}`,
    '--window-size=1440,960',
    '--disable-gpu',
    'about:blank'
  ]);

  try {
    let targetInfo;
    for (let i = 0; i < 40; i++) {
      await new Promise(r => setTimeout(r, 200));
      try {
        const res = await fetch(`http://127.0.0.1:${cdpPort}/json/list`);
        if (res.ok) {
          const list = await res.json();
          targetInfo = list.find(t => t.type === 'page');
          if (targetInfo && targetInfo.webSocketDebuggerUrl) break;
        }
      } catch (e) {}
    }

    if (!targetInfo) throw new Error('CDP target not ready on port ' + cdpPort);

    const ws = new WebSocket(targetInfo.webSocketDebuggerUrl);
    let idCounter = 1;
    const pending = new Map();
    let loadFired = false;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.method === 'Page.loadEventFired') {
        loadFired = true;
      }
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

    console.log('Navigating to http://localhost:3000...');
    await sendCmd('Page.navigate', { url: 'http://localhost:3000' });

    for (let i = 0; i < 50; i++) {
      if (loadFired) break;
      await new Promise(r => setTimeout(r, 100));
    }
    await new Promise(r => setTimeout(r, 1500));

    async function evalCode(expression) {
      const res = await sendCmd('Runtime.evaluate', {
        expression,
        returnByValue: true,
        awaitPromise: true
      });
      return res.result?.value;
    }

    const pageState = await evalCode(`({
      href: location.href,
      readyState: document.readyState,
      hasModal: !!document.getElementById('modal-5000-dataset-stats'),
      hasFn: typeof open5000DatasetModal
    })`);
    console.log('Page State:', pageState);

    // Open modal
    console.log('Opening modal...');
    await evalCode(`
      if (typeof open5000DatasetModal === 'function') {
        open5000DatasetModal();
      } else {
        const m = document.getElementById('modal-5000-dataset-stats');
        if (m) {
          m.classList.remove('hidden');
          m.style.display = 'flex';
        }
      }
    `);
    await new Promise(r => setTimeout(r, 700));

    const modalState = await evalCode(`(() => {
      const m = document.getElementById('modal-5000-dataset-stats');
      return m ? {
        id: m.id,
        display: window.getComputedStyle(m).display,
        offsetWidth: m.offsetWidth,
        offsetHeight: m.offsetHeight
      } : null;
    })()`);
    console.log('Modal State after open:', modalState);

    const res = await sendCmd('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    const outPath = path.join(ARTIFACT_DIR, 'screenshot_5000_dataset_system_modal.png');
    fs.writeFileSync(outPath, buffer);
    console.log('✓ Successfully saved screenshot to:', outPath);

    ws.close();
  } finally {
    try {
      chromeProc.kill();
      fs.rmSync(tempProfile, { recursive: true, force: true });
    } catch (e) {}
  }
}

run().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
