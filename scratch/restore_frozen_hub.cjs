const fs = require('fs');

let mainTs = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');

// 1. Restore button IDs
const oldBtns = `<button onclick="openRaceLandingModal('mua-9-thu-thach-mua-he-ruc-lua-2026')" class="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-xs transition border border-purple-200 flex items-center gap-1">
                    <span>🌟</span> <span>Xem Bảng Vàng &amp; E-Cert</span>
                  </button>
                  <button onclick="exportRaceExcel('race-season-9')" class="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs transition flex items-center gap-1">`;

const newBtns = `<button id="btn-frozen-hof-m9" onclick="openRaceLandingModal('mua-9-thu-thach-mua-he-ruc-lua-2026')" class="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-xs transition border border-purple-200 flex items-center gap-1">
                    <span>🌟</span> <span>Xem Bảng Vàng &amp; E-Cert</span>
                  </button>
                  <button id="btn-frozen-export-m9" onclick="exportRaceExcel('race-season-9')" class="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs transition flex items-center gap-1">`;

if (mainTs.includes(oldBtns)) {
  mainTs = mainTs.replace(oldBtns, newBtns);
  console.log('Restored btn-frozen-hof-m9 and btn-frozen-export-m9');
} else {
  console.log('Warning: oldBtns pattern not found');
}

const oldSpringBtn = `<button onclick="exportRaceExcel('race-spring-2026')" class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1">`;
const newSpringBtn = `<button id="btn-frozen-export-spring" onclick="exportRaceExcel('race-spring-2026')" class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1">`;
if (mainTs.includes(oldSpringBtn)) {
  mainTs = mainTs.replace(oldSpringBtn, newSpringBtn);
  console.log('Restored btn-frozen-export-spring');
} else {
  console.log('Warning: oldSpringBtn pattern not found');
}

// 2. Restore modal-frozen-hall-of-fame if not present
if (!mainTs.includes('id="modal-frozen-hall-of-fame"')) {
  const modalHtml = fs.readFileSync('scratch/modal_frozen_hof.txt', 'utf8');
  const targetModal = '<div id="modal-appeal-multitier"';
  if (mainTs.includes(targetModal)) {
    mainTs = mainTs.replace(targetModal, modalHtml + '\n\n  ' + targetModal);
    console.log('Restored modal-frozen-hall-of-fame before modal-appeal-multitier');
  } else {
    console.log('Warning: targetModal not found');
  }
} else {
  console.log('modal-frozen-hall-of-fame already present');
}

// 3. Restore functions if not present
if (!mainTs.includes('function openRaceLandingModal')) {
  const fnCode = fs.readFileSync('scratch/fn_frozen_hof.txt', 'utf8');
  const targetFn = 'async function exportRaceExcel';
  const targetFn2 = 'function exportRaceExcel';
  if (mainTs.includes(targetFn)) {
    mainTs = mainTs.replace(targetFn, fnCode + '\n    ' + targetFn);
    console.log('Restored frozen functions before async exportRaceExcel');
  } else if (mainTs.includes(targetFn2)) {
    mainTs = mainTs.replace(targetFn2, fnCode + '\n    ' + targetFn2);
    console.log('Restored frozen functions before exportRaceExcel');
  } else {
    console.log('Warning: targetFn not found');
  }
} else {
  console.log('openRaceLandingModal already present');
}

fs.writeFileSync('workspace/backend/src/main.ts', mainTs);
console.log('Updated workspace/backend/src/main.ts successfully!');
