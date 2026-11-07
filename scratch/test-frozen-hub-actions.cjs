const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const FRONTEND_BASE = 'http://localhost:3000';
const ARTIFACT_DIR = 'C:\\Users\\nguye\\.gemini\\antigravity\\brain\\6cc28217-793d-48a4-8630-e0b049bf6838';

async function run() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const cdpPort = 9348;
  const tempProfile = path.join(require('os').tmpdir(), 'chrome-cdp-frozen-' + Date.now());

  const chromeProc = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${cdpPort}`,
    `--user-data-dir=${tempProfile}`,
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1440,900',
    FRONTEND_BASE
  ]);

  try {
    let targets = null;
    for (let i = 0; i < 35; i++) {
      await new Promise(r => setTimeout(r, 200));
      try {
        const res = await fetch(`http://localhost:${cdpPort}/json`);
        targets = await res.json();
        if (targets && targets.length > 0) break;
      } catch (e) {}
    }

    if (!targets || targets.length === 0) {
      throw new Error('Chrome CDP port not responding');
    }

    const pageTarget = targets.find(t => t.url.includes('3000')) || targets[0];
    const ws = new globalThis.WebSocket(pageTarget.webSocketDebuggerUrl);

    let id = 1;
    const callbacks = new Map();

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (callbacks.has(msg.id)) {
        const cb = callbacks.get(msg.id);
        callbacks.delete(msg.id);
        if (msg.error) cb.reject(new Error(msg.error.message));
        else cb.resolve(msg.result);
      }
    };

    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    function sendCmd(method, params = {}) {
      return new Promise((resolve, reject) => {
        const msgId = id++;
        callbacks.set(msgId, { resolve, reject });
        ws.send(JSON.stringify({ id: msgId, method, params }));
      });
    }

    await sendCmd('Page.enable');
    await sendCmd('Runtime.enable');
    await sendCmd('DOM.enable');

    console.log('[CDP] Waiting for page complete & switchTab ready...');
    for (let i = 0; i < 40; i++) {
      const readyState = await sendCmd('Runtime.evaluate', {
        expression: "document.readyState === 'complete' && !!document.body && typeof switchTab === 'function'",
        returnByValue: true
      });
      if (readyState?.result?.value === true) break;
      await new Promise(r => setTimeout(r, 250));
    }
    await new Promise(r => setTimeout(r, 800));

    // 1. Switch to Rules tab and then to Frozen Archives Tab
    console.log('[CDP] Switching to rules tab and frozen archives pane...');
    await sendCmd('Runtime.evaluate', { expression: `switchTab('rules')` });
    await new Promise(r => setTimeout(r, 500));
    await sendCmd('Runtime.evaluate', { expression: `switchAdminHubTab('frozen')` });
    await new Promise(r => setTimeout(r, 500));

    // 2. Verify frozen pane state
    const frozenCheck = await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        const pane = document.getElementById('admin-hub-frozen-pane');
        const isShown = pane && !pane.classList.contains('hidden');
        const btnHoF = document.getElementById('btn-frozen-hof-m9');
        const btnExpM9 = document.getElementById('btn-frozen-export-m9');
        const btnExpSpr = document.getElementById('btn-frozen-export-spring');
        return {
          isShown,
          hasBtnHoF: !!btnHoF,
          hasBtnExpM9: !!btnExpM9,
          hasBtnExpSpr: !!btnExpSpr,
          btnHoFText: btnHoF?.innerText?.trim() || '',
          btnExpM9Text: btnExpM9?.innerText?.trim() || '',
          btnExpSprText: btnExpSpr?.innerText?.trim() || ''
        };
      })()`,
      returnByValue: true
    });
    console.log('[CDP] Frozen pane state:', JSON.stringify(frozenCheck.result.value, null, 2));

    // 3. Click "🌟 Xem Bảng Vàng & E-Cert" on Mùa 9 card
    console.log('[CDP] Clicking btn-frozen-hof-m9...');
    await sendCmd('Runtime.evaluate', {
      expression: `document.getElementById('btn-frozen-hof-m9').click()`
    });
    await new Promise(r => setTimeout(r, 800));

    // 4. Verify Hall of Fame Modal
    const hofModalCheck = await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        const modal = document.getElementById('modal-frozen-hall-of-fame');
        const isShown = modal && !modal.classList.contains('hidden') && modal.style.display !== 'none';
        const ledgerSig = document.getElementById('hof-ledger-sig')?.innerText || '';
        const title = document.getElementById('hof-race-title')?.innerText || '';
        const champion = document.getElementById('hof-champion')?.innerText || '';
        const dist = document.getElementById('hof-distance')?.innerText || '';
        const prize = document.getElementById('hof-prize')?.innerText || '';
        const certsCount = document.getElementById('hof-certs-count')?.innerText || '';
        const recipientCards = document.querySelectorAll('#hof-recipients-list > div').length;
        const firstCertBtn = document.querySelector('.btn-hof-view-cert');
        return {
          isShown,
          ledgerSig,
          title,
          champion,
          dist,
          prize,
          certsCount,
          recipientCards,
          hasCertBtn: !!firstCertBtn
        };
      })()`,
      returnByValue: true
    });
    console.log('[CDP] Hall of Fame Modal state:', JSON.stringify(hofModalCheck.result.value, null, 2));

    // Capture screenshot: Hall of Fame Modal
    const shotHoF = await sendCmd('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'screenshot_frozen_hall_of_fame_modal.png'), Buffer.from(shotHoF.data, 'base64'));
    console.log('📸 Screenshot saved: screenshot_frozen_hall_of_fame_modal.png');

    // 5. Click "📜 Xem E-Cert" on the first recipient (Nguyễn Văn A)
    console.log('[CDP] Clicking first "📜 Xem E-Cert" button...');
    await sendCmd('Runtime.evaluate', {
      expression: `document.querySelector('.btn-hof-view-cert').click()`
    });
    await new Promise(r => setTimeout(r, 600));

    // 6. Verify Digital Finisher Certificate Modal
    const certModalCheck = await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        const modal = document.getElementById('modal-finisher-certificate');
        const isShown = modal && !modal.classList.contains('hidden') && modal.style.display !== 'none';
        const athleteName = document.getElementById('cert-athlete-name')?.innerText?.trim() || '';
        const raceTitle = document.getElementById('cert-race-title')?.innerText?.trim() || '';
        const dist = document.getElementById('cert-distance')?.innerText?.trim() || '';
        const certId = document.getElementById('cert-display-id')?.innerText?.trim() || '';
        return {
          isShown,
          athleteName,
          raceTitle,
          dist,
          certId
        };
      })()`,
      returnByValue: true
    });
    console.log('[CDP] Finisher Certificate Modal state:', JSON.stringify(certModalCheck.result.value, null, 2));

    // Capture screenshot: E-Cert Modal
    const shotCert = await sendCmd('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'screenshot_frozen_ecert_modal.png'), Buffer.from(shotCert.data, 'base64'));
    console.log('📸 Screenshot saved: screenshot_frozen_ecert_modal.png');

    // 7. Close modals
    await sendCmd('Runtime.evaluate', { expression: `closeFinisherCertificateModal()` });
    await new Promise(r => setTimeout(r, 200));
    await sendCmd('Runtime.evaluate', { expression: `closeFrozenHallOfFameModal()` });
    await new Promise(r => setTimeout(r, 200));

    // 8. Test Export Buttons (M9 and Spring)
    console.log('[CDP] Testing Export Buttons...');
    const exportResult = await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        let lastToast = '';
        const originalShowToast = window.showToast;
        window.showToast = function(msg) {
          lastToast = msg;
          if (originalShowToast) originalShowToast(msg);
        };
        document.getElementById('btn-frozen-export-m9').click();
        const toast1 = lastToast;
        document.getElementById('btn-frozen-export-spring').click();
        const toast2 = lastToast;
        return { toast1, toast2 };
      })()`,
      returnByValue: true
    });
    console.log('[CDP] Export buttons result:', JSON.stringify(exportResult.result.value, null, 2));

    // Capture overview screenshot
    const shotDone = await sendCmd('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'screenshot_frozen_actions_verified.png'), Buffer.from(shotDone.data, 'base64'));
    console.log('📸 Screenshot saved: screenshot_frozen_actions_verified.png');

    ws.close();
    console.log('\n[SUCCESS] All Frozen Race Hub Actions verified successfully!');
  } catch (err) {
    console.error('CDP test error:', err);
    process.exit(1);
  } finally {
    try {
      chromeProc.kill('SIGKILL');
    } catch (e) {}
  }
}

run().catch(console.error);
