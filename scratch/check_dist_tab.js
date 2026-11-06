const fs = require('fs');

const dist = fs.readFileSync('workspace/backend/dist/main.js', 'utf8');
const idx = dist.indexOf('admin-finance-container');
console.log('admin-finance-container in dist at:', idx);
const before = dist.substring(0, idx);
const lastTab = before.lastIndexOf('id="tab-');
console.log('Tab containing admin-finance-container:', dist.substring(lastTab, lastTab + 30));

