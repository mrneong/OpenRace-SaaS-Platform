const fs = require('fs');

const section48 = `

---

## 48. Kiến Trúc Quản Trị User, Đăng Ký Thành Viên, Google OAuth & Luồng Onboarding 3 Bước (v3.32.0-PROD)

### 48.1 Bối Cảnh & Mục Tiêu Kỹ Thuật
Để đáp ứng yêu cầu nâng cấp hệ sinh thái người dùng toàn diện, phiên bản v3.32.0-PROD triển khai:
1. **Đăng Ký & Xác Thực Đa Kênh (Multi-Provider Authentication)**:
   - Hỗ trợ đăng ký thành viên mới cục bộ qua biểu mẫu email, họ tên, mật khẩu, số điện thoại, giới tính.
   - Tích hợp chuẩn đăng nhập 1-chạm Google OAuth 2.0 (Google Identity Services) với nhận diện thương hiệu chuẩn Google.
2. **Luồng Onboarding Hoàn Thiện Hồ Sơ 3 Bước (#modal-member-onboarding)**:
   - **Bước 1 (Hồ sơ thể thao)**: Cỡ áo đấu CLB (S/M/L/XL/XXL), Cự ly sở trường (5k/10k/21k/42k/70k+), Pace trung bình, Liên hệ khẩn cấp.
   - **Bước 2 (Gia nhập CLB & Chọn Đội)**: Chọn CLB uy tín (SARC, HRC, Đà Nẵng Runners, Sài Gòn Trail), chọn Đội thi đấu (Phoenix, Tigers, Eagles, Đội Rồng), đồng bộ ngay vào Header Switcher.
   - **Bước 3 (Tham gia Giải Chạy Mở)**: Đăng ký tham gia giải đang mở, tự động cấp số BIB điện tử (BIB-205...), đồng bộ vào Hub Giải Đấu Của Tôi (\`my-races\`).
3. **Màn Hình Quản Trị User Toàn Diện (#view-admin-users)**:
   - Bảng danh sách toàn bộ VĐV và thành viên mới.
   - Cột hiển thị: Avatar & Tên, Phương thức đăng nhập (Google/Local), Hồ sơ thể thao, CLB & Đội, Giải đã tham gia, Trạng thái (Hoạt động/Khóa).
   - Bộ lọc theo vai trò, tìm kiếm theo từ khóa và thao tác 1-chạm Khóa/Mở khóa.

---

### 48.2 Sequence Diagram: Luồng Đăng Ký, Google OAuth, Onboarding & Tham Gia Giải
\`\`\`mermaid
sequenceDiagram
    autonumber
    actor User as Người Dùng / VĐV Mới
    participant UI as Giao Diện OpenRace (Header / Modal Auth)
    participant AuthEngine as Bộ Xử Lý Xác Thực (Auth Engine)
    participant Store as InMemoryDataStore (SystemUsers & Clubs)
    participant Onboarding as Modal Onboarding 3 Bước

    User->>UI: Nhấp [👤 Đăng Ký / Đăng Nhập] hoặc [Tiếp tục với Google]
    alt Đăng ký Email/Mật khẩu
        UI->>AuthEngine: POST /api/auth/register { fullName, email, password, phone }
        AuthEngine->>Store: createSystemUser(data, provider='LOCAL')
    else Đăng nhập Google 1-chạm
        UI->>AuthEngine: POST /api/auth/google { googleToken, email, name, picture }
        AuthEngine->>Store: upsertSystemUser(googleProfile, provider='GOOGLE')
    end
    AuthEngine-->>UI: Cấp Session Token & User Profile { needOnboarding: true }
    UI->>Onboarding: Mở #modal-member-onboarding (Bước 1: Hồ Sơ Thể Thao)
    
    User->>Onboarding: Nhập cỡ áo, cự ly sở trường, pace & Lưu bước 1
    Onboarding->>AuthEngine: POST /api/me/profile/onboarding
    AuthEngine->>Store: Cập nhật thông số thể thao vào profile VĐV
    
    Onboarding-->>User: Chuyển sang Bước 2: Chọn CLB & Đội
    User->>Onboarding: Chọn CLB SARC Running Club & Team Phoenix SARC
    Onboarding->>AuthEngine: POST /api/me/clubs/enroll { clubId, teamId }
    AuthEngine->>Store: Ghi nhận thành viên CLB & tăng countBadge
    AuthEngine-->>UI: Cập nhật Header Club Switcher: "4 CLB"
    
    Onboarding-->>User: Chuyển sang Bước 3: Đăng Ký Giải Chạy
    User->>Onboarding: Chọn Giải Mùa 10 Run to Techcombank & [⚡ Tham Gia Giải Ngay]
    Onboarding->>AuthEngine: POST /api/me/races/enroll { raceId }
    AuthEngine->>Store: Ghi danh VĐV vào giải & Cấp số BIB-205
    AuthEngine-->>UI: Đồng bộ Hub Giải Đấu Của Tôi (my-races)
    
    Onboarding-->>UI: Đóng modal, hiển thị Toast chào mừng VĐV gia nhập hệ sinh thái!
\`\`\`

---

### 48.3 Sơ Đồ Cấu Trúc Thành Phần Giao Diện
\`\`\`mermaid
flowchart TD
    HeaderAuth["Thanh Header OpenRace"] --> AuthGatewayBtn["Nút [👤 Đăng Ký / Đăng Nhập]"]
    AuthGatewayBtn --> AuthModal["Modal Xác Thực #modal-auth-gateway"]
    
    AuthModal --> TabRegister["Tab 1: Đăng Ký Mới (Form Họ tên, Email, Mật khẩu, SĐT)"]
    AuthModal --> TabLogin["Tab 2: Đăng Nhập Truyền Thống"]
    AuthModal --> GoogleBtn["Nút Đăng Nhập Google Chuẩn (#btn-google-auth-trigger)"]
    
    TabRegister --> OnboardingFlow["Luồng Onboarding #modal-member-onboarding"]
    GoogleBtn --> OnboardingFlow
    
    OnboardingFlow --> Step1["Bước 1: Hồ Sơ VĐV & Cỡ Áo Đấu"]
    OnboardingFlow --> Step2["Bước 2: Chọn Gia Nhập CLB & Đội Đua"]
    OnboardingFlow --> Step3["Bước 3: Đăng Ký Giải Chạy & Cấp BIB"]
    
    Step3 --> AdminUsersView["Màn Hình Quản Trị User Toàn Nền Tảng (#view-admin-users)"]
\`\`\`

---

### 48.4 Hợp Đồng Dữ Liệu REST API (Endpoint Contracts)

1. **\`POST /api/auth/register\`**:
   - **Request**:
     \`\`\`json
     {
       "username": "athlete.test",
       "fullName": "Lê Văn Cường",
       "email": "cuong.le@example.com",
       "password": "SecretPassword123",
       "phone": "0918889999",
       "gender": "male",
       "birthDate": "1995-05-15"
     }
     \`\`\`
   - **Response (201 Created)**:
     \`\`\`json
     {
       "success": true,
       "userId": "user-cuong-le",
       "token": "jwt-token-session-example",
       "user": {
         "id": "user-cuong-le",
         "fullName": "Lê Văn Cường",
         "email": "cuong.le@example.com",
         "roleId": "runner",
         "roleName": "Vận Động Viên",
         "authProvider": "LOCAL",
         "needOnboarding": true
       }
     }
     \`\`\`

2. **\`POST /api/auth/google\`**:
   - **Request**:
     \`\`\`json
     {
       "googleEmail": "athlete.google@gmail.com",
       "googleName": "Nguyễn Hoàng Nam (Google)",
       "googlePicture": "https://lh3.googleusercontent.com/a/sample-avatar"
     }
     \`\`\`
   - **Response (200 OK / 201 Created)**:
     \`\`\`json
     {
       "success": true,
       "authProvider": "GOOGLE",
       "userId": "user-google-athlete",
       "token": "jwt-google-session-example",
       "user": {
         "id": "user-google-athlete",
         "fullName": "Nguyễn Hoàng Nam (Google)",
         "email": "athlete.google@gmail.com",
         "roleId": "runner",
         "roleName": "Vận Động Viên",
         "authProvider": "GOOGLE",
         "avatarUrl": "https://lh3.googleusercontent.com/a/sample-avatar",
         "needOnboarding": true
       }
     }
     \`\`\`

3. **\`POST /api/me/profile/onboarding\`**:
   - **Request**:
     \`\`\`json
     {
       "userId": "user-01",
       "shirtSize": "L",
       "targetDistance": "21km Half Marathon",
       "avgPace": "5:15",
       "emergencyContact": "Trần Thị Mai - 0987654321"
     }
     \`\`\`
   - **Response (200 OK)**:
     \`\`\`json
     {
       "success": true,
       "message": "Đã lưu hồ sơ vận động viên thành công",
       "profile": { ... }
     }
     \`\`\`

4. **\`POST /api/me/clubs/enroll\`**:
   - **Request**:
     \`\`\`json
     {
       "userId": "user-01",
       "clubId": "club-sarc",
       "clubName": "CLB SARC Running Club",
       "teamId": "team-phoenix",
       "teamName": "Team Phoenix SARC"
     }
     \`\`\`
   - **Response (200 OK)**:
     \`\`\`json
     {
       "success": true,
       "enrolledClub": "club-sarc",
       "totalEnrolledClubs": 4
     }
     \`\`\`

5. **\`POST /api/me/races/enroll\`**:
   - **Request**:
     \`\`\`json
     {
       "userId": "user-01",
       "raceId": "race-season-10",
       "raceName": "MÙA 10 RUN TO TECHCOMBANK 2026 — SADC/SARC",
       "category": "21km Bán Marathon"
     }
     \`\`\`
   - **Response (200 OK)**:
     \`\`\`json
     {
       "success": true,
       "raceId": "race-season-10",
       "assignedBib": "BIB-205",
       "status": "ENROLLED"
     }
     \`\`\`

6. **\`GET /api/admin/users\`**:
   - **Response (200 OK)**: Trả về danh sách toàn bộ người dùng, bao gồm thông tin chi tiết:
     - ID, Họ tên, Email, SĐT
     - Auth Provider: GOOGLE / LOCAL
     - Hồ sơ VĐV: Cỡ áo đấu, cự ly sở trường, pace
     - CLB & Đội tham gia
     - Danh sách giải chạy đã đăng ký & số BIB
     - Trạng thái tài khoản: ACTIVE / DEACTIVATED
`;

fs.appendFileSync('shared_context/ARCHITECTURE.md', section48, 'utf8');
console.log('Successfully appended Section 48 to ARCHITECTURE.md!');

