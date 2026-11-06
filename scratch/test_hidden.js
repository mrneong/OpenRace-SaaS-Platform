const http = require('http');

async function testHiddenInnerText() {
  const res = await fetch('http://localhost:3000');
  console.log('Frontend reachable:', res.status);
}

testHiddenInnerText();

