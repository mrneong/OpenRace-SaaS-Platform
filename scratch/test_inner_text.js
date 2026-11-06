const { spawn } = require('child_process');
const fs = require('fs');

async function testInnerText() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browserBin = fs.existsSync(chromePath) ? chromePath : edgePath;

  const browserProc = spawn(browserBin, [
    '--headless=new',
    '--remote-debugging-port=9228',
    '--disable-gpu',
    'http://localhost:3000'
  ]);

  let targetInfo;
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 200));
    try {
      const res = await fetch('http://127.0.0.1:9228/json/list');
      if (res.ok) {
        const list = await res.json();
        targetInfo = list.find(t => t.url.includes('localhost:3000'));
        if (targetInfo) break;
      }
    } catch(e) {}
  }

  const ws = new WebSocket(targetInfo.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  const pending = new Map();
  let idCounter = 1;
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    }
  };

  const evalJs = (expr) => new Promise((resolve) => {
    const id = idCounter++;
    pending.set(id, (res) => resolve(res.result?.result?.value));
    ws.send(JSON.stringify({ id, method: 'Runtime.evaluate', params: { expression: expr, returnByValue: true } }));
  });

  const res = await evalJs(`
    const el = document.createElement('div');
    el.id = 'outer-hidden';
    el.style.display = 'none';
    el.innerHTML = '<div id="inner-target">Hello World Text</div>';
    document.body.appendChild(el);
    document.getElementById('inner-target').innerText;
  `);

  console.log('Result of hidden element innerText:', JSON.stringify(res));

  browserProc.kill();
  ws.close();
}

testInnerText().catch(console.error);
