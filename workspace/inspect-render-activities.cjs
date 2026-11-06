const fs = require('fs');
const code = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');

const idx = code.indexOf('function renderActivities');
console.log(code.slice(idx, idx + 500));

