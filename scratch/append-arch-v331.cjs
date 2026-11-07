const fs = require('fs');

const section47 = `
---

## 47. KIẾN TRÚC ỦY QUYỀN STRAVA OAUTH 2.0, REALTIME WEBHOOK & GIAO DIỆN SPORT CAM ĐỒNG BỘ MANTIS (AC-STRAVA-OAUTH-WEBHOOK-01, 02; AC-SPORT-CAM-PARITY-01, 02)

### 47.1 Bối Cảnh Kỹ Thuật & Yêu Cầu Cải Tiến
1. **Quy Trình Ủy Quyền & Kết Nối Webhook Strava Realtime**:
   - Trước đây, thao tác kết nối Strava chỉ gửi một POST đơn giản và chuyển đổi cờ dữ liệu cục bộ mà không mở hộp thoại ủy quyền phân quyền chi tiết (OAuth 2.0 Scopes Consent) hay hiển thị trạng thái bắt tay (handshake) với Webhook thời gian thực.
   - Yêu cầu mới: Khi vận động viên kết nối Strava, hệ thống mở hộp thoại Ủy quyền OAuth 2.0 chuyên nghiệp mang thương hiệu Strava (#FC4C02), cho phép cấp các quyền hạt nhân (\`read\`, \`activity:read_all\`, \`profile:read_all\`), kích hoạt chế độ lắng nghe Webhook 24/7 và nhận luồng gói tin sự kiện thời gian thực vào bảng nhật ký thô ngay tức thì.

2. **Đồng Bộ Tính Năng Toàn Diện Của Giao Diện Sport Cam Với Mantis**:
   - Trước đây, giao diện Sport Cam chỉ hiển thị một thanh icon hẹp (Slim Rail 64px) và menu trượt ẩn (drawer) gây cảm giác thiếu tính năng so với giao diện Mantis UI (vốn có sidebar cố định 260px đầy đủ 34 menu, các phân hệ trực quan và header đa chức năng).
   - Yêu cầu mới: Nâng cấp Sport Cam thành một giao diện hoàn chỉnh, sở hữu Sidebar cố định với đầy đủ 34 chức năng và 3 phân hệ lớn (Vận Động Viên, Câu Lạc Bộ, Ban Tổ Chức & Vận Hành), thiết kế theo phong cách thể thao Cam năng động (\`#FF5B26\`), thanh header đầy đủ bộ điều khiển (tìm kiếm, chuyển đổi vai trò, chuyển theme 1-chạm, thiết bị đeo, dark mode) và dashboard giàu dữ liệu tương đương Mantis.

### 47.2 Mô Hình Luồng Ủy Quyền Strava & Realtime Webhook (Sequence Diagram)
\`\`\`mermaid
sequenceDiagram
    actor Runner as Vận Động Viên / Admin
    participant UI as Màn Hình Strava Sync ([1.B])
    participant ModalAuth as Modal Ủy Quyền (#modal-strava-authorize)
    participant ClientScript as Client Router (main.ts)
    participant Backend as NestJS API / Webhook Engine
    participant Store as InMemoryDataStore & Event Bus

    Runner->>UI: Nhấp [⚡ Kết Nối Lại Strava] hoặc [Cấp Quyền OAuth]
    UI->>ModalAuth: Mở #modal-strava-authorize
    ModalAuth-->>Runner: Hiển thị 3 phạm vi quyền (read, activity:read_all, profile:read_all) & công tắc Webhook 24/7
    Runner->>ModalAuth: Chọn cấp quyền & Nhấp [⚡ Xác Nhận Ủy Quyền & Kích Hoạt Webhook]
    ModalAuth->>ClientScript: authorizeStravaWithWebhook(scopes, webhookActive)
    ClientScript->>Backend: POST /api/me/strava/authorize
    Backend->>Store: Cập nhật status ACTIVE, scopes, webhookConnected: true
    Backend->>Backend: Kích hoạt Webhook Subscription Handshake & Tạo gói tin realtime
    Backend-->>ClientScript: HTTP 200 { success: true, status: 'ACTIVE', webhookPacket: {...} }
    ClientScript->>UI: Cập nhật Badge "🟢 ĐÃ KẾT NỐI (ACTIVE)" & "⚡ TỰ ĐỘNG WEBHOOK 24/7"
    ClientScript->>UI: Chèn tức thì gói tin Webhook mới vào đầu bảng "NHẬT KÝ TIẾP NHẬN WEBHOOK STRAVA THÔ"
    ClientScript-->>Runner: Toast: "✓ Đã cấp quyền OAuth 2.0 & kích hoạt lắng nghe Webhook Realtime 24/7!"
\`\`\`

### 47.3 Kiến Trúc Đồng Bộ Hai Giao Diện: Mantis Material UI vs Sport Cam
\`\`\`mermaid
flowchart TD
    AppThemeSwitch["Bộ Chuyển Đổi Giao Diện (Dual Theme Switcher Pill)"] -->|Chọn Mantis UI| MantisTheme["💎 Mantis Material UI<br>• Tông màu: Xanh dương (#1890FF) / Nền xám nhạt (#F4F5F7)<br>• Sidebar: #mantis-sidebar cố định 260px<br>• Header: #mantis-header với tìm kiếm & công cụ chuẩn doanh nghiệp<br>• Dashboard: #mantis-dashboard-view phong cách blueprint"]
    AppThemeSwitch -->|Chọn Sport Cam| SportTheme["⚡ Sport Cam Action UI<br>• Tông màu: Cam thể thao (#FF5B26) / Dark slate thể thao<br>• Sidebar: #sport-docked-sidebar cố định 260px với 34 menu<br>• Header: #openrace-header đầy đủ tính năng đồng bộ Mantis<br>• Dashboard: #openrace-dashboard-view giàu widget thể thao"]
\`\`\`

### 47.4 Chi Tiết Cấu Hình & Endpoint Bổ Sung
1. **API Endpoints**:
   - \`POST /api/me/strava/authorize\`: Tiếp nhận payload \`{ scopes: string[], webhookRealtime: boolean, athleteId?: string }\`, kích hoạt trạng thái kết nối, cập nhật nhật ký webhook và trả về gói tin realtime vừa tiếp nhận.
   - \`POST /api/me/strava/simulate-webhook\`: Cho phép thử nghiệm bắn trực tiếp một gói tin Webhook thô từ Strava về hệ thống theo chuẩn RFC webhook của Strava (object_type: 'activity', aspect_type: 'create').
2. **Giao Diện Sport Cam Hoàn Chỉnh**:
   - \`#sport-docked-sidebar\`: Sidebar hiển thị cố định khi ở theme \`sport\`, chứa toàn bộ 3 nhóm phân hệ:
     - Nhóm I: Phân hệ Vận Động Viên (10 menu)
     - Nhóm II: Phân hệ Câu Lạc Bộ (4 menu)
     - Nhóm III: Phân hệ Ban Tổ Chức & Vận Hành (8 menu)
   - Bộ lọc phân quyền vai trò (\`role-based navigation\`) hoạt động nhất quán giữa cả hai giao diện Mantis và Sport Cam.
`;

fs.appendFileSync('shared_context/ARCHITECTURE.md', section47, 'utf8');
console.log('ARCHITECTURE.md Section 47 appended successfully');

