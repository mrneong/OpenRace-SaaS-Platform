const fs = require('fs');
const content = fs.readFileSync('workspace/backend/src/application/use-cases/club-hub.use-case.ts', 'utf8');

const idx = content.indexOf('updateClubProfile(');
console.log(content.slice(idx - 100, idx + 800));

