const fs = require('fs');
const content = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');

const idx = content.indexOf('id="tab-arena"');
console.log('--- tab-arena start ---');
console.log(content.slice(idx, idx + 2000));

const sec21 = content.indexOf('id="section-2-1"');
console.log('--- section-2-1 start ---');
console.log(content.slice(sec21, sec21 + 1000));

