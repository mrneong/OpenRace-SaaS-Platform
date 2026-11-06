const fs = require('fs');
let code = fs.readFileSync('workspace/backend/src/main.ts', 'utf8');

code = code.replace(
  `let currentActivityFilter = 'all';\n    let arenaRaceHubFilter = 'all';\n    let currentAppealActId = null;`,
  `let currentActivityFilter = 'all';\n    let activityRaceFilter = 'all';\n    let currentAppealActId = null;`
);

code = code.replace(
  `function filterByRace(race) {\n      arenaRaceHubFilter = race;\n      renderActivities();\n    }`,
  `function filterByRace(race) {\n      activityRaceFilter = race;\n      renderActivities();\n    }`
);

fs.writeFileSync('workspace/backend/src/main.ts', code, 'utf8');
console.log('Successfully fixed activityRaceFilter variable!');

