const fs = require('fs');
let code = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');

// Replace in Arena section only
const arenaSectionAnchor = `MULTI-RACE ARENA CLIENT ENGINE`;
const endArenaAnchor = `// Subsystem 5, 6, 7, 8 Client Scripts`;

const startIdx = code.indexOf(arenaSectionAnchor);
const endIdx = code.indexOf(endArenaAnchor);

if (startIdx === -1 || endIdx === -1) {
  console.error('Cannot find arena section bounds');
  process.exit(1);
}

let arenaCode = code.slice(startIdx, endIdx);
arenaCode = arenaCode.replace(/currentRaceFilter/g, 'arenaRaceHubFilter');

code = code.slice(0, startIdx) + arenaCode + code.slice(endIdx);
fs.writeFileSync('workspace/backend/src/main.ts', code, 'utf8');
console.log('Replaced currentRaceFilter with arenaRaceHubFilter in Arena section!');

