const fs = require('fs');
const vm = require('vm');
const path = require('path');

const mainPath = path.resolve(__dirname, '../workspace/backend/src/main.ts');
let content = fs.readFileSync(mainPath, 'utf8');

// Replace the three lines in main.ts
const target1 = "adminChangeRole('' + m.id + '', this.value)";
const repl1 = "adminChangeRole(&quot;' + m.id + '&quot;, this.value)";

const target2 = "adminToggleLock('' + m.id + '')";
const repl2 = "adminToggleLock(&quot;' + m.id + '&quot;)";

const target3 = "adminDeleteMember('' + m.id + '')";
const repl3 = "adminDeleteMember(&quot;' + m.id + '&quot;)";

console.log('Target 1 found:', content.includes(target1));
console.log('Target 2 found:', content.includes(target2));
console.log('Target 3 found:', content.includes(target3));

if (content.includes(target1)) content = content.replace(target1, repl1);
if (content.includes(target2)) content = content.replace(target2, repl2);
if (content.includes(target3)) content = content.replace(target3, repl3);

fs.writeFileSync(mainPath, content, 'utf8');

// Verify script syntax
const scriptRegex = /<script>([\s\S]*?)<\/script>/gi;
let match;
let count = 0;
let errors = 0;
while ((match = scriptRegex.exec(content)) !== null) {
  count++;
  try {
    new vm.Script(match[1]);
    console.log(`Script ${count}: SYNTAX OK (${match[1].length} chars)`);
  } catch (err) {
    errors++;
    console.error(`Script ${count} ERROR:`, err.message);
  }
}
if (errors === 0 && count > 0) {
  console.log('SUCCESS: All embedded scripts valid!');
}

