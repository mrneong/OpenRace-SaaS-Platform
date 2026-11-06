const { spawn } = require('child_process');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const cdpPort = 9231;
const chromeProc = spawn(chromePath, [
  '--headless=new',
  `--remote-debugging-port=${cdpPort}`,
  '--window-size=1400,960',
  '--disable-gpu',
  'http://localhost:3000'
]);

async function test() {
  await new Promise(r => setTimeout(r, 1500));
  const res = await fetch(`http://127.0.0.1:${cdpPort}/json/list`);
  const list = await res.json();
  const target = list.find(t => t.url.includes('localhost:3000'));
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  let id = 1;
  const send = (method, params = {}) => new Promise((resolve) => {
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
  await send('Page.enable');
  await send('Runtime.enable');
  await new Promise(r => setTimeout(r, 500));

  const before = await send('Runtime.evaluate', { expression: 'document.querySelector(".tab-content.active")?.id' });
  console.log('Active tab before:', before.result?.value);

  const switchRes = await send('Runtime.evaluate', { expression: 'switchTab("arena")' });
  console.log('switchTab eval result:', JSON.stringify(switchRes));

  const after = await send('Runtime.evaluate', { expression: 'document.querySelector(".tab-content.active")?.id' });
  console.log('Active tab after:', after.result?.value);

  ws.close();
  chromeProc.kill();
}
test().catch(console.error);

