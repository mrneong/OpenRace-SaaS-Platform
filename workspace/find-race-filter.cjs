const fs = require('fs');
const code = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');

let idx = 0;
while ((idx = code.indexOf('currentRaceFilter', idx)) !== -1) {
  console.log('currentRaceFilter at', idx);
  console.log(code.slice(idx - 30, idx + 80));
  idx += 17;
}

