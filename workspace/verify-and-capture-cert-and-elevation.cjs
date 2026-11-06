const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');

const ARTIFACT_DIR = 'C:/Users/nguye/.gemini/antigravity/brain/6cc28217-793d-48a4-8630-e0b049bf6838';

const chromePaths = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
  process.env.PROGRAMFILES + '\\Google\\Chrome\\Application\\chrome.exe',
];
const chromePath = chromePaths.find(p => p && fs.existsSync(p));
if (!chromePath) {
  console.error('Chrome executable not found');
  process.exit(1);
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, json: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('=== VERIFYING CERTIFICATE & ELEVATION AUDIT REST APIS ===\n');

  // 1. Verify GET /api/me/certificate
  console.log('1. Testing GET /api/me/certificate...');
  const certRes = await fetchJson('http://localhost:3001/api/me/certificate');
  console.log('   Status:', certRes.status);
  console.log('   Certificate ID:', certRes.json.certificateId);
  console.log('   Athlete:', certRes.json.athleteName);
  console.log('   Completed KM:', certRes.json.completedKm);
  console.log('   Verification URL:', certRes.json.verificationUrl);
  if (certRes.status !== 200 || !certRes.json.certificateId) {
    throw new Error('Certificate API validation failed');
  }
  console.log('   ✓ Certificate API: PASS\n');

  // 2. Verify GET /api/activities/ACT_000075/elevation-profile
  console.log('2. Testing GET /api/activities/ACT_000075/elevation-profile...');
  const eleRes = await fetchJson('http://localhost:3001/api/activities/ACT_000075/elevation-profile');
  console.log('   Status:', eleRes.status);
  console.log('   Activity ID:', eleRes.json.activityId);
  console.log('   Elevation Gain:', eleRes.json.elevationGainM, 'm');
  console.log('   Bonus KM:', eleRes.json.bonusKm, 'km');
  console.log('   Anti-Cheat Verdict:', eleRes.json.antiCheat?.verdict);
  console.log('   Cadence Consistency:', eleRes.json.antiCheat?.cadenceConsistency);
  if (eleRes.status !== 200 || eleRes.json.bonusKm !== 2.0) {
    throw new Error('Elevation Profile API validation failed');
  }
  console.log('   ✓ Elevation Profile API: PASS\n');

  // 3. Launch Chrome with CDP
  console.log('3. Launching Headless Chrome on CDP...');
  const cdpPort = 9239;
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

    if (!targetInfo) throw new Error('CDP target not ready on port ' + cdpPort);

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
    await new Promise(r => setTimeout(r, 1200));

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
      console.log('   ✓ Saved screenshot to:', outPath);
    }

    // 4. Capture Finisher Certificate Modal
    console.log('4. Opening Finisher Certificate Modal...');
    await evalCode(`
      if (typeof openFinisherCertificateModal === 'function') {
        openFinisherCertificateModal();
      } else {
        const modal = document.getElementById('modal-finisher-certificate');
        if (modal) modal.classList.remove('hidden');
      }
    `);
    await new Promise(r => setTimeout(r, 700));
    await captureScreenshot('screenshot_digital_finisher_certificate.png');

    // Close modal
    await evalCode(`
      if (typeof closeFinisherCertificateModal === 'function') {
        closeFinisherCertificateModal();
      } else {
        const modal = document.getElementById('modal-finisher-certificate');
        if (modal) modal.classList.add('hidden');
      }
    `);
    await new Promise(r => setTimeout(r, 400));

    // 5. Capture Elevation GPS Audit Drawer
    console.log('5. Opening Trail Elevation Gain & GPS Route Audit Drawer...');
    await evalCode(`
      if (typeof openElevationAuditDrawer === 'function') {
        openElevationAuditDrawer('ACT_000075');
      } else {
        const drawer = document.getElementById('drawer-elevation-audit');
        if (drawer) drawer.classList.remove('hidden');
      }
    `);
    await new Promise(r => setTimeout(r, 700));
    await captureScreenshot('screenshot_elevation_gps_audit_drawer.png');

    ws.close();
    console.log('\n=== ALL CERTIFICATE & ELEVATION AUDIT CHECKS PASSED! ===');
  } finally {
    try {
      chromeProc.kill();
    } catch (e) {}
  }
}

run().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
