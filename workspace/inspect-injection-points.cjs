const fs = require('fs');
const content = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');

console.log('Searching injection points in main.ts:');
console.log('1. getRaceHero match:', content.indexOf('/api/races/'));
console.log('2. section-2-1 start:', content.indexOf('id="section-2-1"'));
console.log('3. modal anchor:', content.indexOf('<!-- ADD MANUAL ACTIVITY MODAL -->'));
console.log('4. changeArenaRace function:', content.indexOf('function changeArenaRace'));
console.log('5. DOMContentLoaded:', content.indexOf('window.addEventListener(\'DOMContentLoaded\', () => {'));

