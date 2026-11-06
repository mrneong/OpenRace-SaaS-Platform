const fs = require('fs');
const { spawn } = require('child_process');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const cdpPort = 9239;

const chromeProc = spawn(chromePath, [
  '--headless=new',
  `--remote-debugging-port=${cdpPort}`,
  '--window-size=1440,1050',
  '--disable-gpu',
  'http://localhost:3000'
]);

async function check() {
  await new Promise(r => setTimeout(r, 2000));
  const res = await fetch(`http://127.0.0.1:${cdpPort}/json/list`);
  const list = await res.json();
  const target = list.find(t => t.url.includes('localhost:3000'));
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  let id = 1;
  const sendCmd = (method, params = {}) => new Promise((resolve) => {
    const curId = id++;
    const handler = (e) => {
      const d = JSON.parse(e.data);
      if (d.id === curId) {
        ws.removeEventListener('message', handler);
        resolve(d.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: curId, method, params }));
  });
  await new Promise(r => ws.onopen = r);

  ws.addEventListener('message', (e) => {
    const d = JSON.parse(e.data);
    if (d.method === 'Runtime.exceptionThrown') {
      console.error('EXCEPTION THROWN:', JSON.stringify(d.params.exceptionDetails));
    }
    if (d.method === 'Runtime.consoleAPICalled') {
      console.log('CONSOLE:', d.params.type, d.params.args.map(a => a.value || a.description).join(' '));
    }
  });

  await sendCmd('Page.enable');
  await sendCmd('Runtime.enable');
  await sendCmd('Page.reload');
  await new Promise(r => setTimeout(r, 2000));

  async function evalJs(expr) {
    const r = await sendCmd('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    return r?.result?.value;
  }

  const r1 = await evalJs('typeof renderClubDisplay');
  console.log('typeof renderClubDisplay:', r1);

  ws.close();
  chromeProc.kill();
}
check().catch(err => {
  console.error(err);
  chromeProc.kill();
});
