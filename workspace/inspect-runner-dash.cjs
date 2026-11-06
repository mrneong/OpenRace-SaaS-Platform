const fs = require('fs');
const content = fs.readFileSync('workspace/backend/src/application/use-cases/runner-dashboard.use-case.ts', 'utf8');

const regex = /class RunnerDashboardUseCase[^{]*\{([\s\S]*?)\n\}/;
console.log(content.slice(0, 3000));

