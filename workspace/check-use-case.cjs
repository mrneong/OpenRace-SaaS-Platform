const fs = require('fs');
const content = fs.readFileSync('workspace/backend/src/application/use-cases/race-arena.use-case.ts', 'utf8');

console.log('Total length of race-arena.use-case.ts:', content.length);
console.log('Lines count:', content.split('\n').length);

