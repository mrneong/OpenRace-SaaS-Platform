const fs = require('fs');
const path = require('path');

// 1. Update PRD.md
const prdMdPath = path.resolve(__dirname, '../shared_context/PRD.md');
let prdMd = fs.readFileSync(prdMdPath, 'utf8');

const v2Section = `
## 6. ĐẶC TẢ CHI TIẾT CÁC TÍNH NĂNG MỚI THEO YÊU CẦU V2.0 (LOGIC REFACTORING & COMMUNITY)

### 6.1. Tự phục vụ Ngắt / Kết nối Strava & Lịch sử Truyền Dữ Liệu (Sync Logs)
- Người dùng chủ động ngắt kết nối Strava (\`DELETE /api/v1/me/strava\`). Token chuyển sang trạng thái \`revoked\`. Toàn bộ thành tích bài chạy cũ đã tính điểm trong các giải vẫn được bảo lưu nguyên vẹn để không làm vỡ điểm đội.
- Bảng nhật ký truyền dữ liệu (\`strava_sync_logs\`): Ghi nhận chi tiết từng sự kiện webhook và kéo dữ liệu: Thời gian, Mã bài Strava, Cự ly, Trạng thái Webhook (200 OK / processed / failed / ignored), kết quả thẩm định, và nút mở xem JSON Payload nguyên bản.

### 6.2. 3 Phương Án Phạm Vi Giải Đấu & Kiểm Soát Trần Số Lượng (Scope & Max Participants)
- Khi khởi tạo giải đấu (\`POST /api/v1/clubs/:slug/races\` hoặc \`POST /api/races\`), bắt buộc chọn 1 trong 3 phạm vi:
  1. \`internal\`: Chỉ hội viên chính thức của CLB tổ chức mới được đăng ký.
  2. \`community\`: Toàn thể người dùng OpenRace đều được đăng ký tự do.
  3. \`designated\`: Chỉ các VĐV nằm trong Whitelist (\`race_whitelists\`) theo Email hoặc User ID mới được đăng ký.
- Trường \`max_participants\`: Giới hạn số lượng người tối đa tham gia giải. Khi đã đủ số lượng, nút đăng ký tự động khóa và chuyển sang "Đã đủ số lượng".

### 6.3. Không Gian Quản Lý Đội Trưởng (Team Management Console)
- Đội trưởng (\`leader\`) có không gian quản lý riêng tại \`/teams/:id/ctl\`:
  - Đổi tên đội thi đấu (\`name\`).
  - Tải lên ảnh đại diện / cờ hiệu đội (\`avatar_url\`).
  - Cập nhật khẩu hiệu thi đấu (\`slogan\`).
  - Dữ liệu nhận diện đội cập nhật trực tiếp lên Bảng xếp hạng thi đấu (Leaderboard).
  - Bảng theo dõi phong độ thành viên trong đội & nút nhắc nhở chạy bù.

### 6.4. Mạng Lưới Bạn Bè & Bảng Tin Cộng Đồng (Community Social Hub)
- Mạng lưới Bạn bè 2 chiều (\`friendships\`): Gửi lời mời, Chấp nhận, Từ chối.
- Bảng tin hoạt động (\`/community\`):
  - Chế độ xem: Tab "Bạn bè" (chỉ bài chạy của bạn bè) và Tab "Cộng đồng" (toàn sàn).
  - Tương tác: Thả Kudos (Like ngọn lửa/trái tim) và Gửi bình luận dưới bài chạy.

### 6.5. Động Cơ Tính Điểm Đa Tiêu Thức (Rule Engine 2.0)
- Hỗ trợ 3 chiến lược tính điểm: \`sum_team_v1\` (truyền thống), \`avg_per_member_v1\` (bình quân đầu người), và \`multi_criteria_custom\` (đa tiêu thức tùy biến).
- Ma trận trọng số tùy biến: Cự ly ($w_1$), Chuyên cần ($w_2$), Leo dốc Trail ($w_3$), Chất lượng Pace ($w_4$) với $\\sum w_i = 100\\%$.
`;

if (!prdMd.includes('6. ĐẶC TẢ CHI TIẾT CÁC TÍNH NĂNG MỚI THEO YÊU CẦU V2.0')) {
  prdMd += '\n' + v2Section;
  fs.writeFileSync(prdMdPath, prdMd, 'utf8');
  console.log('PRD.md updated with V2 Section 6.');
}

// 2. Update PRD.json
const prdJsonPath = path.resolve(__dirname, '../shared_context/PRD.json');
let prdJson = JSON.parse(fs.readFileSync(prdJsonPath, 'utf8'));

const newAcs = [
  {
    id: "AC-035",
    module: "StravaSelfService",
    story: "Runner can self-service disconnect Strava while preserving historic race activities",
    test_target: "strava-sync.spec.ts",
    given: "Connected runner with active Strava token and historic evaluated runs",
    when: "Runner calls DELETE /api/v1/me/strava",
    then: "Strava status transitions to REVOKED, new sync is blocked, all historic runs remain credited"
  },
  {
    id: "AC-036",
    module: "StravaSyncLogs",
    story: "Runner can inspect raw webhook ingestion and sync logs",
    test_target: "strava-sync.spec.ts",
    given: "Incoming Strava webhook activities and historical pulls",
    when: "Runner requests GET /api/v1/me/strava/sync-logs",
    then: "System returns list of sync logs with http status, processing verdict, and raw payload details"
  },
  {
    id: "AC-037",
    module: "RaceScopeAndCapacity",
    story: "Race registration enforces 3 scopes (internal, community, designated) and max participants",
    test_target: "race-registration.spec.ts",
    given: "Races with different scopes and max_participants limits",
    when: "Runner registers for a race",
    then: "Internal race rejects non-club members, designated race checks whitelist, and registration auto-locks when capacity reached"
  },
  {
    id: "AC-038",
    module: "RaceWhitelist",
    story: "Race director can upload and manage athlete whitelist for designated races",
    test_target: "race-registration.spec.ts",
    given: "A designated race with scope = designated",
    when: "Admin calls POST /api/v1/races/:slug/whitelist with list of emails",
    then: "Whitelist entries are saved, and only listed emails can successfully join"
  },
  {
    id: "AC-039",
    module: "TeamLeaderManagement",
    story: "Team Captain can customize team name, avatar, and slogan with live leaderboard reflection",
    test_target: "team-leader.spec.ts",
    given: "Assigned Team Leader in a race team",
    when: "Leader calls PATCH /api/v1/teams/:id with new name, avatar_url, and slogan",
    then: "Team identity is updated and new name and avatar immediately reflect on the live arena leaderboard"
  },
  {
    id: "AC-040",
    module: "FriendshipGraph",
    story: "Athletes can send friend requests, accept, and manage 2-way friendship network",
    test_target: "community-social.spec.ts",
    given: "Two runners on the platform",
    when: "User A sends request to User B and User B accepts",
    then: "Friendship status becomes accepted and both appear in each other's friends directory"
  },
  {
    id: "AC-041",
    module: "CommunityActivitySocial",
    story: "Community feed with Friends filter, Kudos engagement, and comments",
    test_target: "community-social.spec.ts",
    given: "Published community activities",
    when: "Runner gives Kudos and adds comments",
    then: "Kudos count increments, comment is attached, and feed filters correctly between All and Friends"
  },
  {
    id: "AC-042",
    module: "MultiCriteriaRuleEngine",
    story: "Multi-Criteria Rule Engine supports customizable weights for distance, active days, gain, and pace",
    test_target: "rule-engine-v2.spec.ts",
    given: "A race configured with multi_criteria_weighted scoring strategy",
    when: "Engine computes team standings",
    then: "Normalized composite scores are calculated according to configured criteria weights sum = 100%"
  }
];

newAcs.forEach(newAc => {
  if (!prdJson.acceptance_criteria.some(ac => ac.id === newAc.id)) {
    prdJson.acceptance_criteria.push(newAc);
    console.log(`Added ${newAc.id} to PRD.json`);
  }
});

prdJson.version = "2.0.0";
fs.writeFileSync(prdJsonPath, JSON.stringify(prdJson, null, 2), 'utf8');
console.log(`PRD.json updated. Total ACs: ${prdJson.acceptance_criteria.length}`);

// 3. Create PRD_READY.flag
fs.writeFileSync(path.resolve(__dirname, '../shared_context/PRD_READY.flag'), 'PRD_READY V2', 'utf8');
console.log('PRD_READY.flag created.');

