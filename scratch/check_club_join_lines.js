const fs = require('fs');

const tabClub = fs.readFileSync('scratch/screens/tab-club.html', 'utf8');
const lines = tabClub.split('\n');
const idx = lines.findIndex(l => l.includes('selectJoinTeam'));
for (let i = Math.max(0, idx - 10); i < Math.min(lines.length, idx + 25); i++) {
  console.log(`${i+1}: ${lines[i]}`);
}

