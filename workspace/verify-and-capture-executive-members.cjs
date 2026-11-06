const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const cdpPort = 9241;
const artifactsDir = 'C:\\Users\\nguye\\.gemini\\antigravity\\brain\\6cc28217-793d-48a4-8630-e0b049bf6838';

const chromeProc = spawn(chromePath, [
  '--headless=new',
  `--remote-debugging-port=${cdpPort}`,
  '--window-size=1440,1100',
  '--disable-gpu',
  'http://localhost:3000'
]);

async function capture() {
  await new Promise(r => setTimeout(r, 2500));
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
  await sendCmd('Page.enable');
  await sendCmd('Runtime.enable');
  await sendCmd('Page.reload');
  await new Promise(r => setTimeout(r, 2000));

  async function evalJs(expr) {
    const res = await sendCmd('Runtime.evaluate', { expression: expr, returnByValue: true });
    return res && res.result ? res.result.value : null;
  }

  // Navigate to Section 4.1 (Club Hub)
  await evalJs(`
    switchTab('club');
    switchSubTab('4.1');
  `);
  await new Promise(r => setTimeout(r, 1000));

  // 1. Open Executive Modal for Adding (Bổ nhiệm mới) and select member "Nguyễn Văn A" (user-01)
  await evalJs(`
    openExecutiveModal();
    const select = document.getElementById('exec-select-member');
    if (select) {
      select.value = 'user-01';
      onSelectExecutiveMember('user-01');
      document.getElementById('exec-input-role').value = 'Phó Chủ nhiệm CLB';
      document.getElementById('exec-input-desc').value = 'Phụ trách phong trào thi đấu & Huấn luyện giải Mùa 10';
    }
  `);
  await new Promise(r => setTimeout(r, 600));

  // Screenshot 1: Modal Appoint Executive Leader from Member List
  const shot1 = await sendCmd('Page.captureScreenshot', { format: 'png' });
  const shot1Path = path.join(artifactsDir, 'screenshot_executive_modal_select_from_member_list.png');
  fs.writeFileSync(shot1Path, Buffer.from(shot1.data, 'base64'));
  console.log('Saved:', shot1Path);

  // Close modal
  await evalJs(`closeExecutiveModal()`);
  await new Promise(r => setTimeout(r, 400));

  // 2. Open Executive Modal for Editing Existing Leader (Hoàng Văn Minh)
  await evalJs(`openExecutiveModal('lead-01')`);
  await new Promise(r => setTimeout(r, 600));

  // Screenshot 2: Modal Edit Existing Leader with Member Profile Auto-Populated
  const shot2 = await sendCmd('Page.captureScreenshot', { format: 'png' });
  const shot2Path = path.join(artifactsDir, 'screenshot_executive_modal_edit_existing_leader.png');
  fs.writeFileSync(shot2Path, Buffer.from(shot2.data, 'base64'));
  console.log('Saved:', shot2Path);

  // Close modal
  await evalJs(`closeExecutiveModal()`);
  await new Promise(r => setTimeout(r, 400));

  // 3. Test Appointing New Leader: Select Phạm Minh Đức (user-04) and save
  await evalJs(`
    openExecutiveModal();
    const sel = document.getElementById('exec-select-member');
    sel.value = 'user-04';
    onSelectExecutiveMember('user-04');
    document.getElementById('exec-input-role').value = 'Cán Sự Đường Chạy & Sự Kiện';
    document.getElementById('exec-input-desc').value = 'Khảo sát cung đường & An toàn trạm tiếp nước';
    saveExecutiveLeader();
  `);
  await new Promise(r => setTimeout(r, 800));

  // Screenshot 3: Section 4.1 with Newly Appointed Executive Leader
  const shot3 = await sendCmd('Page.captureScreenshot', { format: 'png' });
  const shot3Path = path.join(artifactsDir, 'screenshot_executive_grid_after_appointment.png');
  fs.writeFileSync(shot3Path, Buffer.from(shot3.data, 'base64'));
  console.log('Saved:', shot3Path);

  ws.close();
  chromeProc.kill();
  console.log('Verification & Screenshots complete!');
}

capture().catch(err => {
  console.error(err);
  try { chromeProc.kill(); } catch (e) {}
  process.exit(1);
});

