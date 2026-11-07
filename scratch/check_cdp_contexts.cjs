const { spawn } = require('child_process');
const path = require('path');

async function test() {
  const cdpPort = 9359;
  const tempProfile = path.join(require('os').tmpdir(), 'test-ctx-' + Date.now());
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

  let defaultContextId = null;

  ws.onopen = async () => {
    ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
    ws.send(JSON.stringify({ id: 2, method: 'Page.enable' }));
  };

  ws.onmessage = async (e) => {
    const msg = JSON.parse(e.data);
    if (msg.method === 'Runtime.executionContextCreated') {
      console.log('Context created:', msg.params.context.id, msg.params.context.name, msg.params.context.auxData);
      if (msg.params.context.auxData && msg.params.context.auxData.isDefault) {
        defaultContextId = msg.params.context.id;
        console.log('Found defaultContextId:', defaultContextId);
        
        // Wait 1s and evaluate
        setTimeout(() => {
          ws.send(JSON.stringify({
            id: 100,
            method: 'Runtime.evaluate',
            params: {
              expression: 'typeof switchTab',
              contextId: defaultContextId,
              returnByValue: true
            }
          }));
        }, 1500);
      }
    }
    if (msg.id === 100) {
      console.log('Evaluation in default context:', JSON.stringify(msg.result));
      proc.kill();
      process.exit(0);
    }
  };
}

test();
