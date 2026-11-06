/**
 * Comprehensive End-to-End QA Automation Test Suite
 * Tests:
 * 1. Live Backend REST APIs on Port 3001 (all endpoints, error cases, edge cases)
 * 2. Live Frontend Dashboard on Port 3000 via Headless Chrome CDP:
 *    - Real DOM evaluation
 *    - Console errors / unhandled rejections check
 *    - Tab switching (7 tabs: Overview, Activities, Club, Arena, Finance, Rules, Admin)
 *    - KM / MILE toggle
 *    - Interactive Rule Simulator (valid, <3km, pace < 2:45, trail bonus)
 *    - Activity creation modal & validation
 *    - Appeal submission & Admin approval flow
 *    - Admin VietQR finance payment confirmation
 *    - Race lifecycle change & Recalculate all
 *    - CSV export & Onboarding link copy
 */

const { spawn } = require('child_process');
const fs = require('fs');

const API_BASE = 'http://localhost:3001';
const FRONTEND_BASE = 'http://localhost:3000';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failedTests++;
    failures.push(message);
    console.error(`  ✕ FAIL: ${message}`);
  }
}

async function testBackendApis() {
  console.log('\n======================================================');
  console.log('>>> [1/2] TESTING LIVE BACKEND REST APIS (PORT 3001)');
  console.log('======================================================\n');

  // 1. GET /api/health
  try {
    const res = await fetch(`${API_BASE}/api/health`);
    const data = await res.json();
    assert(res.status === 200, 'GET /api/health returns HTTP 200');
    assert(data.status === 'ok', 'Health status is "ok"');
    assert(data.version === '2.3.0', 'API version is 2.3.0');
    assert(typeof data.timestamp === 'string', 'API returns timestamp');
  } catch (err) {
    assert(false, `GET /api/health error: ${err.message}`);
  }

  // 2. GET /api/webhooks/strava (Subscription Challenge)
  try {
    const challengeCode = 'strava_test_challenge_8899';
    const res = await fetch(`${API_BASE}/api/webhooks/strava?hub.challenge=${challengeCode}`);
    const data = await res.json();
    assert(res.status === 200, 'GET /api/webhooks/strava returns HTTP 200');
    assert(data['hub.challenge'] === challengeCode, 'Returns correct hub.challenge');
  } catch (err) {
    assert(false, `GET /api/webhooks/strava challenge error: ${err.message}`);
  }

  // 3. POST /api/webhooks/strava (Activity Webhook Event Ingestion)
  try {
    const webhookPayload = {
      aspect_type: 'create',
      event_time: Math.floor(Date.now() / 1000),
      object_id: 123456789,
      object_type: 'activity',
      owner_id: 998877,
      subscription_id: 1,
      updates: {}
    };
    const res = await fetch(`${API_BASE}/api/webhooks/strava`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webhookPayload)
    });
    const data = await res.json();
    assert(res.status === 200, 'POST /api/webhooks/strava returns HTTP 200');
    assert(data.status === 'ACKNOWLEDGED', 'Webhook ingestion returns ACKNOWLEDGED status');
    assert(typeof data.eventId === 'string', 'Webhook returns unique eventId');
    assert(typeof data.elapsedMs === 'number', 'Webhook measures execution time');
  } catch (err) {
    assert(false, `POST /api/webhooks/strava error: ${err.message}`);
  }

  // 4. POST /api/activities/evaluate (Rule Engine Validation)
  try {
    // Valid standard run (5km, 25min = pace 5:00 min/km)
    const validAct = {
      id: 'act-test-valid-1',
      userId: 'user-athlete-01',
      sportType: 'Run',
      distanceM: 5000,
      movingTimeS: 1500,
      elapsedTimeS: 1500,
      elevationGainM: 10,
      startAt: '2026-11-05T07:00:00Z'
    };
    const res1 = await fetch(`${API_BASE}/api/activities/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validAct)
    });
    const data1 = await res1.json();
    assert(res1.status === 200, 'POST /api/activities/evaluate returns HTTP 200');
    assert(data1.isValid === true, 'Standard 5km run is evaluated as VALID');
    assert(data1.finalDistanceKm === 5.0, 'Credited final distance equals 5.0 km');

    // Invalid pace floor run (5km, 10min = pace 2:00 min/km < 2:45)
    const fastAct = {
      id: 'act-test-fast-1',
      userId: 'user-athlete-01',
      sportType: 'Run',
      distanceM: 5000,
      movingTimeS: 600, // 2:00 min/km
      elapsedTimeS: 600,
      elevationGainM: 10,
      startAt: '2026-11-05T07:00:00Z'
    };
    const res2 = await fetch(`${API_BASE}/api/activities/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fastAct)
    });
    const data2 = await res2.json();
    assert(data2.isValid === false, 'Pace < 2:45 is evaluated as INVALID');
    assert(data2.rejectCode === 'PACE_IMPLAUSIBLE', 'Rejection code is PACE_IMPLAUSIBLE');
    assert(data2.finalDistanceKm === 0, 'Credited distance for rejected run is 0 km');

    // Trail elevation bonus run (8km, 5400s = pace 11:15 > 10:00 with 250m elevation gain)
    const trailAct = {
      id: 'act-test-trail-1',
      userId: 'user-athlete-01',
      sportType: 'Run',
      distanceM: 8000,
      movingTimeS: 5400,
      elapsedTimeS: 5400,
      elevationGainM: 250, // 2 x 100m -> +2km bonus
      startAt: '2026-11-05T07:00:00Z'
    };
    const res3 = await fetch(`${API_BASE}/api/activities/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(trailAct)
    });
    const data3 = await res3.json();
    assert(data3.isValid === true, 'Trail run with sufficient elevation gain is VALID');
    assert(data3.bonusDistanceKm === 2.0, 'Trail bonus calculated as +2.0 km (floor(250/100))');
    assert(data3.finalDistanceKm === 10.0, 'Total credited distance is 8km + 2km = 10.0 km');
  } catch (err) {
    assert(false, `POST /api/activities/evaluate error: ${err.message}`);
  }

  // 5. GET /api/appeals and POST /api/appeals/approve
  try {
    const resList = await fetch(`${API_BASE}/api/appeals`);
    const appeals = await resList.json();
    assert(resList.status === 200, 'GET /api/appeals returns HTTP 200');
    assert(Array.isArray(appeals), 'Appeals returns an array');
    assert(appeals.length > 0, 'Initial appeals present');

    const pendingAppeal = appeals.find(a => a.status === 'OPEN') || appeals[0];
    const resApprove = await fetch(`${API_BASE}/api/appeals/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appealId: pendingAppeal.id,
        adminId: 'admin-chief-01',
        note: 'E2E Test Approved'
      })
    });
    const approved = await resApprove.json();
    assert(resApprove.status === 200, 'POST /api/appeals/approve returns HTTP 200');
    assert(approved.status === 'APPROVED', 'Appeal status updated to APPROVED');
  } catch (err) {
    assert(false, `Appeals API error: ${err.message}`);
  }

  // 6. GET /api/finance and POST /api/finance/mark-paid
  try {
    const resFin = await fetch(`${API_BASE}/api/finance`);
    const ledgers = await resFin.json();
    assert(resFin.status === 200, 'GET /api/finance returns HTTP 200');
    assert(Array.isArray(ledgers), 'Finance returns ledgers array');
    assert(ledgers.length > 0, 'Found participant ledgers');

    const targetLedger = ledgers[0];
    const resPay = await fetch(`${API_BASE}/api/finance/mark-paid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        participantId: targetLedger.participantId,
        adminId: 'admin-treasurer-01',
        note: 'Verified via VietQR reference'
      })
    });
    const paidResult = await resPay.json();
    assert(resPay.status === 200, 'POST /api/finance/mark-paid returns HTTP 200');
    assert(paidResult.status === 'PAID', 'Ledger status updated to PAID');
  } catch (err) {
    assert(false, `Finance API error: ${err.message}`);
  }

  // 7. POST /api/waivers
  try {
    const resWaiver = await fetch(`${API_BASE}/api/waivers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        raceId: 'race-season-10',
        cycleId: 'cycle-w1',
        userId: 'user-02',
        reason: 'Chấn thương gối có xác nhận y tế',
        adminId: 'admin-chief-01'
      })
    });
    const waiver = await resWaiver.json();
    assert(resWaiver.status === 200, 'POST /api/waivers returns HTTP 200');
    assert(waiver.id !== undefined, 'Waiver created with generated ID');
    assert(waiver.reason === 'Chấn thương gối có xác nhận y tế', 'Waiver reason saved correctly');
  } catch (err) {
    assert(false, `POST /api/waivers error: ${err.message}`);
  }

  // 8. GET /api/audit-logs
  try {
    const resAudit = await fetch(`${API_BASE}/api/audit-logs`);
    const logs = await resAudit.json();
    assert(resAudit.status === 200, 'GET /api/audit-logs returns HTTP 200');
    assert(Array.isArray(logs), 'Audit logs returns an array');
    assert(logs.length > 0, 'Audit logs contains entries');
    const actions = logs.map(l => l.action);
    assert(actions.includes('APPEAL_APPROVED') || actions.includes('PAYMENT_SETTLED'), 'Audit trail tracks admin mutations');
  } catch (err) {
    assert(false, `GET /api/audit-logs error: ${err.message}`);
  }

  // 9. [1.1] GET /api/me/strava-status
  try {
    const res = await fetch(`${API_BASE}/api/me/strava-status`);
    const data = await res.json();
    assert(res.status === 200, 'GET /api/me/strava-status returns HTTP 200');
    assert(data.connected === true, 'Strava status indicates connected athlete');
    assert(data.athleteId === '94827103', 'Athlete ID matches connected account');
    assert(data.webhookActive === true, 'Webhook subscription is active');
  } catch (err) {
    assert(false, `GET /api/me/strava-status error: ${err.message}`);
  }

  // 10. [1.1] POST /api/me/strava-sync
  try {
    const res = await fetch(`${API_BASE}/api/me/strava-sync`, { method: 'POST' });
    const data = await res.json();
    assert(res.status === 200, 'POST /api/me/strava-sync returns HTTP 200');
    assert(data.success === true, 'Strava sync executes successfully');
    assert(data.syncedCount >= 1, 'Sync imports new activities');
    assert(typeof data.newCompletedKm === 'number', 'Sync updates runner completed distance');
  } catch (err) {
    assert(false, `POST /api/me/strava-sync error: ${err.message}`);
  }

  // 11. [1.2] GET /api/me/weekly-progress
  try {
    const res = await fetch(`${API_BASE}/api/me/weekly-progress`);
    const data = await res.json();
    assert(res.status === 200, 'GET /api/me/weekly-progress returns HTTP 200');
    assert(data.targetKm === 20.0, 'Weekly cycle standard target is 20.0 km');
    assert(data.graceHours === 6, 'Grace period allows 6 hours on Monday morning');
    assert(typeof data.hoursRemaining === 'number', 'Returns cycle remaining hours');
  } catch (err) {
    assert(false, `GET /api/me/weekly-progress error: ${err.message}`);
  }

  // 12. [1.3] GET /api/me/penalty-warning
  try {
    const res = await fetch(`${API_BASE}/api/me/penalty-warning`);
    const data = await res.json();
    assert(res.status === 200, 'GET /api/me/penalty-warning returns HTTP 200');
    assert(typeof data.active === 'boolean', 'Returns active penalty warning state');
    assert(data.penaltyAmountVnd >= 0, 'Penalty amount calculated according to rules');
  } catch (err) {
    assert(false, `GET /api/me/penalty-warning error: ${err.message}`);
  }

  // 13. [1.4] GET /api/me/races
  try {
    const res = await fetch(`${API_BASE}/api/me/races`);
    const data = await res.json();
    assert(res.status === 200, 'GET /api/me/races returns HTTP 200');
    assert(Array.isArray(data) && data.length >= 3, 'Returns at least 3 enrolled races for carousel');
    assert(data[0].teamStanding === 1, 'First race ranks Top 1 for Phoenix SARC');
  } catch (err) {
    assert(false, `GET /api/me/races error: ${err.message}`);
  }

  // 14. [1.5] POST /api/races/join-by-code
  try {
    const res = await fetch(`${API_BASE}/api/races/join-by-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'OR-8K2Q' })
    });
    const data = await res.json();
    assert(res.status === 200, 'POST /api/races/join-by-code with valid code returns HTTP 200');
    assert(data.success === true, 'Enrolls runner in race');

    const resInvalid = await fetch(`${API_BASE}/api/races/join-by-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'UNKNOWN-CODE-99' })
    });
    const dataInvalid = await resInvalid.json();
    assert(resInvalid.status === 400 && dataInvalid.success === false, 'Rejects unknown invite code');
  } catch (err) {
    assert(false, `POST /api/races/join-by-code error: ${err.message}`);
  }

  // 15. [2.1] GET /api/races/:slug (Hero Banner & Countdown Details)
  try {
    const resHero = await fetch(`${API_BASE}/api/races/season-10-run-to-techcombank`);
    const dataHero = await resHero.json();
    assert(resHero.status === 200, 'GET /api/races/:slug returns HTTP 200');
    assert(dataHero.totalAthletes === 48, 'Race has 48 registered athletes');
    assert(dataHero.totalKm === 3170.0, 'Race has 3,170.0 total km');
    assert(dataHero.topReward.title.includes('Áo thi đấu CLB SARC'), 'Top 1 reward title is SARC club shirt');
  } catch (err) {
    assert(false, `GET /api/races/:slug error: ${err.message}`);
  }

  // 16. [2.2] GET /api/races/:slug/leaderboard/teams (Rank 1 & Tied Rank 2)
  try {
    const resTeams = await fetch(`${API_BASE}/api/races/season-10-run-to-techcombank/leaderboard/teams`);
    const dataTeams = await resTeams.json();
    assert(resTeams.status === 200, 'GET /api/races/:slug/leaderboard/teams returns HTTP 200');
    assert(dataTeams.teams.length === 3, 'Returns 3 competing teams');
    assert(dataTeams.teams[0].rank === 1 && dataTeams.teams[0].expectedFundFeeVnd === 100000, 'Rank 1 Phoenix pays 100k');
    assert(dataTeams.teams[1].rank === 2 && dataTeams.teams[1].rankLabel === 'Đồng Hạng 2', 'Tied Rank 2 Dragons pays 200k');
  } catch (err) {
    assert(false, `GET /api/races/:slug/leaderboard/teams error: ${err.message}`);
  }

  // 17. [2.3] GET /api/races/:slug/leaderboard/individuals
  try {
    const resInd = await fetch(`${API_BASE}/api/races/season-10-run-to-techcombank/leaderboard/individuals`);
    const dataInd = await resInd.json();
    assert(resInd.status === 200, 'GET /api/races/:slug/leaderboard/individuals returns HTTP 200');
    assert(dataInd.runners.length >= 6, 'Returns ranked individual runners');
    assert(dataInd.runners[0].rank === 1 && typeof dataInd.runners[0].rewardBadge === 'string', 'Top 1 has reward badge');
    assert(dataInd.currentUserSummary.userId === 'user-01', 'Returns current user sticky summary');
  } catch (err) {
    assert(false, `GET /api/races/:slug/leaderboard/individuals error: ${err.message}`);
  }

  // 18. [2.4] GET /api/races/:slug/my-team
  try {
    const resMyTeam = await fetch(`${API_BASE}/api/races/season-10-run-to-techcombank/my-team`);
    const dataMyTeam = await resMyTeam.json();
    assert(resMyTeam.status === 200, 'GET /api/races/:slug/my-team returns HTTP 200');
    assert(dataMyTeam.teamName === 'Team Phoenix SARC', 'My team name is Team Phoenix SARC');
    assert(dataMyTeam.members.length >= 5, 'My team roster has members');
    assert(dataMyTeam.teamInviteCode === 'PHOENIX-SARC-TEAM', 'My team invite code matches');
  } catch (err) {
    assert(false, `GET /api/races/:slug/my-team error: ${err.message}`);
  }

  // 19. [2.4] POST /api/races/:slug/my-team/cheer
  try {
    const resCheer = await fetch(`${API_BASE}/api/races/season-10-run-to-techcombank/my-team/cheer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author: 'Nguyễn Văn A', message: 'Cố lên cả đội nhé!' })
    });
    const dataCheer = await resCheer.json();
    assert(resCheer.status === 200 && dataCheer.success === true, 'POST /api/races/:slug/my-team/cheer succeeds');
  } catch (err) {
    assert(false, `POST /api/races/:slug/my-team/cheer error: ${err.message}`);
  }

  // 20. [2.5] POST /api/races/:slug/stream/broadcast
  try {
    const resBc = await fetch(`${API_BASE}/api/races/season-10-run-to-techcombank/stream/broadcast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ athleteName: 'Nguyễn Văn A', distanceKm: 5.0 })
    });
    const dataBc = await resBc.json();
    assert(resBc.status === 200 && dataBc.broadcasted === true, 'POST /api/races/:slug/stream/broadcast succeeds');
  } catch (err) {
    assert(false, `POST /api/races/:slug/stream/broadcast error: ${err.message}`);
  }

  // 21. [3.1] GET /api/me/activities (Subsystem 3.0)
  try {
    const resActs = await fetch(`${API_BASE}/api/me/activities`);
    const dataActs = await resActs.json();
    assert(resActs.status === 200 && Array.isArray(dataActs), 'GET /api/me/activities returns array of activities');
    assert(dataActs.length >= 4, 'Activity feed returns all seeded runs (>= 4)');
  } catch (err) {
    assert(false, `GET /api/me/activities error: ${err.message}`);
  }

  // 22. [3.1] GET /api/me/activities with valid/invalid filters
  try {
    const resValid = await fetch(`${API_BASE}/api/me/activities?filter=valid`);
    const dataValid = await resValid.json();
    assert(resValid.status === 200 && dataValid.every(a => a.isValid), 'Filter valid returns only valid runs');

    const resInvalid = await fetch(`${API_BASE}/api/me/activities?filter=invalid`);
    const dataInvalid = await resInvalid.json();
    assert(resInvalid.status === 200 && dataInvalid.every(a => !a.isValid), 'Filter invalid returns only rejected runs');
  } catch (err) {
    assert(false, `GET /api/me/activities filter error: ${err.message}`);
  }

  // 23. [3.3] GET /api/activities/:id (Audit detail)
  try {
    const resDetail = await fetch(`${API_BASE}/api/activities/act-000075`);
    const detail = await resDetail.json();
    assert(resDetail.status === 200 && detail.id === 'act-000075', 'GET /api/activities/:id returns activity audit detail');
    assert(detail.trailBonusKm === 2.0 && detail.finalCreditedKm === 10.0, 'Audit detail includes +2.0 km Trail Bonus');
  } catch (err) {
    assert(false, `GET /api/activities/:id error: ${err.message}`);
  }

  // 24. [3.4] POST /api/activities/:id/appeal
  try {
    const resAppeal = await fetch(`${API_BASE}/api/activities/act-000073/appeal`, {
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
    assert(false, `POST /api/activities/:id/appeal error: ${err.message}`);
  }

  // 25. [4.1] GET /api/clubs/:slug (Subsystem 4.0 Club Hub Profile)
  try {
    const resClub = await fetch(`${API_BASE}/api/clubs/sarc-sadc`);
    const dataClub = await resClub.json();
    assert(resClub.status === 200, 'GET /api/clubs/:slug returns HTTP 200');
    assert(dataClub.slug === 'sarc-sadc', 'Club slug matches sarc-sadc');
    assert(dataClub.name.includes('CLB') || dataClub.name.includes('Câu Lạc Bộ'), 'Club name contains CLB/Câu Lạc Bộ');
    assert(dataClub.leaders.length === 3, 'Club has 3 executive committee leaders');
    assert(dataClub.feedPosts.length >= 2, 'Club feed has published announcements');
  } catch (err) {
    assert(false, `GET /api/clubs/:slug error: ${err.message}`);
  }

  // 26. [4.2] GET /api/clubs/:slug/races (Club Races Directory)
  try {
    const resRaces = await fetch(`${API_BASE}/api/clubs/sarc-sadc/races`);
    const dataRaces = await resRaces.json();
    assert(resRaces.status === 200, 'GET /api/clubs/:slug/races returns HTTP 200');
    assert(Array.isArray(dataRaces.live) && dataRaces.live.length >= 1, 'Club has active live races');
    assert(Array.isArray(dataRaces.upcoming) && dataRaces.upcoming.length >= 1, 'Club has upcoming races');
    assert(Array.isArray(dataRaces.archived) && dataRaces.archived.length >= 1, 'Club has archived race history');
  } catch (err) {
    assert(false, `GET /api/clubs/:slug/races error: ${err.message}`);
  }

  // 27. [4.3] GET /api/clubs/:slug/members (Members Roster & Capacities)
  try {
    const resMemb = await fetch(`${API_BASE}/api/clubs/sarc-sadc/members`);
    const dataMemb = await resMemb.json();
    assert(resMemb.status === 200, 'GET /api/clubs/:slug/members returns HTTP 200');
    assert(dataMemb.members.length >= 5, 'Club members roster has registered runners');
    assert(dataMemb.capacities.length === 3, 'Returns 3 team capacity breakdowns');
    const phoenix = dataMemb.capacities.find(c => c.teamId === 'team-phoenix');
    assert(phoenix && phoenix.isFull === true && phoenix.currentCount === 16, 'Team Phoenix SARC is at maximum capacity (16/16 full)');
  } catch (err) {
    assert(false, `GET /api/clubs/:slug/members error: ${err.message}`);
  }

  // 28. [4.4] GET /api/clubs/:slug/detour (In-App Browser Detour Detection)
  try {
    const resDetour = await fetch(`${API_BASE}/api/clubs/sarc-sadc/detour`, {
      headers: { 'user-agent': 'Mozilla/5.0 (iPhone) AppleWebKit/605.1.15 Zalo/23.01' }
    });
    const dataDetour = await resDetour.json();
    assert(resDetour.status === 200, 'GET /api/clubs/:slug/detour returns HTTP 200');
    assert(dataDetour.isInApp === true, 'Correctly flags Zalo in-app webview');
    assert(dataDetour.shortCode === 'OR-8K2Q', 'Returns short access code OR-8K2Q');
  } catch (err) {
    assert(false, `GET /api/clubs/:slug/detour error: ${err.message}`);
  }

  // 29. [4.4] POST /api/clubs/:slug/join (Dual Consents & Team Capacity Check)
  try {
    // Missing consent 2
    const resFailConsent = await fetch(`${API_BASE}/api/clubs/sarc-sadc/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId: 'team-dragons', consentStrava: true, consentRulesAndFinance: false })
    });
    const dataFailConsent = await resFailConsent.json();
    assert(resFailConsent.status === 400 && dataFailConsent.success === false, 'Rejects registration when Consent 2 is unchecked');

    // Full team Phoenix
    const resFailFull = await fetch(`${API_BASE}/api/clubs/sarc-sadc/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId: 'team-phoenix', consentStrava: true, consentRulesAndFinance: true })
    });
    const dataFailFull = await resFailFull.json();
    assert(resFailFull.status === 400 && dataFailFull.success === false, 'Rejects registration for full team (Phoenix 16/16)');

    // Successful join
    const resSuccess = await fetch(`${API_BASE}/api/clubs/sarc-sadc/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId: 'team-dragons', consentStrava: true, consentRulesAndFinance: true })
    });
    const dataSuccess = await resSuccess.json();
    assert(resSuccess.status === 200 && dataSuccess.success === true, 'Successfully joins available team Dragons with dual consents');
  } catch (err) {
    assert(false, `POST /api/clubs/:slug/join error: ${err.message}`);
  }

  // 30. [AC-031] PUT /api/me/profile (Update Profile Information)
  try {
    const resProf = await fetch(`${API_BASE}/api/me/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Nguyễn Văn A (Updated)', phone: '0988776655' })
    });
    const dataProf = await resProf.json();
    assert(resProf.status === 200, 'PUT /api/me/profile returns HTTP 200');
    assert(dataProf.success === true, 'Profile update returns success=true');
    assert(dataProf.profile.name === 'Nguyễn Văn A (Updated)', 'Profile name updated correctly');
  } catch (err) {
    assert(false, `PUT /api/me/profile error: ${err.message}`);
  }

  // 31. [AC-031] PUT /api/clubs/:slug (Update Club and VietQR Bank Settings)
  try {
    const resClub = await fetch(`${API_BASE}/api/clubs/sarc-sadc`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slogan: 'Chạy Nữa Chạy Mãi - Kỷ Luật Tạo Nên Sức Mạnh' })
    });
    const dataClub = await resClub.json();
    assert(resClub.status === 200, 'PUT /api/clubs/:slug returns HTTP 200');
    assert(dataClub.success === true, 'Club settings update returns success=true');
    assert(dataClub.club.slogan.includes('Chạy Nữa Chạy Mãi'), 'Club slogan updated in memory');
  } catch (err) {
    assert(false, `PUT /api/clubs/:slug error: ${err.message}`);
  }

  // 32. [AC-032] POST/PUT/DELETE /api/clubs/:slug/members (Member Management CRUD)
  try {
    // Add member
    const resAddMem = await fetch(`${API_BASE}/api/clubs/sarc-sadc/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Đặng Thùy Trang', role: 'RUNNER', team: 'Team Dragons SADC' })
    });
    const dataAddMem = await resAddMem.json();
    assert(resAddMem.status === 201, 'POST /api/clubs/:slug/members returns HTTP 201');
    assert(dataAddMem.success === true, 'Member added successfully');
    assert(dataAddMem.member.name === 'Đặng Thùy Trang', 'New member name matches');

    const newMemId = dataAddMem.member.id;

    // Update role
    const resUpMem = await fetch(`${API_BASE}/api/clubs/sarc-sadc/members/${newMemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'BAN CÁN SỰ' })
    });
    const dataUpMem = await resUpMem.json();
    assert(resUpMem.status === 200, 'PUT /api/clubs/:slug/members/:id returns HTTP 200');
    assert(dataUpMem.member.role === 'BAN CÁN SỰ', 'Member role updated to BAN CÁN SỰ');

    // Delete member
    const resDelMem = await fetch(`${API_BASE}/api/clubs/sarc-sadc/members/${newMemId}`, {
      method: 'DELETE'
    });
    assert(resDelMem.status === 200, 'DELETE /api/clubs/:slug/members/:id returns HTTP 200');
  } catch (err) {
    assert(false, `Member Management CRUD error: ${err.message}`);
  }

  // 33. [AC-033] POST /api/races (Race Rule Configurator 7-Step Wizard)
  try {
    const resRace = await fetch(`${API_BASE}/api/races`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'SARC Autumn Challenge 2027',
        minDistanceKm: 3.0,
        paceFloor: '2:45',
        weeklyTargetKm: 25.0,
        penaltyPerMissingKm: 50000,
        topRewardTitle: 'Áo Vô Địch Vàng SARC',
        maxTeamMembers: 16
      })
    });
    const dataRace = await resRace.json();
    assert(resRace.status === 201, 'POST /api/races returns HTTP 201');
    assert(dataRace.success === true, 'Race created successfully');
    assert(dataRace.race.name === 'SARC Autumn Challenge 2027', 'Created race name matches');
    assert(dataRace.race.ruleSet.paceMinS === 165, 'Created race enforces 2:45 min/km pace floor (165s)');
    assert(dataRace.race.maxTeamMembers === 16, 'Created race enforces 16 max team members');
  } catch (err) {
    assert(false, `POST /api/races error: ${err.message}`);
  }

  // 34. [AC-034] POST /api/appeals/:id/review (Appeals Review with Credited KM)
  try {
    const appeals = await (await fetch(`${API_BASE}/api/appeals`)).json();
    const targetAppeal = appeals[0];
    const resRev = await fetch(`${API_BASE}/api/appeals/${targetAppeal.id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'APPROVED',
        creditedKm: 6.0,
        note: 'Duyệt bù 6.0km do lỗi trôi GPS qua hầm đường bộ'
      })
    });
    const dataRev = await resRev.json();
    assert(resRev.status === 200, 'POST /api/appeals/:id/review returns HTTP 200');
    assert(dataRev.success === true, 'Appeal review returns success=true');
    assert(dataRev.appeal.status === 'APPROVED', 'Appeal status updated to APPROVED');
    assert(dataRev.appeal.resolutionNote.includes('Duyệt bù 6.0km'), 'Resolution audit note saved');
  } catch (err) {
    assert(false, `POST /api/appeals/:id/review error: ${err.message}`);
  }

  // 35. [AC-035] DELETE /api/v1/me/strava (Self-Service Disconnect preserving historic runs)
  try {
    const resDisc = await fetch(`${API_BASE}/api/v1/me/strava`, { method: 'DELETE' });
    const dataDisc = await resDisc.json();
    assert(resDisc.status === 200, 'DELETE /api/v1/me/strava returns HTTP 200');
    assert(dataDisc.status === 'REVOKED', 'Strava connection status transitioned to REVOKED');
    assert(dataDisc.preservedRunsCount >= 1, 'Historic race activities are safely preserved');

    // Reconnect
    const resRecon = await fetch(`${API_BASE}/api/v1/me/strava/reconnect`, { method: 'POST' });
    const dataRecon = await resRecon.json();
    assert(resRecon.status === 200, 'POST /api/v1/me/strava/reconnect returns HTTP 200');
    assert(dataRecon.status === 'ACTIVE', 'Strava connection successfully restored to ACTIVE');
  } catch (err) {
    assert(false, `Strava Self-Service Disconnect error: ${err.message}`);
  }

  // 36. [AC-036] GET /api/v1/me/strava/sync-logs (Strava Ingestion Sync Logs)
  try {
    const resLogs = await fetch(`${API_BASE}/api/v1/me/strava/sync-logs`);
    const logs = await resLogs.json();
    assert(resLogs.status === 200, 'GET /api/v1/me/strava/sync-logs returns HTTP 200');
    assert(Array.isArray(logs) && logs.length >= 3, 'Sync logs returns list of webhook ingestion records');
    assert(logs[0].httpStatusCode === 200, 'Sync log contains HTTP 200 status code');
    assert(typeof logs[0].rawEventPayload === 'object', 'Sync log preserves raw webhook event payload');
  } catch (err) {
    assert(false, `Strava Sync Logs error: ${err.message}`);
  }

  // 37. [AC-037] POST /api/v1/races/:slug/join (3 Scopes: internal, community, designated & capacity)
  try {
    // 37.1 Internal race: non-club fails
    const resIntFail = await fetch(`${API_BASE}/api/v1/races/season-10-internal/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'u-outsider', email: 'outsider@gmail.com', userClubIds: ['club-other'] })
    });
    const dataIntFail = await resIntFail.json();
    assert(resIntFail.status === 400 && dataIntFail.error.includes('INTERNAL_ONLY'), 'Internal race rejects non-club members');

    // 37.2 Internal race: club member succeeds
    const resIntPass = await fetch(`${API_BASE}/api/v1/races/season-10-internal/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'u-insider', email: 'insider@sarc.vn', userClubIds: ['club-sarc-sadc'] })
    });
    const dataIntPass = await resIntPass.json();
    assert(resIntPass.status === 200 && dataIntPass.success === true, 'Internal race admits verified club members');

    // 37.3 Capacity lock
    const resCapFail = await fetch(`${API_BASE}/api/v1/races/community-open-5k/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'u-overflow', email: 'overflow@gmail.com', userClubIds: [] })
    });
    const dataCapFail = await resCapFail.json();
    assert(resCapFail.status === 400 && dataCapFail.error.includes('CAPACITY_REACHED'), 'Race registration locks when max_participants reached');
  } catch (err) {
    assert(false, `Race Scope & Capacity validation error: ${err.message}`);
  }

  // 38. [AC-038] POST/GET /api/v1/races/:slug/whitelist (Designated Race Whitelist)
  try {
    // Attempt join without whitelist
    const resWlBlock = await fetch(`${API_BASE}/api/v1/races/designated-elite-invitational/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'u-unlisted', email: 'unlisted@unknown.vn', userClubIds: [] })
    });
    const dataWlBlock = await resWlBlock.json();
    assert(resWlBlock.status === 400 && dataWlBlock.error.includes('NOT_WHITELISTED'), 'Designated race blocks unlisted emails');

    // Add to whitelist
    const resAddWl = await fetch(`${API_BASE}/api/v1/races/designated-elite-invitational/whitelist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emails: ['unlisted@unknown.vn'] })
    });
    const dataAddWl = await resAddWl.json();
    assert(resAddWl.status === 200 && dataAddWl.success === true, 'Successfully added email to race whitelist');

    // Now join succeeds
    const resWlPass = await fetch(`${API_BASE}/api/v1/races/designated-elite-invitational/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'u-unlisted', email: 'unlisted@unknown.vn', userClubIds: [] })
    });
    const dataWlPass = await resWlPass.json();
    assert(resWlPass.status === 200 && dataWlPass.success === true, 'Whitelisted athlete successfully joins designated race');
  } catch (err) {
    assert(false, `Race Whitelist error: ${err.message}`);
  }

  // 39. [AC-039] PATCH /api/v1/teams/:id (Team Leader Identity Management)
  try {
    // Leader updates identity
    const resTeam = await fetch(`${API_BASE}/api/v1/teams/team-phoenix`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        actorUserId: 'user-01',
        name: 'Chiến Binh Phoenix Vàng 2026',
        slogan: 'Kỷ Luật Tạo Nên Sức Mạnh'
      })
    });
    const dataTeam = await resTeam.json();
    assert(resTeam.status === 200, 'PATCH /api/v1/teams/:id returns HTTP 200');
    assert(dataTeam.team.name === 'Chiến Binh Phoenix Vàng 2026', 'Team name updated by Team Leader');
    assert(dataTeam.team.slogan === 'Kỷ Luật Tạo Nên Sức Mạnh', 'Team slogan updated by Team Leader');

    // Non-leader forbidden
    const resTeamFail = await fetch(`${API_BASE}/api/v1/teams/team-phoenix`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        actorUserId: 'user-impostor',
        name: 'Hacked Team'
      })
    });
    assert(resTeamFail.status === 403, 'Rejects team modification by non-leader with HTTP 403 Forbidden');
  } catch (err) {
    assert(false, `Team Leader Management error: ${err.message}`);
  }

  // 40. [AC-040] GET/POST/PATCH /api/v1/me/friends (2-Way Friendship Network)
  try {
    const resFrList = await fetch(`${API_BASE}/api/v1/me/friends`);
    const dataFrList = await resFrList.json();
    assert(resFrList.status === 200 && Array.isArray(dataFrList.friends), 'GET /api/v1/me/friends returns friends array');

    // Send request
    const resReq = await fetch(`${API_BASE}/api/v1/me/friends/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ addresseeId: 'user-03' })
    });
    const dataReq = await resReq.json();
    assert(resReq.status === 201 && dataReq.friendship.status === 'pending', 'Friend request created with status pending');

    // Accept request
    const resAccept = await fetch(`${API_BASE}/api/v1/me/friends/requests/user-03`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accept: true })
    });
    const dataAccept = await resAccept.json();
    assert(resAccept.status === 200 && dataAccept.friendship.status === 'accepted', 'Friend request accepted successfully');
  } catch (err) {
    assert(false, `Friendship network error: ${err.message}`);
  }

  // 41. [AC-041] Community Feed, Posts, Kudos & Comments
  try {
    // Get feed
    const resFeed = await fetch(`${API_BASE}/api/v1/community/feed?filter=all`);
    const feed = await resFeed.json();
    assert(resFeed.status === 200 && Array.isArray(feed), 'GET /api/v1/community/feed returns feed array');

    // Create post
    const resPost = await fetch(`${API_BASE}/api/v1/community/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caption: 'Chinh phục cự ly 15km cùng giải Mùa 10! 🔥', distanceKm: 15.0 })
    });
    const dataPost = await resPost.json();
    assert(resPost.status === 201 && dataPost.success === true, 'POST /api/v1/community/posts creates post');
    const newPostId = dataPost.post.id;

    // Kudos post
    const resKudos = await fetch(`${API_BASE}/api/v1/community/posts/${newPostId}/kudos`, { method: 'POST' });
    const dataKudos = await resKudos.json();
    assert(resKudos.status === 200 && dataKudos.kudosCount === 1, 'Kudos increments post kudos count to 1');

    // Comment on post
    const resCom = await fetch(`${API_BASE}/api/v1/community/posts/${newPostId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'Quá xuất sắc anh ơi!' })
    });
    const dataCom = await resCom.json();
    assert(resCom.status === 201 && dataCom.comment.content.includes('xuất sắc'), 'Comment attached to community post');
  } catch (err) {
    assert(false, `Community feed & engagement error: ${err.message}`);
  }

  // 42. [AC-042] POST /api/v1/races/:slug/rules/multi-criteria (Multi-Criteria Weighted Scoring)
  try {
    const resMc = await fetch(`${API_BASE}/api/v1/races/season-10-internal/rules/multi-criteria`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        weights: { distance: 0.4, diligentDays: 0.3, elevationGain: 0.2, paceQuality: 0.1 }
      })
    });
    const dataMc = await resMc.json();
    assert(resMc.status === 200 && dataMc.success === true, 'POST multi-criteria rules returns HTTP 200');
    assert(Array.isArray(dataMc.rankedTeams) && dataMc.rankedTeams.length === 3, 'Returns ranked teams across all 4 criteria');
    assert(dataMc.rankedTeams[0].rank === 1, 'Top 1 team calculated with highest composite weighted score');
  } catch (err) {
    assert(false, `Multi-Criteria Scoring error: ${err.message}`);
  }

}

async function testFrontendHeadless() {
  console.log('\n======================================================');
  console.log('>>> [2/2] TESTING LIVE FRONTEND ON PORT 3000 (CDP E2E)');
  console.log('======================================================\n');

  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browserBin = fs.existsSync(chromePath) ? chromePath : edgePath;

  const browserProc = spawn(browserBin, [
    '--headless=new',
    '--remote-debugging-port=9227',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    'http://localhost:3000'
  ]);

  const consoleErrors = [];
  const consoleLogs = [];

  try {
    // Wait for browser CDP target
    let targetInfo;
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 200));
      try {
        const res = await fetch('http://127.0.0.1:9227/json/list');
        if (res.ok) {
          const list = await res.json();
          targetInfo = list.find(t => t.url.includes('localhost:3000'));
          if (targetInfo && targetInfo.webSocketDebuggerUrl) break;
        }
      } catch (e) {}
    }

    if (!targetInfo) {
      throw new Error('Could not connect to Headless Browser CDP on port 9227');
    }
    console.log(`Connected to CDP browser target: ${targetInfo.url}`);

    const ws = new WebSocket(targetInfo.webSocketDebuggerUrl);
    let idCounter = 1;
    const pending = new Map();

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && pending.has(msg.id)) {
        pending.get(msg.id)(msg);
        pending.delete(msg.id);
      } else if (msg.method === 'Runtime.consoleAPICalled') {
        const text = msg.params.args.map(a => a.value || a.description || '').join(' ');
        if (msg.params.type === 'error') {
          consoleErrors.push(text);
          console.error(`  [Browser Console Error]: ${text}`);
        } else {
          consoleLogs.push(text);
        }
      } else if (msg.method === 'Runtime.exceptionThrown') {
        const desc = msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text;
        consoleErrors.push(desc);
        console.error(`  [Browser Uncaught Exception]: ${desc}`);
      }
    };

    await new Promise(r => ws.onopen = r);

    const call = (method, params = {}) => new Promise((resolve) => {
      const id = idCounter++;
      pending.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });

    const evalJs = async (expr) => {
      const res = await call('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
      if (res.result?.exceptionDetails) {
        throw new Error(`Eval error: ${JSON.stringify(res.result.exceptionDetails)}`);
      }
      return res.result?.result?.value;
    };

    await call('Runtime.enable');
    await call('Page.enable');

    // Wait until document.readyState === 'complete'
    for (let i = 0; i < 40; i++) {
      const readyState = await evalJs('document.readyState');
      if (readyState === 'complete') break;
      await new Promise(r => setTimeout(r, 200));
    }

    // 1. Document title and greeting
    const title = await evalJs('document.title');
    assert(title.includes('OpenRace SaaS Platform'), `Page title is correct ("${title}")`);

    const greeting = await evalJs('document.querySelector("h1")?.innerText');
    assert(greeting && greeting.includes('Good morning'), `Greeting header rendered ("${greeting}")`);

    // Verify 0 runtime script syntax errors
    assert(consoleErrors.length === 0, `Initial page load has ZERO console errors (found: ${consoleErrors.length})`);

    // 2. Tab Navigation Testing across all 7 tabs
    console.log('Testing Tab Navigation across all 7 tabs...');
    const tabsToTest = [
      { id: 'activities', contentId: 'tab-activities' },
      { id: 'club', contentId: 'tab-club' },
      { id: 'arena', contentId: 'tab-arena' },
      { id: 'finance', contentId: 'tab-finance' },
      { id: 'rules', contentId: 'tab-rules' },
      { id: 'admin', contentId: 'tab-admin' },
      { id: 'dashboard', contentId: 'tab-dashboard' }
    ];

    for (const tab of tabsToTest) {
      await evalJs(`window.switchTab('${tab.id}')`);
      const isActive = await evalJs(`document.getElementById('${tab.contentId}')?.classList.contains('active')`);
      assert(isActive === true, `Tab '${tab.id}' switches to active state`);
    }

    // 3. KM <-> VND Unit Toggle Testing
    console.log('Testing Unit Toggle (KM <-> VND)...');
    const initialUnit = await evalJs('document.getElementById("balance-unit")?.innerText');
    assert(initialUnit === 'KM', 'Initial unit is KM');

    await evalJs('window.toggleUnit()');
    const toggledUnit = await evalJs('document.getElementById("balance-unit")?.innerText');
    assert(toggledUnit === 'VND', 'Unit toggled to VND');

    await evalJs('window.toggleUnit()');
    const revertedUnit = await evalJs('document.getElementById("balance-unit")?.innerText');
    assert(revertedUnit === 'KM', 'Unit reverted back to KM');

    // 3.1 [Phân hệ 1.0] DASHBOARD RUNNER FRONTEND INTERACTION TESTING
    console.log('Testing [1.0] Dashboard Runner Sub-Features (1.1 - 1.5)...');
    await evalJs('window.switchTab("dashboard")');

    // [1.1] Strava Quick Sync
    await evalJs('window.quickSyncStrava()');
    await new Promise(r => setTimeout(r, 400));
    const syncTimeText = await evalJs('document.getElementById("strava-last-sync-time")?.innerText');
    assert(syncTimeText && syncTimeText.length > 0, 'Strava quick sync updates timestamp in DOM');

    // [1.2] Weekly Progress & Prorate Modal
    const completedKmText = await evalJs('document.getElementById("cycle-completed-km")?.innerText');
    const targetKmText = await evalJs('document.getElementById("cycle-target-km")?.innerText');
    assert(parseFloat(completedKmText) > 0, 'Weekly cycle shows completed km in DOM');
    assert(targetKmText === '20.0', 'Weekly cycle shows 20.0 km target in DOM');

    await evalJs('window.openProrateModal()');
    const prorateModalOpen = await evalJs('!document.getElementById("prorate-info-modal")?.classList.contains("hidden")');
    assert(prorateModalOpen === true, 'Prorate & 6h grace info modal opens');
    await evalJs('window.closeProrateModal()');
    const prorateModalClosed = await evalJs('document.getElementById("prorate-info-modal")?.classList.contains("hidden")');
    assert(prorateModalClosed === true, 'Prorate & 6h grace info modal closes cleanly');

    // [1.3] Penalty Warning Banner & Compensate Action
    const penaltyBannerExists = await evalJs('document.getElementById("section-1-3") !== null');
    assert(penaltyBannerExists === true, 'Penalty warning banner rendered in DOM');

    await evalJs('window.compensateRunNow()');
    const actModalOpen = await evalJs('!document.getElementById("add-act-modal")?.classList.contains("hidden")');
    const compDistVal = await evalJs('document.getElementById("act-input-dist")?.value');
    assert(actModalOpen === true && compDistVal === '1.5', 'Compensate run button opens Add Activity with prefilled distance (1.5 km)');
    await evalJs('window.closeAddActModal()');

    // [1.4] Active Races Carousel
    const initialRaceTitle = await evalJs('document.getElementById("race-card-title")?.innerText');
    assert(initialRaceTitle.includes('Mùa 10 Run to Techcombank'), 'Initial carousel slide displays Race 1');

    await evalJs('window.nextRaceSlide()');
    const nextRaceTitle = await evalJs('document.getElementById("race-card-title")?.innerText');
    assert(nextRaceTitle.includes('SARC Trail Challenge Ba Vì'), 'Carousel navigation transitions to Race 2');

    await evalJs('window.prevRaceSlide()');
    const prevRaceTitle = await evalJs('document.getElementById("race-card-title")?.innerText');
    assert(prevRaceTitle.includes('Mùa 10 Run to Techcombank'), 'Carousel navigation transitions back to Race 1');

    // [1.5] Quick QR / Link Entry Modal & Submission
    await evalJs('window.openJoinRaceModal()');
    const joinModalOpen = await evalJs('!document.getElementById("join-race-modal")?.classList.contains("hidden")');
    assert(joinModalOpen === true, 'Join race QR & code modal opens successfully');

    await evalJs('window.switchJoinTab("qr")');
    const qrViewVisible = await evalJs('!document.getElementById("join-view-qr")?.classList.contains("hidden")');
    assert(qrViewVisible === true, 'QR camera scanning simulation tab opens');

    await evalJs('window.switchJoinTab("code")');
    const codeViewVisible = await evalJs('!document.getElementById("join-view-code")?.classList.contains("hidden")');
    assert(codeViewVisible === true, 'Code input tab switches cleanly');

    await evalJs('window.setJoinSampleCode("RUN-OPEN-77")');
    await evalJs('window.submitJoinCode()');
    await new Promise(r => setTimeout(r, 400));

    const totalEnrolled = await evalJs('userRacesData.length');
    assert(totalEnrolled >= 4, 'Joining race via code adds new race to user carousel');
    await evalJs('window.closeJoinRaceModal()');

    // 3.2 [Phân hệ 2.0] GIẢI ĐẤU & ĐẤU TRƯỜNG (RACE ARENA) FRONTEND TESTING
    console.log('Testing [2.0] Race Arena Sub-Features (2.1 - 2.5)...');
    await evalJs('window.switchTab("arena")');

    // [2.1] Hero Banner & Race Countdown
    const arenaTitle = await evalJs('document.getElementById("arena-race-title")?.innerText');
    assert(arenaTitle.includes('TECHCOMBANK'), 'Arena Hero displays race title');

    const heroAthletes = await evalJs('document.getElementById("hero-athletes")?.innerText');
    const heroKm = await evalJs('document.getElementById("hero-km")?.innerText');
    const heroDays = await evalJs('document.getElementById("hero-days")?.innerText');
    assert(heroAthletes === '48' && heroKm === '3,170.0' && heroDays === '348', 'Hero metrics (Athletes, Km, Days) rendered correctly');

    await evalJs('window.changeArenaRace("sarc-trail-challenge-bavi-2026")');
    const changedTitle = await evalJs('document.getElementById("arena-race-title")?.innerText');
    assert(changedTitle.includes('BA VÌ'), 'Race switcher updates active race title');
    await evalJs('window.changeArenaRace("season-10-run-to-techcombank")');

    // [2.2] Team Leaderboard
    await evalJs('window.toggleArenaTab("team")');
    const teamViewActive = await evalJs('!document.getElementById("arena-team-view")?.classList.contains("hidden")');
    assert(teamViewActive === true, 'Team leaderboard view is visible');

    const teamViewText = await evalJs('document.getElementById("arena-team-view")?.innerText');
    assert(teamViewText.includes('Team Phoenix SARC') && teamViewText.includes('18.43'), 'Rank 1 team displays Phoenix SARC with 18.43 pts');
    assert(teamViewText.includes('100.000đ/người'), 'Rank 1 team qualifies for 100k fund fee');
    assert(teamViewText.includes('Đồng Hạng 2') && teamViewText.includes('200.000đ/người'), 'Tied Rank 2 teams display 200k fund fee');

    await evalJs('window.openTiebreakModal()');
    const tbOpen = await evalJs('!document.getElementById("tiebreak-info-modal")?.classList.contains("hidden")');
    assert(tbOpen === true, 'Tie-break modal opens');
    await evalJs('window.closeTiebreakModal()');
    const tbClosed = await evalJs('document.getElementById("tiebreak-info-modal")?.classList.contains("hidden")');
    assert(tbClosed === true, 'Tie-break modal closes cleanly');

    // [2.3] Individual Leaderboard
    await evalJs('window.toggleArenaTab("ind")');
    const indViewActive = await evalJs('!document.getElementById("arena-ind-view")?.classList.contains("hidden")');
    assert(indViewActive === true, 'Individual leaderboard view is visible');

    const indViewText = await evalJs('document.getElementById("arena-ind-view")?.innerText');
    assert(indViewText.toUpperCase().includes('NGUYỄN VĂN A') && indViewText.toUpperCase().includes('ÁO SARC'), 'Top 1 individual displays SARC shirt reward badge');

    // Test filter by name & team
    await evalJs(`
      document.getElementById('ind-search-input').value = 'Trần Thị B';
      filterIndividualRunners();
    `);
    const filteredRunners = await evalJs('document.getElementById("individual-runners-list")?.innerText');
    assert(filteredRunners.includes('Trần Thị B'), 'Individual runner search filters by name');

    await evalJs(`
      document.getElementById('ind-search-input').value = '';
      document.getElementById('ind-team-filter').value = 'ALL';
      filterIndividualRunners();
    `);

    // Verify Sticky Self Row
    const stickySelfVisible = await evalJs('document.getElementById("arena-sticky-self") !== null');
    assert(stickySelfVisible === true, 'Sticky self row rendered at bottom of arena');

    // [2.4] My Team Space
    await evalJs('window.toggleArenaTab("myteam")');
    const myTeamViewActive = await evalJs('!document.getElementById("arena-myteam-view")?.classList.contains("hidden")');
    assert(myTeamViewActive === true, 'My Team Space view is visible');

    const myTeamText = await evalJs('document.getElementById("arena-myteam-view")?.innerText');
    assert(myTeamText.includes('Team Phoenix SARC') && myTeamText.includes('Nguyễn Văn A'), 'My team space displays Phoenix SARC and Captain');

    await evalJs(`
      document.getElementById('cheer-input').value = 'Phoenix quyết tâm vô địch!';
      submitCheerMessage();
    `);
    await new Promise(r => setTimeout(r, 300));
    const cheerBoardText = await evalJs('document.getElementById("team-cheer-container")?.innerText');
    assert(cheerBoardText.includes('Phoenix quyết tâm vô địch!'), 'New cheer message added to team board');

    // [2.5] Live Stream Broadcast Simulation
    await evalJs('window.simulateLiveBroadcast()');
    await new Promise(r => setTimeout(r, 300));
    const liveTickerText = await evalJs('document.getElementById("arena-live-ticker")?.innerText');
    assert(liveTickerText.includes('Nguyễn Văn A') && liveTickerText.includes('5.0 km'), 'Live Stream simulated push updates ticker');

    
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

    // 3.4 [Phân hệ 4.0] KHÔNG GIAN CÂU LẠC BỘ (CLUB HUB) FRONTEND TESTING
    console.log('Testing [4.0] Club Hub Sub-Features (4.1 - 4.4)...');
    await evalJs('window.switchTab("club")');

    // [4.1] Club Profile Header & Leadership
    const clubTitle = await evalJs('document.getElementById("tab-club")?.innerText');
    assert(clubTitle.includes('CLB Chạy Bộ SARC') || clubTitle.includes('Câu Lạc Bộ'), 'Club Hub renders club title and profile');
    assert(clubTitle.includes('Hoàng Văn Minh') && (clubTitle.includes('Chủ nhiệm CLB') || clubTitle.includes('CHỦ NHIỆM CLB')), 'Club Hub displays Chairman Hoàng Văn Minh');
    assert(clubTitle.includes('Trần Quốc Tuấn') && (clubTitle.includes('Trưởng Ban Chuyên Môn') || clubTitle.includes('TRƯỞNG BAN CHUYÊN MÔN')), 'Club Hub displays Technical Lead Trần Quốc Tuấn');

    // [4.2] Races directory status filtering (Live / Upcoming / Archived)
    await evalJs('window.filterClubRaces("upcoming")');
    const upcomingRacesText = await evalJs('document.getElementById("club-races-container")?.innerText');
    assert(upcomingRacesText.includes('SARC Chào Xuân Đinh Mùi 2027'), 'Filter upcoming displays spring race');

    await evalJs('window.filterClubRaces("archived")');
    const archivedRacesText = await evalJs('document.getElementById("club-races-container")?.innerText');
    assert(archivedRacesText.includes('Mùa 9 Thử Thách Mùa Hè Rực Lửa'), 'Filter archived displays finished season 9 race');

    await evalJs('window.filterClubRaces("live")');
    const liveRacesText = await evalJs('document.getElementById("club-races-container")?.innerText');
    assert(liveRacesText.includes('Mùa 10 Run to Techcombank'), 'Filter live displays active season 10 race');

    // [4.3] Members Roster & Search Filter
    await evalJs('window.filterClubMembers("Tuấn")');
    const filteredMemberText = await evalJs('document.getElementById("club-members-tbody")?.innerText');
    assert(filteredMemberText.includes('Trần Quốc Tuấn') && !filteredMemberText.includes('Nguyễn Văn A'), 'Member search filters roster dynamically');

    await evalJs('window.filterClubMembers("")');
    const fullMemberText = await evalJs('document.getElementById("club-members-tbody")?.innerText');
    assert(fullMemberText.includes('Nguyễn Văn A') && fullMemberText.includes('Trần Quốc Tuấn'), 'Clearing search restores all members');

    // [4.4] In-App Detour Short Code Copy & Toast
    await evalJs('window.copyDetourCode()');
    const toastDetour = await evalJs('document.getElementById("toast-msg")?.innerText');
    assert(toastDetour.includes('OR-8K2Q'), 'Copying detour code shows toast with OR-8K2Q');

    // [4.4] Team Capacity & Dual Consent Validation
    // Click full team Phoenix
    await evalJs('window.selectJoinTeam("team-phoenix", true)');
    const fullFeedback = await evalJs('document.getElementById("join-team-feedback")?.innerText');
    assert(fullFeedback.includes('Đội đã đầy') && fullFeedback.includes('16/16'), 'Selecting full team displays capacity error feedback');

    // Select available team Dragons
    await evalJs('window.selectJoinTeam("team-dragons", false)');
    const selectedTeamLabel = await evalJs('document.getElementById("selected-team-name-label")?.innerText');
    assert(selectedTeamLabel.includes('Dragons'), 'Selecting Dragons updates team input and label');

    // Attempt join without consents
    await evalJs(`
      document.getElementById('consent-strava').checked = false;
      document.getElementById('consent-rules').checked = false;
      window.submitJoinTeam();
    `);
    const noConsentFeedback = await evalJs('document.getElementById("join-team-feedback")?.innerText');
    assert(noConsentFeedback.includes('Thiếu cam kết bắt buộc'), 'Submitting without dual consents alerts runner');

    // Check dual consents and submit
    await evalJs(`
      document.getElementById('consent-strava').checked = true;
      document.getElementById('consent-rules').checked = true;
      window.submitJoinTeam();
    `);
    await new Promise(r => setTimeout(r, 400));
    const successFeedback = await evalJs('document.getElementById("join-team-feedback")?.innerText');
    assert(successFeedback.includes('GIA NHẬP THÀNH CÔNG'), 'Submitting with dual consents confirms successful team join');

    const updatedRosterText = await evalJs('document.getElementById("club-members-tbody")?.innerText');
    assert(updatedRosterText.includes('Vận Động Viên Mới'), 'Newly joined athlete added to live roster table');

    // 3.5 SIDEBAR & NAVIGATION CODES [1.0] -> [8.0] TESTING
    console.log('Testing Navigation Hierarchy & Module Codes [1.0] -> [8.0]...');
    const sidebarText = await evalJs('document.getElementById("main-sidebar")?.innerText');
    assert(sidebarText !== null && sidebarText.length > 0, 'Sidebar is present and visible in DOM');
    assert(sidebarText.includes('Tổng Quan') && sidebarText.includes('Đấu Trường') && sidebarText.includes('Nhật Ký'), 'Sidebar contains Runner, Arena, Activities');
    assert(sidebarText.includes('Không Gian CLB') && sidebarText.includes('Cá Nhân') && sidebarText.includes('Quản Trị CLB'), 'Sidebar contains Club, Personal, Club Admin');
    assert(sidebarText.includes('Điều Hành Giải') && sidebarText.includes('Hệ Thống Toàn Sàn'), 'Sidebar contains Race Ops, Super Admin');
    assert(sidebarText.includes('Đồng bộ Strava') && sidebarText.includes('Hero & Đếm ngược') && sidebarText.includes('Toàn bộ bài chạy'), 'Sidebar contains clean uncoded Sub-menus');

    // Header Segmented Nav Tree
    const navText = await evalJs('document.querySelector("header nav")?.innerText');
    assert(navText.includes('Tổng Quan') && navText.includes('Đấu Trường') && navText.includes('Nhật Ký'), 'Header Nav displays full tree menu with clean uncoded titles');

    // 4. Interactive Rule Simulator Testing (Rules tab)
    console.log('Testing Rule Simulator in Rules Tab...');
    await evalJs('window.switchTab("rules")');

    // Sim Test A: Valid run (5km, 25min = pace 5:00)
    await evalJs(`
      document.getElementById('sim-dist').value = '5.0';
      document.getElementById('sim-time').value = '25.0';
      document.getElementById('sim-gain').value = '0';
      window.runSimulation();
    `);
    const simResA = await evalJs('document.getElementById("sim-result")?.innerText');
    assert(simResA.includes('BÀI CHẠY HỢP LỆ') && simResA.includes('5.0 km'), 'Simulator correctly accepts valid 5km / pace 5:00 run');

    // Sim Test B: Distance < 3.0 km
    await evalJs(`
      document.getElementById('sim-dist').value = '2.5';
      document.getElementById('sim-time').value = '15.0';
      document.getElementById('sim-gain').value = '0';
      window.runSimulation();
    `);
    const simResB = await evalJs('document.getElementById("sim-result")?.innerText');
    assert(simResB.includes('BÀI CHẠY BỊ TỪ CHỐI') && simResB.includes('nhỏ hơn mức tối thiểu 3.0 km'), 'Simulator rejects distance < 3.0 km');

    // Sim Test C: Absolute Pace Floor < 2:45 min/km (10km in 20min = pace 2:00)
    await evalJs(`
      document.getElementById('sim-dist').value = '10.0';
      document.getElementById('sim-time').value = '20.0';
      document.getElementById('sim-gain').value = '0';
      window.runSimulation();
    `);
    const simResC = await evalJs('document.getElementById("sim-result")?.innerText');
    assert(simResC.includes('CẦN XÁC MINH') && simResC.includes('2:45 min/km'), 'Simulator enforces 2:45 pace floor barrier');

    // Sim Test D: Trail Pace > 10:00 with Gain 220m -> Trail Bonus +2km
    await evalJs(`
      document.getElementById('sim-dist').value = '10.0';
      document.getElementById('sim-time').value = '110.0';
      document.getElementById('sim-gain').value = '220';
      window.runSimulation();
    `);
    const simResD = await evalJs('document.getElementById("sim-result")?.innerText');
    assert(simResD.includes('Thưởng Trail: +2.0 km') && simResD.includes('12.0 km'), 'Simulator awards Trail Elevation Bonus (+2.0 km)');

    // 5. Modal Activity Submission Testing (Activities tab)
    console.log('Testing Activity Submission Modal...');
    await evalJs('window.switchTab("activities")');
    await evalJs('window.openAddActModal()');
    const modalHidden = await evalJs('document.getElementById("add-act-modal")?.classList.contains("hidden")');
    assert(modalHidden === false, 'Add Activity modal opens successfully');

    // Submit valid activity
    await evalJs(`
      document.getElementById('act-input-title').value = 'Chạy Test E2E Buổi Chiều';
      document.getElementById('act-input-dist').value = '7.5';
      document.getElementById('act-input-time').value = '41.25';
      document.getElementById('act-input-gain').value = '30';
      window.submitNewActivity();
    `);
    await new Promise(r => setTimeout(r, 200));

    const latestAct = await evalJs('liveActivities[0]');
    assert(latestAct.title.includes('Chạy Test E2E Buổi Chiều'), 'New activity added to live state');
    assert(latestAct.dist === 7.5 && latestAct.valid === true, 'New activity has 7.5km and valid=true');

    const firstRowText = await evalJs('document.getElementById("activities-container")?.firstElementChild?.innerText');
    assert(firstRowText.includes('Chạy Test E2E Buổi Chiều') && firstRowText.includes('7.5 km'), 'New activity rendered into DOM');

    // 6. Interactive Appeal & Admin Approval Testing
    console.log('Testing Appeal Submission and Admin Approval...');
    // Create an invalid activity to appeal
    await evalJs(`
      liveActivities.unshift({
        id: 'act-e2e-appeal-target',
        title: '🏃 Chạy test bị lỗi GPS hầm Kim Liên',
        athlete: 'Nguyễn Văn A',
        dist: 5.0,
        time: 12.0,
        paceStr: '2:24',
        gain: 0,
        valid: false,
        bonus: 0,
        finalKm: 0.0,
        reason: 'Pace 2:24 min/km vượt sàn 2:45 min/km',
        appealStatus: 'NONE'
      });
      renderActivities();
    `);

    // Override window.prompt to provide automated input
    await evalJs(`
      window.prompt = function(message, defaultVal) {
        if (message.includes('khiếu nại bài')) return 'Mất GPS hầm Kim Liên';
        if (message.includes('số km công nhận')) return '5.0';
        return defaultVal;
      };
      promptAppeal('act-e2e-appeal-target');
    `);

    const appealAct = await evalJs('liveActivities.find(a => a.id === "act-e2e-appeal-target")');
    assert(appealAct.appealStatus === 'PENDING', 'Activity appealStatus changed to PENDING');

    const appealItem = await evalJs('liveAppeals.find(a => a.actId === "act-e2e-appeal-target")');
    assert(appealItem && appealItem.reason === 'Mất GPS hầm Kim Liên', 'Appeal created in liveAppeals');

    // Admin approves the appeal
    await evalJs(`adminApproveAppeal('${appealItem.id}')`);
    const approvedAct = await evalJs('liveActivities.find(a => a.id === "act-e2e-appeal-target")');
    assert(approvedAct.appealStatus === 'APPROVED', 'Activity appealStatus transitioned to APPROVED');
    assert(approvedAct.valid === true && approvedAct.finalKm === 5.0, 'Approved activity credited with +5.0 km');

    // 7. Admin Finance Confirmation Testing
    console.log('Testing Admin Finance Payment Confirmation...');
    await evalJs('window.switchTab("admin")');
    const targetFin = await evalJs('liveFinance.find(f => f.id === "fin-1")');
    assert(targetFin.status === 'UNPAID', 'Initial fin-1 status is UNPAID');

    await evalJs('adminConfirmPay("fin-1")');
    const confirmedFin = await evalJs('liveFinance.find(f => f.id === "fin-1")');
    assert(confirmedFin.status === 'PAID', 'fin-1 status updated to PAID after admin confirmation');

    const adminFinDom = await evalJs('document.getElementById("admin-finance-container")?.innerText');
    assert(adminFinDom.includes('Đã thu'), 'Admin finance DOM displays "Đã thu" status badge');

    // 8. Admin Lifecycle and Batch Recalculate
    console.log('Testing Admin Lifecycle and Recalculate Actions...');
    await evalJs('changeLifecycle("paused")');
    const toastText = await evalJs('document.getElementById("toast-msg")?.innerText');
    assert(toastText.includes('PAUSED'), `Toast confirms lifecycle changed to PAUSED ("${toastText}")`);

    await evalJs('recalculateAllAdmin()');
    const toastRecalc = await evalJs('document.getElementById("toast-msg")?.innerText');
    assert(toastRecalc.includes('Đã tính toán lại toàn bộ'), 'Recalculate all triggered successfully');

    // 9. Copy Onboarding Link & CSV Export
    console.log('Testing CSV Export and Onboarding Copy...');
    await evalJs('window.switchTab("club")');
    await evalJs('copyOnboardLink()');
    const copyBtnText = await evalJs('document.getElementById("btn-copy-onboard")?.innerText');
    assert(copyBtnText.includes('Đã sao chép'), 'Onboarding copy link button gives feedback');

    // Test CSV Export doesn't throw
    const csvExportSuccess = await evalJs(`
      (function() {
        try {
          window.URL.createObjectURL = () => 'blob:mock-url';
          window.URL.revokeObjectURL = () => {};
          exportActivitiesCsv();
          return true;
        } catch(e) {
          return false;
        }
      })()
    `);
    assert(csvExportSuccess === true, 'exportActivitiesCsv executes cleanly without errors');

    // 10. Test Dedicated Sub-Screens & CRUD Operations [AC-030 - AC-034]
    console.log('Testing Dedicated Sub-Screens & CRUD Operations [AC-030 - AC-034]...');

    // A. Subsystem 6.2 - Member Management & Team Capacity Roster
    await evalJs('goToScreen("6.2")');
    const sec62Present = await evalJs('!!document.getElementById("section-6-2")');
    assert(sec62Present === true, 'Screen [6.2] Quản lý thành viên is present in DOM');

    const memberRows = await evalJs('document.querySelectorAll("#admin-members-tbody tr").length');
    assert(memberRows >= 3, 'Screen [6.2] renders member roster rows');

    // Add Member via Modal
    await evalJs('openAddMemberModal()');
    const isAddModalOpen = await evalJs('!document.getElementById("modal-admin-add-member")?.classList.contains("hidden")');
    assert(isAddModalOpen === true, 'Modal [6.2] Thêm thành viên opens successfully');

    await evalJs(`
      (function() {
        const nameInput = document.getElementById("add-member-name");
        if (nameInput) nameInput.value = "Lê Thị Thu";
        const emailInput = document.getElementById("add-member-email");
        if (emailInput) emailInput.value = "thu.le@sarc.vn";
        const roleSelect = document.getElementById("add-member-role");
        if (roleSelect) roleSelect.value = "RUNNER";
      })()
    `);
    await evalJs('submitAddMember()');
    const rosterAfterAdd = await evalJs('document.getElementById("admin-members-tbody")?.innerText');
    assert(rosterAfterAdd.includes('Lê Thị Thu'), 'Newly added member "Lê Thị Thu" rendered in table roster');

    // Toggle Lock
    await evalJs('adminToggleLock("user-01")');
    const user1Status = await evalJs('adminMembers.find(m => m.id === "user-01")?.status');
    assert(user1Status === 'LOCKED', 'adminToggleLock toggles member status to LOCKED');

    // B. Subsystem 7.1 - Race Setup & Configurator Wizard
    await evalJs('goToScreen("7.1")');
    const sec71Present = await evalJs('!!document.getElementById("section-7-1")');
    assert(sec71Present === true, 'Screen [7.1] Thiết lập giải đấu is present in DOM');

    await evalJs('openRaceWizardModal()');
    const isWzOpen = await evalJs('!document.getElementById("modal-race-wizard")?.classList.contains("hidden")');
    assert(isWzOpen === true, 'Race Setup Wizard Modal [7.1] opens successfully');

    await evalJs('(async () => { await submitRaceWizard(); })()');
    const toastWz = await evalJs('document.getElementById("toast-msg")?.innerText');
    assert(toastWz.includes('xuất bản thành công') || toastWz.includes('Đã thiết lập'), 'Race wizard submits and displays success toast');

    // C. Subsystem 5.1 - Profile CRUD Update
    await evalJs('goToScreen("5.1")');
    const sec51Present = await evalJs('!!document.getElementById("section-5-1")');
    assert(sec51Present === true, 'Screen [5.1] Hồ sơ cá nhân is present in DOM');

    await evalJs(`
      (function() {
        const nameInput = document.getElementById("profile-name");
        if (nameInput) nameInput.value = "Nguyễn Văn A (E2E Master)";
      })()
    `);
    await evalJs('saveUserProfile()');
    const headerGreeting = await evalJs('document.querySelector("h1")?.innerText');
    assert(headerGreeting.includes('Nguyễn Văn A (E2E Master)'), 'Profile update reflects live in header greeting');

    // D. Subsystem 6.1 - Club Settings CRUD Update
    await evalJs('goToScreen("6.1")');
    const sec61Present = await evalJs('!!document.getElementById("section-6-1")');
    assert(sec61Present === true, 'Screen [6.1] Cài đặt CLB & VietQR is present in DOM');

    await evalJs('saveClubSettings()');
    const toastClub = await evalJs('document.getElementById("toast-msg")?.innerText');
    assert(toastClub.includes('Đã lưu cài đặt CLB'), 'Club settings update reflects live with success toast');

    // E. Subsystems Dedicated Screens Navigation Audit
    const testScreens = ['1.1', '2.1', '3.1', '4.1', '5.1', '6.1', '7.1', '8.1'];
    let allNavSuccess = true;
    for (const sc of testScreens) {
      await evalJs(`goToScreen("${sc}")`);
      const targetSec = await evalJs(`!!document.getElementById("section-${sc.replace('.', '-')}")`);
      if (!targetSec) allNavSuccess = false;
    }
    assert(allNavSuccess === true, 'All 8 subsystem dedicated entry screens ([1.1] to [8.1]) are navigable via goToScreen()');

    // F. V2 Strava Self-Service & Sync Logs DOM Verification
    console.log('Testing V2 Strava Self-Service & Sync Logs DOM...');
    await evalJs('goToScreen("5.1")');
    const syncRows = await evalJs('document.querySelectorAll("#strava-sync-logs-tbody tr").length');
    assert(syncRows >= 3, 'Strava raw sync logs table renders at least 3 webhook records in DOM');

    await evalJs('disconnectStravaClient()');
    const toastDisc = await evalJs('document.getElementById("toast-msg")?.innerText');
    assert(toastDisc.includes('Strava') || toastDisc.includes('bảo lưu'), 'Strava self-service disconnect displays feedback toast');

    await evalJs('reconnectStravaClient()');
    const toastRecon = await evalJs('document.getElementById("toast-msg")?.innerText');
    assert(toastRecon.includes('kết nối lại'), 'Strava reconnect displays feedback toast');

    // G. 6 Dedicated Management Consoles Reachability (SRS v2.0 Section 2.2)
    const consoles = [
      { name: '1. Personal Hub (/me)', screen: '5.1' },
      { name: '2. Team Management Console (/teams/{id}/ctl)', screen: '6.2' },
      { name: '3. Race Operations Console (/races/{slug}/ctl)', screen: '7.1' },
      { name: '4. Club Management Hub (/clubs/{slug}/ctl)', screen: '6.1' },
      { name: '5. Community Hub (/community)', screen: '3.1' },
      { name: '6. Super Admin Portal (/admin)', screen: '8.1' }
    ];
    let allConsolesReachable = true;
    for (const c of consoles) {
      await evalJs(`goToScreen("${c.screen}")`);
      const exists = await evalJs(`!!document.getElementById("section-${c.screen.replace('.', '-')}")`);
      if (!exists) allConsolesReachable = false;
    }
    assert(allConsolesReachable === true, 'All 6 Dedicated Management Portals from SRS v2.0 are directly reachable');

    // 11. Final verify: No uncaught console errors occurred during the entire test run
    assert(consoleErrors.length === 0, `Total browser console errors during entire E2E test session: ${consoleErrors.length}`);

    ws.close();
  } finally {
    if (browserProc && !browserProc.killed) {
      browserProc.kill();
    }
  }
}

async function main() {
  console.log('================================================================');
  console.log('  STARTING COMPREHENSIVE END-TO-END QA TEST SUITE');
  console.log('  OpenRace SaaS Platform - System & Acceptance Verification');
  console.log('================================================================');

  const startTime = Date.now();

  try {
    await testBackendApis();
    await testFrontendHeadless();
  } catch (err) {
    console.error('Fatal test error:', err);
    totalTests++;
    failedTests++;
    failures.push(err.message);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('\n================================================================');
  console.log(`  QA TEST EXECUTION SUMMARY: ${duration}s`);
  console.log(`  TOTAL TESTS : ${totalTests}`);
  console.log(`  PASSED      : ${passedTests}`);
  console.log(`  FAILED      : ${failedTests}`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    console.error('FAILURES:');
    failures.forEach((f, i) => console.error(`  ${i + 1}. ${f}`));
    process.exit(1);
  } else {
    console.log('>>> ALL ACCEPTANCE & REAL-INTERACTION TESTS PASSED 100%! <<<\n');
    process.exit(0);
  }
}

main();
