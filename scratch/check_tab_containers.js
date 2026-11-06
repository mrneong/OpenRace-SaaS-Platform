const fs = require('fs');
const content = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');

const tabs = ['tab-arena', 'tab-activities', 'tab-club', 'tab-finance', 'tab-club-manage', 'tab-rules', 'tab-admin'];

tabs.forEach(tab => {
  const start = content.indexOf(`id="${tab}"`);
  if (start !== -1) {
    console.log(`=== ${tab} ===`);
    console.log(content.substring(start, start + 300));
  }
});

