const fs = require('fs');
const content = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');
const lines = content.split('\n');
lines.forEach((l, i) => {
  if (l.includes('<div id="tab-') || l.includes('<!-- TAB 5:')) {
    console.log((i+1) + ': ' + l.trim());
  }
});

