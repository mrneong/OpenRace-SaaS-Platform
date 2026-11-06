const fs = require('fs');

const dist = fs.readFileSync('workspace/backend/dist/main.js', 'utf8');
const idx = dist.indexOf('function switchTab(');
console.log(dist.substring(idx, idx + 600));

