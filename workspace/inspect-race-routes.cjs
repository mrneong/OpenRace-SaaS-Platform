const fs = require('fs');
const content = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');

console.log(content.slice(358350, 359000));

