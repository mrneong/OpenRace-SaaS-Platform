const fs = require('fs');

const mainCode = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');

const lines = mainCode.split('\n');
console.log('Lines 110-140:');
console.log(lines.slice(110, 140).join('\n'));

console.log('Lines 740-760:');
console.log(lines.slice(740, 760).join('\n'));

