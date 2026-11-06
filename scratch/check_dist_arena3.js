const fs = require('fs');

const dist = fs.readFileSync('workspace/backend/dist/main.js', 'utf8');
const idx1 = dist.indexOf('id="arena-ind-view"');
const idx2 = dist.indexOf('id="arena-myteam-view"');
console.log(dist.substring(idx1, idx2));

