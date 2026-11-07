const fs = require('fs');

const code = fs.readFileSync('workspace/backend/src/application/use-cases/runner-dashboard.use-case.ts', 'utf8');

const lines = code.split('\n');
lines.forEach((line, idx) => {
  if (line.toLowerCase().includes('strava')) {
    console.log(`${idx + 1}: ${line}`);
  }
});

