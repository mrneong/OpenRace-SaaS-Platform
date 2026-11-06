const fs = require('fs');

const tabArena = fs.readFileSync('scratch/screens/tab-arena.html', 'utf8').trim();
const tabActivities = fs.readFileSync('scratch/screens/tab-activities.html', 'utf8').trim();
const tabClub = fs.readFileSync('scratch/screens/tab-club.html', 'utf8').trim();
const tabFinance = fs.readFileSync('scratch/screens/tab-finance.html', 'utf8').trim();
const tabClubManage = fs.readFileSync('scratch/screens/tab-club-manage.html', 'utf8').trim();
const tabRules = fs.readFileSync('scratch/screens/tab-rules.html', 'utf8').trim();
const tabAdmin = fs.readFileSync('scratch/screens/tab-admin.html', 'utf8').trim();

const mainFile = 'workspace/backend/src/main.ts';
let content = fs.readFileSync(mainFile, 'utf8');

const arenaStart = content.indexOf('<div id="tab-arena"');
const fabStart = content.indexOf('<!-- [1.5] Floating Action Button');

if (arenaStart === -1 || fabStart === -1) {
  console.error('Markers not found!');
  process.exit(1);
}

const allNewTabs = [
  tabArena,
  tabActivities,
  tabClub,
  tabFinance,
  tabClubManage,
  tabRules,
  tabAdmin
].join('\n\n');

content = content.substring(0, arenaStart) + allNewTabs + '\n\n      ' + content.substring(fabStart);

fs.writeFileSync(mainFile, content, 'utf8');
console.log('Updated main.ts with cleaned tabs. Total lines:', content.split('\n').length);

