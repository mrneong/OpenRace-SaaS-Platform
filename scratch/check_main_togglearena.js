const fs = require('fs');

const mainTs = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');
const idx = mainTs.indexOf('function toggleArenaTab');
console.log(mainTs.substring(idx, idx + 400));

