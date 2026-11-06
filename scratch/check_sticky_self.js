const fs = require('fs');

const tabArena = fs.readFileSync('scratch/screens/tab-arena.html', 'utf8');
const idx = tabArena.indexOf('arena-sticky-self');
console.log('arena-sticky-self in tabArena at:', idx);
const indIdx = tabArena.indexOf('id="arena-ind-view"');
console.log('id="arena-ind-view" in tabArena at:', indIdx);
const indEnd = tabArena.indexOf('</div>', indIdx);
// Let's see which section contains arena-sticky-self
if (idx !== -1) {
  const beforeSticky = tabArena.substring(0, idx);
  const lastSection = beforeSticky.lastIndexOf('id="section-');
  console.log('arena-sticky-self is inside section:', tabArena.substring(lastSection, lastSection + 25));
}

