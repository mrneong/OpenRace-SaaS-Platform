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
const chromePath = chromePaths.find(p => p && fs.existsSync(p));

async function run() {
  const cdpPort = 9251;
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${cdpPort}`,
    '--window-size=1440,960',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    'http://localhost:3000'
  ]);

  try {
    let targetInfo;
    for (let i = 0; i < 40; i++) {
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
    await new Promise(r => setTimeout(r, 1500));

    async function evalCode(expression) {
      const res = await sendCmd('Runtime.evaluate', {
        expression,
        returnByValue: true,
        awaitPromise: true
      });
      return res.result?.value;
    }

    const modalInfo = await evalCode(`(() => {
      const m = document.getElementById('modal-finisher-certificate');
      if (!m) return { found: false };
      return {
        found: true,
        parent: m.parentElement.tagName + '#' + m.parentElement.id + '.' + m.parentElement.className,
        rect: m.getBoundingClientRect(),
        display: window.getComputedStyle(m).display,
        visibility: window.getComputedStyle(m).visibility,
        opacity: window.getComputedStyle(m).opacity,
        zIndex: window.getComputedStyle(m).zIndex,
        childCount: m.children.length,
        innerHtmlLength: m.innerHTML.length
      };
    })()`);
    console.log('Modal info before open:', modalInfo);

    // Call openFinisherCertificateModal
    await evalCode(`openFinisherCertificateModal()`);
    await new Promise(r => setTimeout(r, 500));

    const modalInfoAfter = await evalCode(`(() => {
      const m = document.getElementById('modal-finisher-certificate');
      if (!m) return { found: false };
      return {
        found: true,
        classList: Array.from(m.classList),
        display: window.getComputedStyle(m).display,
        rect: m.getBoundingClientRect(),
        zIndex: window.getComputedStyle(m).zIndex
      };
    })()`);
    console.log('Modal info after openFinisherCertificateModal():', modalInfoAfter);

    const res = await sendCmd('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    const outPath = path.join(ARTIFACT_DIR, 'screenshot_digital_finisher_certificate.png');
    fs.writeFileSync(outPath, buffer);
    console.log('Saved screenshot:', outPath);

    ws.close();
  } finally {
    chromeProc.kill();
  }
}

run();
