const fs = require('fs');

const tabClub = fs.readFileSync('scratch/screens/tab-club.html', 'utf8');
console.log('has selected-team-input in tabClub:', tabClub.includes('selected-team-input'));
console.log('has selected-team-name-label in tabClub:', tabClub.includes('selected-team-name-label'));
console.log('has join-team-feedback in tabClub:', tabClub.includes('join-team-feedback'));
console.log('has consent-strava in tabClub:', tabClub.includes('consent-strava'));
console.log('has consent-rules in tabClub:', tabClub.includes('consent-rules'));

