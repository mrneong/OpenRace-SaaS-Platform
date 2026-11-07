const fs = require('fs');

const main = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');
const lines = main.split('\n');
const scriptTagLine = lines.findIndex(l => l.includes('<script>')) + 1;

let depth = 0;
let lastZeroLine = scriptTagLine;
for (let i = scriptTagLine - 1; i < 21665; i++) {
  const line = lines[i];
  if (depth === 0) lastZeroLine = i + 1;
  for (let j = 0; j < line.length; j++) {
    if (line[j] === '{') depth++;
    if (line[j] === '}') depth--;
  }
}
console.log('Last line at depth 0 before 21665 was line:', lastZeroLine);
console.log(lines.slice(lastZeroLine - 5, lastZeroLine + 10).join('\n'));

