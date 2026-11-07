const fs = require('fs');

const main = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');
const lines = main.split('\n');

lines.forEach((line, idx) => {
  if (line.includes('function setAppTheme')) {
    console.log(`Line ${idx + 1}: ${line}`);
    console.log(lines.slice(Math.max(0, idx - 10), idx + 20).join('\n'));
  }
});
