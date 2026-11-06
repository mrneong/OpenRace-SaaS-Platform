# TÀI LIỆU PHÂN TÍCH, THIẾT KẾ HỆ THỐNG VÀ ĐẶC TẢ GIAO DIỆN (SRS & SDS)

## OpenRace SaaS Platform — Nền tảng Quản lý Giải chạy Trực tuyến, Đa Câu lạc bộ & Mạng xã hội Cộng đồng Chạy bộ

**Phiên bản:** 2.0 (Major Logic Refactoring & Community Architecture)  
**Ngày ban hành:** 05/11/2026  
**Căn cứ:** Bộ yêu cầu nghiệp vụ chuẩn hóa OpenRace 2.0, Thể lệ Mùa 10 Run to Techcombank, SDS v1.2/v1.3  
**Chuẩn công nghệ:** React 19 / Next.js (App Router), Tailwind CSS v4, Shadcn/ui, NestJS, PostgreSQL 16 (RLS), Redis, BullMQ

---

# MỤC LỤC TỔNG THỂ

1. [TỔNG QUAN HỆ THỐNG & CÁC THAY ĐỔI LOGIC CỐT LÕI (V2.0)](#1-tổng-quan-hệ-thống--các-thay-đổi-logic-cốt-lõi-v20)
   * 1.1. Mục tiêu và Định vị hệ thống
   * 1.2. Ma trận thay đổi logic nghiệp vụ cốt lõi (Version 2.0)
   * 1.3. Bảng thuật ngữ chuyên ngành (Glossary)
2. [MA TRẬN PHÂN QUYỀN (RBAC) & 6 BỘ CÔNG CỤ QUẢN LÝ RIÊNG BIỆT](#2-ma-trận-phân-quyền-rbac--6-bộ-công-cụ-quản-lý-riêng-biệt)
   * 2.1. Phân quyền theo ngữ cảnh thực thể (Contextual RBAC)
   * 2.2. Đặc tả 6 bộ công cụ quản lý chuyên biệt (Dedicated Management Portals)
3. [CẤU TRÚC CÂY MENU ĐIỀU HƯỚNG TOÀN DIỆN (TAXONOMY V2.0)](#3-cấu-trúc-cây-menu-điều-hướng-toàn-diện-taxonomy-v20)
   * 3.1. Phân hệ Vận động viên & Cộng đồng (Runner & Community App)
   * 3.2. Phân hệ Đội trưởng (Team Management Space)
   * 3.3. Phân hệ Quản trị CLB & Giải đấu (Club Admin & Race Operations)
   * 3.4. Phân hệ Quản trị Nền tảng Toàn sàn (Super Admin Portal)
4. [ĐẶC TẢ CHI TIẾT CÁC PHÂN HỆ NGHIỆP VỤ MỚI](#4-đặc-tả-chi-tiết-các-phân-hệ-nghiệp-vụ-mới)
   * 4.1. Phân hệ Cá nhân & Đồng bộ Strava (Self-Service & Sync Logs)
   * 4.2. Phân hệ Tham gia Đa CLB & Giải đấu (3 phương án phạm vi giải)
   * 4.3. Phân hệ Đội thi đấu & Quyền năng Đội trưởng
   * 4.4. Phân hệ Cộng đồng Chạy bộ, Kết nối & Mạng lưới Bạn bè
5. [RULE ENGINE 2.0: ĐỘNG CƠ TÍNH ĐIỂM & QUY ĐỔI ĐA TIÊU THỨC](#5-rule-engine-20-động-cơ-tính-điểm--quy-đổi-đa-tiêu-thức)
   * 5.1. Mô hình tham số hóa bộ tiêu thức tính điểm
   * 5.2. Các chiến lược chấm điểm (Scoring Strategies)
   * 5.3. Pipeline thẩm định 6 bước và Sàn Pace chống gian lận
6. [THIẾT KẾ CƠ SỞ DỮ LIỆU & RLS (POSTGRESQL 16)](#6-thiết-kế-cơ-sở-dữ-liệu--rls-postgresql-16)
   * 6.1. Sơ đồ quan hệ thực thể mở rộng (ERD Specification)
   * 6.2. Chi tiết các bảng dữ liệu mới & Cập nhật
   * 6.3. Chính sách bảo mật hàng (Row-Level Security)
7. [TÍCH HỢP STRAVA, WEBHOOK & ĐIỀU TIẾT HẠN MỨC (RATE LIMITS)](#7-tích-hợp-strava-webhook--điều-tiết-hạn-mức-rate-limits)
   * 7.1. Quản lý OAuth 2.0, Lịch sử đồng bộ & Khóa phân tán
   * 7.2. Webhook Ingestion & Token-Bucket Governor
8. [RESTFUL API SPECIFICATION (V2.0)](#8-restful-api-specification-v20)
   * 8.1. Endpoints Cá nhân, Strava & Bạn bè
   * 8.2. Endpoints Đội thi đấu & Quản lý Đội trưởng
   * 8.3. Endpoints Giải đấu & Whitelist
   * 8.4. Endpoints Bảng tin Cộng đồng & Tương tác
9. [DANH SÁCH USER STORIES CHI TIẾT (INVEST & GHERKIN CRITERIA)](#9-danh-sách-user-stories-chi-tiết-invest--gherkin-criteria)
   * Module US-A: Cá nhân, Strava Sync & Lịch sử
   * Module US-B: Phạm vi giải đấu & Ghi danh có điều kiện
   * Module US-C: Đội thi đấu & Quyền Đội trưởng
   * Module US-D: Cộng đồng, Bạn bè & Tương tác xã hội
   * Module US-E: Bộ điều hành thể lệ đa tiêu thức
10. [LỘ TRÌNH TRIỂN KHAI & QUẢN TRỊ RỦI RO](#10-lộ-trình-triển-khai--quản-trị-rủi-ro)

---

# 1. TỔNG QUAN HỆ THỐNG & CÁC THAY ĐỔI LOGIC CỐT LÕI (V2.0)

### 1.1. Mục tiêu và Định vị hệ thống
**OpenRace SaaS Platform (v2.0)** là nền tảng quản lý giải chạy bộ trực tuyến đa câu lạc bộ kết hợp mạng xã hội thể thao chuyên biệt. Hệ thống vừa phục vụ nhu cầu thi đấu nội bộ khép kín của các doanh nghiệp, câu lạc bộ chạy (Running Clubs), vừa đóng vai trò là sân chơi cộng đồng mở rộng, giúp các cá nhân giao lưu, kết bạn, theo dõi hoạt động và tranh tài ở các giải phong trào mở rộng.

### 1.2. Ma trận thay đổi logic nghiệp vụ cốt lõi (Version 2.0)

| Nghiệp vụ | Phiên bản cũ (v1.2) | Phiên bản mới (v2.0 Logic Refactoring) |
| :--- | :--- | :--- |
| **Hồ sơ Cá nhân & Strava** | Kết nối cố định, không xem được lịch sử gói tin từ Strava. | **Cá nhân tự do thiết lập hồ sơ, chủ động kết nối / hủy kết nối Strava bất kỳ lúc nào; có trang tra cứu lịch sử truyền dữ liệu (sync logs), kiểm tra chi tiết từng payload và trạng thái thẩm định.** |
| **Quan hệ Cá nhân & CLB** | Liên kết tĩnh, hạn chế chuyển đổi giữa các CLB. | **1 cá nhân được tham gia nhiều CLB đồng thời (`users 1──N club_members`). Có thể là hội viên CLB A, quản trị viên CLB B.** |
| **Điều kiện tham gia Giải** | Mở tự do qua link/QR, không phân biệt loại giải. | **1 cá nhân chỉ được tham gia giải do CLB mình tham gia tổ chức, HOẶC giải do CLB khác tổ chức nếu giải đó mở chế độ Cộng đồng hoặc cá nhân đó nằm trong Whitelist.** |
| **Phạm vi Giải đấu** | Mặc định giải nội bộ của CLB. | **Mỗi giải đấu bắt buộc chọn 1 trong 3 phương án phạm vi:**<br>1. `internal` (Nội bộ CLB)<br>2. `community` (Cộng đồng toàn sàn)<br>3. `designated` (Chỉ định đích danh qua Whitelist email/user_id). |
| **Giới hạn số lượng VĐV** | Không quy định trần số lượng vận động viên. | **Bổ sung trường `max_participants` (Số lượng người tối đa tham gia giải). Đạt trần sẽ tự động khóa ghi danh.** |
| **Tổ chức Đội thi đấu** | Admin gán hoặc VĐV tự chọn theo cấu hình chung. | **Quản trị CLB toàn quyền chia đội ban đầu. Đội trưởng (Team Leader) có quyền quản lý riêng: đổi tên đội, cập nhật ảnh đại diện đội (avatar), khẩu hiệu.** |
| **Động cơ Chấm điểm** | Cố định 2 công thức: Tổng điểm hoặc Bình quân. | **Động cơ tính điểm đa tiêu thức (Multi-Criteria Rule Engine): Cho phép CLB tự do lựa chọn và kết hợp nhiều tiêu chí: Cự ly, Pace, Độ cao tích lũy (Gain), Chuyên cần, Đóng góp đồng đội với hệ số quy đổi điểm tùy biến.** |
| **Tính năng Mạng xã hội** | Không có (chỉ có bảng xếp hạng giải). | **Bổ sung phân hệ "Cộng đồng chạy bộ": Bảng tin (Feed), kết nối Bạn bè (Friendship), theo dõi hoạt động (Follow/Activity), tương tác thả tim (Kudos) và bình luận.** |
| **Công cụ Quản trị** | Gộp chung trong màn hình giải đấu. | **Phân tách thành 6 bộ công cụ quản trị độc lập:**<br>1. Quản lý Cá nhân<br>2. Quản lý Đội thi đấu<br>3. Quản lý Giải đấu<br>4. Quản lý CLB<br>5. Quản lý Cộng đồng<br>6. Quản trị Toàn sàn (Admin). |

### 1.3. Bảng thuật ngữ chuyên ngành (Glossary)
* **Scope (Phạm vi giải):** Ranh giới tiếp cận giải đấu, gồm `internal` (nội bộ hội viên CLB), `community` (toàn thể người dùng OpenRace) và `designated` (chỉ định danh sách người tham gia).
* **Sync Log (Nhật ký đồng bộ):** Bản ghi vết kỹ thuật ghi nhận từng gói webhook hoặc yêu cầu kéo dữ liệu từ Strava về CSDL OpenRace, lưu vết mã phản hồi, số bài tập đồng bộ và lỗi phát sinh.
* **Whitelist / Designated List:** Danh sách vận động viên cụ thể được ban tổ chức cấp quyền tham gia giải đấu chỉ định thông qua Email hoặc User ID.
* **Friendship Graph:** Đồ thị quan hệ bạn bè 2 chiều (gửi lời mời $\rightarrow$ chấp thuận) hoặc theo dõi 1 chiều giữa các cá nhân trong cộng đồng.

---

# 2. MA TRẬN PHÂN QUYỀN (RBAC) & 6 BỘ CÔNG CỤ QUẢN LÝ RIÊNG BIỆT

### 2.1. Phân quyền theo ngữ cảnh thực thể (Contextual RBAC)

Quyền hạn trong hệ thống được xác định linh hoạt dựa trên bối cảnh:

```
[User Account]
   ├── Club Membership (club_members.role) ────────> Club Admin | Club Member
   ├── Race Participation (race_participants.role) ─> Race Director | Team Leader | Runner
   ├── Friendship / Social Graph ──────────────────> Friend | Follower | Blocked
   └── Platform Role (users.system_role) ──────────> Super Admin | Regular User
```

| Quyền hạn / Thao tác | Super Admin | Club Admin | Team Leader | Runner / Member |
| :--- | :---: | :---: | :---: | :---: |
| Quản trị hệ thống toàn sàn, xem quota Strava, khóa CLB | **✔** | — | — | — |
| Tạo CLB, tạo Giải đấu, cấu hình Rule Set, chia đội ban đầu | — | **✔** | — | — |
| Thiết lập phạm vi giải (Nội bộ / Cộng đồng / Chỉ định) | — | **✔** | — | — |
| Đổi tên đội, đổi ảnh đại diện đội, duyệt thành viên vào đội | — | **✔** | **✔** | — |
| Quản lý hồ sơ cá nhân, hủy/kết nối Strava, xem sync log | **✔** | **✔** | **✔** | **✔** |
| Đăng bài cộng đồng, bình luận, kết bạn, thả kudos | **✔** | **✔** | **✔** | **✔** |
| Ghi danh giải đấu (phù hợp điều kiện phạm vi giải) | — | **✔** | **✔** | **✔** |

### 2.2. Đặc tả 6 bộ công cụ quản lý chuyên biệt (Dedicated Management Portals)

Hệ thống cung cấp 6 bộ công cụ (Console/Workspace) phục vụ chuyên sâu cho từng nhóm đối tượng:

```
+───────────────────────────────────────────────────────────────────────────────────+
| HỆ THỐNG 6 BỘ CÔNG CỤ QUẢN LÝ CHUYÊN BIỆT (DEDICATED CONSOLES)                   |
+-----------------------------------------------------------------------------------+
| 1. WORKSPACE CÁ NHÂN (Runner Personal Hub) ........................... Path: /me  |
|    - Cập nhật thông tin cá nhân, avatar, tiểu sử, chỉ số thể lực cá nhân.         |
|    - Trung tâm kết nối Strava: Nút ngắt kết nối/kết nối lại tức thì.              |
|    - Trình xem nhật ký truyền dữ liệu từ Strava (Strava Ingestion Sync Logs).     |
|    - Quản lý danh sách các CLB đang sinh hoạt và giải đấu đang tham gia.          |
+-----------------------------------------------------------------------------------+
| 2. WORKSPACE ĐỘI THI ĐẤU (Team Management Console) ......... Path: /teams/{id}/ctl|
|    - Dành riêng cho Đội trưởng (Team Leader) và Quản trị CLB.                     |
|    - Chỉnh sửa nhận diện đội: Đổi tên đội thi đấu, tải lên Avatar / Cờ hiệu đội. |
|    - Bảng phân tích phong độ thành viên: cự ly đóng góp, số ngày hoàn thành.     |
|    - Công cụ phân bổ chỉ tiêu nội bộ đội và hối thúc thành viên chạy bù.          |
+-----------------------------------------------------------------------------------+
| 3. WORKSPACE GIẢI THI ĐẤU (Race Operations Console) ...... Path: /races/{slug}/ctl |
|    - Dành cho Trưởng ban tổ chức giải đấu.                                        |
|    - Cấu hình thông tin giải: Tên, thời gian bắt đầu/kết thúc, số lượng tối đa.  |
|    - Cài đặt phạm vi: [1] Nội bộ CLB, [2] Cộng đồng mở, [3] Chỉ định Whitelist.   |
|    - Quản lý phân chia đội thi đấu và gán Đội trưởng.                             |
|    - Trình điều hành Rule Engine đa tiêu thức & Chạy mô phỏng tính điểm.          |
+-----------------------------------------------------------------------------------+
| 4. WORKSPACE CÂU LẠC BỘ (Club Management Hub) ............ Path: /clubs/{slug}/ctl|
|    - Dành cho Chủ tịch / Ban chủ nhiệm CLB.                                       |
|    - Quản lý hồ sơ CLB, ảnh bìa, logo, ngân hàng thụ hưởng VietQR nhận quỹ.      |
|    - Quản lý hội viên: Tiếp nhận yêu cầu gia nhập, phê duyệt, gán quyền Admin.   |
|    - Khởi tạo và giám sát chuỗi các giải thi đấu trực thuộc CLB.                 |
+-----------------------------------------------------------------------------------+
| 5. WORKSPACE CỘNG ĐỒNG (Community Hub) ...................... Path: /community    |
|    - Không gian mở cho toàn bộ người dùng và các câu lạc bộ giao lưu.             |
|    - Bảng tin hoạt động (Activity Feed) toàn sàn và theo dõi bạn bè.              |
|    - Trung tâm kết nối: Tìm kiếm bạn chạy, gửi/nhận lời mời kết bạn (Friends).    |
|    - Danh bạ các CLB công khai và giải đấu cộng đồng đang mở đăng ký.             |
+-----------------------------------------------------------------------------------+
| 6. WORKSPACE ADMIN TOÀN SÀN (Super Admin Portal) ............ Path: /admin        |
|    - Giám sát kỹ thuật: Hạn mức Strava API Quota toàn sàn (15-min / Daily).      |
|    - Quản lý danh mục Tenant CLB: Duyệt tạo CLB, khóa/mở quyền hoạt động.        |
|    - Kiểm soát an toàn hệ thống, hàng đợi RabbitMQ/BullMQ và công cụ Recompute.   |
+───────────────────────────────────────────────────────────────────────────────────+
```

---

# 3. CẤU TRÚC CÂY MENU ĐIỀU HƯỚNG TOÀN DIỆN (TAXONOMY V2.0)

Cấu trúc menu được tái cấu trúc, đảm bảo tính thuận tiện trên Web di động (PWA Bottom Bar 5 vị trí: Trang chủ, Giải đấu, Cộng đồng, CLB, Cá nhân) và hiển thị Sidebar đa tầng trên Desktop.

```
========================================================================================
OPENRACE V2.0 NAVIGATION MENU ARCHITECTURE
========================================================================================

[1.0] BÀN LÀM VIỆC CÁ NHÂN (MY PERSONAL HUB) ........................... Path: /me
  ├── [1.1] Hồ sơ & Chỉ số cá nhân (Profile, Bio, Personal Bests)
  ├── [1.2] Trung tâm kết nối Strava & Nguồn dữ liệu (Strava Connection Center)
  │     ├── Trạng thái kết nối (Active / Disconnected / Token Expired)
  │     ├── Thao tác: [Kết nối Strava] / [Hủy kết nối ngay] / [Đồng bộ lại lịch sử]
  │     └── Nhật ký truyền dữ liệu từ Strava (Strava Sync Logs & Raw Webhooks)
  ├── [1.3] Câu lạc bộ của tôi (Danh sách CLB đã tham gia & Chuyển đổi CLB)
  ├── [1.4] Giải đấu của tôi (Các giải đang chạy, kết quả và nghĩa vụ đóng quỹ)
  └── [1.5] Quản lý Bạn bè & Lời mời kết nối (Friends List & Connection Requests)

[2.0] GIẢI ĐẤU & ĐẤU TRƯỜNG (RACES & ARENA) ............................ Path: /races
  ├── [2.1] Khám phá giải đấu (Bộ lọc: Nội bộ CLB của tôi / Cộng đồng / Được mời)
  ├── [2.2] Trang chi tiết giải & Đăng ký (Thông tin, Thể lệ, Cự ly, Giới hạn VĐV)
  └── [2.3] Đấu trường giải trực tiếp (Race Arena) [/r/{race_slug}]
        ├── Tổng quan & Đồng hồ đếm ngược (Hero Stats & Live Countdown)
        ├── Bảng xếp hạng Đội thi đấu (Team Standings)
        ├── Bảng xếp hạng Cá nhân (Individual Leaderboard)
        └── Nhật ký bài chạy của giải (Race Activity Feed)

[3.0] CỘNG ĐỒNG CHẠY BỘ (RUNNING COMMUNITY) ............................ Path: /community
  ├── [3.1] Bảng tin hoạt động (Community Activity Feed: Bạn bè / Toàn sàn)
  ├── [3.2] Kết nối bạn chạy (Tìm kiếm theo khu vực, CLB, Pace tương đồng)
  ├── [3.3] Tương tác bài chạy (Thả Kudos, Bình luận, Chia sẻ thành tích)
  └── [3.4] Danh bạ Câu lạc bộ mở (Explore Running Clubs)

[4.0] KHÔNG GIAN CÂU LẠC BỘ (MY CLUBS HUB) ............................. Path: /clubs
  ├── [4.1] Trang chủ CLB [/c/{club_slug}] (Bảng tin CLB, Thành viên, Bảng thành tích)
  ├── [4.2] Danh sách giải đấu trực thuộc CLB
  └── [4.3] Tham gia CLB mới (Tìm kiếm CLB cộng đồng hoặc Quét mã QR mời)

----------------------------------------------------------------------------------------
CÁC BỘ CÔNG CỤ QUẢN TRỊ RIÊNG BIỆT (MANAGEMENT SPACES)
----------------------------------------------------------------------------------------

[5.0] BỘ CÔNG CỤ QUẢN LÝ ĐỘI THI ĐẤU (TEAM MANAGEMENT CONSOLE) ......... Path: /teams/{id}/manage
  ├── [5.1] Thiết lập nhận diện đội: Đổi tên đội thi đấu & Cập nhật Avatar đội
  ├── [5.2] Danh sách thành viên đội & Đôn đốc chỉ tiêu tuần
  └── [5.3] Báo cáo phong độ đội thi đấu (Cự ly trung bình, Tỷ lệ chuyên cần)

[6.0] BỘ CÔNG CỤ QUẢN TRỊ GIẢI ĐẤU (RACE OPERATIONS CONSOLE) ........... Path: /races/{slug}/manage
  ├── [6.1] Cấu hình cơ bản (Tên giải, Ngày bắt đầu/kết thúc, Số lượng tối đa)
  ├── [6.2] Cấu hình phạm vi: [Nội bộ CLB] / [Cộng đồng mở] / [Chỉ định Whitelist]
  ├── [6.3] Quản lý danh sách Whitelist vận động viên (Nhập Excel / Thêm thủ công)
  ├── [6.4] Chia đội thi đấu & Chỉ định Đội trưởng các đội
  ├── [6.5] Thiết lập Rule Engine đa tiêu thức & Chạy mô phỏng (Dry-run)
  ├── [6.6] Thẩm định thủ công, Duyệt khiếu nại & Cấp miễn trừ phạt
  └── [6.7] Đối soát tài chính VietQR, Báo cáo thu quỹ & Đóng băng giải

[7.0] BỘ CÔNG CỤ QUẢN TRỊ CLB (CLUB ADMIN WORKSPACE) ................... Path: /clubs/{slug}/manage
  ├── [7.1] Hồ sơ CLB, Logo, Ảnh bìa & Cài đặt hiển thị công khai/riêng tư
  ├── [7.2] Quản trị thành viên: Phê duyệt hội viên mới, Khóa/Mời ra, Bổ nhiệm Admin
  ├── [7.3] Cấu hình tài khoản ngân hàng CLB nhận quỹ (VietQR Bank Account)
  └── [7.4] Quản lý liên kết mời gia nhập CLB (Token, Hạn dùng, Thu hồi)

[8.0] BỘ CÔNG CỤ QUẢN TRỊ HỆ THỐNG TOÀN SÀN (SUPER ADMIN) .............. Path: /admin
  ├── [8.1] Giám sát hạn mức Strava API Quota (Governor Engine)
  ├── [8.2] Giám sát Webhook Ingestion & Dead-letter Queue
  ├── [8.3] Quản lý danh mục Tenant CLB toàn sàn
  └── [8.4] Vận hành hệ thống: Tính toán lại hàng loạt & Replay Webhooks
========================================================================================
```

---

# 4. ĐẶC TẢ CHI TIẾT CÁC PHÂN HỆ NGHIỆP VỤ MỚI

### 4.1. Phân hệ Cá nhân & Đồng bộ Strava (Self-Service & Sync Logs)

Vận động viên được trao toàn quyền kiểm soát thông tin và luồng dữ liệu cá nhân tại `/me`:

```
+───────────────────────────────────────────────────────────────────────────────────+
| MÀN HÌNH QUẢN LÝ KẾT NỐI STRAVA & LỊCH SỬ ĐỒNG BỘ (/me/strava)                    |
+-----------------------------------------------------------------------------------+
| [Strava Status Card]                                                              |
| Trạng thái: CONNECTED ● (Athlete ID: 9482012)                 [ HỦY KẾT NỐI NGAY ]|
| Quyền đã cấp: read, activity:read_all                         [ ĐỒNG BỘ LẠI TUẦN ]|
| Thời điểm đồng bộ thành công gần nhất: 14:22:05 05/11/2026                        |
+-----------------------------------------------------------------------------------+
| [Lịch sử truyền dữ liệu từ Strava về (Ingestion & Sync Logs)]                      |
| Tìm kiếm theo ID bài / Mã Webhook...                      [Bộ lọc: Tất cả / Lỗi]  |
| --------------------------------------------------------------------------------- |
| Thời gian       | Mã bài Strava | Cự ly   | Trạng thái webhook   | Kết quả xử lý  |
| --------------------------------------------------------------------------------- |
| 14:20:10 05/11  | #12894102941  | 6.20 km | 200 OK (Processed)   | Hợp lệ (Road)  |
| 06:15:22 04/11  | #12883910231  | 4.10 km | 200 OK (Processed)   | Hợp lệ (Trail) |
| 18:30:00 02/11  | #12861029311  | 1.50 km | 200 OK (Processed)   | Loại (< 3km)   |
| 12:00:15 01/11  | Webhook Event | N/A     | 400 Bad Payload      | Bỏ qua         |
+-----------------------------------------------------------------------------------+
```

* **Kết nối / Hủy kết nối tự phục vụ (Self-service Disconnect):** 
  * Runner có thể bấm "Hủy kết nối ngay". Hệ thống sẽ lập tức vô hiệu hóa token trong `strava_connections`, dừng nhận dữ liệu bài tập mới từ webhook nhưng **giữ nguyên toàn bộ lịch sử thành tích bài chạy cũ** đã thẩm định trong các giải đấu để không phá vỡ tính toàn vẹn của kết quả đồng đội.
* **Theo dõi lịch sử truyền dữ liệu (Sync Logs):**
  * Hiển thị danh sách toàn bộ các gói dữ liệu webhook hoặc các đợt đồng bộ chủ động từ Strava.
  * Mỗi dòng cung cấp: Thời gian nhận, `strava_activity_id`, Cự ly, Trạng thái Webhook (`received`, `processed`, `failed`), và đường link xem chi tiết payload JSON gốc phục vụ tra soát khi có khiếu nại.

### 4.2. Phân hệ Tham gia Đa CLB & Giải đấu (3 phương án phạm vi giải)

#### A. Quan hệ đa Câu lạc bộ:
* Một người dùng có thể tham gia vào vô số câu lạc bộ (`users 1──N club_members`).
* Trên thanh điều hướng, người dùng có nút chuyển đổi ngữ cảnh nhanh giữa các CLB mình tham gia.

#### B. Phạm vi giải đấu & Ma trận điều kiện tham gia:
Khi khởi tạo giải đấu tại `races`, Quản trị CLB bắt buộc phải chọn 1 trong 3 giá trị của cột `scope`:

```
                                [Cá nhân muốn tham gia Giải đấu]
                                                │
                                                ▼
                                    [Kiểm tra Scope của Giải]
                                                │
                 ┌──────────────────────────────┼──────────────────────────────┐
                 ▼                              ▼                              ▼
          [1. INTERNAL]                  [2. COMMUNITY]                 [3. DESIGNATED]
       (Giải nội bộ CLB)             (Giải chạy cộng đồng)             (Giải đấu chỉ định)
                 │                              │                              │
        Kiểm tra người dùng            Mở cho toàn thể              Kiểm tra Email/User ID
        đã là hội viên của             thành viên trên              có nằm trong danh sách
        CLB tổ chức chưa?              nền tảng OpenRace            race_whitelists chưa?
           /           \                        │                              /           \
        [CÓ]          [KHÔNG]                [ĐƯỢC]                         [CÓ]          [KHÔNG]
         │               │                      │                            │               │
     [CHO PHÉP]      [TỪ CHỐI]              [CHO PHÉP]                   [CHO PHÉP]      [TỪ CHỐI]
```

1. **`internal` (Giải chạy nội bộ):** Chỉ những cá nhân có trạng thái `active` trong bảng `club_members` của CLB tổ chức mới có quyền ghi danh. Người ngoài muốn tham gia phải gửi yêu cầu gia nhập CLB trước.
2. **`community` (Giải chạy cộng đồng):** Toàn bộ vận động viên có tài khoản trên nền tảng OpenRace đều được quyền đăng ký tham gia tự do, bất kể họ thuộc CLB nào.
3. **`designated` (Giải đấu chỉ định danh sách):** Chỉ những cá nhân có Email hoặc User ID được Ban tổ chức thêm vào bảng `race_whitelists` mới có thể ghi danh. Thích hợp cho các giải đấu đại hội, giải giao hữu chọn lọc hoặc giải đấu nội bộ công ty giới hạn phòng ban.
* **Ràng buộc số lượng tối đa (`max_participants`):** Khi sĩ số đăng ký thực tế đạt trần `max_participants`, nút "Đăng ký" trên giao diện tự động chuyển sang trạng thái "Đã đủ số lượng" và khóa tiếp nhận.

### 4.3. Phân hệ Đội thi đấu & Quyền năng Đội trưởng

* **Chia đội ban đầu:** Do Quản trị CLB (`Club Admin`) thực hiện thông qua công cụ phân bổ: có thể tạo danh sách đội, nhập tên ban đầu và gán từng thành viên vào từng đội, chỉ định 1 thành viên làm Đội trưởng (`race_participants.role = 'leader'`).
* **Không gian quản lý riêng của Đội trưởng (`Team Management Console`):**
  * **Thiết lập nhận diện đội:** Đội trưởng có toàn quyền đặt tên riêng cho đội (không cần thông qua Admin) và tải lên ảnh đại diện / cờ hiệu riêng của đội (`avatar_url`), tạo bản sắc thi đấu độc đáo.
  * **Theo dõi phong độ:** Bảng điều khiển đội thể hiện tiến độ của từng thành viên: ai đã chạy đủ chỉ tiêu tuần, ai có nguy cơ bị phạt, ai có thành tích cao nhất.
  * **Đôn đốc thành viên:** Tích hợp nút gửi thông báo nhắc nhở nhanh tới các thành viên chưa chạy đủ km trong tuần.

### 4.4. Phân hệ Cộng đồng Chạy bộ, Kết nối & Mạng lưới Bạn bè

Phân hệ mạng xã hội thể thao chuyên biệt tại `/community`:
* **Mạng lưới Bạn bè (Friendship Graph):**
  * Cơ chế kết bạn 2 chiều: Vận động viên gửi yêu cầu kết bạn $\rightarrow$ Đối phương chấp nhận $\rightarrow$ Trở thành Bạn bè (`friendships.status = 'accepted'`).
  * Danh sách bạn bè hiển thị trạng thái tập luyện, giải đấu đối phương đang tham gia.
* **Bảng tin hoạt động (Community Activity Feed):**
  * Chế độ xem: Tab "Bạn bè" (chỉ xem bài chạy của những người đã kết nối) và Tab "Cộng đồng" (xem bài chạy nổi bật toàn sàn).
  * Mỗi thẻ hoạt động bao gồm: Bản đồ cự ly tóm tắt, Pace, Thời gian, Gain, và giải đấu bài chạy đang tính điểm.
* **Tương tác xã hội:**
  * **Thả Kudos (Tương đương Like/Thả tim):** Động viên tinh thần đồng run.
  * **Bình luận (Comments):** Trao đổi kỹ thuật, chia sẻ cung đường, chúc mừng thành tích.

---

# 5. RULE ENGINE 2.0: ĐỘNG CƠ TÍNH ĐIỂM & QUY ĐỔI ĐA TIÊU THỨC

### 5.1. Mô hình tham số hóa bộ tiêu thức tính điểm

Khắc phục hạn chế của phiên bản cũ, Rule Engine 2.0 cho phép Ban tổ chức giải cấu hình linh hoạt cách tính điểm thông qua bộ tiêu thức đa dạng:

```json
{
  "rule_version": 4,
  "scoring_model": "multi_criteria_weighted",
  "criteria_weights": {
    "distance": 0.40,
    "diligent_days": 0.30,
    "elevation_gain": 0.20,
    "pace_quality": 0.10
  },
  "criteria_configs": {
    "distance": {
      "mode": "total_accumulated",
      "scale_max_points": 10.0,
      "normalize_by_members": true
    },
    "diligent_days": {
      "cap_days_team": 140,
      "scale_max_points": 10.0,
      "points_per_active_day": 1.0
    },
    "elevation_gain": {
      "gain_threshold_m": 100,
      "points_per_100m": 0.5,
      "max_gain_points": 5.0
    },
    "pace_quality": {
      "target_pace_min": 5.0,
      "target_pace_max": 7.0,
      "bonus_points_per_valid_run": 0.2
    }
  },
  "ranking_policy": "top1_then_tied_second",
  "tie_break_priority": ["total_score", "total_km", "active_days", "earliest_achieved"]
}
```

### 5.2. Các chiến lược chấm điểm (Scoring Strategies)

Hệ thống cung cấp sẵn các chiến lược tính điểm dựng sẵn (presets) trong Wizard:

1. **Chiến lược Thể lệ Truyền thống (`sum_team_v1`):**  
   * Điểm Cự ly ($10\text{ điểm}$) + Điểm Chuyên cần ($10\text{ điểm}$, trần 140 ngày).  
   * Đội cao nhất xếp Hạng 1, các đội còn lại Đồng Hạng 2.
2. **Chiến lược Bình quân Đầu người (`avg_per_member_v1`):**  
   * Cự ly và số ngày chạy được chia đều cho tổng quân số hợp lệ của từng đội trước khi đưa vào thang điểm 10. Giúp các đội ít người vẫn có cơ hội cạnh tranh sòng phẳng với các đội đông người.
3. **Chiến lược Đa tiêu thức Tùy biến (`multi_criteria_custom`):**  
   * Ban tổ chức tự định nghĩa tỷ trọng phần trăm (%) cho từng tiêu thức: Cự ly ($w_1$), Ngày chạy ($w_2$), Leo dốc Trail ($w_3$), và Chất lượng Pace ($w_4$) sao cho $\sum w_i = 100\%$.

### 5.3. Pipeline thẩm định 6 bước và Sàn Pace chống gian lận

Mọi bài tập từ Strava đều trải qua quy trình thẩm định bất biến:

```
[Bài tập gốc]
    │
    ▼
[Bước 0: Nguồn & Ủy quyền] ──> Chặn bài nhập tay (is_manual), môn không thuộc Run/TrailRun
    │
    ▼
[Bước 1: Khung thời gian] ───> Phải diễn ra trong khoảng [start_at, end_at] của giải
    │
    ▼
[Bước 2: Cự ly tối thiểu] ───> Cự ly thô >= min_distance_km (ví dụ: >= 3.0 km)
    │
    ▼
[Bước 3: Phân tích Pace & Gain]
    ├── Pace < 2:45 min/km ──────────> Treo xác minh: PACE_IMPLAUSIBLE
    ├── 2:45 <= Pace < pace_min ─────> Loại: PACE_TOO_FAST
    ├── pace_min <= Pace <= pace_max ─> HỢP LỆ (Road)
    ├── Pace > pace_max & Gain >= 100m > HỢP LỆ (Trail Bonus)
    └── Pace > pace_max & Gain < 100m ─> Loại: PACE_TOO_SLOW_NO_GAIN
    │
    ▼
[Bước 4: Chống trùng lặp] ───> Trùng > 50% thời gian với bài khác -> Loại bài kém hơn
    │
    ▼
[Bước 5: Giới hạn ngày] ────> Sắp xếp theo giờ xuất phát, chỉ tính N bài đầu trong ngày
    │
    ▼
[Ghi nhận vào race_activity_logs & Kích hoạt tính điểm]
```

---

# 6. THIẾT KẾ CƠ SỞ DỮ LIỆU & RLS (POSTGRESQL 16)

### 6.1. Sơ đồ quan hệ thực thể mở rộng (ERD Specification)

```
[users] 1───N [club_members] N───1 [clubs]
   │                 │                 │
   │                 │                 └─── 1───N [races]
   │                 │                               │
   │                 └───────────────────────────────┤ (Internal scope validation)
   │                                                 │
   ├─── 1───N [race_participants] N──────────────────┤
   │                 │                               ├─── 1───N [teams]
   │                 │                               ├─── 1───N [race_whitelists]
   │                 │                               └─── 1───N [race_rules]
   │                 └─── 1───N [participant_cycle_stats]
   │
   ├─── 1───1 [strava_connections]
   ├─── 1───N [strava_sync_logs]
   ├─── 1───N [activities] ─── 1───N [race_activity_logs]
   │
   ├─── 1───N [friendships] (Mạng lưới bạn bè 2 chiều)
   ├─── 1───N [community_posts] ─── 1───N [post_comments]
   └─── 1───N [post_kudos] (Thả tim tương tác)
```

### 6.2. Chi tiết các bảng dữ liệu mới & Cập nhật

#### 1. Cập nhật bảng `races` (Bổ sung scope và max_participants):
```sql
ALTER TABLE races ADD COLUMN scope VARCHAR(20) NOT NULL DEFAULT 'internal' 
  CHECK (scope IN ('internal', 'community', 'designated'));
ALTER TABLE races ADD COLUMN max_participants INTEGER NULL CHECK (max_participants > 0);
```

#### 2. Cập nhật bảng `teams` (Hỗ trợ nhận diện đội của Đội trưởng):
```sql
ALTER TABLE teams ADD COLUMN avatar_url TEXT NULL;
ALTER TABLE teams ADD COLUMN slogan VARCHAR(255) NULL;
ALTER TABLE teams ADD COLUMN updated_by UUID REFERENCES users(id);
```

#### 3. Bảng mới `race_whitelists` (Dành cho giải đấu chỉ định):
```sql
CREATE TABLE race_whitelists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    race_id UUID NOT NULL REFERENCES races(id) ON DELETE CASCADE,
    email VARCHAR(255) NULL,
    user_id UUID NULL REFERENCES users(id) ON DELETE SET NULL,
    note VARCHAR(255) NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_race_whitelist UNIQUE(race_id, email)
);
CREATE INDEX idx_race_whitelist_lookup ON race_whitelists(race_id, email, user_id);
```

#### 4. Bảng mới `strava_sync_logs` (Nhật ký truyền dữ liệu từ Strava):
```sql
CREATE TABLE strava_sync_logs (
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
CREATE INDEX idx_sync_logs_user_date ON strava_sync_logs(user_id, created_at DESC);
```

#### 5. Nhóm bảng Cộng đồng & Bạn bè (`friendships`, `community_posts`, `post_kudos`):
```sql
CREATE TABLE friendships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    addressee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_friendship_pair UNIQUE (requester_id, addressee_id)
);

CREATE TABLE community_posts (
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

CREATE TABLE post_kudos (
    post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, user_id)
);
```

### 6.3. Chính sách bảo mật hàng (Row-Level Security)
Ràng buộc dữ liệu nhiều tầng đảm bảo an toàn tuyệt đối:
* **CLB & Giải đấu:** Chỉ thành viên CLB mới xem được giải đấu `internal`. Toàn bộ người dùng xem được giải đấu `community`.
* **Đội thi đấu:** Đội trưởng (`leader`) và Quản trị CLB (`admin`) có quyền thực thi lệnh `UPDATE` trên bảng `teams` đối với đội của mình.

---

# 7. TÍCH HỢP STRAVA, WEBHOOK & ĐIỀU TIẾT HẠN MỨC (RATE LIMITS)

### 7.1. Quản lý OAuth 2.0, Lịch sử đồng bộ & Khóa phân tán
* **Ngắt kết nối an toàn (Graceful Disconnect):** Khi người dùng bấm "Hủy kết nối", hệ thống gọi Strava Deauthorization API, xóa mã token trong `strava_connections` và đổi trạng thái sang `revoked`. Mọi webhook phát sinh sau đó sẽ bị Ingestion Service lọc bỏ ngay ở Bước 0.
* **Ghi nhật ký truyền dẫn toàn diện:** Mọi sự kiện Webhook từ Strava đẩy về đều sinh một bản ghi trong `strava_sync_logs` lưu trữ `raw_event_payload`. Người dùng dễ dàng kiểm tra vì sao bài chạy của mình chưa lên bảng xếp hạng trực tiếp trên giao diện cá nhân.

### 7.2. Webhook Ingestion & Token-Bucket Governor
* **Phản hồi tức thì trong 300ms:** Webhook Ingestion Service chỉ làm 2 việc: Kiểm tra định dạng payload $\rightarrow$ Ghi vào `webhook_events` và `strava_sync_logs` $\rightarrow$ Trả mã HTTP 200 OK cho Strava. Toàn bộ logic phân tích được chuyển cho Background Worker xử lý qua RabbitMQ / BullMQ.
* **Hạn mức 15 phút & Daily Token Bucket:** Bộ điều tiết tự động theo dõi tiêu thụ quota thông qua Redis:
  * Khi đạt $80\%$ quota của khung 15 phút, hệ thống tự động hoãn (defer) các tác vụ kéo lịch sử và quét nền.
  * Tác vụ xử lý webhook bài chạy mới luôn được ưu tiên số 1 trong hàng đợi xử lý.

---

# 8. RESTFUL API SPECIFICATION (V2.0)

### 8.1. Endpoints Cá nhân, Strava & Bạn bè
* `GET /api/v1/me`: Lấy thông tin cá nhân, danh sách CLB và giải đấu tham gia.
* `PATCH /api/v1/me`: Cập nhật thông tin hồ sơ, avatar, bio.
* `DELETE /api/v1/me/strava`: Hủy kết nối tài khoản Strava ngay lập tức.
* `GET /api/v1/me/strava/sync-logs`: Lấy danh sách nhật ký truyền dữ liệu từ Strava (phân trang).
* `POST /api/v1/me/friends/request`: Gửi lời mời kết bạn tới một vận động viên.
* `PATCH /api/v1/me/friends/requests/{id}`: Chấp nhận hoặc từ chối yêu cầu kết bạn.
* `GET /api/v1/me/friends`: Lấy danh bạ bạn bè hiện tại.

### 8.2. Endpoints Đội thi đấu & Quản lý Đội trưởng
* `GET /api/v1/teams/{id}`: Xem chi tiết thông tin và danh sách thành viên đội.
* `PATCH /api/v1/teams/{id}`: Đội trưởng hoặc Club Admin cập nhật tên đội (`name`), ảnh đại diện (`avatar_url`), và khẩu hiệu (`slogan`).
* `GET /api/v1/teams/{id}/performance`: Báo cáo phong độ chi tiết từng thành viên trong đội.

### 8.3. Endpoints Giải đấu & Whitelist
* `POST /api/v1/clubs/{slug}/races`: Tạo giải đấu mới (Khai báo tên, ngày bắt đầu/kết thúc, `scope`, `max_participants`).
* `POST /api/v1/races/{slug}/whitelist`: Thêm danh sách email chỉ định được tham gia giải (dành cho giải `designated`).
* `POST /api/v1/races/{slug}/join`: Vận động viên đăng ký tham gia giải đấu (Hệ thống tự động kiểm tra điều kiện Scope và Trần số lượng).
* `POST /api/v1/races/{slug}/teams/assign`: Club Admin thực hiện chia đội và bổ nhiệm Đội trưởng.

### 8.4. Endpoints Bảng tin Cộng đồng & Tương tác
* `GET /api/v1/community/feed`: Lấy bảng tin hoạt động (Hỗ trợ lọc theo Tab: Tất cả / Bạn bè).
* `POST /api/v1/community/posts`: Đăng bài chia sẻ hoạt động lên cộng đồng.
* `POST /api/v1/community/posts/{id}/kudos`: Thả Kudos (Thả tim) cho bài tập của bạn chạy.
* `POST /api/v1/community/posts/{id}/comments`: Gửi bình luận tương tác.

---

# 9. DANH SÁCH USER STORIES CHI TIẾT (INVEST & GHERKIN CRITERIA)

### Module US-A: Cá nhân, Strava Sync & Lịch sử

#### US-A1: Cá nhân chủ động hủy và kết nối lại Strava
* **As a** Vận động viên chạy bộ,
* **I want to** có thể chủ động hủy kết nối hoặc kết nối lại tài khoản Strava bất kỳ lúc nào tại trang cá nhân,
* **So that** tôi hoàn toàn làm chủ quyền riêng tư và dữ liệu tập luyện của mình.

```gherkin
Scenario: Hủy kết nối Strava thành công
  Given tôi đang đăng nhập và tài khoản đã liên kết Strava ở trạng thái "active"
  When tôi truy cập trang cá nhân /me và nhấn nút "Hủy kết nối Strava"
  Then hệ thống hiển thị hộp thoại cảnh báo: "Dữ liệu bài chạy mới sẽ không được tự động đồng bộ nữa"
  And khi tôi xác nhận, hệ thống đổi trạng thái strava_connections thành "revoked"
  And toàn bộ dữ liệu lịch sử thành tích bài chạy cũ trong các giải đấu vẫn được bảo lưu nguyên vẹn.
```

#### US-A2: Theo dõi nhật ký truyền dữ liệu từ Strava
* **As a** Vận động viên tham gia giải đấu,
* **I want to** xem được danh sách nhật ký từng gói dữ liệu Strava gửi về hệ thống,
* **So that** tôi biết chính xác bài chạy của mình đã được hệ thống tiếp nhận và thẩm định ra sao.

```gherkin
Scenario: Tra cứu bài chạy vừa hoàn thành trong bảng Sync Logs
  Given tôi vừa hoàn thành bài chạy 5 km trên ứng dụng Strava
  When tôi truy cập mục "Nhật ký truyền dữ liệu Strava" tại /me/strava/sync-logs
  Then tôi nhìn thấy bản ghi mới nhất chứa mã bài chạy Strava, cự ly 5.0 km
  And trạng thái ghi nhận mã 200 OK kèm kết quả thẩm định: "HỢP LỆ (Road)".
```

---

### Module US-B: Phạm vi giải đấu & Ghi danh có điều kiện

#### US-B1: Thiết lập giải đấu với 3 tùy chọn phạm vi tiếp cận
* **As a** Quản trị viên Câu lạc bộ (Club Admin),
* **I want to** thiết lập giải đấu với các tùy chọn phạm vi: Nội bộ CLB, Cộng đồng hoặc Chỉ định Whitelist,
* **So that** giải đấu phục vụ đúng đối tượng mục tiêu của ban tổ chức.

```gherkin
Scenario: Khởi tạo giải đấu chỉ định danh sách Whitelist
  Given tôi đang ở bước 1 của Wizard tạo giải đấu mới
  When tôi chọn phạm vi tiếp cận là "Chỉ định (Designated Whitelist)" và nhập số lượng tối đa là 50 VĐV
  And tôi tải lên danh sách 50 địa chỉ email được phép tham gia
  Then hệ thống lưu thông tin giải với scope = 'designated' và max_participants = 50
  And lưu danh sách 50 email hợp lệ vào bảng race_whitelists.
```

#### US-B2: Kiểm tra điều kiện khi vận động viên đăng ký tham gia giải
* **As a** Vận động viên,
* **I want to** hệ thống kiểm tra tính hợp lệ và cho phép tôi ghi danh vào giải đấu phù hợp,
* **So that** tôi không tham gia nhầm vào các giải đấu kín không dành cho mình.

```gherkin
Scenario: VĐV ngoài CLB cố tình đăng ký giải đấu Nội bộ
  Given giải đấu "Chạy Mừng Sinh Nhật CLB A" được cấu hình với scope = 'internal'
  And tôi chưa phải là thành viên chính thức của CLB A
  When tôi bấm nút "Đăng ký tham gia"
  Then hệ thống chặn ghi danh và hiển thị thông báo: "Đây là giải đấu nội bộ của CLB A. Vui lòng gia nhập CLB A trước khi đăng ký".

Scenario: VĐV đăng ký giải đấu đã đạt trần số lượng
  Given giải đấu cộng đồng có max_participants = 100 và hiện tại đã có 100 VĐV ghi danh thành công
  When tôi truy cập trang chi tiết giải đấu
  Then nút "Đăng ký tham gia" chuyển sang trạng thái bị vô hiệu hóa kèm nhãn "Đã đủ số lượng tối đa".
```

---

### Module US-C: Đội thi đấu & Quyền Đội trưởng

#### US-C1: Quản trị CLB chia đội và chỉ định Đội trưởng
* **As a** Club Admin điều hành giải đấu,
* **I want to** tạo các đội thi đấu ban đầu và gán thành viên cùng Đội trưởng cho từng đội,
* **So that** giải đấu đồng đội được tổ chức quy củ.

```gherkin
Scenario: Admin gán Đội trưởng cho Đội 1
  Given giải đấu đồng đội đã có danh sách 30 vận động viên ghi danh
  When Admin tạo "Đội 1", chọn 10 thành viên và tích chọn Vận động viên X làm "Đội trưởng"
  Then hệ thống tạo bản ghi trong bảng teams và cập nhật role = 'leader' cho VĐV X trong race_participants.
```

#### US-C2: Đội trưởng tự thiết lập tên và ảnh đại diện riêng cho đội
* **As a** Đội trưởng (Team Leader) trong giải đấu,
* **I want to** toàn quyền đổi tên đội và cập nhật ảnh đại diện/cờ hiệu của đội mình,
* **So that** xây dựng màu cờ sắc áo và truyền cảm hứng chiến đấu cho các thành viên.

```gherkin
Scenario: Đội trưởng đổi tên đội và cập nhật Avatar
  Given tôi được bổ nhiệm làm Đội trưởng của "Đội 1"
  When tôi truy cập Workspace quản lý đội tại /teams/{id}/ctl
  And tôi đổi tên thành "Chiến Binh Bứt Phá" và tải lên ảnh cờ hiệu mới của đội
  Then hệ thống cập nhật bảng teams với tên và avatar_url mới
  And tên mới "Chiến Binh Bứt Phá" cùng avatar lập tức hiển thị trên Bảng xếp hạng trực tiếp.
```

---

### Module US-D: Cộng đồng, Bạn bè & Tương tác xã hội

#### US-D1: Kết nối bạn bè và theo dõi hoạt động chạy bộ
* **As a** Vận động viên chạy bộ trên OpenRace,
* **I want to** tìm kiếm bạn chạy, gửi lời mời kết bạn và theo dõi bài chạy của bạn bè trên bảng tin,
* **So that** chúng tôi có thể cùng nhau duy trì động lực tập luyện mỗi ngày.

```gherkin
Scenario: Kết bạn thành công giữa 2 vận động viên
  Given tôi gửi lời mời kết bạn tới VĐV Nguyễn Văn B
  When VĐV B mở danh sách lời mời và bấm "Chấp nhận"
  Then hệ thống cập nhật trạng thái bản ghi trong friendships thành "accepted"
  And toàn bộ các bài chạy công khai mới của VĐV B sẽ hiển thị trên Tab "Bạn bè" trong Bảng tin cộng đồng của tôi.
```

#### US-D2: Thả Kudos và bình luận khích lệ đồng run
* **As a** Thành viên trong cộng đồng chạy bộ,
* **I want to** thả Kudos và để lại lời bình luận dưới bài chạy của đồng đội,
* **So that** lan tỏa tinh thần thể thao tích cực.

```gherkin
Scenario: Thả Kudos cho bài chạy của bạn
  Given bài chạy của bạn tôi vừa xuất hiện trên bảng tin cộng đồng
  When tôi nhấn vào biểu tượng Kudos (hình ngọn lửa/trái tim)
  Then số lượng Kudos của bài viết tăng lên 1
  And bạn của tôi nhận được một thông báo: "{Tên tôi} đã thả Kudos cho bài chạy của bạn".
```

---

### Module US-E: Bộ điều hành thể lệ đa tiêu thức

#### US-E1: Cấu hình bảng quy đổi điểm đa tiêu thức
* **As a** Club Admin thiết lập giải đấu,
* **I want to** tự do kết hợp các tiêu chí chấm điểm (Cự ly, Ngày chuyên cần, Leo dốc Trail) với tỷ trọng phần trăm mong muốn,
* **So that** giải đấu có thể lệ phong phú và phù hợp nhất với tiêu chí của câu lạc bộ.

```gherkin
Scenario: Thiết lập tỷ trọng điểm 40% Cự ly - 40% Chuyên cần - 20% Leo dốc
  Given tôi đang ở Bước 4 của Wizard cấu hình thể lệ giải đấu
  When tôi chọn chế độ "Đa tiêu thức tùy biến"
  And tôi kéo các thanh trượt tỷ trọng: Cự ly 40%, Ngày chuyên cần 40%, Độ cao Gain 20% (Tổng = 100%)
  Then hệ thống xác nhận cấu hình hợp lệ và lưu vào trường criteria_weights của Rule Set
  And động cơ Rule Engine sẽ tính toán điểm tổng hợp của các đội dựa trên đúng ma trận trọng số này.
```

---

# 10. LỘ TRÌNH TRIỂN KHAI & QUẢN TRỊ RỦI RO

### 10.1. Lộ trình phát triển 4 giai đoạn mở rộng

```
[GIAI ĐOẠN 0: NỀN TẢNG & KIẾN TRÚC MỞ (Tuần 1 - 3)]
- Cấu trúc lại Schema CSDL: Hỗ trợ Scope giải đấu, Whitelist, Teams Avatar, Sync Logs.
- Xây dựng lớp trừu tượng ActivitySource và Governor điều tiết hạn mức Strava API.
- Thiết kế Design Tokens & Prototype 6 bộ công cụ quản lý riêng biệt.

[GIAI ĐOẠN 1: MVP CÁ NHÂN, ĐA CLB & QUẢN LÝ ĐỘI (Tuần 4 - 10)]
- Phân hệ Cá nhân: Tự hủy/kết nối Strava, tra cứu Strava Sync Logs.
- Quản trị CLB & Giải đấu: Cấu hình Scope (Nội bộ / Cộng đồng / Chỉ định Whitelist).
- Không gian Đội trưởng: Cho phép đổi tên đội, tải avatar và quản lý phong độ đội.
- Triển khai Rule Engine đa tiêu thức & Chạy mô phỏng tính điểm (Dry-run).

[GIAI ĐOẠN 2: CỘNG ĐỒNG, BẠN BÈ & ĐỐI SOÁT TÀI CHÍNH (Tuần 11 - 16)]
- Phân hệ Cộng đồng: Mạng lưới Bạn bè, Bảng tin hoạt động, Thả Kudos & Bình luận.
- Thanh toán VietQR động theo mã tham chiếu ngắn gọn & Đối soát quỹ CLB.
- Tích hợp công cụ xuất báo cáo tài chính tổng kết (Excel / PDF).
- Kiểm thử tải (Load Test): 5.000 vận động viên và kịch bản bão bài tập cuối tuần.

[GIAI ĐOẠN 3: SAAS HÓA TOÀN SÀN & NGUỒN DỮ LIỆU MỞ RỘNG (Tuần 17 - 22)]
- Ra mắt Cổng Super Admin Portal quản lý toàn bộ các Tenant CLB trên hệ thống.
- Triển khai cổng nộp tệp GPX/FIT thủ công dự phòng khi Strava nghẽn mạng.
- Tích hợp đối tác thiết bị trực tiếp: Garmin Health API và Coros API.
```

### 10.2. Ma trận quản trị rủi ro hệ thống

| Mã | Rủi ro nhận diện | Mức độ | Biện pháp kỹ thuật & Nghiệp vụ phòng ngừa |
| :--- | :--- | :---: | :--- |
| **R1** | **Chạm trần hạn mức Strava API do bùng nổ người dùng cộng đồng** | **Nghiêm trọng** | Kích hoạt Token Bucket Governor: Ưu tiên webhook bài mới, hoãn kéo lịch sử; Pilot giới hạn $\le 100\text{ VĐV}$ khi chưa duyệt Production App; sẵn sàng cổng nộp file GPX/FIT. |
| **R2** | **Tranh chấp quyền tham gia các giải đấu kín** | **Trung bình** | Kiểm tra nghiêm ngặt điều kiện `scope` ngay tại tầng API và giao diện; giải chỉ định bắt buộc kiểm tra khớp chính xác Email/User ID trong `race_whitelists`. |
| **R3** | **Đội trưởng lạm dụng quyền đổi tên/ảnh đội gây phản cảm** | **Thấp** | Tích hợp bộ lọc từ khóa cấm (Profanity Filter); Club Admin có toàn quyền ghi đè hoặc khóa tính năng sửa đổi của Đội trưởng kèm Audit Log. |
| **R4** | **Spam và nội dung độc hại trên Bảng tin Cộng đồng** | **Trung bình** | Giới hạn tần suất đăng bài (Rate Limit: tối đa 5 bài/giờ); bổ sung nút Báo cáo vi phạm (Report Content) và công cụ kiểm duyệt cho Quản trị viên. |
| **R5** | **Xung đột dữ liệu khi tính toán điểm đa tiêu thức theo thời gian thực** | **Cao** | Tách bạch hàm thẩm định Pure Function; gom cụm tác vụ xếp hạng bằng Debounce $10 - 15\text{ giây}$; cập nhật bất đồng bộ qua Redis Sorted Sets. |