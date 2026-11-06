const fs = require('fs');

const files = fs.readdirSync('scratch/screens');
files.forEach(f => {
  const c = fs.readFileSync('scratch/screens/' + f, 'utf8');
  if (c.includes('admin-finance-container')) {
    console.log('Found admin-finance-container in:', f);
  }
});

