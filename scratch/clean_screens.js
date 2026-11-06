const fs = require('fs');
const path = require('path');

const dir = 'scratch/screens';
const files = fs.readdirSync(dir);

files.forEach(f => {
  const filePath = path.join(dir, f);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Trim any trailing `; or `; or spaces
  if (content.trim().endsWith('`;')) {
    content = content.trim().slice(0, -2).trim();
    changed = true;
  }
  if (content.trim().endsWith('`')) {
    content = content.trim().slice(0, -1).trim();
    changed = true;
  }

  // Remove any remaining stray backticks or ${ if any
  const backtickCount = (content.match(/`/g) || []).length;
  if (backtickCount > 0) {
    console.log(`Warning: ${f} still contains ${backtickCount} backtick(s)`);
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Cleaned ${f}`);
  }
});

