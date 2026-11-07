/**
 * OpenRace SaaS Platform - Concurrency & Stress Testing Suite (Pillar 4)
 * Simulates 200+ concurrent Virtual Users hitting core API endpoints under heavy load.
 * Verifies SLA thresholds: p95 <= 500ms, p99 <= 1000ms, Error Rate < 1%, Memory stability.
 */

const http = require('http');
const { performance } = require('perf_hooks');

const API_HOST = '127.0.0.1';
const API_PORT = 3001;
const CONCURRENT_USERS = 200;
const REQUESTS_PER_USER = 5;
const TOTAL_REQUESTS = CONCURRENT_USERS * REQUESTS_PER_USER;

const ENDPOINTS = [
  { method: 'GET', path: '/api/me/navigation-context' },
  { method: 'GET', path: '/api/system/platform-config' },
  { method: 'GET', path: '/api/me/clubs' },
  { method: 'GET', path: '/api/me/my-races' },
  { method: 'GET', path: '/api/club/admin/pulse-analytics' },
  { method: 'GET', path: '/api/races/wizard/catalogs' },
  { method: 'GET', path: '/api/races/race-season-10/landing' },
  { method: 'GET', path: '/api/admin/ops/traffic/analytics' },
  { 
    method: 'POST', 
    path: '/api/me/submit-activity',
    body: JSON.stringify({ userId: 'user-01', distanceKm: 5.0, durationMinutes: 30, type: 'road' }),
    headers: { 'Content-Type': 'application/json' }
  },
  {
    method: 'POST',
    path: '/api/activities/smart-tag',
    body: JSON.stringify({ distanceKm: 12.0, elevationGainM: 350 }),
    headers: { 'Content-Type': 'application/json' }
  }
];

function makeRequest(endpoint) {
  return new Promise((resolve) => {
    const startTime = performance.now();
    const payload = endpoint.body || null;
    const reqHeaders = {
      ...(endpoint.headers || {}),
      'Connection': 'keep-alive'
    };
    if (payload) {
      reqHeaders['Content-Length'] = Buffer.byteLength(payload);
    }

    const options = {
      hostname: API_HOST,
      port: API_PORT,
      path: endpoint.path,
      method: endpoint.method,
      headers: reqHeaders,
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const endTime = performance.now();
        const latencyMs = endTime - startTime;
        if (res.statusCode < 200 || res.statusCode >= 400) {
          if (!makeRequest.loggedErrors) makeRequest.loggedErrors = {};
          const key = `${endpoint.method} ${endpoint.path} -> ${res.statusCode}`;
          makeRequest.loggedErrors[key] = (makeRequest.loggedErrors[key] || 0) + 1;
        }
        resolve({
          status: res.statusCode,
          latencyMs,
          success: res.statusCode >= 200 && res.statusCode < 400
        });
      });
    });

    req.on('error', (err) => {
      const endTime = performance.now();
      resolve({
        status: 0,
        latencyMs: endTime - startTime,
        success: false,
        error: err.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      const endTime = performance.now();
      resolve({
        status: 408,
        latencyMs: endTime - startTime,
        success: false,
        error: 'TIMEOUT'
      });
    });

    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

function calculatePercentile(sortedArray, percentile) {
  if (sortedArray.length === 0) return 0;
  const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
  return sortedArray[Math.max(0, Math.min(index, sortedArray.length - 1))];
}

async function runConcurrencyStressTest() {
  console.log('================================================================');
  console.log('  OPENRACE SAAS - HIGH CONCURRENCY STRESS & PERFORMANCE AUDIT   ');
  console.log('================================================================');
  console.log(`Target: http://${API_HOST}:${API_PORT}`);
  console.log(`Concurrent Users (VU):  ${CONCURRENT_USERS}`);
  console.log(`Requests per VU:        ${REQUESTS_PER_USER}`);
  console.log(`Total Requests:         ${TOTAL_REQUESTS}`);
  console.log(`API Endpoints Tested:   ${ENDPOINTS.length}`);
  console.log('----------------------------------------------------------------\n');

  const initialMemory = process.memoryUsage();
  console.log(`[Baseline Memory] Heap Used: ${(initialMemory.heapUsed / (1024 * 1024)).toFixed(2)} MB | RSS: ${(initialMemory.rss / (1024 * 1024)).toFixed(2)} MB`);

  console.log(`\n>>> Firing ${TOTAL_REQUESTS} requests across ${CONCURRENT_USERS} concurrent workers...`);
  const globalStart = performance.now();

  // Create pool of concurrent promises
  const allTasks = [];
  for (let u = 0; u < CONCURRENT_USERS; u++) {
    const userTask = (async () => {
      const results = [];
      for (let r = 0; r < REQUESTS_PER_USER; r++) {
        const endpoint = ENDPOINTS[(u * REQUESTS_PER_USER + r) % ENDPOINTS.length];
        const res = await makeRequest(endpoint);
        results.push(res);
      }
      return results;
    })();
    allTasks.push(userTask);
  }

  const workerResults = await Promise.all(allTasks);
  const globalEnd = performance.now();
  const totalElapsedMs = globalEnd - globalStart;

  const flatResults = workerResults.flat();
  const latencies = flatResults.map(r => r.latencyMs).sort((a, b) => a - b);
  const totalSuccess = flatResults.filter(r => r.success).length;
  const totalFailed = flatResults.filter(r => !r.success).length;
  const errorRatePercent = ((totalFailed / flatResults.length) * 100).toFixed(2);

  const minLatency = latencies[0].toFixed(2);
  const maxLatency = latencies[latencies.length - 1].toFixed(2);
  const avgLatency = (latencies.reduce((sum, v) => sum + v, 0) / latencies.length).toFixed(2);
  const p50 = calculatePercentile(latencies, 50).toFixed(2);
  const p90 = calculatePercentile(latencies, 90).toFixed(2);
  const p95 = calculatePercentile(latencies, 95).toFixed(2);
  const p99 = calculatePercentile(latencies, 99).toFixed(2);

  const reqPerSec = Math.round((flatResults.length / (totalElapsedMs / 1000)));

  const finalMemory = process.memoryUsage();
  const memoryDeltaMb = ((finalMemory.heapUsed - initialMemory.heapUsed) / (1024 * 1024)).toFixed(2);

  console.log('\n================================================================');
  console.log('>>> CONCURRENCY STRESS TEST RESULTS:');
  console.log('================================================================');
  console.log(`Total Requests Handled:   ${flatResults.length}`);
  console.log(`Successful Responses:     ${totalSuccess}`);
  console.log(`Failed Responses:         ${totalFailed}`);
  if (makeRequest.loggedErrors) {
    console.log('Error Breakdown:', JSON.stringify(makeRequest.loggedErrors, null, 2));
  }
  console.log(`Error Rate:               ${errorRatePercent}% (SLA: < 1.00%)`);
  console.log(`Total Duration:           ${totalElapsedMs.toFixed(2)} ms`);
  console.log(`Throughput:               ${reqPerSec.toLocaleString()} req/sec`);
  console.log('----------------------------------------------------------------');
  console.log('Latency Distribution:');
  console.log(`  Min Latency:            ${minLatency} ms`);
  console.log(`  Average Latency:        ${avgLatency} ms`);
  console.log(`  p50 (Median):           ${p50} ms`);
  console.log(`  p90:                    ${p90} ms`);
  console.log(`  p95:                    ${p95} ms (SLA: <= 500 ms)`);
  console.log(`  p99:                    ${p99} ms (SLA: <= 1000 ms)`);
  console.log(`  Max Latency:            ${maxLatency} ms`);
  console.log('----------------------------------------------------------------');
  console.log('Resource Footprint:');
  console.log(`  Final Heap Used:        ${(finalMemory.heapUsed / (1024 * 1024)).toFixed(2)} MB (Delta: ${memoryDeltaMb} MB)`);
  console.log(`  Final RSS:              ${(finalMemory.rss / (1024 * 1024)).toFixed(2)} MB`);
  console.log('================================================================');

  let passed = true;
  const issues = [];

  if (parseFloat(errorRatePercent) >= 1.0) {
    passed = false;
    issues.push(`Error rate ${errorRatePercent}% exceeded SLA limit (< 1.0%)`);
  }
  if (parseFloat(p95) > 500) {
    passed = false;
    issues.push(`p95 latency ${p95}ms exceeded SLA limit (<= 500ms)`);
  }
  if (parseFloat(p99) > 1000) {
    passed = false;
    issues.push(`p99 latency ${p99}ms exceeded SLA limit (<= 1000ms)`);
  }

  if (passed) {
    console.log('\n[PASS] 100% SLA THRESHOLDS MET UNDER 200 CONCURRENT USERS LOAD!\n');
    process.exit(0);
  } else {
    console.error('\n[FAIL] Stress Test SLA violations:\n' + issues.join('\n'));
    process.exit(1);
  }
}

runConcurrencyStressTest().catch(err => {
  console.error('Fatal stress test runner failure:', err);
  process.exit(1);
});
