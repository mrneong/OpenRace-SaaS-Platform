const { spawn } = require('child_process');
const fs = require('fs');

async function main() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browserBin = fs.existsSync(chromePath) ? chromePath : edgePath;

  const browserProc = spawn(browserBin, [
    '--headless=new',
    '--remote-debugging-port=9237',
    '--disable-gpu',
    'http://localhost:3000/'
  ]);

  try {
    let targetInfo = null;
    for (let i = 0; i < 20; i++) {
      try {
        const listRes = await fetch('http://127.0.0.1:9237/json');
        const tabs = await listRes.json();
        targetInfo = tabs.find(t => t.type === 'page');
        if (targetInfo && targetInfo.webSocketDebuggerUrl) break;
      } catch (e) {
        await new Promise(r => setTimeout(r, 250));
      }
    }

    const ws = new WebSocket(targetInfo.webSocketDebuggerUrl);
    let msgId = 1;
    const pending = new Map();

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && pending.has(msg.id)) {
        pending.get(msg.id)(msg);
        pending.delete(msg.id);
      }
    };

    await new Promise(r => ws.onopen = r);

    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = msgId++;
        pending.set(id, (msg) => {
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await send('Page.enable');
    await send('Runtime.enable');

    // Wait 1 second for page to load completely
    await new Promise(r => setTimeout(r, 1000));

    await send('Runtime.evaluate', { expression: 'window.switchTab("arena");' });
    await send('Runtime.evaluate', { expression: 'window.toggleArenaTab("ind");' });
    
    const textRes = await send('Runtime.evaluate', { expression: 'document.getElementById("arena-ind-view")?.innerText' });
    console.log('arena-ind-view innerText:\n', textRes.result.value);

    const tcRes = await send('Runtime.evaluate', { expression: 'document.getElementById("arena-ind-view")?.textContent' });
    console.log('arena-ind-view textContent snippet:\n', (tcRes.result.value || '').substring(0, 200));

    ws.close();
  } catch (err) {
    console.error('Debug error:', err);
  } finally {
    browserProc.kill();
  }
}

main();

