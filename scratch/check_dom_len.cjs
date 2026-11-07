const { spawn } = require('child_process');
const path = require('path');

async function test() {
  const cdpPort = 9361;
  const tempProfile = path.join(require('os').tmpdir(), 'test-dom-len-' + Date.now());
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
    setTimeout(() => {
      ws.send(JSON.stringify({
        id: 10,
        method: 'Runtime.evaluate',
        params: {
          expression: `({
            readyState: document.readyState,
            htmlLength: document.documentElement.outerHTML.length,
            bodyChildrenCount: document.body ? document.body.children.length : 0,
            hasSportSidebar: !!document.getElementById('sport-docked-sidebar'),
            hasMantisSidebar: !!document.getElementById('mantis-sidebar')
          })`,
          returnByValue: true
        }
      }));
    }, 2000);
  };

  ws.onmessage = async (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id === 10) {
      console.log('DOM check in Chrome:', JSON.stringify(msg.result.result.value, null, 2));
      proc.kill();
      process.exit(0);
    }
  };
}

test();

