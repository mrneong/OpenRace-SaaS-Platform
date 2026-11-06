const fs = require('fs');
const content = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');

const start = content.indexOf('id="tab-arena"');
const end = content.indexOf('id="tab-activities"');
const arenaHtml = content.substring(start, end);

console.log('Total arena HTML length:', arenaHtml.length);

const lines = arenaHtml.split('\n');
console.log('Total lines:', lines.length);

lines.forEach((l, i) => {
  if (l.includes('id="section-') || l.includes('id="arena-') || l.includes('toggleArenaTab')) {
    console.log(`Line ${i}: ${l.trim()}`);
  }
});

