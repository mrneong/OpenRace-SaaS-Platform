const fs = require('fs');
const files = fs.readdirSync('scratch/screens');
files.forEach(f => {
  const c = fs.readFileSync('scratch/screens/' + f, 'utf8');
  const hasBacktick = c.includes('`');
  const hasDollarBrace = c.includes('${');
  console.log(f, { hasBacktick, hasDollarBrace, length: c.length });
  if (hasBacktick) {
    const lines = c.split('\n');
    lines.forEach((line, idx) => {
      if (line.includes('`')) console.log(`  ${f} line ${idx + 1}: ${line}`);
    });
  }
});

