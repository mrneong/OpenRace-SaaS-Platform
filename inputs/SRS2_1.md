# TÀI LIỆU PHÂN TÍCH, THIẾT KẾ HỆ THỐNG VÀ ĐẶC TẢ GIAO DIỆN (SRS & SDS)

## OpenRace SaaS Platform — Nền tảng Quản lý Giải chạy Trực tuyến Đa Câu lạc bộ, Mạng xã hội Thể thao & Điều hành CLB Thông minh

**Mã tài liệu:** OR-SRS-SDS-2026-V2.1  
**Phiên bản:** 2.1 (Full Community, Dual-Screen Architecture & Club Governance)  
**Ngày ban hành:** 05/11/2026  
**Trạng thái:** Sẵn sàng triển khai (Production-Ready Technical Specification)  
**Công nghệ mục tiêu:** React 19 / Next.js 15 (App Router), Tailwind CSS v3.4+, Shadcn/ui, PostgreSQL 16 (RLS), Redis 7, RabbitMQ / BullMQ, Node.js / NestJS.

---

# MỤC LỤC TỔNG THỂ

1. [TỔNG QUAN HỆ THỐNG & ĐỊNH HƯỚNG KIẾN TRÚC V2.1](#1-tổng-quan-hệ-thống--định-hướng-kiến-trúc-v21)
   * 1.1. Tầm nhìn sản phẩm & Khách hàng mục tiêu
   * 1.2. Bảng đối chiếu tiến hóa logic nghiệp vụ (v1.0 $\rightarrow$ v1.2 $\rightarrow$ v2.1)
   * 1.3. Bảng thuật ngữ chuyên ngành (Glossary)
   * 1.4. Các nguyên tắc thiết kế bất biến
2. [MA TRẬN PHÂN QUYỀN (RBAC) & 6 BỘ CÔNG CỤ QUẢN LÝ RIÊNG BIỆT](#2-ma-trận-phân-quyền-rbac--6-bộ-công-cụ-quản-lý-riêng-biệt)
   * 2.1. Phân quyền theo ngữ cảnh thực thể (Contextual RBAC)
   * 2.2. Chi tiết 6 bộ công cụ quản lý chuyên biệt (Dedicated Management Portals)
3. [CẤU TRÚC MENU ĐIỀU HƯỚNG & NGUYÊN TẮC THIẾT KẾ CẶP 2 MÀN HÌNH](#3-cấu-trúc-menu-điều-hướng--nguyên-tắc-thiết-kế-cặp-2-màn-hình)
   * 3.1. Nguyên tắc cấu trúc Cặp 2 màn hình (Master-Detail / List-Action Pattern)
   * 3.2. Cấu trúc cây Menu điều hướng toàn sàn
4. [ĐẶC TẢ CHI TIẾT 10 CẶP MÀN HÌNH CHỨC NĂNG (20 MÀN HÌNH LÕI)](#4-đặc-tả-chi-tiết-10-cặp-màn-hình-chức-năng-20-màn-hình-lõi)
   * Cặp 1: Cá nhân & Đồng bộ Strava (UI-01A Dashboard / UI-01B Logs & Sync Management)
   * Cặp 2: Khám phá & Đấu trường giải đấu (UI-02A Race Hub / UI-02B Race Arena & Leaderboard)
   * Cặp 3: Nhật ký hoạt động & Thẩm định (UI-03A Activity Feed / UI-03B Activity Detail & Appeal)
   * Cặp 4: Không gian CLB & Tiếp nhận lời mời (UI-04A Club Portal / UI-04B Onboarding & Join)
   * Cặp 5: Tài chính & Đối soát quỹ (UI-05A Member Finance Hub / UI-05B Admin Ledger & VietQR Reconciliation)
   * Cặp 6: Điều hành thể lệ giải đấu (UI-06A Race Management List / UI-06B 7-Step Rule Configurator Wizard)
   * Cặp 7: Đội thi đấu & Quyền năng Đội trưởng (UI-07A Team Directory / UI-07B Team Management & Customization)
   * Cặp 8: Mạng xã hội Chạy bộ & Bạn bè (UI-08A Community Feed & Kudos / UI-08B Friendship Graph & Profile)
   * Cặp 9: Chat nội bộ, AI PacerBot & Banter (UI-09A Chat Spaces & Channels / UI-09B Banter Engine & Bot Config)
   * Cặp 10: Quản trị CLB, Sự kiện & Kỷ luật (UI-10A Club Governance Hub / UI-10B Disciplinary, Events & Knowledge Admin)
5. [RULE ENGINE 2.1: ĐỘNG CƠ THẨM ĐỊNH & TÍNH ĐIỂM ĐA TIÊU THỨC](#5-rule-engine-21-động-cơ-thẩm-định--tính-điểm-đa-tiêu-thức)
   * 5.1. Cấu trúc tham số Rule Set JSONB
   * 5.2. Pipeline thẩm định 6 bước & Sàn Pace kỹ thuật (2:45 min/km)
   * 5.3. Công thức tính thưởng Trail leo dốc & Giới hạn trần thưởng
   * 5.4. Đa chiến lược chấm điểm đồng đội (Tổng điểm vs Bình quân)
   * 5.5. Chu kỳ tuần, ân hạn (Grace Hours), tính tỷ lệ (Prorate) & Trạng thái nợ
6. [THIẾT KẾ CƠ SỞ DỮ LIỆU & RLS (POSTGRESQL 16)](#6-thiết-kế-cơ-sở-dữ-liệu--rls-postgresql-16)
   * 6.1. Sơ đồ thực thể quan hệ mở rộng (ERD V2.1)
   * 6.2. Danh mục chi tiết các bảng dữ liệu
   * 6.3. Chính sách bảo mật hàng (Row-Level Security - RLS)
7. [TÍCH HỢP STRAVA, WEBHOOK VÀ QUẢN LÝ HẠN MỨC (RATE LIMITS)](#7-tích-hợp-strava-webhook-và-quản-lý-hạn-mức-rate-limits)
   * 7.1. Chu kỳ OAuth 2.0 & Quản lý Token phân tán
   * 7.2. Webhook Ingestion & Bộ điều tiết hạn mức (Token Bucket Governor)
   * 7.3. Lớp nguồn dữ liệu trừu tượng (ActivitySource Adapter)
8. [DANH MỤC API RESTFUL ĐẦY ĐỦ CHO 20 MÀN HÌNH](#8-danh-mục-api-restful-đầy-đủ-cho-20-màn-hình)
9. [DANH SÁCH USER STORIES CHI TIẾT (CHUẨN INVEST & GHERKIN)](#9-danh-sách-user-stories-chi-tiết-chuẩn-invest--gherkin)
10. [LỘ TRÌNH TRIỂN KHAI & QUẢN TRỊ RỦI RO](#10-lộ-trình-triển-khai--quản-trị-rủi-ro)

---

# 1. TỔNG QUAN HỆ THỐNG & ĐỊNH HƯỚNG KIẾN TRÚC V2.1

### 1.1. Tầm nhìn sản phẩm & Khách hàng mục tiêu

**OpenRace SaaS Platform (v2.1)** là nền tảng quản trị thi đấu thể thao trực tuyến kết hợp mạng xã hội và hệ thống ERP dành cho các Câu lạc bộ (CLB) chạy bộ, doanh nghiệp và cộng đồng thể thao phong trào. Hệ thống giải quyết 3 bài toán lớn:
1. **Tự động hóa vận hành giải đấu:** Loại bỏ việc nhập liệu thủ công bằng cơ chế Webhook Strava thời gian thực, thẩm định hợp lệ bằng Rule Engine đa tham số, chấm điểm và phạt tuần tự động.
2. **Minh bạch hóa tài chính:** Quản lý sổ cái bất biến, phân bổ quỹ phạt theo thành tích, sinh mã VietQR động chứa mã đối soát ngắn $\le 25$ ký tự.
3. **Gắn kết cộng đồng bền vững:** Mạng lưới bạn bè, bảng tin Kudos, phòng chat đa cấp độ, trợ lý ảo PacerBot AI và bộ máy trêu chọc thi đua (Banter Engine).

### 1.2. Bảng đối chiếu tiến hóa logic nghiệp vụ (v1.0 $\rightarrow$ v1.2 $\rightarrow$ v2.1)

| Hạng mục nghiệp vụ | Phiên bản 1.0 (SRS Cũ) | Phiên bản 1.2 (SDS Cơ bản) | Phiên bản 2.1 (Hiện hành) |
| :--- | :--- | :--- | :--- |
| **Quan hệ Người dùng - CLB** | 1 Người dùng $\in$ 1 CLB | 1 Người dùng $\in$ N CLB (bị động) | **1 Người dùng $\in$ N CLB tự do; quản trị đa CLB độc lập** |
| **Phạm vi giải đấu** | Mặc định nội bộ CLB | Nội bộ CLB | **3 Tùy chọn:** Nội bộ (`internal`), Cộng đồng (`community`), Chỉ định (`designated_whitelist`) |
| **Cấu trúc màn hình UI** | Màn hình đơn lẻ, quá tải nội dung | 6 Màn hình tổng hợp | **Chuẩn hóa Cặp 2 màn hình cho 10 phân hệ (20 màn hình chuyên biệt)** |
| **Quyền năng Đội trưởng** | Không có (chỉ là nhãn vai trò) | Xem tiến độ đội | **Đổi tên đội, cập nhật Avatar/cờ hiệu, duyệt thành viên, đôn đốc đội viên** |
| **Độ cao Trail & Gian lận** | Cứ 100m Gain cộng 1km | Chưa có trần thưởng | **Trần `max_bonus_km_per_activity`, sàn pace 2:45 min/km, chống sai số áp kế** |
| **Tương tác xã hội & AI** | Không có | Không có | **Đồ thị bạn bè, Thả Kudos, Bình luận, Chat WebSockets, Trợ lý PacerBot AI, Banter Roast Bot** |
| **Điều hành CLB (Club ERP)** | Không có | Chưa có | **Tạo biểu quyết (Polls), Lịch chạy Offline/RSVP, Cảnh báo kỷ luật, Kho giáo án tri thức** |

### 1.3. Bảng thuật ngữ chuyên ngành (Glossary)

* **Tenant:** Một Câu lạc bộ chạy bộ độc lập; ranh giới cô lập dữ liệu và tài khoản thụ hưởng tài chính.
* **Race:** Một giải đấu trực tuyến do một CLB tổ chức, áp dụng một bộ luật (`Rule Set`) riêng biệt.
* **Activity:** Bài chạy thô từ Strava, lưu trữ một lần duy nhất, không thể chỉnh sửa (`immutable`).
* **Activity Log:** Bản ghi thẩm định của 1 Activity trong ngữ cảnh 1 Race cụ thể (1 bài chạy có thể sinh nhiều logs cho nhiều giải).
* **Prorate:** Cơ chế giảm trừ chỉ tiêu tuần theo tỷ lệ số ngày thực tế tham gia đối với thành viên mới hoặc tuần lẻ.
* **Grace Hours:** Thời gian ân hạn sau khi tuần kết thúc (mặc định 6 giờ) trước khi chính thức chốt phạt.
* **Banter Engine:** Bộ máy sinh ngôn ngữ tự nhiên châm chọc hài hước nhằm kích thích động lực tập luyện trong nhóm chat.

### 1.4. Các nguyên tắc thiết kế bất biến

1. **Dữ liệu gốc bất biến, kết quả tính toán dẫn xuất (Idempotent & Deterministic):** Hoạt động thô lưu trữ vĩnh viễn; cự ly công nhận, điểm số, thứ hạng và công nợ có thể tái tính toán (`recompute`) bất kỳ lúc nào với kết quả đồng nhất.
2. **Cô lập dữ liệu đa người thuê (Strict Multi-Tenancy):** Dữ liệu tài chính, khiếu nại, sự kiện CLB được bảo vệ bằng PostgreSQL Row-Level Security (`club_id`). Dữ liệu người dùng và hoạt động chạy bộ là toàn cục.
3. **Mọi quyết định đều giải thích được (Explainability):** Mọi trạng thái bài chạy (Hợp lệ, Thưởng Trail, Loại) đều kèm mã lỗi kỹ thuật (`reject_code`) và dòng giải thích bằng ngôn ngữ tự nhiên.
4. **Tối ưu hóa thao tác người dùng (Zero-Friction UX):** Không bắt buộc người dùng nhập liệu những gì hệ thống có thể tự động suy luận hoặc đồng bộ từ GPS.

---

# 2. MA TRẬN PHÂN QUYỀN (RBAC) & 6 BỘ CÔNG CỤ QUẢN LÝ RIÊNG BIỆT

### 2.1. Phân quyền theo ngữ cảnh thực thể (Contextual RBAC)

Quyền hạn được xác định động tại tầng Service dựa trên cặp khóa thực thể: `(user_id, club_id)` trong bảng `club_members` và `(user_id, race_id)` trong bảng `race_participants`.

| Quyền hạn / Thao tác | Super Admin (`SA`) | Club Admin (`CA`) | Team Leader (`TL`) | Runner / Member (`RN`) | Guest / Khách |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Quản lý hạ tầng SaaS, Webhook toàn sàn | ✔ | — | — | — | — |
| Khóa/Mở CLB, phân bổ hạn mức gói dịch vụ | ✔ | — | — | — | — |
| Chỉnh sửa hồ sơ cá nhân, ngắt/nối Strava | Cá nhân | Cá nhân | Cá nhân | ✔ | — |
| Kết bạn, xem Feed cộng đồng, thả Kudos, Chat | ✔ | ✔ | ✔ | ✔ | Chỉ xem Feed |
| Tạo giải đấu mới, cấu hình Wizard Rule Set | Giám sát | ✔ | — | — | — |
| Phân chia vận động viên vào các đội | Giám sát | ✔ | — | — | — |
| Đổi tên đội, cập nhật cờ hiệu Avatar đội | Giám sát | ✔ | ✔ (Đội mình) | — | — |
| Xem tiến độ thành viên trong đội, gửi nhắc nhở | Giám sát | ✔ | ✔ (Đội mình) | Chỉ xem bản thân | — |
| Duyệt khiếu nại bài chạy, cấp miễn trừ phạt tuần | Giám sát | ✔ | — | Gửi yêu cầu | — |
| Cấu hình tài khoản VietQR, đối soát nộp quỹ | Giám sát | ✔ | — | Báo nộp tiền | — |
| Tạo buổi chạy Offline, tạo Biểu quyết, Cảnh báo kỷ luật | Giám sát | ✔ | Đề xuất | Tham gia/Biểu quyết | — |

### 2.2. Chi tiết 6 bộ công cụ quản lý chuyên biệt (Dedicated Management Portals)

1. **Bộ công cụ Quản lý Cá nhân (Personal Management Portal - `/me`):** Tự phục vụ quản trị hồ sơ, tình trạng đồng bộ Strava, quản lý sổ nợ cá nhân và thiết lập quyền riêng tư.
2. **Bộ công cụ Quản lý Đội thi đấu (Team Management Portal - `/r/{slug}/teams/{id}/manage`):** Dành riêng cho Đội trưởng để đổi tên, cờ hiệu đội, duyệt thành viên và giám sát phong độ thi đấu.
3. **Bộ công cụ Quản lý Giải đấu (Race Operations Portal - `/races/{slug}/admin`):** Vận hành giải đấu, cấu hình Rule Set 7 bước, phân chia đội, xử lý khiếu nại và đóng băng dữ liệu giải.
4. **Bộ công cụ Quản lý Câu lạc bộ (Club Operations Portal - `/clubs/{slug}/manage`):** Quản lý hồ sơ CLB, tài khoản VietQR, sự kiện sinh hoạt (RSVP), biểu quyết nội bộ, cảnh báo kỷ luật và kho giáo án.
5. **Bộ công cụ Quản lý Cộng đồng (Community Hub - `/community`):** Đồ thị bạn bè, kiểm duyệt bảng tin, điều hành phòng chat và quản lý tương tác xã hội.
6. **Bộ công cụ Quản trị Nền tảng (Super Admin Portal - `/admin`):** Giám sát hạn ngạch Strava Token Bucket, quản lý Tenant CLB, chạy job Recompute toàn sàn và xử lý hàng đợi lỗi.

---

# 3. CẤU TRÚC MENU ĐIỀU HƯỚNG & NGUYÊN TẮC THIẾT KẾ CẶP 2 MÀN HÌNH

### 3.1. Nguyên tắc cấu trúc Cặp 2 màn hình (Master-Detail / List-Action Pattern)

Để giải quyết triệt để tình trạng nhồi nhét thông tin trên giao diện di động và tối ưu hóa luồng thao tác người dùng, tài liệu V2.1 quy chuẩn hóa **mỗi phân hệ chức năng thành một cặp 2 màn hình bổ trợ lẫn nhau**:
* **Màn hình A (Dashboard / Master List / Overview):** Tập trung vào khả năng quét nhanh thông tin, hiển thị các chỉ số tổng quan (KPIs), thanh tiến độ, bộ lọc trạng thái và danh sách trực quan.
* **Màn hình B (Action / Detail / Operations):** Tập trung vào việc giải quyết tác vụ cụ thể, biểu mẫu nhập liệu có xác thực, đối soát chuyên sâu hoặc các công cụ điều hành nâng cao.

### 3.2. Cấu trúc cây Menu điều hướng toàn sàn

```
========================================================================================
CÂY MENU ĐIỀU HƯỚNG TOÀN SÀN OPENRACE V2.1 (CHỈ DẪN URL ROUTING)
========================================================================================

[PHÂN HỆ NGƯỜI DÙNG & RUNNER]
├── [1.0] Cá nhân & Đồng bộ Strava
│   ├── [1.A] Dashboard Runner (Personal Hub) ........................... Path: /
│   └── [1.B] Quản lý Kết nối & Nhật ký Strava Sync ................... Path: /me/strava-sync
├── [2.0] Giải đấu & Đấu trường
│   ├── [2.A] Khám phá & Danh sách Giải đấu ............................ Path: /races
│   └── [2.B] Đấu trường Giải & Bảng xếp hạng Thời gian thực ........... Path: /r/{race_slug}
├── [3.0] Nhật ký Hoạt động & Thẩm định
│   ├── [3.A] Bảng tổng hợp Bài chạy Cá nhân ........................... Path: /activities
│   └── [3.B] Chi tiết Thẩm định & Gửi Khiếu nại ....................... Path: /activities/{id}
├── [4.0] Câu lạc bộ & Tiếp nhận lời mời
│   ├── [4.A] Trang chủ Câu lạc bộ (Club Portal) ....................... Path: /c/{club_slug}
│   └── [4.B] Cổng Tiếp nhận Lời mời & Onboarding Gia nhập ............. Path: /join/{invite_token}
├── [5.0] Tài chính & Minh bạch Quỹ
│   ├── [5.A] Sổ nợ & VietQR Nộp tiền Cá nhân .......................... Path: /r/{race_slug}/my-finance
│   └── [5.B] Bảng Đối soát Quỹ Giải & Xác nhận Nộp tiền (Admin) ....... Path: /r/{race_slug}/finance/reconcile
├── [7.0] Đội thi đấu (Không gian Đội)
│   ├── [7.A] Danh bạ & Bảng phong độ Đội thi đấu ...................... Path: /r/{race_slug}/teams
│   └── [7.B] Không gian Quản trị Đội của Đội trưởng .................. Path: /r/{race_slug}/teams/{id}/manage
├── [8.0] Mạng xã hội Chạy bộ & Bạn bè
│   ├── [8.A] Bảng tin Hoạt động Cộng đồng (Social Feed) ............... Path: /community/feed
│   └── [8.B] Mạng lưới Bạn bè & Hồ sơ Vận động viên ................... Path: /community/friends
├── [9.0] Tán gẫu, PacerBot AI & Banter
│   ├── [9.A] Phòng Chat Thời gian thực (Kênh CLB & Đội) ............... Path: /chat
│   └── [9.B] Trung tâm Điều khiển AI PacerBot & Banter Engine ........ Path: /clubs/{slug}/banter-settings

[PHÂN HỆ BAN QUẢN TRỊ CLB & SUPER ADMIN]
├── [6.0] Điều hành Thể lệ Giải đấu
│   ├── [6.A] Danh sách Quản trị Giải đấu CLB .......................... Path: /clubs/{slug}/races-manage
│   └── [6.B] Wizard 7 bước Thiết lập Thể lệ & Dry-run ................. Path: /clubs/{slug}/races/wizard
└── [10.0] Điều hành Toàn diện Câu lạc bộ (Club ERP)
    ├── [10.A] Trung tâm Điều hành CLB (Tổng quan & Quản lý Thành viên) . Path: /clubs/{slug}/manage
    └── [10.B] Quản trị Kỷ luật, Lịch Sự kiện & Kho Tri thức ........... Path: /clubs/{slug}/governance
========================================================================================
```

---

# 4. ĐẶC TẢ CHI TIẾT 10 CẶP MÀN HÌNH CHỨC NĂNG (20 MÀN HÌNH LÕI)

---

### Cặp 1: Cá nhân & Đồng bộ Strava

#### Màn hình UI-01A: Dashboard Runner (Personal Hub) — Path: `/`
* **Mục tiêu:** Màn hình chính khi đăng nhập, cung cấp cho Runner bức tranh toàn cảnh về tiến độ tập luyện trong tuần, trạng thái kết nối Strava và các giải đấu đang thi đấu.
* **Bố cục & Khối hiển thị:**
  * **Header người dùng:** Avatar tròn 48px, tên hiển thị, pill trạng thái Strava (Xanh lá `Connected` kèm mốc đồng bộ cuối; hoặc Cam `Action Required` nhấp nháy nhẹ nếu token hết hạn), nút Quét QR tham gia giải nhanh.
  * **Thẻ tiến độ chu kỳ tuần (Weekly Cycle Hero Card):** Vòng tiến độ SVG trung tâm (màu Volt `#CCFF00`), hiển thị số đo dạng Monospace lớn: `XX.X / Target km`. Dòng đếm ngược: *"Còn X ngày Y giờ trước khi chốt tuần"*.
  * **Banner Cảnh báo phạt sớm:** Xuất hiện viền đỏ `#EF4444` khi thời gian tuần còn $< 48$ giờ mà chưa đạt tối thiểu 70% chỉ tiêu. Dòng thông điệp: *"Nguy cơ phạt 50.000đ nếu không chạy đủ X km trước 23:59 Chủ Nhật"*.
  * **Carousel Giải đấu đang tham gia:** Thẻ cuộn ngang hiển thị tên giải, cờ hiệu đội, thứ hạng hiện tại của đội (`#1 Dẫn đầu` hoặc `Đồng hạng 2`) và số km cá nhân đóng góp.
  * **Danh sách 3 bài chạy mới nhất:** Thẻ bài tập rút gọn kèm tem trạng thái thẩm định.
* **Thao tác nghiệp vụ:**
  * Bấm vào Thẻ tuần $\rightarrow$ Mở bottom-sheet chi tiết các bài chạy đã đóng góp vào tuần.
  * Bấm vào Pill Strava $\rightarrow$ Chuyển sang màn hình UI-01B.
  * Bấm vào Thẻ giải đấu $\rightarrow$ Chuyển đến Race Arena (UI-02B).

#### Màn hình UI-01B: Quản lý Kết nối & Nhật ký Strava Sync — Path: `/me/strava-sync`
* **Mục tiêu:** Tra cứu tình trạng đồng bộ kỹ thuật, cấp quyền/ngắt kết nối Strava và theo dõi chi tiết từng gói tin webhook gửi về từ Strava.
* **Bố cục & Khối hiển thị:**
  * **Khối điều khiển liên kết OAuth:** Nút "Ngắt kết nối Strava" (màu đỏ Subtle), thông tin tài khoản Strava Athlete ID, ngày cấp quyền, danh sách quyền đã cấp (`read,activity:read_all`). Nút "Kết nối lại Strava" nếu tài khoản bị revoke.
  * **Khối thao tác thủ công:** Nút "Quét đồng bộ lại dữ liệu" (Manual Resync Button) kèm nhãn giới hạn: *"Cho phép quét lại 1 lần mỗi 15 phút"*.
  * **Bảng nhật ký truyền dữ liệu (`strava_sync_logs`):**
    * Cột 1: Thời điểm nhận webhook (UTC+7, format `DD/MM/YYYY HH:mm:ss`).
    * Cột 2: Mã bài tập (`strava_activity_id`) kèm liên kết mở trực tiếp trên Strava.
    * Cột 3: Loại sự kiện (`activity/create`, `activity/update`, `activity/delete`).
    * Cột 4: Trạng thái xử lý (`Processed`, `Ignored`, `Rate_Limited`, `Failed`).
    * Cột 5: Chi tiết giải trình (Ví dụ: *"Đã thẩm định cho 2 giải"*, *"Bỏ qua do bài nhập tay manual"*).
  * **Drawer xem chi tiết Payload:** Chạm vào dòng để mở ngăn kéo bên phải xem chuỗi JSON thô từ Strava phục vụ đối chiếu lỗi.
* **Thao tác nghiệp vụ:**
  * Nhấn "Ngắt kết nối" $\rightarrow$ Hiển thị Dialog cảnh báo: *"Hệ thống sẽ dừng ghi nhận thành tích từ thời điểm này. Các giải đấu đã kết thúc không bị ảnh hưởng."* $\rightarrow$ Xác nhận $\rightarrow$ Gọi API `DELETE /me/strava`.
  * Nhấn "Quét đồng bộ lại" $\rightarrow$ Hiển thị thanh tiến trình Skeleton, gọi API `POST /me/strava/resync` $\rightarrow$ Cập nhật tức thì các dòng mới vào bảng log.

---

### Cặp 2: Khám phá & Đấu trường giải đấu

#### Màn hình UI-02A: Khám phá & Danh sách Giải đấu — Path: `/races`
* **Mục tiêu:** Cung cấp cổng danh mục toàn bộ các giải đấu mà người dùng có quyền tiếp cận hoặc tìm kiếm giải đấu cộng đồng để đăng ký.
* **Bố cục & Khối hiển thị:**
  * **Thanh tìm kiếm & Bộ lọc phạm vi (Scope Filter):** 3 Tab chuyển trạng thái: `Tất cả` | `Nội bộ CLB của tôi` | `Cộng đồng toàn sàn`.
  * **Danh sách giải dạng Grid:** Mỗi thẻ giải bao gồm:
    * Ảnh bìa Banner giải (tỷ lệ 16:9), Logo CLB tổ chức ở góc trái.
    * Badge trạng thái: Xanh lá `Đang diễn ra (Running)`, Vàng `Sắp mở đăng ký (Open)`, Xám `Đã kết thúc (Closed)`.
    * Tag phạm vi giải: `Nội bộ CLB` | `Cộng đồng mở rộng` | `Chỉ định danh sách`.
    * Chỉ số tóm tắt: Thời gian đếm ngược, số lượng vận động viên đã ghi danh / tối đa (`current / max_participants`), hình thức thi đấu (Đồng đội / Cá nhân).
    * Thanh tiến độ sĩ số (áp dụng cho giải có trần `max_participants`).
* **Thao tác nghiệp vụ:**
  * Nhấp vào thẻ giải nội bộ mà người dùng đã là thành viên $\rightarrow$ Chuyển thẳng vào UI-02B.
  * Nhấp vào giải cộng đồng chưa đăng ký $\rightarrow$ Mở Modal tóm tắt thể lệ và nút "Đăng ký tham gia ngay".
  * Nhấp vào giải chỉ định mà người dùng không có trong Whitelist $\rightarrow$ Hiển thị thông báo: *"Giải đấu giới hạn danh sách. Vui lòng liên hệ Ban tổ chức CLB để được cấp quyền"*.

#### Màn hình UI-02B: Đấu trường Giải & Bảng xếp hạng Thời gian thực — Path: `/r/{race_slug}`
* **Mục tiêu:** Khu vực thi đấu chính của giải đấu, hiển thị số liệu Hero toàn giải, đồng hồ đếm ngược và bảng xếp hạng đội/cá nhân cập nhật trực tiếp qua SSE.
* **Bố cục & Khối hiển thị:**
  * **Hero Header:** Tên giải in hoa font Chakra Petch, Logo CLB, đồng hồ đếm ngược `Ngày : Giờ : Phút : Giây`. Khối 3 chỉ số lớn: `Tổng VĐV`, `Tổng Cự ly Hợp lệ (km)`, `Tổng Người-Ngày`.
  * **Bộ chuyển Tab Xếp hạng:** Phân đoạn `BẢNG XẾP HẠNG ĐỘI` | `BẢNG XẾP HẠNG CÁ NHÂN`.
  * **Tab Đội:**
    * Thẻ Đội Hạng 1: Viền vàng ánh kim, huy hiệu Vương miện, tên đội, điểm cự ly (/10), điểm chuyên cần (/10), Tổng điểm làm tròn 1 chữ số thập phân (/20). Nhãn: *"Đang dẫn đầu - Quỹ dự kiến 100.000đ/người"*.
    * Các thẻ Đội còn lại: Viền bạc, đồng bộ nhãn: *"Đồng hạng 2 - Quỹ dự kiến 200.000đ/người"*.
    * Nút "Xem phân tích điểm" trên từng thẻ đội để mở Drawer xem chi tiết tổng km và danh sách ngày chạy của đội viên.
  * **Tab Cá nhân:** Bảng danh sách cuộn vô hạn, hiển thị Hạng, Avatar, Tên, Tên Đội, Tổng km hợp lệ. Top 1 cá nhân được bao viền phát sáng Volt kèm nhãn thưởng: *"Dẫn đầu nhận Áo Finisher CLB"*.
  * **Sticky Bottom Bar:** Luôn ghim vị trí và thành tích của chính người dùng ở đáy màn hình khi cuộn trang.
* **Thao tác nghiệp vụ:**
  * Kết nối Server-Sent Events (`GET /races/{slug}/stream`) tự động kích hoạt animation đổi chỗ thứ hạng khi có bài chạy mới mà không làm giật trang.
  * Bộ lọc tìm kiếm vận động viên trong bảng xếp hạng với độ trễ (debounce) 300ms.

---

### Cặp 3: Nhật ký hoạt động & Thẩm định

#### Màn hình UI-03A: Bảng tổng hợp Bài chạy Cá nhân — Path: `/activities`
* **Mục tiêu:** Cung cấp danh sách toàn bộ các hoạt động chạy bộ được đồng bộ về từ Strava, phục vụ lọc nhanh theo trạng thái thẩm định.
* **Bố cục & Khối hiển thị:**
  * **Bộ lọc nhanh đa chiều:** Nhóm nút lọc: `Tất cả` | `Hợp lệ` | `Được thưởng Trail` | `Không hợp lệ / Lỗi`. Dropdown chọn giải đấu áp dụng.
  * **Danh sách bài chạy nhóm theo Ngày (`local_date`):**
    * Dòng tiêu đề ngày: Hiển thị ngày trong tuần, ngày tháng năm và tổng km hợp lệ tích lũy trong ngày đó.
    * Thẻ hoạt động con: Tiêu đề bài chạy từ Strava, icon Road/Trail, giờ bắt đầu.
    * 4 Chỉ số kỹ thuật chính font Monospace: Cự ly (km), Pace trung bình (phút:giây/km), Độ cao tích lũy Gain (m), Thời gian di chuyển (Moving Time).
    * Tem thẩm định màu chuẩn: Xanh lá `HỢP LỆ`, Tím `TRAIL BONUS +X.X KM`, Đỏ `KHÔNG HỢP LỆ`.
* **Thao tác nghiệp vụ:**
  * Chạm vào bất kỳ thẻ bài chạy nào $\rightarrow$ Điều hướng tới màn hình chi tiết thẩm định UI-03B.

#### Màn hình UI-03B: Chi tiết Thẩm định & Gửi Khiếu nại — Path: `/activities/{id}`
* **Mục tiêu:** Minh bạch hóa 100% lý do bài chạy được tính điểm hoặc bị loại theo từng giải đấu cụ thể; cung cấp biểu mẫu gửi đơn khiếu nại kèm minh chứng cho Ban tổ chức.
* **Bố cục & Khối hiển thị:**
  * **Bản đồ lộ trình & Chỉ số chuyên sâu:** Bản đồ Polyline tĩnh của bài chạy, biểu đồ nhịp tim/pace theo thời gian (nếu người dùng chia sẻ).
  * **Hộp giải trình Pipeline Thẩm định (Audit Pipeline Breakdown):** Liệt kê chi tiết 6 bước kiểm tra:
    * Bước 0: Nguồn dữ liệu $\rightarrow$ Đạt (`Run`, Không manual).
    * Bước 1: Khung giờ giải $\rightarrow$ Đạt (Nằm trong khoảng thời gian diễn ra giải).
    * Bước 2: Cự ly tối thiểu $\rightarrow$ Đạt ($5.2\text{ km} \ge 3.0\text{ km}$).
    * Bước 3: Dải Pace & Trail $\rightarrow$ Đạt / Thưởng / Loại kèm dòng giải trình công thức toán học chi tiết.
    * Bước 4: Chống trùng $\rightarrow$ Đạt (Không chồng lấn bài khác $>50\%$).
    * Bước 5: Giới hạn ngày $\rightarrow$ Đạt (Bài thứ 1/2 trong ngày).
  * **Khu vực Khiếu nại (Appeals Section):** Xuất hiện khi bài chạy có tem `KHÔNG HỢP LỆ`.
    * Form gửi khiếu nại: Dropdown chọn lý do (Lỗi GPS nhảy độ cao, Trôi pace, Đồng hồ hết pin chạy 2 bài tách đoạn), Textarea nhập giải trình chi tiết, ô tải lên tối đa 3 ảnh minh chứng (chụp màn hình đồng hồ Garmin/Apple Watch).
    * Nút bấm: "Gửi khiếu nại tới Ban quản trị CLB".
* **Thao tác nghiệp vụ:**
  * Nhấn "Gửi khiếu nại" $\rightarrow$ Kiểm tra hợp lệ form $\rightarrow$ Gọi API `POST /races/{slug}/appeals` $\rightarrow$ Tem bài chạy đổi sang màu xanh dương `ĐANG KHIẾU NẠI` và khóa form chỉnh sửa.

---

### Cặp 4: Không gian CLB & Tiếp nhận lời mời

#### Màn hình UI-04A: Trang chủ Câu lạc bộ (Club Portal) — Path: `/c/{club_slug}`
* **Mục tiêu:** Không gian sinh hoạt trực tuyến của một CLB, nơi thành viên xem thông tin CLB, ban chủ nhiệm, danh mục giải đấu và tham gia các hoạt động tập thể.
* **Bố cục & Khối hiển thị:**
  * **Club Header:** Ảnh bìa CLB Panorama, Avatar tròn thương hiệu, Tên CLB, slogan, số lượng thành viên chính thức, danh sách Ban chủ nhiệm.
  * **Thanh tác vụ nhanh:** Nút "Mời thành viên" (mở Bottom-sheet chia sẻ QR/link), Nút "Lịch sinh hoạt" (chuyển sang sự kiện), Nút "Phòng Chat CLB". Nút "Quản trị CLB" (chỉ hiển thị với Club Admin).
  * **Danh sách giải đấu trực thuộc CLB:** Phân loại 3 nhóm: `Đang diễn ra`, `Sắp diễn ra`, `Đã hoàn thành`.
  * **Bảng tin hoạt động nội bộ CLB:** Tin tức ghim, thông báo lịch chạy cuối tuần từ Ban chủ nhiệm.
* **Thao tác nghiệp vụ:**
  * Thành viên nhấn "Mời bạn bè" $\rightarrow$ Hiển thị Drawer chứa Mã QR SVG chất lượng cao để tải về, nút "Sao chép liên kết" và nút "Chia sẻ lên Zalo/Facebook".

#### Màn hình UI-04B: Cổng Tiếp nhận Lời mời & Onboarding Gia nhập — Path: `/join/{invite_token}`
* **Mục tiêu:** Tiếp nhận người dùng từ các liên kết chia sẻ hoặc mã QR, xử lý thoát bẫy Webview nhúng, cho phép đăng nhập và hoàn tất thủ tục đăng ký giải/CLB trong một luồng mượt mà.
* **Bố cục & Khối hiển thị:**
  * **Biểu ngữ thoát Webview (In-App Browser Detour Banner):** Xuất hiện khi phát hiện User-Agent từ Facebook/Zalo: *"Bạn đang mở trong ứng dụng Zalo/Facebook. Vui lòng bấm menu ⋮ và chọn 'Mở bằng trình duyệt Chrome/Safari' để đăng nhập an toàn"*. Đi kèm nút "Sao chép mã ngắn" (`short_code` 6 ký tự) để tự động khôi phục ý định khi mở trình duyệt rời.
  * **Thẻ thông tin lời mời:** Logo CLB, Tên giải đấu, thông điệp mời từ Ban tổ chức, tóm tắt điều lệ giải.
  * **Khối chọn đội (Team Selection):** Dropdown hiển thị danh sách các đội thi đấu kèm sĩ số hiện tại/tối đa. Các đội đã đầy tự động làm mờ và gắn nhãn `Đã đủ người`.
  * **Khối đồng thuận dữ liệu (Consent Checkboxes):** Tách bạch rõ 2 ô tích chọn bắt buộc:
    * [x] *"Tôi đồng ý kết nối dữ liệu Strava để hệ thống tự động chấm điểm giải chạy."*
    * [x] *"Tôi đồng ý công khai cự ly và trạng thái đóng quỹ trong nội bộ giải đấu."*
  * **Nút hành động chính:**
    * Nếu chưa đăng nhập: "ĐĂNG NHẬP GOOGLE/APPLE ĐỂ TIẾP TỤC" (Lưu `pending_join` vào session).
    * Nếu đã đăng nhập nhưng chưa nối Strava: "XÁC NHẬN & LIÊN KẾT STRAVA".
    * Nếu đã sẵn sàng: "XÁC NHẬN GIA NHẬP GIẢI ĐẤU".
* **Thao tác nghiệp vụ:**
  * Người dùng bấm xác nhận $\rightarrow$ Gọi API `POST /invitations/{token}/accept` $\rightarrow$ Tạo bản ghi trong `club_members` và `race_participants` $\rightarrow$ Chuyển hướng người dùng thẳng tới Đấu trường giải đấu (UI-02B).

---

### Cặp 5: Tài chính & Đối soát quỹ

#### Màn hình UI-05A: Sổ nợ & VietQR Nộp tiền Cá nhân — Path: `/r/{race_slug}/my-finance`
* **Mục tiêu:** Cung cấp cho từng vận động viên sự minh bạch tuyệt đối về các khoản nghĩa vụ tài chính (tiền quỹ giải theo thứ hạng đội + các khoản phạt tuần vi phạm), hỗ trợ thanh toán một chạm qua VietQR.
* **Bố cục & Khối hiển thị:**
  * **Thẻ tổng nợ cá nhân (Personal Debt Card):**
    * Dòng số tiền lớn font Monospace: `TỔNG CỘNG PHẢI NỘP: XXX.000 VNĐ`.
    * Trạng thái công nợ: `Tạm tính` (khi giải đang chạy), `Chính thức` (sau khi giải kết thúc hoặc sau mốc ân hạn tuần), hoặc `Đã thanh toán đủ`.
  * **Bảng chi tiết các khoản mục (Itemized Ledger Table):**
    * Mục 1: Tiền đóng quỹ theo thứ hạng đội (100.000đ nếu Đội Hạng 1; 200.000đ nếu Đội Đồng Hạng 2).
    * Mục 2..N: Các tuần vi phạm chỉ tiêu (Ví dụ: *"Tuần 2: Đạt 14.5/20.0 km (Thiếu 5.5 km) - Phạt 50.000đ"*).
    * Các khoản được miễn trừ: Hiển thị 0đ kèm nhãn `ĐÃ ĐƯỢC MIỄN TRỪ` và lý do do Admin phê duyệt.
  * **Khung thanh toán VietQR động:**
    * Ảnh mã VietQR sinh chuẩn theo định dạng thanh toán NAPAS 247.
    * Thông tin thụ hưởng: Tên chủ tài khoản quỹ CLB, Ngân hàng, Số tài khoản, Số tiền chính xác.
    * **Mã tham chiếu chuyển khoản (Transfer Reference):** Chuỗi ký tự chuẩn hóa duy nhất $\le 25$ ký tự (Ví dụ: `OR10-K7Q2`), đi kèm nút "Sao chép nội dung chuyển khoản".
  * **Nút xác nhận:** Nút bấm "TÔI ĐÃ CHUYỂN KHOẢN" (Mở modal nhập mã giao dịch ngân hàng tùy chọn hoặc ảnh chụp biên lai).
* **Thao tác nghiệp vụ:**
  * Runner chuyển khoản bằng app ngân hàng $\rightarrow$ Bấm "Tôi đã chuyển khoản" $\rightarrow$ Trạng thái khoản thanh toán chuyển thành `pending` (Chờ xác nhận) và gửi thông báo tới Ban chủ nhiệm CLB.

#### Màn hình UI-05B: Bảng Đối soát Quỹ Giải & Xác nhận Nộp tiền (Admin) — Path: `/r/{race_slug}/finance/reconcile`
* **Mục tiêu:** Dành riêng cho Club Admin để kiểm soát toàn bộ dòng tiền của giải đấu, đối chiếu tiền về tài khoản ngân hàng và phê duyệt gạch nợ cho thành viên.
* **Bố cục & Khối hiển thị:**
  * **Thẻ KPIs Tài chính Toàn giải:** Tổng công nợ toàn giải, Tổng số tiền đã thu thực tế, Số tiền còn tồn đọng, Tỷ lệ hoàn thành thu quỹ.
  * **Bảng điều hành đối soát (Reconciliation Master Table):**
    * Cột 1: Vận động viên (Avatar, Tên, Đội thi đấu).
    * Cột 2: Thứ hạng đội & Mức quỹ quy định.
    * Cột 3: Số tuần vi phạm / Số tiền phạt.
    * Cột 4: Tổng phải nộp (VNĐ).
    * Cột 5: Mã tham chiếu VietQR của cá nhân đó.
    * Cột 6: Trạng thái thanh toán (`Chưa nộp`, `Chờ xác nhận`, `Đã thu đủ`).
    * Cột 7: Thao tác: Nút bấm "Xác nhận đã thu" (Tick xanh), Nút "Từ chối" (Dấu X đỏ), Nút "Cấp miễn trừ phạt".
  * **Thanh công cụ xuất báo cáo:** Nút "Xuất Báo cáo Excel / PDF" chứa chữ ký điện tử và dấu thời gian đóng sổ.
* **Thao tác nghiệp vụ:**
  * Admin đối chiếu sao kê ngân hàng thấy mã `OR10-K7Q2` đã nhận tiền $\rightarrow$ Nhấn nút "Xác nhận đã thu" trên dòng tương ứng $\rightarrow$ Hệ thống ghi một bút toán âm vào `ledger_entries` $\rightarrow$ Số nợ của Runner về 0đ và gửi thông báo xác nhận thành công tới Runner.
  * Admin nhấn "Cấp miễn trừ phạt" cho một tuần cụ thể của VĐV $\rightarrow$ Mở Dialog nhập lý do (ốm đau/công tác) $\rightarrow$ Lưu bản ghi `penalty_waivers` và tự động tính lại tổng nợ.

---

### Cặp 6: Điều hành thể lệ giải đấu

#### Màn hình UI-06A: Danh sách Quản trị Giải đấu CLB — Path: `/clubs/{slug}/races-manage`
* **Mục tiêu:** Trung tâm điều hành của Club Admin để theo dõi vòng đời tất cả các giải đấu do CLB mình tổ chức, khởi tạo giải đấu mới hoặc đóng băng giải.
* **Bố cục & Khối hiển thị:**
  * **Thanh tác vụ:** Nút "TẠO GIẢI ĐẤU MỚI" (Dẫn tới Wizard UI-06B), Nút "Nhân bản từ giải mẫu" (Sao chép thể lệ giải cũ).
  * **Bảng danh sách giải đấu:**
    * Thông tin: Tên giải, Phạm vi (`Nội bộ` / `Cộng đồng` / `Chỉ định`), Trạng thái vòng đời (`draft`, `open`, `running`, `finalizing`, `closed`), Số lượng người tham gia / Giới hạn.
    * Phiên bản thể lệ đang kích hoạt (`active_rule_version`).
    * Cột Thao tác quản trị:
      * Nút "Chuyển trạng thái" (Ví dụ: Từ `running` sang `finalizing` để ân hạn khiếu nại).
      * Nút "Sửa thể lệ" (Chỉ cho phép khi giải ở trạng thái `draft`; nếu đang `running` sẽ tạo phiên bản Rule Set mới).
      * Nút "Chốt giải & Đóng băng dữ liệu" (Chụp ảnh snapshot và khóa sổ).
* **Thao tác nghiệp vụ:**
  * Admin nhấn "Chốt giải" $\rightarrow$ Hiển thị Modal kiểm tra điều kiện (Còn khiếu nại nào chưa xử lý không? Còn khoản phạt nào chưa chốt không?) $\rightarrow$ Xác nhận $\rightarrow$ Gọi API `POST /races/{slug}/transition` với action `close` $\rightarrow$ Sinh ảnh chụp bất biến `race_snapshots`.

#### Màn hình UI-06B: Wizard 7 bước Thiết lập Thể lệ & Dry-run — Path: `/clubs/{slug}/races/wizard`
* **Mục tiêu:** Cung cấp quy trình 7 bước trực quan, có kiểm tra hợp lệ tại chỗ để Club Admin tự do cấu hình toàn bộ tham số giải chạy mà không cần can thiệp kỹ thuật.
* **Bố cục & Khối hiển thị 7 Bước:**
  * **Bước 1: Thông tin cơ bản & Múi giờ:** Tên giải, slug URL, ngày giờ bắt đầu và kết thúc, múi giờ (Mặc định `Asia/Ho_Chi_Minh`), Phạm vi giải đấu (Chọn 1 trong 3: `Nội bộ CLB`, `Cộng đồng mở rộng`, `Chỉ định danh sách Whitelist`), Sĩ số tối đa `max_participants`.
  * **Bước 2: Bộ lọc bài chạy & Sàn Pace:** Cự ly tối thiểu (Mặc định 3.0 km), Trần số bài hợp lệ/ngày (Mặc định 2 bài), Thanh trượt dải Pace kép (`pace_min` từ 4:00 đến `pace_max` 10:00). Hiển thị cố định sàn pace hệ thống 2:45 min/km và chặn Admin cấu hình nhanh hơn sàn. Bật/tắt quy tắc Trail: Gain tối thiểu (100m), tỷ lệ thưởng leo dốc (Mỗi 100m Gain cộng 1.0 km), Trần thưởng tối đa mỗi bài (`max_bonus_km_per_activity`).
  * **Bước 3: Chỉ tiêu chu kỳ tuần & Phạt:** Chỉ tiêu tuần (Mặc định 20.0 km), Số tiền phạt vi phạm tuần (50.000đ), Thời gian ân hạn (`grace_hours`, mặc định 6 giờ), Chính sách xử lý tuần lẻ (`partial_week_policy`: `prorate` tính theo tỷ lệ / `skip` bỏ qua / `full` phạt đủ).
  * **Bước 4: Tỷ trọng điểm, Công thức & Quỹ đội:** Thanh trượt tỷ trọng Cự ly / Chuyên cần (Mặc định 50% / 50% ứng với thang 10 + 10 điểm). Trần số ngày chuyên cần (Mặc định 140 ngày). Lựa chọn chiến lược chấm điểm: `Tổng điểm đội (sum_team_v1)` hoặc `Bình quân quân số (avg_per_member_v1)`. Cấu hình bảng bậc quỹ nộp theo hạng: Hạng 1 (100.000đ), Đồng hạng 2 (200.000đ).
  * **Bước 5: Khen thưởng cá nhân:** Tên giải thưởng hiện vật trao cho Top 1 cá nhân (Ví dụ: *"Áo Finisher SARC Dệt Kim"*), ô tải ảnh mô phỏng giải thưởng.
  * **Bước 6: Thiết lập Đội thi đấu:** Chính sách chia đội (`team_policy`: Admin xếp / VĐV tự chọn / VĐV tự tạo đội), Sức chứa mỗi đội `team_capacity`, Tạo trước danh sách các đội ban đầu và bổ nhiệm Đội trưởng.
  * **Bước 7: Mô phỏng Dry-run & Xuất bản:**
    * Tóm tắt toàn bộ thể lệ bằng văn bản ngôn ngữ tự nhiên.
    * Nút "CHẠY MÔ PHỎNG (DRY-RUN)": Hệ thống lấy dữ liệu bài chạy mẫu hoặc dữ liệu mùa trước chạy qua Rule Set mới và trả về bảng số liệu dự phóng: *Tỷ lệ bài hợp lệ, Số bài bị loại theo từng mã lỗi, Số vận động viên ước tính bị phạt*.
    * Lựa chọn mức hiển thị tài chính: `Công khai toàn giải` hoặc `Chỉ Admin xem`.
    * Nút "XUẤT BẢN GIẢI ĐẤU".
* **Thao tác nghiệp vụ:**
  * Tại Bước 7, Admin nhấn "Chạy mô phỏng" $\rightarrow$ Gọi API `POST /races/{slug}/rules/simulate` $\rightarrow$ Render kết quả trực quan dạng biểu đồ hình tròn $\rightarrow$ Nếu hài lòng, nhấn "Xuất bản" để chuyển trạng thái giải sang `open` hoặc `running`.

---

### Cặp 7: Đội thi đấu & Quyền năng Đội trưởng

#### Màn hình UI-07A: Danh bạ & Bảng phong độ Đội thi đấu — Path: `/r/{race_slug}/teams`
* **Mục tiêu:** Cung cấp cái nhìn tổng quan về tương quan lực lượng giữa các đội trong giải đấu, theo dõi danh sách thành viên và phong độ cự ly của từng đội.
* **Bố cục & Khối hiển thị:**
  * **Thẻ tóm tắt từng Đội:**
    * Header thẻ: Cờ hiệu Avatar riêng của đội, Tên đội độc nhất, Tên Đội trưởng kèm huy hiệu Thuyền trưởng.
    * Sĩ số đội viên / Sức chứa tối đa (Ví dụ: `15 / 15 thành viên`).
    * Tổng km hợp lệ toàn đội đã tích lũy, Tổng số ngày chạy chăm chỉ của toàn đội.
    * Điểm số tạm tính hiện tại và thứ hạng dự kiến.
  * **Danh sách thành viên rút gọn:** Avatar stack của các thành viên trong đội; bấm vào thẻ để mở rộng xem bảng chi tiết từng cá nhân (Số km đóng góp, số ngày chạy, trạng thái chỉ tiêu tuần này).
* **Thao tác nghiệp vụ:**
  * Nếu giải bật chế độ tự chọn đội (`self_select`) và người dùng chưa có đội $\rightarrow$ Hiển thị nút "GIA NHẬP ĐỘI NÀY" trên các thẻ đội còn chỗ trống.
  * Đội trưởng nhìn thấy nút "VÀO KHÔNG GIAN ĐIỀU HÀNH ĐỘI" trên thẻ đội của mình $\rightarrow$ Chuyển sang màn hình UI-07B.

#### Màn hình UI-07B: Không gian Quản trị Đội của Đội trưởng — Path: `/r/{race_slug}/teams/{id}/manage`
* **Mục tiêu:** Trao quyền năng quản trị thực thụ cho Đội trưởng để tùy biến thương hiệu đội, giám sát chi tiết phong độ từng thành viên và đôn đốc thi đua.
* **Bố cục & Khối hiển thị:**
  * **Khối Tùy biến Nhận diện Đội (Team Identity Customizer):**
    * Ô nhập Tên đội (Kiểm tra trùng lặp thời gian thực với các đội khác trong giải).
    * Khu vực tải lên / Thay đổi Cờ hiệu / Ảnh đại diện của đội (Hỗ trợ cắt ảnh vuông tỷ lệ 1:1, dung lượng $\le 5$ MB).
    * Nút "LƯU THAY ĐỔI NHẬN DIỆN".
  * **Ma trận Phong độ Thành viên trong Đội (Team Roster Matrix):**
    * Bảng danh sách chi tiết toàn bộ thành viên trong đội:
      * Cột 1: Vận động viên (Avatar, Tên).
      * Cột 2: Cự ly tích lũy toàn giải (km).
      * Cột 3: Số ngày hợp lệ đã đóng góp cho trần chuyên cần của đội.
      * Cột 4: Tiến độ tuần hiện tại: Hiển thị thanh bar `X / 20 km`.
      * Cột 5: Trạng thái: Xanh lá `Đã đạt tuần`, Vàng `Đang chạy`, Đỏ `Nguy cơ phạt`.
      * Cột 6: Thao tác đôn đốc: Nút "Nhắc nhở qua Chat" (Tự động gửi tin nhắn tag tên thành viên trong kênh chat của đội).
  * **Khối Phê duyệt Thành viên (Nếu có yêu cầu gia nhập):** Danh sách các vận động viên đang chờ vào đội kèm nút "Chấp thuận" hoặc "Từ chối".
* **Thao tác nghiệp vụ:**
  * Đội trưởng đổi tên đội từ "Đội 1" thành "Chiến Binh Bất Bại" và tải ảnh cờ hiệu $\rightarrow$ Bấm lưu $\rightarrow$ Gọi API `PATCH /teams/{id}` $\rightarrow$ Cập nhật tức thì trên toàn bộ Bảng xếp hạng của giải.
  * Đội trưởng nhấn nút "Nhắc nhở" cạnh thành viên nguy cơ phạt $\rightarrow$ Hệ thống kích hoạt Bot gửi tin nhắn đôn đốc vào kênh chat riêng của đội.

---

### Cặp 8: Mạng xã hội Chạy bộ & Bạn bè

#### Màn hình UI-08A: Bảng tin Hoạt động Cộng đồng (Social Feed) — Path: `/community/feed`
* **Mục tiêu:** Không gian tương tác xã hội thể thao đa CLB, nơi các vận động viên chia sẻ hoạt động chạy bộ, cổ vũ và bình luận trao đổi kinh nghiệm.
* **Bố cục & Khối hiển thị:**
  * **Thanh lọc 3 Luồng tin (Feed Stream Tabs):**
    * `Khám phá (Toàn sàn)`: Hoạt động chạy bộ nổi bật từ tất cả các CLB trên OpenRace.
    * `CLB của tôi`: Chỉ hiển thị bài tập của các thành viên trong các CLB người dùng đã tham gia.
    * `Bạn bè`: Chỉ hiển thị hoạt động của những người nằm trong danh sách bạn bè kết nối 2 chiều.
  * **Thẻ bài viết hoạt động xã hội (Social Activity Card):**
    * Header thẻ: Avatar người chạy, tên hiển thị, tên CLB trực thuộc, mốc thời gian hoàn thành.
    * Thông số chạy: Cự ly lớn (km), Pace trung bình, Độ cao Gain, Thời gian di chuyển.
    * Khung hiển thị Bản đồ tĩnh Polyline hoặc ảnh kỷ niệm chạy bộ do người dùng đính kèm.
    * Tem giải đấu: Nếu bài chạy được ghi nhận vào giải nào, hiển thị chip giải đấu đó.
    * Khu vực tương tác:
      * Nút "KUDOS" (Biểu tượng ngọn lửa/vỗ tay màu Volt): Hiển thị số lượng Kudos, bấm để thả/hủy Kudos.
      * Nút "Bình luận": Hiển thị số lượt bình luận.
      * Danh sách bình luận gần nhất và ô nhập bình luận nhanh.
      * Nút menu dấu 3 chấm: "Báo cáo bài viết vi phạm", "Ẩn hoạt động".
* **Thao tác nghiệp vụ:**
  * Nhấn nút Kudos $\rightarrow$ Gọi API `POST /activities/{id}/kudos` $\rightarrow$ Tăng biến đếm và kích hoạt hiệu ứng nảy icon Kudos thời gian thực.
  * Nhập bình luận $\rightarrow$ Gọi API `POST /activities/{id}/comments` $\rightarrow$ Bình luận xuất hiện tức thì bên dưới thẻ hoạt động.

#### Màn hình UI-08B: Mạng lưới Bạn bè & Hồ sơ Vận động viên — Path: `/community/friends`
* **Mục tiêu:** Quản lý đồ thị bạn bè kết nối 2 chiều, tìm kiếm bạn chạy mới theo tên/email/mã QR và tra cứu hồ sơ thể thao cá nhân của runner khác.
* **Bố cục & Khối hiển thị:**
  * **Thanh tìm kiếm Runner:** Ô tìm kiếm theo tên hoặc email, nút bật camera quét mã QR cá nhân của bạn chạy ngoài đời.
  * **Tab Lời mời kết bạn (Pending Requests):** Hiển thị danh sách các lời mời đang chờ phản hồi kèm nút "Chấp nhận" (Xanh) và "Từ chối" (Xám).
  * **Danh sách Bạn bè chính thức (Friends Roster):**
    * Thẻ bạn chạy: Avatar, Tên, Danh sách các CLB chung, Trạng thái tập luyện gần nhất (Ví dụ: *"Đã chạy 10.2 km sáng nay"*), Huy hiệu thành tích cá nhân.
    * Nút nhắn tin nhanh (Chuyển sang Direct Message), Nút Hủy kết bạn / Chặn.
  * **Drawer xem Hồ sơ Thể thao (Runner Profile Drawer):** Khi chạm vào một bạn chạy:
    * Thống kê tổng quan: Tổng số km trọn đời, Số giải đấu đã hoàn thành, Kỷ lục cá nhân (PR 5km, 10km, 21km).
    * Danh sách các giải đấu đang cùng tham gia với người xem.
* **Thao tác nghiệp vụ:**
  * Người dùng tìm thấy bạn chạy $\rightarrow$ Nhấn "Kết bạn" $\rightarrow$ Gọi API `POST /friends/requests` $\rightarrow$ Chuyển nút sang trạng thái `Đã gửi lời mời`.
  * Bạn chạy mở app $\rightarrow$ Nhấn "Chấp nhận" $\rightarrow$ Hai người chính thức trở thành bạn bè và bài chạy của nhau bắt đầu xuất hiện trên Tab Feed Bạn bè.

---

### Cặp 9: Chat nội bộ, AI PacerBot & Banter

#### Màn hình UI-09A: Phòng Chat Thời gian thực (Kênh CLB & Đội) — Path: `/chat`
* **Mục tiêu:** Không gian trao đổi thông tin trực tiếp, chia sẻ hình ảnh và bàn chiến thuật thi đấu thông qua giao thức WebSockets thời gian thực.
* **Bố cục & Khối hiển thị:**
  * **Thanh bên danh sách Kênh Chat (Channel List):**
    * Nhóm Kênh CLB: `#chung-clb`, `#lich-chay-offline`, `#thao-luan-giai-dau`.
    * Nhóm Kênh Đội: `#doi-chien-binh`, `#doi-tia-chop` (Chỉ thành viên trong đội mới nhìn thấy).
    * Nhóm Kênh Quản trị: `#ban-chu-nhiem` (Chỉ Admin CLB).
  * **Cửa sổ Khung chat chính (Chat Message Area):**
    * Danh sách tin nhắn phân biệt rõ: Tin nhắn của thành viên, Tin nhắn hệ thống (System Notification), Tin nhắn từ `@PacerBot`, và Tin nhắn "Cà khịa" từ Banter Bot (được bao viền vàng nhạt đặc biệt).
    * Hỗ trợ bong bóng trích dẫn bài chạy: Hiển thị thẻ bài tập thu nhỏ ngay trong khung chat khi người dùng chia sẻ link bài chạy.
    * Thanh nhập liệu: Ô gõ tin nhắn, nút đính kèm ảnh, nút chèn biểu tượng cảm xúc, nút Tag tên thành viên (`@mention`).
* **Thao tác nghiệp vụ:**
  * Thành viên gõ `@PacerBot luật trail thế nào bot?` $\rightarrow$ Bot AI phản hồi tức thì trong vòng 1 giây: *"Chào bạn, theo Rule Set giải Mùa 10, bài chạy pace chậm hơn 10:00 sẽ hợp lệ nếu đạt Gain từ 100m trở lên, mỗi 100m được thưởng thêm 1.0 km nhé!"*.

#### Màn hình UI-09B: Trung tâm Điều khiển AI PacerBot & Banter Engine — Path: `/clubs/{slug}/banter-settings`
* **Mục tiêu:** Dành riêng cho Club Admin để cấu hình hành vi của Chatbot AI và tùy chỉnh mức độ "trêu chọc / cà khịa" của hệ thống nhằm bảo đảm văn hóa vui vẻ, không xúc phạm.
* **Bố cục & Khối hiển thị:**
  * **Cấu hình Trợ lý PacerBot AI:**
    * Công tắc Bật/Tắt PacerBot trong kênh chat.
    * Tùy chọn nguồn tri thức: Tích chọn các giải đấu và tài liệu CLB mà bot được phép đọc để trả lời thành viên.
  * **Bộ điều khiển Bộ máy Trêu chọc (Banter & Roast Engine Controls):**
    * Thanh trượt 3 cấp độ hài hước:
      * `Mức 1: Tắt hoàn toàn` (Không gửi bất kỳ tin trêu chọc nào).
      * `Mức 2: Nhẹ nhàng & Động viên (Polite)` (Chỉ nhắc nhở giờ chạy thân thiện).
      * `Mức 3: Cà khịa thi đua (Savage / Competitive)` (Cho phép bot châm chọc vui vẻ về nguy cơ nộp phạt, chạy sát pace trần, hoặc đội bị tụt hạng).
    * Danh sách các Kịch bản Kích hoạt (Trigger Scenarios):
      * [x] Cảnh báo nộp phạt khi còn $< 24\text{h}$ chốt tuần.
      * [x] Châm chọc khi bài chạy có pace sát biên (Ví dụ pace 9:59).
      * [x] Thông báo đổi ngôi vị đầu bảng giữa các đội.
    * Ô xem trước (Preview): Hiển thị ngẫu nhiên các câu thoại mẫu theo cấp độ đã chọn.
* **Thao tác nghiệp vụ:**
  * Admin chọn cấp độ "Cà khịa thi đua" và lưu lại $\rightarrow$ Gọi API `PUT /clubs/{slug}/banter-settings` $\rightarrow$ Banter Engine cập nhật cấu hình và bắt đầu sinh tin nhắn tự động theo các sự kiện kích hoạt của giải đấu.

---

### Cặp 10: Quản trị CLB, Sự kiện & Kỷ luật

#### Màn hình UI-10A: Trung tâm Điều hành CLB (Tổng quan & Quản lý Thành viên) — Path: `/clubs/{slug}/manage`
* **Mục tiêu:** Bảng điều khiển trung tâm của Chủ nhiệm CLB để nắm bắt sức khỏe tổng thể của CLB, cấu hình tài khoản nhận quỹ và kiểm duyệt thành viên.
* **Bố cục & Khối hiển thị:**
  * **Thẻ KPIs Câu lạc bộ:** Tổng số thành viên chính thức, Số giải đang chạy, Tổng quỹ CLB hiện có, Tỷ lệ hoạt động tuần này.
  * **Cấu hình Tài khoản Ngân hàng nhận Quỹ (Club Payment Account):**
    * Chọn Ngân hàng (Mã BIN), Nhập Số tài khoản, Tên chủ tài khoản thụ hưởng.
    * Khung hiển thị mẫu VietQR kiểm thử để Admin quét thử nghiệm xác thực độ chính xác trước khi áp dụng vào giải.
  * **Bảng Quản trị Thành viên CLB (Members Directory & Access Control):**
    * Bảng danh sách thành viên: Avatar, Tên hiển thị, Email, Ngày gia nhập, Vai trò (`admin`, `member`), Trạng thái (`active`, `pending`, `suspended`).
    * Thao tác trên từng thành viên: Nút "Gán quyền Quản trị viên phụ tá", Nút "Đình chỉ tạm thời", Nút "Mời ra khỏi CLB".
    * Tab "Duyệt thành viên mới": Danh sách đơn xin gia nhập chờ phê duyệt.
* **Thao tác nghiệp vụ:**
  * Admin nhập số tài khoản ngân hàng và bấm "Lưu tài khoản quỹ" $\rightarrow$ Gọi API `PUT /clubs/{slug}/payment-accounts` $\rightarrow$ Hệ thống cập nhật bảng `club_payment_accounts` và áp dụng ngay vào mã VietQR động của các giải đấu.

#### Màn hình UI-10B: Quản trị Kỷ luật, Lịch Sự kiện & Kho Tri thức — Path: `/clubs/{slug}/governance`
* **Mục tiêu:** Cung cấp cho Ban chủ nhiệm bộ 3 công cụ ERP chuyên sâu: Ban hành cảnh báo kỷ luật, Tổ chức sự kiện lịch chạy Offline (RSVP/Check-in), Khởi tạo biểu quyết nội bộ và Đăng tải giáo án tri thức.
* **Bố cục & Khối hiển thị:**
  * **Phân hệ 1: Cảnh báo & Kỷ luật (Disciplinary Hub):**
    * Nút "TẠO CẢNH BÁO MỚI": Mở form chọn thành viên đích danh, phân loại (`Chỉ tiêu/Nợ quỹ`, `Nghi vấn gian lận GPS/Pace`, `Văn hóa ứng xử`), chọn mức độ chế tài (`Nhắc nhở`, `Đình chỉ thi đấu tạm thời`, `Khai trừ`). Nhập lý do và hạn chót giải trình.
    * Danh sách cảnh báo đang hiệu lực và trạng thái xác nhận từ thành viên.
  * **Phân hệ 2: Lịch sinh hoạt & Buổi chạy Offline (Club Events & RSVP):**
    * Nút "TẠO BUỔI CHẠY MỚI": Nhập tên buổi chạy (Long Run cuối tuần, Interval), ngày giờ tập trung, địa điểm ghim bản đồ, phân công Pacer dẫn tốc (Pacer 5:30, 6:00), tải lên file GPX lộ trình.
    * Bảng danh sách thành viên bấm `Tham gia (Going)` và công cụ quét mã QR Check-in điểm danh tại chỗ.
  * **Phân hệ 3: Biểu quyết nội bộ (Club Polls):**
    * Nút "TẠO CUỘC THĂM DÒ": Nhập câu hỏi biểu quyết, danh sách phương án lựa chọn kèm ảnh minh họa, hạn chót đóng biểu quyết. Hiển thị biểu đồ kết quả bình chọn theo thời gian thực.
  * **Phân hệ 4: Kho Giáo án & Tri thức (Knowledge Management):**
    * Trình soạn thảo Markdown đăng tải bài viết hướng dẫn kỹ thuật, giáo án tập luyện (Couch to 5K, Sub-2 Half Marathon) kèm tài liệu đính kèm.
* **Thao tác nghiệp vụ:**
  * Admin phát hiện thành viên có bài chạy pace 2:35 bất thường nghi đi xe máy $\rightarrow$ Nhấn "Tạo cảnh báo" $\rightarrow$ Chọn loại `Nghi vấn gian lận` $\rightarrow$ Hệ thống tự động treo tính điểm giải đấu của thành viên đó và gửi thông báo đỏ yêu cầu gửi dữ liệu nhịp tim giải trình trong 24 giờ.

---

# 5. RULE ENGINE 2.1: ĐỘNG CƠ THẨM ĐỊNH & TÍNH ĐIỂM ĐA TIÊU THỨC

### 5.1. Cấu trúc tham số Rule Set JSONB phiên bản 2.1

Mỗi giải đấu gắn liền với một bản ghi `race_rules` lưu cấu hình JSONB bất biến theo số hiệu phiên bản (`version`):

```json
{
  "version": 4,
  "race_scope": "internal",
  "max_participants": 200,
  "source_filter": {
    "allowed_types": ["Run", "TrailRun"],
    "allow_manual": false,
    "allow_trainer": false
  },
  "validation": {
    "min_distance_km": 3.0,
    "pace_min": 4.00,
    "pace_max": 10.00,
    "pace_floor_system": 2.75,
    "max_activities_per_day": 2,
    "duplicate_overlap_threshold": 0.50
  },
  "trail": {
    "enabled": true,
    "trail_gain_min_m": 100,
    "gain_unit_m": 100,
    "distance_unit_km": 1.0,
    "bonus_mode": "trail_only",
    "max_bonus_km_per_activity": 5.0
  },
  "cycle": {
    "type": "weekly",
    "target_km": 20.0,
    "penalty_per_miss_vnd": 50000,
    "grace_hours": 6,
    "partial_week_policy": "prorate",
    "warning_hours": 48
  },
  "scoring": {
    "strategy": "sum_team_v1",
    "score_weights": {
      "distance": 50,
      "diligent": 50
    },
    "cap_days_team": 140,
    "ranking_policy": "top1_then_tied_second",
    "tie_break": ["total_km", "team_days", "reached_at"]
  },
  "payout_tiers": [
    { "rank": 1, "fee_vnd": 100000, "label": "Đội Vô Địch" },
    { "rank": "other", "fee_vnd": 200000, "label": "Đồng Hạng 2" }
  ],
  "rewards": {
    "top_individual_reward": "Áo Finisher SARC Dệt Kim Đặc Biệt",
    "reward_image_url": "https://cdn.openrace.app/awards/sarc-shirt.png"
  },
  "timezone": "Asia/Ho_Chi_Minh",
  "finance_visibility": "all_members"
}
```

### 5.2. Pipeline thẩm định 6 bước & Sàn Pace kỹ thuật (2:45 min/km)

Mọi bài tập thu thập từ Strava được thực thi qua hàm thuần túy `evaluateActivity(activity, rules, dayContext)` không phát sinh I/O:

```
[BÀI CHẠY STRAVA]
       │
       ▼
[BƯỚC 0: KIỂM TRA NGUỒN] ─── Không hợp lệ ───► BỊ LOẠI (MANUAL_ENTRY, TYPE_NOT_ALLOWED, ACTIVITY_DELETED)
       │ (Kiểu Run/TrailRun, GPS thực, không nhập tay)
       ▼
[BƯỚC 1: KHUNG THỜI GIAN] ── Ngoài giải ──────► BỊ LOẠI (OUT_OF_RACE_WINDOW)
       │ (start_at nằm trong khoảng thời gian diễn ra giải)
       ▼
[BƯỚC 2: CỰ LY TỐI THIỂU] ── < min_distance ──► BỊ LOẠI (BELOW_MIN_DISTANCE)
       │ (Cự ly thô >= min_distance_km, mặc định 3.0 km)
       ▼
[BƯỚC 3: DẢI PACE & LEO DỐC TRAIL]
       ├─ Pace < 2:45 min/km (Sàn hệ thống) ─► TREO XÁC MINH (PACE_IMPLAUSIBLE)
       ├─ Pace < pace_min ───────────────────► BỊ LOẠI (PACE_TOO_FAST)
       ├─ pace_min <= Pace <= pace_max ──────► HỢP LỆ (VALID)
       ├─ Pace > pace_max VÀ Gain >= min ────► HỢP LỆ CỘNG BONUS (VALID_TRAIL)
       └─ Pace > pace_max VÀ Gain < min ─────► BỊ LOẠI (PACE_TOO_SLOW_NO_GAIN)
       │
       ▼
[BƯỚC 4: CHỐNG TRÙNG LẶP] ── Chồng lấn > 50% ─► LOẠI BÀI KÉM HƠN (DUPLICATE_OVERLAP)
       │ (So khớp khoảng thời gian hoạt động; giữ bài có GPS và cự ly dài hơn)
       ▼
[BƯỚC 5: TRẦN BÀI HỢP LỆ/NGÀY] ──────────────► GIỮ N BÀI ĐẦU TIÊN THEO GIỜ CHẠY
                                               (Bài vượt trần: DAILY_LIMIT_EXCEEDED)
```

* **Sàn Pace kỹ thuật chống gian lận cơ giới ($2:45\text{ min/km}$):** Kỷ lục thế giới Marathon nam tương đương pace xấp xỉ $2:51\text{ min/km}$. Mọi bài chạy có pace trung bình nhanh hơn $2:45\text{ min/km}$ bị bộ thẩm định tự động treo điểm với mã `PACE_IMPLAUSIBLE`. Vận động viên bắt buộc phải cung cấp dữ liệu nhịp tim cao tương ứng, cadence $\ge 170\text{ spm}$ và ảnh chụp thiết bị để Admin xem xét duyệt tay.

### 5.3. Công thức tính thưởng Trail leo dốc & Giới hạn trần thưởng

Nhằm khuyến khích chạy địa hình dốc nhưng ngăn chặn trục lợi sai số độ cao:

$$\text{Bonus km} = \min\left(\left\lfloor \frac{\text{elevation\_gain\_m}}{\text{gain\_unit\_m}} \right\rfloor \times \text{distance\_unit\_km}, \; \text{max\_bonus\_km\_per\_activity}\right)$$

* Cự ly chính thức ghi nhận vào giải đấu:
  $$\text{Final Distance} = \text{Raw Distance} + \text{Bonus km}$$
* *Ví dụ:* Bài chạy $6.0\text{ km}$, pace $12:10\text{ min/km}$, Gain $260\text{ m}$.
  * Thỏa mãn điều kiện Trail vì $\text{Gain} = 260\text{ m} \ge 100\text{ m}$.
  * Thưởng được cộng: $\lfloor 260 / 100 \rfloor \times 1.0\text{ km} = +2.0\text{ km}$.
  * Thành tích ghi nhận: $6.0 + 2.0 = 8.0\text{ km}$.

### 5.4. Đa chiến lược chấm điểm đồng đội

Hệ thống cung cấp sẵn 2 thuật toán chấm điểm trong `scoring.strategy`:

1. **Chiến lược Tổng điểm Đội (`sum_team_v1` - Thể lệ truyền thống):**
   * Điểm Cự ly ($S_{\text{dist}}$):
     $$S_{\text{dist}} = 10 \times \frac{\text{Tổng km hợp lệ của đội } t}{\max_{k}(\text{Tổng km hợp lệ của đội } k)} \quad (\text{Bằng 0 nếu mẫu số } = 0)$$
   * Điểm Chuyên cần ($S_{\text{diligence}}$):
     $$S_{\text{diligence}} = 10 \times \frac{\min(\text{Tổng người-ngày hợp lệ của đội } t, \; \text{cap\_days\_team})}{\text{cap\_days\_team}} \quad (\text{Mặc định cap } = 140\text{ ngày})$$
   * Tổng điểm toàn diện:
     $$S_{\text{total}} = \text{round}\left(S_{\text{dist}} \times \frac{W_{\text{dist}}}{100} \times 2 + S_{\text{diligence}} \times \frac{W_{\text{diligent}}}{100} \times 2, \; 1\right)$$
2. **Chiến lược Bình quân Đầu người (`avg_per_member_v1` - Dành cho giải mở rộng):**
   * Áp dụng khi quân số các đội chênh lệch nhau; lấy cự ly và số ngày chia cho sĩ số thành viên thực tế của đội ($m_t$) trước khi tính điểm tỷ lệ trên thang 10.

### 5.5. Chu kỳ tuần, ân hạn (Grace Hours), tính tỷ lệ (Prorate) & Trạng thái nợ

* **Chu kỳ tuần:** Tuần ISO Thứ Hai $00:00:00$ đến Chủ Nhật $23:59:59$ theo múi giờ giải.
* **Thời gian ân hạn (`grace_hours`):** Chốt tuần lùi lại 6 giờ (06:00 sáng Thứ Hai) để chờ Webhook trễ.
* **Quy tắc Prorate:** Vận động viên gia nhập vào ngày thứ $d$ trong tuần (ví dụ Thứ Năm $\rightarrow$ còn 4/7 ngày):
  $$T_i = \text{round\_up}\left(20.0 \times \frac{4}{7}, \; 1\right) = 11.5\text{ km}$$
* **Trạng thái nợ:** `projected` (Dự kiến, cảnh báo trước 48h) $\rightarrow$ `provisional` (Tạm tính, trong 6h ân hạn) $\rightarrow$ `final` (Chính thức ghi sổ cái sau ân hạn) $\rightarrow$ `waived` (Đã được Admin miễn trừ).

---

# 6. THIẾT KẾ CƠ SỞ DỮ LIỆU & RLS (POSTGRESQL 16)

### 6.1. Sơ đồ thực thể quan hệ mở rộng (ERD V2.1)

```
users (Global) 1──N auth_identities
users 1──1 strava_connections
users 1──N activities (Global, Partitioned by month)
users N──M clubs (club_members)
users N──M users (friendships - Social Graph)

clubs 1──N races
clubs 1──N club_payment_accounts
clubs 1──N club_chat_channels 1──N club_chat_messages
clubs 1──N club_events 1──N club_event_rsvps
clubs 1──N club_polls 1──N club_poll_options 1──N club_poll_votes
clubs 1──N club_warnings
clubs 1──N club_articles

races 1──N race_rules (Versioned JSONB)
races 1──N race_cycles
races 1──N teams 1──N race_participants
races 1──N race_whitelists
races 1──N race_activity_logs (Evaluated per race)
races 1──N penalties
races 1──N ledger_entries 1──1 payment_records
races 1──N appeals
```

### 6.2. Danh mục chi tiết các bảng dữ liệu

```sql
-- 1. BẢNG NGƯỜI DÙNG & MẠNG XÃ HỘI
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    display_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    locale VARCHAR(10) DEFAULT 'vi',
    timezone VARCHAR(50) DEFAULT 'Asia/Ho_Chi_Minh',
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    friend_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL, -- 'pending', 'accepted', 'blocked'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, friend_id)
);

-- 2. KẾT NỐI STRAVA & NHẬT KÝ ĐỒNG BỘ
CREATE TABLE strava_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    strava_athlete_id BIGINT UNIQUE NOT NULL,
    scopes VARCHAR(100) NOT NULL,
    access_token_enc TEXT NOT NULL,
    refresh_token_enc TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    last_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE strava_sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    strava_activity_id BIGINT,
    event_type VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL, -- 'processed', 'ignored', 'rate_limited', 'failed'
    details TEXT,
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CÂU LẠC BỘ & TÀI KHOẢN QUỸ
CREATE TABLE clubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    logo_url TEXT,
    cover_url TEXT,
    description TEXT,
    status VARCHAR(20) DEFAULT 'active',
    banter_level VARCHAR(20) DEFAULT 'competitive', -- 'off', 'polite', 'competitive'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE club_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member', -- 'admin', 'member'
    status VARCHAR(20) DEFAULT 'active', -- 'pending', 'active', 'suspended', 'left'
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(club_id, user_id)
);

CREATE TABLE club_payment_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    bank_bin VARCHAR(20) NOT NULL,
    account_no VARCHAR(50) NOT NULL,
    account_name VARCHAR(150) NOT NULL,
    is_default BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. GIẢI ĐẤU, THỂ LỆ & WHITELIST
CREATE TABLE races (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(150) NOT NULL,
    race_scope VARCHAR(30) DEFAULT 'internal', -- 'internal', 'community', 'designated_whitelist'
    max_participants INT DEFAULT 0, -- 0 = không giới hạn
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    timezone VARCHAR(50) DEFAULT 'Asia/Ho_Chi_Minh',
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'open', 'running', 'finalizing', 'closed'
    team_policy VARCHAR(30) DEFAULT 'admin_assign',
    active_rule_version INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(club_id, slug)
);

CREATE TABLE race_whitelists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    race_id UUID REFERENCES races(id) ON DELETE CASCADE,
    identifier VARCHAR(255) NOT NULL, -- Email hoặc mã định danh
    full_name VARCHAR(150),
    is_registered BOOLEAN DEFAULT FALSE,
    registered_user_id UUID REFERENCES users(id),
    UNIQUE(race_id, identifier)
);

CREATE TABLE race_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    race_id UUID REFERENCES races(id) ON DELETE CASCADE,
    version INT NOT NULL,
    rules JSONB NOT NULL,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(race_id, version)
);

-- 5. ĐỘI THI ĐẤU & THÀNH VIÊN
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    race_id UUID REFERENCES races(id) ON DELETE CASCADE,
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    leader_user_id UUID REFERENCES users(id),
    capacity INT DEFAULT 15,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(race_id, name)
);

CREATE TABLE race_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    race_id UUID REFERENCES races(id) ON DELETE CASCADE,
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    role VARCHAR(20) DEFAULT 'runner', -- 'runner', 'team_leader'
    status VARCHAR(20) DEFAULT 'active',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(race_id, user_id)
);

-- 6. HOẠT ĐỘNG CHẠY BỘ & THẨM ĐỊNH
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    strava_activity_id BIGINT UNIQUE NOT NULL,
    sport_type VARCHAR(50) NOT NULL,
    start_at TIMESTAMPTZ NOT NULL,
    timezone_offset INT NOT NULL,
    distance_m NUMERIC(10, 2) NOT NULL,
    moving_time_s INT NOT NULL,
    elapsed_time_s INT NOT NULL,
    elevation_gain_m NUMERIC(8, 2) DEFAULT 0,
    is_manual BOOLEAN DEFAULT FALSE,
    is_trainer BOOLEAN DEFAULT FALSE,
    privacy VARCHAR(30) DEFAULT 'everyone',
    raw_payload JSONB,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (start_at);

CREATE TABLE race_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    race_id UUID REFERENCES races(id) ON DELETE CASCADE,
    activity_id UUID NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    rule_version INT NOT NULL,
    is_valid BOOLEAN NOT NULL,
    reject_code VARCHAR(50),
    reject_message TEXT,
    bonus_distance_m NUMERIC(10, 2) DEFAULT 0,
    final_distance_m NUMERIC(10, 2) NOT NULL,
    local_date DATE NOT NULL,
    cycle_idx INT NOT NULL,
    evaluated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(race_id, activity_id)
);

-- 7. TÀI CHÍNH, SỔ CÁI & ĐỐI SOÁT VIETQR
CREATE TABLE ledger_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    race_id UUID REFERENCES races(id) ON DELETE CASCADE,
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL, -- 'rank_fee', 'penalty', 'payment', 'adjustment'
    amount_vnd BIGINT NOT NULL, -- Dương: Phải nộp; Âm: Đã nộp
    ref_type VARCHAR(50),
    ref_id UUID,
    memo TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payment_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    race_id UUID REFERENCES races(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    transfer_ref VARCHAR(25) UNIQUE NOT NULL,
    amount_vnd BIGINT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'confirmed', 'rejected'
    receipt_image_url TEXT,
    confirmed_by UUID REFERENCES users(id),
    confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TƯƠNG TÁC XÃ HỘI, CHAT & ĐIỀU HÀNH CLB
CREATE TABLE activity_kudos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(activity_id, user_id)
);

CREATE TABLE activity_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE club_chat_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    race_id UUID REFERENCES races(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'general', 'team', 'admin_only'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE club_chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID REFERENCES club_chat_channels(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
    sender_type VARCHAR(20) DEFAULT 'user', -- 'user', 'ai_bot', 'system_roast'
    content TEXT NOT NULL,
    metadata JSON