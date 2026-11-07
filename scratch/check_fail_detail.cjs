const { execSync } = require('child_process');

try {
  execSync('node test-runner.cjs', { cwd: 'workspace/backend', encoding: 'utf8' });
} catch (e) {
  const lines = (e.stdout || '').split('\n');
  const idx = lines.findIndex(l => l.includes('AC-STRAVA-OAUTH-WEBHOOK-02'));
  if (idx !== -1) {
    console.log(lines.slice(idx - 1, idx + 6).join('\n'));
  }
}

