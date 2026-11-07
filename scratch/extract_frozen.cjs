const cp = require('child_process');
const fs = require('fs');

const oldMain = cp.execSync('git show HEAD:workspace/backend/src/main.ts', { maxBuffer: 20 * 1024 * 1024 }).toString();

const modalIdx = oldMain.indexOf('modal-frozen-hall-of-fame');
console.log('modal-frozen-hall-of-fame at', modalIdx);
const nextComment = oldMain.indexOf('<!--', modalIdx + 200);
console.log('Next comment at:', nextComment);
console.log('Text before next comment:\n', oldMain.slice(nextComment - 100, nextComment + 100));

const startTag = oldMain.lastIndexOf('<!--', modalIdx);
const endTag = nextComment;
const modalHtml = oldMain.slice(startTag, endTag);
fs.writeFileSync('scratch/modal_frozen_hof.txt', modalHtml);
console.log('Saved modal_frozen_hof.txt, length:', modalHtml.length);
