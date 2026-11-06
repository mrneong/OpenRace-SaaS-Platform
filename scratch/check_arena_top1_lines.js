const fs = require('fs');

const tabArena = fs.readFileSync('scratch/screens/tab-arena.html', 'utf8');
const lines = tabArena.split('\n');
const idx = lines.findIndex(l => l.includes('TOP 1 CÁ NHÂN:'));
for (let i = Math.max(0, idx - 5); i < Math.min(lines.length, idx + 15); i++) {
  console.log(`${i+1}: ${lines[i]}`);
}

