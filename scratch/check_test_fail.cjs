const { execSync } = require('child_process');

try {
  const output = execSync('node test-runner.cjs', { cwd: 'workspace/backend', encoding: 'utf8' });
  console.log(output);
} catch (e) {
  const lines = (e.stdout || '').split('\n');
  lines.forEach(l => {
    if (l.includes('FAIL') || l.includes('✗') || l.includes('Error')) {
      console.log(l);
    }
  });
}

