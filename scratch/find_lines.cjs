const fs = require('fs');
const content = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');
const lines = content.split('\n');
lines.forEach((l, i) => {
  if (l.includes('confirmStravaAuthorization')) {
    console.log('confirmStravaAuthorization at line:', i + 1);
    for (let j = Math.max(0, i - 5); j < Math.min(lines.length, i + 60); j++) {
      console.log((j + 1) + ': ' + lines[j]);
    }
  }
});

