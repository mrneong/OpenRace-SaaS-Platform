const fs = require('fs');
const content = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');

const idx = content.indexOf('arenaRunnersData');
console.log(content.slice(idx - 100, idx + 1500));

