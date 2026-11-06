const fs = require('fs');
const path = require('path');
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
  console.log('  VERIFYING 5,000 SYSTEM DATASET APIS & LIVE INTEGRATION');
  console.log('================================================================\n');

  // 1. GET /api/system/dataset-stats
  console.log('1. Testing GET /api/system/dataset-stats...');
  const statsRes = await requestJson('http://localhost:3001/api/system/dataset-stats');
  console.log('   Status:', statsRes.status);
  console.log('   Total Activities:', statsRes.body?.stats?.totalActivities);
  console.log('   Total Athletes:', statsRes.body?.stats?.totalUsers);
  console.log('   Total Ledgers:', statsRes.body?.stats?.totalLedgers);
  console.log('   Rule Engine Throughput:', statsRes.body?.stats?.ruleEngineThroughput);
  if (statsRes.status !== 200 || statsRes.body?.stats?.totalActivities !== 5000) {
    throw new Error('Failed to verify dataset stats API');
  }
  console.log('   ✓ GET /api/system/dataset-stats: PASS\n');

  // 2. POST /api/system/seed-from-dataset
  console.log('2. Testing POST /api/system/seed-from-dataset...');
  const seedRes = await requestJson('http://localhost:3001/api/system/seed-from-dataset', { method: 'POST' });
  console.log('   Status:', seedRes.status);
  console.log('   Message:', seedRes.body?.message);
  console.log('   Seeded Activities:', seedRes.body?.seededActivities);
  console.log('   Seeded Users:', seedRes.body?.seededUsers);
  console.log('   Total Records:', seedRes.body?.totalRecords);
  if (seedRes.status !== 200 || seedRes.body?.seededActivities !== 5000) {
    throw new Error('Failed to verify seed-from-dataset API');
  }
  console.log('   ✓ POST /api/system/seed-from-dataset: PASS\n');

  // 3. GET /api/activities/mass-feed
  console.log('3. Testing GET /api/activities/mass-feed...');
  const feedRes = await requestJson('http://localhost:3001/api/activities/mass-feed');
  console.log('   Status:', feedRes.status);
  console.log('   Total Feed Items Available:', feedRes.body?.total);
  console.log('   Page Items Returned:', feedRes.body?.items?.length);
  console.log('   First Activity:', feedRes.body?.items?.[0]?.id, '-', feedRes.body?.items?.[0]?.title, `(${feedRes.body?.items?.[0]?.distanceKm} km)`);
  if (feedRes.status !== 200 || feedRes.body?.total !== 5000) {
    throw new Error('Failed to verify mass-feed API');
  }
  console.log('   ✓ GET /api/activities/mass-feed: PASS\n');

  // 4. Chrome CDP Screenshot Verification
  console.log('4. Launching Chrome to capture 5,000 Dataset System Modal...');
  const cdpPort = 9259;
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

    // Trigger open5000DatasetModal
    console.log('   Opening 5,000 Dataset Stats Modal...');
    await evalCode(`open5000DatasetModal()`);
    await new Promise(r => setTimeout(r, 700));

    const res = await sendCmd('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    const outPath = path.join(ARTIFACT_DIR, 'screenshot_5000_dataset_system_modal.png');
    fs.writeFileSync(outPath, buffer);
    console.log('   ✓ Saved screenshot to:', outPath);

    ws.close();
  } finally {
    try {
      chromeProc.kill();
    } catch (e) {}
  }

  console.log('\n=== ALL 5,000 DATASET SYSTEM VERIFICATIONS COMPLETED SUCCESSFULLY! ===');
}

run().catch(err => {
  console.error('Error during verification:', err);
  process.exit(1);
});
