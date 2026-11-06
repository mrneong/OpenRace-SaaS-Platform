const fs = require('fs');

const content = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');
const lines = content.split('\n');

console.log('Total lines:', lines.length);

const arenaLine = lines.findIndex(l => l.includes('<div id="tab-arena"'));
const fabLine = lines.findIndex(l => l.includes('<!-- [1.5] Floating Action Button'));
console.log('tab-arena line:', arenaLine + 1);
console.log('fab line:', fabLine + 1);

// Look for any line between arenaLine and fabLine that has `; or `
for (let i = arenaLine; i <= fabLine; i++) {
  if (lines[i].includes('`;') || lines[i].includes('`')) {
    console.log(`Line ${i + 1}: ${lines[i]}`);
  }
}

