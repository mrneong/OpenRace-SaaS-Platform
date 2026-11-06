const fs = require('fs');
const content = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');

const idx = content.indexOf('function openEditClubProfileModal');
console.log(content.slice(idx, idx + 1600));

