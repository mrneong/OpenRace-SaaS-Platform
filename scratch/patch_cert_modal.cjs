const fs = require('fs');

let mainTs = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');

// 1. Update HTML elements in modal-finisher-certificate
const target1 = '<div class="text-2xl md:text-3xl font-black text-slate-900 underline decoration-amber-400 decoration-2 underline-offset-8">\n            Nguyễn Văn A\n          </div>';
const replace1 = '<div id="cert-athlete-name" class="text-2xl md:text-3xl font-black text-slate-900 underline decoration-amber-400 decoration-2 underline-offset-8">\n            Nguyễn Văn A\n          </div>';
if (mainTs.includes(target1)) {
  mainTs = mainTs.replace(target1, replace1);
  console.log('Patched cert-athlete-name');
} else {
  console.log('Target 1 not found');
}

const target2 = '<div class="text-sm md:text-base font-extrabold text-[#FF5B26]">\n              MÙA 10 RUN TO TECHCOMBANK 2026 — SADC/SARC\n            </div>\n            <div class="text-xs font-semibold text-slate-700">\n              Đội thi: <span class="text-indigo-600 font-bold">Team Phoenix SARC</span> • Danh hiệu: <span class="text-amber-600 font-bold">🏆 Hạng 1 Vô Địch Đồng Đội</span>\n            </div>';
const replace2 = '<div id="cert-race-title" class="text-sm md:text-base font-extrabold text-[#FF5B26]">\n              MÙA 10 RUN TO TECHCOMBANK 2026 — SADC/SARC\n            </div>\n            <div class="text-xs font-semibold text-slate-700">\n              Đội thi: <span id="cert-team-name" class="text-indigo-600 font-bold">Team Phoenix SARC</span> • Danh hiệu: <span id="cert-award-title" class="text-amber-600 font-bold">🏆 Hạng 1 Vô Địch Đồng Đội</span>\n            </div>';
if (mainTs.includes(target2)) {
  mainTs = mainTs.replace(target2, replace2);
  console.log('Patched cert-race-title, team, award');
} else {
  console.log('Target 2 not found');
}

const target3 = '<div class="text-[10px] uppercase font-bold text-slate-400">Tổng Cự Ly</div>\n              <div class="text-lg font-black text-slate-900 font-mono">1,250.0 <span class="text-xs font-sans">KM</span></div>';
const replace3 = '<div class="text-[10px] uppercase font-bold text-slate-400">Tổng Cự Ly</div>\n              <div id="cert-distance" class="text-lg font-black text-slate-900 font-mono">1,250.0 <span class="text-xs font-sans">KM</span></div>';
if (mainTs.includes(target3)) {
  mainTs = mainTs.replace(target3, replace3);
  console.log('Patched cert-distance');
} else {
  console.log('Target 3 not found');
}

const target4 = '<div class="font-bold text-slate-900 font-mono text-[10px]">ID: CERT-2026-M10-ATH001</div>';
const replace4 = '<div id="cert-display-id" class="font-bold text-slate-900 font-mono text-[10px]">ID: CERT-2026-M10-ATH001</div>';
if (mainTs.includes(target4)) {
  mainTs = mainTs.replace(target4, replace4);
  console.log('Patched cert-display-id');
} else {
  console.log('Target 4 not found');
}

// 2. Update openFinisherCertificateModal function
const targetFn = `    function openFinisherCertificateModal() {
      const modal = document.getElementById('modal-finisher-certificate');
      if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
      }
    }`;

const replaceFn = `    function openFinisherCertificateModal(athleteName, raceTitle, certNo, bib, distKm, awardTitle, team) {
      const modal = document.getElementById('modal-finisher-certificate');
      if (!modal) return;

      if (athleteName) {
        const nameEl = document.getElementById('cert-athlete-name');
        if (nameEl) nameEl.innerText = athleteName;
      }
      if (raceTitle) {
        const titleEl = document.getElementById('cert-race-title');
        if (titleEl) titleEl.innerText = raceTitle.toUpperCase();
      }
      if (team || awardTitle) {
        const teamEl = document.getElementById('cert-team-name');
        if (teamEl && team) teamEl.innerText = team;
        const awardEl = document.getElementById('cert-award-title');
        if (awardEl && awardTitle) awardEl.innerText = awardTitle;
      }
      if (distKm) {
        const distEl = document.getElementById('cert-distance');
        if (distEl) distEl.innerHTML = distKm + ' <span class="text-xs font-sans">KM</span>';
      }
      if (certNo) {
        const idEl = document.getElementById('cert-display-id');
        if (idEl) idEl.innerText = 'ID: ' + certNo;
      }

      modal.classList.remove('hidden');
      modal.style.display = 'flex';
    }`;

if (mainTs.includes(targetFn)) {
  mainTs = mainTs.replace(targetFn, replaceFn);
  console.log('Patched openFinisherCertificateModal');
} else {
  console.log('targetFn not found');
}

fs.writeFileSync('workspace/backend/src/main.ts', mainTs);
console.log('Done patching main.ts');
