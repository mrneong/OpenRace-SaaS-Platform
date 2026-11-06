const { spawn } = require('child_process');
const WebSocket = require('ws');
const fs = require('fs');

async function testHiddenInnerText() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browserBin = fs.existsSync(chromePath) ? chromePath : edgePath;

  const browserProc = spawn(browserBin, [
    '--headless=new',
    '--remote-debugging-port=9229',
    '--disable-gpu',
    'http://localhost:3000'
  ]);

  let targetInfo;
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 200));
    try {
      const res = await fetch('http://127.0.0.1:9229/json/list');
      if (res.ok) {
        const list = await res.json();
        targetInfo = list.find(t => t.url.includes('localhost:3000'));
        if (targetInfo) break;
      }
    } catch(e) {}
  }

  const ws = new WebSocket(targetInfo.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  const evalJs = (expr) => new Promise((resolve) => {
    const id = Math.floor(Math.random() * 100000);
    const handler = (evt) => {
      const msg = JSON.parse(evt.data);
      if (msg.id === id) {
        ws.removeListener('message', handler);
        resolve(msg.result?.result?.value);
      }
    };
    ws.on('message', handler);
    ws.send(JSON.stringify({ id, method: 'Runtime.evaluate', params: { expression: expr, returnByValue: true } }));
  });

  const res1 = await evalJs(`
    const d = document.createElement('div');
    d.style.display = 'none';
    d.innerHTML = '<span id="test-span">Hello World</span>';
    document.body.appendChild(d);
    document.getElementById('test-span').innerText;
  `);

  console.log('Result for hidden element innerText:', JSON.stringify(res1));

  browserProc.kill();
  ws.close();
}

testHiddenInnerText().catch(console.error);

