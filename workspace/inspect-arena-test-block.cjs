const fs = require('fs');
const content = fs.readFileSync('workspace/test-e2e-all.cjs', 'utf8');

const start = content.indexOf('Testing [2.0] Race Arena');
const end = content.indexOf('Testing [3.0] Activity Feed');
console.log(content.slice(start, end));

