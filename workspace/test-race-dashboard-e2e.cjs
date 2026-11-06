/**
 * Multi-Selection Tournament Dashboard E2E Automation Suite
 * Tests REST APIs on port 3001 and UI interactions on port 3000 via Headless Chrome CDP
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:3001';
const FRONTEND_BASE = 'http://localhost:3000';
const ARTIFACT_DIR = 'C:\\Users\\nguye\\.gemini\\antigravity\\brain\\6cc28217-793d-48a4-8630-e0b049bf6838';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`  ✕ FAIL: ${message}`);
  }
}

async function testRaceDashboardRestApis() {
  console.log('\n======================================================');
  console.log('>>> [1/2] TESTING TOURNAMENT DASHBOARD REST APIS (PORT 3001)');
  console.log('======================================================\n');

  // 1. GET /api/races/selector
  try {
    const res = await fetch(`${API_BASE}/api/races/selector`);
    const races = await res.json();
    assert(res.status === 200, 'GET /api/races/selector returns HTTP 200');
    assert(Array.isArray(races) && races.length >= 4, `Returns ${races.length} selectable races (>= 4)`);

    const ids = races.map(r => r.id);
    assert(ids.includes('race-season-10'), 'Contains Mùa 10 Summer Race (race-season-10)');
    assert(ids.includes('race-season-09'), 'Contains Mùa 9 Techcombank (race-season-09)');
    assert(ids.includes('race-internal-q3'), 'Contains Nội Bộ Quý 3 (race-internal-q3)');
    assert(ids.includes('race-trail-bavi'), 'Contains Ba Vì Trail (race-trail-bavi)');
  } catch (err) {
    assert(false, `GET /api/races/selector error: ${err.message}`);
  }

  // 2. GET /api/races/race-season-10/dashboard
  try {
    const res = await fetch(`${API_BASE}/api/races/race-season-10/dashboard`);
    const dash = await res.json();
    assert(res.status === 200, 'GET /api/races/race-season-10/dashboard returns HTTP 200');
    assert(dash.raceInfo && dash.raceInfo.id === 'race-season-10', 'Race info id is race-season-10');
    assert(dash.kpis.totalAthletes === 128, `Zone 1: Total athletes is 128 (got ${dash.kpis.totalAthletes})`);
    assert(dash.kpis.totalAccumulatedKm >= 15420.5, `Zone 1: Total KM is >= 15,420.5 (got ${dash.kpis.totalAccumulatedKm})`);
    assert(dash.kpis.progressPercent >= 77.0, `Zone 1: Progress is >= 77.0% (got ${dash.kpis.progressPercent}%)`);
    assert(dash.kpis.completionRatePercent === 84.5, `Zone 1: Completion rate is 84.5% (got ${dash.kpis.completionRatePercent}%)`);
    assert(dash.kpis.totalPrizePoolVnd === 25000000, `Zone 1: Prize pool is 25M VND (got ${dash.kpis.totalPrizePoolVnd})`);
    assert(dash.kpis.unpaidDebtVnd === 450000, `Zone 1: Unpaid debt is 450k VND (got ${dash.kpis.unpaidDebtVnd})`);

    // Zone 2
    assert(dash.dailyAnalytics && dash.dailyAnalytics.length === 7, `Zone 2: 7 daily trend points`);
    const peakSunday = dash.dailyAnalytics.find(d => d.dayOfWeek.includes('CN'));
    assert(peakSunday && peakSunday.isPeakDay && peakSunday.distanceKm === 3420.5, 'Zone 2: Sunday peak Long Run flagged');
    assert(dash.activityDistribution.roadPercent === 68, `Zone 2: Road distribution is 68%`);
    assert(dash.activityDistribution.trailPercent === 22, `Zone 2: Trail distribution is 22%`);
    assert(dash.activityDistribution.treadmillPercent === 10, `Zone 2: Treadmill distribution is 10%`);

    // Zone 3
    assert(dash.top5Teams && dash.top5Teams.length === 5, 'Zone 3: Top 5 internal teams loaded');
    assert(dash.top5Teams[0].teamName === 'Team Phoenix SARC' && dash.top5Teams[0].medal === 'GOLD', 'Zone 3: Gold medal team is Phoenix');
    assert(dash.top10Individuals && dash.top10Individuals.length === 10, 'Zone 3: Top 10 individual breakout runners loaded');
    assert(dash.top10Individuals[0].athleteName === 'Nguyễn Văn A' && dash.top10Individuals[0].totalKm === 342.5, 'Zone 3: Top 1 runner is Nguyen Van A with 342.5 km');

    // Zone 4
    assert(dash.violationQueue && dash.violationQueue.length === 4, 'Zone 4: 4 suspicious violation queue items loaded');
    const motorViol = dash.violationQueue.find(v => v.flagType === 'MOTORBIKE_SPEED');
    assert(motorViol && motorViol.flagBadge.includes('Auto-Trim'), 'Zone 4: Motor speed violation with auto-trim details');
  } catch (err) {
    assert(false, `GET /api/races/race-season-10/dashboard error: ${err.message}`);
  }

  // 3. GET /api/races/race-season-09/dashboard (Historical Completed Race)
  try {
    const res = await fetch(`${API_BASE}/api/races/race-season-09/dashboard`);
    const dash = await res.json();
    assert(res.status === 200, 'GET /api/races/race-season-09/dashboard returns HTTP 200');
    assert(dash.kpis.totalAthletes === 96, 'Season 9: 96 athletes');
    assert(dash.kpis.progressPercent === 105.2, 'Season 9: 105.2% progress (Goal accomplished)');
    assert(dash.kpis.unpaidDebtVnd === 0, 'Season 9: 0 VND unpaid debt (All settled)');
  } catch (err) {
    assert(false, `GET /api/races/race-season-09/dashboard error: ${err.message}`);
  }

  // 4. GET /api/races/race-season-10/export?format=csv
  try {
    const res = await fetch(`${API_BASE}/api/races/race-season-10/export?format=csv`);
    const csv = await res.text();
    assert(res.status === 200, 'GET /api/races/race-season-10/export?format=csv returns HTTP 200');
    assert(res.headers.get('content-type').includes('text/csv'), 'Content-Type is text/csv');
    assert(csv.includes('BÁO CÁO TỔNG KẾT GIẢI ĐẤU'), 'CSV contains Tournament Summary header');
    assert(csv.includes('BẢNG XẾP HẠNG ĐỘI ĐUA'), 'CSV contains Team Standings header');
    assert(csv.includes('DANH SÁCH VẬN ĐỘNG VIÊN FINISHER XUẤT SẮC'), 'CSV contains Finisher Individuals header');
    assert(csv.includes('NHẬT KÝ KIỂM ĐỊNH & VI PHẠM TRỌNG TÀI'), 'CSV contains Governance Audit Log header');
  } catch (err) {
    assert(false, `GET /api/races/race-season-10/export error: ${err.message}`);
  }

  // 5. POST /api/races/race-season-10/stream/increment & GET live-ticker
  try {
    const incRes = await fetch(`${API_BASE}/api/races/race-season-10/stream/increment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deltaKm: 2.5 })
    });
    const incData = await incRes.json();
    assert(incRes.status === 200 && incData.success, 'POST /api/races/race-season-10/stream/increment succeeds');
    assert(incData.updatedKm > 15420.5, `Updated km is ${incData.updatedKm}`);

    const tickerRes = await fetch(`${API_BASE}/api/races/race-season-10/live-ticker`);
    const ticker = await tickerRes.json();
    assert(tickerRes.status === 200, 'GET /api/races/race-season-10/live-ticker returns HTTP 200');
    assert(ticker.totalAccumulatedKm === incData.updatedKm, 'Ticker total KM matches incremented value');
  } catch (err) {
    assert(false, `Live Ticker API error: ${err.message}`);
  }
}

async function testHeadlessChromeUI() {
  console.log('\n======================================================');
  console.log('>>> [2/2] TESTING FRONTEND VIA HEADLESS CHROME CDP (PORT 3000)');
  console.log('======================================================\n');

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const cdpPort = 9340;

  const chromeProc = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${cdpPort}`,
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1440,900',
    `${FRONTEND_BASE}`
  ]);

  try {
    let targets = null;
    for (let i = 0; i < 35; i++) {
      await new Promise(r => setTimeout(r, 200));
      try {
        const res = await fetch(`http://localhost:${cdpPort}/json`);
        targets = await res.json();
        if (targets && targets.length > 0) break;
      } catch (e) {}
    }

    if (!targets || targets.length === 0) {
      throw new Error('Chrome CDP port not responding');
    }

    const pageTarget = targets.find(t => t.url.includes('3000')) || targets.find(t => t.type === 'page' && !t.url.startsWith('chrome-extension:')) || targets[0];
    const ws = new globalThis.WebSocket(pageTarget.webSocketDebuggerUrl);

    let msgId = 1;
    const pending = new Map();

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.id && pending.has(msg.id)) {
          const { resolve, reject } = pending.get(msg.id);
          pending.delete(msg.id);
          if (msg.error) reject(new Error(msg.error.message));
          else resolve(msg.result);
        }
      } catch (e) {}
    };

    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = msgId++;
        pending.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await new Promise(r => ws.onopen = r);
    await send('Page.enable');
    await send('Runtime.enable');
    await send('DOM.enable');

    console.log('  ✓ Connected to Chrome CDP session on port', cdpPort);

    // Helper: evaluate expression
    async function evaluate(expression) {
      const result = await send('Runtime.evaluate', {
        expression,
        returnByValue: true,
        awaitPromise: true
      });
      if (result.exceptionDetails) {
        throw new Error(result.exceptionDetails.exception?.description || 'Evaluation error');
      }
      return result.result?.value;
    }

    // Helper: take full-page screenshot
    async function captureScreenshot(fileName) {
      const { data } = await send('Page.captureScreenshot', { format: 'png' });
      const targetPath = path.join(ARTIFACT_DIR, fileName);
      fs.writeFileSync(targetPath, Buffer.from(data, 'base64'));
      console.log(`  📸 Screenshot saved: ${fileName}`);
    }

    // Wait until document.readyState === 'complete' and switchTab is defined
    for (let i = 0; i < 40; i++) {
      const isReady = await evaluate("document.readyState === 'complete' && typeof switchTab === 'function'");
      if (isReady) break;
      await new Promise(r => setTimeout(r, 200));
    }
    await new Promise(r => setTimeout(r, 600));

    // 1. Navigate to 'arena' tab (Đấu Trường & Bảng Xếp Hạng)
    await evaluate("switchTab('arena');");
    await new Promise(r => setTimeout(r, 600));

    // Verify Tab Arena is active
    const isArenaActive = await evaluate("document.getElementById('tab-arena').classList.contains('active');");
    assert(isArenaActive, "Navigated to tab-arena successfully");

    // 2. Verify Global Race Selector Bar exists and is visible
    const barVisible = await evaluate("!document.getElementById('global-race-selector-bar').classList.contains('hidden');");
    assert(barVisible, "Global Race Selector Bar is present and visible");

    const selectOptionsCount = await evaluate("document.getElementById('global-race-select-dropdown').options.length;");
    assert(selectOptionsCount >= 4, `Race dropdown has ${selectOptionsCount} selectable tournaments (>= 4)`);

    // 3. Verify 4 Central Information Zones in section-race-overview
    const zone1Visible = await evaluate("document.getElementById('race-zone1-kpi-cards') !== null;");
    assert(zone1Visible, "Zone 1: Race KPI Cards container is rendered");

    const athletesText = await evaluate("document.getElementById('zone1-athletes-count').innerText;");
    assert(athletesText === '128', `Zone 1: Total Athletes rendered is 128 (got '${athletesText}')`);

    const kmText = await evaluate("document.getElementById('zone1-km-count').innerText;");
    assert(kmText.includes('15,4') || kmText.includes('15.4') || kmText.includes('154'), `Zone 1: Total KM rendered contains ~15,400+ km (got '${kmText}')`);

    const completionText = await evaluate("document.getElementById('zone1-completion-rate').innerText;");
    assert(completionText === '84.5%', `Zone 1: Completion rate rendered is 84.5% (got '${completionText}')`);

    const prizeText = await evaluate("document.getElementById('zone1-prize-pool').innerText;");
    assert(prizeText.includes('25.0M') || prizeText.includes('25M'), `Zone 1: Prize pool rendered is 25.0M VNĐ (got '${prizeText}')`);

    // Zone 2: Analytics & Trend
    const zone2Visible = await evaluate("document.getElementById('race-zone2-analytics') !== null;");
    assert(zone2Visible, "Zone 2: Analytics container is rendered");

    const dailyBarsCount = await evaluate("document.getElementById('zone2-daily-bars').children.length;");
    assert(dailyBarsCount === 7, `Zone 2: Daily Distance Bar Chart rendered 7 day bars (got ${dailyBarsCount})`);

    const hasPeakFlag = await evaluate("document.getElementById('zone2-daily-bars').innerHTML.includes('🔥');");
    assert(hasPeakFlag, "Zone 2: Weekend Long Run peak day badges displayed");

    const activityDistText = await evaluate("document.getElementById('zone2-activity-distribution').innerText;");
    assert(activityDistText.includes('Road') && activityDistText.includes('Trail') && activityDistText.includes('Treadmill'), "Zone 2: Activity breakdown covers Road, Trail and Treadmill");

    // Zone 3: Leaderboards
    const zone3Visible = await evaluate("document.getElementById('race-zone3-leaderboards') !== null;");
    assert(zone3Visible, "Zone 3: Leaderboards container is rendered");

    const topTeamsCount = await evaluate("document.getElementById('zone3-top-teams').children.length;");
    assert(topTeamsCount === 5, `Zone 3: Top 5 internal racing teams rendered (got ${topTeamsCount})`);

    const hasGoldMedal = await evaluate("document.getElementById('zone3-top-teams').innerHTML.includes('🥇');");
    assert(hasGoldMedal, "Zone 3: Gold Medal (🥇) team is awarded to #1 Team Phoenix");

    const topIndCount = await evaluate("document.getElementById('zone3-top-individuals').children.length;");
    assert(topIndCount === 10, `Zone 3: Top 10 individual breakout runners rendered (got ${topIndCount})`);

    // Zone 4: Violation Queues
    const zone4Visible = await evaluate("document.getElementById('race-zone4-governance') !== null;");
    assert(zone4Visible, "Zone 4: Governance & Violation Queues container is rendered");

    const violRowsCount = await evaluate("document.getElementById('zone4-violation-table-body').children.length;");
    assert(violRowsCount === 4, `Zone 4: 4 suspicious activities displayed for referee review (got ${violRowsCount})`);

    // Capture Screenshot 1: Summer Race Dashboard
    await captureScreenshot('screenshot_race_dashboard_summer.png');

    // 4. Test Dynamic Race Switching: Switch to Mùa 9 (race-season-09)
    console.log('\n  --- Testing Dynamic Re-fetch for Mùa 9 (race-season-09) ---');
    await evaluate("switchSelectedRace('race-season-09');");
    await new Promise(r => setTimeout(r, 800));

    const s9Athletes = await evaluate("document.getElementById('zone1-athletes-count').innerText;");
    assert(s9Athletes === '96', `Season 9: Athletes dynamically updated to 96 (got '${s9Athletes}')`);

    const s9Km = await evaluate("document.getElementById('zone1-km-count').innerText;");
    assert(s9Km.includes('18,940') || s9Km.includes('18.940') || s9Km.includes('18940'), `Season 9: Total KM dynamically updated to 18,940 km (got '${s9Km}')`);

    const s9Completion = await evaluate("document.getElementById('zone1-completion-rate').innerText;");
    assert(s9Completion === '92%' || s9Completion === '92.0%', `Season 9: Completion rate dynamically updated to 92% (got '${s9Completion}')`);

    const s9Debt = await evaluate("document.getElementById('zone1-debt-text').innerText;");
    assert(s9Debt.includes('0 VNĐ'), `Season 9: Sổ nợ dynamically updated to 0 VNĐ (got '${s9Debt}')`);

    // Capture Screenshot 2: Techcombank Mùa 9 Switched Dashboard
    await captureScreenshot('screenshot_race_dashboard_techcombank.png');

    // 5. Test Keyboard Shortcut: Ctrl + Shift + R to open Quick Race Picker Dialog
    console.log('\n  --- Testing Keyboard Shortcut Ctrl + Shift + R ---');
    await evaluate(`
      const event = new KeyboardEvent('keydown', {
        key: 'r',
        code: 'KeyR',
        ctrlKey: true,
        shiftKey: true,
        bubbles: true
      });
      window.dispatchEvent(event);
    `);
    await new Promise(r => setTimeout(r, 400));

    const isPickerOpen = await evaluate("!document.getElementById('modal-race-quick-picker').classList.contains('hidden');");
    assert(isPickerOpen, "Ctrl + Shift + R opens Quick Race Picker modal dialog");

    // Test search filter in modal: type "Nội Bộ"
    await evaluate(`
      const input = document.getElementById('quick-race-search-input');
      input.value = 'Nội Bộ';
      filterQuickPickerRaces('Nội Bộ');
    `);
    await new Promise(r => setTimeout(r, 300));

    const visibleItemsCount = await evaluate(`
      Array.from(document.getElementById('quick-race-picker-list').children)
        .filter(c => !c.classList.contains('hidden')).length;
    `);
    assert(visibleItemsCount === 1, `Search filter 'Nội Bộ' filters to 1 tournament (got ${visibleItemsCount})`);

    // Capture Screenshot 3: Race Picker Modal Dialog
    await captureScreenshot('screenshot_race_selector_modal.png');

    // Close modal via Escape key
    await evaluate(`
      const escEvent = new KeyboardEvent('keydown', {
        key: 'Escape',
        code: 'Escape',
        bubbles: true
      });
      window.dispatchEvent(escEvent);
    `);
    await new Promise(r => setTimeout(r, 300));

    const isPickerClosed = await evaluate("document.getElementById('modal-race-quick-picker').classList.contains('hidden');");
    assert(isPickerClosed, "Escape key closes Quick Race Picker modal dialog");

    // 6. Test 1-Touch Export Report Button
    console.log('\n  --- Testing 1-Touch Export Report ---');
    await evaluate("exportSelectedRaceReport();");
    await new Promise(r => setTimeout(r, 500));

    // Capture Screenshot 4: Report Export Toast
    await captureScreenshot('screenshot_race_report_export.png');

    // 7. Test Dual-Theme: Mantis Material UI Parity
    console.log('\n  --- Testing Dual-Theme: Mantis Material UI Parity ---');
    await evaluate("setAppTheme('mantis');");
    await new Promise(r => setTimeout(r, 500));

    const isMantisTheme = await evaluate("document.body.getAttribute('data-theme') === 'mantis';");
    assert(isMantisTheme, "Mantis Material UI theme activated successfully");

    // Verify Race Selector Bar renders under Mantis theme
    const mantisBarVisible = await evaluate("!document.getElementById('global-race-selector-bar').classList.contains('hidden');");
    assert(mantisBarVisible, "Global Race Selector Bar is visible under Mantis theme");

    // Capture Screenshot 5: Mantis Material UI Race Dashboard
    await captureScreenshot('screenshot_race_dashboard_mantis.png');

    // Reset back to sport theme
    await evaluate("setAppTheme('sport');");
    await new Promise(r => setTimeout(r, 300));

    ws.close();
  } finally {
    chromeProc.kill();
  }
}

async function runAll() {
  console.log('######################################################');
  console.log('### OPENRACE SAAS - MULTI-SELECTION RACE DASHBOARD E2E ###');
  console.log('######################################################');

  await testRaceDashboardRestApis();
  await testHeadlessChromeUI();

  console.log('\n======================================================');
  console.log('>>> FINAL TEST RESULTS');
  console.log('======================================================');
  console.log(`Total Assertions: ${totalTests}`);
  console.log(`Passed:           \x1b[32m${passedTests}\x1b[0m`);
  console.log(`Failed:           \x1b[${failedTests === 0 ? '32m' : '31m'}${failedTests}\x1b[0m`);

  if (failedTests === 0) {
    console.log('\n\x1b[32m[✓] 100% E2E VERIFICATION PASSED FOR MULTI-SELECTION RACE DASHBOARD!\x1b[0m\n');
    process.exit(0);
  } else {
    console.error(`\n\x1b[31m[✕] ${failedTests} test assertions failed!\x1b[0m\n`);
    process.exit(1);
  }
}

runAll().catch((err) => {
  console.error('Fatal E2E test execution error:', err);
  process.exit(1);
});
