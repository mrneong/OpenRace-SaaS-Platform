const fs = require('fs');

function checkFile(name) {
  console.log(`\n================== ${name} ==================`);
  const html = fs.readFileSync(`scratch/${name}`, 'utf8');
  const lines = html.split('\n');
  lines.forEach((l, i) => {
    if (l.includes('id="section-') || l.includes('id="admin-') || l.includes('id="profile-') || l.includes('id="club-edit-') || l.includes('id="sim-') || l.includes('id="team-identity-') || l.includes('id="strava-')) {
      console.log(`${i}: ${l.trim().substring(0, 100)}`);
    }
  });
}

checkFile('tab-finance.html');
checkFile('tab-club-manage.html');
checkFile('tab-rules.html');
checkFile('tab-admin.html');

