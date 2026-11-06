const fs = require('fs');
const path = require('path');

const mainTsPath = path.resolve(__dirname, 'backend/src/main.ts');
let code = fs.readFileSync(mainTsPath, 'utf8');

console.log('=== Step 1: Add Imports for Queue and Cache in main.ts ===');
const oldImports = `import { V2CommunityFeaturesUseCase } from './application/use-cases/v2-community-features.use-case';`;
const newImports = `import { V2CommunityFeaturesUseCase } from './application/use-cases/v2-community-features.use-case';
import { StravaSyncQueueWorker } from './infrastructure/queue/strava-sync-queue';
import { LeaderboardCacheService } from './infrastructure/cache/leaderboard-cache.service';`;

if (code.includes(oldImports) && !code.includes('StravaSyncQueueWorker')) {
  code = code.replace(oldImports, newImports);
  console.log('Added Queue and Cache imports.');
}

console.log('=== Step 2: Initialize Queue and Cache in bootstrap() ===');
const oldBootstrapInstances = `  const clubHubUseCase = new ClubHubUseCase(dataStore);
  const v2CommunityUseCase = new V2CommunityFeaturesUseCase(dataStore);`;

const newBootstrapInstances = `  const clubHubUseCase = new ClubHubUseCase(dataStore);
  const v2CommunityUseCase = new V2CommunityFeaturesUseCase(dataStore);
  const queueWorker = new StravaSyncQueueWorker();
  const cacheService = new LeaderboardCacheService();

  // Listen to queue worker completions and broadcast SSE
  queueWorker.onCompleted((job) => {
    raceArenaUseCase.broadcastLiveEvent('season-10-run-to-techcombank', {
      type: 'strava_synced',
      athleteName: job.athleteName,
      teamName: 'Team Phoenix SARC',
      distanceKm: job.addedKm,
      message: \`⚡ Hàng đợi BullMQ: Đã đồng bộ thành công bài chạy +\${job.addedKm}km cho \${job.athleteName}\`,
      timestamp: new Date().toISOString(),
    });
    // Invalidate leaderboard cache
    cacheService.invalidateByTag('race:season-10');
  });`;

if (code.includes(oldBootstrapInstances) && !code.includes('queueWorker = new StravaSyncQueueWorker()')) {
  code = code.replace(oldBootstrapInstances, newBootstrapInstances);
  console.log('Initialized queueWorker and cacheService in bootstrap().');
}

console.log('=== Step 3: Add Enterprise API Routes in handleApiRequest ===');
const apiAnchor = `    // [1.1] Strava Status
    if (req.method === 'GET' && pathname === '/api/me/strava-status') {`;

const newApiEndpoints = `    // [Enterprise Layer III.1] Queue-based Strava Sync (BullMQ + Redis pattern)
    if (req.method === 'POST' && pathname === '/api/me/strava-sync-queue') {
      const job = queueWorker.enqueueSync('user-01', 'Nguyễn Văn A', 'HIGH');
      res.writeHead(202, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({
        success: true,
        queued: true,
        jobId: job.id,
        status: job.status,
        message: 'Đã đưa yêu cầu đồng bộ vào Hàng Đợi (Queue Worker). Hệ thống đang xử lý phân bổ rate-limit...',
        job,
      }));
      return true;
    }

    // [Enterprise Layer I.2] GitHub-style Running Streak Contributions Heatmap
    if (req.method === 'GET' && pathname === '/api/me/contributions-heatmap') {
      const cached = cacheService.get('user-01:heatmap');
      if (cached) {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'X-Cache': 'HIT' });
        res.end(JSON.stringify(cached));
        return true;
      }
      const data = runnerDashboardUseCase.getContributionsHeatmap('user-01');
      cacheService.set('user-01:heatmap', data, 120, ['user-01']);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'X-Cache': 'MISS' });
      res.end(JSON.stringify(data));
      return true;
    }

    // [Enterprise Layer II.2] Dynamic VietQR with Unique Transaction Memo
    if (req.method === 'GET' && pathname === '/api/me/dynamic-vietqr') {
      const data = runnerDashboardUseCase.getDynamicVietQr('user-01', 100000);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(data));
      return true;
    }

    // [Enterprise Layer II.2] Bank Payment Webhook Simulator (Instant Auto-Settlement)
    if (req.method === 'POST' && pathname === '/api/finance/bank-webhook') {
      let body = '';
      req.on('data', (chunk) => { body += chunk; });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body || '{}');
          const memo = payload.memo || 'SARC_USER01_100K_M10';
          const amount = payload.amount || 100000;

          // Find matching ledger in dataStore
          const ledgers = dataStore.getParticipantLedgers('race-season-10');
          const matched = ledgers.find((l) => l.userId === 'user-01' || memo.includes('USER01') || memo.includes('NGUYENVANA'));
          if (matched) {
            matched.status = 'PAID';
            matched.paidVnd = amount;
            matched.lastUpdated = new Date().toISOString();
          }

          // Invalidate finance cache
          cacheService.invalidate('race:season-10:finance');

          // Broadcast realtime SSE event
          raceArenaUseCase.broadcastLiveEvent('season-10-run-to-techcombank', {
            type: 'finance_settled',
            athleteName: 'Nguyễn Văn A',
            teamName: 'Team Phoenix SARC',
            distanceKm: 0,
            message: \`💳 Ngân hàng Techcombank xác nhận: Nhận \${amount.toLocaleString()}đ với cú pháp \${memo}. Đã gạch nợ tự động!\`,
            timestamp: new Date().toISOString(),
          });

          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({
            success: true,
            settled: true,
            memo,
            amount,
            status: 'PAID',
            reconciledAt: new Date().toISOString(),
            message: 'Đối soát ngân hàng thành công! Đã tự động xóa nợ cho VĐV.',
          }));
        } catch (err: any) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return true;
    }

    // [Enterprise Layer II.1] Multi-Tier Dispute & Appeal API
    if (req.method === 'POST' && pathname === '/api/appeals/multi-tier') {
      let body = '';
      req.on('data', (chunk) => { body += chunk; });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body || '{}');
          const appeal = appealsUseCase.submitMultiTierAppeal(
            payload.raceId || 'race-season-10',
            payload.userId || 'user-01',
            payload.activityId || 'ACT_000073',
            payload.reason || 'Đồng hồ GPS nhảy bước khi qua hầm Thủ Thiêm',
            payload.evidenceUrl
          );

          raceArenaUseCase.broadcastLiveEvent('season-10-run-to-techcombank', {
            type: 'appeal_created',
            athleteName: 'Nguyễn Văn A',
            teamName: 'Team Phoenix SARC',
            distanceKm: 2.4,
            message: \`⚖ Khiếu nại bài chạy \${appeal.activityId}: Đã nộp minh chứng, chuyển Đội Trưởng kiểm tra sơ bộ (Tier 1)\`,
            timestamp: new Date().toISOString(),
          });

          res.writeHead(201, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: true, appeal }));
        } catch (err: any) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return true;
    }

    // [Enterprise Layer II.1] Captain Tier-1 Endorsement API
    if (req.method === 'POST' && pathname === '/api/appeals/captain-endorse') {
      let body = '';
      req.on('data', (chunk) => { body += chunk; });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body || '{}');
          const appeal = appealsUseCase.captainEndorseAppeal(
            payload.appealId,
            payload.captainId || 'lead-01',
            payload.note || 'Đội trưởng xác nhận VĐV chạy nhóm có mặt thực tế trên track'
          );

          raceArenaUseCase.broadcastLiveEvent('season-10-run-to-techcombank', {
            type: 'appeal_endorsed',
            athleteName: 'Nguyễn Văn A',
            teamName: 'Team Phoenix SARC',
            distanceKm: 2.4,
            message: \`⚖ Khiếu nại \${appeal.id}: Đội trưởng đã duyệt Tier 1. Chuyển Super Admin phê duyệt dứt điểm!\`,
            timestamp: new Date().toISOString(),
          });

          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: true, appeal }));
        } catch (err: any) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return true;
    }

    // [Enterprise Layer III.2] Telemetry & Cache Metrics API
    if (req.method === 'GET' && pathname === '/api/system/cache-metrics') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({
        cache: cacheService.getMetrics(),
        queue: queueWorker.getMetrics(),
        timestamp: new Date().toISOString(),
      }));
      return true;
    }

    // [1.1] Strava Status
    if (req.method === 'GET' && pathname === '/api/me/strava-status') {`;

if (code.includes(apiAnchor) && !code.includes('/api/me/strava-sync-queue')) {
  code = code.replace(apiAnchor, newApiEndpoints);
  console.log('Added Enterprise API endpoints.');
}

fs.writeFileSync(mainTsPath, code, 'utf8');
console.log('Step 1-3 complete.');

