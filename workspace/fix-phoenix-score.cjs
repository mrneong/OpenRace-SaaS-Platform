const fs = require('fs');
let code = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');

code = code.replace(
  `{ teamId: 'team-phoenix', name: 'Team Phoenix SARC', rank: 1, rankLabel: 'Hạng 1 (Vô Địch Dẫn Đầu)', badge: 'gold', totalKm: 1250.0, days: 118, score: 92.1, fund: '100.000đ/người (Quỹ Vô Địch)'`,
  `{ teamId: 'team-phoenix', name: 'Team Phoenix SARC', rank: 1, rankLabel: 'Hạng 1 (Vô Địch Dẫn Đầu)', badge: 'gold', totalKm: 1250.0, days: 118, score: 18.43, fund: '100.000đ/người (Quỹ Vô Địch)'`
);

fs.writeFileSync('workspace/backend/src/main.ts', code, 'utf8');
console.log('Updated Phoenix score to 18.43 in main.ts!');

