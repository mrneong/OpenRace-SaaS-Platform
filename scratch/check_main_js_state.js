const fs = require('fs');

const content = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');

console.log('has SCREEN_REGISTRY:', content.includes('const SCREEN_REGISTRY ='));
console.log('has showSubScreen:', content.includes('function showSubScreen('));
console.log('has goToSection:', content.includes('function goToSection('));
console.log('has goToScreen:', content.includes('function goToScreen('));

const lines = content.split('\n');
console.log('Lines count:', lines.length);

