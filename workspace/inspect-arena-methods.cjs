const fs = require('fs');
const content = fs.readFileSync('workspace/backend/src/application/use-cases/race-arena.use-case.ts', 'utf8');

const idx = content.indexOf('getRaceHero(');
console.log(content.slice(idx - 100, idx + 1200));

