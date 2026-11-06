const fs = require('fs');
const content = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');

function inspectTab(tabId, nextTabId) {
  const start = content.indexOf(`id="${tabId}"`);
  const end = content.indexOf(nextTabId);
  const html = content.substring(start, end);
  console.log(`\n=== ${tabId} === (length: ${html.length})`);
  const lines = html.split('\n');
  lines.forEach((l, i) => {
    if (l.includes('id="section-')) {
      console.log(`Line ${i}: ${l.trim()}`);
    }
  });
}

inspectTab('tab-club', 'id="tab-finance"');
inspectTab('tab-finance', 'id="tab-club-manage"');
inspectTab('tab-club-manage', 'id="tab-rules"');
inspectTab('tab-rules', 'id="tab-admin"');
inspectTab('tab-admin', '<!-- [1.5] Floating Action Button');

