const fs = require('fs');
const content = fs.readFileSync('workspace/test-e2e-all.cjs', 'utf8');

const regex = /getElementById\(['"]([^'"]+)['"]\)/g;
let match;
const ids = new Set();
while ((match = regex.exec(content)) !== null) {
  ids.add(match[1]);
}

console.log('Total unique IDs searched in E2E tests:', ids.size);
console.log(Array.from(ids).sort().join('\n'));

