const fs = require('fs');

// 1. Update tab-arena.html
let tabArena = fs.readFileSync('scratch/screens/tab-arena.html', 'utf8');
tabArena = tabArena.replace('Áo thi đấu SARC Limited Edition', 'Áo SARC Limited Edition');
fs.writeFileSync('scratch/screens/tab-arena.html', tabArena, 'utf8');
console.log('tab-arena.html updated with Áo SARC Limited Edition');

// 2. Update tab-club.html
let tabClub = fs.readFileSync('scratch/screens/tab-club.html', 'utf8');
const oldTeamButtons = `<div class="flex items-center gap-3">
                  <button type="button" onclick="selectJoinTeam('team-phoenix', true)" class="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:border-orange-500 transition">
                    Team Phoenix (16/16 - Đầy)
                  </button>
                  <button type="button" onclick="selectJoinTeam('team-dragons', false)" class="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:border-orange-500 transition">
                    Team Dragons (15/16 - Còn Chỗ)
                  </button>
                </div>
                <div class="text-xs font-bold text-slate-700 pt-1">Đội Đã Chọn: <span id="selected-team-name-label" class="text-[#FF5B26]">Chưa chọn</span></div>`;

const newTeamButtons = `<div class="flex items-center gap-3">
                  <button type="button" id="team-card-phoenix" onclick="selectJoinTeam('team-phoenix', true)" class="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:border-orange-500 transition">
                    Team Phoenix (16/16 - Đầy)
                  </button>
                  <button type="button" id="team-card-dragons" onclick="selectJoinTeam('team-dragons', false)" class="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:border-orange-500 transition">
                    Team Dragons (15/16 - Còn Chỗ)
                  </button>
                  <button type="button" id="team-card-tigers" onclick="selectJoinTeam('team-tigers', false)" class="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:border-orange-500 transition">
                    Team Tigers (11/16 - Còn Chỗ)
                  </button>
                </div>
                <input type="hidden" id="selected-team-input" value="">
                <div class="text-xs font-bold text-slate-700 pt-1">Đội Đã Chọn: <span id="selected-team-name-label" class="text-[#FF5B26]">Chưa chọn</span></div>`;

if (tabClub.includes("selectJoinTeam('team-phoenix', true)")) {
  tabClub = tabClub.replace(oldTeamButtons, newTeamButtons);
  fs.writeFileSync('scratch/screens/tab-club.html', tabClub, 'utf8');
  console.log('tab-club.html updated with team card IDs and hidden input');
} else {
  console.log('Warning: could not find exact match in tab-club.html');
}

// 3. Re-inject tabs into main.ts
const tabActivities = fs.readFileSync('scratch/screens/tab-activities.html', 'utf8').trim();
const tabFinance = fs.readFileSync('scratch/screens/tab-finance.html', 'utf8').trim();
const tabClubManage = fs.readFileSync('scratch/screens/tab-club-manage.html', 'utf8').trim();
const tabRules = fs.readFileSync('scratch/screens/tab-rules.html', 'utf8').trim();
const tabAdmin = fs.readFileSync('scratch/screens/tab-admin.html', 'utf8').trim();

const mainFile = 'workspace/backend/src/main.ts';
let mainTs = fs.readFileSync(mainFile, 'utf8');

const arenaStart = mainTs.indexOf('<div id="tab-arena"');
const fabStart = mainTs.indexOf('<!-- [1.5] Floating Action Button');

if (arenaStart === -1 || fabStart === -1) {
  console.error('Markers not found in main.ts!');
  process.exit(1);
}

const allNewTabs = [
  tabArena.trim(),
  tabActivities,
  tabClub.trim(),
  tabFinance,
  tabClubManage,
  tabRules,
  tabAdmin
].join('\n\n');

mainTs = mainTs.substring(0, arenaStart) + allNewTabs + '\n\n      ' + mainTs.substring(fabStart);

// 4. Update filterIndividualRunners in mainTs
const oldFilterRunner = /function filterIndividualRunners\(\) \{[\s\S]*?renderIndividualRunners\(filtered\);\s*\}/;
const newFilterRunner = `function filterIndividualRunners() {
      const query = (document.getElementById('ind-search-input')?.value || '').toLowerCase().trim();
      const rawTeam = (document.getElementById('ind-team-filter')?.value || 'ALL').toUpperCase();

      let filtered = arenaRunnersData.slice(1).filter(r => {
        const matchName = r.name.toLowerCase().includes(query) || (r.bib && r.bib.toLowerCase().includes(query));
        const matchTeam = rawTeam === 'ALL' || 
          (rawTeam.includes('PHOENIX') && r.team.toUpperCase().includes('PHOENIX')) || 
          (rawTeam.includes('DRAGONS') && r.team.toUpperCase().includes('DRAGONS')) || 
          (rawTeam.includes('TIGERS') && r.team.toUpperCase().includes('TIGERS'));
        return matchName && matchTeam;
      });

      renderIndividualRunners(filtered);
    }`;

if (mainTs.match(oldFilterRunner)) {
  mainTs = mainTs.replace(oldFilterRunner, newFilterRunner);
  console.log('Replaced filterIndividualRunners in main.ts');
}

// 5. Update selectJoinTeam in mainTs
const oldSelectJoinTeam = /function selectJoinTeam\(teamId, isFull\) \{[\s\S]*?if \(label\) label\.innerText = 'Team Tigers SADC \(Còn 5 vị trí\)';\s*\}\s*\}\s*\}/;
const newSelectJoinTeam = `function selectJoinTeam(teamId, isFull) {
      showSubScreen("club", "section-4-4");
      if (isFull) {
        const fb = document.getElementById('join-team-feedback');
        if (fb) {
          fb.className = 'p-3 rounded-xl text-xs font-semibold bg-rose-50 border border-rose-200 text-rose-800 block';
          fb.innerHTML = '<strong>✕ Đội đã đầy!</strong> Team Phoenix SARC đã đạt tối đa 16/16 thành viên. Vui lòng chọn Dragons hoặc Tigers.';
        }
        return;
      }

      selectedTeamId = teamId;
      const inputEl = document.getElementById('selected-team-input');
      if (inputEl) inputEl.value = teamId;

      const dragonsCard = document.getElementById('team-card-dragons');
      const tigersCard = document.getElementById('team-card-tigers');
      const label = document.getElementById('selected-team-name-label');

      if (dragonsCard && tigersCard) {
        if (teamId === 'team-dragons') {
          dragonsCard.className = 'p-4 rounded-2xl border-2 border-[#FF5B26] bg-orange-50/20 cursor-pointer transition shadow-xs';
          tigersCard.className = 'p-4 rounded-2xl border-2 border-slate-200 bg-white hover:border-[#FF5B26] cursor-pointer transition shadow-xs';
          if (label) label.innerText = 'Team Dragons SADC (Còn 2 vị trí)';
        } else {
          tigersCard.className = 'p-4 rounded-2xl border-2 border-[#FF5B26] bg-orange-50/20 cursor-pointer transition shadow-xs';
          dragonsCard.className = 'p-4 rounded-2xl border-2 border-slate-200 bg-white hover:border-[#FF5B26] cursor-pointer transition shadow-xs';
          if (label) label.innerText = 'Team Tigers SADC (Còn 5 vị trí)';
        }
      } else if (label) {
        label.innerText = teamId === 'team-dragons' ? 'Team Dragons SADC' : 'Team Tigers SADC';
      }
    }`;

if (mainTs.match(oldSelectJoinTeam)) {
  mainTs = mainTs.replace(oldSelectJoinTeam, newSelectJoinTeam);
  console.log('Replaced selectJoinTeam in main.ts');
}

fs.writeFileSync(mainFile, mainTs, 'utf8');
console.log('Successfully written workspace/backend/src/main.ts! Total lines:', mainTs.split('\n').length);

