const fs = require('fs');

async function main() {
  const res = await fetch('http://localhost:3000/');
  const html = await res.text();
  console.log('Includes tiebreak-info-modal:', html.includes('id="tiebreak-info-modal"'));
  console.log('Includes arena-ind-view:', html.includes('id="arena-ind-view"'));
  console.log('Includes Áo SARC:', html.includes('Áo SARC'));

  const idx = html.indexOf('id="arena-ind-view"');
  if (idx !== -1) {
    console.log('Snippet of arena-ind-view:\n', html.substring(idx, idx + 600));
  }
}

main();

