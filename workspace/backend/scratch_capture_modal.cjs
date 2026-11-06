const fs = require('fs');
const { spawn } = require('child_process');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const browserBin = fs.existsSync(chromePath) ? chromePath : edgePath;

const outputPath = 'C:\\Users\\nguye\\.gemini\\antigravity\\brain\\6cc28217-793d-48a4-8630-e0b049bf6838\\screenshot_modal_join_race.png';

async function main() {
  const browserProc = spawn(browserBin, [
    '--headless=new',
    '--remote-debugging-port=9232',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=1440,900',
    'http://localhost:3000/'
  ]);

  try {
    let targetInfo = null;
    for (let i = 0; i < 20; i++) {
      try {
        const listRes = await fetch('http://127.0.0.1:9232/json');
        const tabs = await listRes.json();
        targetInfo = tabs.find(t => t.type === 'page');
        if (targetInfo && targetInfo.webSocketDebuggerUrl) break;
      } catch (e) {
        await new Promise(r => setTimeout(r, 250));
      }
    }

    if (!targetInfo) throw new Error('Could not find CDP target on port 9232');

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

    await new Promise(r => setTimeout(r, 1000));

    // Open join race modal
    await send('Runtime.evaluate', {
      expression: 'openJoinRaceModal();'
    });

    await new Promise(r => setTimeout(r, 600));

    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(outputPath, Buffer.from(shot.data, 'base64'));
    console.log('Successfully captured modal screenshot to:', outputPath);

    ws.close();
  } catch (err) {
    console.error('Modal screenshot error:', err);
  } finally {
    browserProc.kill();
  }
}

main();

