const { spawn } = require('child_process');
const http = require('http');

async function testFilter() {
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

  await call('Page.enable');
  await call('Page.navigate', { url: 'http://localhost:3000' });
  await new Promise(r => setTimeout(r, 1000));

  await call('Runtime.evaluate', { expression: 'window.switchTab("arena")' });
  await call('Runtime.evaluate', { expression: 'window.toggleArenaTab("ind")' });

  const textBefore = await call('Runtime.evaluate', {
    expression: 'document.getElementById("individual-runners-list")?.innerText',
    returnByValue: true
  });
  console.log('List before filter:', textBefore.result.result.value);

  const res = await call('Runtime.evaluate', {
    expression: `(() => {
      document.getElementById('ind-search-input').value = 'Trần Thị B';
      filterIndividualRunners();
      return document.getElementById("individual-runners-list")?.innerText;
    })()`,
    returnByValue: true
  });
  console.log('List after filter:', res.result.result.value);

  chromeProc.kill();
  process.exit(0);
}

testFilter().catch(console.error);

