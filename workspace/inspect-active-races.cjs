const fs = require('fs');
const content = fs.readFileSync('workspace/backend/src/application/use-cases/runner-dashboard.use-case.ts', 'utf8');

const idx = content.indexOf('getActiveRaces');
console.log(content.slice(idx, idx + 1000));

