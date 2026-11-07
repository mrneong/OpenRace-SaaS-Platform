const http = require('http');

http.get('http://localhost:3000', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const regex = /id=["'](wz-[^"']+)["']/g;
    let match;
    const ids = [];
    while ((match = regex.exec(data)) !== null) {
      ids.push(match[1]);
    }
    console.log('WZ Scoring & Factor IDs:', ids.filter(id => id.includes('scoring') || id.includes('factor')));
  });
});
