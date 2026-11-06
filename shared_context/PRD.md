# PRODUCT REQUIREMENTS DOCUMENT (PRD V2.1)
## OpenRace SaaS Platform — Nền tảng Quản lý Giải chạy Đa Câu lạc bộ, Mạng xã hội Thể thao & Điều hành CLB Thông minh

**Mã tài liệu:** OR-PRD-2026-V2.1  
**Phiên bản:** 2.1.0  
**Ngày ban hành:** 05/11/2026  
**Trạng thái:** Đã phê duyệt (Approved for Implementation)  
**Tiêu chuẩn kỹ thuật:**
- **Frontend:** Next.js 15 (App Router, TypeScript, Tailwind CSS v3.4+, Lucide Icons, Shadcn/ui)
- **Backend:** Node.js với NestJS Framework (TypeScript, Clean Architecture)
- **Cơ sở dữ liệu:** PostgreSQL 16 trên Supabase (Row-Level Security RLS)
- **Caching & Hàng đợi:** Redis 7 & BullMQ
- **Kiểm thử tự động:** Jest (Unit & Integration tests, coverage >= 80%)

---

## 1. TỔNG QUAN SẢN PHẨM & TẦM NHÌN V2.1

OpenRace SaaS Platform V2.1 là hệ thống quản trị thi đấu thể thao trực tuyến kết hợp mạng xã hội thể thao và bộ công cụ ERP toàn diện cho các Câu lạc bộ (CLB) chạy bộ phong trào và doanh nghiệp.

### Các trụ cột đột phá trong V2.1:
1. **Kiến trúc Cặp 2 màn hình (Master-Detail / List-Action Pattern):** Quy chuẩn hóa 10 phân hệ thành 10 Cặp màn hình (20 màn hình chuyên biệt), giải quyết triệt để tình trạng nhồi nhét giao diện di động.
2. **6 Bộ công cụ quản lý chuyên biệt (Dedicated Management Portals):** Cá nhân (`/me`), Đội thi đấu (`/r/{slug}/teams/{id}/manage`), Giải đấu (`/races/{slug}/admin`), Câu lạc bộ (`/clubs/{slug}/manage`), Cộng đồng (`/community`), và Toàn sàn Super Admin (`/admin`).
3. **Động cơ thẩm định Rule Engine 2.1:** Pipeline 6 bước, Sàn Pace kỹ thuật khóa cứng $2:45\text{ min/km}$, thưởng Trail dốc có trần `max_bonus_km_per_activity`, ân hạn 6 giờ, tính tỷ lệ `prorate`, và sổ nợ VietQR động ($\le 25$ ký tự).
4. **Mạng xã hội thể thao & Tương tác:** Đồ thị bạn bè 2 chiều, Kudos, Bình luận, Kênh chat WebSockets, Trợ lý ảo AI PacerBot và Banter Engine trêu chọc thi đua 3 cấp độ.
5. **Điều hành CLB ERP:** Cài đặt tài khoản VietQR BIN CLB, Quản trị thành viên, Cảnh báo kỷ luật, Buổi chạy Offline RSVP/Check-in, Biểu quyết nội bộ (Polls), Kho giáo án tri thức.

---

## 2. MA TRẬN PHÂN QUYỀN (CONTEXTUAL RBAC)

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

---

## 3. CẤU TRÚC 10 CẶP MÀN HÌNH CHỨC NĂNG (20 MÀN HÌNH LÕI)

```
[PHÂN HỆ NGƯỜI DÙNG & RUNNER]
├── [Cặp 1] Cá nhân & Đồng bộ Strava
│   ├── UI-01A: Dashboard Runner (Personal Hub) .......................... Path: /
│   └── UI-01B: Quản lý Kết nối & Nhật ký Strava Sync ................... Path: /me/strava-sync
├── [Cặp 2] Giải đấu & Đấu trường
│   ├── UI-02A: Khám phá & Danh sách Giải đấu ............................ Path: /races
│   └── UI-02B: Đấu trường Giải & Bảng xếp hạng Thời gian thực ........... Path: /r/{race_slug}
├── [Cặp 3] Nhật ký Hoạt động & Thẩm định
│   ├── UI-03A: Bảng tổng hợp Bài chạy Cá nhân ........................... Path: /activities
│   └── UI-03B: Chi tiết Thẩm định & Gửi Khiếu nại ....................... Path: /activities/{id}
├── [Cặp 4] Câu lạc bộ & Tiếp nhận lời mời
│   ├── UI-04A: Trang chủ Câu lạc bộ (Club Portal) ....................... Path: /c/{club_slug}
│   └── UI-04B: Cổng Tiếp nhận Lời mời & Onboarding Gia nhập ............. Path: /join/{invite_token}
├── [Cặp 5] Tài chính & Minh bạch Quỹ
│   ├── UI-05A: Sổ nợ & VietQR Nộp tiền Cá nhân .......................... Path: /r/{race_slug}/my-finance
│   └── UI-05B: Bảng Đối soát Quỹ Giải & Xác nhận Nộp tiền (Admin) ....... Path: /r/{race_slug}/finance/reconcile
├── [Cặp 7] Đội thi đấu (Không gian Đội)
│   ├── UI-07A: Danh bạ & Bảng phong độ Đội thi đấu ...................... Path: /r/{race_slug}/teams
│   └── UI-07B: Không gian Quản trị Đội của Đội trưởng .................. Path: /r/{race_slug}/teams/{id}/manage
├── [Cặp 8] Mạng xã hội Chạy bộ & Bạn bè
│   ├── UI-08A: Bảng tin Hoạt động Cộng đồng (Social Feed) ............... Path: /community/feed
│   └── UI-08B: Mạng lưới Bạn bè & Hồ sơ Vận động viên ................... Path: /community/friends
├── [Cặp 9] Tán gẫu, PacerBot AI & Banter
│   ├── UI-09A: Phòng Chat Thời gian thực (Kênh CLB & Đội) ............... Path: /chat
│   └── UI-09B: Trung tâm Điều khiển AI PacerBot & Banter Engine ........ Path: /clubs/{slug}/banter-settings

[PHÂN HỆ BAN QUẢN TRỊ CLB & SUPER ADMIN]
├── [Cặp 6] Điều hành Thể lệ Giải đấu
│   ├── UI-06A: Danh sách Quản trị Giải đấu CLB .......................... Path: /clubs/{slug}/races-manage
│   └── UI-06B: Wizard 7 bước Thiết lập Thể lệ & Dry-run ................. Path: /clubs/{slug}/races/wizard
└── [Cặp 10] Điều hành Toàn diện Câu lạc bộ (Club ERP)
    ├── UI-10A: Trung tâm Điều hành CLB (Tổng quan & Quản lý Thành viên) . Path: /clubs/{slug}/manage
    └── UI-10B: Quản trị Kỷ luật, Lịch Sự kiện & Kho Tri thức ........... Path: /clubs/{slug}/governance
```

---

## 4. QUY TẮC RULE ENGINE 2.1 & CÔNG THỨC TOÁN HỌC

### 4.1. Pipeline thẩm định 6 bước:
1. **Bước 0 (Kiểm tra nguồn):** Loại bỏ bài chạy nhập tay (`manual = true`), kiểu hoạt động không phải `Run` hoặc `TrailRun`.
2. **Bước 1 (Khung giờ giải):** `start_at` phải nằm giữa thời điểm bắt đầu và kết thúc của giải đấu.
3. **Bước 2 (Cự ly tối thiểu):** Cự ly thô $\ge 3.0\text{ km}$.
4. **Bước 3 (Dải Pace & Thưởng dốc Trail):**
   - **Sàn Pace kỹ thuật khóa cứng:** Pace $< 2:45\text{ min/km} \rightarrow$ Treo xác minh `PACE_IMPLAUSIBLE`.
   - Pace $< \text{pace\_min} \rightarrow$ Bị loại `PACE_TOO_FAST`.
   - $\text{pace\_min} \le \text{Pace} \le \text{pace\_max} \rightarrow$ Hợp lệ `VALID`.
   - Pace $> \text{pace\_max}$ VÀ $\text{Gain} \ge 100\text{ m} \rightarrow$ Hợp lệ Trail `VALID_TRAIL`.
   - Pace $> \text{pace\_max}$ VÀ $\text{Gain} < 100\text{ m} \rightarrow$ Bị loại `PACE_TOO_SLOW_NO_GAIN`.
5. **Bước 4 (Chống trùng lặp):** Trùng khoảng thời gian $> 50\% \rightarrow$ Giữ bài có GPS và cự ly dài hơn, loại bài còn lại `DUPLICATE_OVERLAP`.
6. **Bước 5 (Trần bài/ngày):** Giữ tối đa 2 bài hợp lệ đầu tiên theo mốc thời gian bắt đầu trong ngày, bài thứ 3 trở đi gắn nhãn `DAILY_LIMIT_EXCEEDED`.

### 4.2. Công thức thưởng Trail leo dốc:
$$\text{Bonus km} = \min\left(\left\lfloor \frac{\text{elevation\_gain\_m}}{100} \right\rfloor \times 1.0\text{ km}, \; \text{max\_bonus\_km\_per\_activity}\right)$$
$$\text{Final Distance} = \text{Raw Distance} + \text{Bonus km}$$

### 4.3. Chấm điểm đồng đội & Xếp hạng 50/50:
- Thang điểm tổng hợp 20 điểm:
  $$\text{Score} = \text{Score}_{\text{Distance}} (50\%) + \text{Score}_{\text{Diligent}} (50\%)$$
- Trong đó Ngày chuyên cần toàn đội được tính trần tối đa 140 ngày.
- Đội Hạng 1 nhận mức quỹ thưởng ưu đãi $100.000đ/\text{người}$. Tất cả các đội còn lại được tính Đồng Hạng 2 với mức quỹ $200.000đ/\text{người}$.

---

## 5. DANH MỤC TIÊU CHÍ NGHIỆM THU (ACCEPTANCE CRITERIA AC-001 -> AC-044)

Tất cả các tiêu chí nghiệm thu được chuẩn hóa và lưu trữ tại `shared_context/PRD.json`:
- **AC-001 đến AC-007:** Pipeline thẩm định Rule Engine 2.1.
- **AC-008:** Chu kỳ tuần, ân hạn 6 giờ, tính tỷ lệ Prorate và cảnh báo phạt $< 48$h.
- **AC-009:** Bảng xếp hạng Đội 50/50 và xếp hạng Đội Hạng 1 vs Đồng Hạng 2.
- **AC-010:** Sổ nợ, bậc quỹ và sinh mã VietQR động $\le 25$ ký tự.
- **AC-011:** Webhook Strava Ingestion, Token Bucket Governor và Raw sync logs.
- **AC-012 đến AC-017:** Thẩm định khiếu nại, Đối soát quỹ, Cấp miễn trừ phạt, Quản lý vòng đời giải đấu.
- **AC-020 đến AC-034:** Các tính năng giao diện, Carousel, Đấu trường, Bảng xếp hạng thời gian thực SSE, Phân tách màn hình độc lập Soft-clay, In-App browser detour.
- **AC-035 đến AC-042:** V2 Community & Advanced Operations (Strava self-service, 3 Phạm vi giải, Whitelist, Quyền năng Đội trưởng, Đồ thị bạn bè, Kudos/Bình luận, Weighted Scoring).
- **AC-043:** WebSockets Real-time Chat, AI PacerBot và 3-Tier Banter Roast Engine.
- **AC-044:** Club Governance ERP (VietQR BIN, Quản trị thành viên, Cảnh báo kỷ luật, Buổi chạy Offline RSVP/Check-in, Biểu quyết nội bộ, Kho giáo án tri thức).
- **AC-045:** Mantis Material UI Theme Layout & Dual-Theme Switcher (Giao diện Doanh nghiệp chuẩn Material-UI / Mantis, Top bar Ctrl+K, Categorized Drawer Sidebar, Blue Hero Welcome, 4 KPI Sparkline Mini-Charts, Spline Area Chart, localStorage persistence).

---

## 6. GIAO DIỆN MANTIS MATERIAL UI VÀ BỘ CHUYỂN ĐỔI THEME (THEME SWITCHER)

### 6.1. Mục tiêu & Bối cảnh:
Cung cấp tùy chọn giao diện thứ hai mang phong cách Enterprise Corporate Dashboard chuẩn Material-UI / Mantis Admin (Ant Design & MUI v5 Hybrid) song song với giao diện Thể Thao Cam (Sporty Orange) truyền thống. Người dùng (VĐV, Ban cán sự CLB, Super Admin) có toàn quyền lựa chọn giao diện phù hợp với gu thẩm mỹ và môi trường làm việc:
- **Theme 1 (Mặc định - OpenRace Classic Sport):** Tông màu cam `#FF5B26` rực rỡ, bo góc `rounded-3xl` đậm chất thể thao, tối ưu cho tương tác thi đua và gamification.
- **Theme 2 (Mantis Material UI):** Tông màu xanh `#1890ff` dịu mắt, thẻ nổi bo viền mảnh `rounded-xl`, thanh tìm kiếm phím tắt `Ctrl + K`, Sidebar phân cấp danh mục kiểu Enterprise SaaS, 4 thẻ KPI tích hợp đồ thị vi mô (Sparklines), và biểu đồ xu hướng Spline Area.

### 6.2. User Story:
- **US-THM-01:** Là một thành viên câu lạc bộ hoặc nhà quản lý giải đấu, tôi muốn chuyển đổi giữa giao diện Sporty Orange và giao diện Mantis Material UI bằng 1 cú click chuột, để giao diện tự động lưu cấu hình và tối ưu hóa việc theo dõi số liệu mà không làm gián đoạn các luồng dữ liệu thời gian thực.

### 6.3. Tiêu chí nghiệm thu Gherkin (AC-045):
- **Given:** Người dùng đang ở bất kỳ trang nào trên nền tảng OpenRace SaaS Platform.
- **When:** Người dùng click vào công tắc chuyển giao diện `[ ⚡ Thể Thao Cam ]` / `[ 💎 Mantis Material UI ]` trên Header hoặc mở từ phím tắt/menu cài đặt.
- **Then:**
  1. Header tự động chuyển đổi giữa Mantis Top Bar (thanh tìm kiếm `Ctrl + K`, icon chuông badge, profile chip) và OpenRace Header.
  2. Sidebar tự động chuyển đổi sang Mantis Navigation Drawer với cấu trúc danh mục chuẩn (Dashboard, Widgets, Applications, Forms) và chỉ báo active viền xanh (`#1890ff`).
  3. Màn hình Tổng quan nạp layout Mantis Analytics Dashboard: Welcome Banner xanh dương gradient kèm đồ họa 3D, 4 thẻ chỉ số KPI tích hợp biểu đồ Sparklines (Bar xanh, Area đỏ, Bar vàng, Spline xanh), biểu đồ vùng diện tích Spline Area Chart đa trục, bảng xếp hạng tỷ lệ phần trăm theo phong cách Mantis.
  4. Lựa chọn giao diện được lưu cố định vào `localStorage.getItem('openrace_theme')`.
  5. Người dùng có thể quay lại giao diện Sporty Orange bất kỳ lúc nào với đầy đủ dữ liệu nguyên vẹn.
