const fs = require('fs');

const mainTs = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');
const idx = mainTs.indexOf('function renderAdminMemberList');
console.log('function renderAdminMemberList at:', idx);
if (idx !== -1) {
  console.log(mainTs.substring(idx, idx + 800));
}

