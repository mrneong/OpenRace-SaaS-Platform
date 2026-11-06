const fs = require('fs');
const content = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');

const s22 = content.indexOf('id="section-2-2"');
const s23 = content.indexOf('id="section-2-3"');
const s24 = content.indexOf('id="section-2-4"');
const s25 = content.indexOf('id="section-2-5"');

console.log('--- section 2.2 start ---');
console.log(content.slice(s22, s22 + 800));

console.log('--- section 2.3 start ---');
console.log(content.slice(s23, s23 + 800));

console.log('--- section 2.4 start ---');
console.log(content.slice(s24, s24 + 800));

