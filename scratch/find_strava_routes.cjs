const fs = require('fs');

const mainCode = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');

const matches = [];
const lines = mainCode.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('/api/me/strava') || line.includes('/api/v1/me/strava')) {
    matches.push(`${idx + 1}: ${line}`);
  }
});

console.log('Matches in main.ts:');
console.log(matches.join('\n'));

