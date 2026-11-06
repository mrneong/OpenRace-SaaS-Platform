const fs = require('fs');
const path = require('path');
const os = require('os');
const http = require('http');
const { spawn } = require('child_process');

const ARTIFACT_DIR = 'C:/Users/nguye/.gemini/antigravity/brain/6cc28217-793d-48a4-8630-e0b049bf6838';

function requestJson(url, options = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const reqOpts = {
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    };

    const req = http.request(reqOpts, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

const chromePaths = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
  process.env.PROGRAMFILES + '\\Google\\Chrome\\Application\\chrome.exe',
];
const chromePath = chromePaths.find(p => p && fs.existsSync(p));

async function run() {
  console.log('================================================================');
  console.log('  VERIFYING RUNNER EXPANSIONS (AC-048, AC-049, AC-050)');
  console.log('================================================================\n');

  // 1. AC-048: Auto-Trim Tracklog API
  console.log('1. Testing POST /api/activities/ACT_000073/auto-trim...');
  const trimRes = await requestJson('http://localhost:3001/api/activities/ACT_000073/auto-trim', { method: 'POST' });
  console.log('   Status:', trimRes.status);
  console.log('   Original Distance:', trimRes.body?.originalDistanceKm, 'km');
  console.log('   Trimmed Distance:', trimRes.body?.trimmedDistanceKm, 'km');
  console.log('   Clean Credited Distance:', trimRes.body?.cleanDistanceKm, 'km');
  console.log('   Message:', trimRes.body?.message);
  if (trimRes.status !== 200 || trimRes.body?.cleanDistanceKm !== 10.0) {
    throw new Error('Auto-Trim API verification failed');
  }
  console.log('   ✓ Auto-Trim API: PASS\n');

  // 2. AC-049: Connected Wearable Devices API
  console.log('2. Testing GET /api/me/connected-devices...');
  const devRes = await requestJson('http://localhost:3001/api/me/connected-devices');
  console.log('   Status:', devRes.status);
  console.log('   Devices count:', devRes.body?.devices?.length);
  const garmin = devRes.body?.devices?.find(d => d.provider === 'GARMIN_CONNECT');
  const coros = devRes.body?.devices?.find(d => d.provider === 'COROS');
  console.log('   Garmin status:', garmin?.name, '-', garmin?.connected ? 'CONNECTED' : 'DISCONNECTED');
  console.log('   Coros status:', coros?.name, '-', coros?.connected ? 'CONNECTED' : 'DISCONNECTED');
  if (devRes.status !== 200 || !garmin || !coros) {
    throw new Error('Connected Devices API verification failed');
  }
  console.log('   ✓ Connected Devices API: PASS\n');

  // 3. AC-050: Treadmill Run with Biometric HR Validation API
  console.log('3. Testing POST /api/activities/submit-treadmill...');
  const tmRes = await requestJson('http://localhost:3001/api/activities/submit-treadmill', {
    method: 'POST',
    body: {
      distanceKm: 6.0,
      movingTimeMin: 36,
      avgHeartRate: 152,
      avgCadence: 168
    }
  });
  console.log('   Status:', tmRes.status);
  console.log('   Sport Type:', tmRes.body?.sportType);
  console.log('   Credited Distance:', tmRes.body?.creditedDistanceKm, 'km');
  console.log('   Heart Rate Floor Check:', tmRes.body?.biometricValidation?.heartRateFloorPassed);
  console.log('   Verdict:', tmRes.body?.biometricValidation?.verdict);
  if (tmRes.status !== 200 || tmRes.body?.biometricValidation?.verdict !== 'VERIFIED_PHYSICAL_CARDIO') {
    throw new Error('Treadmill Validation API verification failed');
  }
  console.log('   ✓ Treadmill Validation API: PASS\n');

  // 4. Chrome CDP Screenshot Verification
  console.log('4. Launching Chrome to capture Connected Devices Modal...');
  const cdpPort = 9291;
  const tempProfile = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-runner-exp-'));

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

    console.log('   Navigating to http://localhost:3000...');
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

    // Open Connected Devices Modal
    console.log('   Opening Connected Devices Modal...');
    await evalCode(`openConnectedDevicesModal()`);
    await new Promise(r => setTimeout(r, 600));

    let res = await sendCmd('Page.captureScreenshot', { format: 'png' });
    let buffer = Buffer.from(res.data, 'base64');
    let outPath = path.join(ARTIFACT_DIR, 'screenshot_connected_wearable_devices_modal.png');
    fs.writeFileSync(outPath, buffer);
    console.log('   ✓ Saved screenshot to:', outPath);

    // Toggle Coros connection to test live UI reaction
    console.log('   Toggling Coros connection...');
    await evalCode(`toggleDevice('COROS')`);
    await new Promise(r => setTimeout(r, 600));

    res = await sendCmd('Page.captureScreenshot', { format: 'png' });
    buffer = Buffer.from(res.data, 'base64');
    outPath = path.join(ARTIFACT_DIR, 'screenshot_coros_connected_success.png');
    fs.writeFileSync(outPath, buffer);
    console.log('   ✓ Saved Coros Connected screenshot to:', outPath);

    ws.close();
  } finally {
    try {
      chromeProc.kill();
      fs.rmSync(tempProfile, { recursive: true, force: true });
    } catch (e) {}
  }

  console.log('\n=== ALL RUNNER EXPANSIONS VERIFIED AND CAPTURED SUCCESSFULLY! ===');
}

run().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
