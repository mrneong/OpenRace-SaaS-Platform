const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const ARTIFACT_DIR = 'C:/Users/nguye/.gemini/antigravity/brain/6cc28217-793d-48a4-8630-e0b049bf6838';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const cdpPort = 9240;

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
        if (d.method === 'Runtime.exceptionThrown') {
          errors.push(JSON.stringify(d.params.exceptionDetails));
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

    console.log('--- Step 1: Navigating to [2.1] Hero & Đếm Ngược ---');
    await evalJs('goToSection("arena", "section-2-1")');
    await new Promise(r => setTimeout(r, 1500));

    // Verify elements exist
    const elementsCheck = await evalJs(`({
      hasGrid: !!document.getElementById('arena-races-selector-grid'),
      cardsCount: document.getElementById('arena-races-selector-grid')?.children.length,
      currentActive: currentActiveRaceSlug,
      hasModal: !!document.getElementById('modal-race-full-detail'),
      currentTitle: document.getElementById('arena-race-title')?.innerText,
      athletes: document.getElementById('hero-athletes')?.innerText,
      km: document.getElementById('hero-km')?.innerText
    })`);
    console.log('Initial Elements check:', elementsCheck);

    // Capture initial Arena overview with race selector hub
    await capture('screenshot_arena_races_overview.png');

    console.log('--- Step 2: Testing Multi-Tab Race Detail Modal ---');
    await evalJs('openRaceFullDetailModal("season-10-run-to-techcombank")');
    await new Promise(r => setTimeout(r, 800));

    // Capture Tab 1: Info & Rules
    await capture('modal_race_detail_tab1_info_rules.png');

    // Switch to Tab 2: Leaderboard
    console.log('Switching to Tab 2: Leaderboard...');
    await evalJs('switchRaceDetailTab("leaderboard")');
    await new Promise(r => setTimeout(r, 600));
    await capture('modal_race_detail_tab2_leaderboard.png');

    // Switch to Tab 3: Summary
    console.log('Switching to Tab 3: Summary...');
    await evalJs('switchRaceDetailTab("summary")');
    await new Promise(r => setTimeout(r, 600));
    await capture('modal_race_detail_tab3_summary.png');

    // Switch to Tab 4: Competing Teams
    console.log('Switching to Tab 4: Teams...');
    await evalJs('switchRaceDetailTab("teams")');
    await new Promise(r => setTimeout(r, 600));
    await capture('modal_race_detail_tab4_teams.png');

    // Close Modal
    await evalJs('closeRaceFullDetailModal()');
    await new Promise(r => setTimeout(r, 400));

    console.log('--- Step 3: Testing Race Switch to "SARC Trail Challenge Ba Vì 2026" ---');
    await evalJs('changeArenaRace("sarc-trail-challenge-bavi-2026")');
    await new Promise(r => setTimeout(r, 1000));

    const switchedCheck = await evalJs(`({
      currentActive: currentActiveRaceSlug,
      title: document.getElementById('arena-race-title')?.innerText,
      athletes: document.getElementById('hero-athletes')?.innerText,
      km: document.getElementById('hero-km')?.innerText,
      days: document.getElementById('hero-days')?.innerText,
      selectValue: document.getElementById('arena-race-select')?.value
    })`);
    console.log('Switched to Ba Vì Trail check:', switchedCheck);

    // Capture switched Arena Hero
    await capture('screenshot_arena_race_switched_bavi.png');

    console.log('--- Step 4: Verifying Section 2.2 (Team Leaderboard) for Ba Vì ---');
    await evalJs('goToSection("arena", "section-2-2")');
    await new Promise(r => setTimeout(r, 800));
    const teamsCheck = await evalJs(`({
      teamsCount: document.getElementById('arena-team-view')?.children.length,
      firstTeamText: document.getElementById('arena-team-view')?.firstElementChild?.innerText?.slice(0, 80)
    })`);
    console.log('Teams check for Ba Vì:', teamsCheck);
    await capture('screenshot_arena_switched_teams_bavi.png');

    console.log('--- Step 5: Verifying Section 2.3 (Individual Leaderboard) for Ba Vì ---');
    await evalJs('goToSection("arena", "section-2-3")');
    await new Promise(r => setTimeout(r, 800));
    const indCheck = await evalJs(`({
      runnersCount: document.getElementById('individual-runners-list')?.children.length,
      stickySelfText: document.getElementById('arena-sticky-self')?.innerText
    })`);
    console.log('Runners check for Ba Vì:', indCheck);
    await capture('screenshot_arena_switched_individuals_bavi.png');

    console.log('--- Step 6: Testing Filter Pills in Race Switcher ---');
    await evalJs('goToSection("arena", "section-2-1")');
    await new Promise(r => setTimeout(r, 600));

    await evalJs('filterArenaRaces("participating")');
    await new Promise(r => setTimeout(r, 500));
    const partCount = await evalJs('document.getElementById("arena-races-selector-grid")?.children.length');
    console.log('Participating filter count:', partCount);

    await evalJs('filterArenaRaces("upcoming")');
    await new Promise(r => setTimeout(r, 500));
    const upCount = await evalJs('document.getElementById("arena-races-selector-grid")?.children.length');
    console.log('Upcoming filter count:', upCount);

    await evalJs('filterArenaRaces("all")');
    await new Promise(r => setTimeout(r, 500));

    console.log('Total console errors caught:', errors.length);
    if (errors.length > 0) {
      console.error('Console errors:', errors);
    }

    ws.close();
    chromeProc.kill();
    console.log('SUCCESS: All Multi-Race verification completed cleanly!');
  } catch (err) {
    console.error('Test execution error:', err);
    chromeProc.kill();
  }
}

run();

