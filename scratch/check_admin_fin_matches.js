const fs = require('fs');

const dist = fs.readFileSync('workspace/backend/dist/main.js', 'utf8');
const matches = [];
let pos = 0;
while (true) {
  const idx = dist.indexOf('admin-finance-container', pos);
  if (idx === -1) break;
  matches.push(idx);
  pos = idx + 20;
}
console.log('Matches for admin-finance-container in dist:', matches);

