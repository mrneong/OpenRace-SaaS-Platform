const fs = require('fs');

const testSuite = fs.readFileSync('workspace/test-e2e-all.cjs', 'utf8');
console.log('has sub-nav-bar in testSuite:', testSuite.includes('sub-nav-bar'));
console.log('has updateSubNav in testSuite:', testSuite.includes('updateSubNav'));

