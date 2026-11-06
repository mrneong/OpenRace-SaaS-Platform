const fs = require('fs');

const dist = fs.readFileSync('workspace/backend/dist/main.js', 'utf8');
const idx = dist.indexOf('function getFrontendHtml()');
console.log('dist has getFrontendHtml at:', idx);
if (idx !== -1) {
  console.log(dist.substring(idx, idx + 200));
}

