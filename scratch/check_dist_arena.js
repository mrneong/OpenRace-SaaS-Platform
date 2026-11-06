const fs = require('fs');

const dist = fs.readFileSync('workspace/backend/dist/main.js', 'utf8');
const idx = dist.indexOf('arena-ind-view');
console.log('arena-ind-view in dist at:', idx);
if (idx !== -1) {
  console.log(dist.substring(idx, idx + 1500));
}

