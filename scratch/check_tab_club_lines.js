const fs = require('fs');

const tabClub = fs.readFileSync('scratch/screens/tab-club.html', 'utf8');
const lines = tabClub.split('\n');
const idx = lines.findIndex(l => l.includes('selected-team-name-label'));
for (let i = Math.max(0, idx - 5); i < Math.min(lines.length, idx + 10); i++) {
  console.log(`${i+1}: ${lines[i]}`);
}

