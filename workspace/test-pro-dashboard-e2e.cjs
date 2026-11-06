/**
 * Pro Runner Dashboard Strategic Widgets & UX Workflow E2E Test Suite
 * Tests live REST APIs on port 3001 and UI on port 3000 via Headless Chrome CDP
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

async function testProRunnerRestApis() {
  console.log('\n======================================================');
  console.log('>>> [1/2] TESTING LIVE PRO RUNNER REST APIS (PORT 3001)');
  console.log('======================================================\n');

  // 1. GET /api/me/training-load
  let load;
  try {
    const res = await fetch(`${API_BASE}/api/me/training-load`);
    load = await res.json();
    assert(res.status === 200, 'GET /api/me/training-load returns HTTP 200');
    assert(load.athleteId === 'user-01', 'Athlete ID is user-01');
    assert(load.trainingStatus === 'Productive', 'Training status is Productive');
    assert(load.loadRatio >= 0.8 && load.loadRatio <= 1.3, `ACWR load ratio ${load.loadRatio} is in optimal zone`);
    assert(load.recoveryHours >= 16 && load.recoveryHours <= 24, `Recovery hours is ${load.recoveryHours}h`);
    assert(load.vo2Max === 52.4, `VO2 Max is 52.4 mL/kg/min`);
    assert(load.predictedRaceTimes.halfMarathon21k === '01:42:15', 'HM 21K predicted time is 01:42:15');
    assert(load.hrZonesLast7Days && load.hrZonesLast7Days.length === 5, 'Contains 5 Heart Rate Zones distribution');
  } catch (err) {
    assert(false, `GET /api/me/training-load error: ${err.message}`);
  }

  // 2. POST /api/me/training-load/refresh
  try {
    const res = await fetch(`${API_BASE}/api/me/training-load/refresh`, { method: 'POST' });
    const refreshed = await res.json();
    assert(res.status === 200, 'POST /api/me/training-load/refresh returns HTTP 200');
    assert(refreshed.lastSyncAt !== undefined, 'lastSyncAt updated successfully');
    assert(refreshed.acuteLoad > 0, 'acuteLoad recalculated');
  } catch (err) {
    assert(false, `POST /api/me/training-load/refresh error: ${err.message}`);
  }

  // 3. GET /api/me/shoes
  let shoes = [];
  try {
    const res = await fetch(`${API_BASE}/api/me/shoes`);
    shoes = await res.json();
    assert(res.status === 200, 'GET /api/me/shoes returns HTTP 200');
    assert(Array.isArray(shoes) && shoes.length >= 4, `User has ${shoes.length} running shoes in rotation`);
    const defaultShoe = shoes.find(s => s.isDefault);
    assert(defaultShoe && defaultShoe.name.includes('Alphafly'), `Default shoe is ${defaultShoe?.name}`);
    assert(defaultShoe && defaultShoe.warningLevel === 'CAUTION', 'Default shoe has CAUTION wear warning level');
    const adios = shoes.find(s => s.name.includes('Adios Pro'));
    assert(adios && adios.warningLevel === 'REPLACE', 'Adios Pro has REPLACE warning level (> 90%)');
  } catch (err) {
    assert(false, `GET /api/me/shoes error: ${err.message}`);
  }

  // 4. POST /api/me/shoes (Create new shoe)
  let createdShoe;
  try {
    const res = await fetch(`${API_BASE}/api/me/shoes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        brand: 'Hoka',
        name: 'Hoka Cielo X1',
        category: 'race_day',
        currentDistanceKm: 25.0,
        maxDistanceKm: 600.0,
        isDefault: false
      })
    });
    createdShoe = await res.json();
    assert(res.status === 201, 'POST /api/me/shoes returns HTTP 201 Created');
    assert(createdShoe.name === 'Hoka Cielo X1', 'Created shoe name is Hoka Cielo X1');
    assert(createdShoe.warningLevel === 'SAFE', 'New shoe warning level is SAFE');
  } catch (err) {
    assert(false, `POST /api/me/shoes error: ${err.message}`);
  }

  // 5. POST /api/me/shoes/:id/set-default
  try {
    const res = await fetch(`${API_BASE}/api/me/shoes/${createdShoe.id}/set-default`, { method: 'POST' });
    const defShoe = await res.json();
    assert(res.status === 200, 'POST /api/me/shoes/:id/set-default returns HTTP 200');
    assert(defShoe.isDefault === true, 'Hoka Cielo X1 is now default shoe');

    // Switch back to Nike Alphafly for test consistency
    const alphafly = shoes.find(s => s.name.includes('Alphafly'));
    if (alphafly) {
      await fetch(`${API_BASE}/api/me/shoes/${alphafly.id}/set-default`, { method: 'POST' });
    }
  } catch (err) {
    assert(false, `POST /api/me/shoes/:id/set-default error: ${err.message}`);
  }

  // 6. POST /api/me/nutrition-plan
  try {
    const res = await fetch(`${API_BASE}/api/me/nutrition-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        distanceKm: 21.1,
        paceMinPerKm: 5.5,
        temperatureC: 28,
        humidity: 75,
        runnerWeightKg: 65
      })
    });
    const plan = await res.json();
    assert(res.status === 200, 'POST /api/me/nutrition-plan returns HTTP 200');
    assert(plan.estimatedDurationFormatted === '1 giờ 56 phút', `Estimated duration: ${plan.estimatedDurationFormatted}`);
    assert(plan.estimatedCaloriesBurned >= 1400, `Calories burned: ${plan.estimatedCaloriesBurned} kcal`);
    assert(plan.recommendedWaterMl >= 1200, `Hydration recommendation: ${plan.recommendedWaterMl} ml`);
    assert(plan.recommendedGelCount >= 2, `Energy Gel packets: ${plan.recommendedGelCount}`);
    assert(plan.intakeSchedule.tips.length >= 3, 'Includes comprehensive fueling tips');
  } catch (err) {
    assert(false, `POST /api/me/nutrition-plan error: ${err.message}`);
  }

  // 7. GET /api/me/milestones-streak
  let milestones;
  try {
    const res = await fetch(`${API_BASE}/api/me/milestones-streak`);
    milestones = await res.json();
    assert(res.status === 200, 'GET /api/me/milestones-streak returns HTTP 200');
    assert(milestones.currentStreakDays === 14, `Running streak is ${milestones.currentStreakDays} continuous days`);
    assert(milestones.seasonTotalKm === 921.5, `Season total is ${milestones.seasonTotalKm} km`);
    assert(milestones.remainingKmToMilestone === 78.5, `Remaining km to 1,000km milestone: ${milestones.remainingKmToMilestone} km`);
    assert(milestones.recentBadges.length >= 4, `Runner has ${milestones.recentBadges.length} earned badges`);
  } catch (err) {
    assert(false, `GET /api/me/milestones-streak error: ${err.message}`);
  }

  // 8. GET /api/me/badges/:badgeCode/certificate
  try {
    const res = await fetch(`${API_BASE}/api/me/badges/HM_SUB_145/certificate`);
    const cert = await res.json();
    assert(res.status === 200, 'GET /api/me/badges/HM_SUB_145/certificate returns HTTP 200');
    assert(cert.success === true, 'Certificate generation success is true');
    assert(cert.certificate.athleteName === 'Nguyễn Văn A', 'Athlete name is Nguyen Van A');
    assert(cert.certificate.badgeTitle === '🏅 Finisher 21K Sub-1:45', 'Badge title verified');
    assert(cert.shareContent.includes('OpenRace'), 'Social share content generated');
  } catch (err) {
    assert(false, `GET /api/me/badges/:badgeCode/certificate error: ${err.message}`);
  }
}

async function testHeadlessChromeUI() {
  console.log('\n======================================================');
  console.log('>>> [2/2] TESTING FRONTEND VIA HEADLESS CHROME CDP (PORT 3000)');
  console.log('======================================================\n');

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const cdpPort = 9336;

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
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        }
      } catch (err) {}
    };

    await new Promise((resolve) => { ws.onopen = resolve; });

    function sendCmd(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = msgId++;
        pending.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await sendCmd('Page.enable');
    await sendCmd('Runtime.enable');

    // Wait until document.readyState === 'complete'
    for (let i = 0; i < 30; i++) {
      const readyState = await sendCmd('Runtime.evaluate', {
        expression: 'document.readyState',
        returnByValue: true
      });
      if (readyState?.result?.value === 'complete') break;
      await new Promise(r => setTimeout(r, 200));
    }

    // Wait for async loadProRunnerDashboardData()
    await new Promise(r => setTimeout(r, 800));

    // 1. Verify Sport Cam Dashboard Pro Widgets Hub
    const sportHubCheck = await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        const hub = document.getElementById('openrace-pro-runner-hub');
        const w1 = document.getElementById('widget-training-load');
        const w2 = document.getElementById('widget-shoe-tracker');
        const w3 = document.getElementById('widget-nutrition-planner');
        const w4 = document.getElementById('widget-milestones-streak');
        const shoeName = document.getElementById('w2-shoe-name')?.textContent;
        const streakDays = document.getElementById('w4-streak-days')?.textContent;
        return {
          hasHub: !!hub,
          hasW1: !!w1,
          hasW2: !!w2,
          hasW3: !!w3,
          hasW4: !!w4,
          shoeName,
          streakDays
        };
      })()`,
      returnByValue: true
    });

    const sHub = sportHubCheck?.result?.value;
    assert(sHub && sHub.hasHub, '#openrace-pro-runner-hub exists on Sport Cam Dashboard');
    assert(sHub && sHub.hasW1, 'Widget 1: Training Load & Recovery Tracker rendered');
    assert(sHub && sHub.hasW2, 'Widget 2: Shoe Mileage Tracker rendered');
    assert(sHub && sHub.hasW3, 'Widget 3: Hydration & Nutrition Planner rendered');
    assert(sHub && sHub.hasW4, 'Widget 4: Personal Milestone & Streak Dashboard rendered');
    assert(sHub && sHub.shoeName && sHub.shoeName.includes('Alphafly'), `Active shoe displayed: ${sHub?.shoeName}`);
    assert(sHub && sHub.streakDays === '14', `Current streak displayed: ${sHub?.streakDays} days`);

    // Capture Sport Cam Pro Dashboard Widgets Screenshot
    const shotSport = await sendCmd('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'screenshot_sport_pro_dashboard_widgets.png'), Buffer.from(shotSport.data, 'base64'));
    console.log('  📸 Captured screenshot_sport_pro_dashboard_widgets.png');

    // 2. Switch to Mantis UI theme and verify Mantis Pro Widgets Hub
    await sendCmd('Runtime.evaluate', {
      expression: `setAppTheme('mantis')`
    });
    await new Promise(r => setTimeout(r, 500));

    const mantisHubCheck = await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        const hub = document.getElementById('mantis-pro-runner-hub');
        const mw1 = document.getElementById('mantis-widget-training-load');
        const mw2 = document.getElementById('mantis-widget-shoe-tracker');
        const mw3 = document.getElementById('mantis-widget-nutrition-planner');
        const mw4 = document.getElementById('mantis-widget-milestones-streak');
        return {
          hasHub: !!hub,
          hasW1: !!mw1,
          hasW2: !!mw2,
          hasW3: !!mw3,
          hasW4: !!mw4
        };
      })()`,
      returnByValue: true
    });

    const mHub = mantisHubCheck?.result?.value;
    assert(mHub && mHub.hasHub, '#mantis-pro-runner-hub exists on Mantis Dashboard');
    assert(mHub && mHub.hasW1, 'Mantis Widget 1: Training Load rendered');
    assert(mHub && mHub.hasW2, 'Mantis Widget 2: Shoe Tracker rendered');
    assert(mHub && mHub.hasW3, 'Mantis Widget 3: Nutrition Planner rendered');
    assert(mHub && mHub.hasW4, 'Mantis Widget 4: Milestone & Streak rendered');

    // Capture Mantis Pro Dashboard Widgets Screenshot
    const shotMantis = await sendCmd('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'screenshot_mantis_pro_dashboard_widgets.png'), Buffer.from(shotMantis.data, 'base64'));
    console.log('  📸 Captured screenshot_mantis_pro_dashboard_widgets.png');

    // 3. Test Modal 1: HR Zones & ACWR Load Details
    await sendCmd('Runtime.evaluate', {
      expression: `openHrZonesModal()`
    });
    await new Promise(r => setTimeout(r, 400));

    const hrModalCheck = await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        const m = document.getElementById('modal-hr-zones');
        const isVisible = m && !m.classList.contains('hidden');
        return { isVisible };
      })()`,
      returnByValue: true
    });
    assert(hrModalCheck?.result?.value?.isVisible, 'Modal 1: HR Zones & ACWR opened and visible');

    const shotHr = await sendCmd('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'screenshot_modal_hr_zones.png'), Buffer.from(shotHr.data, 'base64'));
    console.log('  📸 Captured screenshot_modal_hr_zones.png');

    await sendCmd('Runtime.evaluate', { expression: `closeHrZonesModal()` });
    await new Promise(r => setTimeout(r, 200));

    // 4. Test Modal 2: Shoe Mileage Tracker & Management
    await sendCmd('Runtime.evaluate', {
      expression: `openShoeManagerModal()`
    });
    await new Promise(r => setTimeout(r, 400));

    const shoeModalCheck = await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        const m = document.getElementById('modal-shoe-manager');
        const isVisible = m && !m.classList.contains('hidden');
        const shoeCount = document.querySelectorAll('#shoe-list-container > div').length;
        return { isVisible, shoeCount };
      })()`,
      returnByValue: true
    });
    const sM = shoeModalCheck?.result?.value;
    assert(sM && sM.isVisible, 'Modal 2: Shoe Manager opened and visible');
    assert(sM && sM.shoeCount >= 4, `Shoe Manager rendered ${sM?.shoeCount} shoes`);

    const shotShoe = await sendCmd('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'screenshot_modal_shoe_manager.png'), Buffer.from(shotShoe.data, 'base64'));
    console.log('  📸 Captured screenshot_modal_shoe_manager.png');

    await sendCmd('Runtime.evaluate', { expression: `closeShoeManagerModal()` });
    await new Promise(r => setTimeout(r, 200));

    // 5. Test Modal 3: Hydration & Fueling Planner
    await sendCmd('Runtime.evaluate', {
      expression: `openNutritionModal()`
    });
    await new Promise(r => setTimeout(r, 400));

    const nutrModalCheck = await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        const m = document.getElementById('modal-nutrition-planner');
        const isVisible = m && !m.classList.contains('hidden');
        const water = document.getElementById('nutr-res-water')?.textContent;
        const gel = document.getElementById('nutr-res-gel')?.textContent;
        return { isVisible, water, gel };
      })()`,
      returnByValue: true
    });
    const nM = nutrModalCheck?.result?.value;
    assert(nM && nM.isVisible, 'Modal 3: Nutrition Planner opened and visible');
    assert(nM && nM.water && (nM.water.includes('14') || nM.water.includes('1,4')), `Calculated water: ${nM?.water}`);
    assert(nM && nM.gel && (nM.gel.includes('2') || nM.gel.includes('3')), `Calculated energy gels: ${nM?.gel}`);

    const shotNutr = await sendCmd('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'screenshot_modal_nutrition_planner.png'), Buffer.from(shotNutr.data, 'base64'));
    console.log('  📸 Captured screenshot_modal_nutrition_planner.png');

    await sendCmd('Runtime.evaluate', { expression: `closeNutritionModal()` });
    await new Promise(r => setTimeout(r, 200));

    // 6. Test Modal 4: Digital Finisher Certificate & Social Share
    await sendCmd('Runtime.evaluate', {
      expression: `openBadgeShareModal('HM_SUB_145')`
    });
    await new Promise(r => setTimeout(r, 400));

    const certModalCheck = await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        const m = document.getElementById('modal-badge-share');
        const isVisible = m && !m.classList.contains('hidden');
        const title = document.getElementById('cert-badge-title')?.textContent;
        const tag = document.getElementById('cert-code-tag')?.textContent;
        return { isVisible, title, tag };
      })()`,
      returnByValue: true
    });
    const cM = certModalCheck?.result?.value;
    assert(cM && cM.isVisible, 'Modal 4: Digital Certificate & Badge Share opened and visible');
    assert(cM && cM.title && cM.title.includes('Finisher 21K'), `Certificate title: ${cM?.title}`);
    assert(cM && cM.tag && cM.tag.includes('VERIFIED'), `Certificate verified tag: ${cM?.tag}`);

    const shotCert = await sendCmd('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'screenshot_modal_badge_certificate.png'), Buffer.from(shotCert.data, 'base64'));
    console.log('  📸 Captured screenshot_modal_badge_certificate.png');

    await sendCmd('Runtime.evaluate', { expression: `closeBadgeShareModal()` });
    await new Promise(r => setTimeout(r, 200));

    // 7. Test Drawer 5: Widget Customizer
    await sendCmd('Runtime.evaluate', {
      expression: `openWidgetCustomizer()`
    });
    await new Promise(r => setTimeout(r, 400));

    const drawerCheck = await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        const d = document.getElementById('drawer-dashboard-customizer');
        const isVisible = d && !d.classList.contains('hidden');
        const checkCount = d ? d.querySelectorAll('input[type="checkbox"]').length : 0;
        return { isVisible, checkCount };
      })()`,
      returnByValue: true
    });
    const dM = drawerCheck?.result?.value;
    assert(dM && dM.isVisible, 'Drawer 5: Widget Customizer opened and visible');
    assert(dM && dM.checkCount === 5, `Widget customizer has ${dM?.checkCount} toggle controls`);

    const shotDrawer = await sendCmd('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'screenshot_drawer_widget_customizer.png'), Buffer.from(shotDrawer.data, 'base64'));
    console.log('  📸 Captured screenshot_drawer_widget_customizer.png');

    await sendCmd('Runtime.evaluate', { expression: `closeWidgetCustomizer()` });
    await new Promise(r => setTimeout(r, 200));

    // 8. Test Mobile Sticky Bottom Action Bar
    const bottomBarCheck = await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        const bar = document.getElementById('mobile-bottom-bar');
        const buttons = bar ? bar.querySelectorAll('button').length : 0;
        return { hasBar: !!bar, buttons };
      })()`,
      returnByValue: true
    });
    const bM = bottomBarCheck?.result?.value;
    assert(bM && bM.hasBar, 'Mobile Bottom Action Bar #mobile-bottom-bar exists');
    assert(bM && bM.buttons === 5, `Mobile Bottom Bar has ${bM?.buttons} one-tap action buttons (Sync, Submit, QR, PacerBot, Customize)`);

    ws.close();
  } catch (err) {
    console.error('Headless Chrome CDP error:', err.message);
    assert(false, `Headless Chrome CDP error: ${err.message}`);
  } finally {
    try {
      chromeProc.kill('SIGKILL');
    } catch (e) {}
  }
}

async function main() {
  console.log('================================================================');
  console.log('OPENRACE PRO RUNNER DASHBOARD & STRATEGIC WIDGETS E2E TEST');
  console.log('================================================================');

  await testProRunnerRestApis();
  await testHeadlessChromeUI();

  console.log('\n------------------------------------------------------');
  console.log(`E2E TEST SUMMARY: ${passedTests}/${totalTests} PASSED (${failedTests} FAILED)`);
  console.log('------------------------------------------------------\n');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    console.log('🎉 ALL PRO RUNNER DASHBOARD & STRATEGIC WIDGETS E2E TESTS PASSED 100%!\n');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Fatal E2E runner error:', err);
  process.exit(1);
});
