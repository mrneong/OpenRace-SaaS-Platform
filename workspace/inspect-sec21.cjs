const fs = require('fs');
const content = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');

const s21Start = content.indexOf('id="section-2-1"');
const s22Start = content.indexOf('id="section-2-2"');
console.log('section-2-1 content:');
console.log(content.slice(s21Start, s22Start));

