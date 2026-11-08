const { spawn } = require('child_process');
const path = require('path');

async function test() {
  const cdpPort = 9362;
  const tempProfile = path.join(require('os').tmpdir(), 'test-nav-' + Date.now());
  const proc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    `--remote-debugging-port=${cdpPort}`,
    `--user-data-dir=${tempProfile}`,
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 1000));
  const res = await fetch(`http://localhost:${cdpPort}/json`);
  const targets = await res.json();
  const ws = new globalThis.WebSocket(targets[0].webSocketDebuggerUrl);

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

  await new Promise(r => ws.onopen = r);
  function sendCmd(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = id++;
      callbacks.set(msgId, { resolve, reject });
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  await sendCmd('Page.enable');
  await sendCmd('Runtime.enable');

  console.log('Navigating to http://localhost:3000...');
  await sendCmd('Page.navigate', { url: 'http://localhost:3000' });

  for (let i = 0; i < 40; i++) {
    const readyState = await sendCmd('Runtime.evaluate', {
      expression: "document.readyState === 'complete' && !!document.body && typeof switchTab === 'function'",
      returnByValue: true
    });
    console.log(`Poll ${i}: readyState =`, readyState?.result?.value);
    if (readyState?.result?.value === true) break;
    await new Promise(r => setTimeout(r, 300));
  }

  const check = await sendCmd('Runtime.evaluate', {
    expression: "({ hasSwitchTab: typeof switchTab, hasSetTheme: typeof setAppTheme })",
    returnByValue: true
  });
  console.log('Final check:', check.result.value);

  proc.kill();
  process.exit(0);
}

test();

