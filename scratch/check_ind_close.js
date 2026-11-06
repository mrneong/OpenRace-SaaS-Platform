const fs = require('fs');

const tabArena = fs.readFileSync('scratch/screens/tab-arena.html', 'utf8');
const indIdx = tabArena.indexOf('id="arena-ind-view"');
const stickyIdx = tabArena.indexOf('id="arena-sticky-self"');
console.log('arena-ind-view idx:', indIdx);
console.log('arena-sticky-self idx:', stickyIdx);
console.log(tabArena.substring(indIdx + 3000, stickyIdx + 200));

