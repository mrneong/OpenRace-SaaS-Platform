const fs = require('fs');
const content = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');

const tabs = ['tab-club', 'tab-finance', 'tab-club-manage', 'tab-rules', 'tab-admin'];

tabs.forEach(tab => {
  console.log(`\n=================== ${tab} ===================`);
  const idx = content.indexOf(`id="${tab}"`);
  const sub = content.substring(idx, idx + 2000);
  const sections = [];
  const lines = sub.split('\n');
  lines.forEach((l, i) => {
    if (l.includes('id="section-')) {
      sections.push({ line: i, text: l.trim() });
    }
  });
  console.log('Sections found:', sections);
});

