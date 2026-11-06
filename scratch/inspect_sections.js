const fs = require('fs');

const content = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');
const lines = content.split('\n');

console.log('Total lines:', lines.length);

const tabMatches = [];
const sectionMatches = [];

lines.forEach((line, index) => {
  if (line.includes('id="tab-')) {
    tabMatches.push({ line: index + 1, text: line.trim() });
  }
  if (line.includes('id="section-')) {
    sectionMatches.push({ line: index + 1, text: line.trim() });
  }
});

console.log('\n--- TABS ---');
tabMatches.forEach(t => console.log(`${t.line}: ${t.text}`));

console.log('\n--- SECTIONS ---');
sectionMatches.forEach(s => console.log(`${s.line}: ${s.text}`));

