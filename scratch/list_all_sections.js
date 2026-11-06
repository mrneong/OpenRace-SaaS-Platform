const fs = require('fs');
const content = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');

const regex = /<div id="(section-[^"]+)"/g;
let match;
while ((match = regex.exec(content)) !== null) {
  const start = match.index;
  const lineNo = content.substring(0, start).split('\n').length;
  console.log(`Line ${lineNo}: id="${match[1]}"`);
}

