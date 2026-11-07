const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = 'C:\\Users\\nguye\\.gemini\\antigravity\\brain\\6cc28217-793d-48a4-8630-e0b049bf6838';

function getChromePath() {
  const paths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe'
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) return p;
  }
  return 'chrome';
}

async function run() {
  console.log('>>> Starting CDP Verification for Scoring Plan Selection & Parameter Sync...');
  const chromePath = getChromePath();
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9333',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    '--user-data-dir=' + path.join(__dirname, 'chrome-profile-' + Date.now())
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const targets = await new Promise((resolve, reject) => {
      http.get('http://127.0.0.1:9333/json', res => {
        let raw = '';
        res.on('data', chunk => raw += chunk);
        res.on('end', () => resolve(JSON.parse(raw)));
      }).on('error', reject);
    });

    const pageTarget = targets.find(t => t.type === 'page');
    if (!pageTarget) throw new Error('No page target found');

    const ws = new globalThis.WebSocket(pageTarget.webSocketDebuggerUrl);
    let msgId = 1;
    const pending = new Map();
    const eventHandlers = new Map();

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.id && pending.has(msg.id)) {
          const { resolve, reject } = pending.get(msg.id);
          pending.delete(msg.id);
          if (msg.error) reject(new Error(msg.error.message));
          else resolve(msg.result);
        } else if (msg.method && eventHandlers.has(msg.method)) {
          eventHandlers.get(msg.method)(msg.params);
        }
      } catch (e) {
        console.error('WS parse error:', e);
      }
    };

    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    function sendCDP(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = msgId++;
        pending.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await sendCDP('Page.enable');
    await sendCDP('Runtime.enable');

    const loadPromise = new Promise(resolve => {
      eventHandlers.set('Page.loadEventFired', resolve);
    });

    await sendCDP('Page.navigate', { url: 'http://localhost:3000' });
    await loadPromise;
    await new Promise(r => setTimeout(r, 1000));

    // Open race wizard and navigate to step 3
    const step3Init = await sendCDP('Runtime.evaluate', {
      expression: `
        (() => {
          if (typeof openRaceWizardModal === 'function') {
            openRaceWizardModal();
          } else {
            const modal = document.getElementById('modal-race-wizard');
            if (modal) modal.classList.remove('hidden');
          }
          if (typeof setWizardStep === 'function') {
            setWizardStep(3);
          } else {
            const s1 = document.getElementById('wz-step-pane-1');
            const s3 = document.getElementById('wz-step-pane-3');
            if (s1) s1.classList.add('hidden');
            if (s3) s3.classList.remove('hidden');
          }
          return {
            modalVisible: !document.getElementById('modal-race-wizard')?.classList.contains('hidden'),
            step3Visible: !document.getElementById('wz-step-pane-3')?.classList.contains('hidden'),
            cardAPresent: !!document.getElementById('wz-card-scoring-a'),
            cardBPresent: !!document.getElementById('wz-card-scoring-b'),
            fRoad: document.getElementById('wz-factor-road')?.value,
            fTrail: document.getElementById('wz-factor-trail')?.value,
            fTreadmill: document.getElementById('wz-factor-treadmill')?.value,
            fTrack: document.getElementById('wz-factor-track')?.value
          };
        })()
      `,
      returnByValue: true
    });

    console.log('Step 3 init state:', step3Init.result.value);

    // 1. Click Card A (DISTANCE_BASED)
    console.log('\n--- Testing Selection of Phương án A (Theo Cự Ly Thực Tế / Không thay đổi thông số) ---');
    const resA = await sendCDP('Runtime.evaluate', {
      expression: `
        (() => {
          selectScoringMethod('DISTANCE_BASED');
          const cardA = document.getElementById('wz-card-scoring-a');
          const cardB = document.getElementById('wz-card-scoring-b');
          return {
            radioAChecked: document.getElementById('wz-scoring-radio-a')?.checked,
            cardAActive: cardA?.className.includes('border-[#FF5B26]'),
            cardBInactive: !cardB?.className.includes('border-[#FF5B26]'),
            fRoad: document.getElementById('wz-factor-road')?.value,
            fTrail: document.getElementById('wz-factor-trail')?.value,
            fTreadmill: document.getElementById('wz-factor-treadmill')?.value,
            fTrack: document.getElementById('wz-factor-track')?.value,
            trailToggle: document.getElementById('wz-tournament-trail-toggle')?.checked
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Phương án A selected result:', resA.result.value);

    const shotA = await sendCDP('Page.captureScreenshot');
    fs.writeFileSync(path.join(ARTIFACTS_DIR, 'screenshot_scoring_method_plan_a.png'), Buffer.from(shotA.data, 'base64'));
    console.log('📸 Screenshot saved: screenshot_scoring_method_plan_a.png');

    // 2. Click Card B (PACE_WEIGHTED)
    console.log('\n--- Testing Selection of Phương án B (Hệ Số Pace & Thưởng Dốc) ---');
    const resB = await sendCDP('Runtime.evaluate', {
      expression: `
        (() => {
          selectScoringMethod('PACE_WEIGHTED');
          const cardA = document.getElementById('wz-card-scoring-a');
          const cardB = document.getElementById('wz-card-scoring-b');
          return {
            radioBChecked: document.getElementById('wz-scoring-radio-b')?.checked,
            cardAInactive: !cardA?.className.includes('border-[#FF5B26]'),
            cardBActive: cardB?.className.includes('border-[#FF5B26]'),
            fRoad: document.getElementById('wz-factor-road')?.value,
            fTrail: document.getElementById('wz-factor-trail')?.value,
            fTreadmill: document.getElementById('wz-factor-treadmill')?.value,
            fTrack: document.getElementById('wz-factor-track')?.value,
            trailToggle: document.getElementById('wz-tournament-trail-toggle')?.checked
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Phương án B selected result:', resB.result.value);

    const shotB = await sendCDP('Page.captureScreenshot');
    fs.writeFileSync(path.join(ARTIFACTS_DIR, 'screenshot_scoring_method_plan_b.png'), Buffer.from(shotB.data, 'base64'));
    console.log('📸 Screenshot saved: screenshot_scoring_method_plan_b.png');

    // 3. Test Khôi Phục Mặc Định
    console.log('\n--- Testing Khôi Phục Mặc Định (applyCatalogScoringPreset) ---');
    const resReset = await sendCDP('Runtime.evaluate', {
      expression: `
        (() => {
          // Dirtify
          document.getElementById('wz-factor-road').value = '9.9';
          document.getElementById('wz-factor-trail').value = '8.8';
          // Click reset
          applyCatalogScoringPreset();
          return {
            radioBChecked: document.getElementById('wz-scoring-radio-b')?.checked,
            fRoad: document.getElementById('wz-factor-road')?.value,
            fTrail: document.getElementById('wz-factor-trail')?.value,
            fTreadmill: document.getElementById('wz-factor-treadmill')?.value,
            fTrack: document.getElementById('wz-factor-track')?.value,
            trailToggle: document.getElementById('wz-tournament-trail-toggle')?.checked
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Reset default result:', resReset.result.value);

    const shotReset = await sendCDP('Page.captureScreenshot');
    fs.writeFileSync(path.join(ARTIFACTS_DIR, 'screenshot_scoring_method_reset_default.png'), Buffer.from(shotReset.data, 'base64'));
    console.log('📸 Screenshot saved: screenshot_scoring_method_reset_default.png');

    ws.close();
    console.log('\n[✓] CDP Verification completed successfully!');
  } finally {
    chrome.kill();
  }
}

run().catch(err => {
  console.error('CDP test failed:', err);
  process.exit(1);
});
