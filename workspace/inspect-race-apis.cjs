const fs = require('fs');
const content = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');

const regex = /\/api\/races\/[^\s'"`]+/g;
let match;
const matches = new Set();
while ((match = regex.exec(content)) !== null) {
  matches.add(match[0]);
}
console.log('API routes matching /api/races/:', Array.from(matches));

