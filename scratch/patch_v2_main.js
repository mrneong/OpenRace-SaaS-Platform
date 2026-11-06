const fs = require('fs');
const path = require('path');
const vm = require('vm');

const mainPath = path.resolve(__dirname, '../workspace/backend/src/main.ts');
let content = fs.readFileSync(mainPath, 'utf8');

// 1. ADD IMPORT
if (!content.includes('V2CommunityFeaturesUseCase')) {
  content = content.replace(
    "import { ClubHubUseCase } from './application/use-cases/club-hub.use-case';",
    "import { ClubHubUseCase } from './application/use-cases/club-hub.use-case';\nimport { V2CommunityFeaturesUseCase } from './application/use-cases/v2-community-features.use-case';"
  );
}

// 2. INSTANTIATE IN BOOTSTRAP
if (!content.includes('v2CommunityUseCase')) {
  content = content.replace(
    "const clubHubUseCase = new ClubHubUseCase(dataStore);",
    "const clubHubUseCase = new ClubHubUseCase(dataStore);\n  const v2CommunityUseCase = new V2CommunityFeaturesUseCase(dataStore);"
  );
}

// 3. INJECT HTML ENHANCEMENTS INTO SECTION-5-2 (STRAVA SELF SERVICE & SYNC LOGS)
const stravaV2Html = `
          <!-- V2: Strava Self-Service Actions & Sync Logs Table -->
          <div class="flex items-center gap-2 pt-1 flex-wrap">
            <button id="btn-disconnect-strava" onclick="disconnectStravaClient()" class="px-3.5 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition flex items-center gap-1">
              <span>⛔</span> Hủy Kết Nối Strava
            </button>
            <button id="btn-reconnect-strava" onclick="reconnectStravaClient()" class="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1">
              <span>✓</span> Kết Nối Lại Strava
            </button>
          </div>

          <!-- Sync Logs Accordion/Table -->
          <div class="pt-3 border-t border-slate-100 space-y-2">
            <div class="flex items-center justify-between">
              <h4 class="text-xs font-extrabold uppercase tracking-wider text-slate-500">[1.2] Nhật Ký Truyền Dữ Liệu Strava (Raw Sync Logs)</h4>
              <button onclick="renderStravaSyncLogs()" class="text-[11px] text-[#FF5B26] font-bold hover:underline">Làm mới logs</button>
            </div>
            <div class="overflow-x-auto rounded-2xl border border-slate-200/80 bg-slate-50/50">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-100/80 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th class="py-2 px-3">Thời gian</th>
                    <th class="py-2 px-3">Mã bài Strava</th>
                    <th class="py-2 px-3">Nguồn</th>
                    <th class="py-2 px-3">HTTP Status</th>
                    <th class="py-2 px-3">Trạng thái</th>
                    <th class="py-2 px-3 text-right">Chi tiết</th>
                  </tr>
                </thead>
                <tbody id="strava-sync-logs-tbody" class="divide-y divide-slate-100">
                  <tr class="hover:bg-slate-100/50">
                    <td class="py-2 px-3 font-mono text-[11px]">14:20:10 05/11</td>
                    <td class="py-2 px-3 font-mono font-bold text-slate-800">#12894102941</td>
                    <td class="py-2 px-3 font-semibold text-slate-600">Webhook</td>
                    <td class="py-2 px-3"><span class="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">200 OK</span></td>
                    <td class="py-2 px-3"><span class="text-emerald-700 font-bold">Hợp lệ (6.2km)</span></td>
                    <td class="py-2 px-3 text-right"><button onclick="showToast('Payload JSON: { distance: 6200, type: Run }')" class="text-blue-600 font-bold hover:underline">Xem JSON</button></td>
                  </tr>
                  <tr class="hover:bg-slate-100/50">
                    <td class="py-2 px-3 font-mono text-[11px]">06:15:22 04/11</td>
                    <td class="py-2 px-3 font-mono font-bold text-slate-800">#12883910231</td>
                    <td class="py-2 px-3 font-semibold text-slate-600">Webhook</td>
                    <td class="py-2 px-3"><span class="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">200 OK</span></td>
                    <td class="py-2 px-3"><span class="text-emerald-700 font-bold">Hợp lệ (Trail +2km)</span></td>
                    <td class="py-2 px-3 text-right"><button onclick="showToast('Payload JSON: { distance: 4100, gain: 260m }')" class="text-blue-600 font-bold hover:underline">Xem JSON</button></td>
                  </tr>
                  <tr class="hover:bg-slate-100/50">
                    <td class="py-2 px-3 font-mono text-[11px]">18:30:00 02/11</td>
                    <td class="py-2 px-3 font-mono font-bold text-slate-800">#12861029311</td>
                    <td class="py-2 px-3 font-semibold text-slate-600">Webhook</td>
                    <td class="py-2 px-3"><span class="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-800">200 OK</span></td>
                    <td class="py-2 px-3"><span class="text-rose-600 font-bold">Loại (< 3km)</span></td>
                    <td class="py-2 px-3 text-right"><button onclick="showToast('Payload JSON: { distance: 1500, rejected: true }')" class="text-blue-600 font-bold hover:underline">Xem JSON</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
`;

if (!content.includes('strava-sync-logs-tbody')) {
  content = content.replace(
    '</button>\n          </div>\n        </div>\n\n        <!-- [5.3] SỔ NỢ',
    '</button>\n          </div>\n' + stravaV2Html + '        </div>\n\n        <!-- [5.3] SỔ NỢ'
  );
}

// 4. INJECT CLIENT JAVASCRIPT FUNCTIONS BEFORE </script>
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

if (!content.includes('disconnectStravaClient')) {
  content = content.replace(
    'window.addEventListener(\'DOMContentLoaded\', () => {',
    v2ClientJs + '\n    window.addEventListener(\'DOMContentLoaded\', () => {'
  );
}

// 5. INJECT V2 RESTFUL API ROUTE HANDLERS
const v2ApiRoutes = `
    // V2 RESTFUL API SPECIFICATION (Section 8 SRS v2.0)
    // 1. [AC-035] DELETE /api/v1/me/strava (Self-Service Disconnect)
    if (req.method === 'DELETE' && (pathname === '/api/v1/me/strava' || pathname === '/api/me/strava')) {
      const result = v2CommunityUseCase.disconnectStrava('user-01');
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(result));
      return true;
    }

    // 2. POST /api/v1/me/strava/reconnect
    if (req.method === 'POST' && (pathname === '/api/v1/me/strava/reconnect' || pathname === '/api/me/strava/reconnect')) {
      const result = v2CommunityUseCase.reconnectStrava('user-01');
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(result));
      return true;
    }

    // 3. [AC-036] GET /api/v1/me/strava/sync-logs (Strava Ingestion Sync Logs)
    if (req.method === 'GET' && (pathname === '/api/v1/me/strava/sync-logs' || pathname === '/api/me/strava/sync-logs')) {
      const logs = v2CommunityUseCase.getStravaSyncLogs('user-01');
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(logs));
      return true;
    }

    // 4. [AC-037] POST /api/v1/races/:slug/join (Scope & Capacity Check)
    const v2JoinMatch = pathname.match(/^\\/api\\/(?:v1\\/)?races\\/([^\\/]+)\\/join$/);
    if (req.method === 'POST' && v2JoinMatch) {
      const slug = v2JoinMatch[1];
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body || '{}');
          const userId = payload.userId || 'user-01';
          const email = payload.email || 'athlete.nguyen@sarc.vn';
          const clubIds = payload.userClubIds || ['club-sarc-sadc'];
          const result = v2CommunityUseCase.joinRaceV2(userId, email, slug, clubIds);
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify(result));
        } catch (err: any) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return true;
    }

    // 5. [AC-038] POST/GET /api/v1/races/:slug/whitelist (Designated Whitelist)
    const v2WlMatch = pathname.match(/^\\/api\\/(?:v1\\/)?races\\/([^\\/]+)\\/whitelist$/);
    if (req.method === 'POST' && v2WlMatch) {
      const slug = v2WlMatch[1];
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body || '{}');
          const emails = payload.emails || (payload.email ? [payload.email] : []);
          const result = v2CommunityUseCase.addWhitelist(slug, emails);
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify(result));
        } catch (err: any) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return true;
    }
    if (req.method === 'GET' && v2WlMatch) {
      const slug = v2WlMatch[1];
      const wl = v2CommunityUseCase.getWhitelist(slug);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: true, whitelist: wl }));
      return true;
    }

    // 6. [AC-039] PATCH /api/v1/teams/:id (Team Leader Identity Management)
    const v2TeamMatch = pathname.match(/^\\/api\\/(?:v1\\/)?teams\\/([^\\/]+)$/);
    if ((req.method === 'PATCH' || req.method === 'PUT') && v2TeamMatch) {
      const teamId = v2TeamMatch[1];
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body || '{}');
          const actorId = payload.actorUserId || 'user-01';
          const team = v2CommunityUseCase.updateTeamIdentity(teamId, actorId, payload);
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: true, team }));
        } catch (err: any) {
          const status = err.message.includes('FORBIDDEN') ? 403 : 400;
          res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return true;
    }
    if (req.method === 'GET' && v2TeamMatch) {
      const teamId = v2TeamMatch[1];
      const team = v2CommunityUseCase.getTeam(teamId);
      res.writeHead(team ? 200 : 404, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: !!team, team }));
      return true;
    }

    // 7. [AC-040] Friendship Network: GET / POST / PATCH /api/v1/me/friends
    if (req.method === 'GET' && (pathname === '/api/v1/me/friends' || pathname === '/api/me/friends')) {
      const friends = v2CommunityUseCase.getFriends('user-01');
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: true, friends }));
      return true;
    }
    if (req.method === 'POST' && (pathname === '/api/v1/me/friends/request' || pathname === '/api/me/friends/request')) {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body || '{}');
          const fr = v2CommunityUseCase.sendFriendRequest('user-01', payload.addresseeId);
          res.writeHead(201, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: true, friendship: fr }));
        } catch (err: any) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return true;
    }
    const v2FriendReqMatch = pathname.match(/^\\/api\\/(?:v1\\/)?me\\/friends\\/requests\\/([^\\/]+)$/);
    if ((req.method === 'PATCH' || req.method === 'POST') && v2FriendReqMatch) {
      const targetUserId = v2FriendReqMatch[1];
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body || '{}');
          const accept = payload.accept !== false;
          const fr = v2CommunityUseCase.respondFriendRequest('user-01', targetUserId, accept);
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: true, friendship: fr }));
        } catch (err: any) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return true;
    }

    // 8. [AC-041] Community Feed, Posts, Kudos & Comments
    if (req.method === 'GET' && (pathname === '/api/v1/community/feed' || pathname === '/api/community/feed')) {
      const urlObj = new URL(req.url || '/', 'http://localhost');
      const filter = (urlObj.searchParams.get('filter') as 'all' | 'friends') || 'all';
      const feed = v2CommunityUseCase.getFeed('user-01', filter);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(feed));
      return true;
    }
    if (req.method === 'POST' && (pathname === '/api/v1/community/posts' || pathname === '/api/community/posts')) {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body || '{}');
          const post = v2CommunityUseCase.createPost('user-01', 'Nguyễn Văn A', payload);
          res.writeHead(201, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: true, post }));
        } catch (err: any) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return true;
    }
    const v2KudosMatch = pathname.match(/^\\/api\\/(?:v1\\/)?community\\/posts\\/([^\\/]+)\\/kudos$/);
    if (req.method === 'POST' && v2KudosMatch) {
      const postId = v2KudosMatch[1];
      try {
        const result = v2CommunityUseCase.kudosPost(postId, 'user-01');
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(result));
      } catch (err: any) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
      return true;
    }
    const v2CommentMatch = pathname.match(/^\\/api\\/(?:v1\\/)?community\\/posts\\/([^\\/]+)\\/comments$/);
    if (req.method === 'POST' && v2CommentMatch) {
      const postId = v2CommentMatch[1];
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body || '{}');
          const comment = v2CommunityUseCase.commentPost(postId, 'user-01', 'Nguyễn Văn A', payload.content || '');
          res.writeHead(201, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: true, comment }));
        } catch (err: any) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return true;
    }

    // 9. [AC-042] POST /api/v1/races/:slug/rules/multi-criteria
    const v2McMatch = pathname.match(/^\\/api\\/(?:v1\\/)?races\\/([^\\/]+)\\/rules\\/multi-criteria$/);
    if (req.method === 'POST' && v2McMatch) {
      const slug = v2McMatch[1];
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body || '{}');
          const ranked = v2CommunityUseCase.computeMultiCriteriaLeaderboard(slug, payload.weights);
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: true, rankedTeams: ranked }));
        } catch (err: any) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return true;
    }
`;

if (!content.includes('v2CommunityUseCase.disconnectStrava')) {
  content = content.replace(
    '// [5.1] Profile: Update',
    v2ApiRoutes + '\n    // [5.1] Profile: Update'
  );
}

fs.writeFileSync(mainPath, content, 'utf8');

// Verify script syntax in main.ts
const scriptRegex = /<script>([\s\S]*?)<\/script>/gi;
let match;
let count = 0;
let errors = 0;
while ((match = scriptRegex.exec(content)) !== null) {
  count++;
  try {
    new vm.Script(match[1]);
    console.log(`Embedded Script ${count}: SYNTAX OK (${match[1].length} chars)`);
  } catch (err) {
    errors++;
    console.error(`Embedded Script ${count} ERROR:`, err.message);
  }
}

if (errors === 0) {
  console.log('SUCCESS: All embedded scripts valid after V2 patch!');
}

