const fs = require('fs');
const { spawn } = require('child_process');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const browserBin = fs.existsSync(chromePath) ? chromePath : edgePath;

async function main() {
  const browserProc = spawn(browserBin, [
    '--headless=new',
    '--remote-debugging-port=9234',
    '--disable-gpu',
    'http://localhost:3000/'
  ]);

  try {
    let targetInfo = null;
    for (let i = 0; i < 20; i++) {
      try {
        const listRes = await fetch('http://127.0.0.1:9234/json');
        const tabs = await listRes.json();
        targetInfo = tabs.find(t => t.type === 'page');
        if (targetInfo && targetInfo.webSocketDebuggerUrl) break;
      } catch (e) {
        await new Promise(r => setTimeout(r, 250));
      }
    }

    if (!targetInfo) throw new Error('Could not find CDP target');

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

    // 1. Tiebreak modal check
    await send('Runtime.evaluate', { expression: 'openTiebreakModal();' });
    const openRes = await send('Runtime.evaluate', { expression: 'document.getElementById("tiebreak-info-modal")?.className' });
    console.log('Open modal class:', openRes.result.value);

    await send('Runtime.evaluate', { expression: 'closeTiebreakModal();' });
    const closeRes = await send('Runtime.evaluate', { expression: 'document.getElementById("tiebreak-info-modal")?.className' });
    console.log('Close modal class:', closeRes.result.value);

    // 2. Ind view check
    await send('Runtime.evaluate', { expression: 'toggleArenaTab("ind");' });
    const indText = await send('Runtime.evaluate', { expression: 'document.getElementById("arena-ind-view")?.innerText' });
    console.log('Ind text snippet:', indText.result.value.substring(0, 300));

    ws.close();
  } catch (err) {
    console.error('Debug error:', err);
  } finally {
    browserProc.kill();
  }
}

main();

