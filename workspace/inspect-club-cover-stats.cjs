const fs = require('fs');
const content = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');

const s41 = content.indexOf('id="section-4-1"');
const coverIdx = content.indexOf('id="club-stat-members"', s41);
console.log(content.slice(coverIdx - 400, coverIdx + 600));

