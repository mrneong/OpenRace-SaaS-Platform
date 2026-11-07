const fs = require('fs');
const s = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');
console.log('cert-athlete-name:', s.includes('id="cert-athlete-name"'));
console.log('cert-race-title:', s.includes('id="cert-race-title"'));
console.log('cert-display-id:', s.includes('id="cert-display-id"'));
console.log('cert-distance:', s.includes('id="cert-distance"'));
