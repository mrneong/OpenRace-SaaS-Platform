const fs = require('fs');

const mainFile = 'workspace/backend/src/main.ts';
let mainTs = fs.readFileSync(mainFile, 'utf8');

mainTs = mainTs.replace("document.getElementById('selected-team-input').value = teamId;", "const inp = document.getElementById('selected-team-input'); if (inp) inp.value = teamId;");

fs.writeFileSync(mainFile, mainTs, 'utf8');
console.log('Made selected-team-input null safe.');

