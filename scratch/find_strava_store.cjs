const fs = require('fs');

const storeCode = fs.readFileSync('workspace/backend/src/infrastructure/repositories/in-memory-data.store.ts', 'utf8');

const stravaMatches = [];
const lines = storeCode.split('\n');
lines.forEach((line, idx) => {
  if (line.toLowerCase().includes('strava')) {
    stravaMatches.push(`${idx + 1}: ${line}`);
  }
});

console.log('Strava matches in in-memory-data.store.ts:');
console.log(stravaMatches.slice(0, 30).join('\n'));
