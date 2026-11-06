const fs = require('fs');
let code = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');

// 1. In switchTab
code = code.replace(
  "if (resolvedId === 'club') {\n        renderClubMembers();\n      }",
  "if (resolvedId === 'club') {\n        renderClubMembers();\n        renderClubDisplay();\n      }"
);

// 2. In DOMContentLoaded
code = code.replace(
  "renderClubMembers();\n      renderAdminMemberList();",
  "renderClubMembers();\n      renderAdminMemberList();\n      renderClubDisplay();"
);

// 3. In showSubScreen
code = code.replace(
  "if (!tabEl) return;",
  "if (!tabEl) return;\n      if (normalizedTab === 'club') renderClubDisplay();"
);

// 4. Add IDs to buttons in section-4-1
code = code.replace(
  '<button onclick="openEditClubProfileModal()" class="px-4 py-2 rounded-xl bg-[#FF5B26]',
  '<button id="btn-open-edit-club-profile" onclick="openEditClubProfileModal()" class="px-4 py-2 rounded-xl bg-[#FF5B26]'
);

code = code.replace(
  '<button onclick="openExecutiveModal()" class="px-3 py-1.5 rounded-xl bg-orange-100',
  '<button id="btn-open-add-leader" onclick="openExecutiveModal()" class="px-3 py-1.5 rounded-xl bg-orange-100'
);

code = code.replace(
  '<button onclick="openAnnouncementModal()" class="px-3 py-1.5 rounded-xl bg-[#FF5B26]',
  '<button id="btn-open-add-announcement" onclick="openAnnouncementModal()" class="px-3 py-1.5 rounded-xl bg-[#FF5B26]'
);

fs.writeFileSync('workspace/backend/src/main.ts', code, 'utf8');
console.log('Successfully updated main.ts wiring and IDs!');

