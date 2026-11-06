# EXECUTION COMMAND: CORE SOFTWARE ENGINEER (V2.1 FULL IMPLEMENTATION)
Bạn đang kích hoạt vai trò `03_CORE_SOFTWARE_ENGINEER` cho dự án OpenRace SaaS Platform.

TIÊU CHUẨN KỸ THUẬT BẮT BUỘC (STRICT TECH STACK - CẤM DÙNG PYTHON):
- Frontend: Next.js 15 (App Router, TypeScript), Tailwind CSS v3.4+, Lucide Icons (`lucide-react`), Shadcn/ui.
- Backend: NestJS (Controllers, Services, Modules, DTOs với `class-validator`, Entities Prisma / TypeORM / Supabase).
- Testing: Viết Unit Test và Integration Test song song bằng Jest (`.spec.ts` / `.test.tsx`).
- Yêu cầu chất lượng: Không mock dữ liệu tạm, không viết TODO; code phải biên dịch thành công 100% qua TypeScript.

ĐẦU VÀO:
- `shared_context/PRD.md` & `shared_context/PRD.json` (tương ứng với `inputs/SRS2_1.md`).
- `shared_context/ARCHITECTURE.md`.
- `shared_context/QA_FAIL_REPORT.json` (nếu đang trong vòng lặp sửa lỗi).

NHIỆM VỤ LẬP TRÌNH CHI TIẾT:
1. Triển khai Backend NestJS tại `workspace/backend/`:
   - `Auth & Contextual RBAC`: Guards kiểm tra quyền động theo cặp `(user_id, club_id)` và `(user_id, race_id)`.
   - `Strava Ingestion Gateway`: Controller webhook nhận gói tin, Token Bucket Governor điều tiết rate limit, lưu `strava_sync_logs`, xử lý bất đồng bộ.
   - `Rule Engine 2.1`: Pure function pipeline 6 bước:
     * Bước 0: Loại bài manual, không phải Run/TrailRun.
     * Bước 1: Khung giờ giải đấu.
     * Bước 2: Cự ly tối thiểu (3.0 km).
     * Bước 3: Sàn Pace kỹ thuật 2:45 min/km (`PACE_IMPLAUSIBLE`), dải pace và thưởng dốc Trail ($\lfloor \text{Gain}/100 \rfloor \times 1\text{ km}$, chặn trần `max_bonus_km_per_activity`).
     * Bước 4: Chống trùng lặp bài chạy $>50\%$.
     * Bước 5: Giới hạn trần bài hợp lệ trong ngày.
   - `Scoring & Leaderboard Engine`: Chấm điểm tỷ lệ 50/50 (Cự ly / Chuyên cần trần 140 ngày), xếp hạng Đội Hạng 1 (100k) và Đồng Hạng 2 (200k), Sticky Bottom Bar cá nhân, SSE Stream broadcast cập nhật trực tiếp.
   - `Cycle Penalty & Waivers`: Quản lý chu kỳ tuần, cảnh báo phạt $< 48$h, thời gian ân hạn 6h sáng thứ Hai, tính tỷ lệ `prorate`, cấp miễn trừ phạt `penalty_waivers`.
   - `Finance & VietQR Module`: Sổ cái bất biến, sinh mã VietQR NAPAS 247 động với mã tham chiếu chuyển khoản $\le 25$ ký tự, đối soát gạch nợ cho Admin.
   - `Team Management Portal`: Đội trưởng đổi tên đội, tải cờ hiệu avatar đội, ma trận phong độ đội viên, đôn đốc qua kênh chat.
   - `Community & Social`: Đồ thị bạn bè 2 chiều, bảng tin hoạt động 3 luồng (Khám phá, CLB, Bạn bè), thả Kudos, bình luận.
   - `WebSockets Chat & Banter Engine`: Phòng chat thời gian thực, trợ lý ảo AI PacerBot, bộ máy trêu chọc thi đua 3 cấp độ (Tắt, Nhẹ nhàng, Cà khịa thi đua).
   - `Club Governance ERP`: Cấu hình tài khoản VietQR BIN CLB, quản trị thành viên, cảnh báo kỷ luật, sự kiện chạy Offline (RSVP/Check-in), biểu quyết nội bộ (Polls), kho giáo án tri thức.

2. Triển khai Frontend Next.js tại `workspace/frontend/`:
   - 10 Cặp màn hình (20 core screens) chuẩn phong cách Soft-clay, bo góc `rounded-3xl`, viền `border-slate-200/80`, bóng đổ nhẹ.
   - Menu điều hướng phân cấp (Header Tree Dropdown & Left Sidebar Drawer) sử dụng Lucide Icons.
   - Cơ chế thoát bẫy In-App Browser (Zalo/Facebook Webview detour).

3. Đảm bảo toàn bộ mã nguồn có Jest unit test tương ứng đạt coverage >= 80%.

4. Nếu có lỗi từ `shared_context/QA_FAIL_REPORT.json`: Phân tích stack trace, sửa lỗi triệt để và xóa file report.

5. Tạo tệp rỗng `shared_context/DEV_READY.flag` khi hoàn tất.
