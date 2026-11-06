const fs = require('fs');
const content = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');

const tlb = content.indexOf('id="team-leaderboard"');
console.log('--- team-leaderboard ---');
console.log(content.slice(tlb, tlb + 1200));

const irl = content.indexOf('id="individual-runners-list"');
console.log('--- individual-runners-list ---');
console.log(content.slice(irl, irl + 1200));

