const { spawn } = require('child_process');
const http = require('http');

async function testIndAssertion() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9228',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    '--user-data-dir=C:\\temp\\chrome-test-ind'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  const jsonStr = await new Promise((resolve) => {
    http.get('http://127.0.0.1:9228/json', (res) => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => resolve(b));
    });
  });

  const targets = JSON.parse(jsonStr);
  const page = targets.find(t => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let idCounter = 1;
  const pending = new Map();
  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    }
  };

  const call = (method, params = {}) => new Promise((resolve) => {
    const id = idCounter++;
    pending.set(id, resolve);
    ws.send(JSON.stringify({ id, method, params }));
  });

  const evalJs = async (expr) => {
    const res = await call('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    return res.result?.result?.value;
  };

  await call('Page.enable');
  await call('Page.navigate', { url: 'http://localhost:3000' });
  await new Promise(r => setTimeout(r, 1000));

  await evalJs('window.switchTab("arena")');
  await evalJs('window.toggleArenaTab("ind")');

  const indViewText = await evalJs('document.getElementById("arena-ind-view")?.innerText');
  console.log('--- IND VIEW TEXT ---');
  console.log(indViewText);

  chromeProc.kill();
  process.exit(0);
}

testIndAssertion().catch(console.error);

