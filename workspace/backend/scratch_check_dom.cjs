const { spawn } = require('child_process');
const fs = require('fs');

async function main() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browserBin = fs.existsSync(chromePath) ? chromePath : edgePath;

  const browserProc = spawn(browserBin, [
    '--headless=new',
    '--remote-debugging-port=9236',
    '--disable-gpu',
    'http://localhost:3000/'
  ]);

  try {
    let targetInfo = null;
    for (let i = 0; i < 20; i++) {
      try {
        const listRes = await fetch('http://127.0.0.1:9236/json');
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

    const res1 = await send('Runtime.evaluate', { expression: '!!document.getElementById("tab-arena")' });
    console.log('tab-arena exists:', res1.result.value);

    const res2 = await send('Runtime.evaluate', { expression: '!!document.getElementById("arena-ind-view")' });
    console.log('arena-ind-view exists:', res2.result.value);

    const res3 = await send('Runtime.evaluate', { expression: 'document.querySelectorAll("[id]").length' });
    console.log('Total elements with ID:', res3.result.value);

    const res4 = await send('Runtime.evaluate', { expression: 'Array.from(document.querySelectorAll("[id*=\'arena\']")).map(e => e.id)' });
    console.log('All IDs with arena:', res4.result.value);

    ws.close();
  } catch (err) {
    console.error('Debug error:', err);
  } finally {
    browserProc.kill();
  }
}

main();

