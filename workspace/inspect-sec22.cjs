const fs = require('fs');
const content = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');

const s22 = content.indexOf('id="section-2-2"');
console.log(content.slice(s22, s22 + 2500));

