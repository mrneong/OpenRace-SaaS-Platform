const { spawn } = require('child_process');
const path = require('path');

async function run() {
  const cdpPort = 9348;
  const tempProfile = path.join(require('os').tmpdir(), 'chrome-err-' + Date.now());

  const chromeProc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    `--remote-debugging-port=${cdpPort}`,
    `--user-data-dir=${tempProfile}`,
    '--disable-gpu',
    '--no-sandbox'
  ]);

  try {
    let targets = null;
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 200));
      try {
        const res = await fetch(`http://localhost:${cdpPort}/json`);
        targets = await res.json();
        if (targets?.length) break;
      } catch (e) {}
    }

    const ws = new globalThis.WebSocket(targets[0].webSocketDebuggerUrl);
    let msgId = 1;
    const pending = new Map();

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.method === 'Runtime.exceptionThrown') {
          console.log('>>> RUNTIME EXCEPTION:', JSON.stringify(msg.params.exceptionDetails, null, 2));
        } else if (msg.method === 'Log.entryAdded') {
          console.log('>>> LOG ENTRY:', msg.params.entry);
        } else if (msg.id && pending.has(msg.id)) {
          const { resolve, reject } = pending.get(msg.id);
          pending.delete(msg.id);
          if (msg.error) reject(new Error(msg.error.message));
          else resolve(msg.result);
        }
      } catch (e) {}
    };

    function sendCmd(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = msgId++;
        pending.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await new Promise(r => ws.onopen = r);

    await sendCmd('Page.enable');
    await sendCmd('Runtime.enable');
    await sendCmd('Log.enable');

    console.log('Navigating to http://localhost:3000...');
    await sendCmd('Page.navigate', { url: 'http://localhost:3000' });

    await new Promise(r => setTimeout(r, 3000));
  } finally {
    try { chromeProc.kill('SIGKILL'); } catch (e) {}
  }
}

run();
