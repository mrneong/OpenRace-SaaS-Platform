const fs = require('fs');
const content = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');

function inspectTab(tabId, startLineOffset, maxLines) {
  const idx = content.indexOf(`id="${tabId}"`);
  if (idx === -1) return `Not found: ${tabId}`;
  const linesBefore = content.substring(0, idx).split('\n').length;
  const lines = content.split('\n');
  return `Tab ${tabId} starts at line ${linesBefore}:\n` +
    lines.slice(linesBefore - 1, linesBefore + maxLines).join('\n');
}

console.log('=== TAB ARENA ===');
console.log(inspectTab('tab-arena', 0, 40));

console.log('=== TAB ACTIVITIES ===');
console.log(inspectTab('tab-activities', 0, 40));

