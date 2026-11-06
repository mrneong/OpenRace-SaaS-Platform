const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');

const ARTIFACT_DIR = 'C:/Users/nguye/.gemini/antigravity/brain/6cc28217-793d-48a4-8630-e0b049bf6838';

function requestJson(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const postData = options.body ? JSON.stringify(options.body) : null;
    const req = http.request({
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {}),
        ...options.headers
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

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

async function run() {
  console.log('=== VERIFYING ENTERPRISE-GRADE API ENDPOINTS ===');
  
  // 1. Strava Sync Queue
  const queueRes = await requestJson('http://localhost:3001/api/me/strava-sync-queue', {
    method: 'POST',
    body: { athleteId: 'ath-001' }
  });
  console.log('1. Strava Sync Queue response:', queueRes.status, queueRes.body);

  // 2. Contributions Heatmap
  const heatmapRes = await requestJson('http://localhost:3001/api/me/contributions-heatmap?athleteId=ath-001');
  console.log('2. Heatmap response:', heatmapRes.status, 'Total Days:', heatmapRes.body?.days?.length, 'Streak:', heatmapRes.body?.currentStreak);

  // 3. Dynamic VietQR
  const qrRes = await requestJson('http://localhost:3001/api/me/dynamic-vietqr?athleteId=ath-001&amount=100000');
  console.log('3. Dynamic VietQR response:', qrRes.status, 'Memo:', qrRes.body?.memo, 'Bank:', qrRes.body?.bankName);

  // 4. Cache & Queue Telemetry
  const metricsRes = await requestJson('http://localhost:3001/api/system/cache-metrics');
  console.log('4. Cache Metrics response:', metricsRes.status, metricsRes.body);

  // 5. Multi-Tier Appeal
  const appealRes = await requestJson('http://localhost:3001/api/appeals/multi-tier', {
    method: 'POST',
    body: {
      raceId: 'race-001',
      userId: 'ath-001',
      activityId: 'ACT_000073',
      reason: 'Đồng hồ Garmin bị đứt quãng tín hiệu GPS trong hầm Thủ Thiêm, quãng đường thực tế 5.2km',
      evidenceUrl: 'https://images.unsplash.com/photo-1510519138195-068d823c14a1?auto=format&fit=crop&w=800&q=80'
    }
  });
  console.log('5. Multi-tier Appeal response:', appealRes.status, appealRes.body?.appeal?.id, 'Status:', appealRes.body?.appeal?.status);

  // 6. Captain Endorsement
  if (appealRes.body?.appeal?.id) {
    const endorseRes = await requestJson('http://localhost:3001/api/appeals/captain-endorse', {
      method: 'POST',
      body: {
        appealId: appealRes.body.appeal.id,
        captainId: 'captain-phoenix',
        endorsementNote: 'Đội trưởng xác nhận VĐV hoàn thành cung chạy cùng nhóm, đề xuất Admin duyệt.'
      }
    });
    console.log('6. Captain Endorsement response:', endorseRes.status, endorseRes.body?.appeal?.status);
  }

  // 7. Bank Webhook Settle
  const webhookRes = await requestJson('http://localhost:3001/api/finance/bank-webhook', {
    method: 'POST',
    body: {
      transactionId: 'TXN_' + Date.now(),
      amount: 100000,
      memo: qrRes.body?.memo || 'SARC_NGUYENVANA_100K_M10',
      accountNumber: '19036789999999'
    }
  });
  console.log('7. Bank Webhook response:', webhookRes.status, webhookRes.body?.message);

  console.log('\n=== LAUNCHING CHROME CDP FOR SCREENSHOTS ===');
  const cdpPort = 9233;
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
      console.log('Saved screenshot:', outPath);
    }

    // 1. Dashboard Priority Bar and Heatmap
    console.log('Capturing Dashboard Priority Bar and Heatmap...');
    await evalCode(`
      if (typeof dismissV21Banner === 'function') dismissV21Banner();
      window.scrollTo(0, 0);
    `);
    await new Promise(r => setTimeout(r, 600));
    await captureScreenshot('screenshot_dashboard_priority_bar_and_heatmap.png');

    // 2. FAB Speed Dial Menu
    console.log('Capturing FAB Speed Dial Menu...');
    await evalCode(`
      if (typeof toggleFabMenu === 'function') toggleFabMenu(true);
    `);
    await new Promise(r => setTimeout(r, 600));
    await captureScreenshot('screenshot_fab_expanded_quick_actions.png');

    // Close FAB
    await evalCode(`
      if (typeof toggleFabMenu === 'function') toggleFabMenu(false);
    `);

    // 3. Multi-tier Dispute Modal
    console.log('Opening Multi-tier Dispute Modal...');
    await evalCode(`
      if (typeof openMultiTierAppealModal === 'function') {
        openMultiTierAppealModal('ACT_000073', '2.8 km (Thiếu cự ly tối thiểu)');
      }
    `);
    await new Promise(r => setTimeout(r, 600));
    await captureScreenshot('screenshot_multitier_dispute_modal.png');

    // Close modal
    await evalCode(`
      const modal = document.getElementById('modal-appeal-multitier');
      if (modal) modal.classList.add('hidden');
    `);

    // 4. Dynamic VietQR Modal & Bank Webhook Settlement
    console.log('Opening Dynamic VietQR Modal...');
    await evalCode(`
      if (typeof openDynamicVietQrModal === 'function') {
        openDynamicVietQrModal(100000);
      }
    `);
    await new Promise(r => setTimeout(r, 600));

    // Simulate Bank Payment Webhook in Modal
    console.log('Simulating Bank Payment Webhook in Modal...');
    await evalCode(`
      if (typeof simulateBankWebhookPayment === 'function') {
        simulateBankWebhookPayment();
      }
    `);
    await new Promise(r => setTimeout(r, 1000));
    await captureScreenshot('screenshot_dynamic_vietqr_auto_settlement.png');

    ws.close();
    chromeProc.kill();
    console.log('=== ALL ENTERPRISE VERIFICATIONS AND SCREENSHOTS COMPLETE ===');
  } catch (err) {
    chromeProc.kill();
    throw err;
  }
}

run().catch(err => {
  console.error('Error running verification:', err);
  process.exit(1);
});
