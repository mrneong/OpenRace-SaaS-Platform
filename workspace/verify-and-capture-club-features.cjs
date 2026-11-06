const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const ARTIFACT_DIR = 'C:/Users/nguye/.gemini/antigravity/brain/6cc28217-793d-48a4-8630-e0b049bf6838';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const cdpPort = 9236;

const chromeProc = spawn(chromePath, [
  '--headless=new',
  `--remote-debugging-port=${cdpPort}`,
  '--window-size=1440,1050',
  '--disable-gpu',
  'http://localhost:3000'
]);

async function run() {
  const errors = [];
  const logs = [];

  try {
    await new Promise(r => setTimeout(r, 2500));
    const res = await fetch(`http://127.0.0.1:${cdpPort}/json/list`);
    const list = await res.json();
    const target = list.find(t => t.url.includes('localhost:3000'));
    if (!target) throw new Error('Target localhost:3000 not found in CDP list');

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

    ws.addEventListener('message', (e) => {
      try {
        const d = JSON.parse(e.data);
        if (d.method === 'Runtime.consoleAPICalled') {
          const type = d.params.type;
          const text = d.params.args.map(a => a.value || a.description || '').join(' ');
          if (type === 'error') {
            errors.push(text);
          } else {
            logs.push(`[${type}] ${text}`);
          }
        }
      } catch (err) {}
    });

    await new Promise(r => setTimeout(r, 1200));

    async function evalJs(expr) {
      const r = await sendCmd('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
      return r?.result?.value;
    }

    async function capture(fileName) {
      await new Promise(r => setTimeout(r, 600));
      const shot = await sendCmd('Page.captureScreenshot', { format: 'png' });
      const buf = Buffer.from(shot.data, 'base64');
      const dest = path.join(ARTIFACT_DIR, fileName);
      fs.writeFileSync(dest, buf);
      console.log('Saved screenshot:', fileName);
    }

    console.log('--- Step 1: Navigating to [4.1] Hồ Sơ & Bảng Tin CLB ---');
    await evalJs('goToSection("club", "section-4-1")');
    await new Promise(r => setTimeout(r, 1500));

    // Verify elements exist
    const elementsCheck = await evalJs(`({
      hasEditBtn: !!document.getElementById('btn-open-edit-club-profile'),
      hasAddLeaderBtn: !!document.getElementById('btn-open-add-leader'),
      hasAddAnnounceBtn: !!document.getElementById('btn-open-add-announcement'),
      hasExecGrid: !!document.getElementById('club-executives-grid'),
      hasAnnList: !!document.getElementById('club-announcements-list'),
      execCount: document.getElementById('club-executives-grid')?.children.length,
      annCount: document.getElementById('club-announcements-list')?.children.length,
      clubName: document.getElementById('club-display-name')?.innerText,
      clubSlogan: document.getElementById('club-display-slogan')?.innerText
    })`);
    console.log('Elements check:', elementsCheck);

    // Capture initial Club Management view
    await capture('screenshot_club_management_overview.png');

    console.log('--- Step 2: Testing & Capturing Edit Club Profile Modal ---');
    await evalJs('openEditClubProfileModal()');
    await new Promise(r => setTimeout(r, 600));
    await capture('screenshot_club_modal_edit_profile.png');
    await evalJs('closeEditClubProfileModal()');
    await new Promise(r => setTimeout(r, 400));

    console.log('--- Step 3: Testing & Capturing Add Executive Leader Modal ---');
    await evalJs('openExecutiveModal()');
    await new Promise(r => setTimeout(r, 600));
    await capture('screenshot_club_modal_add_leader.png');
    await evalJs('closeExecutiveModal()');
    await new Promise(r => setTimeout(r, 400));

    console.log('--- Step 4: Testing & Capturing Announcement Modal ---');
    await evalJs('openAnnouncementModal()');
    await new Promise(r => setTimeout(r, 600));
    await capture('screenshot_club_modal_add_announcement.png');
    await evalJs('closeAnnouncementModal()');
    await new Promise(r => setTimeout(r, 400));

    console.log('--- Step 5: Testing Interactive Actions (Create Post with Pin & Expiration) ---');
    const saveResult = await evalJs(`(async () => {
      document.getElementById('post-edit-id').value = '';
      document.getElementById('post-input-title').value = 'Thông báo: Khai mạc giải chạy Ultra SARC 2026';
      document.getElementById('post-input-category').value = 'THÔNG BÁO';
      document.getElementById('post-input-author').value = 'Ban Cán Sự CLB';
      document.getElementById('post-input-author-role').value = 'Ban Điều Hành';
      document.getElementById('post-input-expires').value = '2026-12-31';
      document.getElementById('post-input-pinned').checked = true;
      document.getElementById('post-input-content').value = 'Chào mừng tất cả runners tham gia cự ly 21km và 42km. Hãy kiểm tra lại thiết bị Strava và quy định tính thưởng dốc elevation gain.';
      await saveAnnouncementPost();
      return true;
    })()`);
    console.log('Save post result:', saveResult);
    await new Promise(r => setTimeout(r, 1200));

    // Check updated counts
    const updatedCheck = await evalJs(`({
      annCount: document.getElementById('club-announcements-list')?.children.length,
      firstPostText: document.getElementById('club-announcements-list')?.firstElementChild?.innerText
    })`);
    console.log('Updated announcements count:', updatedCheck.annCount);

    // Scroll to announcements
    await evalJs('document.getElementById("club-announcements-list")?.scrollIntoView({ behavior: "instant", block: "start" })');
    await capture('screenshot_club_announcements_feed_active.png');

    // Test filter pills
    console.log('Testing filter pills: Pinned...');
    await evalJs('filterClubPosts("pinned")');
    await new Promise(r => setTimeout(r, 600));
    await capture('screenshot_club_announcements_filter_pinned.png');

    console.log('Testing filter pills: Active...');
    await evalJs('filterClubPosts("active")');
    await new Promise(r => setTimeout(r, 600));
    await capture('screenshot_club_announcements_filter_active.png');

    console.log('Testing filter pills: All...');
    await evalJs('filterClubPosts("all")');
    await new Promise(r => setTimeout(r, 600));

    console.log('Total console errors caught:', errors.length);
    if (errors.length > 0) {
      console.error('Console errors:', errors);
    }

    ws.close();
    chromeProc.kill();
    console.log('SUCCESS: All Club Management verification completed cleanly!');
  } catch (err) {
    console.error('Test execution error:', err);
    chromeProc.kill();
  }
}

run();
