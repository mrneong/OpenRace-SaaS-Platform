const { spawn } = require('child_process');
const path = require('path');
const cdpPort = 9356;
const tempProfile = path.join(require('os').tmpdir(), 'chrome-cdp-debug-' + Date.now());
const chromeProc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=' + cdpPort,
  '--user-data-dir=' + tempProfile,
  '--disable-gpu',
  '--no-sandbox',
  'http://localhost:3000'
]);

setTimeout(async () => {
  try {
    const res = await fetch('http://localhost:' + cdpPort + '/json');
    const targets = await res.json();
    const pageTarget = targets.find(t => t.url.includes('3000')) || targets[0];
    const ws = new globalThis.WebSocket(pageTarget.webSocketDebuggerUrl);
    ws.onopen = async () => {
      let id = 1;
      ws.send(JSON.stringify({ id: id++, method: 'Page.enable' }));
      ws.send(JSON.stringify({ id: id++, method: 'Runtime.enable' }));
    };
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.method === 'Runtime.exceptionThrown') {
        console.log('Exception thrown on page:', JSON.stringify(data.params, null, 2));
      }
      if (data.method === 'Runtime.consoleAPICalled') {
        console.log('Console API called:', data.params.type, data.params.args.map(a => a.value));
      }
    };
    setTimeout(() => {
      ws.close();
      chromeProc.kill();
      process.exit(0);
    }, 4000);
  } catch(e) {
    console.error(e);
    chromeProc.kill();
  }
}, 1000);
