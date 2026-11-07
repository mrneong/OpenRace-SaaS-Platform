const { spawn } = require('child_process');
const path = require('path');

async function test() {
  const cdpPort = 9356;
  const tempProfile = path.join(require('os').tmpdir(), 'test-exc-' + Date.now());
  const proc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    `--remote-debugging-port=${cdpPort}`,
    `--user-data-dir=${tempProfile}`,
    'http://localhost:3000'
  ]);

  await new Promise(r => setTimeout(r, 1000));
  const res = await fetch(`http://localhost:${cdpPort}/json`);
  const targets = await res.json();
  const pageTarget = targets.find(t => t.url.includes('3000')) || targets[0];
  const ws = new globalThis.WebSocket(pageTarget.webSocketDebuggerUrl);

  ws.onopen = async () => {
    ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
    ws.send(JSON.stringify({ id: 2, method: 'Page.enable' }));
    ws.send(JSON.stringify({ id: 3, method: 'Page.reload' }));
  };

  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.method === 'Runtime.exceptionThrown') {
      console.log('EXCEPTION THROWN:', JSON.stringify(msg.params, null, 2));
    }
  };

  setTimeout(() => {
    proc.kill();
    process.exit(0);
  }, 3500);
}

test();

