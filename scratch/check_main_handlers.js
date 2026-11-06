const fs = require('fs');

const mainTs = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');
const idx = mainTs.indexOf('if (sectionId === \'section-2-2\')');
console.log(mainTs.substring(idx, idx + 1000));

