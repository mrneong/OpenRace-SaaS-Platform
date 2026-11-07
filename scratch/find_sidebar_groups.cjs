const fs = require('fs');

const mainCode = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');

const matches = [];
const lines = mainCode.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('group-sidebar-') || line.includes('PHÂN HỆ:')) {
    matches.push(`${idx + 1}: ${line}`);
  }
});

console.log('Sidebar groups in main.ts:');
console.log(matches.join('\n'));
