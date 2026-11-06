const fs = require('fs');

const mainFile = 'workspace/backend/src/main.ts';
let mainTs = fs.readFileSync(mainFile, 'utf8');

const oldUpdateSubNav = `function updateSubNav(tabId) {
      const bar = document.getElementById('sub-nav-bar');
      if (!bar) return;
      const subs = SUB_MENUS[tabId] || [];
      bar.innerHTML = '<span class="text-slate-400 font-mono text-[10px] shrink-0">Chức năng:</span>' +
        subs.map(s => {
          return '<button onclick="goToSection(&quot;' + tabId + '&quot;, &quot;' + s.section + '&quot;)" class="px-2.5 py-1 rounded-full bg-white hover:bg-orange-50 hover:text-[#FF5B26] border border-slate-200 transition shrink-0 font-medium text-[11px]">' +
            (s.code ? '<span class="font-mono text-slate-400 font-bold mr-1">' + s.code + '</span>' : '') +
            s.name +
          '</button>';
        }).join('');
    }`;

const newUpdateSubNav = `function updateSubNav(tabId) {
      const bar = document.getElementById('sub-nav-bar');
      if (!bar) return;
      if (tabId === 'dashboard') {
        bar.classList.remove('hidden');
        bar.classList.add('flex');
        const subs = SUB_MENUS['dashboard'] || [];
        bar.innerHTML = '<span class="text-slate-400 font-mono text-[10px] shrink-0">Chức năng:</span>' +
          subs.map(s => {
            return '<button onclick="goToSection(&quot;dashboard&quot;, &quot;' + s.section + '&quot;)" class="px-2.5 py-1 rounded-full bg-white hover:bg-orange-50 hover:text-[#FF5B26] border border-slate-200 transition shrink-0 font-medium text-[11px]">' +
              (s.code ? '<span class="font-mono text-slate-400 font-bold mr-1">' + s.code + '</span>' : '') +
              s.name +
            '</button>';
          }).join('');
      } else {
        bar.classList.add('hidden');
        bar.classList.remove('flex');
      }
    }`;

if (mainTs.includes(oldUpdateSubNav)) {
  mainTs = mainTs.replace(oldUpdateSubNav, newUpdateSubNav);
  fs.writeFileSync(mainFile, mainTs, 'utf8');
  console.log('Successfully updated updateSubNav in main.ts');
} else {
  console.log('Could not find exact oldUpdateSubNav');
}

