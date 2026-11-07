const cp = require('child_process');
const fs = require('fs');

const oldMain = cp.execSync('git show HEAD:workspace/backend/src/main.ts', { maxBuffer: 20 * 1024 * 1024 }).toString();

const modalIdx = oldMain.indexOf('id="modal-frozen-hall-of-fame"');
const searchFrom = modalIdx + 100;
const regex = /<div id="modal-([a-zA-Z0-9-]+)"/g;
regex.lastIndex = searchFrom;
const nextModal = regex.exec(oldMain);
console.log('Next modal after frozen:', nextModal ? nextModal[0] : 'None', 'at index', nextModal ? nextModal.index : -1);

if (nextModal) {
  const startTag = oldMain.lastIndexOf('<!--', modalIdx);
  const endTag = oldMain.lastIndexOf('<!--', nextModal.index);
  const modalHtml = oldMain.slice(startTag, endTag);
  fs.writeFileSync('scratch/modal_frozen_hof.txt', modalHtml);
  console.log('Saved modal_frozen_hof.txt, length:', modalHtml.length);
}

