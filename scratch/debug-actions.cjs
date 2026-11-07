const { spawn } = require('child_process');
const path = require('path');

async function test() {
  const cdpPort = 9349;
  const tempProfile = path.join(require('os').tmpdir(), 'chrome-cdp-debug-' + Date.now());
  const chromeProc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    `--remote-debugging-port=${cdpPort}`,
    `--user-data-dir=${tempProfile}`,
    '--disable-gpu',
    '--no-sandbox',
    'http://localhost:3000'
  ]);

  await new Promise(r => setTimeout(r, 1500));
  const targets = await (await fetch(`http://localhost:${cdpPort}/json`)).json();
  const pageTarget = targets.find(t => t.url.includes('3000')) || targets[0];
  const ws = new globalThis.WebSocket(pageTarget.webSocketDebuggerUrl);

  let id = 1;
  const cbs = new Map();
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (cbs.has(m.id)) cbs.get(m.id)(m);
  };
  await new Promise(r => ws.onopen = r);

  function cmd(method, params = {}) {
    return new Promise(res => {
      const mid = id++;
      cbs.set(mid, res);
      ws.send(JSON.stringify({ id: mid, method, params }));
    });
  }

  await cmd('Runtime.enable');
  await new Promise(r => setTimeout(r, 1000));

  const r1 = await cmd('Runtime.evaluate', { expression: 'switchTab("rules")' });
  console.log('r1 (switchTab rules):', r1.result);

  const r2 = await cmd('Runtime.evaluate', { expression: 'switchAdminHubTab("frozen")' });
  console.log('r2 (switchAdminHubTab frozen):', r2.result);

  const r3 = await cmd('Runtime.evaluate', {
    expression: 'document.getElementById("admin-hub-frozen-pane").className',
    returnByValue: true
  });
  console.log('r3 (admin-hub-frozen-pane className):', r3.result);

  const r4 = await cmd('Runtime.evaluate', {
    expression: 'openRaceLandingModal("mua-9-thu-thach-mua-he-ruc-lua-2026")',
    awaitPromise: true
  });
  console.log('r4 (openRaceLandingModal):', r4.result);

  await new Promise(r => setTimeout(r, 1000));

  const r5 = await cmd('Runtime.evaluate', {
    expression: `(() => {
      const m = document.getElementById("modal-frozen-hall-of-fame");
      return {
        className: m ? m.className : null,
        display: m ? m.style.display : null,
        sig: document.getElementById("hof-ledger-sig")?.innerText,
        cards: document.querySelectorAll("#hof-recipients-list > div").length
      };
    })()`,
    returnByValue: true
  });
  console.log('r5 (modal-frozen-hall-of-fame state):', r5.result);

  ws.close();
  chromeProc.kill('SIGKILL');
}

test().catch(console.error);

