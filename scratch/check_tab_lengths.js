const fs = require('fs');
const content = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');

const tabs = [
  'tab-dashboard',
  'tab-arena',
  'tab-activities',
  'tab-club',
  'tab-finance',
  'tab-club-manage',
  'tab-rules',
  'tab-admin'
];

tabs.forEach((tab, index) => {
  const start = content.indexOf(`id="${tab}"`);
  const end = index < tabs.length - 1 ? content.indexOf(`id="${tabs[index+1]}"`) : content.indexOf('<!-- [1.5] Floating Action Button');
  console.log(`Tab ${tab}: length ${end - start} characters`);
});

