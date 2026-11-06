const fs = require('fs');

const content = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');
const lines = content.split('\n');
const idx = lines.findIndex(l => l.includes('function selectJoinTeam'));
console.log('selectJoinTeam at line:', idx + 1);
for (let i = idx; i < idx + 25; i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}

