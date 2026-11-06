const fs = require('fs');

const dist = fs.readFileSync('workspace/backend/dist/main.js', 'utf8');
const idx = dist.indexOf('arena-ind-view');
console.log(dist.substring(idx + 1000, idx + 2500));

