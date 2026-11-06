const fs = require('fs');
const path = require('path');

const mainPath = path.join(__dirname, 'src', 'main.ts');
let content = fs.readFileSync(mainPath, 'utf8');

// 1. Add import
if (!content.includes("runner-dashboard.use-case")) {
  content = content.replace(
    "import { AdminManagementUseCase } from './application/use-cases/admin-management.use-case';",
    "import { AdminManagementUseCase } from './application/use-cases/admin-management.use-case';\nimport { RunnerDashboardUseCase } from './application/use-cases/runner-dashboard.use-case';"
  );
}

// 2. Add instantiation in bootstrap
if (!content.includes("const runnerDashboardUseCase = new RunnerDashboardUseCase(dataStore);")) {
  content = content.replace(
    "const adminUseCase = new AdminManagementUseCase(dataStore);",
    "const adminUseCase = new AdminManagementUseCase(dataStore);\n  const runnerDashboardUseCase = new RunnerDashboardUseCase(dataStore);"
  );
}

// 3. Add API routes in handleApiRequest
const routesToInsert = `    // [1.1] Strava Status
    if (req.method === 'GET' && pathname === '/api/me/strava-status') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(runnerDashboardUseCase.getStravaStatus('user-01')));
      return true;
    }

    // [1.1] Strava Manual Sync
    if (req.method === 'POST' && pathname === '/api/me/strava-sync') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(runnerDashboardUseCase.syncStravaActivities('user-01')));
      return true;
    }

    // [1.2] Weekly Progress
    if (req.method === 'GET' && pathname === '/api/me/weekly-progress') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(runnerDashboardUseCase.getWeeklyProgress('user-01')));
      return true;
    }

    // [1.3] Penalty Warning
    if (req.method === 'GET' && pathname === '/api/me/penalty-warning') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(runnerDashboardUseCase.getPenaltyWarning('user-01')));
      return true;
    }

    // [1.4] Enrolled Races
    if (req.method === 'GET' && pathname === '/api/me/races') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(runnerDashboardUseCase.getEnrolledRaces('user-01')));
      return true;
    }

    // [1.5] Join Race by Invite Code or QR
    if (req.method === 'POST' && pathname === '/api/races/join-by-code') {
      let body = '';
      req.on('data', (chunk) => { body += chunk; });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body || '{}');
          const result = runnerDashboardUseCase.joinRaceByCode('user-01', payload.code || '');
          res.writeHead(result.success ? 200 : 400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify(result));
        } catch (err: any) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: false, message: err.message }));
        }
      });
      return true;
    }
`;

if (!content.includes("/api/me/strava-status")) {
  content = content.replace(
    "if (req.method === 'GET' && pathname === '/api/appeals') {",
    routesToInsert + "\n    if (req.method === 'GET' && pathname === '/api/appeals') {"
  );
}

fs.writeFileSync(mainPath, content, 'utf8');
console.log('Successfully updated backend routes for Subsystem 1 in main.ts');

