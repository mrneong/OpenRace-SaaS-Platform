const { spawn } = require('child_process');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const browserProc = spawn(edgePath, [
  '--headless=new',
  '--remote-debugging-port=9229',
  '--disable-gpu',
  'http://localhost:3000'
]);

async function check() {
  await new Promise(r => setTimeout(r, 1500));
  const res = await fetch('http://127.0.0.1:9229/json/list');
  const list = await res.json();
  const targetInfo = list.find(t => t.url.includes('localhost:3000'));
  const ws = new WebSocket(targetInfo.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  ws.send(JSON.stringify({
    id: 1,
    method: 'Runtime.evaluate',
    params: {
      expression: 'window.switchTab("club"); document.getElementById("tab-club").innerText',
      returnByValue: true
    }
  }));

  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id === 1) {
      console.log('Full msg:', JSON.stringify(msg));
      const val = msg.result?.result?.value || '';
      console.log('Result length:', val.length);
      console.log('First 600 chars:\n', val.substring(0, 600));
      browserProc.kill();
      process.exit(0);
    }
  };
}
check();
