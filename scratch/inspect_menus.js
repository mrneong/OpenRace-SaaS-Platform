const fs = require('fs');
const content = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');

// Look for goToScreen, goToSection, or top menu tree
const lines = content.split('\n');
lines.forEach((line, i) => {
  if (line.includes('goToScreen') || line.includes('goToSection') || line.includes('function goTo') || line.includes('nav-tree')) {
    console.log(`${i+1}: ${line.trim()}`);
  }
});

