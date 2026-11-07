const fs = require('fs');

const mainCode = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');

const matches = [];
const lines = mainCode.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('mantis-active-nav') || line.includes('mantis-nav-item')) {
    matches.push(`${idx + 1}: ${line}`);
  }
});

console.log('Mantis nav active matches in main.ts:');
console.log(matches.slice(0, 30).join('\n'));
