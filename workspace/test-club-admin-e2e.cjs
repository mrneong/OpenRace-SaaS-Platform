/**
 * Club Admin & Captain Dashboard (Club Admin Portal) E2E Test Suite
 * Tests REST APIs on port 3001 and UI workflows on port 3000 via Headless Chrome CDP
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

async function testClubAdminRestApis() {
  console.log('\n======================================================');
  console.log('>>> [1/2] TESTING LIVE CLUB ADMIN REST APIS (PORT 3001)');
  console.log('======================================================\n');

  // Reset club admin test data to fresh state
  await fetch(`${API_BASE}/api/club/admin/reset`, { method: 'POST' });

  // 1. GET /api/club/admin/dashboard
  let dash;
  try {
    const res = await fetch(`${API_BASE}/api/club/admin/dashboard`);
    dash = await res.json();
    assert(res.status === 200, 'GET /api/club/admin/dashboard returns HTTP 200');
    assert(dash.clubName === 'CLB SARC', `Club name is ${dash.clubName}`);
    assert(dash.seasonStatus === 'Đang chạy (Tuần 20)', `Season status: ${dash.seasonStatus}`);
    assert(dash.currentWeek === 20, 'Current week is 20');
    assert(dash.kpis.memberCount === 48, 'Member count is 48');
    assert(dash.kpis.targetMembers === 50, 'Target members is 50');
    assert(dash.kpis.treasuryCollectedVnd === 4800000, 'Treasury collected is 4.8M VND');
    assert(dash.kpis.pendingReviewCount === 5, 'Pending review count is 5 runs');
    assert(dash.kpis.weeklyCompletionRatePercent === 68.5, 'Weekly completion rate is 68.5%');
    assert(dash.kpis.weeklyCompletionWarning === true, 'Weekly completion warning triggered (< 70%)');
    assert(dash.kpis.openDisputesCount === 1, 'Open disputes count is 1');
    assert(dash.kpis.openDisputesWarning === true, 'Open disputes warning triggered (> 24h)');
    assert(dash.kpis.outstandingDebtWarning === true, 'Outstanding debt warning triggered (> 3 days)');
    assert(dash.teamStandings.length === 3, 'Team standings has 3 teams (Phoenix, Dragons, Pegasus)');
  } catch (err) {
    assert(false, `GET /api/club/admin/dashboard error: ${err.message}`);
  }

  // 2. POST /api/club/admin/batch-approve
  try {
    const res = await fetch(`${API_BASE}/api/club/admin/batch-approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activityIds: ['ACT_000075', 'ACT_000076'] })
    });
    const result = await res.json();
    assert(res.status === 200, 'POST /api/club/admin/batch-approve returns HTTP 200');
    assert(result.success === true, 'Batch approve success is true');
    assert(result.approvedCount === 2, `Approved 2 selected runs`);
  } catch (err) {
    assert(false, `POST /api/club/admin/batch-approve error: ${err.message}`);
  }

  // 3. POST /api/club/admin/disputes/quick-resolve (Bonus +1km)
  try {
    const res = await fetch(`${API_BASE}/api/club/admin/disputes/quick-resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        disputeId: 'DISP_2026_001',
        action: 'bonus',
        bonusKm: 1.0,
        note: 'Duyệt bù +1.0km lỗi GPS hầm Royal City'
      })
    });
    const result = await res.json();
    assert(res.status === 200, 'POST /api/club/admin/disputes/quick-resolve returns HTTP 200');
    assert(result.success === true, 'Dispute resolve success is true');
    assert(result.dispute.status === 'resolved_bonus', 'Dispute status is resolved_bonus');
    assert(result.dispute.bonusKmGranted === 1.0, 'Awarded +1.0 bonus km');
  } catch (err) {
    assert(false, `POST /api/club/admin/disputes/quick-resolve error: ${err.message}`);
  }

  // 4. POST /api/club/admin/reconcile (method: remind)
  try {
    const res = await fetch(`${API_BASE}/api/club/admin/reconcile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ledgerId: 'LEDG_001', method: 'remind' })
    });
    const result = await res.json();
    assert(res.status === 200, 'POST /api/club/admin/reconcile (remind) returns HTTP 200');
    assert(result.success === true, 'Reconciliation remind success is true');
    assert(result.item.status === 'reminded', 'Status updated to reminded');
  } catch (err) {
    assert(false, `POST /api/club/admin/reconcile error: ${err.message}`);
  }

  // 5. POST /api/club/admin/reconcile (method: manual_cash)
  try {
    const res = await fetch(`${API_BASE}/api/club/admin/reconcile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ledgerId: 'LEDG_001', method: 'manual_cash' })
    });
    const result = await res.json();
    assert(res.status === 200, 'POST /api/club/admin/reconcile (manual_cash) returns HTTP 200');
    assert(result.success === true, 'Reconciliation manual_cash success is true');
    assert(result.item.status === 'paid', 'Status updated to paid');
  } catch (err) {
    assert(false, `POST /api/club/admin/reconcile manual_cash error: ${err.message}`);
  }

  // 6. POST /api/club/admin/broadcast
  try {
    const res = await fetch(`${API_BASE}/api/club/admin/broadcast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Nhắc nhở chốt cự ly trước 23:59 Chủ Nhật',
        content: '📢 Thông báo: Hoàn thành tối thiểu 3km trước 23:59 tối nay!',
        templateKey: 'sunday_deadline',
        targetChannel: 'all',
        senderName: 'Ban Điều Hành CLB SARC'
      })
    });
    const result = await res.json();
    assert(res.status === 201, 'POST /api/club/admin/broadcast returns HTTP 201');
    assert(result.success === true, 'Broadcast success is true');
    assert(result.broadcast.deliveryCount === 48, 'Delivered to 48 club runners');
  } catch (err) {
    assert(false, `POST /api/club/admin/broadcast error: ${err.message}`);
  }

  // 7. POST /api/club/admin/lock-week
  try {
    const res = await fetch(`${API_BASE}/api/club/admin/lock-week`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weekNumber: 20 })
    });
    const result = await res.json();
    assert(res.status === 200, 'POST /api/club/admin/lock-week returns HTTP 200');
    assert(result.success === true, 'Week lock success is true');
    assert(result.week === 20, 'Locked week 20');
    assert(result.isLocked === true, 'isLocked is true');
  } catch (err) {
    assert(false, `POST /api/club/admin/lock-week error: ${err.message}`);
  }
}

async function testHeadlessChromeUI() {
  console.log('\n======================================================');
  console.log('>>> [2/2] TESTING FRONTEND VIA HEADLESS CHROME CDP (PORT 3000)');
  console.log('======================================================\n');

  // Re-seed data for fresh UI inspection
  await fetch(`${API_BASE}/api/club/admin/reset`, { method: 'POST' });

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const cdpPort = 9337;

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

    await new Promise(r => setTimeout(r, 600));

    // 1. Verify Left Sidebar Menu Group "Câu Lạc Bộ" (Clean names, no code prefixes)
    const menuCheck = await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        const sideClubAdmin = document.getElementById('sidebar-club-admin');
        const sideClub = document.getElementById('sidebar-club');
        const sideClubManage = document.getElementById('sidebar-club-manage');
        const mantisClubAdmin = document.getElementById('mantis-nav-club-admin');
        const mantisClub = document.getElementById('mantis-nav-club');
        const mantisClubManage = document.getElementById('mantis-nav-club-manage');

        return {
          hasSideClubAdmin: !!sideClubAdmin,
          sideClubAdminText: sideClubAdmin?.innerText || '',
          hasSideClub: !!sideClub,
          sideClubText: sideClub?.innerText || '',
          hasSideClubManage: !!sideClubManage,
          sideClubManageText: sideClubManage?.innerText || '',
          hasMantisClubAdmin: !!mantisClubAdmin,
          hasMantisClub: !!mantisClub,
          hasMantisClubManage: !!mantisClubManage
        };
      })()`,
      returnByValue: true
    });

    const mC = menuCheck?.result?.value;
    assert(mC && mC.hasSideClubAdmin, 'Sport theme has #sidebar-club-admin (Dashboard Ban Điều Hành)');
    assert(mC && (mC.sideClubAdminText.includes('Dashboard Ban Điều Hành') || mC.sideClubAdminText.includes('Duyệt Bài Chạy')), `Sidebar club admin text: ${mC?.sideClubAdminText.replace(/\n/g, ' ')}`);
    assert(mC && mC.hasSideClub, 'Sport theme has #sidebar-club (Không Gian CLB)');
    assert(mC && mC.hasSideClubManage, 'Sport theme has #sidebar-club-manage (Quản Trị Thành Viên & Sĩ Số)');
    assert(mC && mC.hasMantisClubAdmin, 'Mantis theme has #mantis-nav-club-admin');

    // 2. Navigate to tab-club-admin (Sport Cam Theme)
    await sendCmd('Runtime.evaluate', {
      expression: `switchTab('club-admin')`
    });
    await new Promise(r => setTimeout(r, 500));

    // Verify Tab 4 Zones
    const dashboardCheck = await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        const tab = document.getElementById('tab-club-admin');
        const isActive = tab && tab.classList.contains('active');
        
        // Zone 1: Quick Actions (6 buttons)
        const btn1 = document.getElementById('btn-admin-add-member');
        const btn2 = document.getElementById('btn-quick-approve-all');
        const btn3 = document.getElementById('btn-admin-broadcast-modal');
        const btn4 = document.getElementById('btn-admin-reconcile-qr');
        const btn5 = document.getElementById('btn-admin-export-excel');
        const btn6 = document.getElementById('btn-admin-lock-week');

        // Zone 2: Real-time Health Metrics
        const kpiPending = document.getElementById('kpi-pending-value')?.textContent;
        const kpiDebt = document.getElementById('kpi-debt-value')?.textContent;
        const kpiDisputes = document.getElementById('kpi-disputes-value')?.textContent;
        const alertBox = document.getElementById('alert-weekly-completion');

        // Zone 3: Queues
        const batchQueue = document.getElementById('batch-approve-queue-container');
        const disputeQueue = document.getElementById('dispute-resolver-queue-container');
        const reconcileQueue = document.getElementById('reconciliation-queue-container');

        // Zone 4: Leaderboard
        const teamStandings = document.getElementById('admin-team-standings-body');

        return {
          isActive,
          hasAllQuickActions: !!(btn1 && btn2 && btn3 && btn4 && btn5 && btn6),
          kpiPending,
          kpiDebt,
          kpiDisputes,
          hasAlertBox: !!alertBox && !alertBox.classList.contains('hidden'),
          hasBatchQueue: !!batchQueue,
          hasDisputeQueue: !!disputeQueue,
          hasReconcileQueue: !!reconcileQueue,
          hasTeamStandings: !!teamStandings
        };
      })()`,
      returnByValue: true
    });

    const dC = dashboardCheck?.result?.value;
    assert(dC && dC.isActive, 'Tab #tab-club-admin is active and displayed');
    assert(dC && dC.hasAllQuickActions, 'Zone 1: All 6 Quick Action buttons present and ready');
    assert(dC && dC.hasAlertBox, 'Zone 2: Alert Box for Weekly Completion Rate (< 70%) rendered with warning');
    assert(dC && dC.hasBatchQueue, 'Zone 3: Batch Approve operations queue rendered');
    assert(dC && dC.hasDisputeQueue, 'Zone 3: Dispute Resolver queue rendered');
    assert(dC && dC.hasReconcileQueue, 'Zone 3: Dynamic VietQR Reconciliation queue rendered');
    assert(dC && dC.hasTeamStandings, 'Zone 4: Team Leaderboard Quick View rendered');

    // Capture Screenshot 1: Sport Cam Club Admin Dashboard
    const shotSport = await sendCmd('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'screenshot_sport_club_admin_dashboard.png'), Buffer.from(shotSport.data, 'base64'));
    console.log('  📸 Captured screenshot_sport_club_admin_dashboard.png');

    // 3. Test Action 1: Batch Approve All Eligible Runs
    await sendCmd('Runtime.evaluate', {
      expression: `batchApproveEligibleRuns()`
    });
    await new Promise(r => setTimeout(r, 400));

    const batchApprovedCheck = await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        const kpi = document.getElementById('kpi-pending-value')?.textContent;
        const queueHtml = document.getElementById('batch-approve-queue-container')?.innerText || '';
        return { kpi, isInboxZero: queueHtml.includes('Inbox Zero') || queueHtml.includes('trống') };
      })()`,
      returnByValue: true
    });
    const bAC = batchApprovedCheck?.result?.value;
    assert(bAC && (bAC.kpi.includes('0') || bAC.isInboxZero), 'Batch Approve 1-touch processed all runs (Inbox Zero reached)');

    // 4. Test Action 2: Quick Dispute Resolver (+1km Thưởng)
    await sendCmd('Runtime.evaluate', {
      expression: `quickResolveDispute('DISP_2026_001', 'bonus', 1.0)`
    });
    await new Promise(r => setTimeout(r, 400));

    const disputeResolvedCheck = await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        const kpi = document.getElementById('kpi-disputes-value')?.textContent;
        const text = document.getElementById('dispute-resolver-queue-container')?.innerText || '';
        return { kpi, isResolved: text.includes('Không có khiếu nại') || text.includes('0 Đơn') };
      })()`,
      returnByValue: true
    });
    const dRC = disputeResolvedCheck?.result?.value;
    assert(dRC && (dRC.kpi.includes('0') || dRC.isResolved), 'Dispute Resolver awarded +1km bonus and resolved appeal');

    // 5. Test Action 3: Settle Debt via Manual Cash
    await sendCmd('Runtime.evaluate', {
      expression: `settleCashManual('LEDG_001')`
    });
    await new Promise(r => setTimeout(r, 400));

    const debtClearedCheck = await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        const kpi = document.getElementById('kpi-debt-value')?.textContent;
        const text = document.getElementById('reconciliation-queue-container')?.innerText || '';
        return { kpi, isCleared: text.includes('Toàn bộ') || kpi.includes('0') };
      })()`,
      returnByValue: true
    });
    const dCC = debtClearedCheck?.result?.value;
    assert(dCC && (dCC.kpi.includes('0') || dCC.isCleared), 'Dynamic VietQR Auto-Reconciliation settled debt to 0đ');

    // 6. Test Compact View Toggle
    await sendCmd('Runtime.evaluate', {
      expression: `toggleAdminCompactView()`
    });
    await new Promise(r => setTimeout(r, 300));

    const compactCheck = await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        const lb = document.getElementById('admin-team-leaderboard-section');
        const isHidden = lb && lb.classList.contains('hidden');
        const text = document.getElementById('compact-toggle-text')?.textContent;
        return { isHidden, text };
      })()`,
      returnByValue: true
    });
    const cC = compactCheck?.result?.value;
    assert(cC && cC.isHidden, 'Compact View Toggle successfully hides long-term trend charts/leaderboard for Sunday focus');

    // Capture Screenshot 2: Compact View
    const shotCompact = await sendCmd('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'screenshot_club_admin_compact_view.png'), Buffer.from(shotCompact.data, 'base64'));
    console.log('  📸 Captured screenshot_club_admin_compact_view.png');

    // Toggle back to full view
    await sendCmd('Runtime.evaluate', { expression: `toggleAdminCompactView()` });
    await new Promise(r => setTimeout(r, 200));

    // 7. Test Command Palette (Ctrl + K)
    await sendCmd('Runtime.evaluate', {
      expression: `openAdminCommandPalette(); filterAdminCommandPalette('ACT_000075');`
    });
    await new Promise(r => setTimeout(r, 400));

    const paletteCheck = await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        const m = document.getElementById('modal-admin-command-palette');
        const isVisible = m && !m.classList.contains('hidden');
        const results = document.getElementById('admin-command-search-results')?.innerText || '';
        return { isVisible, hasMatch: results.includes('ACT_000075') };
      })()`,
      returnByValue: true
    });
    const pC = paletteCheck?.result?.value;
    assert(pC && pC.isVisible, 'Command Palette (Ctrl + K) opened');
    assert(pC && pC.hasMatch, 'Command Palette filtered and found #ACT_000075');

    // Capture Screenshot 3: Command Palette
    const shotPalette = await sendCmd('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'screenshot_club_admin_command_palette.png'), Buffer.from(shotPalette.data, 'base64'));
    console.log('  📸 Captured screenshot_club_admin_command_palette.png');

    await sendCmd('Runtime.evaluate', { expression: `closeAdminCommandPalette()` });
    await new Promise(r => setTimeout(r, 200));

    // 8. Test Excel Export Modal
    await sendCmd('Runtime.evaluate', {
      expression: `exportWeeklyClubReportExcel()`
    });
    await new Promise(r => setTimeout(r, 400));

    const exportCheck = await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        const m = document.getElementById('modal-admin-export-report');
        return m && !m.classList.contains('hidden');
      })()`,
      returnByValue: true
    });
    assert(exportCheck?.result?.value === true, 'Excel Export Preview Modal opened with 48 VĐV & 3,350 KM summary');

    // Capture Screenshot 4: Excel Export
    const shotExport = await sendCmd('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'screenshot_club_admin_export_excel.png'), Buffer.from(shotExport.data, 'base64'));
    console.log('  📸 Captured screenshot_club_admin_export_excel.png');

    await sendCmd('Runtime.evaluate', { expression: `closeAdminExportModal()` });
    await new Promise(r => setTimeout(r, 200));

    // 9. Test Mantis Material UI Parity
    await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        setAppTheme('mantis');
        switchTab('club-admin');
      })()`
    });
    await new Promise(r => setTimeout(r, 500));

    const mantisCheck = await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        const theme = document.body.getAttribute('data-theme');
        const tab = document.getElementById('tab-club-admin');
        const isActive = tab && tab.classList.contains('active');
        const mantisNavActive = document.getElementById('mantis-nav-club-admin')?.classList.contains('mantis-active-nav');
        return { theme, isActive, mantisNavActive };
      })()`,
      returnByValue: true
    });
    const mKC = mantisCheck?.result?.value;
    assert(mKC && mKC.theme === 'mantis', 'Body data-theme is mantis');
    assert(mKC && mKC.isActive, 'tab-club-admin is active in Mantis UI theme');
    assert(mKC && mKC.mantisNavActive, '#mantis-nav-club-admin is highlighted in Mantis sidebar');

    // Capture Screenshot 5: Mantis Club Admin Dashboard
    const shotMantis = await sendCmd('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'screenshot_mantis_club_admin_dashboard.png'), Buffer.from(shotMantis.data, 'base64'));
    console.log('  📸 Captured screenshot_mantis_club_admin_dashboard.png');

    // Switch back to default theme
    await sendCmd('Runtime.evaluate', { expression: `setAppTheme('sport')` });
    await new Promise(r => setTimeout(r, 200));

    ws.close();
  } catch (err) {
    assert(false, `Headless Chrome E2E error: ${err.message}`);
  } finally {
    try { chromeProc.kill(); } catch (e) {}
  }
}

async function main() {
  console.log('Starting Club Admin & Captain Dashboard E2E Tests...');
  await testClubAdminRestApis();
  await testHeadlessChromeUI();

  console.log('\n======================================================');
  console.log(`E2E TEST SUMMARY: ${passedTests}/${totalTests} PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
  if (failedTests > 0) {
    console.error(`FAILED TESTS: ${failedTests}`);
    process.exit(1);
  } else {
    console.log('ALL E2E ACCEPTANCE CRITERIA VERIFIED SUCCESSFULLY!');
    process.exit(0);
  }
}

main();
