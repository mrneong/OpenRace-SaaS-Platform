const fs = require('fs');
const html = fs.readFileSync('scratch/tab-arena.html', 'utf8');

console.log('--- ARENA OUTLINE ---');
const regex = /(id="[^"]+"|<h[1-6][^>]*>.*?<\/h[1-6]>|<!--.*?-->)/g;
let m;
while ((m = regex.exec(html)) !== null) {
  if (m[1].startsWith('id="') || m[1].startsWith('<h') || m[1].startsWith('<!-- [')) {
    console.log(m[1].substring(0, 100));
  }
}

