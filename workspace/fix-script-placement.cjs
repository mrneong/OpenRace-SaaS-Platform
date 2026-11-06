const fs = require('fs');
const path = require('path');

const mainTsPath = path.resolve(__dirname, 'backend/src/main.ts');
let code = fs.readFileSync(mainTsPath, 'utf8');

// 1. Remove injected script inside <script src="https://cdn.tailwindcss.com">
const badBlockStart = '<script src="https://cdn.tailwindcss.com">';
const badBlockEnd = '  </script>';
const tailwindClean = '<script src="https://cdn.tailwindcss.com"></script>';

if (code.includes('// [AC-046 & AC-047] FINISHER CERTIFICATE & ELEVATION AUDIT') && code.indexOf('// [AC-046 & AC-047]') < 3000) {
  const startIdx = code.indexOf(badBlockStart);
  const endIdx = code.indexOf(badBlockEnd, startIdx) + badBlockEnd.length;
  code = code.substring(0, startIdx) + tailwindClean + code.substring(endIdx);
  console.log('✓ Cleaned up bad injection in <head>');
}

// 2. Add client JS into the main script block before the final </script>
const clientJsToInject = `
    // ====================================================
    // [AC-046 & AC-047] FINISHER CERTIFICATE & ELEVATION AUDIT
    // ====================================================

    function openFinisherCertificateModal() {
      const modal = document.getElementById('modal-finisher-certificate');
      if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
      }
    }

    function closeFinisherCertificateModal() {
      const modal = document.getElementById('modal-finisher-certificate');
      if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
      }
    }

    function shareCertificate() {
      showToast('✓ Đã sao chép liên kết chứng nhận điện tử để chia sẻ lên Zalo/Facebook!');
    }

    function openElevationAuditDrawer(activityId = 'ACT_000075') {
      const drawer = document.getElementById('drawer-elevation-audit');
      if (drawer) {
        drawer.classList.remove('hidden');
        drawer.style.display = 'flex';
      }
    }

    function closeElevationAuditDrawer() {
      const drawer = document.getElementById('drawer-elevation-audit');
      if (drawer) {
        drawer.classList.add('hidden');
        drawer.style.display = 'none';
      }
    }
`;

// Find the last </script>
const lastScriptIdx = code.lastIndexOf('</script>');
if (lastScriptIdx !== -1) {
  code = code.substring(0, lastScriptIdx) + clientJsToInject + '\n  </script>' + code.substring(lastScriptIdx + '</script>'.length);
  console.log('✓ Successfully injected client functions before the last </script>');
}

fs.writeFileSync(mainTsPath, code, 'utf8');
console.log('=== Finished fixing script placement in main.ts ===');

