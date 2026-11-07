const fs = require('fs');
const s = fs.readFileSync('workspace/test-saas-v3-e2e.cjs', 'utf8');
const lines = s.split('\n');
lines.forEach((l, i) => {
  if (l.includes('mantis-sidebar') || l.includes('setAppTheme')) {
    console.log(`${i+1}: ${l}`);
  }
});
