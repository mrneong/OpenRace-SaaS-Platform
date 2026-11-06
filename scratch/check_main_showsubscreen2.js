const fs = require('fs');

const mainTs = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');
const idx = mainTs.indexOf('function showSubScreen');
console.log(mainTs.substring(idx + 1200, idx + 2600));

