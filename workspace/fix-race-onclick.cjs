const fs = require('fs');
let code = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');

code = code.replace(
  `: '<button onclick="changeArenaRace(\\\'\` + ` + `\\' + r.slug + \\'\\')" class="w-full py-2`,
  `: '<button data-slug="' + r.slug + '" onclick="changeArenaRace(this.dataset.slug)" class="w-full py-2`
);

// If not replaced by exact pattern, let's replace directly by substring:
const target1 = `: '<button onclick="changeArenaRace('' + r.slug + '')" class="w-full py-2 rounded-xl bg-[#FF5B26]`;
const replace1 = `: '<button data-slug="' + r.slug + '" onclick="changeArenaRace(this.dataset.slug)" class="w-full py-2 rounded-xl bg-[#FF5B26]`;
if (code.includes(target1)) {
  code = code.replace(target1, replace1);
  console.log('Replaced target1!');
}

const target2 = `'<button onclick="openRaceFullDetailModal('' + r.slug + '')" class="w-full py-1.5 rounded-xl bg-slate-100`;
const replace2 = `'<button data-slug="' + r.slug + '" onclick="openRaceFullDetailModal(this.dataset.slug)" class="w-full py-1.5 rounded-xl bg-slate-100`;
if (code.includes(target2)) {
  code = code.replace(target2, replace2);
  console.log('Replaced target2!');
}

fs.writeFileSync('workspace/backend/src/main.ts', code, 'utf8');
console.log('Done updating buttons with data-slug pattern!');

