const fs = require('fs');
const content = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');

const modalIdx = content.indexOf('id="modal-edit-club-profile"');
console.log('--- modal-edit-club-profile ---');
console.log(content.slice(modalIdx, modalIdx + 1500));

