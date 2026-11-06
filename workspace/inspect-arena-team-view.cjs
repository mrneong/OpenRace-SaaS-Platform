const fs = require('fs');
const content = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');

const s22 = content.indexOf('id="arena-team-view"');
console.log(content.slice(s22, s22 + 1000));

