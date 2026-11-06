const fs = require('fs');

const mainTs = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');
const matches = [];
let pos = 0;
while (true) {
  const idx = mainTs.indexOf('renderIndividualRunners', pos);
  if (idx === -1) break;
  matches.push(mainTs.substring(idx - 30, idx + 50));
  pos = idx + 25;
}
console.log('Matches for renderIndividualRunners:', matches);

