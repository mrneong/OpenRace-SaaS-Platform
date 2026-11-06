const fs = require('fs');
const content = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');

const tabs = [
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
  const nextTab = index < tabs.length - 1 ? `id="${tabs[index+1]}"` : '<!-- [1.5] Floating Action Button';
  const end = content.indexOf(nextTab);
  const html = content.substring(start, end);
  fs.writeFileSync(`scratch/${tab}.html`, html, 'utf8');
  console.log(`Saved scratch/${tab}.html (${html.length} bytes)`);
});

