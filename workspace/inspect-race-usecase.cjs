const fs = require('fs');
const content = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');

let idx = 0;
while ((idx = content.indexOf('raceArenaUseCase', idx)) !== -1) {
  console.log('raceArenaUseCase at', idx);
  console.log(content.slice(idx - 50, idx + 150));
  idx += 20;
}

