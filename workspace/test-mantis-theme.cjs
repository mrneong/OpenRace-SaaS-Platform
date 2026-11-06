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

const cdpPort = 9245;
const chromeProc = spawn(chromePath, [
  '--headless=new',
  `--remote-debugging-port=${cdpPort}`,
  '--window-size=1440,960',
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
  'http://localhost:3000'
]);

async function run() {
  console.log('=== STARTING MANTIS MATERIAL UI VERIFICATION ===');
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

    if (!targetInfo) throw new Error('CDP target not ready on port ' + cdpPort);

    const ws = new WebSocket(targetInfo.webSocketDebuggerUrl);
    let idCounter = 1;
    const pending = new Map();
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.method === 'Runtime.exceptionThrown') {
        console.error('EXCEPTION THROWN:', JSON.stringify(data.params.exceptionDetails));
      }
      if (data.method === 'Runtime.consoleAPICalled') {
        console.log('CONSOLE:', data.params.type, data.params.args.map(a => a.value || a.description).join(' '));
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
    await sendCmd('Page.navigate', { url: 'http://localhost:3000' });
    await new Promise(r => setTimeout(r, 2000));

    async function evalCode(expression) {
      const res = await sendCmd('Runtime.evaluate', {
        expression,
        returnByValue: true,
        awaitPromise: true
      });
      return res.result?.value;
    }

    async function captureScreenshot(fileName) {
      const res = await sendCmd('Page.captureScreenshot', { format: 'png' });
      const buffer = Buffer.from(res.data, 'base64');
      const outPath = path.join(ARTIFACT_DIR, fileName);
      fs.writeFileSync(outPath, buffer);
      console.log('✓ Saved screenshot:', outPath);
    }

    // 1. Check functions
    const pageUrl = await evalCode('document.location.href');
    const pageTitle = await evalCode('document.title');
    console.log('Page URL:', pageUrl, 'Title:', pageTitle);

    const typeofSetAppTheme = await evalCode('typeof setAppTheme');
    console.log('typeof setAppTheme:', typeofSetAppTheme);
    if (typeofSetAppTheme !== 'function') {
      throw new Error('setAppTheme function is not defined on window');
    }

    // 2. Activate Mantis Theme
    console.log('Activating Mantis Material UI Theme via setAppTheme("mantis")...');
    await evalCode('setAppTheme("mantis")');
    await new Promise(r => setTimeout(r, 800));

    // Verify DOM states
    const hasSidebar = await evalCode('Boolean(document.getElementById("mantis-sidebar"))');
    const hasHeader = await evalCode('Boolean(document.getElementById("mantis-header"))');
    const hasView = await evalCode('Boolean(document.getElementById("mantis-dashboard-view"))');

    console.log('Element existence:');
    console.log('  - hasSidebar:', hasSidebar);
    console.log('  - hasHeader:', hasHeader);
    console.log('  - hasView:', hasView);

    const mantisSidebarVisible = await evalCode('document.getElementById("mantis-sidebar") ? !document.getElementById("mantis-sidebar").classList.contains("hidden") : false');
    const mantisHeaderVisible = await evalCode('document.getElementById("mantis-header") ? !document.getElementById("mantis-header").classList.contains("hidden") : false');
    const mantisViewVisible = await evalCode('document.getElementById("mantis-dashboard-view") ? !document.getElementById("mantis-dashboard-view").classList.contains("hidden") : false');
    const slimRailHidden = await evalCode('document.getElementById("slim-rail") ? document.getElementById("slim-rail").classList.contains("hidden") : false');

    console.log('DOM Checks:');
    console.log('  - mantisSidebarVisible:', mantisSidebarVisible);
    console.log('  - mantisHeaderVisible:', mantisHeaderVisible);
    console.log('  - mantisViewVisible:', mantisViewVisible);
    console.log('  - slimRailHidden:', slimRailHidden);

    if (!mantisSidebarVisible || !mantisHeaderVisible || !mantisViewVisible) {
      throw new Error('Mantis elements are not properly visible in DOM');
    }

    // Capture Mantis Material UI screenshot
    console.log('Capturing Mantis Material UI Dashboard Screenshot...');
    await captureScreenshot('screenshot_mantis_material_ui_dashboard.png');

    // 3. Switch back to Sport Theme
    console.log('Switching back to Sport Cam Theme...');
    await evalCode('setAppTheme("sport")');
    await new Promise(r => setTimeout(r, 800));

    const sportViewVisible = await evalCode('!document.getElementById("openrace-dashboard-view").classList.contains("hidden")');
    console.log('  - sportViewVisible:', sportViewVisible);

    await captureScreenshot('screenshot_sport_theme_restored.png');

    // Switch back to mantis so user can see it right away!
    console.log('Re-activating Mantis Material UI Theme for user review...');
    await evalCode('setAppTheme("mantis")');
    await new Promise(r => setTimeout(r, 500));

    ws.close();
    chromeProc.kill();
    console.log('=== MANTIS MATERIAL UI VERIFICATION COMPLETED SUCCESSFULLY ===');
  } catch (err) {
    chromeProc.kill();
    throw err;
  }
}

run().catch(err => {
  console.error('Error in verification:', err);
  process.exit(1);
});
