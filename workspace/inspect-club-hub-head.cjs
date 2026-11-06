const fs = require('fs');
const content = fs.readFileSync('workspace/backend/src/application/use-cases/club-hub.use-case.ts', 'utf8');

console.log(content.slice(0, 1200));

