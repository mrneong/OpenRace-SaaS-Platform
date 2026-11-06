const fs = require('fs');

const tabClubManage = fs.readFileSync('scratch/screens/tab-club-manage.html', 'utf8');
const lines = tabClubManage.split('\n');
const idx = lines.findIndex(l => l.includes('admin-role-filter'));
console.log('admin-role-filter at line:', idx + 1);
if (idx !== -1) {
  for (let i = idx; i < idx + 15; i++) {
    console.log(`${i+1}: ${lines[i]}`);
  }
}

