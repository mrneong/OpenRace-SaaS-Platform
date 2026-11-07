const fs = require('fs');

const storeCode = fs.readFileSync('workspace/backend/src/infrastructure/repositories/in-memory-data.store.ts', 'utf8');

const stravaMatches = [];
const lines = storeCode.split('\n');
lines.forEach((line, idx) => {
  if (line.toLowerCase().includes('strava')) {
    stravaMatches.push(`${idx + 1}: ${line}`);
  }
});

console.log('Strava matches in store (30-60):');
console.log(stravaMatches.slice(30, 60).join('\n'));
