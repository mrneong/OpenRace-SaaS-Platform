const fs = require('fs');
const code = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');

const idx = code.indexOf('function renderArenaRaceCards');
console.log(code.slice(idx + 1800, idx + 2800));

