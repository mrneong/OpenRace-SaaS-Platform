const http = require('http');

http.get('http://127.0.0.1:9222/json', (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('CDP targets:', JSON.parse(body));
  });
}).on('error', (err) => {
  console.log('Chrome CDP not active:', err.message);
});

