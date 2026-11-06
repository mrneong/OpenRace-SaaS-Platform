const fs = require('fs');

const tabArena = fs.readFileSync('scratch/screens/tab-arena.html', 'utf8');
const idx = tabArena.indexOf('id="section-2-3"');
console.log(tabArena.substring(idx + 2400, idx + 4000));

