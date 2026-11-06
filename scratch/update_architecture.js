const fs = require('fs');
const path = require('path');

// 1. Update FACTORY_STATE.json
fs.writeFileSync(
  path.resolve(__dirname, '../shared_context/FACTORY_STATE.json'),
  JSON.stringify({
    current_phase: "ARCH_PHASE",
    active_role: "02_SYSTEM_ARCHITECT",
    task: "Design V2 database schema extensions, 6 dedicated consoles, and RESTful API contracts",
    retry_count: 0,
    max_retries: 3,
    status: "RUNNING",
    timestamp: new Date().toISOString()
  }, null, 2),
  'utf8'
);

// 2. Append Section 6 to ARCHITECTURE.md
const archPath = path.resolve(__dirname, '../shared_context/ARCHITECTURE.md');
let archContent = fs.readFileSync(archPath, 'utf8');

const v2ArchSection = `
## 6. KIẾN TRÚC MỞ RỘNG V2.0 (COMMUNITY ARCHITECTURE & 6 DEDICATED CONSOLES)

### 6.1. DDL Mở Rộng Cơ Sở Dữ Liệu (PostgreSQL 16 / Supabase)

\`\`\`sql
-- 1. Bổ sung trường scope và max_participants cho bảng races
ALTER TABLE races ADD COLUMN IF NOT EXISTS scope VARCHAR(20) NOT NULL DEFAULT 'internal'
  CHECK (scope IN ('internal', 'community', 'designated'));
ALTER TABLE races ADD COLUMN IF NOT EXISTS max_participants INTEGER NULL CHECK (max_participants > 0);

-- 2. Bổ sung nhận diện thương hiệu cho bảng teams (Quyền Đội trưởng)
ALTER TABLE teams ADD COLUMN IF NOT EXISTS avatar_url TEXT NULL;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS slogan VARCHAR(255) NULL;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES users(id);

-- 3. Bảng danh sách chỉ định tham gia giải (Whitelist)
CREATE TABLE IF NOT EXISTS race_whitelists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    race_id UUID NOT NULL REFERENCES races(id) ON DELETE CASCADE,
    email VARCHAR(255) NULL,
    user_id UUID NULL REFERENCES users(id) ON DELETE SET NULL,
    note VARCHAR(255) NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_race_whitelist UNIQUE(race_id, email)
);
CREATE INDEX IF NOT EXISTS idx_race_whitelist_lookup ON race_whitelists(race_id, email, user_id);

-- 4. Bảng nhật ký truyền dữ liệu từ Strava (Ingestion & Sync Logs)
CREATE TABLE IF NOT EXISTS strava_sync_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sync_source VARCHAR(20) NOT NULL CHECK (sync_source IN ('webhook', 'manual_resync', 'historical_pull')),
    strava_activity_id BIGINT NULL,
    http_status_code INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('received', 'processed', 'ignored', 'failed')),
    error_message TEXT NULL,
    raw_event_payload JSONB NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_sync_logs_user_date ON strava_sync_logs(user_id, created_at DESC);

-- 5. Mạng lưới Bạn bè 2 chiều (Friendship Graph)
CREATE TABLE IF NOT EXISTS friendships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    addressee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_friendship_pair UNIQUE (requester_id, addressee_id)
);
CREATE INDEX IF NOT EXISTS idx_friendship_users ON friendships(requester_id, addressee_id, status);

-- 6. Bảng tin hoạt động Cộng đồng (Community Posts, Kudos, Comments)
CREATE TABLE IF NOT EXISTS community_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_id UUID NULL REFERENCES activities(id) ON DELETE SET NULL,
    race_id UUID NULL REFERENCES races(id) ON DELETE SET NULL,
    caption TEXT NULL,
    media_urls TEXT[] NULL,
    kudos_count INTEGER NOT NULL DEFAULT 0,
    comment_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS post_kudos (
    post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, user_id)
);

CREATE TABLE IF NOT EXISTS post_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

### 6.2. Hợp Đồng API RESTful V2.0

| Nhóm chức năng | Phương thức & Tuyến đường | Mô tả & Ràng buộc bảo mật |
| :--- | :--- | :--- |
| **Cá nhân & Strava** | \`DELETE /api/v1/me/strava\` | Hủy kết nối Strava tự phục vụ (chuyển token sang revoked, bảo lưu thành tích cũ) |
| **Nhật ký đồng bộ** | \`GET /api/v1/me/strava/sync-logs\` | Tra cứu nhật ký truyền dữ liệu webhook và kết quả thẩm định |
| **Phạm vi giải đấu** | \`POST /api/v1/races/:slug/join\` | Đăng ký tham gia giải (Kiểm tra 3 scope: internal, community, designated & max_participants) |
| **Chỉ định Whitelist** | \`POST /api/v1/races/:slug/whitelist\` | Tải danh sách email/user_id được phép tham gia giải chỉ định |
| **Quản lý Đội trưởng**| \`PATCH /api/v1/teams/:id\` | Đội trưởng đổi tên đội, tải lên avatar đội và khẩu hiệu |
| **Mạng lưới Bạn bè** | \`GET /api/v1/me/friends\` | Danh sách bạn bè hiện tại (quan hệ 2 chiều) |
| **Lời mời kết bạn** | \`POST /api/v1/me/friends/request\` | Gửi lời mời kết bạn |
| **Xử lý kết bạn** | \`PATCH /api/v1/me/friends/requests/:id\` | Chấp nhận hoặc từ chối lời mời kết bạn |
| **Bảng tin cộng đồng**| \`GET /api/v1/community/feed\` | Bảng tin hoạt động (Bộ lọc: Tất cả / Bạn bè) |
| **Tương tác xã hội** | \`POST /api/v1/community/posts/:id/kudos\` | Thả Kudos (Like) khích lệ |
| **Bình luận bài viết** | \`POST /api/v1/community/posts/:id/comments\` | Gửi bình luận trao đổi |
| **Quy chế đa tiêu thức** | \`POST /api/v1/races/:slug/rules/scoring\` | Cấu hình tỷ trọng điểm: Cự ly, Chuyên cần, Độ dốc Trail, Chất lượng Pace |

### 6.3. Kiến Trúc 6 Bộ Công Cụ Quản Trị Chuyên Biệt (Dedicated Consoles)
- \`[1.0] Personal Hub (/me)\`: Trung tâm cá nhân hóa, tự hủy/nối Strava, tra cứu Sync Logs.
- \`[2.0] Team Management Console (/teams/:id/ctl)\`: Không gian đội trưởng quản lý nhận diện đội và phong độ.
- \`[3.0] Race Operations Console (/races/:slug/ctl)\`: Thiết lập 3 scope, Whitelist, chia đội, Rule Engine đa tiêu thức.
- \`[4.0] Club Management Hub (/clubs/:slug/ctl)\`: Quản lý hội viên, hồ sơ CLB, VietQR ngân hàng.
- \`[5.0] Community Hub (/community)\`: Bảng tin hoạt động, mạng lưới bạn bè, Kudos và bình luận.
- \`[6.0] Super Admin Portal (/admin)\`: Giám sát Token Bucket Governor Strava, Ingestion DLQ, Quản trị Tenants.
`;

if (!archContent.includes('6. KIẾN TRÚC MỞ RỘNG V2.0')) {
  archContent += '\n' + v2ArchSection;
  fs.writeFileSync(archPath, archContent, 'utf8');
  console.log('ARCHITECTURE.md updated with V2 Section 6.');
}

// 3. Create ARCH_READY.flag
fs.writeFileSync(path.resolve(__dirname, '../shared_context/ARCH_READY.flag'), 'ARCH_READY V2', 'utf8');
console.log('ARCH_READY.flag created.');

