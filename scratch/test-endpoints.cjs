const http = require('http');

function fetch(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

async function main() {
  const r1 = await fetch('http://localhost:3000/api/races/race-season-9/hall-of-fame');
  console.log('M9 HoF status:', r1.status);
  const d1 = JSON.parse(r1.body);
  console.log('M9 Sig:', d1.ledgerSignature, '| Title:', d1.raceName, '| Recipients:', d1.recipients.length);

  const r2 = await fetch('http://localhost:3000/api/races/race-spring-2026/hall-of-fame');
  console.log('Spring HoF status:', r2.status);
  const d2 = JSON.parse(r2.body);
  console.log('Spring Sig:', d2.ledgerSignature, '| Title:', d2.raceName, '| Recipients:', d2.recipients.length);

  const r3 = await fetch('http://localhost:3000/api/races/race-season-9/download-report');
  console.log('Download report status:', r3.status);
  console.log('Content-Type:', r3.headers['content-type']);
  console.log('Content-Disposition:', r3.headers['content-disposition']);
  console.log('Has UTF-8 BOM:', r3.body.charCodeAt(0) === 0xFEFF);
  console.log('First 200 chars:\n', r3.body.slice(0, 200));
}

main().catch(console.error);

