const fs = require('fs');
const path = require('path');

const e2ePath = path.resolve(__dirname, '../workspace/test-e2e-all.cjs');
let content = fs.readFileSync(e2ePath, 'utf8');

// 1. Add Subsystem 3 backend API tests
const backendP3Tests = `
  // 21. [3.1] GET /api/me/activities (Subsystem 3.0)
  try {
    const resActs = await fetch(\`\${API_BASE}/api/me/activities\`);
    const dataActs = await resActs.json();
    assert(resActs.status === 200 && Array.isArray(dataActs), 'GET /api/me/activities returns array of activities');
    assert(dataActs.length >= 4, 'Activity feed returns all seeded runs (>= 4)');
  } catch (err) {
    assert(false, \`GET /api/me/activities error: \${err.message}\`);
  }

  // 22. [3.1] GET /api/me/activities with valid/invalid filters
  try {
    const resValid = await fetch(\`\${API_BASE}/api/me/activities?filter=valid\`);
    const dataValid = await resValid.json();
    assert(resValid.status === 200 && dataValid.every(a => a.isValid), 'Filter valid returns only valid runs');

    const resInvalid = await fetch(\`\${API_BASE}/api/me/activities?filter=invalid\`);
    const dataInvalid = await resInvalid.json();
    assert(resInvalid.status === 200 && dataInvalid.every(a => !a.isValid), 'Filter invalid returns only rejected runs');
  } catch (err) {
    assert(false, \`GET /api/me/activities filter error: \${err.message}\`);
  }

  // 23. [3.3] GET /api/activities/:id (Audit detail)
  try {
    const resDetail = await fetch(\`\${API_BASE}/api/activities/act-000075\`);
    const detail = await resDetail.json();
    assert(resDetail.status === 200 && detail.id === 'act-000075', 'GET /api/activities/:id returns activity audit detail');
    assert(detail.trailBonusKm === 2.0 && detail.finalCreditedKm === 10.0, 'Audit detail includes +2.0 km Trail Bonus');
  } catch (err) {
    assert(false, \`GET /api/activities/:id error: \${err.message}\`);
  }

  // 24. [3.4] POST /api/activities/:id/appeal
  try {
    const resAppeal = await fetch(\`\${API_BASE}/api/activities/act-000073/appeal\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reason: 'GPS bị ngắt quãng tại công viên',
        evidenceUrl: 'https://strava.com/activities/889973'
      })
    });
    const dataAppeal = await resAppeal.json();
    assert(resAppeal.status === 200 && dataAppeal.success === true, 'POST /api/activities/:id/appeal submits appeal successfully');
    assert(dataAppeal.appeal.status === 'OPEN', 'Generated appeal has status OPEN');
  } catch (err) {
    assert(false, \`POST /api/activities/:id/appeal error: \${err.message}\`);
  }
`;

content = content.replace(
  "assert(resBc.status === 200 && dataBc.broadcasted === true, 'POST /api/races/:slug/stream/broadcast succeeds');\n  } catch (err) {\n    assert(false, `POST /api/races/:slug/stream/broadcast error: ${err.message}`);\n  }",
  "assert(resBc.status === 200 && dataBc.broadcasted === true, 'POST /api/races/:slug/stream/broadcast succeeds');\n  } catch (err) {\n    assert(false, `POST /api/races/:slug/stream/broadcast error: ${err.message}`);\n  }\n" + backendP3Tests
);

// 2. Add Subsystem 3 frontend interaction tests
const frontendP3Tests = `
    // 3.3 [Phân hệ 3.0] NHẬT KÝ BÀI CHẠY & THẨM ĐỊNH (ACTIVITY FEED) FRONTEND TESTING
    console.log('Testing [3.0] Activity Feed Sub-Features (3.1 - 3.4)...');
    await evalJs('window.switchTab("activities")');

    // [3.1] Filter buttons (Tất cả, Hợp lệ, Bị loại)
    await evalJs('window.setActivityFilter("valid")');
    const validContainerText = await evalJs('document.getElementById("activities-container")?.innerText');
    assert(validContainerText.includes('HỢP LỆ') && !validContainerText.includes('BỊ LOẠI'), 'Filter valid displays only valid activities');

    await evalJs('window.setActivityFilter("invalid")');
    const invalidContainerText = await evalJs('document.getElementById("activities-container")?.innerText');
    assert(invalidContainerText.includes('BỊ LOẠI'), 'Filter invalid displays rejected activities');

    await evalJs('window.setActivityFilter("all")');
    const allContainerText = await evalJs('document.getElementById("activities-container")?.innerText');
    assert(allContainerText.includes('HỢP LỆ') && allContainerText.includes('BỊ LOẠI'), 'Filter all displays both valid and rejected activities');

    // [3.3] Tabular Metrics & Status Badges
    assert(allContainerText.includes('TRAIL'), 'Activities feed displays Trail Bonus badge');
    assert(allContainerText.includes('Pace < 2:45'), 'Activities feed displays System Pace Floor violation alert (< 2:45)');

    // [3.4] Submit Appeal Drawer
    await evalJs('window.openAppealDrawer("act-4")');
    const drawerOpen = await evalJs('!document.getElementById("appeal-drawer")?.classList.contains("hidden")');
    assert(drawerOpen === true, 'Appeal Drawer opens smoothly');

    await evalJs('window.closeAppealDrawer()');
    const drawerClosed = await evalJs('document.getElementById("appeal-drawer")?.classList.contains("hidden")');
    assert(drawerClosed === true, 'Appeal Drawer closes cleanly');

    await evalJs('window.openAppealDrawer("act-4")');
    await evalJs('window.submitAppealDrawer()');
    await new Promise(r => setTimeout(r, 400));
    const postAppealText = await evalJs('document.getElementById("activities-container")?.innerText');
    assert(postAppealText.includes('CHỜ DUYỆT KHIẾU NẠI'), 'Submitted appeal updates activity status badge to Pending');

    // 3.4 SIDEBAR & NAVIGATION CODES [1.0] -> [8.0] TESTING
    console.log('Testing Navigation Hierarchy & Module Codes [1.0] -> [8.0]...');
    const sidebarText = await evalJs('document.getElementById("main-sidebar")?.innerText');
    assert(sidebarText !== null && sidebarText.length > 0, 'Sidebar is present and visible in DOM');
    assert(sidebarText.includes('[1.0]') && sidebarText.includes('[2.0]') && sidebarText.includes('[3.0]'), 'Sidebar contains Module Codes [1.0], [2.0], [3.0]');
    assert(sidebarText.includes('[4.0]') && sidebarText.includes('[5.0]') && sidebarText.includes('[6.0]'), 'Sidebar contains Module Codes [4.0], [5.0], [6.0]');
    assert(sidebarText.includes('[7.0]') && sidebarText.includes('[8.0]'), 'Sidebar contains Module Codes [7.0], [8.0]');
    assert(sidebarText.includes('[1.1]') && sidebarText.includes('[2.1]') && sidebarText.includes('[3.1]'), 'Sidebar contains Sub-menu Codes [1.1], [2.1], [3.1]');

    // Header Segmented Nav
    const navText = await evalJs('document.querySelector("header nav")?.innerText');
    assert(navText.includes('[1.0]') && navText.includes('[2.0]') && navText.includes('[3.0]'), 'Header Segmented Nav displays module pill buttons with codes');
`;

content = content.replace(
  "// 4. Interactive Rule Simulator Testing (Rules tab)",
  frontendP3Tests + "\n    // 4. Interactive Rule Simulator Testing (Rules tab)"
);

fs.writeFileSync(e2ePath, content, 'utf8');
console.log('Successfully patched workspace/test-e2e-all.cjs with Subsystem 3 & Navigation tests!');

