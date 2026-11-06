const fs = require('fs');

const content = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');

// Where does getFrontendHtml start?
const startIdx = content.indexOf('function getFrontendHtml()');
console.log('getFrontendHtml at index:', startIdx);

// Look for backticks in getFrontendHtml
const afterStart = content.substring(startIdx);
const backticks = [];
let pos = 0;
while (true) {
  const next = afterStart.indexOf('`', pos);
  if (next === -1) break;
  // check if escaped
  let count = 0;
  let p = next - 1;
  while (p >= 0 && afterStart[p] === '\\') {
    count++;
    p--;
  }
  const isEscaped = (count % 2 === 1);
  backticks.push({ pos: next, isEscaped });
  pos = next + 1;
}

console.log('Total backticks found after getFrontendHtml():', backticks.length);
console.log('Unescaped backticks count:', backticks.filter(b => !b.isEscaped).length);
backticks.filter(b => !b.isEscaped).forEach((b, i) => {
  const lineNo = content.substring(0, startIdx + b.pos).split('\n').length;
  console.log(`Unescaped backtick #${i + 1} at line ${lineNo}`);
});

