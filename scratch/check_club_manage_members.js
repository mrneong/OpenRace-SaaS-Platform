const fs = require('fs');

const tabClubManage = fs.readFileSync('scratch/screens/tab-club-manage.html', 'utf8');
console.log('has admin-members-tbody in tabClubManage:', tabClubManage.includes('admin-members-tbody'));

const mainTs = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');
const idx = mainTs.indexOf('renderAdminMemberList');
console.log('renderAdminMemberList at:', idx);
if (idx !== -1) {
  console.log(mainTs.substring(idx, idx + 800));
}

