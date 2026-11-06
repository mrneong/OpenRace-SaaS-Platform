const fs = require('fs');
const html = fs.readFileSync('scratch/tab-club.html', 'utf8');
const lines = html.split('\n');
lines.forEach((l, i) => {
  if (l.includes('id="section-') || l.includes('id="club-') || l.includes('btn-copy-onboard') || l.includes('join-team-feedback')) {
    console.log(`${i}: ${l.trim()}`);
  }
});

