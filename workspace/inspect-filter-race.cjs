const fs = require('fs');
const code = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');

const idx = code.indexOf('function filterByRace');
console.log(code.slice(idx - 50, idx + 200));

