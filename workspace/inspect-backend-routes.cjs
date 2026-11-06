const fs = require('fs');
const content = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');

const idx = content.indexOf("raceArenaUseCase.getRaceHero(slug)");
console.log('Backend race route at:', idx);
console.log(content.slice(idx - 200, idx + 400));

