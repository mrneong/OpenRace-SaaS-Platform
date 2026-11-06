const fs = require('fs');
let code = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');

code = code.replace(
  `'<button onclick="openExecutiveModal(\\\'' + l.id + '\\\')" class="w-7 h-7`,
  `'<button data-id="' + l.id + '" onclick="openExecutiveModal(this.dataset.id)" class="w-7 h-7`
);

code = code.replace(
  `'<button onclick="deleteExecutiveLeader(\\\'' + l.id + '\\\')" class="w-7 h-7`,
  `'<button data-id="' + l.id + '" onclick="deleteExecutiveLeader(this.dataset.id)" class="w-7 h-7`
);

code = code.replace(
  `'<button onclick="togglePinAnnouncement(\\\'' + p.id + '\\\')" class="px-2 py-1`,
  `'<button data-id="' + p.id + '" onclick="togglePinAnnouncement(this.dataset.id)" class="px-2 py-1`
);

code = code.replace(
  `'<button onclick="openAnnouncementModal(\\\'' + p.id + '\\\')" class="px-2 py-1`,
  `'<button data-id="' + p.id + '" onclick="openAnnouncementModal(this.dataset.id)" class="px-2 py-1`
);

code = code.replace(
  `'<button onclick="deleteAnnouncementPost(\\\'' + p.id + '\\\')" class="px-2 py-1`,
  `'<button data-id="' + p.id + '" onclick="deleteAnnouncementPost(this.dataset.id)" class="px-2 py-1`
);

fs.writeFileSync('workspace/backend/src/main.ts', code, 'utf8');
console.log('Successfully replaced onclick handlers with data-id pattern!');

