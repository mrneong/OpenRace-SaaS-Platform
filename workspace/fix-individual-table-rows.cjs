const fs = require('fs');
const path = require('path');

const mainTsPath = path.resolve(__dirname, 'backend/src/main.ts');
let code = fs.readFileSync(mainTsPath, 'utf8');

// Replace renderIndividualRunners
const oldRenderIndRegex = /function renderIndividualRunners\(filteredList\)[\s\S]*?renderIndividualRunners\(filtered\);\s*\}/;

const newRenderInd = `function renderIndividualRunners(filteredList) {
      const container = document.getElementById('individual-runners-list');
      if (!container) return;
      const list = filteredList || arenaRunnersData.slice(1);
      container.innerHTML = list.map((r) => {
        const isSelf = r.isSelf;
        const rowClass = isSelf 
          ? 'bg-orange-50/50 hover:bg-orange-50/80 font-semibold' 
          : 'hover:bg-slate-50 transition';
        const rankBadge = r.rank === 1 
          ? 'bg-amber-100 text-amber-900 border border-amber-300 font-extrabold' 
          : r.rank === 2 
            ? 'bg-slate-200 text-slate-800 font-bold' 
            : r.rank === 3 
              ? 'bg-amber-50 text-amber-800 font-bold border border-amber-200' 
              : 'bg-slate-100 text-slate-600 font-medium';
        const teamBadge = r.team.includes('Phoenix')
          ? 'bg-orange-50 text-orange-700 border-orange-200'
          : r.team.includes('Dragons')
            ? 'bg-blue-50 text-blue-700 border-blue-200'
            : 'bg-emerald-50 text-emerald-700 border-emerald-200';
        const teamDot = r.team.includes('Phoenix')
          ? 'bg-orange-500'
          : r.team.includes('Dragons')
            ? 'bg-blue-500'
            : 'bg-emerald-500';
        const initials = r.name.split(' ').map(n => n[0]).slice(-2).join('');

        return '<tr class="' + rowClass + ' border-b border-slate-100">' +
          '<td class="py-3.5 px-4 text-center">' +
            '<span class="inline-flex items-center justify-center w-8 h-8 rounded-xl font-mono text-xs ' + rankBadge + '">' +
              (r.rank === 1 ? '👑 #1' : '#' + r.rank) +
            '</span>' +
          '</td>' +
          '<td class="py-3.5 px-4">' +
            '<div class="flex items-center gap-3">' +
              '<div class="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 uppercase font-mono">' +
                initials +
              '</div>' +
              '<div>' +
                '<div class="font-bold text-slate-900 flex items-center gap-1.5">' +
                  '<span>' + r.name + '</span>' +
                  (isSelf ? '<span class="text-[9px] bg-orange-100 text-[#FF5B26] px-1.5 py-0.5 rounded font-bold">Bạn</span>' : '') +
                  (r.bib ? '<span class="text-[9px] font-mono bg-slate-100 text-slate-500 px-1 rounded">' + r.bib + '</span>' : '') +
                '</div>' +
                '<div class="text-[11px] text-slate-400 font-mono">Pace TB: ' + r.pace + ' min/km</div>' +
              '</div>' +
            '</div>' +
          '</td>' +
          '<td class="py-3.5 px-4">' +
            '<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ' + teamBadge + '">' +
              '<span class="w-1.5 h-1.5 rounded-full ' + teamDot + '"></span>' +
              '<span>' + r.team + '</span>' +
            '</span>' +
          '</td>' +
          '<td class="py-3.5 px-4 text-right font-mono">' +
            '<span class="font-extrabold text-slate-900 text-sm">' + r.km.toFixed(1) + '</span>' +
            '<span class="text-[10px] text-slate-400"> km</span>' +
          '</td>' +
          '<td class="py-3.5 px-4 text-right font-mono">' +
            '<span class="font-bold text-slate-800">' + r.days + '</span>' +
            '<span class="text-[10px] text-slate-400"> ngày</span>' +
          '</td>' +
          '<td class="py-3.5 px-4 text-center">' +
            '<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ' + (r.km >= 50 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600') + '">' +
              '<span class="w-1.5 h-1.5 rounded-full ' + (r.km >= 50 ? 'bg-emerald-500' : 'bg-slate-400') + '"></span>' +
              (r.km >= 50 ? 'Đạt chuẩn' : 'Đang thi đấu') +
            '</span>' +
          '</td>' +
        '</tr>';
      }).join('');
    }

    function filterIndividualRunners() {
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

// Replace renderTeamRoster
const oldRenderTeamRosterRegex = /function renderTeamRoster\(\)[\s\S]*?container\.innerHTML = roster\.map\(m => \{[\s\S]*?\}\)\.join\(''\);\s*\}/;

const newRenderTeamRoster = `function renderTeamRoster() {
      const container = document.getElementById('team-roster-container');
      if (!container) return;
      const roster = [
        { name: 'Nguyễn Văn A', role: 'Captain', km: 125.0, days: 18, pct: '10.0%', isSelf: true },
        { name: 'Hoàng Kim Dung', role: 'Vice-Captain', km: 88.5, days: 12, pct: '7.1%', isSelf: false },
        { name: 'Đặng Tuấn Kiệt', role: 'Member', km: 78.0, days: 11, pct: '6.2%', isSelf: false },
        { name: 'Vũ Hải Nam', role: 'Member', km: 72.0, days: 10, pct: '5.8%', isSelf: false },
        { name: 'Ngô Thanh Tùng', role: 'Member', km: 68.0, days: 9, pct: '5.4%', isSelf: false },
        { name: 'Phan Thùy Trang', role: 'Member', km: 65.0, days: 9, pct: '5.2%', isSelf: false },
      ];

      container.innerHTML = roster.map(m => {
        const initials = m.name.split(' ').map(n => n[0]).slice(-2).join('');
        return '<tr class="hover:bg-slate-50 transition border-b border-slate-100">' +
          '<td class="py-3 px-4 font-bold text-slate-900">' +
            '<div class="flex items-center gap-2.5">' +
              '<div class="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">' +
                initials +
              '</div>' +
              '<span>' + m.name + '</span>' +
              (m.isSelf ? '<span class="text-[#FF5B26] font-bold text-xs ml-1">(Bạn)</span>' : '') +
            '</div>' +
          '</td>' +
          '<td class="py-3 px-4">' +
            '<span class="text-[10px] px-2.5 py-0.5 rounded-full font-bold ' + (m.role === 'Captain' ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'bg-slate-100 text-slate-700') + '">' +
              m.role +
            '</span>' +
          '</td>' +
          '<td class="py-3 px-4 text-right font-mono">' +
            '<span class="font-bold text-slate-900">' + m.km.toFixed(1) + ' km</span> ' +
            '<span class="text-slate-400 text-[10px]">(' + m.pct + ')</span>' +
          '</td>' +
          '<td class="py-3 px-4 text-right font-mono font-medium text-slate-800">' +
            m.days + ' ngày' +
          '</td>' +
          '<td class="py-3 px-4 text-center">' +
            '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ' + (m.km >= 20 ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-rose-100 text-rose-700 border border-rose-200') + '">' +
              (m.km >= 20 ? '✓ Đạt chỉ tiêu' : '⚠️ Cần đôn đốc') +
            '</span>' +
          '</td>' +
        '</tr>';
      }).join('');
    }`;

if (!oldRenderIndRegex.test(code)) {
  console.error('Could not match oldRenderIndRegex');
  process.exit(1);
}

code = code.replace(oldRenderIndRegex, newRenderInd);
console.log('Replaced renderIndividualRunners with proper <tr> and <td>');

if (!oldRenderTeamRosterRegex.test(code)) {
  console.error('Could not match oldRenderTeamRosterRegex');
  process.exit(1);
}

code = code.replace(oldRenderTeamRosterRegex, newRenderTeamRoster);
console.log('Replaced renderTeamRoster with proper <tr> and <td>');

fs.writeFileSync(mainTsPath, code, 'utf8');
console.log('Successfully wrote main.ts!');

