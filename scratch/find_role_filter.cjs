const fs = require('fs');

const mainCode = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');

const matches = [];
const lines = mainCode.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('switchRolePortal') || line.includes('mantis-group') || line.includes('filterMantisSidebar') || line.includes('active_role')) {
    matches.push(`${idx + 1}: ${line}`);
  }
});

console.log('Role matches in main.ts:');
console.log(matches.slice(0, 40).join('\n'));

