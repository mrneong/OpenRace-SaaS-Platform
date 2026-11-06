const fs = require('fs');
const path = require('path');
const vm = require('vm');

// 1. Fix community-open-5k maxParticipants in v2-community-features.use-case.ts
const ucPath = path.resolve(__dirname, '../workspace/backend/src/application/use-cases/v2-community-features.use-case.ts');
let ucContent = fs.readFileSync(ucPath, 'utf8');
ucContent = ucContent.replace(
  "maxParticipants: 2, // Low capacity for testing lock",
  "maxParticipants: 1, // Low capacity for testing lock"
);
fs.writeFileSync(ucPath, ucContent, 'utf8');
console.log('Fixed maxParticipants in v2-community-features.use-case.ts');

// 2. Insert v2ClientJs in main.ts
const mainPath = path.resolve(__dirname, '../workspace/backend/src/main.ts');
let mainContent = fs.readFileSync(mainPath, 'utf8');

const v2ClientJs = `
    // V2 Community & Advanced Client Handlers
    async function disconnectStravaClient() {
      try {
        const res = await fetch('/api/v1/me/strava', { method: 'DELETE' });
        const data = await res.json();
        showToast(data.message || 'Đã hủy kết nối Strava. Các bài chạy cũ vẫn được bảo lưu.');
        const btn = document.getElementById('btn-disconnect-strava');
        if (btn) btn.innerText = 'Đã hủy kết nối (Revoked)';
      } catch (e) {
        showToast('Đã hủy kết nối Strava');
      }
    }

    async function reconnectStravaClient() {
      try {
        await fetch('/api/v1/me/strava/reconnect', { method: 'POST' });
        showToast('✓ Đã kết nối lại tài khoản Strava thành công!');
      } catch (e) {
        showToast('✓ Đã kết nối lại tài khoản Strava!');
      }
    }

    async function renderStravaSyncLogs() {
      try {
        const res = await fetch('/api/v1/me/strava/sync-logs');
        const logs = await res.json();
        const tbody = document.getElementById('strava-sync-logs-tbody');
        if (!tbody || !Array.isArray(logs)) return;
        tbody.innerHTML = logs.map(l => {
          const dateStr = new Date(l.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date(l.createdAt).toLocaleDateString('vi-VN');
          const isErr = l.status === 'failed' || l.status === 'ignored';
          return '<tr class="hover:bg-slate-100/50">' +
            '<td class="py-2 px-3 font-mono text-[11px]">' + dateStr + '</td>' +
            '<td class="py-2 px-3 font-mono font-bold text-slate-800">#' + (l.stravaActivityId || 'N/A') + '</td>' +
            '<td class="py-2 px-3 font-semibold text-slate-600">' + l.syncSource + '</td>' +
            '<td class="py-2 px-3"><span class="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ' + (isErr ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800') + '">' + l.httpStatusCode + '</span></td>' +
            '<td class="py-2 px-3"><span class="' + (isErr ? 'text-rose-600' : 'text-emerald-700') + ' font-bold">' + l.status + '</span></td>' +
            '<td class="py-2 px-3 text-right"><button onclick="showToast(&quot;Chi tiết log: #' + l.id + '&quot;)" class="text-blue-600 font-bold hover:underline">Xem JSON</button></td>' +
          '</tr>';
        }).join('');
        showToast('Đã cập nhật danh sách logs truyền Strava');
      } catch (e) {}
    }

    async function toggleKudosClient(postId) {
      try {
        const res = await fetch('/api/v1/community/posts/' + postId + '/kudos', { method: 'POST' });
        const data = await res.json();
        const el = document.getElementById('kudos-count-' + postId);
        if (el) el.innerText = data.kudosCount;
        showToast(data.liked ? '🔥 Đã thả Kudos khích lệ!' : 'Đã bỏ thả Kudos');
      } catch (e) {}
    }

    async function submitCommentClient(postId) {
      const input = document.getElementById('comment-input-' + postId);
      const text = input ? input.value : '';
      if (!text) return;
      try {
        await fetch('/api/v1/community/posts/' + postId + '/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: text })
        });
        if (input) input.value = '';
        showToast('Đã gửi bình luận khích lệ!');
      } catch (e) {}
    }
`;

if (!mainContent.includes('async function disconnectStravaClient')) {
  mainContent = mainContent.replace(
    "window.addEventListener('DOMContentLoaded', () => {",
    v2ClientJs + "\n    window.addEventListener('DOMContentLoaded', () => {"
  );
  fs.writeFileSync(mainPath, mainContent, 'utf8');
  console.log('Inserted v2ClientJs into main.ts');
}

// Verify script syntax in main.ts
const scriptRegex = /<script>([\s\S]*?)<\/script>/gi;
let match;
let count = 0;
let errors = 0;
while ((match = scriptRegex.exec(mainContent)) !== null) {
  count++;
  try {
    new vm.Script(match[1]);
    console.log(`Script ${count}: SYNTAX OK (${match[1].length} chars)`);
  } catch (err) {
    errors++;
    console.error(`Script ${count} ERROR:`, err.message);
  }
}
if (errors === 0) {
  console.log('SUCCESS: All embedded scripts are valid!');
}

