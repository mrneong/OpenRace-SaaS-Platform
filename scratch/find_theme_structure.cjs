const fs = require('fs');

const mainCode = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');

const matches = [];
const lines = mainCode.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('setAppTheme') || line.includes('mantis-sidebar') || line.includes('slim-rail') || line.includes('openrace-header') || line.includes('mantis-header')) {
    matches.push(`${idx + 1}: ${line}`);
  }
});

console.log('Matches in main.ts:');
console.log(matches.slice(0, 50).join('\n'));
