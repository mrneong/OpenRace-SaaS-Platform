const fs = require('fs');
const content = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');

const start = content.indexOf('id="tab-activities"');
const end = content.indexOf('id="tab-club"');
const activitiesHtml = content.substring(start, end);

console.log('Total activities HTML length:', activitiesHtml.length);

const lines = activitiesHtml.split('\n');
console.log('Total lines:', lines.length);

lines.forEach((l, i) => {
  if (l.includes('id="section-') || l.includes('id="filter-') || l.includes('openAppealDrawer') || l.includes('sim-')) {
    console.log(`Line ${i}: ${l.trim()}`);
  }
});

