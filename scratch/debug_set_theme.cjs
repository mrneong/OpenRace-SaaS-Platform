const { spawn } = require('child_process');
const path = require('path');

async function test() {
  const cdpPort = 9355;
  const tempProfile = path.join(require('os').tmpdir(), 'test-theme-debug-' + Date.now());
  const proc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=' + cdpPort,
    '--user-data-dir=' + tempProfile,
    'http://localhost:3000'
  ]);

  await new Promise(r => setTimeout(r, 1000));
  const res = await fetch('http://localhost:' + cdpPort + '/json');
  const targets = await res.json();
  const pageTarget = targets.find(t => t.url.includes('3000')) || targets[0];
  const ws = new globalThis.WebSocket(pageTarget.webSocketDebuggerUrl);

  ws.onopen = async () => {
    // Wait for complete
    await new Promise(r => setTimeout(r, 1500));
    ws.send(JSON.stringify({
      id: 1,
      method: 'Runtime.evaluate',
      params: {
        expression: `(() => {
          try {
            setAppTheme('sport');
            return {
              success: true,
              theme: document.body.getAttribute('data-theme'),
              sportSidebarHidden: document.getElementById('sport-docked-sidebar')?.classList.contains('hidden')
            };
          } catch (e) {
            return { success: false, error: e.message, stack: e.stack };
          }
        })()`,
        returnByValue: true
      }
    }));
  };

  ws.onmessage = (e) => {
    console.log('Result:', JSON.stringify(JSON.parse(e.data), null, 2));
    proc.kill();
    process.exit(0);
  };
}

test();
