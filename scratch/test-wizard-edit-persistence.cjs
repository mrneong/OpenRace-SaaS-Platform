/**
 * E2E CDP Automated Verification: Race Wizard Edit & Persistence
 * AC-RACE-WIZARD-EDIT-01: Auto Pre-populate Wizard from existing race setup config
 * AC-RACE-WIZARD-EDIT-02: Backend PUT /api/races/:id/setup-config & Store Sync
 * AC-RACE-WIZARD-EDIT-03: Real-time UI reflection & DOM card update in Admin Race Hub
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:3001';
const FRONTEND_BASE = 'http://localhost:3000';
const ARTIFACT_DIR = 'C:\\Users\\nguye\\.gemini\\antigravity\\brain\\6cc28217-793d-48a4-8630-e0b049bf6838';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`  ✕ FAIL: ${message}`);
  }
}

async function runTest() {
  console.log('======================================================================');
  console.log('>>> [1/2] VERIFYING REST API ENDPOINTS (GET & PUT /api/races/:id/setup-config)');
  console.log('======================================================================');

  // 1. GET initial race config
  const getRes = await fetch(`${API_BASE}/api/races/race-trail-bavi/setup-config`);
  assert(getRes.ok, 'GET /api/races/race-trail-bavi/setup-config returns HTTP 200');
  const initialConfig = await getRes.json();
  assert(initialConfig && initialConfig.id === 'race-trail-bavi', 'Initial config has correct id race-trail-bavi');
  console.log(`  ℹ Initial race name: "${initialConfig.name}"`);

  // 2. PUT update race config
  const testNewName = 'SARC TRAIL CHALLENGE BA VÌ 2026 - MỞ RỘNG (TEST PERSIST)';
  const putRes = await fetch(`${API_BASE}/api/races/race-trail-bavi/setup-config`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: testNewName,
      slug: 'sarc-trail-challenge-ba-vi-2026-v2',
      bannerVisuals: {
        slogan: 'Khám phá thiên nhiên - Bứt phá giới hạn Ba Vì'
      },
      raceWindow: {
        startDate: '2026-12-05',
        endDate: '2026-12-25',
        isLive: false
      }
    })
  });
  assert(putRes.ok, 'PUT /api/races/race-trail-bavi/setup-config returns HTTP 200');
  const putData = await putRes.json();
  assert(putData.success === true, 'PUT response reports success: true');
  assert(putData.data?.name === testNewName, 'PUT response reflects updated name');

  // 3. Verify GET returns updated values
  const getRes2 = await fetch(`${API_BASE}/api/races/race-trail-bavi/setup-config`);
  const updatedConfig = await getRes2.json();
  assert(updatedConfig.name === testNewName, 'GET confirms persisted updated name');
  assert(updatedConfig.bannerVisuals?.slogan === 'Khám phá thiên nhiên - Bứt phá giới hạn Ba Vì', 'GET confirms persisted slogan');

  // 4. Verify Admin Race Hub endpoint synchronizes updated values
  const hubRes = await fetch(`${API_BASE}/api/races/admin/hub`);
  const hubData = await hubRes.json();
  const hubItem = hubData.activeAndUpcoming?.find(r => r.id === 'race-trail-bavi');
  assert(!!hubItem, 'Race race-trail-bavi found in Admin Race Hub active list');
  assert(hubItem.name === testNewName, 'Admin Race Hub displays updated name');
  assert(hubItem.slug === 'sarc-trail-challenge-ba-vi-2026-v2', 'Admin Race Hub displays updated slug');

  console.log('\n======================================================================');
  console.log('>>> [2/2] VERIFYING UI INTERACTION VIA HEADLESS CHROME CDP (PORT 3000)');
  console.log('======================================================================');

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const cdpPort = 9345;
  const tempProfile = path.join(require('os').tmpdir(), 'chrome-cdp-wizard-' + Date.now());

  const chromeProc = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${cdpPort}`,
    `--user-data-dir=${tempProfile}`,
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1440,900',
    `${FRONTEND_BASE}`
  ]);

  try {
    let targets = null;
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 200));
      try {
        const res = await fetch(`http://localhost:${cdpPort}/json`);
        targets = await res.json();
        if (targets && targets.length > 0) break;
      } catch (e) { }
    }

    if (!targets || targets.length === 0) {
      throw new Error('Chrome CDP port not responding');
    }

    const pageTarget = targets.find(t => t.url.includes('3000')) || targets[0];
    const ws = new globalThis.WebSocket(pageTarget.webSocketDebuggerUrl);

    let msgId = 1;
    const callbacks = new Map();

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id && callbacks.has(data.id)) {
        const { resolve, reject } = callbacks.get(data.id);
        callbacks.delete(data.id);
        if (data.error) reject(data.error);
        else resolve(data.result);
      }
    };

    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    function sendCmd(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = msgId++;
        callbacks.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await sendCmd('Page.enable');
    await sendCmd('Runtime.enable');
    await sendCmd('DOM.enable');

    console.log('  ✓ Connected to Chrome CDP session');

    await sendCmd('Page.navigate', { url: FRONTEND_BASE });

    // Wait until document.readyState === 'complete' and switchTab is defined
    for (let i = 0; i < 40; i++) {
      const readyState = await sendCmd('Runtime.evaluate', {
        expression: "document.readyState === 'complete' && !!document.body && typeof switchTab === 'function'",
        returnByValue: true
      });
      if (readyState?.result?.value === true) break;
      await new Promise(r => setTimeout(r, 200));
    }
    await new Promise(r => setTimeout(r, 600));

    // Evaluate: Navigate to Tab rules & Section 7.1 (Tournament Hub)
    await sendCmd('Runtime.evaluate', {
      expression: `
        if (typeof switchTab === 'function') switchTab('rules');
        if (typeof showSubScreen === 'function') showSubScreen('rules', 'section-7-1');
      `
    });

    await new Promise(r => setTimeout(r, 1000));

    // Verify race card 2 exists in DOM
    const cardCheck = await sendCmd('Runtime.evaluate', {
      expression: `
        const card = document.getElementById('admin-hub-card-race-trail-bavi') ||
                     document.querySelector('[data-race-card-id="race-trail-bavi"]');
        card ? card.querySelector('.race-card-title')?.innerText : 'NOT_FOUND';
      `,
      returnByValue: true
    });
    console.log('  ℹ Current DOM race card title:', cardCheck.result?.value);
    assert(cardCheck.result?.value !== 'NOT_FOUND', 'Race card 2 (race-trail-bavi) found in DOM with id and title element');

    // Trigger openRaceWizardModal('race-trail-bavi')
    await sendCmd('Runtime.evaluate', {
      expression: `openRaceWizardModal('race-trail-bavi');`,
      awaitPromise: true
    });

    await new Promise(r => setTimeout(r, 1200));

    // Verify modal is visible and pre-populated
    const modalCheck = await sendCmd('Runtime.evaluate', {
      expression: `
        const modal = document.getElementById('modal-race-wizard');
        const isVisible = modal && !modal.classList.contains('hidden');
        const headerTitle = document.getElementById('wz-modal-header-title')?.innerText || '';
        const nameVal = document.getElementById('wz-race-name')?.value || '';
        const submitBtnText = document.getElementById('wz-btn-submit')?.innerText || '';
        ({ isVisible, headerTitle, nameVal, submitBtnText });
      `,
      returnByValue: true
    });

    const modalState = modalCheck.result?.value;
    assert(modalState.isVisible === true, 'Modal is open and visible');
    assert(modalState.headerTitle.includes('race-trail-bavi'), 'Modal header displays race ID in edit mode');
    assert(modalState.nameVal === testNewName, 'Input #wz-race-name is pre-populated with existing race name');
    console.log(`  ✓ Modal Prepopulated: Name="${modalState.nameVal}" | Title="${modalState.headerTitle}"`);

    // Capture Screenshot 1: Wizard Modal Pre-populated
    const shot1 = await sendCmd('Page.captureScreenshot', { format: 'png' });
    const shot1Path = path.join(ARTIFACT_DIR, 'screenshot_wizard_edit_prepopulated.png');
    fs.writeFileSync(shot1Path, Buffer.from(shot1.data, 'base64'));
    console.log(`  📷 Saved screenshot: ${shot1Path}`);

    // Modify name in input and submit
    const finalNewName = 'SARC TRAIL CHALLENGE BA VÌ 2026 - ĐÃ LƯU THÀNH CÔNG';
    const submitRes = await sendCmd('Runtime.evaluate', {
      expression: `(async () => {
        try {
          document.getElementById('wz-race-name').value = '${finalNewName}';
          document.getElementById('wz-race-slug').value = 'sarc-trail-challenge-ba-vi-2026-saved';
          await submitRaceWizard();
          return { submitted: true };
        } catch(e) {
          return { error: e.message, stack: e.stack };
        }
      })()`,
      awaitPromise: true,
      returnByValue: true
    });
    console.log('  ℹ Submit evaluation result:', JSON.stringify(submitRes));

    await new Promise(r => setTimeout(r, 1500));

    // Verify modal closed and DOM updated
    const afterSubmit = await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        const modal = document.getElementById('modal-race-wizard');
        const isHidden = modal && modal.classList.contains('hidden');
        const card = document.getElementById('admin-hub-card-race-trail-bavi') ||
                     document.querySelector('[data-race-card-id="race-trail-bavi"]');
        const titleText = card ? card.querySelector('.race-card-title')?.innerText : '';
        const slugText = card ? card.querySelector('.race-card-slug')?.innerText : '';
        return { isHidden, titleText, slugText };
      })()`,
      returnByValue: true
    });
    console.log('  ℹ After submit DOM check:', JSON.stringify(afterSubmit));

    const finalState = afterSubmit.result?.value;
    assert(finalState && finalState.isHidden === true, 'Modal automatically closed after saving');
    assert(finalState && finalState.titleText === finalNewName, 'DOM Race Card Title updated in real-time to new name');
    assert(finalState && finalState.slugText.includes('sarc-trail-challenge-ba-vi-2026-saved'), 'DOM Race Card Slug updated in real-time');
    console.log(`  ✓ DOM Card Synchronized: Title="${finalState?.titleText}" | Slug="${finalState?.slugText}"`);

    // Capture Screenshot 2: Real-time sync in Admin Race Hub
    const shot2 = await sendCmd('Page.captureScreenshot', { format: 'png' });
    const shot2Path = path.join(ARTIFACT_DIR, 'screenshot_wizard_edit_saved_hub_sync.png');
    fs.writeFileSync(shot2Path, Buffer.from(shot2.data, 'base64'));
    console.log(`  📷 Saved screenshot: ${shot2Path}`);

    ws.close();
  } finally {
    chromeProc.kill();
  }

  console.log('\n======================================================================');
  console.log(`E2E AUTOMATION TEST SUMMARY: Total: ${totalTests} | Passed: ${passedTests} | Failed: ${failedTests}`);
  console.log('======================================================================');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTest().catch(err => {
  console.error('Fatal error during E2E test:', err);
  process.exit(1);
});
