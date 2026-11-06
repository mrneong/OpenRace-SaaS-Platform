const fs = require('fs');

const tabArena = fs.readFileSync('scratch/screens/tab-arena.html', 'utf8');
console.log('has arena-ind-view:', tabArena.includes('arena-ind-view'));
console.log('has individual-runners-list:', tabArena.includes('individual-runners-list'));
console.log('has ind-search-input:', tabArena.includes('ind-search-input'));
console.log('has ind-team-filter:', tabArena.includes('ind-team-filter'));
console.log('has Áo SARC or similar:', tabArena.includes('Áo SARC') || tabArena.includes('áo SARC') || tabArena.includes('Áo SARC'));

// Let's check renderIndividualRunners in main.ts
const mainTs = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');
const idx = mainTs.indexOf('function renderIndividualRunners');
console.log('renderIndividualRunners at:', idx);
if (idx !== -1) {
  console.log(mainTs.substring(idx, idx + 800));
}

