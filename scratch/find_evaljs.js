const fs = require('fs');
const content = fs.readFileSync('workspace/test-e2e-all.cjs', 'utf8');

const regex = /evalJs\([`'"]([\s\S]*?)[`'"]\)/g;
let match;
let count = 0;
while ((match = regex.exec(content)) !== null) {
  count++;
  const js = match[1].trim();
  if (js.includes('querySelector') || js.includes('switchTab') || js.includes('goToScreen') || js.includes('goToSection')) {
    console.log(`[${count}] ${js.replace(/\n/g, ' ').substring(0, 120)}`);
  }
}

