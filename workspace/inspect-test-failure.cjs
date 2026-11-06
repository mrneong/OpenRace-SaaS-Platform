const fs = require('fs');
const content = fs.readFileSync('workspace/test-e2e-all.cjs', 'utf8');

const idx = content.indexOf('18.43');
console.log('18.43 in test-e2e-all.cjs:');
console.log(content.slice(idx - 100, idx + 200));

