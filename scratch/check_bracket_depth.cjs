const fs = require('fs');

const main = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');
const lines = main.split('\n');

const scriptTagLine = lines.findIndex(l => l.includes('<script>')) + 1;
const scriptEndLine = lines.findIndex(l => l.includes('</script>')) + 1;

console.log('<script> starts at line:', scriptTagLine);
console.log('</script> ends at line:', scriptEndLine);
console.log('setAppTheme is at line: 21665');

// Let's check bracket depth from scriptTagLine to 21665
let depth = 0;
for (let i = scriptTagLine - 1; i < 21665; i++) {
  const line = lines[i];
  for (let j = 0; j < line.length; j++) {
    if (line[j] === '{') depth++;
    if (line[j] === '}') depth--;
  }
}
console.log('Bracket depth at line 21665:', depth);

