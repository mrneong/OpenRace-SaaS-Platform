const fs = require('fs');

const mainCode = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');

const matches = [];
const lines = mainCode.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('[1.B]') || line.includes('strava-sync') || line.includes('strava-webhook-table')) {
    matches.push(`${idx + 1}: ${line}`);
  }
});

console.log('Matches in main.ts:');
console.log(matches.slice(0, 40).join('\n'));
