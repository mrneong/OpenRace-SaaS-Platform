const fs = require('fs');
const s = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');
const scriptStart = s.indexOf('<script>');
const scriptEnd = s.indexOf('</script>');
const scriptCode = s.slice(scriptStart + 8, scriptEnd);

try {
  // Test compiling with node vm
  const vm = require('vm');
  new vm.Script(scriptCode);
  console.log('Script syntax is VALID!');
} catch (e) {
  console.error('Script syntax ERROR:', e.message);
  console.error('Stack:', e.stack);
}

