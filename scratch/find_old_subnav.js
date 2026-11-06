const fs = require('fs');

const mainTs = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');
const lines = mainTs.split('\n');
lines.forEach((l, idx) => {
  if (l.includes('Wizard 7 bước')) {
    console.log(`Line ${idx + 1}: ${l}`);
  }
});

