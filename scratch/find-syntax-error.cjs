const { spawn } = require('child_process');
const path = require('path');

async function test() {
  const cdpPort = 9350;
  const tempProfile = path.join(require('os').tmpdir(), 'chrome-cdp-syntax-' + Date.now());
  const chromeProc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    `--remote-debugging-port=${cdpPort}`,
    `--user-data-dir=${tempProfile}`,
    '--disable-gpu',
    '--no-sandbox',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 1500));
  const targets = await (await fetch(`http://localhost:${cdpPort}/json`)).json();
  const pageTarget = targets.find(t => t.type === 'page') || targets[0];
  const ws = new globalThis.WebSocket(pageTarget.webSocketDebuggerUrl);

  let id = 1;
  const cbs = new Map();
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.method === 'Runtime.exceptionThrown') {
      console.log('UNCAUGHT EXCEPTION IN PAGE:\n', JSON.stringify(m.params, null, 2));
    }
    if (m.method === 'Runtime.consoleAPICalled') {
      console.log('CONSOLE:', m.params.type, m.params.args.map(a => a.value || a.description).join(' '));
    }
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
  await cmd('Page.enable');

  console.log('Navigating to http://localhost:3000...');
  await cmd('Page.navigate', { url: 'http://localhost:3000' });

  await new Promise(r => setTimeout(r, 3000));

  ws.close();
  chromeProc.kill('SIGKILL');
}

test().catch(console.error);

