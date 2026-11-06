const fs = require('fs');
let code = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');

const t1 = `const switchBtn = isActive
          ? '<button disabled class="w-full py-2 rounded-xl bg-orange-100 text-[#FF5B26] font-extrabold text-xs flex items-center justify-center gap-1 cursor-default">✓ Đang Xem</button>'
          : '<button onclick="changeArenaRace(\\'' + r.slug + '\\')" class="w-full py-2 rounded-xl bg-[#FF5B26] hover:bg-[#e04800] text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-1">Chuyển Sang Giải Này</button>';`;

const r1 = `const switchBtn = isActive
          ? '<button disabled class="w-full py-2 rounded-xl bg-orange-100 text-[#FF5B26] font-extrabold text-xs flex items-center justify-center gap-1 cursor-default">✓ Đang Xem</button>'
          : '<button data-slug="' + r.slug + '" onclick="changeArenaRace(this.dataset.slug)" class="w-full py-2 rounded-xl bg-[#FF5B26] hover:bg-[#e04800] text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-1">Chuyển Sang Giải Này</button>';`;

const t2 = `'<button onclick="openRaceFullDetailModal(\\'' + r.slug + '\\')" class="w-full py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition flex items-center justify-center gap-1">'`;

const r2 = `'<button data-slug="' + r.slug + '" onclick="openRaceFullDetailModal(this.dataset.slug)" class="w-full py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition flex items-center justify-center gap-1">'`;

if (code.includes(t1)) {
  code = code.replace(t1, r1);
  console.log('Replaced t1 successfully!');
} else {
  console.log('t1 not found directly, using regex replacement');
  code = code.replace(
    /'<button onclick="changeArenaRace\(\\'\' \+ r\.slug \+ \'\\\'\)"/,
    `'<button data-slug="' + r.slug + '" onclick="changeArenaRace(this.dataset.slug)"`
  );
}

if (code.includes(t2)) {
  code = code.replace(t2, r2);
  console.log('Replaced t2 successfully!');
} else {
  console.log('t2 not found directly, using regex replacement');
  code = code.replace(
    /'<button onclick="openRaceFullDetailModal\(\\'\' \+ r\.slug \+ \'\\\'\)"/,
    `'<button data-slug="' + r.slug + '" onclick="openRaceFullDetailModal(this.dataset.slug)"`
  );
}

fs.writeFileSync('workspace/backend/src/main.ts', code, 'utf8');
console.log('Finished updating data-slug pattern in main.ts!');

